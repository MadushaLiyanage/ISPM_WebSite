import React, { useState, useEffect } from 'react';
import { X, Save, FileText } from 'lucide-react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const PolicyModal = ({ policy, mode, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: 'other',
    tags: [],
    effectiveDate: '',
    expiryDate: '',
    nextReviewDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (policy && mode !== 'create') {
      setFormData({
        title: policy.title || '',
        description: policy.description || '',
        content: policy.content || '',
        category: policy.category || 'other',
        tags: policy.tags || [],
        effectiveDate: policy.effectiveDate ? policy.effectiveDate.split('T')[0] : '',
        expiryDate: policy.expiryDate ? policy.expiryDate.split('T')[0] : '',
        nextReviewDate: policy.nextReviewDate ? policy.nextReviewDate.split('T')[0] : ''
      });
    }
  }, [policy, mode]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (!formData.effectiveDate) {
      newErrors.effectiveDate = 'Effective date is required';
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

      if (mode === 'create') {
        await adminAPI.createPolicy(submitData);
        toast.success('Policy created successfully');
      } else if (mode === 'edit') {
        await adminAPI.updatePolicy(policy._id, submitData);
        toast.success('Policy updated successfully');
      }

      onSave();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Operation failed';
      toast.error(errorMessage);
      console.error('Policy operation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const isReadOnly = mode === 'view';

  return (
    <div className="modal-overlay">
      <div className="modal policy-modal">
        <div className="modal-header">
          <h2>
            <FileText size={20} />
            {mode === 'create' && 'Create New Policy'}
            {mode === 'edit' && 'Edit Policy'}
            {mode === 'view' && 'Policy Details'}
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-content">
          <div className="form-grid">
            <div className="form-group full-width">
              <label htmlFor="title">Title *</label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                disabled={isReadOnly}
                className={errors.title ? 'error' : ''}
                placeholder="Enter policy title"
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                disabled={isReadOnly}
              >
                <option value="security">Security</option>
                <option value="privacy">Privacy</option>
                <option value="hr">HR</option>
                <option value="it">IT</option>
                <option value="compliance">Compliance</option>
                <option value="safety">Safety</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="effectiveDate">Effective Date *</label>
              <input
                id="effectiveDate"
                type="date"
                value={formData.effectiveDate}
                onChange={(e) => handleInputChange('effectiveDate', e.target.value)}
                disabled={isReadOnly}
                className={errors.effectiveDate ? 'error' : ''}
              />
              {errors.effectiveDate && <span className="error-message">{errors.effectiveDate}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="expiryDate">Expiry Date</label>
              <input
                id="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                disabled={isReadOnly}
              />
            </div>

            <div className="form-group">
              <label htmlFor="nextReviewDate">Next Review Date</label>
              <input
                id="nextReviewDate"
                type="date"
                value={formData.nextReviewDate}
                onChange={(e) => handleInputChange('nextReviewDate', e.target.value)}
                disabled={isReadOnly}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={isReadOnly}
                placeholder="Enter policy description"
                rows={3}
              />
            </div>

            <div className="form-group full-width">
              <label htmlFor="content">Content *</label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                disabled={isReadOnly}
                className={errors.content ? 'error' : ''}
                placeholder="Enter policy content"
                rows={10}
              />
              {errors.content && <span className="error-message">{errors.content}</span>}
            </div>

            {!isReadOnly && (
              <div className="form-group full-width">
                <label>Tags</label>
                <div className="tags-input">
                  <div className="tags-list">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="tag-remove"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="tag-input-row">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="Add tag and press Enter"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddTag(e);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="btn secondary small"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isReadOnly && formData.tags.length > 0 && (
              <div className="form-group full-width">
                <label>Tags</label>
                <div className="tags-list readonly">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="tag readonly">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional Info for View Mode */}
          {mode === 'view' && policy && (
            <div className="policy-details-section">
              <h3>Additional Information</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Version:</label>
                  <span>{policy.version}</span>
                </div>
                <div className="detail-item">
                  <label>Status:</label>
                  <span className={`status-badge ${policy.status}`}>
                    {policy.status}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Author:</label>
                  <span>{policy.author?.name || 'Unknown'}</span>
                </div>
                <div className="detail-item">
                  <label>Created:</label>
                  <span>{new Date(policy.createdAt).toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <label>Last Updated:</label>
                  <span>{new Date(policy.updatedAt).toLocaleString()}</span>
                </div>
                {policy.publishedDate && (
                  <div className="detail-item">
                    <label>Published:</label>
                    <span>{new Date(policy.publishedDate).toLocaleString()}</span>
                  </div>
                )}
                <div className="detail-item">
                  <label>View Count:</label>
                  <span>{policy.metadata?.viewCount || 0}</span>
                </div>
                <div className="detail-item">
                  <label>Acknowledgments:</label>
                  <span>{policy.acknowledgments?.length || 0}</span>
                </div>
              </div>
              
              {policy.file && (
                <div className="file-section">
                  <h4>Attached File</h4>
                  <div className="file-info">
                    <FileText size={16} />
                    <span>{policy.file.originalName}</span>
                    <span className="file-size">
                      ({Math.round(policy.file.size / 1024)} KB)
                    </span>
                  </div>
                </div>
              )}
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
                    {mode === 'create' ? 'Create Policy' : 'Update Policy'}
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

export default PolicyModal;