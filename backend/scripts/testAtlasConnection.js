const mongoose = require('mongoose');
require('dotenv').config();

async function testAtlasConnection() {
  console.log('🔍 Testing MongoDB Atlas Connection...');
  console.log('📍 Target:', process.env.DATABASE_URL.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));
  
  const options = {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
    family: 4,
    maxPoolSize: 10,
    maxIdleTimeMS: 30000,
  };

  try {
    const startTime = Date.now();
    
    console.log('⏳ Attempting connection...');
    const conn = await mongoose.connect(process.env.DATABASE_URL, options);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log('✅ MongoDB Atlas Connection Successful!');
    console.log(`📊 Connection Details:`);
    console.log(`   🌐 Host: ${conn.connection.host}`);
    console.log(`   🗄️  Database: ${conn.connection.name}`);
    console.log(`   🔌 Port: ${conn.connection.port}`);
    console.log(`   ⏱️  Duration: ${duration}ms`);
    console.log(`   📡 Ready State: ${conn.connection.readyState} (1 = connected)`);
    
    // Test a simple operation
    console.log('\\n🧪 Testing database operations...');
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`📁 Available collections: ${collections.length}`);
    collections.forEach(col => console.log(`   - ${col.name}`));
    
    console.log('\\n🎉 MongoDB Atlas is ready for use!');
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected successfully');
    
  } catch (error) {
    console.error('❌ MongoDB Atlas Connection Failed!');
    console.error(`🔍 Error Type: ${error.name}`);
    console.error(`📋 Error Message: ${error.message}`);
    
    if (error.message.includes('querySrv ENOTFOUND')) {
      console.log('\\n🌐 DNS Resolution Issue Detected');
      console.log('💡 Potential Solutions:');
      console.log('   1. Check internet connectivity');
      console.log('   2. Try using alternative DNS servers (8.8.8.8, 1.1.1.1)');
      console.log('   3. Check if corporate firewall blocks MongoDB Atlas');
      console.log('   4. Verify MongoDB Atlas cluster is running');
      console.log('   5. Try connecting from a different network');
    } else if (error.message.includes('authentication failed')) {
      console.log('\\n🔐 Authentication Issue Detected');
      console.log('💡 Potential Solutions:');
      console.log('   1. Verify username and password');
      console.log('   2. Check database user permissions');
      console.log('   3. Ensure IP address is whitelisted (0.0.0.0/0 for testing)');
    }
    
    console.log('\\n🔧 Next Steps:');
    console.log('   - Test connection from MongoDB Compass');
    console.log('   - Check MongoDB Atlas dashboard for cluster status');
    console.log('   - Contact network administrator if in corporate environment');
    
    process.exit(1);
  }
}

testAtlasConnection();