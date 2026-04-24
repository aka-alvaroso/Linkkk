const express = require("express");
const router = express.Router();
const { auth, authUser } = require("../middlewares/auth");
const {
  getLinksLimiter,
  createTagLimiter,
  updateTagLimiter,
  deleteRuleLimiter,
} = require("../middlewares/security");
const { getTags, createTag, updateTag, deleteTag, assignTagsToLink } = require("../controllers/tag");

// Tags are only available to authenticated users (no guests)
router.get("/", auth, authUser, getLinksLimiter, getTags);
router.post("/", auth, authUser, createTagLimiter, createTag);
router.put("/:tagId", auth, authUser, updateTagLimiter, updateTag);
router.delete("/:tagId", auth, authUser, deleteRuleLimiter, deleteTag);

// Assign tags to a link
router.put("/link/:linkId", auth, authUser, updateTagLimiter, assignTagsToLink);

module.exports = router;
