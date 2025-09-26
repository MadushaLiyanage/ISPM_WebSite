const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// All notification routes require authentication
router.use(auth.protect);

// Get user's notifications
router.get('/', notificationController.getUserNotifications);

// Mark notification as read/unread
router.patch('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.patch('/mark-all-read', notificationController.markAllAsRead);

// Delete notification
router.delete('/:id', notificationController.deleteNotification);

// Get notification statistics
router.get('/stats', notificationController.getNotificationStats);

// Admin routes (would need additional admin middleware)
router.post('/', notificationController.createNotification);
router.post('/bulk', notificationController.createBulkNotifications);

module.exports = router;