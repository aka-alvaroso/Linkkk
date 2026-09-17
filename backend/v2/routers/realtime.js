const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const { stream } = require("../controllers/realtime");

router.get("/stream", auth, stream);

module.exports = router;
