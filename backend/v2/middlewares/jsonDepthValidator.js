/**
 * JSON Depth Validator Middleware
 * Prevents DoS attacks via deeply nested JSON objects
 *
 * SECURITY: Limits the maximum depth of JSON objects to prevent
 * stack overflow and excessive memory consumption
 */

const { errorResponse } = require('../utils/response');

/**
 * Calculate the depth of a JSON object/array
 * @param {any} obj - The object to measure
 * @param {number} currentDepth - Current depth level
 * @returns {number} - Maximum depth found
 */
const getDepth = (obj, currentDepth = 0) => {
  // SECURITY: Prevent stack overflow by limiting recursion
  if (currentDepth > 20) {
    return currentDepth;
  }

  if (obj === null || obj === undefined) {
    return currentDepth;
  }

  // Only check objects and arrays
  if (typeof obj !== 'object') {
    return currentDepth;
  }

  // Check if it's an array or object and get max depth of children
  let maxDepth = currentDepth;

  try {
    const values = Array.isArray(obj) ? obj : Object.values(obj);

    for (const value of values) {
      if (value !== null && typeof value === 'object') {
        const depth = getDepth(value, currentDepth + 1);
        maxDepth = Math.max(maxDepth, depth);
      }
    }
  } catch (error) {
    // If we hit recursion limit or other error, return current depth
    return currentDepth;
  }

  return maxDepth;
};

/**
 * Middleware to validate JSON depth
 * @param {number} maxDepth - Maximum allowed depth (default: 10)
 */
const validateJsonDepth = (maxDepth = 10) => {
  return (req, res, next) => {
    // Only validate if there's a JSON body
    if (!req.body || typeof req.body !== 'object') {
      return next();
    }

    // Skip for GET requests (no body)
    if (req.method === 'GET' || req.method === 'HEAD') {
      return next();
    }

    try {
      const depth = getDepth(req.body);

      // SECURITY: Reject if depth exceeds limit
      if (depth > maxDepth) {
        return errorResponse(res, {
          code: 'JSON_DEPTH_EXCEEDED',
          message: `JSON object depth exceeds maximum allowed depth of ${maxDepth}`,
          statusCode: 400,
        });
      }

      next();
    } catch (error) {
      // If validation fails, reject the request
      return errorResponse(res, {
        code: 'JSON_VALIDATION_ERROR',
        message: 'Invalid JSON structure',
        statusCode: 400,
      });
    }
  };
};

/**
 * Count total number of keys in an object (including nested)
 * @param {any} obj - The object to count
 * @returns {number} - Total number of keys
 */
const countKeys = (obj, currentCount = 0) => {
  // SECURITY: Prevent excessive counting (DoS)
  if (currentCount > 10000) {
    return currentCount;
  }

  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return currentCount;
  }

  let totalKeys = currentCount;

  try {
    if (Array.isArray(obj)) {
      // Count array items
      totalKeys += obj.length;
      for (const item of obj) {
        if (item !== null && typeof item === 'object') {
          totalKeys = countKeys(item, totalKeys);
        }
      }
    } else {
      // Count object keys
      const keys = Object.keys(obj);
      totalKeys += keys.length;

      for (const key of keys) {
        const value = obj[key];
        if (value !== null && typeof value === 'object') {
          totalKeys = countKeys(value, totalKeys);
        }
      }
    }
  } catch (error) {
    return totalKeys;
  }

  return totalKeys;
};

/**
 * Middleware to validate total JSON keys
 * @param {number} maxKeys - Maximum allowed total keys (default: 1000)
 */
const validateJsonKeys = (maxKeys = 1000) => {
  return (req, res, next) => {
    // Only validate if there's a JSON body
    if (!req.body || typeof req.body !== 'object') {
      return next();
    }

    // Skip for GET requests (no body)
    if (req.method === 'GET' || req.method === 'HEAD') {
      return next();
    }

    try {
      const keyCount = countKeys(req.body);

      // SECURITY: Reject if key count exceeds limit
      if (keyCount > maxKeys) {
        return errorResponse(res, {
          code: 'JSON_COMPLEXITY_EXCEEDED',
          message: `JSON object has too many keys (${keyCount} > ${maxKeys})`,
          statusCode: 400,
        });
      }

      next();
    } catch (error) {
      // If validation fails, reject the request
      return errorResponse(res, {
        code: 'JSON_VALIDATION_ERROR',
        message: 'Invalid JSON structure',
        statusCode: 400,
      });
    }
  };
};

module.exports = {
  validateJsonDepth,
  validateJsonKeys,
  getDepth,
  countKeys,
};
