const { body, param, query, validationResult } = require('express-validator');
const AuditLog = require('../models/AuditLog');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    // Log validation failure
    if (req.user) {
      AuditLog.createLog({
        user: req.user.id,
        action: 'Validation failed',
        actionType: 'READ',
        resource: 'SYSTEM',
        details: `Validation errors: ${errors.array().map(err => `${err.param}: ${err.msg}`).join(', ')}`,
        status: 'FAILED',
        severity: 'LOW',
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          method: req.method,
          endpoint: req.originalUrl,
          validationErrors: errors.array()
        }
      }).catch(console.error);
    }
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  
  next();
};

// User validation rules
const validateCreateUser = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  body('role')
    .optional()
    .isIn(['user', 'admin', 'manager', 'super-admin'])
    .withMessage('Invalid role'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department cannot exceed 100 characters'),
  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Position cannot exceed 100 characters'),
  body('phone')
    .optional()
    .matches(/^[+]?[\\d\\s\\-\\(\\)]+$/)
    .withMessage('Invalid phone number format'),
  handleValidationErrors
];

const validateUpdateUser = [
  param('id')
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('role')
    .optional()
    .isIn(['user', 'admin', 'manager', 'super-admin'])
    .withMessage('Invalid role'),
  body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department cannot exceed 100 characters'),
  body('position')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Position cannot exceed 100 characters'),
  body('phone')
    .optional()
    .matches(/^[+]?[\\d\\s\\-\\(\\)]+$/)
    .withMessage('Invalid phone number format'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  handleValidationErrors
];

// Policy validation rules
const validateCreatePolicy = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('content')
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),
  body('category')
    .isIn(['security', 'privacy', 'hr', 'it', 'compliance', 'safety', 'other'])
    .withMessage('Invalid category'),
  body('effectiveDate')
    .isISO8601()
    .withMessage('Invalid effective date format'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiry date format'),
  body('nextReviewDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid review date format'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  handleValidationErrors
];

const validateUpdatePolicy = [
  param('id')
    .isMongoId()
    .withMessage('Invalid policy ID'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Content must be at least 10 characters'),
  body('category')
    .optional()
    .isIn(['security', 'privacy', 'hr', 'it', 'compliance', 'safety', 'other'])
    .withMessage('Invalid category'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived', 'under-review'])
    .withMessage('Invalid status'),
  body('effectiveDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid effective date format'),
  body('expiryDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid expiry date format'),
  body('nextReviewDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid review date format'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  handleValidationErrors
];

// Bulk operations validation
const validateBulkRoleAssignment = [
  body('userIds')
    .isArray({ min: 1 })
    .withMessage('User IDs array is required and must not be empty'),
  body('userIds.*')
    .isMongoId()
    .withMessage('Invalid user ID in array'),
  body('role')
    .isIn(['user', 'admin', 'manager', 'super-admin'])
    .withMessage('Invalid role'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),
  handleValidationErrors
];

// Query validation
const validatePaginationQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  handleValidationErrors
];

// File upload validation
const validateFileUpload = (allowedTypes = [], maxSize = 5 * 1024 * 1024) => {
  return (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`
      });
    }

    // Check file size
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`
      });
    }

    next();
  };
};

// MongoDB ObjectId validation
const validateObjectId = (paramName = 'id') => {
  return [
    param(paramName)
      .isMongoId()
      .withMessage(`Invalid ${paramName}`),
    handleValidationErrors
  ];
};

// Date range validation
const validateDateRange = [
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Invalid dateFrom format'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Invalid dateTo format'),
  query('dateFrom')
    .optional()
    .custom((value, { req }) => {
      if (req.query.dateTo && new Date(value) > new Date(req.query.dateTo)) {
        throw new Error('dateFrom must be before dateTo');
      }
      return true;
    }),
  handleValidationErrors
];

// Audit log export validation
const validateAuditExport = [
  query('format')
    .optional()
    .isIn(['csv', 'json'])
    .withMessage('Format must be csv or json'),
  query('actionType')
    .optional()
    .isIn([
      'CREATE', 'READ', 'UPDATE', 'DELETE',
      'LOGIN', 'LOGOUT', 'PASSWORD_CHANGE',
      'ROLE_CHANGE', 'ACCOUNT_ACTIVATE', 'ACCOUNT_DEACTIVATE',
      'POLICY_PUBLISH', 'POLICY_ARCHIVE', 'POLICY_ACKNOWLEDGE',
      'FILE_UPLOAD', 'FILE_DOWNLOAD', 'BULK_OPERATION',
      'SYSTEM_CONFIG', 'DATA_EXPORT', 'DATA_IMPORT'
    ])
    .withMessage('Invalid action type'),
  query('resource')
    .optional()
    .isIn(['USER', 'POLICY', 'PROJECT', 'TASK', 'SYSTEM', 'FILE', 'ROLE'])
    .withMessage('Invalid resource type'),
  query('severity')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('Invalid severity level'),
  query('status')
    .optional()
    .isIn(['SUCCESS', 'FAILED', 'WARNING'])
    .withMessage('Invalid status'),
  ...validateDateRange
];

module.exports = {
  handleValidationErrors,
  validateCreateUser,
  validateUpdateUser,
  validateCreatePolicy,
  validateUpdatePolicy,
  validateBulkRoleAssignment,
  validatePaginationQuery,
  validateFileUpload,
  validateObjectId,
  validateDateRange,
  validateAuditExport
};