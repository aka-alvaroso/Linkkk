const express = require("express");
const router = express.Router();
const { auth, authGuest } = require("../middlewares/auth");
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

router.get("/validate", authLimiter, auth, validateSession);
router.post("/logout", authLimiter, auth, logout);

router.post("/guest", guestLimiter, createGuestSession);
router.post("/register", registerLimiter, auth, authGuest, register);
router.post("/login", loginLimiter, auth, authGuest, login);

module.exports = router;
