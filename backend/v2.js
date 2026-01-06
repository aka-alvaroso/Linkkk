const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { errorResponse } = require("./v2/utils/response");
const ERRORS = require("./v2/constants/errorCodes");
const AppError = require("./v2/utils/AppError");
const planLimits = require("./v2/utils/limits");

// Load centralized configuration
const config = require("./v2/config/environment");

// Initialize Sentry FIRST (before any other code)
const sentryService = require("./v2/services/sentry");
sentryService.initializeSentry();

// Routers
const authRouter = require("./v2/routers/auth");
const linkRouter = require("./v2/routers/link");
const accessesRouter = require("./v2/routers/accesses");
const userRouter = require("./v2/routers/user");
const subscriptionRouter = require("./v2/routers/subscription");

// Controllers
const { redirectLink } = require("./v2/controllers/link");

const app = express();
const PORT = config.server.port;

// Trust proxy - Required when behind nginx reverse proxy
app.set("trust proxy", true);

// Sentry request handler - MUST be first middleware
app.use(sentryService.requestHandler());
app.use(sentryService.tracingHandler());

// Helmet configuration - adjusted for environment
const helmetConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  noSniff: true,
  xssFilter: true,
};

// Only enable HSTS in production
if (config.env.isProduction) {
  helmetConfig.hsts = {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  };
}

app.use(helmet(helmetConfig));

// SECURITY: Additional security headers
app.use((req, res, next) => {
  // Restrict browser features
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );

  // SECURITY: Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // SECURITY: Prevent downloads from opening automatically in IE
  res.setHeader("X-Download-Options", "noopen");

  // SECURITY: Control DNS prefetching
  res.setHeader("X-DNS-Prefetch-Control", "off");

  next();
});

// General rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.env.isDevelopment ? 1000 : 500,
  handler: (req, res, next, options) => {
    return errorResponse(res, ERRORS.RATE_LIMIT_EXCEEDED);
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
});

app.use(generalLimiter);

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // In development, allow all localhost origins
    if (config.env.isDevelopment) {
      if (
        origin.startsWith("http://localhost") ||
        origin.startsWith("http://127.0.0.1")
      ) {
        return callback(null, true);
      }
    }

    // Check if origin is in allowed list
    if (config.frontend.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Reject all other origins
    callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "guest-token",
    "X-CSRF-Token",
    "CSRF-Token",
  ],
  credentials: true,
  exposedHeaders: ["X-Request-ID"],
};

app.use(cors(corsOptions));
app.use(cookieParser());

// Stripe webhook needs raw body for signature verification
// Apply raw body parser for webhook endpoint ONLY
app.use(
  "/subscription/webhook",
  express.raw({ type: "application/json" })
);

// Apply JSON parser for all OTHER routes (skip webhook)
app.use((req, res, next) => {
  if (req.path === "/subscription/webhook") {
    return next();
  }
  return express.json({ limit: "1mb" })(req, res, next);
});

app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// SECURITY: Content-Type validation (VUL-009 fix)
const { validateContentType } = require("./v2/middlewares/contentType");
// Skip validation for Stripe webhook (needs raw body)
app.use((req, res, next) => {
  if (req.path === "/subscription/webhook") {
    return next();
  }
  return validateContentType(req, res, next);
});

// SECURITY: JSON depth and complexity validation (prevents DoS attacks)
const {
  validateJsonDepth,
  validateJsonKeys,
} = require("./v2/middlewares/jsonDepthValidator");
// Skip JSON validation for Stripe webhook (needs raw body)
app.use((req, res, next) => {
  if (req.path === "/subscription/webhook") {
    return next();
  }
  validateJsonDepth(10)(req, res, (err) => {
    if (err) return next(err);
    validateJsonKeys(1000)(req, res, next);
  });
});

// CSRF Protection
const {
  csrfTokenGenerator,
  csrfProtection,
  getCsrfToken,
} = require("./v2/middlewares/csrf");

