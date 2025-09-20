const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const userAuthenticate = require("../middlewares/userAuthenticate");
const validate = require("../middlewares/validate");
const { createLinkSchema, deleteLinkSchema } = require("../validations/public");

const {
  createApiKey,
  createLink,
  deleteLink,
} = require("../controllers/public");

router.post("/create-api-key", authenticate, userAuthenticate, createApiKey);
router.post("/create", validate(createLinkSchema), createLink);
router.delete("/delete", validate(deleteLinkSchema), deleteLink);

module.exports = router;
