const AuditLog = require('../models/AuditLog');
const User = require('../models/User');

// Simple CSV conversion function
const convertToCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    )
  ].join('\n');
  
  return csvContent;
};

// @desc    Get audit logs with pagination and filters
// @route   GET /api/admin/audit-logs
// @access  Private/Admin
const getAuditLogs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      user = '',
      actionType = '',
      resource = '',
      severity = '',
      status = '',
      dateFrom = '',
      dateTo = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filters
    const filters = {};
    
    if (user) filters.user = user;
    if (actionType) filters.actionType = actionType;
    if (resource) filters.resource = resource;
    if (severity) filters.severity = severity;
    if (status) filters.status = status;
    
    if (dateFrom || dateTo) {
      filters.dateFrom = dateFrom;
      filters.dateTo = dateTo;
    }

    // Get logs with filters and pagination
    const result = await AuditLog.getFilteredLogs(filters, {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    });

    // Log this audit access (meta logging)
    await AuditLog.createLog({
      user: req.user.id,
      action: 'View audit logs',
      actionType: 'READ',
      resource: 'SYSTEM',
      details: `Retrieved ${result.logs.length} audit logs with filters`,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl,
        filters: filters
      }
    });

    res.status(200).json({
      success: true,
      data: {
        logs: result.logs,
        pagination: result.pagination
      }
    });

  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit logs',
      error: error.message
    });
  }
};

// @desc    Get single audit log
// @route   GET /api/admin/audit-logs/:id
// @access  Private/Admin
const getAuditLog = async (req, res) => {
  try {
    const auditLog = await AuditLog.findById(req.params.id)
      .populate('user', 'name email role')
      .populate('relatedLogs');

    if (!auditLog) {
      return res.status(404).json({
        success: false,
        message: 'Audit log not found'
      });
    }

    res.status(200).json({
      success: true,
      data: auditLog
    });

  } catch (error) {
    console.error('Get audit log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit log',
      error: error.message
    });
  }
};

// @desc    Export audit logs to CSV
// @route   GET /api/admin/audit-logs/export
// @access  Private/Admin
const exportAuditLogs = async (req, res) => {
  try {
    const {
      user = '',
      actionType = '',
      resource = '',
      severity = '',
      status = '',
      dateFrom = '',
      dateTo = '',
      format = 'csv'
    } = req.query;

    // Build filters
    const filters = {};
    
    if (user) filters.user = user;
    if (actionType) filters.actionType = actionType;
    if (resource) filters.resource = resource;
    if (severity) filters.severity = severity;
    if (status) filters.status = status;
    
    if (dateFrom || dateTo) {
      filters.dateFrom = dateFrom;
      filters.dateTo = dateTo;
    }

    // Get all matching logs (no pagination for export)
    const result = await AuditLog.getFilteredLogs(filters, {
      page: 1,
      limit: 10000, // Large limit for export
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });

    if (format === 'csv') {
      // Prepare data for CSV export
      const csvData = result.logs.map(log => ({
        'Date': log.createdAt.toISOString(),
        'User': log.user ? log.user.name : 'Unknown',
        'Email': log.user ? log.user.email : 'Unknown',
        'Action': log.action,
        'Action Type': log.actionType,
        'Resource': log.resource,
        'Resource ID': log.resourceId || '',
        'Details': log.details || '',
        'Severity': log.severity,
        'Status': log.status,
        'IP Address': log.metadata.ipAddress || '',
        'User Agent': log.metadata.userAgent || '',
        'Method': log.metadata.method || '',
        'Endpoint': log.metadata.endpoint || ''
      }));

      // Convert to CSV
      const csv = convertToCSV(csvData);

      // Log the export
      await AuditLog.createLog({
        user: req.user.id,
        action: 'Export audit logs',
        actionType: 'DATA_EXPORT',
        resource: 'SYSTEM',
        details: `Exported ${result.logs.length} audit logs to CSV`,
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          method: req.method,
          endpoint: req.originalUrl,
          exportFormat: format,
          recordCount: result.logs.length,
          filters: filters
        },
        severity: 'MEDIUM'
      });

      // Set headers for file download
      const filename = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      res.status(200).send(csv);
    } else {
      // JSON export
      await AuditLog.createLog({
        user: req.user.id,
        action: 'Export audit logs',
        actionType: 'DATA_EXPORT',
        resource: 'SYSTEM',
        details: `Exported ${result.logs.length} audit logs to JSON`,
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          method: req.method,
          endpoint: req.originalUrl,
          exportFormat: format,
          recordCount: result.logs.length,
          filters: filters
        },
        severity: 'MEDIUM'
      });

      res.status(200).json({
        success: true,
        data: result.logs,
        exportInfo: {
          totalRecords: result.logs.length,
          exportDate: new Date().toISOString(),
          filters: filters
        }
      });
    }

  } catch (error) {
    console.error('Export audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export audit logs',
      error: error.message
    });
  }
};

