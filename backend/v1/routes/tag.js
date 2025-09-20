const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const userAuthenticate = require("../middlewares/userAuthenticate");
const validate = require("../middlewares/validate");
const {
  createTagSchema,
  updateTagSchema,
  deleteTagSchema,
} = require("../validations/tag");

const tagController = require("../controllers/tag");

router.post(
  "/create",
  authenticate,
  userAuthenticate,
  validate(createTagSchema),
  tagController.createTag
);
router.put(
  "/update",
  authenticate,
  userAuthenticate,
  validate(updateTagSchema),
  tagController.updateTag
);
router.delete(
  "/delete",
  authenticate,
  userAuthenticate,
  validate(deleteTagSchema),
  tagController.deleteTag
);
router.get(
  "/user",
  authenticate,
  userAuthenticate,
  tagController.getTagsByUserId
);

module.exports = router;
