const express = require("express");
const router = express.Router();
const { auth, authUser } = require("../middlewares/auth");
const {
  updateUser,
  deleteUserData,
  deleteUser,
  generateApiKey,
  resetApiKey,
} = require("../controllers/user");

router.put("/", auth, authUser, updateUser);
router.delete("/data", auth, authUser, deleteUserData);
router.delete("/", auth, authUser, deleteUser);
router.post("/api-key", auth, authUser, generateApiKey);
router.delete("/api-key", auth, authUser, resetApiKey);

module.exports = router;
