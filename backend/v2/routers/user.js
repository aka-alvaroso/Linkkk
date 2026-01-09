const express = require("express");
const router = express.Router();
const { auth, authUser } = require("../middlewares/auth");
const {
  updateUser,
  deleteUserData,
  deleteUser,
} = require("../controllers/user");

router.put("/", auth, authUser, updateUser);
router.delete("/data", auth, authUser, deleteUserData);
router.delete("/", auth, authUser, deleteUser);

module.exports = router;
