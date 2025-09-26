const express = require('express');
const { protect, adminOnly, superAdminOnly } = require('../middleware/auth');
const { auditLogger, auditHighRisk } = require('../middleware/auditLogger');
const {
  validateCreateUser,
  validateUpdateUser,
  validateBulkRoleAssignment,
  validatePaginationQuery,
  validateObjectId
} = require('../middleware/validation');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  deactivateUser,
  reactivateUser,
  bulkRoleAssignment
} = require('../controllers/userManagementController');

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(protect);
router.use(adminOnly);
router.use(auditLogger({ logLevel: 'admin-only' }));

// User management routes
router.get('/', validatePaginationQuery, getUsers);
router.get('/:id', validateObjectId(), getUser);
router.post('/', validateCreateUser, createUser);
router.put('/:id', validateUpdateUser, updateUser);
router.delete('/:id', auditHighRisk, validateObjectId(), deleteUser);

// User account management
router.put('/:id/deactivate', auditHighRisk, validateObjectId(), deactivateUser);
router.put('/:id/reactivate', validateObjectId(), reactivateUser);

// Bulk operations (require super admin)
router.put('/bulk/role-assignment', superAdminOnly, auditHighRisk, validateBulkRoleAssignment, bulkRoleAssignment);

module.exports = router;