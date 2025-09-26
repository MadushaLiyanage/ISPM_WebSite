const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'manager', 'super-admin'],
    default: 'user'
  },
  permissions: [{
    type: String,
    enum: [
      'users.read', 'users.create', 'users.update', 'users.delete',
      'policies.read', 'policies.create', 'policies.update', 'policies.delete',
      'projects.read', 'projects.create', 'projects.update', 'projects.delete',
      'tasks.read', 'tasks.create', 'tasks.update', 'tasks.delete',
      'audit.read', 'audit.export',
      'training.read', 'training.create', 'training.update', 'training.delete',
      'system.config', 'dashboard.admin'
    ]
  }],
  avatar: {
    type: String,
    default: null
  },
  department: {
    type: String,
    trim: true
  },
  position: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  loginHistory: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    userAgent: String,
    location: {
      country: String,
      city: String
    },
    status: {
      type: String,
      enum: ['success', 'failed'],
      default: 'success'
    }
  }],
  accountSettings: {
    twoFactorEnabled: {
      type: Boolean,
      default: false
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    marketingEmails: {
      type: Boolean,
      default: false
    },
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  activationToken: String,
  activationExpire: Date,
  deactivatedAt: Date,
  deactivatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deactivationReason: String
}, {
  timestamps: true
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if user has specific permission
UserSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission) || this.role === 'super-admin';
};

// Check if user has any of the specified permissions
UserSchema.methods.hasAnyPermission = function(permissions) {
  if (this.role === 'super-admin') return true;
  return permissions.some(permission => this.permissions.includes(permission));
};

// Update last login
UserSchema.methods.updateLastLogin = async function(ipAddress, userAgent, location = {}) {
  this.lastLogin = new Date();
  
  // Add to login history (keep only last 50 entries)
  this.loginHistory.unshift({
    timestamp: new Date(),
    ipAddress,
    userAgent,
    location,
    status: 'success'
  });
  
  if (this.loginHistory.length > 50) {
    this.loginHistory = this.loginHistory.slice(0, 50);
  }
  
  await this.save();
};

// Deactivate user account
UserSchema.methods.deactivate = async function(deactivatedBy, reason) {
  this.isActive = false;
  this.deactivatedAt = new Date();
  this.deactivatedBy = deactivatedBy;
  this.deactivationReason = reason;
  await this.save();
};

// Reactivate user account
UserSchema.methods.reactivate = async function() {
  this.isActive = true;
  this.deactivatedAt = undefined;
  this.deactivatedBy = undefined;
  this.deactivationReason = undefined;
  await this.save();
};

module.exports = mongoose.model('User', UserSchema);