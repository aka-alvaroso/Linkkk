const express = require("express");
const router = express.Router();
const { auth, authGuest, optionalGuest, optionalAuth } = require("../middlewares/auth");
const {
  authLimiter,
  loginLimiter,
  registerLimiter,
  guestLimiter,
  oauthLimiter,
} = require("../middlewares/security");
const {
  validateSession,
  createGuestSession,
  register,
  login,
  logout,
  googleAuth,
  googleCallback,
  githubAuth,
  githubCallback,
  linkOAuthAccount,
} = require("../controllers/auth");

router.get("/validate", authLimiter, optionalAuth, validateSession);
router.post("/logout", authLimiter, auth, logout);

router.post("/guest", guestLimiter, createGuestSession);
router.post("/register", registerLimiter, optionalGuest, register);
router.post("/login", loginLimiter, optionalGuest, login);

// OAuth routes
router.get("/oauth/google", oauthLimiter, googleAuth);
router.get("/callback/google", oauthLimiter, optionalGuest, googleCallback);
router.get("/oauth/github", oauthLimiter, githubAuth);
router.get("/callback/github", oauthLimiter, optionalGuest, githubCallback);
router.post("/link-oauth", loginLimiter, optionalGuest, linkOAuthAccount);

module.exports = router;
