/**
 * Winston Logger Utility
 * Professional logging with file rotation and structured output
 *
 * SECURITY: Prevents sensitive information leakage in production logs
 * and provides structured logging for better monitoring
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');

const ENV = process.env.ENV || 'development';
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Log levels
 */
const LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom format for console output (development)
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}`;
  })
);

// JSON format for file output (production)
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create Winston logger instance
const winstonLogger = winston.createLogger({
  level: ENV === 'production' ? 'info' : 'debug',
  format: jsonFormat,
  defaultMeta: { env: ENV },
  transports: [
    // Error logs - separate file
    new DailyRotateFile({
      filename: path.join(logsDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d', // Keep 14 days of error logs
      zippedArchive: true,
    }),

    // Combined logs - all levels
    new DailyRotateFile({
      filename: path.join(logsDir, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '7d', // Keep 7 days of combined logs
      zippedArchive: true,
    }),
  ],
});

// Add console transport in development
if (ENV !== 'production' || NODE_ENV === 'development') {
  winstonLogger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}

// Don't log anything in test environment
if (NODE_ENV === 'test') {
  winstonLogger.silent = true;
}

/**
 * Error logger
 * @param {string} message - Error message
 * @param {Object} meta - Additional metadata (error stack, context, etc.)
 */
const error = (message, meta = {}) => {
  winstonLogger.error(message, meta);
};

/**
 * Warning logger
 * @param {string} message - Warning message
 * @param {Object} meta - Additional metadata
 */
const warn = (message, meta = {}) => {
  winstonLogger.warn(message, meta);
};

/**
 * Info logger
 * @param {string} message - Info message
 * @param {Object} meta - Additional metadata
 */
const info = (message, meta = {}) => {
  winstonLogger.info(message, meta);
};

/**
 * Debug logger (only in development)
 * @param {string} message - Debug message
 * @param {Object} meta - Additional metadata
 */
const debug = (message, meta = {}) => {
  winstonLogger.debug(message, meta);
};

/**
 * Security event logger
 * Special logger for security-related events that should always be logged
 * @param {string} message - Security event message
 * @param {Object} meta - Additional metadata
 */
const security = (message, meta = {}) => {
  winstonLogger.error(message, {
    ...meta,
    security_event: true,
    type: 'SECURITY',
  });
};

/**
 * HTTP request logger
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} duration - Request duration in ms
 */
const http = (req, res, duration) => {
  const { sanitizeIp } = require('./logSanitizer');

  const logData = {
    method: req.method,
    url: req.url,
    status: res.statusCode,
    duration: `${duration}ms`,
    ip: sanitizeIp(req.ip),
    userAgent: req.headers['user-agent'] || 'unknown',
    type: 'HTTP',
  };

  const message = `${req.method} ${req.url} ${res.statusCode} ${duration}ms`;

  if (res.statusCode >= 500) {
    winstonLogger.error(message, logData);
  } else if (res.statusCode >= 400) {
    winstonLogger.warn(message, logData);
  } else {
    winstonLogger.info(message, logData);
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
  // Expose winston instance for advanced usage if needed
  winston: winstonLogger,
};
