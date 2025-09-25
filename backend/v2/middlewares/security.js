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

module.exports = {
  authLimiter,
  loginLimiter,
  registerLimiter,
  guestLimiter,
  createLinkLimiter,
  updateLinkLimiter,
  getLinksLimiter,
  linkValidatorLimiter,
};
