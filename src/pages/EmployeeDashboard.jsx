import React, { useState, useEffect } from 'react';
import { dashboardAPI, notificationsAPI, policiesAPI } from '../services/api';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard stats, recent notifications, and pending policies
      const [dashboardResponse, notificationsResponse, policiesResponse] = await Promise.allSettled([
        dashboardAPI.getEmployeeDashboard(),
        notificationsAPI.getNotifications({ limit: 5 }),
        policiesAPI.getPolicies({ limit: 10 })
      ]);

      // Mock dashboard data since the backend endpoint might not exist yet
      const mockDashboardData = {
        pendingPolicies: policiesResponse.status === 'fulfilled'
          ? policiesResponse.value.policies.filter(p => !p.acknowledged).length
          : 3,
        trainingDue: 2, // This would come from a training API
        unreadNotifications: notificationsResponse.status === 'fulfilled'
          ? notificationsResponse.value.unreadCount || 0
          : 5,
        completedTasks: 12 // This would come from tasks API
      };

      // Use actual dashboard data if available
      const dashboardData = dashboardResponse.status === 'fulfilled'
        ? dashboardResponse.value
        : mockDashboardData;

      const recentNotifications = notificationsResponse.status === 'fulfilled'
        ? notificationsResponse.value.notifications.slice(0, 2)
        : [];

      const pendingPolicies = policiesResponse.status === 'fulfilled'
        ? policiesResponse.value.policies.filter(p => !p.acknowledged).slice(0, 3)
        : [];

      setDashboardData({
        stats: dashboardData,
        recentNotifications,
        pendingPolicies
      });
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="employee-dashboard">
        <div className="dashboard-header">
          <h1>Employee Dashboard</h1>
          <p>Loading your dashboard...</p>
        </div>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="employee-dashboard">
        <div className="dashboard-header">
          <h1>Employee Dashboard</h1>
          <p>Error loading dashboard</p>
        </div>
        <div className="error-message">{error}</div>
        <button onClick={fetchDashboardData} className="btn-primary">Retry</button>
      </div>
    );
  }

  const { stats, recentNotifications, pendingPolicies } = dashboardData || {};

  return (
    <div className="employee-dashboard">
      <div className="dashboard-header">
        <h1>Employee Dashboard</h1>
        <p>Welcome to your personalized dashboard</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>Pending Policies</h3>
            <p className="stat-number">{stats?.pendingPolicies || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div className="stat-content">
            <h3>Training Due</h3>
            <p className="stat-number">{stats?.trainingDue || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔔</div>
          <div className="stat-content">
            <h3>Unread Notifications</h3>
            <p className="stat-number">{stats?.unreadNotifications || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>Completed Tasks</h3>
            <p className="stat-number">{stats?.completedTasks || 0}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>Pending Policies & Trainings</h2>
          <div className="policy-list">
            {pendingPolicies && pendingPolicies.length > 0 ? (
              pendingPolicies.map(policy => (
                <div key={policy._id || policy.id} className="policy-item">
                  <h4>{policy.title}</h4>
                  <p>Due: {policy.effectiveDate ? new Date(policy.effectiveDate).toLocaleDateString() : 'TBD'}</p>
                  <button className="btn-primary">View Details</button>
                </div>
              ))
            ) : (
              <p>No pending policies</p>
            )}
            {/* Mock training items since we don't have a training API yet */}
            <div className="policy-item">
              <h4>Data Protection Training</h4>
              <p>Due: Jan 5, 2026</p>
              <button className="btn-primary">Start Training</button>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Recent Notifications</h2>
          <div className="notification-list">
            {recentNotifications && recentNotifications.length > 0 ? (
              recentNotifications.map(notification => (
                <div key={notification._id || notification.id} className="notification-item">
                  <span className="notification-icon">
                    {notification.type === 'policy' ? '📋' :
                     notification.type === 'training' ? '📚' :
                     notification.type === 'system' ? '⚙️' : '🔔'}
                  </span>
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.message}</p>
                    <span className="notification-time">
                      {new Date(notification.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p>No recent notifications</p>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Quick Links</h2>
          <div className="quick-links">
            <button className="quick-link-btn">My Policies</button>
            <button className="quick-link-btn">Profile Settings</button>
            <button className="quick-link-btn">Notifications</button>
            <button className="quick-link-btn">Help & Support</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;