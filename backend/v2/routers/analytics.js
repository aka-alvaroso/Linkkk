const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const { getDailyClicks } = require("../controllers/analytics");

router.get("/clicks/daily", auth, getDailyClicks);

module.exports = router;
