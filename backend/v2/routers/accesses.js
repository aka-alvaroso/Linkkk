const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const { getLinkAccessesLimiter } = require("../middlewares/security");
const { getLinkAccesses, getDemoAccesses, getLinkStats } = require("../controllers/accesses");

router.get("/demo/:shortUrl", getLinkAccessesLimiter, getDemoAccesses);
router.get("/link/:shortUrl/stats", auth, getLinkAccessesLimiter, getLinkStats);
router.get("/link/:shortUrl", auth, getLinkAccessesLimiter, getLinkAccesses);

module.exports = router;
