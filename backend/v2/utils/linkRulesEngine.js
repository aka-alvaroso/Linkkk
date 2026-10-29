/**
 * Link Rules Evaluation Engine
 *
 * This module evaluates link rules and determines the appropriate action
 * based on conditions like country, device, VPN detection, etc.
 */

// ============================================
// DEVICE DETECTION
// ============================================

/**
 * Detects device type from user agent string
 * @param {string} userAgent - The user agent string
 * @returns {string} - "mobile" | "tablet" | "desktop"
 */
const detectDevice = (userAgent) => {
  if (!userAgent) return "desktop";

  const ua = userAgent.toLowerCase();

  // Tablet detection (must come before mobile)
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
    return "tablet";
  }

  // Mobile detection
  if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      userAgent
    )
  ) {
    return "mobile";
  }

  // Default to desktop
  return "desktop";
};

const { distinctLinksWithin, MAX_WINDOW_SECONDS } = require("./burstTracker");

// ============================================
// CONDITION EVALUATORS
// ============================================

/**
 * Validates condition structure at runtime
 * @param {Object} condition - The condition to validate
 * @returns {boolean} - True if condition is valid
 */
const validateConditionStructure = (condition) => {
  // Basic structure validation
  if (!condition || typeof condition !== "object") {
    return false;
  }

  const { field, operator, value } = condition;

  // All conditions must have these fields
  if (!field || !operator || value === undefined) {
    return false;
  }

  // Validate field types
  const validFields = [
    "country",
    "device",
    "ip",
    "is_vpn",
    "is_bot",
    "is_datacenter",
    "burst",
    "date",
    "access_count",
    "query_param",
  ];
  if (!validFields.includes(field)) {
    return false;
  }

  // Validate operators per field type
  const validOperators = {
    country: ["in", "not_in"],
    device: ["equals", "not_equals"],
    ip: ["equals", "not_equals", "in", "not_in"],
    is_vpn: ["equals"],
    is_bot: ["equals"],
    is_datacenter: ["equals"],
    burst: ["equals"],
    date: ["before", "after", "equals"],
    access_count: ["equals", "greater_than", "less_than"],
    query_param: ["equals", "not_equals", "in", "not_in", "contains", "not_contains"],
  };

  if (!validOperators[field] || !validOperators[field].includes(operator)) {
    return false;
  }

  // Validate value types per field
  if (field === "country" && !Array.isArray(value)) {
    return false;
  }

  if (field === "ip") {
    const isList = operator === "in" || operator === "not_in";
    if (isList ? !Array.isArray(value) : typeof value !== "string") {
      return false;
    }
  }

  if (
    (field === "is_vpn" || field === "is_bot" || field === "is_datacenter") &&
    typeof value !== "boolean"
  ) {
    return false;
  }

  if (field === "burst") {
    const { links, seconds } = value || {};
    if (
      !Number.isInteger(links) ||
      links < 2 ||
      !Number.isInteger(seconds) ||
      seconds < 1 ||
      seconds > MAX_WINDOW_SECONDS
    ) {
      return false;
    }
  }

  if (field === "access_count" && typeof value !== "number") {
    return false;
  }

  if (field === "query_param") {
    const isList = operator === "in" || operator === "not_in";
    const { key, value: expected } = value || {};
    if (typeof key !== "string" || key.length === 0) return false;
    if (isList) {
      if (!Array.isArray(expected) || !expected.every((v) => typeof v === "string")) return false;
    } else if (typeof expected !== "string") {
      return false;
    }
  }

  return true;
};

/**
 * Evaluates a single condition against context
 * @param {Object} condition - The condition to evaluate
 * @param {Object} context - The context with user data
 * @returns {Promise<boolean>} - True if condition matches
 */
const evaluateCondition = async (condition, context) => {
  // Runtime validation to protect against malformed data from database
  if (!validateConditionStructure(condition)) {
    console.error(
      "Invalid condition structure detected:",
      JSON.stringify(condition)
    );
    // Fail closed - treat invalid conditions as not matching
    return false;
  }

  const { field, operator, value } = condition;

  switch (field) {
    case "country":
      return evaluateCountryCondition(operator, value, context.country);

    case "device":
      return evaluateDeviceCondition(operator, value, context.device);

    case "ip":
      return evaluateIpCondition(operator, value, context.ip);

    case "is_vpn":
      return evaluateBooleanCondition(operator, value, context.isVPN);

    case "is_bot":
      return evaluateBooleanCondition(operator, value, context.isBot);

    case "is_datacenter":
      return evaluateBooleanCondition(operator, value, context.isDatacenter);

    case "burst":
      return evaluateBurstCondition(value, context.recentHits);

    case "date":
      return evaluateDateCondition(operator, value, context.currentDate);

    case "access_count":
      return evaluateNumberCondition(operator, value, context.accessCount);

    case "query_param":
      return evaluateQueryParamCondition(operator, value, context.queryParams);

    default:
      console.warn(`Unknown condition field: ${field}`);
      return false;
  }
};

