/**
 * Rate Limiter Middleware
 * Protects payment and subscription endpoints from abuse
 */

const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for subscription/payment endpoints
 * Stricter limits to prevent abuse of Stripe API
 */
const subscriptionRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 requests per 15 minutes per IP
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many subscription requests. Please try again later.',
      statusCode: 429,
    },
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  skipSuccessfulRequests: false,
  skipFailedRequests: false,

  // Key generator: Use IP + userId for authenticated users
  keyGenerator: (req) => {
    if (req.user && req.user.id) {
      return `subscription_${req.ip}_${req.user.id}`;
    }
    return `subscription_${req.ip}`;
  },

  // Custom handler for when limit is exceeded
  handler: (req, res) => {
    console.log(`⚠️ Rate limit exceeded for ${req.ip} on ${req.path}`);

    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many subscription requests. Please try again in 15 minutes.',
        statusCode: 429,
        retryAfter: Math.ceil(req.rateLimit.resetTime / 1000), // seconds
      },
    });
  },
});

/**
 * More lenient rate limiter for status checks
 */
const subscriptionStatusRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Max 20 requests per minute
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many status check requests. Please slow down.',
      statusCode: 429,
    },
  },
  standardHeaders: true,
  legacyHeaders: false,

  keyGenerator: (req) => {
    if (req.user && req.user.id) {
      return `status_${req.ip}_${req.user.id}`;
    }
    return `status_${req.ip}`;
  },

  handler: (req, res) => {
    console.log(`⚠️ Rate limit exceeded for ${req.ip} on status check`);

    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again in a moment.',
        statusCode: 429,
      },
    });
  },
});

module.exports = {
  subscriptionRateLimiter,
  subscriptionStatusRateLimiter,
};
