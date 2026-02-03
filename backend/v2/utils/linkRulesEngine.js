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
    "date",
    "access_count",
  ];
  if (!validFields.includes(field)) {
    return false;
  }

  // Validate operators per field type
  const validOperators = {
    country: ["in", "not_in"],
    device: ["equals", "not_equals"],
    ip: ["equals", "not_equals"],
    is_vpn: ["equals"],
    is_bot: ["equals"],
    date: ["before", "after", "equals"],
    access_count: ["equals", "greater_than", "less_than"],
  };

  if (!validOperators[field] || !validOperators[field].includes(operator)) {
    return false;
  }

  // Validate value types per field
  if (field === "country" && !Array.isArray(value)) {
    return false;
  }

  if (
    (field === "is_vpn" || field === "is_bot") &&
    typeof value !== "boolean"
  ) {
    return false;
  }

  if (field === "access_count" && typeof value !== "number") {
    return false;
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

    case "date":
      return evaluateDateCondition(operator, value, context.currentDate);

    case "access_count":
      return evaluateNumberCondition(operator, value, context.accessCount);

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
 * Evaluates IP condition
 */
const evaluateIpCondition = (operator, value, contextIp) => {
  if (operator === "equals") {
    return contextIp === value;
  }
  if (operator === "not_equals") {
    return contextIp !== value;
  }
  return false;
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
 * Evaluates all rules for a link and returns the appropriate action
 * @param {Object} link - Link object with rules
 * @param {Object} context - Context with user data (country, device, etc.)
 * @returns {Promise<Object>} - { allowed: boolean, action: Object }
 */
const evaluateLinkRules = async (link, context, options = {}) => {
  const { skipActionTypes = [] } = options;

  // No rules = redirect to longUrl
  if (!link.rules || link.rules.length === 0) {
    return {
      allowed: true,
      action: {
        type: "redirect",
        url: link.longUrl,
      },
    };
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

    if (conditionsMatch) {
      // Skip if the primary action type is in the skip list (e.g. password_gate already verified)
      if (skipActionTypes.includes(rule.actionType)) {
        continue;
      }

      // Conditions match - execute primary action
      const action = {
        type: rule.actionType,
        settings: rule.actionSettings || {},
      };

      const result = await evaluateAction(action, link);

      // Check if action blocks access
      const allowed = result.type !== "block";

      return { allowed, action: result };
    } else if (rule.elseActionType) {
      // Skip if the else action type is in the skip list
      if (skipActionTypes.includes(rule.elseActionType)) {
        continue;
      }

      // Conditions don't match - execute else action if exists
      const elseAction = {
        type: rule.elseActionType,
        settings: rule.elseActionSettings || {},
      };

      const result = await evaluateAction(elseAction, link);

      // Check if action blocks access
      const allowed = result.type !== "block";

      return { allowed, action: result };
    }

    // No match and no else action - continue to next rule
  }

  // No rule matched - redirect to longUrl
  return {
    allowed: true,
    action: {
      type: "redirect",
      url: link.longUrl,
    },
  };
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
