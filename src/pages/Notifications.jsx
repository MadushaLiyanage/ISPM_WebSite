import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../services/api';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationsAPI.getNotifications();
      setNotifications(response.notifications || []);
    } catch (err) {
      setError('Failed to load notifications');
      console.error('Notifications fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      setUpdating(id);
      await notificationsAPI.markAsRead(id);

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          (notification._id || notification.id) === id
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      setError('Failed to mark notification as read');
      console.error('Mark as read error:', err);
    } finally {
      setUpdating(null);
    }
  };

  const markAsUnread = async (id) => {
    try {
      setUpdating(id);
      await notificationsAPI.markAsUnread(id);

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          (notification._id || notification.id) === id
            ? { ...notification, read: false }
            : notification
        )
      );
    } catch (err) {
      setError('Failed to mark notification as unread');
      console.error('Mark as unread error:', err);
    } finally {
      setUpdating(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      setUpdating('all');
      await notificationsAPI.markAllAsRead();

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (err) {
      setError('Failed to mark all notifications as read');
      console.error('Mark all as read error:', err);
    } finally {
      setUpdating(null);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notification.read;
    return notification.type === filter;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'policy': return '📋';
      case 'training': return '📚';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return (
      <div className="notifications">
        <div className="notifications-header">
          <h1>Notifications</h1>
          <p>Loading notifications...</p>
        </div>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications">
        <div className="notifications-header">
          <h1>Notifications</h1>
          <p>Error loading notifications</p>
        </div>
        <div className="error-message">{error}</div>
        <button onClick={fetchNotifications} className="btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="notifications">
      <div className="notifications-header">
        <h1>Notifications</h1>
        <p>Stay updated with important alerts and messages</p>
      </div>

      <div className="notifications-controls">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </button>
          <button
            className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread ({notifications.filter(n => !n.read).length})
          </button>
          <button
            className={`filter-btn ${filter === 'policy' ? 'active' : ''}`}
            onClick={() => setFilter('policy')}
          >
            Policies
          </button>
          <button
            className={`filter-btn ${filter === 'training' ? 'active' : ''}`}
            onClick={() => setFilter('training')}
          >
            Training
          </button>
          <button
            className={`filter-btn ${filter === 'system' ? 'active' : ''}`}
            onClick={() => setFilter('system')}
          >
            System
          </button>
        </div>
        <button
          className="mark-all-read-btn"
          onClick={markAllAsRead}
          disabled={updating === 'all'}
        >
          {updating === 'all' ? 'Marking...' : 'Mark All as Read'}
        </button>
      </div>

      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="no-notifications">
            <p>No notifications found for the selected filter.</p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification._id || notification.id}
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
            >
              <div className="notification-icon">
                <span className="type-icon">{getTypeIcon(notification.type)}</span>
                {!notification.read && (
                  <span
                    className="priority-indicator"
                    style={{ backgroundColor: getPriorityColor(notification.priority || 'low') }}
                  ></span>
                )}
              </div>
              <div className="notification-content">
                <div className="notification-header">
                  <h3>{notification.title}</h3>
                  <span className="notification-time">
                    {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <p className="notification-message">{notification.message}</p>
                <div className="notification-actions">
                  {notification.read ? (
                    <button
                      className="action-btn unread"
                      onClick={() => markAsUnread(notification._id || notification.id)}
                      disabled={updating === (notification._id || notification.id)}
                    >
                      {updating === (notification._id || notification.id) ? 'Updating...' : 'Mark as Unread'}
                    </button>
                  ) : (
                    <button
                      className="action-btn read"
                      onClick={() => markAsRead(notification._id || notification.id)}
                      disabled={updating === (notification._id || notification.id)}
                    >
                      {updating === (notification._id || notification.id) ? 'Updating...' : 'Mark as Read'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;