const express = require('express');
const { protect, adminOnly } = require('../middleware/auth');
const { auditLogger } = require('../middleware/auditLogger');
const {
  getDashboardMetrics,
  getSystemStats
} = require('../controllers/adminController');

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(protect);
router.use(adminOnly);
router.use(auditLogger({ logLevel: 'all' }));

// Root admin route
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Admin panel access granted',
    user: {
      id: req.user._id,
      name: req.user.name,
      role: req.user.role,
      permissions: req.user.permissions
    },
    availableEndpoints: {
      dashboard: '/api/admin/dashboard',
      stats: '/api/admin/stats',
      users: '/api/admin/users',
      policies: '/api/admin/policies',
      auditLogs: '/api/admin/audit-logs'
    }
  });
});

// Dashboard routes
router.get('/dashboard', getDashboardMetrics);
router.get('/stats', getSystemStats);

module.exports = router;