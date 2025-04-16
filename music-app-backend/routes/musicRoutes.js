const express = require("express");
const router = express.Router();

const {
  upload,
  uploadMusic,
  getAllMusic,
  getMyMusic,
  updateMusic
} = require("../controllers/musicController");

const auth = require("../middlewares/auth");
const checkRole = require("../middlewares/role");

// 🎵 Upload
router.post("/upload", auth, checkRole(["creator", "admin"]), upload, uploadMusic);

// 👤 Creator's own uploads
router.get("/my-uploads", auth, checkRole(["creator"]), getMyMusic);

// 🌍 Get all songs
router.get("/all", getAllMusic);

// 🎵 Get single song
router.get("/:id", async (req, res) => {
  const Music = require("../models/Music");
  try {
    const music = await Music.findById(req.params.id).populate("uploadedBy", "name role");
    if (!music) return res.status(404).json({ message: "Song not found" });
    res.json({ data: music });
  } catch (error) {
    console.error("Get song error:", error.message);
    res.status(500).json({ message: "Failed to fetch song" });
  }
});

// ✏️ Edit (same auth as upload)
router.put("/edit/:id", auth, checkRole(["creator", "admin"]), upload, updateMusic);

// 🗑️ Delete
router.delete("/delete/:id", auth, checkRole(["creator", "admin"]), async (req, res) => {
  const Music = require("../models/Music");

  try {
    const music = await Music.findById(req.params.id);
    if (!music) return res.status(404).json({ message: "Not found" });

    if (
      music.uploadedBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await music.deleteOne();
    res.json({ message: "Deleted!" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
});

// ⬇️ Download
router.post("/download/:id", auth, async (req, res) => {
  const Music = require("../models/Music");
  const User = require("../models/User");

  try {
    const { trackType } = req.body;
    
    // Find the music and track in one query
    const music = await Music.findOne(
      { 
        _id: req.params.id,
        'tracks.type': trackType 
      },
      { 'tracks.$': 1 }
    );

    if (!music) {
      return res.status(404).json({ message: "Track not found" });
    }

    const track = music.tracks[0];

    // Increment download count using findByIdAndUpdate to avoid validation
    await Music.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );

    // Push to user history
    const user = await User.findById(req.user.id);
    user.downloadHistory.push({ song: music._id });
    await user.save();

    res.json({ url: track.url });
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ message: "Download failed" });
  }
});

module.exports = router;