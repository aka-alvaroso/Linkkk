/**
 * Custom Application Error Class
 *
 * Extends the native Error class to include:
 * - Error code for programmatic handling
 * - HTTP status code
 * - Additional context for debugging
 * - Timestamp for logging
 */
class AppError extends Error {
  constructor(errorObj, context = {}) {
    super(errorObj.message);

    this.name = 'AppError';
    this.code = errorObj.code;
    this.statusCode = errorObj.statusCode;
    this.userMessage = errorObj.userMessage || errorObj.message;
    this.retryable = errorObj.retryable || false;
    this.context = context;
    this.timestamp = new Date().toISOString();

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Convert error to JSON for API responses
   */
  toJSON() {
    return {
      success: false,
      code: this.code,
      message: this.userMessage,
      ...(process.env.ENV === 'development' && {
        stack: this.stack,
        context: this.context
      })
    };
  }

  /**
   * Convert error to log format
   */
  toLogFormat() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      context: this.context,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

module.exports = AppError;
