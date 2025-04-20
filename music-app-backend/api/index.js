// API index handler
module.exports = (req, res) => {
  res.status(200).json({
    message: 'Doshomik Music API is running',
    endpoints: [
      '/api/auth',
      '/api/music',
      '/api/user',
      '/api/admin',
      '/api/creator',
      '/api/test',
      '/health'
    ],
    timestamp: new Date().toISOString()
  });
}; 