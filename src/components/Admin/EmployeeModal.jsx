import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  Shield,
  Save,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const EmployeeModal = ({ employee, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    department: '',
    position: '',
    phone: '',
    isActive: true,
    permissions: []
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name || '',
        email: employee.email || '',
        password: '', // Never pre-fill password for security
        role: employee.role || 'user',
        department: employee.department || '',
        position: employee.position || '',
        phone: employee.phone || '',
        isActive: employee.isActive !== undefined ? employee.isActive : true,
        permissions: employee.permissions || []
      });
    }
  }, [employee]);

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

    if (!employee && !formData.password) {
      newErrors.password = 'Password is required for new employees';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
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
      
      // Remove empty password field for updates
      if (employee && !submitData.password) {
        delete submitData.password;
      }

      if (employee) {
        await adminAPI.updateEmployee(employee._id, submitData);
        toast.success('Employee updated successfully');
      } else {
        await adminAPI.createEmployee(submitData);
        toast.success('Employee created successfully');
      }
      
      onSave();
    } catch (error) {
      const message = error.response?.data?.message || 
                     `Failed to ${employee ? 'update' : 'create'} employee`;
      toast.error(message);
      console.error('Employee save error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handlePermissionToggle = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const availablePermissions = [
    { key: 'users.read', label: 'View Users' },
    { key: 'users.create', label: 'Create Users' },
    { key: 'users.update', label: 'Update Users' },
    { key: 'users.delete', label: 'Delete Users' },
    { key: 'policies.read', label: 'View Policies' },
    { key: 'policies.create', label: 'Create Policies' },
    { key: 'policies.update', label: 'Update Policies' },
    { key: 'policies.delete', label: 'Delete Policies' },
    { key: 'audit.read', label: 'View Audit Logs' },
    { key: 'audit.export', label: 'Export Audit Logs' },
    { key: 'dashboard.admin', label: 'Admin Dashboard Access' }
  ];

  return (
    <div className="modal-overlay">
      <div className="modal-container employee-modal">
        <div className="modal-header">
          <h2>
            <User size={20} />
            {employee ? 'Edit Employee' : 'Add New Employee'}
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            {/* Basic Information */}
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label htmlFor="name">
                  <User size={16} />
                  Full Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'error' : ''}
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {errors.name}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <Mail size={16} />
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'error' : ''}
                  placeholder="Enter email address"
                />
                {errors.email && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <Shield size={16} />
                  Password {!employee && '*'}
                </label>
                <div className="password-input">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={errors.password ? 'error' : ''}
                    placeholder={employee ? 'Leave blank to keep current password' : 'Enter password'}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {errors.password}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  <Phone size={16} />
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Work Information */}
            <div className="form-section">
              <h3>Work Information</h3>
              
              <div className="form-group">
                <label htmlFor="role">
                  <Shield size={16} />
                  Role *
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className={errors.role ? 'error' : ''}
                >
                  <option value="">Select a role</option>
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                  <option value="super-admin">Super Admin</option>
                </select>
                {errors.role && (
                  <span className="error-message">
                    <AlertCircle size={14} />
                    {errors.role}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="department">
                  <Building size={16} />
                  Department
                </label>
                <input
                  id="department"
                  type="text"
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  placeholder="Enter department"
                />
              </div>

              <div className="form-group">
                <label htmlFor="position">
                  <MapPin size={16} />
                  Position
                </label>
                <input
                  id="position"
                  type="text"
                  value={formData.position}
                  onChange={(e) => handleInputChange('position', e.target.value)}
                  placeholder="Enter job position"
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  />
                  <span className="checkmark"></span>
                  Active Employee
                </label>
              </div>
            </div>
          </div>

          {/* Permissions Section */}
          {(formData.role === 'admin' || formData.role === 'manager') && (
            <div className="form-section full-width">
              <h3>Permissions</h3>
              <div className="permissions-grid">
                {availablePermissions.map((permission) => (
                  <label key={permission.key} className="permission-item">
                    <input
                      type="checkbox"
                      checked={formData.permissions.includes(permission.key)}
                      onChange={() => handlePermissionToggle(permission.key)}
                    />
                    <span className="checkmark"></span>
                    {permission.label}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              <Save size={16} />
              {loading ? 'Saving...' : employee ? 'Update Employee' : 'Create Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;