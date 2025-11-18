/**
 * Log Sanitization Utility
 * Sanitizes sensitive information in logs for GDPR compliance
 *
 * SECURITY: Hash PII (emails, IPs, usernames) to prevent data leaks in logs
 * while still allowing log correlation and debugging
 */

const crypto = require('crypto');

/**
 * Hash a value using SHA-256
 * Returns first 16 characters of hash for readability
 */
const hashValue = (value) => {
  if (!value) return null;
  return crypto
    .createHash('sha256')
    .update(String(value))
    .digest('hex')
    .substring(0, 16);
};

/**
 * Sanitize an IP address
 * @param {string} ip - IP address to sanitize
 * @returns {string} - Hashed IP (first 16 chars of SHA-256)
 */
const sanitizeIp = (ip) => {
  if (!ip) return null;
  return `ip_${hashValue(ip)}`;
};

/**
 * Sanitize an email address
 * @param {string} email - Email to sanitize
 * @returns {string} - Hashed email (first 16 chars of SHA-256)
 */
const sanitizeEmail = (email) => {
  if (!email) return null;
  return `email_${hashValue(email)}`;
};

/**
 * Sanitize a username
 * @param {string} username - Username to sanitize
 * @returns {string} - Hashed username (first 16 chars of SHA-256)
 */
const sanitizeUsername = (username) => {
  if (!username) return null;
  return `user_${hashValue(username)}`;
};

/**
 * Sanitize user ID (keep as-is, it's not PII)
 * @param {string} userId - User ID
 * @returns {string} - User ID unchanged
 */
const sanitizeUserId = (userId) => {
  return userId;
};

/**
 * Sanitize a request object for logging
 * @param {Object} req - Express request object
 * @returns {Object} - Sanitized request info
 */
const sanitizeRequest = (req) => {
  return {
    method: req.method,
    url: req.url,
    ip: sanitizeIp(req.ip),
    userId: req.user?.id || null,
    guestId: req.guest?.guestSessionId || null,
    userAgent: req.headers['user-agent'] || null,
  };
};

/**
 * Sanitize an error for logging
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @returns {Object} - Sanitized error log
 */
const sanitizeError = (err, req) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    message: err.message,
    code: err.code,
    url: req.url,
    method: req.method,
    ip: sanitizeIp(req.ip),
    userId: req.user?.id || null,
    guestId: req.guest?.guestSessionId || null,
  };

  // Only include stack trace in development
  if (process.env.ENV === 'development') {
    errorLog.stack = err.stack;
    errorLog.context = err.context;
  }

  return errorLog;
};

/**
 * Sanitize user data for logging
 * @param {Object} user - User object
 * @returns {Object} - Sanitized user info
 */
const sanitizeUser = (user) => {
  if (!user) return null;

  return {
    id: user.id,
    username: sanitizeUsername(user.username),
    email: sanitizeEmail(user.email),
  };
};

module.exports = {
  hashValue,
  sanitizeIp,
  sanitizeEmail,
  sanitizeUsername,
  sanitizeUserId,
  sanitizeRequest,
  sanitizeError,
  sanitizeUser,
};
