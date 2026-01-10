const rateLimit = require("express-rate-limit");
const { errorResponse } = require("../utils/response");
const ERRORS = require("../constants/errorCodes");
const config = require("../config/environment");

// Handler simple para rate limiting
const rateLimitHandler = (req, res, next, options) => {
  return errorResponse(res, ERRORS.RATE_LIMIT_EXCEEDED);
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.env.isDevelopment ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  // SECURITY: Use only IP for rate limiting (VUL-006 fix)
  // User-Agent can be easily spoofed to bypass limits
  keyGenerator: (req) => {
    return req.ip;
  },
  handler: rateLimitHandler,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.env.isDevelopment ? 1000 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const identifier = req.body?.usernameOrEmail || "";
    return req.ip + ":" + identifier;
  },
  handler: rateLimitHandler,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: config.env.isDevelopment ? 1000 :5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: rateLimitHandler,
});

const guestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: config.env.isDevelopment ? 1000 :10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: rateLimitHandler,
});

// Link limiters
const createLinkLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: config.env.isDevelopment ? 1000 :50,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: rateLimitHandler,
});

const updateLinkLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: config.env.isDevelopment ? 1000 :50,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: rateLimitHandler,
});

const getLinksLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: config.env.isDevelopment ? 1000 :100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: rateLimitHandler,
});

const linkValidatorLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: config.env.isDevelopment ? 1000 :50,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: rateLimitHandler,
});

// SECURITY: Strict rate limiting for password verification to prevent brute force
// 3 attempts per hour per IP+link (prevents targeted attacks)
const passwordVerifyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: config.env.isDevelopment ? 1000 :3, // Reduced from 5 to 3
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const shortUrl = req.params.shortUrl || "";
    return req.ip + ":" + shortUrl;
  },
  handler: rateLimitHandler,
});

// SECURITY: Global limit for password verification per link (prevents distributed attacks)
// 20 attempts per hour per link from all IPs combined
const passwordVerifyGlobalLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: config.env.isDevelopment ? 1000 :20, // Global limit per link
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const shortUrl = req.params.shortUrl || "";
    return `global:${shortUrl}`;
  },
  handler: (req, res, next, options) => {
    return errorResponse(res, {
      code: 'PASSWORD_VERIFY_LIMIT_EXCEEDED',
      message: 'Too many password attempts for this link. Please try again later.',
      statusCode: 429,
    });
  },
});

const getLinkAccessesLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: config.env.isDevelopment ? 1000 :100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: rateLimitHandler,
});

// SECURITY: OAuth-specific rate limiter
// More permissive than authLimiter because:
// - Users may click OAuth button multiple times (UX)
// - Google may retry callbacks on timeout
// - No brute force risk (Google handles authentication)
const oauthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.env.isDevelopment ? 1000 : 30, // 30 OAuth attempts per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: rateLimitHandler,
});

// Rule CRUD operation limiters
const createRuleLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: config.env.isDevelopment ? 1000 :100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip + ":" + (req.user?.id || req.guest?.guestSessionId),
  handler: rateLimitHandler,
});

const updateRuleLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: config.env.isDevelopment ? 1000 :200,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip + ":" + (req.user?.id || req.guest?.guestSessionId),
  handler: rateLimitHandler,
});

const deleteRuleLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: config.env.isDevelopment ? 1000 :200,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip + ":" + (req.user?.id || req.guest?.guestSessionId),
  handler: rateLimitHandler,
});

module.exports = {
  authLimiter,
  loginLimiter,
  registerLimiter,
  guestLimiter,
  oauthLimiter,
  createLinkLimiter,
  updateLinkLimiter,
  getLinksLimiter,
  linkValidatorLimiter,
  passwordVerifyLimiter,
  passwordVerifyGlobalLimiter,
  getLinkAccessesLimiter,
  createRuleLimiter,
  updateRuleLimiter,
  deleteRuleLimiter,
};
