const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const { auditLogger, auditHighRisk } = require('../middleware/auditLogger');
const { uploadPolicyFile, handleUploadError } = require('../middleware/upload');
const {
  validateCreatePolicy,
  validateUpdatePolicy,
  validatePaginationQuery,
  validateObjectId
} = require('../middleware/validation');
const {
  getPolicies,
  getPolicy,
  createPolicy,
  updatePolicy,
  deletePolicy,
  publishPolicy,
  archivePolicy,
  uploadPolicyFile: uploadFile,
  getPolicyAcknowledgments
} = require('../controllers/policyManagementController');

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(protect);
router.use(adminOnly);
router.use(auditLogger({ logLevel: 'admin-only' }));

// Policy CRUD routes
router.get('/', validatePaginationQuery, getPolicies);
router.get('/:id', validateObjectId(), getPolicy);
router.post('/', validateCreatePolicy, createPolicy);
router.put('/:id', validateUpdatePolicy, updatePolicy);
router.delete('/:id', auditHighRisk, validateObjectId(), deletePolicy);

// Policy status management
router.put('/:id/publish', auditHighRisk, validateObjectId(), publishPolicy);
router.put('/:id/archive', auditHighRisk, validateObjectId(), archivePolicy);

// File upload for policies
router.post('/:id/upload', 
  validateObjectId(),
  uploadPolicyFile,
  handleUploadError,
  uploadFile
);

// Policy acknowledgments
router.get('/:id/acknowledgments', 
  validateObjectId(),
  validatePaginationQuery,
  getPolicyAcknowledgments
);

module.exports = router;