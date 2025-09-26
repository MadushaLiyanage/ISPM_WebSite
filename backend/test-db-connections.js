#!/usr/bin/env node

/**
 * Database Connection Tester
 * Tests multiple database connection options
 */

require('dotenv').config();
const mongoose = require('mongoose');

const testConnections = async () => {
  console.log('🔍 IPSM Web Database Connection Tester\n');
  
  const connections = [
    {
      name: 'Local MongoDB',
      url: 'mongodb://localhost:27017/ipsm_web',
      description: 'Local MongoDB instance'
    },
    {
      name: 'MongoDB Atlas (from .env)',
      url: process.env.DATABASE_URL,
      description: 'Cloud MongoDB Atlas'
    }
  ];

  for (const conn of connections) {
    console.log(`\n🧪 Testing: ${conn.name}`);
    console.log(`📍 Description: ${conn.description}`);
    
    try {
      // Clean URL for display (hide credentials)
      const displayUrl = conn.url?.replace(/:\/\/([^:]+):([^@]+)@/, '://***:***@') || 'undefined';
      console.log(`🔗 URL: ${displayUrl}`);
      
      if (!conn.url) {
        console.log('❌ URL not defined');
        continue;
      }
      
      console.log('⏳ Connecting...');
      
      const connection = await mongoose.connect(conn.url, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 10000,
      });
      
      console.log('✅ Connection successful!');
      console.log(`📊 Host: ${connection.connection.host}`);
      console.log(`📊 Database: ${connection.connection.name}`);
      console.log(`📊 Port: ${connection.connection.port}`);
      
      // Test basic operations
      const collections = await connection.connection.db.listCollections().toArray();
      console.log(`📁 Collections found: ${collections.length}`);
      
      await mongoose.disconnect();
      console.log('🔌 Disconnected successfully');
      
      // If we reach here, this connection works
      console.log(`\n🎉 SUCCESS! Use this connection in your .env file:`);
      console.log(`DATABASE_URL=${conn.url}\n`);
      return;
      
    } catch (error) {
      console.log(`❌ Connection failed: ${error.message}`);
      
      if (error.message.includes('authentication failed')) {
        console.log('🔐 Issue: Authentication problem');
        console.log('💡 Fix: Check username/password and IP whitelist');
      } else if (error.message.includes('ENOTFOUND')) {
        console.log('🌐 Issue: Cannot reach server');
        console.log('💡 Fix: Check internet connection or server URL');
      } else if (error.message.includes('ECONNREFUSED')) {
        console.log('🔌 Issue: Connection refused');
        console.log('💡 Fix: Start MongoDB service locally');
      }
      
      try {
        await mongoose.disconnect();
      } catch (disconnectError) {
        // Ignore disconnect errors
      }
    }
  }
  
  console.log('\n❌ No working database connections found!');
  console.log('\n🛠️  Setup Instructions:');
  console.log('\n📋 Option 1: Local MongoDB');
  console.log('   1. Install MongoDB locally');
  console.log('   2. Start MongoDB service');
  console.log('   3. Use: DATABASE_URL=mongodb://localhost:27017/ipsm_web');
  console.log('\n☁️  Option 2: MongoDB Atlas');
  console.log('   1. Create account at https://cloud.mongodb.com');
  console.log('   2. Create cluster and database user');
  console.log('   3. Whitelist your IP address');
  console.log('   4. Get connection string and update .env file');
  console.log('\n🆘 Need Help?');
  console.log('   • Local setup: https://docs.mongodb.com/manual/installation/');
  console.log('   • Atlas setup: https://docs.atlas.mongodb.com/getting-started/');
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Connection test interrupted');
  try {
    await mongoose.disconnect();
  } catch (error) {
    // Ignore
  }
  process.exit(0);
});

testConnections()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Test failed:', error.message);
    process.exit(1);
  });