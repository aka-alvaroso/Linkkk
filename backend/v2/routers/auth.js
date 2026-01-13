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

// DEBUG: Temporary endpoint to check config (REMOVE IN PRODUCTION)
router.get("/debug/config", (req, res) => {
  const config = require("../config/environment");
  res.json({
    frontendUrl: config.frontend.url,
    env: config.env.nodeEnv,
    isProduction: config.env.isProduction,
  });
});

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
