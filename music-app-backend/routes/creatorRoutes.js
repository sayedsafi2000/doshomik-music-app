const express = require("express");
const router = express.Router();
const { getCreatorStats } = require("../controllers/creatorController");
const auth = require("../middlewares/auth");
const checkRole = require("../middlewares/role");

// Get creator stats
router.get("/stats", auth, checkRole(["creator"]), getCreatorStats);

module.exports = router; 