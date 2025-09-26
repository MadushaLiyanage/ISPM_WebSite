import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Save, 
  Eye,
  Mail,
  MessageCircle,
  Users,
  Globe,
  AlertCircle
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import './PhishingModal.css';

const PhishingModal = ({ campaign, mode, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template: 'email',
    content: {
      subject: '',
      body: '',
      senderName: '',
      senderEmail: ''
    },
    status: 'draft',
    tags: [],
    settings: {
      trackClicks: true,
      trackReports: true,
      sendReminder: false,
      reminderDelay: 24
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (campaign && (mode === 'edit' || mode === 'view')) {
      setFormData({
        name: campaign.name || '',
        description: campaign.description || '',
        template: campaign.template || 'email',
        content: {
          subject: campaign.content?.subject || '',
          body: campaign.content?.body || '',
          senderName: campaign.content?.senderName || '',
          senderEmail: campaign.content?.senderEmail || ''
        },
        status: campaign.status || 'draft',
        tags: campaign.tags || [],
        settings: {
          trackClicks: campaign.settings?.trackClicks !== false,
          trackReports: campaign.settings?.trackReports !== false,
          sendReminder: campaign.settings?.sendReminder || false,
          reminderDelay: campaign.settings?.reminderDelay || 24
        }
      });
    }
  }, [campaign, mode]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSettingsChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value
      }
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (mode === 'view') return;
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Please enter a campaign name');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    
    if (formData.template === 'email') {
      if (!formData.content.subject.trim()) {
        toast.error('Please enter an email subject');
        return;
      }
      
      if (!formData.content.body.trim()) {
        toast.error('Please enter email content');
        return;
      }
    }

    setLoading(true);
    
    try {
      if (mode === 'create') {
        await adminAPI.createPhishingCampaign(formData);
        toast.success('Phishing template created successfully');
      } else if (mode === 'edit') {
        await adminAPI.updatePhishingCampaign(campaign._id, formData);
        toast.success('Template updated successfully');
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving campaign:', error);
      toast.error('Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const isViewMode = mode === 'view';

  const templateOptions = [
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'sms', label: 'SMS', icon: MessageCircle },
    { value: 'social-media', label: 'Social Media', icon: Users },
    { value: 'website', label: 'Website', icon: Globe }
  ];

  const getTemplateIcon = (template) => {
    const option = templateOptions.find(opt => opt.value === template);
    return option ? option.icon : Mail;
  };

  return (
    <div className="phishing-modal-overlay" onClick={onClose}>
      <div className="phishing-modal" onClick={(e) => e.stopPropagation()}>
        <div className="phishing-modal-header">
          <div className="modal-title">
            <h2>
              {mode === 'create' && 'Create Phishing Template'}
              {mode === 'edit' && 'Edit Phishing Template'}
              {mode === 'view' && 'Template Details'}
            </h2>
            <p>
              {mode === 'create' && 'Create a new phishing simulation template'}
              {mode === 'edit' && 'Modify template content and settings'}
              {mode === 'view' && 'Review template configuration'}
            </p>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="phishing-modal-tabs">
          <button
            className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
          >
            <AlertCircle size={16} />
            Basic Info
          </button>
          <button
            className={`tab-btn ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <Mail size={16} />
            Content
          </button>
          <button
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <Users size={16} />
            Settings
          </button>
        </div>

        <form onSubmit={handleSubmit} className="phishing-modal-form">
          <div className="modal-content">
            {activeTab === 'basic' && (
              <div className="tab-content">
                <div className="form-row">
                  <div className="form-group">
                    <label>Template Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Suspicious Activity Alert"
                      disabled={isViewMode}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe the purpose of this phishing template..."
                    rows={3}
                    disabled={isViewMode}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Template Type *</label>
                    <div className="template-selector">
                      {templateOptions.map((option) => {
                        const Icon = option.icon;
                        return (
                          <label
                            key={option.value}
                            className={`template-option ${formData.template === option.value ? 'selected' : ''}`}
                          >
                            <input
                              type="radio"
                              name="template"
                              value={option.value}
                              checked={formData.template === option.value}
                              onChange={(e) => handleInputChange('template', e.target.value)}
                              disabled={isViewMode}
                            />
                            <div className="option-content">
                              <Icon size={20} />
                              <span>{option.label}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Tags</label>
                  <div className="tags-input">
                    <div className="tags-list">
                      {formData.tags.map((tag, index) => (
                        <span key={index} className="tag">
                          {tag}
                          {!isViewMode && (
                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              className="tag-remove"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </span>
                      ))}
                    </div>
                    {!isViewMode && (
                      <div className="tag-input-container">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          placeholder="Add tag..."
                        />
                        <button type="button" onClick={addTag} className="add-tag-btn">
                          <Plus size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'content' && (
              <div className="tab-content">
                {formData.template === 'email' && (
                  <>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Sender Name</label>
                        <input
                          type="text"
                          value={formData.content.senderName}
                          onChange={(e) => handleInputChange('content.senderName', e.target.value)}
                          placeholder="e.g., IT Security Team"
                          disabled={isViewMode}
                        />
                      </div>

                      <div className="form-group">
                        <label>Sender Email</label>
                        <input
                          type="email"
                          value={formData.content.senderEmail}
                          onChange={(e) => handleInputChange('content.senderEmail', e.target.value)}
                          placeholder="e.g., security@company.com"
                          disabled={isViewMode}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Email Subject *</label>
                      <input
                        type="text"
                        value={formData.content.subject}
                        onChange={(e) => handleInputChange('content.subject', e.target.value)}
                        placeholder="e.g., Urgent: Suspicious Activity Detected"
                        disabled={isViewMode}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Email Body *</label>
                      <textarea
                        value={formData.content.body}
                        onChange={(e) => handleInputChange('content.body', e.target.value)}
                        placeholder="Enter the email content that will be sent to users..."
                        rows={10}
                        disabled={isViewMode}
                        required
                      />
                    </div>
                  </>
                )}

                {formData.template === 'sms' && (
                  <div className="form-group">
                    <label>SMS Message *</label>
                    <textarea
                      value={formData.content.body}
                      onChange={(e) => handleInputChange('content.body', e.target.value)}
                      placeholder="Enter the SMS message content..."
                      rows={4}
                      disabled={isViewMode}
                      maxLength={160}
                      required
                    />
                    <small>Max 160 characters</small>
                  </div>
                )}

                {(formData.template === 'social-media' || formData.template === 'website') && (
                  <div className="form-group">
                    <label>Content *</label>
                    <textarea
                      value={formData.content.body}
                      onChange={(e) => handleInputChange('content.body', e.target.value)}
                      placeholder={`Enter the ${formData.template} content...`}
                      rows={6}
                      disabled={isViewMode}
                      required
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="tab-content">
                <h3>Tracking Settings</h3>

                <div className="settings-grid">
                  <div className="setting-group">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={formData.settings.trackClicks}
                        onChange={(e) => handleSettingsChange('trackClicks', e.target.checked)}
                        disabled={isViewMode}
                      />
                      <span className="setting-text">
                        <strong>Track Click Events</strong>
                        <small>Monitor when users click on links in the simulation</small>
                      </span>
                    </label>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={formData.settings.trackReports}
                        onChange={(e) => handleSettingsChange('trackReports', e.target.checked)}
                        disabled={isViewMode}
                      />
                      <span className="setting-text">
                        <strong>Track Report Events</strong>
                        <small>Monitor when users report the phishing attempt</small>
                      </span>
                    </label>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <input
                        type="checkbox"
                        checked={formData.settings.sendReminder}
                        onChange={(e) => handleSettingsChange('sendReminder', e.target.checked)}
                        disabled={isViewMode}
                      />
                      <span className="setting-text">
                        <strong>Send Reminder</strong>
                        <small>Send follow-up reminder if no action taken</small>
                      </span>
                    </label>
                  </div>
                </div>

                {formData.settings.sendReminder && (
                  <div className="form-group">
                    <label>Reminder Delay (hours)</label>
                    <input
                      type="number"
                      value={formData.settings.reminderDelay}
                      onChange={(e) => handleSettingsChange('reminderDelay', parseInt(e.target.value) || 24)}
                      min="1"
                      max="168"
                      disabled={isViewMode}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="phishing-modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">
              {isViewMode ? 'Close' : 'Cancel'}
            </button>
            
            {!isViewMode && (
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? (
                  <>
                    <div className="spinner"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {mode === 'create' ? 'Create Template' : 'Update Template'}
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PhishingModal;