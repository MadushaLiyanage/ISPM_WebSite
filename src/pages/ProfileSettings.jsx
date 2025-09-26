import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import './ProfileSettings.css';

const ProfileSettings = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notificationPrefs, setNotificationPrefs] = useState({
    emailNotifications: true,
    pushNotifications: false,
    policyUpdates: true,
    trainingReminders: true,
    systemAlerts: false
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.getMe();

      const user = response.user || {};
      setPersonalInfo({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        department: user.department || '',
        position: user.position || ''
      });

      setNotificationPrefs({
        emailNotifications: user.notificationPreferences?.emailNotifications ?? true,
        pushNotifications: user.notificationPreferences?.pushNotifications ?? false,
        policyUpdates: user.notificationPreferences?.policyUpdates ?? true,
        trainingReminders: user.notificationPreferences?.trainingReminders ?? true,
        systemAlerts: user.notificationPreferences?.systemAlerts ?? false
      });
    } catch (err) {
      setError('Failed to load profile data');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setNotificationPrefs(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      await authAPI.updateDetails(personalInfo);
      setSuccess('Personal information updated successfully!');
    } catch (err) {
      setError('Failed to update personal information');
      console.error('Profile update error:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      await authAPI.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError('Failed to change password. Please check your current password.');
      console.error('Password change error:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleNotificationSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);

      await authAPI.updateNotificationPreferences(notificationPrefs);
      setSuccess('Notification preferences updated successfully!');
    } catch (err) {
      setError('Failed to update notification preferences');
      console.error('Notification preferences update error:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-settings">
        <div className="settings-header">
          <h1>Profile Settings</h1>
          <p>Loading profile...</p>
        </div>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="profile-settings">
      <div className="settings-header">
        <h1>Profile Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="settings-container">
        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveTab('personal')}
          >
            Personal Information
          </button>
          <button
            className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Change Password
          </button>
          <button
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
        </div>

        <div className="settings-content">
          {activeTab === 'personal' && (
            <form onSubmit={handlePersonalInfoSubmit} className="settings-form">
              <h2>Personal Information</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={personalInfo.firstName}
                    onChange={handlePersonalInfoChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={personalInfo.lastName}
                    onChange={handlePersonalInfoChange}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={personalInfo.email}
                  onChange={handlePersonalInfoChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={personalInfo.phone}
                  onChange={handlePersonalInfoChange}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={personalInfo.department}
                    onChange={handlePersonalInfoChange}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="position">Position</label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={personalInfo.position}
                    onChange={handlePersonalInfoChange}
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={updating}>
                {updating ? 'Updating...' : 'Update Information'}
              </button>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="settings-form">
              <h2>Change Password</h2>
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                  minLength="6"
                />
              </div>
              <button type="submit" className="btn-primary" disabled={updating}>
                {updating ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          )}

          {activeTab === 'notifications' && (
            <form onSubmit={handleNotificationSubmit} className="settings-form">
              <h2>Notification Preferences</h2>
              <div className="notification-settings">
                <div className="setting-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="emailNotifications"
                      checked={notificationPrefs.emailNotifications}
                      onChange={handleNotificationChange}
                    />
                    <span className="checkmark"></span>
                    Email Notifications
                  </label>
                  <p className="setting-description">Receive notifications via email</p>
                </div>
                <div className="setting-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="pushNotifications"
                      checked={notificationPrefs.pushNotifications}
                      onChange={handleNotificationChange}
                    />
                    <span className="checkmark"></span>
                    Push Notifications
                  </label>
                  <p className="setting-description">Receive push notifications in browser</p>
                </div>
                <div className="setting-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="policyUpdates"
                      checked={notificationPrefs.policyUpdates}
                      onChange={handleNotificationChange}
                    />
                    <span className="checkmark"></span>
                    Policy Updates
                  </label>
                  <p className="setting-description">Get notified when policies are updated</p>
                </div>
                <div className="setting-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="trainingReminders"
                      checked={notificationPrefs.trainingReminders}
                      onChange={handleNotificationChange}
                    />
                    <span className="checkmark"></span>
                    Training Reminders
                  </label>
                  <p className="setting-description">Receive reminders for upcoming trainings</p>
                </div>
                <div className="setting-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="systemAlerts"
                      checked={notificationPrefs.systemAlerts}
                      onChange={handleNotificationChange}
                    />
                    <span className="checkmark"></span>
                    System Alerts
                  </label>
                  <p className="setting-description">Important system notifications and alerts</p>
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={updating}>
                {updating ? 'Updating...' : 'Update Preferences'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;