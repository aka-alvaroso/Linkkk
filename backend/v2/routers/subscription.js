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

// Webhook endpoint (NO auth - Stripe calls this)
// This must be registered BEFORE body parsing middleware
router.post("/webhook", handleWebhook);

// All other subscription routes require user authentication (not guest)
// First apply auth (sets req.user from JWT), then authUser (verifies it's a user not guest)
router.use(auth);
router.use(authUser);

router.get("/status", getStatus);
router.post("/cancel", cancelSubscription);
router.post("/create-checkout-session", createCheckoutSession);
router.post("/create-portal-session", createPortalSession);

// TODO: Remove before production
router.post("/dev/simulate-upgrade", simulateUpgrade);
router.post("/dev/simulate-cancel", simulateCancel);

module.exports = router;
