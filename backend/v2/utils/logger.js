/**
 * Simple Logger Utility
 * Replaces console.log/error/warn with environment-aware logging
 *
 * SECURITY: Prevents sensitive information leakage in production logs
 * and provides structured logging for better monitoring
 */

const ENV = process.env.ENV || 'development';
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Log levels
 */
const LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

/**
 * Format log message with timestamp and level
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} meta - Additional metadata
 * @returns {string} - Formatted log message
 */
const formatLog = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const logObject = {
    timestamp,
    level,
    message,
    env: ENV,
    ...meta,
  };

  // In production, use JSON format for easier parsing
  if (ENV === 'production') {
    return JSON.stringify(logObject);
  }

  // In development, use human-readable format
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}] ${message}${metaStr}`;
};

/**
 * Error logger
 * @param {string} message - Error message
 * @param {Object} meta - Additional metadata (error stack, context, etc.)
 */
const error = (message, meta = {}) => {
  const formattedLog = formatLog(LogLevel.ERROR, message, meta);
  console.error(formattedLog);
};

/**
 * Warning logger
 * @param {string} message - Warning message
 * @param {Object} meta - Additional metadata
 */
const warn = (message, meta = {}) => {
  const formattedLog = formatLog(LogLevel.WARN, message, meta);
  console.warn(formattedLog);
};

/**
 * Info logger
 * @param {string} message - Info message
 * @param {Object} meta - Additional metadata
 */
const info = (message, meta = {}) => {
  // Skip info logs in test environment to keep test output clean
  if (NODE_ENV === 'test') return;

  const formattedLog = formatLog(LogLevel.INFO, message, meta);
  console.log(formattedLog);
};

/**
 * Debug logger (only in development)
 * @param {string} message - Debug message
 * @param {Object} meta - Additional metadata
 */
const debug = (message, meta = {}) => {
  // Only log debug messages in development
  if (ENV !== 'development' || NODE_ENV === 'test') return;

  const formattedLog = formatLog(LogLevel.DEBUG, message, meta);
  console.log(formattedLog);
};

/**
 * Security event logger
 * Special logger for security-related events that should always be logged
 * @param {string} message - Security event message
 * @param {Object} meta - Additional metadata
 */
const security = (message, meta = {}) => {
  const formattedLog = formatLog('SECURITY', message, {
    ...meta,
    security_event: true,
  });
  console.error(formattedLog);
};

/**
 * HTTP request logger
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} duration - Request duration in ms
 */
const http = (req, res, duration) => {
  // Skip logging in test environment
  if (NODE_ENV === 'test') return;

  const { sanitizeIp } = require('./logSanitizer');

  const logData = {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    duration: `${duration}ms`,
    ip: sanitizeIp(req.ip),
    userAgent: req.headers['user-agent'] || 'unknown',
  };

  const level = res.statusCode >= 500 ? LogLevel.ERROR :
                res.statusCode >= 400 ? LogLevel.WARN :
                LogLevel.INFO;

  const message = `${req.method} ${req.url} ${res.statusCode} ${duration}ms`;
  const formattedLog = formatLog(level, message, logData);

  if (level === LogLevel.ERROR) {
    console.error(formattedLog);
  } else if (level === LogLevel.WARN) {
    console.warn(formattedLog);
  } else {
    console.log(formattedLog);
  }
};

module.exports = {
  error,
  warn,
  info,
  debug,
  security,
  http,
  LogLevel,
};
