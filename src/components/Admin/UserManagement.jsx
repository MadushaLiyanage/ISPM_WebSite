import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  UserCheck, 
  UserX, 
  Filter,
  Download,
  MoreVertical
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import UserModal from './UserModal';
import './UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  
  // Bulk selection
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filters, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        ...filters
      };
      
      const response = await adminAPI.getUsers(params);
      const { users: userData, pagination: paginationData } = response.data.data;
      
      setUsers(userData);
      setPagination(paginationData);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Users fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setModalMode('create');
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setModalMode('edit');
    setShowUserModal(true);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setModalMode('view');
    setShowUserModal(true);
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      return;
    }

    try {
      await adminAPI.deleteUser(user._id);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
      console.error('Delete user error:', error);
    }
  };

  const handleToggleUserStatus = async (user) => {
    try {
      if (user.isActive) {
        const reason = prompt('Reason for deactivation:');
        if (!reason) return;
        await adminAPI.deactivateUser(user._id, reason);
        toast.success('User deactivated successfully');
      } else {
        await adminAPI.reactivateUser(user._id);
        toast.success('User reactivated successfully');
      }
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
      console.error('Toggle user status error:', error);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => {
      const newSelection = prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId];
      
      setShowBulkActions(newSelection.length > 0);
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
      setShowBulkActions(false);
    } else {
      const allIds = users.map(user => user._id);
      setSelectedUsers(allIds);
      setShowBulkActions(true);
    }
  };

  const handleBulkRoleAssignment = async () => {
    const role = prompt('Enter new role (user, admin, manager, super-admin):');
    if (!role || !['user', 'admin', 'manager', 'super-admin'].includes(role)) {
      toast.error('Invalid role');
      return;
    }

    try {
      await adminAPI.bulkRoleAssignment({
        userIds: selectedUsers,
        role
      });
      toast.success(`Role updated for ${selectedUsers.length} users`);
      setSelectedUsers([]);
      setShowBulkActions(false);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update roles');
      console.error('Bulk role assignment error:', error);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      'super-admin': 'purple',
      'admin': 'blue',
      'manager': 'orange',
      'user': 'green'
    };
    return colors[role] || 'gray';
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'green' : 'red';
  };

  if (loading && users.length === 0) {
    return (
      <div className="user-management loading">
        <div className="loading-spinner">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="page-header">
        <div className="header-left">
          <h1><Users size={24} /> User Management</h1>
          <p>Manage user accounts, roles, and permissions</p>
        </div>
        <button className="btn primary" onClick={handleCreateUser}>
          <Plus size={16} />
          Add User
        </button>
      </div>

      {/* Filters and Search */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="filters">
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="super-admin">Super Admin</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="createdAt">Date Created</option>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="lastLogin">Last Login</option>
          </select>

          <select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && (
        <div className="bulk-actions">
          <span>{selectedUsers.length} users selected</span>
          <div className="bulk-buttons">
            <button className="btn secondary" onClick={handleBulkRoleAssignment}>
              Change Role
            </button>
            <button 
              className="btn danger"
              onClick={() => {
                setSelectedUsers([]);
                setShowBulkActions(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={handleSelectAll}
                />
              </th>
              <th>User</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user._id)}
                    onChange={() => handleUserSelect(user._id)}
                  />
                </td>
                <td>
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="user-details">
                      <div className="user-name">{user.name}</div>
                      <div className="user-email">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </td>
                <td>{user.department || '-'}</td>
                <td>
                  <span className={`status-badge ${getStatusColor(user.isActive)}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  {user.lastLogin 
                    ? new Date(user.lastLogin).toLocaleDateString()
                    : 'Never'
                  }
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="action-btn view"
                      onClick={() => handleViewUser(user)}
                      title="View user"
                    >
                      <Users size={14} />
                    </button>
                    <button
                      className="action-btn edit"
                      onClick={() => handleEditUser(user)}
                      title="Edit user"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="action-btn toggle"
                      onClick={() => handleToggleUserStatus(user)}
                      title={user.isActive ? 'Deactivate user' : 'Activate user'}
                    >
                      {user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                    </button>
                    <button
                      className="action-btn delete"
                      onClick={() => handleDeleteUser(user)}
                      title="Delete user"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            disabled={pagination.page === 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            Previous
          </button>
          
          <div className="page-numbers">
            {[...Array(pagination.pages)].map((_, index) => (
              <button
                key={index + 1}
                className={pagination.page === index + 1 ? 'active' : ''}
                onClick={() => handlePageChange(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>
          
          <button
            disabled={pagination.page === pagination.pages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* User Modal */}
      {showUserModal && (
        <UserModal
          user={selectedUser}
          mode={modalMode}
          onClose={() => setShowUserModal(false)}
          onSave={() => {
            setShowUserModal(false);
            fetchUsers();
          }}
        />
      )}
    </div>
  );
};

export default UserManagement;