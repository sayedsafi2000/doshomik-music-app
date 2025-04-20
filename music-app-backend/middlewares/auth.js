const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header) return res.status(401).json({ message: "No token" });

    const token = header.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = auth;