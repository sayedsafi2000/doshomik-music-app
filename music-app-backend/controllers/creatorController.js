const Music = require("../models/Music");
const mongoose = require("mongoose");

// Get creator stats
const getCreatorStats = async (req, res) => {
  try {
    const creatorId = req.user.id;
    console.log("Creator ID:", creatorId);

    if (!mongoose.Types.ObjectId.isValid(creatorId)) {
      return res.status(400).json({ message: "Invalid creator ID format" });
    }

    // Get total uploads
    const totalUploads = await Music.countDocuments({ uploadedBy: creatorId });
    console.log("Total uploads:", totalUploads);

    // Get total downloads across all creator's songs
    const totalDownloads = await Music.aggregate([
      { $match: { uploadedBy: new mongoose.Types.ObjectId(creatorId) } },
      { $group: { _id: null, total: { $sum: "$downloadCount" } } }
    ]);
    console.log("Total downloads aggregation result:", totalDownloads);

    // Get total listens (we'll use download count as a proxy for now)
    const totalListens = totalDownloads[0]?.total || 0;

    // Calculate average rating (for now, we'll use a placeholder since rating system isn't implemented)
    const averageRating = 0;

    res.json({
      totalUploads,
      totalDownloads: totalDownloads[0]?.total || 0,
      averageRating,
      totalListens
    });
  } catch (error) {
    console.error("Error fetching creator stats:", error);
    res.status(500).json({ 
      message: "Error fetching creator stats",
      error: error.message 
    });
  }
};

module.exports = {
  getCreatorStats
};