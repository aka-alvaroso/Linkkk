const rateLimit = require("express-rate-limit");
const { errorResponse } = require("../utils/response");
const ERRORS = require("../constants/errorCodes");

// Handler simple para rate limiting
const rateLimitHandler = (req, res, next, options) => {
  return errorResponse(res, ERRORS.RATE_LIMIT_EXCEEDED);
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.ENV === "development" ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip + ":" + (req.get("User-Agent") || "");
  },
  handler: rateLimitHandler,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.ENV === "development" ? 1000 : 5,
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
  max: process.env.ENV === "development" ? 1000 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: rateLimitHandler,
});

const guestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.ENV === "development" ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: rateLimitHandler,
});

// Link limiters
const createLinkLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.ENV === "development" ? 1000 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: rateLimitHandler,
});

const updateLinkLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.ENV === "development" ? 1000 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: rateLimitHandler,
});

const getLinksLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.ENV === "development" ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: rateLimitHandler,
});

const linkValidatorLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.ENV === "development" ? 1000 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: rateLimitHandler,
});

const passwordVerifyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    const shortUrl = req.params.shortUrl || "";
    return req.ip + ":" + shortUrl;
  },
  handler: rateLimitHandler,
});

const getLinkAccessesLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: process.env.ENV === "development" ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: rateLimitHandler,
});

// Rule CRUD operation limiters
const createRuleLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.ENV === "development" ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip + ":" + (req.user?.id || req.guest?.guestSessionId),
  handler: rateLimitHandler,
});

const updateRuleLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.ENV === "development" ? 1000 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip + ":" + (req.user?.id || req.guest?.guestSessionId),
  handler: rateLimitHandler,
});

const deleteRuleLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: process.env.ENV === "development" ? 1000 : 200,
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
  createLinkLimiter,
  updateLinkLimiter,
  getLinksLimiter,
  linkValidatorLimiter,
  passwordVerifyLimiter,
  getLinkAccessesLimiter,
  createRuleLimiter,
  updateRuleLimiter,
  deleteRuleLimiter,
};
