const Notification = require('../models/Notification');

// Get user's notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, isRead } = req.query;
    const userId = req.user.id;

    let query = { userId };

    if (type && type !== 'all') {
      query.type = type;
    }

    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }

    const notifications = await Notification.find(query)
      .populate('relatedId', 'title')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark notification as read/unread
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { read } = req.body;
    const userId = req.user.id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      {
        isRead: read,
        readAt: read ? new Date() : null
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.updateMany(
      { userId, isRead: false },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete notification
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({ _id: id, userId });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create notification (admin/system)
exports.createNotification = async (req, res) => {
  try {
    const { userId, type, title, message, priority, relatedId, relatedModel, expiresAt } = req.body;

    const notification = new Notification({
      userId,
      type,
      title,
      message,
      priority: priority || 'medium',
      relatedId,
      relatedModel,
      expiresAt,
      createdBy: req.user.id
    });

    await notification.save();

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Bulk create notifications
exports.createBulkNotifications = async (req, res) => {
  try {
    const { notifications } = req.body;

    const createdNotifications = await Notification.insertMany(
      notifications.map(notification => ({
        ...notification,
        createdBy: req.user.id
      }))
    );

    res.status(201).json({
      message: `${createdNotifications.length} notifications created`,
      notifications: createdNotifications
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get notification statistics
exports.getNotificationStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const total = await Notification.countDocuments({ userId });
    const unread = await Notification.countDocuments({ userId, isRead: false });
    const read = total - unread;

    const byType = await Notification.aggregate([
      { $match: { userId: require('mongoose').Types.ObjectId(userId) } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.json({
      total,
      unread,
      read,
      byType
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};