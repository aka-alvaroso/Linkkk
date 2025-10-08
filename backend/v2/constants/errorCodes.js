/**
 * Códigos de Error Simplificados
 * Solo los códigos más importantes y comunes
 */

// Códigos básicos más comunes
const ERRORS = {
  // Autenticación
  UNAUTHORIZED: {
    code: "UNAUTHORIZED",
    message: "Unauthorized",
    statusCode: 401,
  },
  INVALID_CREDENTIALS: {
    code: "INVALID_CREDENTIALS",
    message: "Invalid credentials",
    statusCode: 401,
  },
  USER_NOT_FOUND: {
    code: "USER_NOT_FOUND",
    message: "User not found",
    statusCode: 404,
  },

  // Registro/Login
  USER_EXISTS: {
    code: "USER_EXISTS",
    message: "User already exists",
    statusCode: 400,
  },
  INVALID_DATA: {
    code: "INVALID_DATA",
    message: "Invalid data",
    statusCode: 400,
  },

  // Guest sessions
  GUEST_SESSION_EXISTS: {
    code: "GUEST_SESSION_EXISTS",
    message: "Guest session already exists",
    statusCode: 400,
  },
  GUEST_SESSION_NOT_FOUND: {
    code: "GUEST_SESSION_NOT_FOUND",
    message: "Guest session not found",
    statusCode: 404,
  },

  // Links
  LINK_NOT_FOUND: {
    code: "LINK_NOT_FOUND",
    message: "Link not found",
    statusCode: 404,
  },
  LINK_ACCESS_DENIED: {
    code: "LINK_ACCESS_DENIED",
    message: "Access denied",
    statusCode: 403,
  },
  SHORT_URL_EXISTS: {
    code: "SHORT_URL_EXISTS",
    message: "Short URL already exists",
    statusCode: 400,
  },
  LINK_LIMIT_EXCEEDED: {
    code: "LINK_LIMIT_EXCEEDED",
    message: "Link limit exceeded",
    statusCode: 400,
  },
  LINK_NO_PASSWORD: {
    code: "LINK_NO_PASSWORD",
    message: "This link is not password protected",
    statusCode: 400,
  },
  LINK_DISABLED: {
    code: "LINK_DISABLED",
    message: "This link is disabled",
    statusCode: 403,
  },
  LINK_EXPIRED: {
    code: "LINK_EXPIRED",
    message: "This link has expired",
    statusCode: 410,
  },

  // Rate limiting
  RATE_LIMIT_EXCEEDED: {
    code: "RATE_LIMIT_EXCEEDED",
    message: "Too many requests",
    statusCode: 429,
  },

  // Generales
  INTERNAL_ERROR: {
    code: "INTERNAL_ERROR",
    message: "Internal server error",
    statusCode: 500,
  },
  DATABASE_ERROR: {
    code: "DATABASE_ERROR",
    message: "Database error",
    statusCode: 500,
  },
};

module.exports = ERRORS;
