const cloudinary = require("../config/cloudinary");
const Music = require("../models/Music");
const multer = require("multer");

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
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
  }
}).fields([
  { name: "image", maxCount: 1 },
  { name: "fullTrack", maxCount: 1 },
  { name: "vocalTrack", maxCount: 1 },
  { name: "instrumentalTrack", maxCount: 1 }
]);

// Helper function to upload buffer to Cloudinary
const uploadToCloudinary = async (buffer, folder, resourceType = "auto") => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: folder,
          resource_type: resourceType,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      );

      uploadStream.end(buffer);
    });
  } catch (error) {
    throw new Error(`Error uploading to Cloudinary: ${error.message}`);
  }
};

// Upload music
const uploadMusic = async (req, res) => {
  try {
    console.log('Upload request received:', req.body);
    console.log('Files received:', req.files);

    if (!req.files) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const { title, artist, category } = req.body;

    if (!title || !artist || !category) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    if (!req.files["fullTrack"]) {
      return res.status(400).json({ message: "Full track is required" });
    }

    // Upload files to Cloudinary
    const tracks = [];
    let imageUrl = null;

    // Upload image if provided
    if (req.files["image"]) {
      const imageFile = req.files["image"][0];
      imageUrl = await uploadToCloudinary(imageFile.buffer, "music-covers", "image");
    }

    // Upload tracks
    if (req.files["fullTrack"]) {
      const fullTrackFile = req.files["fullTrack"][0];
      const fullTrackUrl = await uploadToCloudinary(fullTrackFile.buffer, "music-tracks", "video");
      tracks.push({ type: "full", url: fullTrackUrl });
    }

    if (req.files["vocalTrack"]) {
      const vocalTrackFile = req.files["vocalTrack"][0];
      const vocalTrackUrl = await uploadToCloudinary(vocalTrackFile.buffer, "music-tracks", "video");
      tracks.push({ type: "vocal", url: vocalTrackUrl });
    }

    if (req.files["instrumentalTrack"]) {
      const instrumentalTrackFile = req.files["instrumentalTrack"][0];
      const instrumentalTrackUrl = await uploadToCloudinary(instrumentalTrackFile.buffer, "music-tracks", "video");
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
    console.log('Music saved successfully:', music);

    res.status(201).json({
      message: "Music uploaded successfully",
      data: music,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all music
const getAllMusic = async (req, res) => {
  try {
    const { category, sort } = req.query;
    let query = {};
    
    if (category && category !== "All") {
      query.category = category;
    }

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
    console.error('Get all music error:', error);
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
    console.error('Get my music error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update music
const updateMusic = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, artist, category } = req.body;
    
    // Find the music
    const music = await Music.findById(id);
    if (!music) {
      return res.status(404).json({ message: "Music not found" });
    }

    // Check ownership
    if (music.uploadedBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this track" });
    }

    // Update basic info
    music.title = title || music.title;
    music.artist = artist || music.artist;
    music.category = category || music.category;

    // Handle file updates if any
    if (req.files) {
      // Update image if provided
      if (req.files["image"]) {
        const imageFile = req.files["image"][0];
        const imageUrl = await uploadToCloudinary(imageFile.buffer, "music-covers", "image");
        music.image = imageUrl;
      }

      // Update tracks if provided
      if (req.files["fullTrack"] || req.files["vocalTrack"] || req.files["instrumentalTrack"]) {
        const newTracks = [...music.tracks]; // Copy existing tracks

        // Update or add full track
        if (req.files["fullTrack"]) {
          const fullTrackFile = req.files["fullTrack"][0];
          const fullTrackUrl = await uploadToCloudinary(fullTrackFile.buffer, "music-tracks", "video");
          const fullTrackIndex = newTracks.findIndex(t => t.type === "full");
          if (fullTrackIndex !== -1) {
            newTracks[fullTrackIndex].url = fullTrackUrl;
          } else {
            newTracks.push({ type: "full", url: fullTrackUrl });
          }
        }

        // Update or add vocal track
        if (req.files["vocalTrack"]) {
          const vocalTrackFile = req.files["vocalTrack"][0];
          const vocalTrackUrl = await uploadToCloudinary(vocalTrackFile.buffer, "music-tracks", "video");
          const vocalTrackIndex = newTracks.findIndex(t => t.type === "vocal");
          if (vocalTrackIndex !== -1) {
            newTracks[vocalTrackIndex].url = vocalTrackUrl;
          } else {
            newTracks.push({ type: "vocal", url: vocalTrackUrl });
          }
        }

        // Update or add instrumental track
        if (req.files["instrumentalTrack"]) {
          const instrumentalTrackFile = req.files["instrumentalTrack"][0];
          const instrumentalTrackUrl = await uploadToCloudinary(instrumentalTrackFile.buffer, "music-tracks", "video");
          const instrumentalTrackIndex = newTracks.findIndex(t => t.type === "instrumental");
          if (instrumentalTrackIndex !== -1) {
            newTracks[instrumentalTrackIndex].url = instrumentalTrackUrl;
          } else {
            newTracks.push({ type: "instrumental", url: instrumentalTrackUrl });
          }
        }

        music.tracks = newTracks;
      }
    }

    await music.save();
    res.json({
      message: "Music updated successfully",
      data: music
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  upload,
  uploadMusic,
  getAllMusic,
  getMyMusic,
  updateMusic
};