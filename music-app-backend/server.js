const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// ✅ CORS - Allow both development and production origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://doshomik.vercel.app', // Add your production frontend URL
  'https://doshomik.com' // Add your custom domain if you have one
];

app.use(cors({
  origin: function(origin, callback) {
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

// ✅ Connect to DB with better error handling
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    // Don't exit the process in production, just log the error
    if (process.env.NODE_ENV === 'development') {
      process.exit(1);
    }
  });

// ✅ Health check endpoint for deployment platforms
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

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

// ✅ Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Don't expose internal errors to the client in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Something went wrong!' 
    : err.message;
    
  res.status(err.status || 500).json({ 
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ✅ Handle 404 routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));