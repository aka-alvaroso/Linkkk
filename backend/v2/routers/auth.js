const express = require("express");
const router = express.Router();
const { auth, authGuest, optionalGuest, optionalAuth } = require("../middlewares/auth");
const {
  authLimiter,
  loginLimiter,
  registerLimiter,
  guestLimiter,
} = require("../middlewares/security");
const {
  validateSession,
  createGuestSession,
  register,
  login,
  logout,
} = require("../controllers/auth");

router.get("/validate", authLimiter, optionalAuth, validateSession);
router.post("/logout", authLimiter, auth, logout);

router.post("/guest", guestLimiter, createGuestSession);
router.post("/register", registerLimiter, optionalGuest, register);
router.post("/login", loginLimiter, optionalGuest, login);

module.exports = router;
