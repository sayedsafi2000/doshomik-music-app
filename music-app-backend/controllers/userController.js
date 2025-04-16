const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-password")
      .populate({
        path: "downloadHistory.song",
        select: "title artist image category"
      });
    res.json({ user });
  } catch (error) {
    console.error("Get profile error:", error.message);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      user.password = hashed;
    }

    await user.save();
    res.json({ 
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      }
    });
  } catch (error) {
    console.error("Update profile error:", error.message);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// Add song to wishlist
const addToWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const songId = req.params.id;

    if (!user.wishlist.includes(songId)) {
      user.wishlist.push(songId);
      await user.save();
      return res.json({ message: "Added to wishlist" });
    }

    res.json({ message: "Already in wishlist" });
  } catch (error) {
    console.error("Add to wishlist error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove song from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const songId = req.params.id;

    user.wishlist = user.wishlist.filter(
      (id) => id.toString() !== songId
    );

    await user.save();
    res.json({ message: "Removed from wishlist" });
  } catch (error) {
    console.error("Remove from wishlist error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Get wishlist
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("wishlist");
    res.json({ wishlist: user.wishlist });
  } catch (error) {
    console.error("Fetch wishlist error:", error.message);
    res.status(500).json({ message: "Fetch failed" });
  }
};

// Download song
const downloadSong = async (req, res) => {
  try {
    const songId = req.params.id;
    const user = await User.findById(req.user.id);
    const Music = require("../models/Music");
    const song = await Music.findById(songId);

    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    // Add to download history
    user.downloadHistory.push({
      song: songId,
      downloadedAt: new Date()
    });

    // Increment download count
    song.downloadCount += 1;

    await user.save();
    await song.save();

    res.json({ 
      message: "Download successful",
      downloadUrl: song.tracks.find(track => track.type === "full")?.url
    });
  } catch (error) {
    console.error("Download error:", error.message);
    res.status(500).json({ message: "Download failed" });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  downloadSong
}; 