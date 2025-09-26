const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required for audit log']
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    trim: true,
    maxlength: [100, 'Action cannot be more than 100 characters']
  },
  actionType: {
    type: String,
    required: true,
    enum: [
      'CREATE', 'READ', 'UPDATE', 'DELETE',
      'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE',
      'ROLE_CHANGE', 'ACCOUNT_ACTIVATE', 'ACCOUNT_DEACTIVATE',
      'POLICY_PUBLISH', 'POLICY_ARCHIVE', 'POLICY_ACKNOWLEDGE',
      'FILE_UPLOAD', 'FILE_DOWNLOAD', 'BULK_OPERATION',
      'SYSTEM_CONFIG', 'DATA_EXPORT', 'DATA_IMPORT'
    ]
  },
  resource: {
    type: String,
    required: [true, 'Resource is required'],
    enum: ['USER', 'POLICY', 'PROJECT', 'TASK', 'SYSTEM', 'FILE', 'ROLE']
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false // Some actions might not have a specific resource ID
  },
  details: {
    type: String,
    maxlength: [1000, 'Details cannot be more than 1000 characters']
  },
  changes: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed
  },
  metadata: {
    ipAddress: {
      type: String,
      required: [true, 'IP address is required']
    },
    userAgent: {
      type: String,
      required: [true, 'User agent is required']
    },
    sessionId: String,
    requestId: String,
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
    },
    endpoint: String,
    responseStatus: Number,
    executionTime: Number, // in milliseconds
    location: {
      country: String,
      city: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    }
  },
  severity: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'LOW'
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILED', 'WARNING'],
    default: 'SUCCESS'
  },
  tags: [{
    type: String,
    trim: true
  }],
  isSystemGenerated: {
    type: Boolean,
    default: false
  },
  relatedLogs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AuditLog'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for formatted timestamp
AuditLogSchema.virtual('formattedTimestamp').get(function() {
  return this.createdAt.toISOString();
});

// Virtual for risk level based on action type and severity
AuditLogSchema.virtual('riskLevel').get(function() {
  const highRiskActions = ['DELETE', 'ROLE_CHANGE', 'ACCOUNT_DEACTIVATE', 'SYSTEM_CONFIG'];
  const mediumRiskActions = ['UPDATE', 'PASSWORD_CHANGE', 'POLICY_PUBLISH', 'BULK_OPERATION'];
  
  if (this.severity === 'CRITICAL' || highRiskActions.includes(this.actionType)) {
    return 'HIGH';
  } else if (this.severity === 'HIGH' || mediumRiskActions.includes(this.actionType)) {
    return 'MEDIUM';
  }
  return 'LOW';
});

// Static method to create audit log
AuditLogSchema.statics.createLog = async function(logData) {
  try {
    const log = new this(logData);
    await log.save();
    return log;
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error to avoid breaking the main operation
    return null;
  }
};

// Static method to get logs with pagination and filters
AuditLogSchema.statics.getFilteredLogs = async function(filters = {}, options = {}) {
  const {
    page = 1,
    limit = 50,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const query = {};
  
  if (filters.user) query.user = filters.user;
  if (filters.actionType) query.actionType = filters.actionType;
  if (filters.resource) query.resource = filters.resource;
  if (filters.severity) query.severity = filters.severity;
  if (filters.status) query.status = filters.status;
  
  if (filters.dateFrom || filters.dateTo) {
    query.createdAt = {};
    if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const logs = await this.find(query)
    .populate('user', 'name email role')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await this.countDocuments(query);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// Index for better performance
AuditLogSchema.index({ user: 1, createdAt: -1 });
AuditLogSchema.index({ actionType: 1, createdAt: -1 });
AuditLogSchema.index({ resource: 1, resourceId: 1 });
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ 'metadata.ipAddress': 1 });
AuditLogSchema.index({ severity: 1, status: 1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);