const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const userAuthenticate = require("../middlewares/userAuthenticate");
const validate = require("../middlewares/validate");
const {
  createGroupSchema,
  updateGroupSchema,
  deleteGroupSchema,
} = require("../validations/group");

const groupController = require("../controllers/group");

router.post(
  "/create",
  authenticate,
  userAuthenticate,
  validate(createGroupSchema),
  groupController.createGroup
);
router.get(
  "/user",
  authenticate,
  userAuthenticate,
  groupController.getGroupsByUserId
);
router.put(
  "/update",
  authenticate,
  userAuthenticate,
  validate(updateGroupSchema),
  groupController.updateGroup
);
router.delete(
  "/delete",
  authenticate,
  userAuthenticate,
  validate(deleteGroupSchema),
  groupController.deleteGroup
);

module.exports = router;
