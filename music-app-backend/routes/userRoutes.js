const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const {
  getUserProfile,
  updateUserProfile,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  downloadSong
} = require("../controllers/userController");

// Get user profile
router.get("/profile", auth, getUserProfile);

// Update user profile
router.put("/update", auth, updateUserProfile);

// Add song to Wishlist
router.post("/wishlist/add/:id", auth, addToWishlist);

// Remove song from Wishlist
router.delete("/wishlist/remove/:id", auth, removeFromWishlist);

// Get full Wishlist with song data
router.get("/wishlist", auth, getWishlist);

// Download song
router.post("/download/:id", auth, downloadSong);

module.exports = router;