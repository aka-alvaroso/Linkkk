const express = require("express");
const router = express.Router();
const {
  createCheckoutSession,
  createPaymentIntent,
} = require("../controllers/stripe");
const authenticate = require("../middlewares/authenticate");
const userAuthenticate = require("../middlewares/userAuthenticate");

router.post(
  "/create-checkout-session",
  authenticate,
  userAuthenticate,
  createCheckoutSession
);

router.post(
  "/create-payment-intent",
  authenticate,
  userAuthenticate,
  createPaymentIntent
);

module.exports = router;