// @desc    Get audit log statistics
// @route   GET /api/admin/audit-logs/stats
// @access  Private/Admin
const getAuditStats = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let startDate;
    switch (period) {
      case '24h':
        startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get action type distribution
    const actionTypeStats = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$actionType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get resource distribution
    const resourceStats = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$resource', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get severity distribution
    const severityStats = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get top users by activity
    const topUsers = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $project: {
          count: 1,
          user: { $arrayElemAt: ['$userInfo', 0] }
        }
      }
    ]);

    // Get daily activity trend
    const dailyActivity = await AuditLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Get failed operations
    const failedOperations = await AuditLog.countDocuments({
      createdAt: { $gte: startDate },
      status: 'FAILED'
    });

    const totalOperations = await AuditLog.countDocuments({
      createdAt: { $gte: startDate }
    });

    const successRate = totalOperations > 0 
      ? Math.round(((totalOperations - failedOperations) / totalOperations) * 100)
      : 100;

    res.status(200).json({
      success: true,
      data: {
        period,
        overview: {
          totalOperations,
          failedOperations,
          successRate
        },
        actionTypeStats,
        resourceStats,
        severityStats,
        topUsers,
        dailyActivity
      }
    });

  } catch (error) {
    console.error('Get audit stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit statistics',
      error: error.message
    });
  }
};

// @desc    Get user activity timeline
// @route   GET /api/admin/audit-logs/user/:userId/timeline
// @access  Private/Admin
const getUserActivityTimeline = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    // Check if user exists
    const user = await User.findById(userId).select('name email');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's activity logs
    const logs = await AuditLog.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('user', 'name email')
      .select('action actionType resource details createdAt metadata.ipAddress status severity');

    // Log this access
    await AuditLog.createLog({
      user: req.user.id,
      action: 'View user activity timeline',
      actionType: 'READ',
      resource: 'USER',
      resourceId: userId,
      details: `Viewed activity timeline for user: ${user.email}`,
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
        user,
        timeline: logs,
        totalLogs: logs.length
      }
    });

  } catch (error) {
    console.error('Get user activity timeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user activity timeline',
      error: error.message
    });
  }
};

// @desc    Delete old audit logs
// @route   DELETE /api/admin/audit-logs/cleanup
// @access  Private/Admin
const cleanupAuditLogs = async (req, res) => {
  try {
    const { olderThanDays = 365 } = req.body;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(olderThanDays));

    // Count logs to be deleted
    const logsToDelete = await AuditLog.countDocuments({
      createdAt: { $lt: cutoffDate }
    });

    // Delete old logs
    const deleteResult = await AuditLog.deleteMany({
      createdAt: { $lt: cutoffDate }
    });

    // Log the cleanup operation
    await AuditLog.createLog({
      user: req.user.id,
      action: 'Cleanup audit logs',
      actionType: 'DELETE',
      resource: 'SYSTEM',
      details: `Deleted ${deleteResult.deletedCount} audit logs older than ${olderThanDays} days`,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        method: req.method,
        endpoint: req.originalUrl,
        deletedCount: deleteResult.deletedCount,
        cutoffDate: cutoffDate.toISOString()
      },
      severity: 'HIGH'
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${deleteResult.deletedCount} old audit logs`,
      data: {
        deletedCount: deleteResult.deletedCount,
        cutoffDate: cutoffDate.toISOString()
      }
    });

  } catch (error) {
    console.error('Cleanup audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cleanup audit logs',
      error: error.message
    });
  }
};

module.exports = {
  getAuditLogs,
  getAuditLog,
  exportAuditLogs,
  getAuditStats,
  getUserActivityTimeline,
  cleanupAuditLogs
};