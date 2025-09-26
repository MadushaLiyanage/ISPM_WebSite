const express = require('express');
const { protect, adminOnly, superAdminOnly } = require('../middleware/auth');
const { auditLogger, auditHighRisk } = require('../middleware/auditLogger');
const {
  validatePaginationQuery,
  validateDateRange,
  validateAuditExport,
  validateObjectId
} = require('../middleware/validation');
const {
  getAuditLogs,
  getAuditLog,
  exportAuditLogs,
  getAuditStats,
  getUserActivityTimeline,
  cleanupAuditLogs
} = require('../controllers/auditLogController');

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(protect);
router.use(adminOnly);
router.use(auditLogger({ logLevel: 'admin-only' }));

// Audit log routes
router.get('/', 
  validatePaginationQuery,
  validateDateRange,
  getAuditLogs
);

router.get('/stats', getAuditStats);

router.get('/export', 
  validateAuditExport,
  exportAuditLogs
);

router.get('/user/:userId/timeline', 
  validateObjectId('userId'),
  getUserActivityTimeline
);

router.get('/:id', 
  validateObjectId(),
  getAuditLog
);

// Cleanup operations (super admin only)
router.delete('/cleanup', 
  superAdminOnly,
  auditHighRisk,
  cleanupAuditLogs
);

module.exports = router;