/**
 * Evaluates country condition
 */
const evaluateCountryCondition = (operator, value, contextCountry) => {
  if (operator === "in") {
    return value.includes(contextCountry);
  }
  if (operator === "not_in") {
    return !value.includes(contextCountry);
  }
  return false;
};

/**
 * Evaluates device condition
 */
const evaluateDeviceCondition = (operator, value, contextDevice) => {
  if (operator === "equals") {
    return contextDevice === value;
  }
  if (operator === "not_equals") {
    return contextDevice !== value;
  }
  return false;
};

/**
 * Checks if an IP matches a value that can be exact, wildcard (192.168.1.*) or CIDR (192.168.1.0/24)
 */
const ipMatches = (ip, pattern) => {
  if (!ip || !pattern) return false;

  // CIDR notation (e.g. 192.168.1.0/24)
  if (pattern.includes("/")) {
    const [subnet, bitsStr] = pattern.split("/");
    const bits = parseInt(bitsStr, 10);
    if (isNaN(bits) || bits < 0 || bits > 32) return false;
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    const ipNum = ipToInt(ip);
    const subnetNum = ipToInt(subnet);
    if (ipNum === null || subnetNum === null) return false;
    return (ipNum & mask) === (subnetNum & mask);
  }

  // Wildcard notation (e.g. 192.168.1.*)
  if (pattern.includes("*")) {
    const regex = new RegExp("^" + pattern.replace(/\./g, "\\.").replace(/\*/g, "\\d{1,3}") + "$");
    return regex.test(ip);
  }

  // Exact match
  return ip === pattern;
};

/**
 * Converts an IPv4 string to a 32-bit integer
 */
const ipToInt = (ip) => {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let result = 0;
  for (const part of parts) {
    const num = parseInt(part, 10);
    if (isNaN(num) || num < 0 || num > 255) return null;
    result = (result << 8) | num;
  }
  return result >>> 0;
};

/**
 * Evaluates IP condition
 */
const evaluateIpCondition = (operator, value, contextIp) => {
  if (operator === "equals") {
    return ipMatches(contextIp, value);
  }
  if (operator === "not_equals") {
    return !ipMatches(contextIp, value);
  }
  if (operator === "in") {
    return value.some((pattern) => ipMatches(contextIp, pattern));
  }
  if (operator === "not_in") {
    return !value.some((pattern) => ipMatches(contextIp, pattern));
  }
  return false;
};

/**
 * Evaluates burst condition: true when the visitor's IP has requested at least
 * `links` distinct links of the same owner within the last `seconds` seconds.
 * The current hit counts, so { links: 3 } fires on the third distinct link.
 */
const evaluateBurstCondition = (value, recentHits) =>
  distinctLinksWithin(recentHits, value.seconds) >= value.links;

/**
 * Evaluates a query param condition against the (already sanitized) params of
 * the access URL. Key and value comparisons ignore case, so "Instagram" and
 * "instagram" are the same UTM. A missing param never satisfies a positive
 * operator (equals / in / contains) and always satisfies a negative one.
 */
const evaluateQueryParamCondition = (operator, value, queryParams) => {
  const wanted = String(value.key).toLowerCase();
  const entry = Object.entries(queryParams || {}).find(([key]) => key.toLowerCase() === wanted);
  const actual = entry ? String(entry[1]).toLowerCase() : null;
  const targets = (Array.isArray(value.value) ? value.value : [value.value]).map((v) =>
    String(v).toLowerCase()
  );

  switch (operator) {
    case "equals":
      return actual !== null && actual === targets[0];
    case "not_equals":
      return actual === null || actual !== targets[0];
    case "in":
      return actual !== null && targets.includes(actual);
    case "not_in":
      return actual === null || !targets.includes(actual);
    case "contains":
      return actual !== null && actual.includes(targets[0]);
    case "not_contains":
      return actual === null || !actual.includes(targets[0]);
    default:
      return false;
  }
};

/**
 * Evaluates boolean condition (VPN, Bot)
 */
const evaluateBooleanCondition = (operator, value, contextValue) => {
  if (operator === "equals") {
    return contextValue === value;
  }
  return false;
};

/**
 * Evaluates date condition
 */
