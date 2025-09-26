const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcryptjs');

// @desc    Get all users with pagination and search
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      role = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    // Log the access
    await AuditLog.createLog({
      user: req.user.id,
      action: 'List users',
      actionType: 'READ',
      resource: 'USER',
      details: `Retrieved ${users.length} users with filters: ${JSON.stringify({ search, role, status })}`,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl
      }
    });

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users',
      error: error.message
    });
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log the access
    await AuditLog.createLog({
      user: req.user.id,
      action: 'View user details',
      actionType: 'READ',
      resource: 'USER',
      resourceId: user._id,
      details: `Viewed details for user: ${user.email}`,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl
      }
    });

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user',
      error: error.message
    });
  }
};

// @desc    Create user
// @route   POST /api/admin/users
// @access  Private/Admin
const createUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      position,
      phone,
      permissions
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user',
      department,
      position,
      phone,
      permissions: permissions || []
    });

    // Remove password from response
    const userResponse = await User.findById(user._id).select('-password');

    // Log the creation
    await AuditLog.createLog({
      user: req.user.id,
      action: 'Create user',
      actionType: 'CREATE',
      resource: 'USER',
      resourceId: user._id,
      details: `Created new user: ${user.email} with role: ${user.role}`,
      changes: {
        before: null,
        after: {
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          position: user.position
        }
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl
      }
    });

    res.status(201).json({
      success: true,
      data: userResponse,
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Store original values for audit
    const originalUser = {
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position,
      phone: user.phone,
      permissions: user.permissions,
      isActive: user.isActive
    };

    const {
      name,
      email,
      role,
      department,
      position,
      phone,
      permissions,
      isActive
    } = req.body;

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use by another user'
        });
      }
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (department !== undefined) user.department = department;
    if (position !== undefined) user.position = position;
    if (phone !== undefined) user.phone = phone;
    if (permissions) user.permissions = permissions;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    // Remove password from response
    const updatedUser = await User.findById(user._id).select('-password');

    // Log the update
    await AuditLog.createLog({
      user: req.user.id,
      action: 'Update user',
      actionType: 'UPDATE',
      resource: 'USER',
      resourceId: user._id,
      details: `Updated user: ${user.email}`,
      changes: {
        before: originalUser,
        after: {
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          position: user.position,
          phone: user.phone,
          permissions: user.permissions,
          isActive: user.isActive
        }
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl
      }
    });

    res.status(200).json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Store user data for audit log
    const deletedUserData = {
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position
    };

    await User.findByIdAndDelete(req.params.id);

    // Log the deletion
    await AuditLog.createLog({
      user: req.user.id,
      action: 'Delete user',
      actionType: 'DELETE',
      resource: 'USER',
      resourceId: user._id,
      details: `Deleted user: ${user.email}`,
      changes: {
        before: deletedUserData,
        after: null
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl
      },
      severity: 'HIGH'
    });

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// @desc    Deactivate user account
// @route   PUT /api/admin/users/:id/deactivate
// @access  Private/Admin
const deactivateUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'User is already deactivated'
      });
    }

    // Prevent deactivating self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    await user.deactivate(req.user.id, reason);

    // Log the deactivation
    await AuditLog.createLog({
      user: req.user.id,
      action: 'Deactivate user account',
      actionType: 'ACCOUNT_DEACTIVATE',
      resource: 'USER',
      resourceId: user._id,
      details: `Deactivated user: ${user.email}. Reason: ${reason}`,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl
      },
      severity: 'MEDIUM'
    });

    res.status(200).json({
      success: true,
      message: 'User account deactivated successfully'
    });

  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate user',
      error: error.message
    });
  }
};

// @desc    Reactivate user account
// @route   PUT /api/admin/users/:id/reactivate
// @access  Private/Admin
const reactivateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'User is already active'
      });
    }

    await user.reactivate();

    // Log the reactivation
    await AuditLog.createLog({
      user: req.user.id,
      action: 'Reactivate user account',
      actionType: 'ACCOUNT_ACTIVATE',
      resource: 'USER',
      resourceId: user._id,
      details: `Reactivated user: ${user.email}`,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl
      },
      severity: 'MEDIUM'
    });

    res.status(200).json({
      success: true,
      message: 'User account reactivated successfully'
    });

  } catch (error) {
    console.error('Reactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reactivate user',
      error: error.message
    });
  }
};

// @desc    Bulk role assignment
// @route   PUT /api/admin/users/bulk-role
// @access  Private/Admin
const bulkRoleAssignment = async (req, res) => {
  try {
    const { userIds, role, permissions } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    if (!role) {
      return res.status(400).json({
        success: false,
        message: 'Role is required'
      });
    }

    // Update users
    const updateResult = await User.updateMany(
      { _id: { $in: userIds } },
      { 
        $set: { 
          role,
          ...(permissions && { permissions })
        }
      }
    );

    // Get updated users for logging
    const updatedUsers = await User.find({ _id: { $in: userIds } }).select('name email role');

    // Log the bulk operation
    await AuditLog.createLog({
      user: req.user.id,
      action: 'Bulk role assignment',
      actionType: 'BULK_OPERATION',
      resource: 'USER',
      details: `Assigned role "${role}" to ${updateResult.modifiedCount} users`,
      changes: {
        before: null,
        after: {
          role,
          permissions,
          affectedUsers: updatedUsers.map(u => ({ id: u._id, email: u.email }))
        }
      },
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl
      },
      severity: 'HIGH'
    });

    res.status(200).json({
      success: true,
      message: `Successfully updated ${updateResult.modifiedCount} users`,
      data: {
        modifiedCount: updateResult.modifiedCount,
        matchedCount: updateResult.matchedCount
      }
    });

  } catch (error) {
    console.error('Bulk role assignment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk role assignment',
      error: error.message
    });
  }
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  deactivateUser,
  reactivateUser,
  bulkRoleAssignment
};