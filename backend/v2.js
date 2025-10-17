const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { errorResponse } = require("./v2/utils/response");
const ERRORS = require("./v2/constants/errorCodes");
const AppError = require("./v2/utils/AppError");

// Routers
const authRouter = require("./v2/routers/auth");
const linkRouter = require("./v2/routers/link");
const accessesRouter = require("./v2/routers/accesses");
const userRouter = require("./v2/routers/user");

// Controllers
const { redirectLink } = require("./v2/controllers/link");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  helmet({
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
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    noSniff: true,
    xssFilter: true,
  })
);

app.use((req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );
  next();
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.ENV === "development" ? 1000 : 500,
  handler: (req, res, next, options) => {
    return errorResponse(res, ERRORS.RATE_LIMIT_EXCEEDED);
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
});

app.use(generalLimiter);

app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "guest-token"],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.get("/status", (req, res) => {
  res.send("Server running");
});

// API routes (must be before redirect catch-all)
app.use("/auth", authRouter);
app.use("/link", linkRouter);
app.use("/accesses", accessesRouter);
app.use("/user", userRouter);

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

// Global Error Handler
app.use((err, req, res, next) => {
  // Log error with context for debugging
  const errorLog = {
    timestamp: new Date().toISOString(),
    message: err.message,
    code: err.code,
    url: req.url,
    method: req.method,
    userId: req.user?.id || null,
    guestId: req.guest?.guestSessionId || null,
  };

  // Only log stack trace in development
  if (process.env.ENV === "development") {
    errorLog.stack = err.stack;
    errorLog.context = err.context;
  }

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
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Environment: ${process.env.ENV || "development"}`);
  });
}

module.exports = app;
