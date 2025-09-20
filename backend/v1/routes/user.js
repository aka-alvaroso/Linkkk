const express = require("express");
const router = express.Router();

const { getUserById, updateUser, deleteUser } = require("../controllers/user");

router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
