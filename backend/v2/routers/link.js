const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const {
  createLinkLimiter,
  getLinksLimiter,
  updateLinkLimiter,
  passwordVerifyLimiter,
  passwordVerifyGlobalLimiter,
  createRuleLimiter,
  updateRuleLimiter,
  deleteRuleLimiter,
} = require("../middlewares/security");

const {
  createLink,
  getLink,
  getAllLinks,
  updateLink,
  deleteLink,
  verifyPasswordGate,
} = require("../controllers/link");

const {
  createLinkRule,
  getLinkRules,
  getLinkRule,
  updateLinkRule,
  deleteLinkRule,
  createMultipleLinkRules,
} = require("../controllers/linkRules");

// Link routes
router.post("/", auth, createLinkLimiter, createLink);
router.get("/:shortUrl", auth, getLink);
router.get("/", auth, getLinksLimiter, getAllLinks);
router.put("/:shortUrl", auth, updateLinkLimiter, updateLink);
router.delete("/:shortUrl", auth, deleteLink);

// Password verification (public endpoint - no auth required)
// SECURITY: Apply both per-IP and global rate limiters to prevent brute force
router.post(
  "/:shortUrl/verify-password",
  passwordVerifyGlobalLimiter, // Apply global limit first
  passwordVerifyLimiter, // Then per-IP limit
  verifyPasswordGate
);

// Link Rules routes (nested under /link/:shortUrl/rules)
router.post("/:shortUrl/rules", auth, createRuleLimiter, createLinkRule);
router.get("/:shortUrl/rules", auth, getLinkRules);
router.get("/:shortUrl/rules/:ruleId", auth, getLinkRule);
router.put("/:shortUrl/rules/:ruleId", auth, updateRuleLimiter, updateLinkRule);
router.delete("/:shortUrl/rules/:ruleId", auth, deleteRuleLimiter, deleteLinkRule);
router.post("/:shortUrl/rules/batch", auth, createRuleLimiter, createMultipleLinkRules);

module.exports = router;
