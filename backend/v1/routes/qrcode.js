const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const userAuthenticate = require("../middlewares/userAuthenticate");
const validate = require("../middlewares/validate");
const { createQrCodeSchema } = require("../validations/qrcode");

const qrCodeController = require("../controllers/qrcode");

router.post(
  "/create",
  authenticate,
  userAuthenticate,
  validate(createQrCodeSchema),
  qrCodeController.createQrCode
);

module.exports = router;