const evaluateDateCondition = (operator, value, contextDate) => {
  const targetDate = new Date(value);
  const currentDate = contextDate || new Date();

  if (operator === "before") {
    return currentDate < targetDate;
  }
  if (operator === "after") {
    return currentDate > targetDate;
  }
  if (operator === "equals") {
    return currentDate.toISOString() === targetDate.toISOString();
  }
  return false;
};

/**
 * Evaluates number condition (access count)
 */
const evaluateNumberCondition = (operator, value, contextValue) => {
  const numValue = Number(value);
  const numContext = Number(contextValue);

  if (isNaN(numValue) || isNaN(numContext)) return false;

  if (operator === "equals") {
    return numContext === numValue;
  }
  if (operator === "greater_than") {
    return numContext > numValue;
  }
  if (operator === "less_than") {
    return numContext < numValue;
  }
  return false;
};

// ============================================
// RULE EVALUATION
// ============================================

/**
 * Evaluates all conditions of a rule based on match type (AND/OR)
 * @param {Array} conditions - Array of conditions
 * @param {string} match - "AND" | "OR"
 * @param {Object} context - Context with user data
 * @returns {Promise<boolean>} - True if conditions match
 */
const evaluateConditions = async (conditions, match, context) => {
  // No conditions = always true (fallback rule)
  if (!conditions || conditions.length === 0) {
    return true;
  }

  if (match === "AND") {
    // All conditions must be true
    for (const condition of conditions) {
      const result = await evaluateCondition(condition, context);
      if (!result) return false;
    }
    return true;
  }

  if (match === "OR") {
    // At least one condition must be true
    for (const condition of conditions) {
      const result = await evaluateCondition(condition, context);
      if (result) return true;
    }
    return false;
  }

  return false;
};

// ============================================
// ACTION EVALUATION
// ============================================

/**
 * Evaluates an action and returns the result
 * @param {Object} action - The action object with type and settings
 * @param {Object} link - The link object
 * @returns {Promise<Object>} - Action result
 */
const evaluateAction = async (action, link) => {
  const { type, settings } = action;

  switch (type) {
    case "redirect":
      return {
        type: "redirect",
        url: replaceVariables(settings.url, link),
      };

    case "block_access":
      return {
        type: "block",
        reason: settings?.reason || "Access denied",
      };

    case "password_gate":
      return {
        type: "password_gate",
        shortUrl: link.shortUrl,
        passwordHash: settings.passwordHash,
        hint: settings?.hint,
      };

    case "notify":
      return {
        type: "notify",
        webhookUrl: settings?.webhookUrl,
        message: settings?.message,
        sendEmail: settings?.sendEmail === true,
      };

    default:
      console.warn(`Unknown action type: ${type}`);
      return {
        type: "redirect",
        url: link.longUrl,
      };
  }
};

const isValidRedirectUrl = (url) => {
  try {
    const parsed = new URL(url);
    const protocol = parsed.protocol.toLowerCase();
    const hostname = parsed.hostname.toLowerCase();

    // Only allow http and https protocols
    if (protocol !== "http:" && protocol !== "https:") {
      return false;
    }

    // Block localhost and private IPs (SSRF protection)
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname === "0.0.0.0" ||
      hostname === "::1" ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".localhost") ||
      hostname.startsWith("127.") ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("169.254.") ||
      hostname === "169.254.169.254" || // AWS metadata
      hostname.match(/^172\.(1[6-9]|2[0-9]|3[01])\./)
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

const replaceVariables = (url, link) => {
  // SECURITY: Validate source values before replacement (prevents template injection)
  if (!isValidRedirectUrl(link.longUrl)) {
    throw new Error("Invalid longUrl for template replacement");
  }

  // SECURITY: Prevent nested template injection - check for template syntax in values
  const templatePattern = /\{\{.*?\}\}/;
  if (templatePattern.test(link.longUrl) || templatePattern.test(link.shortUrl)) {
    throw new Error("Template syntax not allowed in link values (nested template injection attempt)");
  }

  // SECURITY: Prevent other injection patterns
  const dangerousPatterns = [
    /javascript:/i,
    /data:/i,
    /vbscript:/i,
    /file:/i,
    /<script/i,
    /on\w+\s*=/i, // Event handlers like onclick=
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(link.longUrl) || pattern.test(link.shortUrl)) {
      throw new Error("Dangerous pattern detected in link values (injection attempt)");
    }
  }

  // SECURITY: Check for excessive length to prevent DoS
  if (link.longUrl.length > 2048 || link.shortUrl.length > 100) {
    throw new Error("Link values exceed maximum allowed length");
  }

  // SECURITY: URL-encode template values to prevent injection
  // Check if we're replacing in query params or path
  const encodedLongUrl = encodeURIComponent(link.longUrl);
  const encodedShortUrl = encodeURIComponent(link.shortUrl);

  // Perform replacement with encoded values
  let replaced = url
    .replace(/\{\{longUrl\}\}/g, encodedLongUrl)
    .replace(/\{\{shortUrl\}\}/g, encodedShortUrl);

  // SECURITY: After replacement, check for remaining template syntax (indicates nested templates)
  if (templatePattern.test(replaced)) {
    throw new Error("Template syntax detected after replacement (nested template injection attempt)");
  }

  // Try to decode and validate if it's a complete URL
  try {
    // If the replaced URL is valid, use it as-is
    const testUrl = new URL(replaced);
    // Valid URL, but let's still validate for security
    if (!isValidRedirectUrl(replaced)) {
      throw new Error("Invalid redirect URL after variable replacement");
    }
    return replaced;
  } catch {
    // If not a valid complete URL, it might be a relative path or needs decoding
    // In this case, try with un-encoded values (backward compatibility)
    replaced = url
      .replace(/\{\{longUrl\}\}/g, link.longUrl)
      .replace(/\{\{shortUrl\}\}/g, link.shortUrl);

    // SECURITY: Check again for template syntax after unencoded replacement
    if (templatePattern.test(replaced)) {
      throw new Error("Template syntax detected after replacement (nested template injection attempt)");
    }

    // Validate the final URL after replacement (prevents open redirect)
    if (!isValidRedirectUrl(replaced)) {
      throw new Error("Invalid redirect URL after variable replacement");
    }

    return replaced;
  }
};

