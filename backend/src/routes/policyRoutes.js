const express = require('express');
const router = express.Router();
const policyController = require('../controllers/policyController');
const auth = require('../middleware/auth');

// All policy routes require authentication
router.use(auth.protect);

// Get all policies (with optional search and filtering)
router.get('/', policyController.getPolicies);

// Get single policy
router.get('/:id', policyController.getPolicyById);

// Acknowledge a policy
router.post('/:policyId/acknowledge', policyController.acknowledgePolicy);

// Get user's policy acknowledgments
router.get('/user/acknowledgments', policyController.getUserAcknowledgments);

// Admin routes (would need additional admin middleware)
router.post('/', policyController.createPolicy);
router.put('/:id', policyController.updatePolicy);

module.exports = router;