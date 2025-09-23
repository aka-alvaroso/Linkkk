const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const {
  createLinkLimiter,
  getLinksLimiter,
  updateLinkLimiter,
  linkValidatorLimiter,
} = require("../middlewares/security");

const {
  createLink,
  getLink,
  getAllLinks,
  validateLinkPassword,
  updateLink,
  deleteLink,
} = require("../controllers/link");

router.post("/", auth, createLinkLimiter, createLink);
router.get("/:shortUrl", auth, getLink);
router.get("/", auth, getLinksLimiter, getAllLinks);
router.post("/:shortUrl/validate", linkValidatorLimiter, validateLinkPassword);
router.put("/:shortUrl", auth, updateLinkLimiter, updateLink);
router.delete("/:shortUrl", auth, deleteLink);

module.exports = router;
