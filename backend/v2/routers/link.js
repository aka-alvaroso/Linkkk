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
  logoUploadLimiter,
} = require("../middlewares/security");

const {
  upload,
  handleMulterError,
  validateRealMimeType,
  validateImageDimensions,
} = require("../middlewares/upload");

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

const {
  getQRConfig,
  updateQRConfig,
  uploadQRLogo,
  deleteQRLogo,
} = require("../controllers/qr");

// Link routes
router.post("/", auth, createLinkLimiter, createLink);
router.get("/:shortUrl", auth, getLinksLimiter, getLink);
router.get("/", auth, getLinksLimiter, getAllLinks);
router.put("/:shortUrl", auth, updateLinkLimiter, updateLink);
router.delete("/:shortUrl", auth, deleteRuleLimiter, deleteLink);

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
router.get("/:shortUrl/rules", auth, getLinksLimiter, getLinkRules);
router.get("/:shortUrl/rules/:ruleId", auth, getLinksLimiter, getLinkRule);
router.put("/:shortUrl/rules/:ruleId", auth, updateRuleLimiter, updateLinkRule);
router.delete("/:shortUrl/rules/:ruleId", auth, deleteRuleLimiter, deleteLinkRule);
router.post("/:shortUrl/rules/batch", auth, createRuleLimiter, createMultipleLinkRules);

// QR Code routes
router.get("/:shortUrl/qr", auth, getLinksLimiter, getQRConfig);
router.put("/:shortUrl/qr", auth, updateLinkLimiter, updateQRConfig);

// QR Logo upload route
router.post(
  "/:shortUrl/qr/logo",
  auth,
  logoUploadLimiter,
  upload.single("logo"),
  handleMulterError,
  validateRealMimeType,
  validateImageDimensions,
  uploadQRLogo
);

// QR Logo delete route
router.delete("/qr/logo", auth, deleteRuleLimiter, deleteQRLogo);

module.exports = router;
