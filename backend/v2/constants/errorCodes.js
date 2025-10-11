/**
 * Error Codes with Enhanced Metadata
 *
 * Each error includes:
 * - code: Unique identifier for programmatic handling
 * - message: Technical message for logging
 * - userMessage: User-friendly message to display
 * - statusCode: HTTP status code
 * - retryable: Whether the operation can be retried
 */

const ERRORS = {
  // ============================================================================
  // AUTHENTICATION ERRORS
  // ============================================================================
  UNAUTHORIZED: {
    code: "UNAUTHORIZED",
    message: "Unauthorized",
    userMessage: "You need to be logged in to access this resource",
    statusCode: 401,
    retryable: false,
  },
  INVALID_CREDENTIALS: {
    code: "INVALID_CREDENTIALS",
    message: "Invalid credentials",
    userMessage: "Invalid username or password",
    statusCode: 401,
    retryable: false,
  },
  USER_NOT_FOUND: {
    code: "USER_NOT_FOUND",
    message: "User not found",
    userMessage: "User not found",
    statusCode: 404,
    retryable: false,
  },

  // ============================================================================
  // REGISTRATION/LOGIN ERRORS
  // ============================================================================
  USER_EXISTS: {
    code: "USER_EXISTS",
    message: "User already exists",
    userMessage: "A user with this username or email already exists",
    statusCode: 400,
    retryable: false,
  },
  INVALID_DATA: {
    code: "INVALID_DATA",
    message: "Invalid data",
    userMessage: "The data provided is invalid",
    statusCode: 400,
    retryable: false,
  },

  // ============================================================================
  // GUEST SESSION ERRORS
  // ============================================================================
  GUEST_SESSION_EXISTS: {
    code: "GUEST_SESSION_EXISTS",
    message: "Guest session already exists",
    userMessage: "You already have an active guest session",
    statusCode: 400,
    retryable: false,
  },
  GUEST_SESSION_NOT_FOUND: {
    code: "GUEST_SESSION_NOT_FOUND",
    message: "Guest session not found",
    userMessage: "Your guest session has expired",
    statusCode: 404,
    retryable: false,
  },

  // ============================================================================
  // LINK ERRORS
  // ============================================================================
  LINK_NOT_FOUND: {
    code: "LINK_NOT_FOUND",
    message: "Link not found",
    userMessage: "The link you're looking for doesn't exist",
    statusCode: 404,
    retryable: false,
  },
  LINK_ACCESS_DENIED: {
    code: "LINK_ACCESS_DENIED",
    message: "Access denied",
    userMessage: "You don't have permission to access this link",
    statusCode: 403,
    retryable: false,
  },
  SHORT_URL_EXISTS: {
    code: "SHORT_URL_EXISTS",
    message: "Short URL already exists",
    userMessage: "This short URL is already taken",
    statusCode: 400,
    retryable: false,
  },
  LINK_LIMIT_EXCEEDED: {
    code: "LINK_LIMIT_EXCEEDED",
    message: "Link limit exceeded",
    userMessage: "You've reached your link limit. Upgrade your plan to create more links",
    statusCode: 400,
    retryable: false,
  },
  LINK_NO_PASSWORD: {
    code: "LINK_NO_PASSWORD",
    message: "This link is not password protected",
    userMessage: "This link is not password protected",
    statusCode: 400,
    retryable: false,
  },
  LINK_DISABLED: {
    code: "LINK_DISABLED",
    message: "This link is disabled",
    userMessage: "This link has been disabled by the owner",
    statusCode: 403,
    retryable: false,
  },
  LINK_EXPIRED: {
    code: "LINK_EXPIRED",
    message: "This link has expired",
    userMessage: "This link has expired",
    statusCode: 410,
    retryable: false,
  },

  // ============================================================================
  // RATE LIMITING ERRORS
  // ============================================================================
  RATE_LIMIT_EXCEEDED: {
    code: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests",
    userMessage: "Too many requests. Please try again later",
    statusCode: 429,
    retryable: true,
  },

  // ============================================================================
  // SYSTEM ERRORS
  // ============================================================================
  INTERNAL_ERROR: {
    code: "INTERNAL_ERROR",
    message: "Internal server error",
    userMessage: "Something went wrong on our end. Please try again later",
    statusCode: 500,
    retryable: true,
  },
  DATABASE_ERROR: {
    code: "DATABASE_ERROR",
    message: "Database error",
    userMessage: "Database connection error. Please try again later",
    statusCode: 500,
    retryable: true,
  },
};

/**
 * Helper function to check if an error is retryable
 */
ERRORS.isRetryable = (code) => {
  const error = Object.values(ERRORS).find((err) => err.code === code);
  return error?.retryable || false;
};

/**
 * Error categories for analytics and filtering
 */
ERRORS.categories = {
  AUTH: ['UNAUTHORIZED', 'INVALID_CREDENTIALS', 'USER_NOT_FOUND'],
  USER: ['USER_EXISTS', 'INVALID_DATA'],
  GUEST: ['GUEST_SESSION_EXISTS', 'GUEST_SESSION_NOT_FOUND'],
  LINK: ['LINK_NOT_FOUND', 'LINK_ACCESS_DENIED', 'SHORT_URL_EXISTS', 'LINK_LIMIT_EXCEEDED', 'LINK_NO_PASSWORD', 'LINK_DISABLED', 'LINK_EXPIRED'],
  RATE_LIMIT: ['RATE_LIMIT_EXCEEDED'],
  SYSTEM: ['INTERNAL_ERROR', 'DATABASE_ERROR']
};

module.exports = ERRORS;
