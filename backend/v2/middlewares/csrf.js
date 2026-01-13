/**
 * CSRF Protection Middleware
 * Implements Double Submit Cookie pattern
 * More info: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
 */

const crypto = require("crypto");
const { errorResponse } = require("../utils/response");
const config = require("../config/environment");

/**
 * Generate a cryptographically secure CSRF token
 */
const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Middleware to generate and set CSRF token
 * Should be used on routes that render forms or return CSRF tokens
 */
const csrfTokenGenerator = (req, res, next) => {
  // Generate new token if it doesn't exist
  if (!req.cookies.csrfToken) {
    const token = generateCsrfToken();

    // Set cookie with token
    res.cookie("csrfToken", token, {
      ...config.security.cookies,
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    });

    req.csrfToken = token;
  } else {
    req.csrfToken = req.cookies.csrfToken;
  }

  next();
};

/**
 * Middleware to validate CSRF token on state-changing requests
 * Should be used on POST, PUT, DELETE, PATCH routes
 */
const csrfProtection = (req, res, next) => {
  // BYPASS CSRF in test environment for easier testing
  // In production, ALWAYS enforce CSRF
  if (!config.security.csrf.enabled) {
    return next();
  }

  // Skip CSRF for GET, HEAD, OPTIONS
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  const cookieToken = req.cookies.csrfToken;
  const headerToken = req.headers["x-csrf-token"] || req.headers["csrf-token"];

  // Check if both tokens exist
  if (!cookieToken || !headerToken) {
    return errorResponse(res, {
      code: "CSRF_TOKEN_MISSING",
      message: "CSRF token is missing",
      statusCode: 403,
    });
  }

  // Constant-time comparison to prevent timing attacks
  // First check if lengths match (to avoid crypto.timingSafeEqual error)
  if (cookieToken.length !== headerToken.length) {
    return errorResponse(res, {
      code: "CSRF_TOKEN_INVALID",
      message: "CSRF token is invalid",
      statusCode: 403,
    });
  }

  try {
    if (
      !crypto.timingSafeEqual(
        Buffer.from(cookieToken),
        Buffer.from(headerToken)
      )
    ) {
      return errorResponse(res, {
        code: "CSRF_TOKEN_INVALID",
        message: "CSRF token is invalid",
        statusCode: 403,
      });
    }
  } catch (error) {
    // In case of any error in comparison, reject the token
    return errorResponse(res, {
      code: "CSRF_TOKEN_INVALID",
      message: "CSRF token is invalid",
      statusCode: 403,
    });
  }

  next();
};

/**
 * Endpoint to get CSRF token (for SPAs)
 */
const getCsrfToken = (req, res) => {
  res.json({
    success: true,
    csrfToken: req.csrfToken,
  });
};

module.exports = {
  csrfTokenGenerator,
  csrfProtection,
  getCsrfToken,
};
