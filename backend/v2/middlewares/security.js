const rateLimit = require("express-rate-limit");
const { errorResponse } = require("../utils/response");

// Handler personalizado para mantener formato consistente de respuestas
const rateLimitHandler = (req, res, next, options) => {
  return errorResponse(res, {
    code: options.code || "RATE_LIMIT_EXCEEDED",
    message: options.message || "Too many requests",
    statusCode: 429,
  });
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return req.ip + ":" + (req.get("User-Agent") || "");
  },
  handler: (req, res, next, options) => {
    return rateLimitHandler(req, res, next, {
      code: "AUTH_RATE_LIMIT_EXCEEDED",
      message: "Too many authentication attempts. Please try again later.",
    });
  },
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const identifier = req.body?.usernameOrEmail || "";
    return req.ip + ":" + identifier;
  },
  handler: (req, res, next, options) => {
    return rateLimitHandler(req, res, next, {
      code: "LOGIN_RATE_LIMIT_EXCEEDED",
      message:
        "Too many login attempts. Account temporarily locked. Please try again later.",
    });
  },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: (req, res, next, options) => {
    return rateLimitHandler(req, res, next, {
      code: "REGISTER_RATE_LIMIT_EXCEEDED",
      message: "Too many registration attempts. Please try again later.",
    });
  },
});

const guestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: (req, res, next, options) => {
    return rateLimitHandler(req, res, next, {
      code: "GUEST_RATE_LIMIT_EXCEEDED",
      message: "Too many guest session requests. Please try again later.",
    });
  },
});

module.exports = {
  authLimiter,
  loginLimiter,
  registerLimiter,
  guestLimiter,
};
