// routes/adminRoutes.js
const express = require("express");
const router = express.Router();
const { verifyToken, isAdmin } = require("../middlewares/authMiddleware");
const {
  getAllUsers,
  deleteUser,
  toggleCreatorStatus,
  getAllMusic,
  deleteMusic,
  getStats,
  getUserDetails
} = require("../controllers/adminController");

// User management routes
router.get("/users", verifyToken, isAdmin, getAllUsers);
router.get("/users/:userId", verifyToken, isAdmin, getUserDetails);
router.delete("/users/:userId", verifyToken, isAdmin, deleteUser);
router.patch("/users/:userId/toggle-creator", verifyToken, isAdmin, toggleCreatorStatus);

// Music management routes
router.get("/music", verifyToken, isAdmin, getAllMusic);
router.delete("/music/:musicId", verifyToken, isAdmin, deleteMusic);

// Stats route
router.get("/stats", verifyToken, isAdmin, getStats);

module.exports = router;