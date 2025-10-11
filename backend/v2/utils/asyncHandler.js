/**
 * Async Handler Wrapper
 *
 * Wraps async route handlers to automatically catch errors
 * and pass them to the global error handler middleware.
 *
 * This eliminates the need for try-catch blocks in every controller.
 *
 * Usage:
 *   const asyncHandler = require('./utils/asyncHandler');
 *
 *   const myController = asyncHandler(async (req, res) => {
 *     // Your async code here
 *     // Any errors thrown will be caught automatically
 *   });
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
