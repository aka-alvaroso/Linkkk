const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { errorResponse } = require("./v2/utils/response");
const ERRORS = require("./v2/constants/errorCodes");

// Routers
const authRouter = require("./v2/routers/auth");
const linkRouter = require("./v2/routers/link");

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
  })
);

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
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/status", (req, res) => {
  res.send("Server running");
});

// API routes (must be before redirect catch-all)
app.use("/auth", authRouter);
app.use("/link", linkRouter);

// Public redirect endpoint (LAST - catches everything else)
app.get("/:shortUrl", redirectLink);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
