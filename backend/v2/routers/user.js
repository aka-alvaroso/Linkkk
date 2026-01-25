const express = require("express");
const router = express.Router();
const { auth, authUser } = require("../middlewares/auth");
const { authLimiter } = require("../middlewares/security");
const {
  updateUser,
  deleteUserData,
  deleteUser,
} = require("../controllers/user");

// All user endpoints require rate limiting for security
router.put("/", auth, authUser, authLimiter, updateUser);
router.delete("/data", auth, authUser, authLimiter, deleteUserData);
router.delete("/", auth, authUser, authLimiter, deleteUser);

module.exports = router;
