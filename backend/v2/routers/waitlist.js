const express = require('express');
const router = express.Router();
const { joinWaitlist } = require('../controllers/waitlist');
const rateLimit = require('express-rate-limit');
const { errorResponse } = require('../utils/response');
const ERRORS = require('../constants/errorCodes');
const config = require('../config/environment');

// Rate limiter for waitlist endpoint
// Prevent abuse - 3 requests per hour per IP
const waitlistLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: config.env.isDevelopment ? 1000 : 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  handler: (req, res) => {
    return errorResponse(res, ERRORS.RATE_LIMIT_EXCEEDED);
  },
  skip: (req) => process.env.NODE_ENV === 'test',
});

router.post('/', waitlistLimiter, joinWaitlist);

module.exports = router;
