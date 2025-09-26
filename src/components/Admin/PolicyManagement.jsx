import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Upload,
  Download,
  Archive,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import PolicyModal from './PolicyModal';
import './PolicyManagement.css';

const PolicyManagement = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
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
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'

  useEffect(() => {
    fetchPolicies();
  }, [pagination.page, filters, searchTerm]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        ...filters
      };
      
      const response = await adminAPI.getPolicies(params);
      const { policies: policyData, pagination: paginationData } = response.data.data;
      
      setPolicies(policyData);
      setPagination(paginationData);
    } catch (error) {
      toast.error('Failed to load policies');
      console.error('Policies fetch error:', error);
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

  const handleCreatePolicy = () => {
    setSelectedPolicy(null);
    setModalMode('create');
    setShowPolicyModal(true);
  };

  const handleEditPolicy = (policy) => {
    setSelectedPolicy(policy);
    setModalMode('edit');
    setShowPolicyModal(true);
  };

  const handleViewPolicy = (policy) => {
    setSelectedPolicy(policy);
    setModalMode('view');
    setShowPolicyModal(true);
  };

  const handleDeletePolicy = async (policy) => {
    if (!window.confirm(`Are you sure you want to delete "${policy.title}"?`)) {
      return;
    }

    try {
      await adminAPI.deletePolicy(policy._id);
      toast.success('Policy deleted successfully');
      fetchPolicies();
    } catch (error) {
      toast.error('Failed to delete policy');
      console.error('Delete policy error:', error);
    }
  };

  const handlePublishPolicy = async (policy) => {
    if (!window.confirm(`Are you sure you want to publish "${policy.title}"?`)) {
      return;
    }

    try {
      await adminAPI.publishPolicy(policy._id);
      toast.success('Policy published successfully');
      fetchPolicies();
    } catch (error) {
      toast.error('Failed to publish policy');
      console.error('Publish policy error:', error);
    }
  };

  const handleArchivePolicy = async (policy) => {
    if (!window.confirm(`Are you sure you want to archive "${policy.title}"?`)) {
      return;
    }

    try {
      await adminAPI.archivePolicy(policy._id);
      toast.success('Policy archived successfully');
      fetchPolicies();
    } catch (error) {
      toast.error('Failed to archive policy');
      console.error('Archive policy error:', error);
    }
  };

  const handleFileUpload = async (policy, file) => {
    try {
      const formData = new FormData();
      formData.append('policyFile', file);
      
      await adminAPI.uploadPolicyFile(policy._id, formData);
      toast.success('File uploaded successfully');
      fetchPolicies();
    } catch (error) {
      toast.error('Failed to upload file');
      console.error('File upload error:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'gray',
      'under-review': 'orange',
      'published': 'green',
      'archived': 'red'
    };
    return colors[status] || 'gray';
  };

  const getCategoryColor = (category) => {
    const colors = {
      'security': 'red',
      'privacy': 'purple',
      'hr': 'blue',
      'it': 'green',
      'compliance': 'orange',
      'safety': 'yellow',
      'other': 'gray'
    };
    return colors[category] || 'gray';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && policies.length === 0) {
    return (
      <div className="policy-management loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="policy-management">
      <div className="page-header">
        <div className="header-left">
          <h1><FileText size={24} /> Policy Management</h1>
          <p>Manage organizational policies, versions, and compliance</p>
        </div>
        <button className="btn primary" onClick={handleCreatePolicy}>
          <Plus size={16} />
          Create Policy
        </button>
      </div>

      {/* Filters and Search */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search policies..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="filters">
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="security">Security</option>
            <option value="privacy">Privacy</option>
            <option value="hr">HR</option>
            <option value="it">IT</option>
            <option value="compliance">Compliance</option>
            <option value="safety">Safety</option>
            <option value="other">Other</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="under-review">Under Review</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="createdAt">Date Created</option>
            <option value="title">Title</option>
            <option value="effectiveDate">Effective Date</option>
            <option value="publishedDate">Published Date</option>
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

      {/* Policies Grid */}
      <div className="policies-grid">
        {policies.map((policy) => (
          <div key={policy._id} className="policy-card">
            <div className="card-header">
              <div className="policy-info">
                <h3 className="policy-title">{policy.title}</h3>
                <p className="policy-description">
                  {policy.description || 'No description provided'}
                </p>
              </div>
              <div className="policy-badges">
                <span className={`status-badge ${getStatusColor(policy.status)}`}>
                  {policy.status === 'published' && <CheckCircle size={12} />}
                  {policy.status === 'under-review' && <Clock size={12} />}
                  {policy.status}
                </span>
                <span className={`category-badge ${getCategoryColor(policy.category)}`}>
                  {policy.category}
                </span>
              </div>
            </div>

            <div className="policy-meta">
              <div className="meta-item">
                <span className="meta-label">Version:</span>
                <span className="meta-value">{policy.version}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Author:</span>
                <span className="meta-value">{policy.author?.name || 'Unknown'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Effective:</span>
                <span className="meta-value">{formatDate(policy.effectiveDate)}</span>
              </div>
              {policy.publishedDate && (
                <div className="meta-item">
                  <span className="meta-label">Published:</span>
                  <span className="meta-value">{formatDate(policy.publishedDate)}</span>
                </div>
              )}
            </div>

            {policy.file && (
              <div className="file-info">
                <FileText size={14} />
                <span>{policy.file.originalName}</span>
                <span className="file-size">
                  ({Math.round(policy.file.size / 1024)} KB)
                </span>
              </div>
            )}

            <div className="policy-stats">
              <div className="stat">
                <span className="stat-value">{policy.metadata?.viewCount || 0}</span>
                <span className="stat-label">Views</span>
              </div>
              <div className="stat">
                <span className="stat-value">{policy.acknowledgments?.length || 0}</span>
                <span className="stat-label">Acknowledgments</span>
              </div>
              <div className="stat">
                <span className="stat-value">{policy.metadata?.acknowledgmentRate || 0}%</span>
                <span className="stat-label">Rate</span>
              </div>
            </div>

            <div className="card-actions">
              <button
                className="action-btn view"
                onClick={() => handleViewPolicy(policy)}
                title="View policy"
              >
                <Eye size={14} />
              </button>
              
              <button
                className="action-btn edit"
                onClick={() => handleEditPolicy(policy)}
                title="Edit policy"
              >
                <Edit2 size={14} />
              </button>

              {policy.status === 'draft' && (
                <button
                  className="action-btn publish"
                  onClick={() => handlePublishPolicy(policy)}
                  title="Publish policy"
                >
                  <CheckCircle size={14} />
                </button>
              )}

              {policy.status === 'published' && (
                <button
                  className="action-btn archive"
                  onClick={() => handleArchivePolicy(policy)}
                  title="Archive policy"
                >
                  <Archive size={14} />
                </button>
              )}

              <label className="action-btn upload" title="Upload file">
                <Upload size={14} />
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.md,.txt"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      handleFileUpload(policy, e.target.files[0]);
                    }
                  }}
                  style={{ display: 'none' }}
                />
              </label>

              <button
                className="action-btn delete"
                onClick={() => handleDeletePolicy(policy)}
                title="Delete policy"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {policies.length === 0 && !loading && (
        <div className="empty-state">
          <FileText size={48} />
          <h3>No policies found</h3>
          <p>Create your first policy to get started</p>
          <button className="btn primary" onClick={handleCreatePolicy}>
            <Plus size={16} />
            Create Policy
          </button>
        </div>
      )}

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

      {/* Policy Modal */}
      {showPolicyModal && (
        <PolicyModal
          policy={selectedPolicy}
          mode={modalMode}
          onClose={() => setShowPolicyModal(false)}
          onSave={() => {
            setShowPolicyModal(false);
            fetchPolicies();
          }}
        />
      )}
    </div>
  );
};

export default PolicyManagement;