// Generate CSRF token for all requests
app.use(csrfTokenGenerator);

// Endpoint to get CSRF token (for SPAs)
app.get("/csrf-token", getCsrfToken);

app.get("/status", (req, res) => {
  res.send("Server running");
});

// API routes (must be before redirect catch-all)
// CSRF protection applied to state-changing routes
app.use("/auth", csrfProtection, authRouter);
app.use("/link", csrfProtection, linkRouter);
app.use("/accesses", accessesRouter); // GET only, no CSRF needed
app.use("/user", csrfProtection, userRouter);

// Subscription routes - CSRF applied conditionally (webhook excluded in router)
app.use("/subscription", (req, res, next) => {
  // Skip CSRF for webhook endpoint (Stripe calls this)
  if (req.path === "/webhook") {
    return next();
  }
  return csrfProtection(req, res, next);
}, subscriptionRouter);

// Public redirect endpoint (LAST - catches everything else)
app.get("/r/:shortUrl", redirectLink);

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

// 404 Handler - Route not found
app.use((req, res, next) => {
  return errorResponse(res, {
    code: "ROUTE_NOT_FOUND",
    message: "Route not found",
    statusCode: 404,
  });
});

// Sentry error handler - MUST be before other error handlers
app.use(sentryService.errorHandler());

// Global Error Handler
app.use((err, req, res, next) => {
  // SECURITY: Sanitize error logs to prevent PII leaks (GDPR compliance)
  const { sanitizeError } = require("./v2/utils/logSanitizer");
  const errorLog = sanitizeError(err, req);

  console.error("Error:", errorLog);

  // Handle AppError instances
  if (err instanceof AppError) {
    return errorResponse(res, {
      code: err.code,
      message: err.userMessage,
      statusCode: err.statusCode,
    });
  }

  // Handle Prisma errors
  if (err.code && err.code.startsWith("P")) {
    console.error("Prisma error:", err.code, err.meta);
    return errorResponse(res, ERRORS.DATABASE_ERROR);
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return errorResponse(res, ERRORS.UNAUTHORIZED);
  }

  // Handle Zod validation errors
  if (err.name === "ZodError") {
    const issues = err.issues.map((issue) => ({
      field: issue.path[0],
      message: issue.message,
    }));
    return errorResponse(res, ERRORS.INVALID_DATA, issues);
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return errorResponse(res, {
      code: "INVALID_JSON",
      message: "Invalid JSON in request body",
      statusCode: 400,
    });
  }

  // Default to internal server error
  return errorResponse(res, ERRORS.INTERNAL_ERROR);
});

// ============================================================================
// PROCESS ERROR HANDLERS
// ============================================================================

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  // In production, you might want to send this to a logging service
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  // Log the error and exit gracefully
  process.exit(1);
});

// ============================================================================
// START SERVER
// ============================================================================

// Only start server if not in test mode
if (!config.env.isTest) {
  // Start scheduled jobs
  const { startCleanupJob } = require("./v2/jobs/cleanupGuestLinks");
  const { startSyncJob } = require("./v2/jobs/syncSubscriptions");

  startCleanupJob();
  startSyncJob();

  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${config.env.nodeEnv}`);
    console.log(`🌐 Frontend: ${config.frontend.url}`);
    console.log(
      `🔒 CORS: ${
        config.env.isDevelopment
          ? "Development (permissive)"
          : "Production (strict)"
      }`
    );
    console.log(
      `⏱️  Rate limits: ${
        config.env.isDevelopment
          ? "Development (relaxed)"
          : "Production (strict)"
      }`
    );
    console.log(
      `🧹 Cleanup job: Guest links (${planLimits.guest.linkExpiration} days) - Daily at 3:00 AM`
    );
    console.log(`🔄 Sync job: Subscriptions & Stripe events - Every 30 minutes\n`);
  });
}

module.exports = app;
