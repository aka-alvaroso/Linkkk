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
} = require("../controllers/subscription");
const { auth, authUser } = require("../middlewares/auth");
const {
  subscriptionRateLimiter,
  subscriptionStatusRateLimiter
} = require("../middlewares/rateLimiter");

// Webhook endpoint (NO auth - Stripe calls this)
// This must be registered BEFORE body parsing middleware
router.post("/webhook", handleWebhook);

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

// TODO: Remove before production
router.post("/dev/simulate-upgrade", simulateUpgrade);
router.post("/dev/simulate-cancel", simulateCancel);

module.exports = router;
