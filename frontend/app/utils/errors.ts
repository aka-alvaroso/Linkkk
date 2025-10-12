/**
 * Custom Error Classes for Frontend
 *
 * These error classes provide structured error handling
 * with specific information for different error scenarios.
 */

/**
 * HTTP Error
 *
 * Thrown when an HTTP request fails with a specific status code.
 * Contains the error code from the backend for specific handling.
 */
export class HttpError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public retryable: boolean = false,
    public validation?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'HttpError';

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }
  }

  /**
   * Check if this is an authentication error
   */
  isAuthError(): boolean {
    return this.statusCode === 401 || this.code === 'UNAUTHORIZED';
  }

  /**
   * Check if this is a permission error
   */
  isPermissionError(): boolean {
    return this.statusCode === 403;
  }

  /**
   * Check if this is a not found error
   */
  isNotFoundError(): boolean {
    return this.statusCode === 404;
  }

  /**
   * Check if this is a validation error
   */
  isValidationError(): boolean {
    return this.statusCode === 400 && this.code === 'INVALID_DATA';
  }

  /**
   * Check if this is a server error
   */
  isServerError(): boolean {
    return this.statusCode >= 500;
  }
}

/**
 * Network Error
 *
 * Thrown when a network request fails due to connectivity issues,
 * timeouts, or other network-related problems.
 */
export class NetworkError extends Error {
  public retryable: boolean = true;

  constructor(message: string = 'Network error. Please check your connection.') {
    super(message);
    this.name = 'NetworkError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NetworkError);
    }
  }
}

/**
 * Timeout Error
 *
 * Thrown when a request takes too long to complete.
 */
export class TimeoutError extends NetworkError {
  constructor(message: string = 'Request timeout. Please try again.') {
    super(message);
    this.name = 'TimeoutError';
  }
}
