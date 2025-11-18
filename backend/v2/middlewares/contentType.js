/**
 * Content-Type Validation Middleware
 * Ensures requests with body have proper Content-Type headers
 *
 * SECURITY: Prevents attacks via malformed Content-Type headers
 * and ensures proper data parsing (VUL-009 fix)
 */

const { errorResponse } = require('../utils/response');

/**
 * Validate Content-Type for requests with body
 * @returns {Function} - Express middleware
 */
const validateContentType = (req, res, next) => {
  // Skip validation for GET, HEAD, DELETE, OPTIONS (no body expected)
  if (['GET', 'HEAD', 'DELETE', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Skip validation for public redirect endpoint (no body)
  if (req.path.startsWith('/r/')) {
    return next();
  }

  // Skip for CSRF token endpoint (no body)
  if (req.path === '/csrf-token') {
    return next();
  }

  const contentType = req.headers['content-type'];

  // If no Content-Type header and no body, allow (empty POST/PUT)
  if (!contentType && (!req.body || Object.keys(req.body).length === 0)) {
    return next();
  }

  // SECURITY: Require Content-Type for requests with body
  if (!contentType) {
    return errorResponse(res, {
      code: 'CONTENT_TYPE_MISSING',
      message: 'Content-Type header is required for requests with body',
      statusCode: 400,
    });
  }

  // Validate Content-Type is one of the allowed types
  const allowedTypes = [
    'application/json',
    'application/x-www-form-urlencoded',
    'multipart/form-data',
  ];

  // Check if Content-Type matches any allowed type (can include charset)
  const isValidType = allowedTypes.some(type =>
    contentType.toLowerCase().startsWith(type.toLowerCase())
  );

  if (!isValidType) {
    return errorResponse(res, {
      code: 'CONTENT_TYPE_INVALID',
      message: `Invalid Content-Type. Allowed types: ${allowedTypes.join(', ')}`,
      statusCode: 415, // Unsupported Media Type
    });
  }

  // SECURITY: For JSON requests, validate it's actually JSON
  if (contentType.toLowerCase().startsWith('application/json')) {
    // If body parsing failed or produced non-object, reject
    if (req.body === undefined || req.body === null) {
      return errorResponse(res, {
        code: 'JSON_PARSE_ERROR',
        message: 'Invalid JSON body',
        statusCode: 400,
      });
    }
  }

  next();
};

module.exports = {
  validateContentType,
};
