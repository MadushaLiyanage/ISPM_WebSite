#!/usr/bin/env node

/**
 * IPSM Web Backend Setup Script
 * Installs dependencies and sets up the development environment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up IPSM Web Backend...\n');

// Check if package.json exists
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found. Make sure you\'re in the backend directory.');
  process.exit(1);
}

try {
  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Create .env file from example if it doesn't exist
  if (!fs.existsSync('.env') && fs.existsSync('.env.example')) {
    console.log('📝 Creating .env file from .env.example...');
    fs.copyFileSync('.env.example', '.env');
    console.log('⚠️  Please update the .env file with your actual configuration values.');
  }

  // Create uploads directory
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log('📁 Creating uploads directory...');
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  console.log('\n✅ Backend setup completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Update your .env file with the correct database URL and JWT secret');
  console.log('2. Make sure MongoDB is running');
  console.log('3. Run "npm run dev" to start the development server');
  console.log('4. Visit http://localhost:3000 to see the API documentation');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}