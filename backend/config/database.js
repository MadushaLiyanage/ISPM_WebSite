const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Enhanced connection options for MongoDB Atlas
    const options = {
      serverSelectionTimeoutMS: 30000, // Increased timeout for Atlas
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10, // Maintain up to 10 socket connections
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
    };

    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('📍 Database URL:', process.env.DATABASE_URL.replace(/:\/\/([^:]+):([^@]+)@/, '://***:***@'));
    
    // Retry mechanism for Atlas connections
    let retries = 3;
    let conn;
    
    while (retries > 0) {
      try {
        conn = await mongoose.connect(process.env.DATABASE_URL, options);
        break; // Success, exit retry loop
      } catch (error) {
        retries--;
        
        if (retries === 0) {
          throw error; // Final attempt failed
        }
        
        console.log(`⚠️  Connection attempt failed, retrying... (${retries} attempts left)`);
        console.log(`🔍 Error: ${error.message}`);
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, (4 - retries) * 2000));
      }
    }

    console.log(`✅ MongoDB Connected Successfully!`);
    console.log(`📚 Host: ${conn.connection.host}`);
    console.log(`📚 Database: ${conn.connection.name}`);
    console.log(`📚 Port: ${conn.connection.port}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected successfully');
    });

    // Handle process termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('📚 MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;

  } catch (error) {
    console.error('❌ MongoDB Connection Failed!');
    console.error('📋 Error Details:', error.message);
    
    // Provide helpful error messages based on error type
    if (error.message.includes('authentication failed')) {
      console.error('🔐 Authentication Error: Please check your MongoDB credentials');
      console.error('💡 Solutions:');
      console.error('   1. Verify username and password in DATABASE_URL');
      console.error('   2. Check if IP address is whitelisted in MongoDB Atlas');
      console.error('   3. Ensure database user has proper permissions');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('querySrv')) {
      console.error('🌐 Network/DNS Error: Cannot reach MongoDB Atlas');
      console.error('💡 Solutions:');
      console.error('   1. Check your internet connection');
      console.error('   2. Verify MongoDB Atlas cluster is running and accessible');
      console.error('   3. Try using different DNS servers (8.8.8.8, 1.1.1.1)');
      console.error('   4. Check if corporate firewall is blocking the connection');
      console.error('   5. Try using the non-SRV connection string format');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.error('🔌 Connection Refused: MongoDB server not accessible');
      console.error('💡 Solutions:');
      console.error('   1. Ensure MongoDB Atlas cluster is not paused');
      console.error('   2. Check network connectivity');
      console.error('   3. Verify cluster configuration');
    }
    
    console.error('\n🛠️  Troubleshooting Options:');
    console.error('   • Check MongoDB Atlas cluster status');
    console.error('   • Verify IP whitelist (add 0.0.0.0/0 for testing)');
    console.error('   • Test connection from MongoDB Compass');
    console.error('   • Contact MongoDB Atlas support if issues persist\n');
    
    // Don't exit immediately, let the application decide
    throw error;
  }
};

module.exports = connectDB;