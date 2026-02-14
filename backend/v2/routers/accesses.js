const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const { getLinkAccessesLimiter } = require("../middlewares/security");
const { getLinkAccesses, getDemoAccesses } = require("../controllers/accesses");

router.get("/demo/:shortUrl", getLinkAccessesLimiter, getDemoAccesses);
router.get("/link/:shortUrl", auth, getLinkAccessesLimiter, getLinkAccesses);

module.exports = router;
