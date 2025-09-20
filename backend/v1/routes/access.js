const express = require("express");
const router = express.Router();

const { createAccess } = require("../controllers/access");

router.post("/create", createAccess);

module.exports = router;
