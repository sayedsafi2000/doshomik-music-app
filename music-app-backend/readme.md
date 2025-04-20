music-backend/
│
├── controllers/
│   ├── authController.js        // Auth Login/Register
│   └── musicController.js       // Upload & Fetch Music
│
├── models/
│   ├── User.js                  // User Schema with role
│   └── Music.js                 // Music Schema
│
├── routes/
│   ├── authRoutes.js            // POST /register /login
│   └── musicRoutes.js           // POST /upload, GET /all
│
├── middlewares/
│   ├── auth.js                  // JWT Authorize
│   └── role.js                  // Role Check Middleware
│
├── config/
│   ├── db.js                    // MongoDB Connection
│   └── cloudinary.js           // Cloudinary Setup
│
├── .env                         // Environment Variables
├── server.js                    // Entry Point
├── package.json
└── README.md (optional)