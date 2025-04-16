const mongoose = require("mongoose");

const musicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    artist: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['All', 'Pop', 'Rock', 'Jazz', 'Classical', 'Electronic', 'Hip Hop', 'Folk', 'Ambient', 'R&B', 'Country', 'Blues', 'Reggae'],
      default: 'All'
    },
    image: {
      type: String,
      required: true,
    },
    tracks: [
      {
        type: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    downloadCount: {
      type: Number,
      default: 0,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Music", musicSchema);