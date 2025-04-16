const cloudinary = require("../config/cloudinary");
const Music = require("../models/Music");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.fieldname === "image") {
      if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Only image files are allowed!"), false);
      }
    } else if (file.fieldname === "fullTrack" || file.fieldname === "vocalTrack" || file.fieldname === "instrumentalTrack") {
      if (!file.mimetype.startsWith("audio/")) {
        return cb(new Error("Only audio files are allowed!"), false);
      }
    }
    cb(null, true);
  },
}).fields([
  { name: "image", maxCount: 1 },
  { name: "fullTrack", maxCount: 1 },
  { name: "vocalTrack", maxCount: 1 },
  { name: "instrumentalTrack", maxCount: 1 },
]);

// Helper function to upload file to Cloudinary
const uploadToCloudinary = async (file, folder) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      resource_type: "auto",
    });
    return result.secure_url;
  } catch (error) {
    throw new Error(`Error uploading to Cloudinary: ${error.message}`);
  }
};

// Upload music
const uploadMusic = async (req, res) => {
  try {
    if (!req.files) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const { title, artist, category } = req.body;

    if (!title || !artist || !category) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    if (!req.files["image"] || !req.files["fullTrack"]) {
      return res.status(400).json({ message: "Please upload both image and full track" });
    }

    // Upload image to Cloudinary
    const imageUrl = await uploadToCloudinary(req.files["image"][0], "music-covers");

    // Upload tracks to Cloudinary
    const tracks = [];
    if (req.files["fullTrack"]) {
      const fullTrackUrl = await uploadToCloudinary(req.files["fullTrack"][0], "music-tracks");
      tracks.push({ type: "full", url: fullTrackUrl });
    }
    if (req.files["vocalTrack"]) {
      const vocalTrackUrl = await uploadToCloudinary(req.files["vocalTrack"][0], "music-tracks");
      tracks.push({ type: "vocal", url: vocalTrackUrl });
    }
    if (req.files["instrumentalTrack"]) {
      const instrumentalTrackUrl = await uploadToCloudinary(req.files["instrumentalTrack"][0], "music-tracks");
      tracks.push({ type: "instrumental", url: instrumentalTrackUrl });
    }

    // Create new music entry
    const music = new Music({
      title,
      artist,
      category,
      image: imageUrl,
      tracks,
      uploadedBy: req.user.id,
    });

    await music.save();

    res.status(201).json({
      message: "Music uploaded successfully",
      data: music,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all music
const getAllMusic = async (req, res) => {
  try {
    const { category, sort } = req.query;
    let query = {};
    
    // Filter by category if provided
    if (category && category !== "All") {
      query.category = category;
    }

    // Sort options
    let sortOption = {};
    if (sort === "newest") {
      sortOption = { createdAt: -1 };
    } else if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    } else if (sort === "popular") {
      sortOption = { downloadCount: -1 };
    }

    const music = await Music.find(query)
      .sort(sortOption)
      .populate("uploadedBy", "name email");

    res.status(200).json({
      message: "Music retrieved successfully",
      data: music,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's uploads
const getMyMusic = async (req, res) => {
  try {
    const music = await Music.find({ uploadedBy: req.user.id });
    res.status(200).json({
      message: "User uploads retrieved successfully",
      data: music,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update music
const updateMusic = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, artist, category } = req.body;

    const music = await Music.findById(id);

    if (!music) {
      return res.status(404).json({ message: "Music not found" });
    }

    if (music.uploadedBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this music" });
    }

    // Update fields
    if (title) music.title = title;
    if (artist) music.artist = artist;
    if (category) music.category = category;

    // Handle file uploads if provided
    if (req.files) {
      if (req.files["image"]) {
        const imageUrl = await uploadToCloudinary(req.files["image"][0], "music-covers");
        music.image = imageUrl;
      }

      // Update tracks if provided
      const tracks = [...music.tracks];
      
      if (req.files["fullTrack"]) {
        const fullTrackUrl = await uploadToCloudinary(req.files["fullTrack"][0], "music-tracks");
        const fullTrackIndex = tracks.findIndex(track => track.type === "full");
        if (fullTrackIndex !== -1) {
          tracks[fullTrackIndex].url = fullTrackUrl;
        } else {
          tracks.push({ type: "full", url: fullTrackUrl });
        }
      }
      
      if (req.files["vocalTrack"]) {
        const vocalTrackUrl = await uploadToCloudinary(req.files["vocalTrack"][0], "music-tracks");
        const vocalTrackIndex = tracks.findIndex(track => track.type === "vocal");
        if (vocalTrackIndex !== -1) {
          tracks[vocalTrackIndex].url = vocalTrackUrl;
        } else {
          tracks.push({ type: "vocal", url: vocalTrackUrl });
        }
      }
      
      if (req.files["instrumentalTrack"]) {
        const instrumentalTrackUrl = await uploadToCloudinary(req.files["instrumentalTrack"][0], "music-tracks");
        const instrumentalTrackIndex = tracks.findIndex(track => track.type === "instrumental");
        if (instrumentalTrackIndex !== -1) {
          tracks[instrumentalTrackIndex].url = instrumentalTrackUrl;
        } else {
          tracks.push({ type: "instrumental", url: instrumentalTrackUrl });
        }
      }
      
      music.tracks = tracks;
    }

    await music.save();

    res.status(200).json({
      message: "Music updated successfully",
      data: music,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete music
const deleteMusic = async (req, res) => {
  try {
    const { id } = req.params;

    const music = await Music.findById(id);

    if (!music) {
      return res.status(404).json({ message: "Music not found" });
    }

    if (music.uploadedBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this music" });
    }

    await music.deleteOne();

    res.status(200).json({ message: "Music deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  upload,
  uploadMusic,
  getAllMusic,
  getMyMusic,
  updateMusic,
  deleteMusic
};