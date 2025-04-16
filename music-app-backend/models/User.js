const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["user", "creator", "admin"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // ✅ Download History - song ID with date
  downloadHistory: [
    {
      song: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Music"
      },
      downloadedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],

  // ✅ Wishlist - List of song IDs
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Music",
    },
  ],

  // ⭐ For future: Playlist
  playlists: [
    {
      name: String,
      tracks: [
        { type: mongoose.Schema.Types.ObjectId, ref: "Music" },
      ],
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("User", userSchema);