const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const { auditLogger } = require('../middleware/auditLogger');
const User = require('../models/User');
const { validationResult } = require('express-validator');

const router = express.Router();

// Apply authentication and admin authorization
router.use(protect);
router.use(adminOnly);
router.use(auditLogger({ logLevel: 'all' }));

// @desc    Get all employees with advanced filtering
// @route   GET /api/admin/employees
// @access  Private/Admin
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      role, 
      status, 
      department,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Build query
    let query = {};
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { position: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Role filter
    if (role && role !== 'all') {
      query.role = role;
    }
    
    // Status filter
    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }
    
    // Department filter
    if (department && department !== 'all') {
      query.department = department;
    }
    
    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const employees = await User.find(query)
      .select('-password')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();
    
    const total = await User.countDocuments(query);
    
    // Get department statistics
    const departmentStats = await User.aggregate([
      { $match: query },
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get role distribution
    const roleStats = await User.aggregate([
      { $match: query },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        employees,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalEmployees: total,
          limit: parseInt(limit)
        },
        statistics: {
          departments: departmentStats,
          roles: roleStats.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          activeEmployees: await User.countDocuments({ ...query, isActive: true }),
          inactiveEmployees: await User.countDocuments({ ...query, isActive: false })
        }
      }
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve employees',
      error: error.message
    });
  }
});

// @desc    Get single employee details
// @route   GET /api/admin/employees/:id
// @access  Private/Admin
router.get('/:id', async (req, res) => {
  try {
    const employee = await User.findById(req.params.id)
      .select('-password')
      .lean();
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve employee',
      error: error.message
    });
  }
});

// @desc    Create new employee
// @route   POST /api/admin/employees
// @access  Private/Admin
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      department,
      position,
      phone,
      isActive = true,
      permissions = []
    } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    // Create employee
    const employee = await User.create({
      name,
      email,
      password,
      role,
      department,
      position,
      phone,
      isActive,
      permissions
    });
    
    // Remove password from response
    const employeeResponse = employee.toObject();
    delete employeeResponse.password;
    
    res.status(201).json({
      success: true,
      data: employeeResponse,
      message: 'Employee created successfully'
    });
  } catch (error) {
    console.error('Create employee error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create employee',
      error: error.message
    });
  }
});

// @desc    Update employee
// @route   PUT /api/admin/employees/:id
// @access  Private/Admin
router.put('/:id', async (req, res) => {
  try {
    const updateData = { ...req.body };
    
    // Remove password if empty (don't update password with empty string)
    if (!updateData.password) {
      delete updateData.password;
    }
    
    const employee = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { 
        new: true, 
        runValidators: true,
        select: '-password'
      }
    );
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: employee,
      message: 'Employee updated successfully'
    });
  } catch (error) {
    console.error('Update employee error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update employee',
      error: error.message
    });
  }
});

// @desc    Delete employee (soft delete)
// @route   DELETE /api/admin/employees/:id
// @access  Private/Admin
router.delete('/:id', async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Soft delete by deactivating
    await employee.deactivate(req.user._id, 'Deleted by administrator');
    
    res.status(200).json({
      success: true,
      message: 'Employee deleted successfully'
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete employee',
      error: error.message
    });
  }
});

// @desc    Activate employee
// @route   PUT /api/admin/employees/:id/activate
// @access  Private/Admin
router.put('/:id/activate', async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    await employee.reactivate();
    
    res.status(200).json({
      success: true,
      message: 'Employee activated successfully'
    });
  } catch (error) {
    console.error('Activate employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate employee',
      error: error.message
    });
  }
});

// @desc    Deactivate employee
// @route   PUT /api/admin/employees/:id/deactivate
// @access  Private/Admin
router.put('/:id/deactivate', async (req, res) => {
  try {
    const { reason = 'Administrative action' } = req.body;
    
    const employee = await User.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    await employee.deactivate(req.user._id, reason);
    
    res.status(200).json({
      success: true,
      message: 'Employee deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to deactivate employee',
      error: error.message
    });
  }
});

// @desc    Bulk operations on employees
// @route   POST /api/admin/employees/bulk
// @access  Private/Admin
router.post('/bulk', async (req, res) => {
  try {
    const { employeeIds, action, data = {} } = req.body;
    
    if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Employee IDs are required'
      });
    }
    
    let result;
    
    switch (action) {
      case 'activate':
        result = await User.updateMany(
          { _id: { $in: employeeIds } },
          { 
            $set: { 
              isActive: true,
              deactivatedAt: null,
              deactivatedBy: null,
              deactivationReason: null
            }
          }
        );
        break;
        
      case 'deactivate':
        result = await User.updateMany(
          { _id: { $in: employeeIds } },
          { 
            $set: { 
              isActive: false,
              deactivatedAt: new Date(),
              deactivatedBy: req.user._id,
              deactivationReason: data.reason || 'Bulk administrative action'
            }
          }
        );
        break;
        
      case 'updateRole':
        if (!data.role) {
          return res.status(400).json({
            success: false,
            message: 'Role is required for bulk role update'
          });
        }
        
        result = await User.updateMany(
          { _id: { $in: employeeIds } },
          { $set: { role: data.role } }
        );
        break;
        
      case 'updateDepartment':
        if (!data.department) {
          return res.status(400).json({
            success: false,
            message: 'Department is required for bulk department update'
          });
        }
        
        result = await User.updateMany(
          { _id: { $in: employeeIds } },
          { $set: { department: data.department } }
        );
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid bulk action'
        });
    }
    
    res.status(200).json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      }
    });
  } catch (error) {
    console.error('Bulk operation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk operation',
      error: error.message
    });
  }
});

// @desc    Export employees data
// @route   GET /api/admin/employees/export
// @access  Private/Admin
router.get('/export', async (req, res) => {
  try {
    const { format = 'json', ...filters } = req.query;
    
    // Build query (reuse filtering logic)
    let query = {};
    
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { department: { $regex: filters.search, $options: 'i' } }
      ];
    }
    
    if (filters.role && filters.role !== 'all') {
      query.role = filters.role;
    }
    
    if (filters.status && filters.status !== 'all') {
      query.isActive = filters.status === 'active';
    }
    
    const employees = await User.find(query)
      .select('name email role department position phone isActive createdAt lastLogin')
      .lean();
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvHeader = 'Name,Email,Role,Department,Position,Phone,Status,Created,Last Login\\n';
      const csvData = employees.map(emp => 
        `\"${emp.name}\",\"${emp.email}\",\"${emp.role}\",\"${emp.department || ''}\",\"${emp.position || ''}\",\"${emp.phone || ''}\",\"${emp.isActive ? 'Active' : 'Inactive'}\",\"${emp.createdAt}\",\"${emp.lastLogin || 'Never'}\"`
      ).join('\\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=employees.csv');
      res.send(csvHeader + csvData);
    } else {
      res.status(200).json({
        success: true,
        data: employees,
        exportedAt: new Date().toISOString(),
        totalRecords: employees.length
      });
    }
  } catch (error) {
    console.error('Export employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export employees data',
      error: error.message
    });
  }
});

module.exports = router;