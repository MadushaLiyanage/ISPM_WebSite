const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../src/models/User');
const mongoose = require('mongoose');

let mongod = null;

// Start in-memory MongoDB
const startInMemoryDB = async () => {
  try {
    console.log('🚀 Starting in-memory MongoDB...');
    
    mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017, // Use standard MongoDB port
        dbName: 'ipsm_web'
      }
    });
    
    const uri = mongod.getUri();
    console.log(`✅ In-memory MongoDB started at: ${uri}`);
    
    // Connect to the in-memory database
    await mongoose.connect(uri);
    console.log('✅ Connected to in-memory database');
    
    // Seed initial data
    await seedData();
    
    console.log('🎉 In-memory MongoDB ready for development!');
    console.log('📋 Database URL for .env: mongodb://localhost:27017/ipsm_web');
    
    return uri;
  } catch (error) {
    console.error('❌ Failed to start in-memory MongoDB:', error);
    process.exit(1);
  }
};

// Seed initial users
const seedData = async () => {
  try {
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('👥 Users already exist, skipping seed');
      return;
    }
    
    console.log('🌱 Seeding initial users...');
    
    const users = [
      {
        name: 'Super Admin',
        email: 'admin@ipsm.com',
        password: 'admin123',
        role: 'super-admin',
        department: 'IT',
        position: 'System Administrator',
        permissions: [
          'users.read', 'users.create', 'users.update', 'users.delete',
          'policies.read', 'policies.create', 'policies.update', 'policies.delete',
          'projects.read', 'projects.create', 'projects.update', 'projects.delete',
          'tasks.read', 'tasks.create', 'tasks.update', 'tasks.delete',
          'audit.read', 'audit.export',
          'training.read', 'training.create', 'training.update', 'training.delete',
          'system.config', 'dashboard.admin'
        ]
      },
      {
        name: 'Admin User',
        email: 'admin.user@ipsm.com',
        password: 'admin123',
        role: 'admin',
        department: 'Management',
        position: 'Administrator',
        permissions: [
          'users.read', 'users.create', 'users.update',
          'policies.read', 'policies.create', 'policies.update',
          'projects.read', 'projects.create', 'projects.update',
          'tasks.read', 'tasks.create', 'tasks.update',
          'audit.read', 'training.read', 'training.create', 'dashboard.admin'
        ]
      },
      {
        name: 'John Doe',
        email: 'john.doe@ipsm.com',
        password: 'user123',
        role: 'user',
        department: 'Development',
        position: 'Software Developer',
        permissions: ['projects.read', 'tasks.read', 'tasks.create', 'tasks.update', 'training.read']
      }
    ];
    
    for (const userData of users) {
      await User.create(userData);
      console.log(`✅ Created user: ${userData.name} (${userData.email})`);
    }
    
    console.log('🎉 Initial users seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
  }
};

// Graceful shutdown
const shutdown = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('📚 Disconnected from MongoDB');
    }
    if (mongod) {
      await mongod.stop();
      console.log('🛑 In-memory MongoDB stopped');
    }
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Export for use in other files
module.exports = { startInMemoryDB };

// Start if this file is run directly
if (require.main === module) {
  startInMemoryDB().then(() => {
    console.log('\n🎯 In-memory MongoDB is running...');
    console.log('📝 Press Ctrl+C to stop');
    
    // Keep the process alive
    setInterval(() => {
      // Just keep alive
    }, 1000);
  });
}