const express = require("express");
const router = express.Router();
const { auth, authUser } = require("../middlewares/auth");
const {
  getLinksLimiter,
  createGroupLimiter,
  updateGroupLimiter,
  deleteRuleLimiter,
} = require("../middlewares/security");
const {
  getGroups,
  getGroup,
  createGroup,
  updateGroup,
  deleteGroup,
  moveLinkToGroup,
  removeLinkFromGroup,
} = require("../controllers/group");

// Groups are only available to authenticated users (no guests)
router.get("/", auth, authUser, getLinksLimiter, getGroups);
router.post("/", auth, authUser, createGroupLimiter, createGroup);
router.get("/:groupId", auth, authUser, getLinksLimiter, getGroup);
router.put("/:groupId", auth, authUser, updateGroupLimiter, updateGroup);
router.delete("/:groupId", auth, authUser, deleteRuleLimiter, deleteGroup);

// Link membership
router.post("/:groupId/links/:linkId", auth, authUser, updateGroupLimiter, moveLinkToGroup);
router.delete("/:groupId/links/:linkId", auth, authUser, deleteRuleLimiter, removeLinkFromGroup);

module.exports = router;
