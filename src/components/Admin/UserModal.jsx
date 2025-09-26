import React, { useState, useEffect } from 'react';
import { X, Save, User } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const UserModal = ({ user, mode, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    department: '',
    position: '',
    phone: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user && mode !== 'create') {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
        role: user.role || 'user',
        department: user.department || '',
        position: user.position || '',
        phone: user.phone || '',
        isActive: user.isActive ?? true
      });
    }
  }, [user, mode]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (mode === 'create') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, and number';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (formData.phone && !/^[+]?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData = { ...formData };
      
      // Remove password fields if empty (for edit mode)
      if (mode === 'edit' && !submitData.password) {
        delete submitData.password;
        delete submitData.confirmPassword;
      }

      if (mode === 'create') {
        await adminAPI.createUser(submitData);
        toast.success('User created successfully');
      } else if (mode === 'edit') {
        await adminAPI.updateUser(user._id, submitData);
        toast.success('User updated successfully');
      }

      onSave();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Operation failed';
      toast.error(errorMessage);
      console.error('User operation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <div className="modal-overlay">
      <div className="modal user-modal">
        <div className="modal-header">
          <h2>
            <User size={20} />
            {mode === 'create' && 'Create New User'}
            {mode === 'edit' && 'Edit User'}
            {mode === 'view' && 'User Details'}
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-content">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="name">Name *</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={isReadOnly}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={isReadOnly}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            {(mode === 'create' || mode === 'edit') && (
              <>
                <div className="form-group">
                  <label htmlFor="password">
                    Password {mode === 'create' ? '*' : '(leave blank to keep current)'}
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={errors.password ? 'error' : ''}
                  />
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    Confirm Password {mode === 'create' ? '*' : ''}
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={errors.confirmPassword ? 'error' : ''}
                  />
                  {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                disabled={isReadOnly}
              >
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
                <option value="super-admin">Super Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="department">Department</label>
              <input
                id="department"
                type="text"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                disabled={isReadOnly}
              />
            </div>

            <div className="form-group">
              <label htmlFor="position">Position</label>
              <input
                id="position"
                type="text"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                disabled={isReadOnly}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                disabled={isReadOnly}
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            {mode !== 'create' && (
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                    disabled={isReadOnly}
                  />
                  Active Account
                </label>
              </div>
            )}
          </div>

          {/* Additional Info for View Mode */}
          {mode === 'view' && user && (
            <div className="user-details-section">
              <h3>Additional Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Created:</label>
                  <span>{new Date(user.createdAt).toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <label>Last Updated:</label>
                  <span>{new Date(user.updatedAt).toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <label>Last Login:</label>
                  <span>
                    {user.lastLogin 
                      ? new Date(user.lastLogin).toLocaleString()
                      : 'Never'
                    }
                  </span>
                </div>
                {user.deactivatedAt && (
                  <>
                    <div className="detail-item">
                      <label>Deactivated:</label>
                      <span>{new Date(user.deactivatedAt).toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <label>Deactivation Reason:</label>
                      <span>{user.deactivationReason || 'No reason provided'}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {!isReadOnly && (
            <div className="modal-actions">
              <button type="button" className="btn secondary" onClick={onClose}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn primary" 
                disabled={loading}
              >
                {loading ? (
                  'Saving...'
                ) : (
                  <>
                    <Save size={16} />
                    {mode === 'create' ? 'Create User' : 'Update User'}
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UserModal;