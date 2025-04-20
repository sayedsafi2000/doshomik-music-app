// Simple API test endpoint
module.exports = (req, res) => {
  res.status(200).json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method
  });
}; 