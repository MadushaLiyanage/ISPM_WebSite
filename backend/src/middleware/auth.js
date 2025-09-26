const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'No user found with this token'
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'Account has been deactivated'
        });
      }

      req.user = user;
      next();
    } catch (err) {
      // Log failed authentication attempt
      await AuditLog.createLog({
        user: null,
        action: 'Failed authentication attempt',
        actionType: 'LOGIN',
        resource: 'SYSTEM',
        details: 'Invalid or expired token',
        status: 'FAILED',
        severity: 'MEDIUM',
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          method: req.method,
          endpoint: req.originalUrl,
          error: err.message
        }
      });

      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    next(error);
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      // Log unauthorized access attempt
      AuditLog.createLog({
        user: req.user.id,
        action: 'Unauthorized access attempt',
        actionType: 'READ',
        resource: 'SYSTEM',
        details: `User with role ${req.user.role} attempted to access ${req.originalUrl}`,
        status: 'FAILED',
        severity: 'HIGH',
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          method: req.method,
          endpoint: req.originalUrl,
          requiredRoles: roles,
          userRole: req.user.role
        }
      });

      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Check specific permissions
const requirePermission = (...permissions) => {
  return (req, res, next) => {
    const hasPermission = req.user.hasAnyPermission(permissions);
    
    if (!hasPermission) {
      // Log unauthorized access attempt
      AuditLog.createLog({
        user: req.user.id,
        action: 'Insufficient permissions',
        actionType: 'READ',
        resource: 'SYSTEM',
        details: `User lacks required permissions: ${permissions.join(', ')}`,
        status: 'FAILED',
        severity: 'HIGH',
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          method: req.method,
          endpoint: req.originalUrl,
          requiredPermissions: permissions,
          userPermissions: req.user.permissions
        }
      });

      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions to access this resource'
      });
    }
    next();
  };
};

// Admin only access (admin, super-admin)
const adminOnly = (req, res, next) => {
  if (!['admin', 'super-admin'].includes(req.user.role)) {
    // Log unauthorized admin access attempt
    AuditLog.createLog({
      user: req.user.id,
      action: 'Unauthorized admin access attempt',
      actionType: 'READ',
      resource: 'SYSTEM',
      details: `Non-admin user attempted to access admin endpoint: ${req.originalUrl}`,
      status: 'FAILED',
      severity: 'HIGH',
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl,
        userRole: req.user.role
      }
    });

    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

// Super admin only access
const superAdminOnly = (req, res, next) => {
  if (req.user.role !== 'super-admin') {
    // Log unauthorized super admin access attempt
    AuditLog.createLog({
      user: req.user.id,
      action: 'Unauthorized super admin access attempt',
      actionType: 'READ',
      resource: 'SYSTEM',
      details: `Non-super-admin user attempted to access super admin endpoint: ${req.originalUrl}`,
      status: 'FAILED',
      severity: 'CRITICAL',
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl,
        userRole: req.user.role
      }
    });

    return res.status(403).json({
      success: false,
      error: 'Super admin access required'
    });
  }
  next();
};

module.exports = { 
  protect, 
  authorize, 
  requirePermission, 
  adminOnly, 
  superAdminOnly 
};