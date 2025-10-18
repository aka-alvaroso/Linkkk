const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const {
  createLinkLimiter,
  getLinksLimiter,
  updateLinkLimiter,
} = require("../middlewares/security");

const {
  createLink,
  getLink,
  getAllLinks,
  updateLink,
  deleteLink,
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

// Link Rules routes (nested under /link/:shortUrl/rules)
router.post("/:shortUrl/rules", auth, createLinkRule);
router.get("/:shortUrl/rules", auth, getLinkRules);
router.get("/:shortUrl/rules/:ruleId", auth, getLinkRule);
router.put("/:shortUrl/rules/:ruleId", auth, updateLinkRule);
router.delete("/:shortUrl/rules/:ruleId", auth, deleteLinkRule);
router.post("/:shortUrl/rules/batch", auth, createMultipleLinkRules);

module.exports = router;