// ============================================
// MAIN EVALUATION FUNCTION
// ============================================

/**
 * Action types that only cause a side effect and let evaluation continue.
 * Every other action decides where the visit ends up (redirect, block,
 * password gate) and therefore stops the evaluation.
 */
const NON_TERMINAL_ACTION_TYPES = ["notify"];

const isNonTerminalAction = (result) =>
  NON_TERMINAL_ACTION_TYPES.includes(result.type);

/**
 * Evaluates all rules for a link, in priority order, and returns the first
 * terminal action plus the non-terminal ones (notify) found before it.
 * Rules placed after the terminal action are not evaluated.
 * @param {Object} link - Link object with rules
 * @param {Object} context - Context with user data (country, device, etc.)
 * @param {Object} options - { skipActionTypes: string[] }
 * @returns {Promise<Object>} - { allowed: boolean, action: Object, notifications: Object[] }
 *   `notifications` entries are notify actions tagged with the `ruleId` that produced them.
 */
const evaluateLinkRules = async (link, context, options = {}) => {
  const { skipActionTypes = [] } = options;
  const notifications = [];

  const defaultResult = () => ({
    allowed: true,
    action: {
      type: "redirect",
      url: link.longUrl,
    },
    notifications,
  });

  // No rules = redirect to longUrl
  if (!link.rules || link.rules.length === 0) {
    return defaultResult();
  }

  // Filter enabled rules and sort by priority (lower = higher priority)
  const enabledRules = link.rules
    .filter((rule) => rule.enabled)
    .sort((a, b) => a.priority - b.priority);

  // Evaluate rules in order
  for (const rule of enabledRules) {
    const conditionsMatch = await evaluateConditions(
      rule.conditions,
      rule.match,
      context
    );

    let actionType;
    let actionSettings;

    if (conditionsMatch) {
      actionType = rule.actionType;
      actionSettings = rule.actionSettings;
    } else if (rule.elseActionType) {
      actionType = rule.elseActionType;
      actionSettings = rule.elseActionSettings;
    } else {
      // No match and no else action - continue to next rule
      continue;
    }

    // Skip if the action type is in the skip list (e.g. password_gate already verified)
    if (skipActionTypes.includes(actionType)) {
      continue;
    }

    const result = await evaluateAction(
      { type: actionType, settings: actionSettings || {} },
      link
    );

    if (isNonTerminalAction(result)) {
      notifications.push({ ...result, ruleId: rule.id });
      continue;
    }

    // Check if action blocks access
    const allowed = result.type !== "block";

    return { allowed, action: result, notifications };
  }

  // No terminal action - redirect to longUrl
  return defaultResult();
};

// ============================================
// EXPORTS
// ============================================

module.exports = {
  // Main function
  evaluateLinkRules,

  // Helper functions (exported for testing)
  evaluateCondition,
  evaluateAction,
  detectDevice,

  // Internal helpers (exported for advanced testing)
  evaluateConditions,
  replaceVariables,
};
