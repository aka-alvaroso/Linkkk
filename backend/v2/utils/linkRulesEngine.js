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
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(userAgent)) {
    return "mobile";
  }

  // Default to desktop
  return "desktop";
};

// ============================================
// CONDITION EVALUATORS
// ============================================

/**
 * Evaluates a single condition against context
 * @param {Object} condition - The condition to evaluate
 * @param {Object} context - The context with user data
 * @returns {Promise<boolean>} - True if condition matches
 */
const evaluateCondition = async (condition, context) => {
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
  if (operator === "equals") {
    return contextValue === value;
  }
  if (operator === "greater_than") {
    return contextValue > value;
  }
  if (operator === "less_than") {
    return contextValue < value;
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
        reason: settings?.reason || "ACCESS_BLOCKED",
        message: settings?.message || "Access denied",
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

/**
 * Replaces template variables in URLs
 * @param {string} url - URL with potential variables
 * @param {Object} link - Link object
 * @returns {string} - URL with variables replaced
 */
const replaceVariables = (url, link) => {
  return url
    .replace(/\{\{longUrl\}\}/g, link.longUrl)
    .replace(/\{\{shortUrl\}\}/g, link.shortUrl);
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
const evaluateLinkRules = async (link, context) => {
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
