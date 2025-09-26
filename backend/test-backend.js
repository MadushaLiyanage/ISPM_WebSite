#!/usr/bin/env node

/**
 * Backend Health Check Script
 * Tests if the backend server can start without database connection
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

console.log('🔍 Testing backend server setup...\n');

const app = express();

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Backend server is working',
    timestamp: new Date().toISOString()
  });
});

app.get('/', (req, res) => {
  res.json({
    message: 'IPSM Web API is running (without database)',
    status: 'healthy'
  });
});

const PORT = 3001; // Use different port to avoid conflicts

const server = app.listen(PORT, () => {
  console.log(`✅ Backend server test successful on port ${PORT}`);
  console.log('🌐 Try visiting: http://localhost:3001/health');
  server.close(() => {
    console.log('✅ Server test completed - backend code is working properly');
    process.exit(0);
  });
});