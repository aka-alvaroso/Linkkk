const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const { getLinkAccessesLimiter } = require("../middlewares/security");
const { getLinkAccesses } = require("../controllers/accesses");

router.get("/link/:shortUrl", auth, getLinkAccessesLimiter, getLinkAccesses);

module.exports = router;
