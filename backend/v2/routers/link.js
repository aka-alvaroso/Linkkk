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

router.post("/", auth, createLinkLimiter, createLink);
router.get("/:shortUrl", auth, getLink);
router.get("/", auth, getLinksLimiter, getAllLinks);
router.put("/:shortUrl", auth, updateLinkLimiter, updateLink);
router.delete("/:shortUrl", auth, deleteLink);

module.exports = router;
