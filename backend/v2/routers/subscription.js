const express = require("express");
const router = express.Router();
const {
  getStatus,
  cancelSubscription,
  simulateUpgrade,
  simulateCancel,
} = require("../controllers/subscription");
const { auth, authUser } = require("../middlewares/auth");

// All subscription routes require user authentication (not guest)
// First apply auth (sets req.user from JWT), then authUser (verifies it's a user not guest)
router.use(auth);
router.use(authUser);

router.get("/status", getStatus);
router.post("/cancel", cancelSubscription);

// TODO: Remove
router.post("/dev/simulate-upgrade", simulateUpgrade);
// TODO: Remove
router.post("/dev/simulate-cancel", simulateCancel);

module.exports = router;
