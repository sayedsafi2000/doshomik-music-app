const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// ✅ CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'https://doshomik-frontend.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

// ✅ Connect to DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// ✅ Routes
const authRoutes = require('./routes/authRoutes');
const musicRoutes = require('./routes/musicRoutes');
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const creatorRoutes = require("./routes/creatorRoutes");

app.use("/api/user", userRoutes); 
app.use("/api/auth", authRoutes);
app.use('/api/music', musicRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/creator", creatorRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));