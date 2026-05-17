const express = require("express");
const router = express.Router();
const { auth, authUser } = require("../middlewares/auth");
const { getDomains, addDomain, verifyDomain, deleteDomain } = require("../controllers/domain");

router.get("/", auth, authUser, getDomains);
router.post("/", auth, authUser, addDomain);
router.post("/:domainId/verify", auth, authUser, verifyDomain);
router.delete("/:domainId", auth, authUser, deleteDomain);

module.exports = router;
