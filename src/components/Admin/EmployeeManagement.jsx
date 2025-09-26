import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  MoreVertical,
  Download,
  Upload
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import EmployeeModal from './EmployeeModal';
import './EmployeeManagement.css';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showActions, setShowActions] = useState({});

  useEffect(() => {
    fetchEmployees();
  }, [currentPage, searchTerm, filterRole, filterStatus]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      console.log('Fetching employees...');
      
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        ...(filterRole !== 'all' && { role: filterRole }),
        ...(filterStatus !== 'all' && { status: filterStatus === 'active' ? 'active' : 'inactive' })
      };

      console.log('Fetch params:', params);
      const response = await adminAPI.getEmployees(params);
      console.log('Employees response:', response.data);
      
      if (response.data && response.data.success) {
        setEmployees(response.data.data.employees);
        setTotalPages(response.data.data.pagination.totalPages);
      } else {
        console.error('Invalid response format:', response.data);
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Fetch employees error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch employees';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = () => {
    setEditingEmployee(null);
    setShowModal(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setShowModal(true);
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (!window.confirm('Are you sure you want to delete this employee? This will deactivate their account.')) {
      return;
    }

    try {
      console.log('Attempting to delete employee:', employeeId);
      const response = await adminAPI.deleteEmployee(employeeId);
      console.log('Delete response:', response);
      
      if (response.data && response.data.success) {
        toast.success('Employee deleted successfully');
        fetchEmployees();
      } else {
        throw new Error(response.data?.message || 'Delete operation failed');
      }
    } catch (error) {
      console.error('Delete employee error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete employee';
      toast.error(errorMessage);
    }
  };

  const handleToggleStatus = async (employee) => {
    try {
      console.log('Toggling status for employee:', employee._id, 'Current status:', employee.isActive);
      
      if (employee.isActive) {
        const response = await adminAPI.deactivateEmployee(employee._id, 'Administrative action');
        console.log('Deactivate response:', response);
        
        if (response.data && response.data.success) {
          toast.success('Employee deactivated successfully');
        } else {
          throw new Error(response.data?.message || 'Deactivation failed');
        }
      } else {
        const response = await adminAPI.activateEmployee(employee._id);
        console.log('Activate response:', response);
        
        if (response.data && response.data.success) {
          toast.success('Employee reactivated successfully');
        } else {
          throw new Error(response.data?.message || 'Activation failed');
        }
      }
      fetchEmployees();
    } catch (error) {
      console.error('Toggle status error:', error);
      const errorMessage = error.response?.data?.message || error.message || `Failed to ${employee.isActive ? 'deactivate' : 'reactivate'} employee`;
      toast.error(errorMessage);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedEmployees.length === 0) {
      toast.error('Please select employees first');
      return;
    }

    try {
      const bulkData = {
        employeeIds: selectedEmployees,
        action: action,
        data: action === 'deactivate' ? { reason: 'Bulk administrative action' } : {}
      };
      
      await adminAPI.bulkEmployeeAction(bulkData);
      
      switch (action) {
        case 'activate':
          toast.success('Selected employees activated successfully');
          break;
        case 'deactivate':
          toast.success('Selected employees deactivated successfully');
          break;
        case 'delete':
          if (!window.confirm('Are you sure you want to delete selected employees?')) {
            return;
          }
          // For delete, we need to call individual delete endpoints
          for (const id of selectedEmployees) {
            await adminAPI.deleteEmployee(id);
          }
          toast.success('Selected employees deleted successfully');
          break;
        default:
          break;
      }
      
      setSelectedEmployees([]);
      fetchEmployees();
    } catch (error) {
      toast.error('Failed to perform bulk action');
      console.error('Bulk action error:', error);
    }
  };

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployees.length === employees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(employees.map(emp => emp._id));
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'super-admin': return 'role-badge super-admin';
      case 'admin': return 'role-badge admin';
      case 'manager': return 'role-badge manager';
      default: return 'role-badge user';
    }
  };

  const getStatusBadgeClass = (isActive) => {
    return isActive ? 'status-badge active' : 'status-badge inactive';
  };

  const toggleActionMenu = (employeeId) => {
    setShowActions(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || employee.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && employee.isActive) ||
                         (filterStatus === 'inactive' && !employee.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="employee-management">
      {/* Header Section */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1>
              <Users size={24} />
              Employee Management
            </h1>
            <p>Manage your organization's employees and their access permissions</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={() => handleBulkAction('export')}>
              <Download size={16} />
              Export
            </button>
            <button className="btn btn-secondary">
              <Upload size={16} />
              Import
            </button>
            <button className="btn btn-primary" onClick={handleCreateEmployee}>
              <Plus size={16} />
              Add Employee
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-section">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filters">
          <select 
            value={filterRole} 
            onChange={(e) => setFilterRole(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
            <option value="super-admin">Super Admin</option>
          </select>
          
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {selectedEmployees.length > 0 && (
          <div className="bulk-actions">
            <span className="selected-count">
              {selectedEmployees.length} selected
            </span>
            <button 
              className="btn btn-sm btn-success"
              onClick={() => handleBulkAction('activate')}
            >
              Activate
            </button>
            <button 
              className="btn btn-sm btn-warning"
              onClick={() => handleBulkAction('deactivate')}
            >
              Deactivate
            </button>
            <button 
              className="btn btn-sm btn-danger"
              onClick={() => handleBulkAction('delete')}
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Employee Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading employees...</p>
          </div>
        ) : (
          <table className="employee-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={selectedEmployees.length === employees.length && employees.length > 0}
                    onChange={handleSelectAll}
                  />
                </th>
                <th>Employee</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee._id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(employee._id)}
                      onChange={() => handleSelectEmployee(employee._id)}
                    />
                  </td>
                  <td>
                    <div className="employee-info">
                      <div className="employee-avatar">
                        {employee.avatar ? (
                          <img src={employee.avatar} alt={employee.name} />
                        ) : (
                          <span>{employee.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="employee-details">
                        <div className="employee-name">{employee.name}</div>
                        <div className="employee-email">
                          <Mail size={14} />
                          {employee.email}
                        </div>
                        {employee.phone && (
                          <div className="employee-phone">
                            <Phone size={14} />
                            {employee.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={getRoleBadgeClass(employee.role)}>
                      <Shield size={12} />
                      {employee.role.replace('-', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className="department">
                      {employee.department || 'Not assigned'}
                    </span>
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(employee.isActive)}>
                      {employee.isActive ? (
                        <>
                          <UserCheck size={12} />
                          Active
                        </>
                      ) : (
                        <>
                          <UserX size={12} />
                          Inactive
                        </>
                      )}
                    </span>
                  </td>
                  <td>
                    <div className="last-login">
                      <Calendar size={14} />
                      {employee.lastLogin 
                        ? new Date(employee.lastLogin).toLocaleDateString()
                        : 'Never'
                      }
                    </div>
                  </td>
                  <td>
                    <div className="actions-menu">
                      <button 
                        className="action-trigger"
                        onClick={() => toggleActionMenu(employee._id)}
                      >
                        <MoreVertical size={16} />
                      </button>
                      {showActions[employee._id] && (
                        <div className="action-dropdown">
                          <button 
                            className="action-item"
                            onClick={() => {
                              handleEditEmployee(employee);
                              setShowActions({});
                            }}
                          >
                            <Edit size={14} />
                            Edit
                          </button>
                          <button 
                            className="action-item"
                            onClick={() => {
                              handleToggleStatus(employee);
                              setShowActions({});
                            }}
                          >
                            {employee.isActive ? (
                              <>
                                <UserX size={14} />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <UserCheck size={14} />
                                Activate
                              </>
                            )}
                          </button>
                          <button 
                            className="action-item danger"
                            onClick={() => {
                              handleDeleteEmployee(employee._id);
                              setShowActions({});
                            }}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && filteredEmployees.length === 0 && (
          <div className="empty-state">
            <Users size={48} />
            <h3>No employees found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button 
            className="btn btn-secondary"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`page-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button 
            className="btn btn-secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      )}

      {/* Employee Modal */}
      {showModal && (
        <EmployeeModal
          employee={editingEmployee}
          onClose={() => setShowModal(false)}
          onSave={() => {
            setShowModal(false);
            fetchEmployees();
          }}
        />
      )}
    </div>
  );
};

export default EmployeeManagement;