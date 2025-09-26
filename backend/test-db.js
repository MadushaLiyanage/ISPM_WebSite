#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests if the database connection is working properly
 */

require('dotenv').config();
const connectDB = require('./config/database');

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...\n');
  
  console.log('Environment variables:');
  console.log(`- NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`- DATABASE_URL: ${process.env.DATABASE_URL ? 'Set ✅' : 'Not set ❌'}`);
  console.log(`- DB_NAME: ${process.env.DB_NAME}\n`);
  
  try {
    await connectDB();
    console.log('✅ Database connection successful!');
    
    // Test a simple operation
    const mongoose = require('mongoose');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections in database`);
    
    if (collections.length > 0) {
      console.log('Collections:', collections.map(c => c.name).join(', '));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('\n🔧 Troubleshooting steps:');
    console.error('1. Check if DATABASE_URL is correctly set in .env file');
    console.error('2. Verify MongoDB credentials are correct');
    console.error('3. Ensure your IP is whitelisted in MongoDB Atlas');
    console.error('4. For local MongoDB, ensure MongoDB service is running');
    process.exit(1);
  }
}

testDatabaseConnection();