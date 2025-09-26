const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../src/models/User');

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE_URL);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

// Users to seed
const users = [
  // Super Admin
  {
    name: 'Super Admin',
    email: 'admin@ipsm.com',
    password: 'admin123',
    role: 'super-admin',
    department: 'IT',
    position: 'System Administrator',
    phone: '+1234567890',
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
  // Admin
  {
    name: 'Admin User',
    email: 'admin.user@ipsm.com',
    password: 'admin123',
    role: 'admin',
    department: 'Management',
    position: 'Administrator',
    phone: '+1234567891',
    permissions: [
      'users.read', 'users.create', 'users.update',
      'policies.read', 'policies.create', 'policies.update',
      'projects.read', 'projects.create', 'projects.update',
      'tasks.read', 'tasks.create', 'tasks.update',
      'audit.read',
      'training.read', 'training.create',
      'dashboard.admin'
    ]
  },
  // Manager
  {
    name: 'Project Manager',
    email: 'manager@ipsm.com',
    password: 'manager123',
    role: 'manager',
    department: 'Project Management',
    position: 'Senior Project Manager',
    phone: '+1234567892',
    permissions: [
      'users.read',
      'policies.read',
      'projects.read', 'projects.create', 'projects.update',
      'tasks.read', 'tasks.create', 'tasks.update',
      'training.read'
    ]
  },
  // Regular Users
  {
    name: 'John Doe',
    email: 'john.doe@ipsm.com',
    password: 'user123',
    role: 'user',
    department: 'Development',
    position: 'Software Developer',
    phone: '+1234567893',
    permissions: [
      'projects.read',
      'tasks.read', 'tasks.create', 'tasks.update',
      'training.read'
    ]
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@ipsm.com',
    password: 'user123',
    role: 'user',
    department: 'Design',
    position: 'UI/UX Designer',
    phone: '+1234567894',
    permissions: [
      'projects.read',
      'tasks.read', 'tasks.create', 'tasks.update',
      'training.read'
    ]
  },
  {
    name: 'Mike Johnson',
    email: 'mike.johnson@ipsm.com',
    password: 'user123',
    role: 'user',
    department: 'Testing',
    position: 'QA Engineer',
    phone: '+1234567895',
    permissions: [
      'projects.read',
      'tasks.read', 'tasks.create', 'tasks.update',
      'training.read'
    ]
  }
];

// Seed function
const seedUsers = async () => {
  try {
    console.log('🌱 Starting user seeding...');
    
    // Clear existing users (optional - uncomment if you want to reset)
    // await User.deleteMany({});
    // console.log('🗑️  Cleared existing users');
    
    // Check if users already exist
    for (const userData of users) {
      const existingUser = await User.findOne({ email: userData.email });
      
      if (existingUser) {
        console.log(`⚠️  User already exists: ${userData.email}`);
        continue;
      }
      
      // Create new user
      const user = await User.create(userData);
      console.log(`✅ Created user: ${user.name} (${user.email}) - Role: ${user.role}`);
    }
    
    console.log('\n🎉 User seeding completed!');
    console.log('\n📋 Login Credentials:');
    console.log('👑 Super Admin: admin@ipsm.com / admin123');
    console.log('🔧 Admin: admin.user@ipsm.com / admin123');
    console.log('📊 Manager: manager@ipsm.com / manager123');
    console.log('👤 Users: john.doe@ipsm.com, jane.smith@ipsm.com, mike.johnson@ipsm.com / user123');
    
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
  }
};

// Run seeder
const runSeeder = async () => {
  await connectDB();
  await seedUsers();
  process.exit(0);
};

// Handle script execution
if (require.main === module) {
  runSeeder();
}

module.exports = { seedUsers };