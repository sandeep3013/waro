/**
 * WARO - WAREHOUSE MANAGEMENT SYSTEM BACKEND SERVER
 * Express Server with REST API & Static Frontend Delivery
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for cross-origin frontend apps (e.g. Live Server, Vite, separate ports)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[${new Date().toISOString().slice(11, 19)}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Mount Central REST API Router
app.use('/api', apiRoutes);

// Serve Frontend Static Files
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// Fallback to index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start Server
app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 WARO WMS Backend Server is running!`);
  console.log(`📍 Web Dashboard: http://localhost:${PORT}`);
  console.log(`🔌 REST API Base:  http://localhost:${PORT}/api`);
  console.log(`🩺 Health Check:   http://localhost:${PORT}/api/health`);
  console.log('====================================================');
});
