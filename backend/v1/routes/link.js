const express = require("express");
const authenticate = require("../middlewares/authenticate");
const userAuthenticate = require("../middlewares/userAuthenticate");
const router = express.Router();
const validate = require("../middlewares/validate");
const {
  createLinkSchema,
  shortCodeParamSchema,
  updateLinkSchema,
  deleteLinkSchema,
} = require("../validations/link");

const {
  createLink,
  getLinkDetails,
  getLinksByUserId,
  getLinkStats,
  updateLink,
  deleteLink,
} = require("../controllers/link");

router.post("/create", authenticate, validate(createLinkSchema), createLink);
router.get("/user", authenticate, getLinksByUserId);
router.get(
  "/:shortCode",
  authenticate,
  userAuthenticate,
  validate(shortCodeParamSchema),
  getLinkDetails
);
router.get(
  "/stats/:shortCode",
  authenticate,
  userAuthenticate,
  validate(shortCodeParamSchema),
  getLinkStats
);
router.put(
  "/update",
  authenticate,
  userAuthenticate,
  validate(updateLinkSchema),
  updateLink
);
router.delete("/delete", authenticate, validate(deleteLinkSchema), deleteLink);

module.exports = router;
