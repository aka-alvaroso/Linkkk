const express = require("express");
const router = express.Router();
const {
  getStatus,
  cancelSubscription,
  createCheckoutSession,
  createPortalSession,
  handleWebhook,
  simulateUpgrade,
  simulateCancel,
  testTelegram,
} = require("../controllers/subscription");
const { auth, authUser } = require("../middlewares/auth");
const {
  subscriptionRateLimiter,
  subscriptionStatusRateLimiter
} = require("../middlewares/rateLimiter");

// Webhook endpoint (NO auth - Stripe calls this)
// This must be registered BEFORE body parsing middleware
router.post("/webhook", handleWebhook);

// Development testing endpoints - ONLY available in non-production
// Protected with auth + authUser to prevent abuse
const config = require("../config/environment");
if (!config.env.isProduction) {
  router.post("/dev/simulate-upgrade", auth, authUser, simulateUpgrade);
  router.post("/dev/simulate-cancel", auth, authUser, simulateCancel);
  router.post("/dev/test-telegram", auth, authUser, testTelegram);
}

// All other subscription routes require user authentication (not guest)
// First apply auth (sets req.user from JWT), then authUser (verifies it's a user not guest)
router.use(auth);
router.use(authUser);

// Status endpoint - lighter rate limit
router.get("/status", subscriptionStatusRateLimiter, getStatus);

// Critical payment endpoints - strict rate limiting
router.post("/cancel", subscriptionRateLimiter, cancelSubscription);
router.post("/create-checkout-session", subscriptionRateLimiter, createCheckoutSession);
router.post("/create-portal-session", subscriptionRateLimiter, createPortalSession);

module.exports = router;
