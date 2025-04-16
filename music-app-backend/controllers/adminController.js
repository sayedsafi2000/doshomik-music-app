const User = require("../models/User");
const Music = require("../models/Music");

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete all music uploaded by the user
    await Music.deleteMany({ uploadedBy: userId });
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    
    res.json({ message: "User and associated music deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Error deleting user" });
  }
};

// Toggle creator status
const toggleCreatorStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Toggle between 'user' and 'creator' roles
    user.role = user.role === "creator" ? "user" : "creator";
    await user.save();

    res.json({ message: "Creator status toggled successfully", user });
  } catch (error) {
    console.error("Error toggling creator status:", error);
    res.status(500).json({ message: "Error toggling creator status" });
  }
};

// Get all music
const getAllMusic = async (req, res) => {
  try {
    const music = await Music.find().populate("uploadedBy", "name email");
    res.json({ music });
  } catch (error) {
    console.error("Error fetching music:", error);
    res.status(500).json({ message: "Error fetching music" });
  }
};

// Delete music
const deleteMusic = async (req, res) => {
  try {
    const { musicId } = req.params;
    
    const music = await Music.findById(musicId);
    if (!music) {
      return res.status(404).json({ message: "Music not found" });
    }

    await Music.findByIdAndDelete(musicId);
    res.json({ message: "Music deleted successfully" });
  } catch (error) {
    console.error("Error deleting music:", error);
    res.status(500).json({ message: "Error deleting music" });
  }
};

// Get dashboard stats
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalCreators = await User.countDocuments({ role: "creator" });
    const totalMusic = await Music.countDocuments();
    const totalDownloads = await Music.aggregate([
      { $group: { _id: null, total: { $sum: "$downloadCount" } } }
    ]);

    res.json({
      totalUsers,
      totalCreators,
      totalMusic,
      totalDownloads: totalDownloads[0]?.total || 0
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ message: "Error fetching stats" });
  }
};

// Get user details
const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Get user's uploads
    const uploads = await Music.find({ uploadedBy: userId });
    
    // Get user's download history
    const downloadHistory = await Music.find({
      _id: { $in: user.downloadHistory.map(item => item.song) }
    });
    
    res.json({
      user,
      uploads,
      downloadHistory
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Error fetching user details" });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
  toggleCreatorStatus,
  getAllMusic,
  deleteMusic,
  getStats,
  getUserDetails
};