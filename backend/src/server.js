const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import database connection
const connectDB = require('../config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');

// Import admin routes
const adminRoutes = require('./routes/adminRoutes');
const userManagementRoutes = require('./routes/userManagementRoutes');
const policyManagementRoutes = require('./routes/policyManagementRoutes');
const auditLogRoutes = require('./routes/auditLogRoutes');
const contentRoutes = require('./routes/contentRoutes');
const quizRoutes = require('./routes/quizRoutes');
const phishingRoutes = require('./routes/phishingRoutes');
const employeeRoutes = require('./routes/employeeRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000'
  ],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'SecureGuard Web API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);
app.use('/api/admin/users', userManagementRoutes);
app.use('/api/admin/employees', employeeRoutes);
app.use('/api/admin/policies', policyManagementRoutes);
app.use('/api/admin/audit-logs', auditLogRoutes);
app.use('/api/admin/content', contentRoutes);
app.use('/api/admin/quizzes', quizRoutes);
app.use('/api/admin/phishing', phishingRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to SecureGuard Web API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      projects: '/api/projects',
      tasks: '/api/tasks',
      dashboard: '/api/dashboard',
      users: '/api/users',
      admin: {
        dashboard: '/api/admin',
        userManagement: '/api/admin/users',
        employeeManagement: '/api/admin/employees',
        policyManagement: '/api/admin/policies',
        auditLogs: '/api/admin/audit-logs',
        contentManagement: '/api/admin/content',
        quizManagement: '/api/admin/quizzes',
        phishingSimulation: '/api/admin/phishing'
      }
    }
  });
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB with retries
    console.log('🚀 Starting SecureGuard Web API Server...');
    await connectDB();
    
    // Start the server
    const server = app.listen(PORT, () => {
      console.log(`🚀 SecureGuard Web API Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`🔗 API Health Check: http://localhost:${PORT}/health`);
      console.log(`🔑 Admin Login: admin@secureguard.com / admin123`);
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('⚡ SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed.');
        process.exit(0);
      });
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    
    if (error.message.includes('querySrv') || error.message.includes('ENOTFOUND')) {
      console.log('\n🔄 Attempting alternative connection methods...');
      
      // Try alternative connection string format
      const originalUrl = process.env.DATABASE_URL;
      if (originalUrl.includes('mongodb+srv://')) {
        console.log('📝 Trying non-SRV connection format...');
        
        // Convert SRV to standard format (simplified)
        const altUrl = originalUrl
          .replace('mongodb+srv://', 'mongodb://')
          .replace('@cluster0.knoxe1u.mongodb.net/', '@cluster0-shard-00-00.knoxe1u.mongodb.net:27017,cluster0-shard-00-01.knoxe1u.mongodb.net:27017,cluster0-shard-00-02.knoxe1u.mongodb.net:27017/')
          .replace('?retryWrites=true&w=majority&appName=Cluster0', '?ssl=true&replicaSet=atlas-123abc-shard-0&authSource=admin&retryWrites=true&w=majority');
        
        process.env.DATABASE_URL = altUrl;
        
        try {
          await connectDB();
          console.log('✅ Alternative connection method successful!');
          
          // Start server with alternative connection
          app.listen(PORT, () => {
            console.log(`🚀 SecureGuard Web API Server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
          });
          return;
          
        } catch (altError) {
          console.error('❌ Alternative connection also failed:', altError.message);
          process.env.DATABASE_URL = originalUrl; // Restore original
        }
      }
    }
    
    console.log('\n💡 Recommendation: Check your network connection and MongoDB Atlas status');
    console.log('🔧 For development, you can also use local MongoDB with:');
    console.log('   DATABASE_URL=mongodb://localhost:27017/secureguard_web');
    
    process.exit(1);
  }
};

// Start the server
startServer();

module.exports = app;