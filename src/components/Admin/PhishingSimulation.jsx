import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Eye, 
  Edit2, 
  Trash2, 
  Play,
  RefreshCw,
  Calendar,
  Users,
  Mail,
  Activity,
  CheckCircle,
  AlertCircle,
  StopCircle
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import PhishingModal from './PhishingModal';
import './PhishingSimulation.css';

const PhishingSimulation = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'

  useEffect(() => {
    fetchCampaigns();
  }, [currentPage, searchTerm, filterStatus]);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 12,
        search: searchTerm,
        ...(filterStatus !== 'all' && { status: filterStatus })
      };
      
      const response = await adminAPI.getPhishingCampaigns(params);
      
      if (response.data.success) {
        setCampaigns(response.data.data.campaigns);
        setTotalPages(response.data.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to fetch phishing campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setSelectedCampaign(null);
    setModalMode('create');
    setShowCampaignModal(true);
  };

  const handleEditCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    setModalMode('edit');
    setShowCampaignModal(true);
  };

  const handleViewDetails = (campaign) => {
    setSelectedCampaign(campaign);
    setModalMode('view');
    setShowCampaignModal(true);
  };

  const handleDeleteCampaign = async (campaignId) => {
    if (window.confirm('Are you sure you want to delete this phishing template?')) {
      try {
        await adminAPI.deletePhishingCampaign(campaignId);
        toast.success('Template deleted successfully');
        fetchCampaigns();
      } catch (error) {
        console.error('Error deleting campaign:', error);
        toast.error('Failed to delete template');
      }
    }
  };

  const handleLaunchSimulation = async (campaignId) => {
    try {
      const response = await adminAPI.launchPhishingSimulation(campaignId);
      if (response.data.success) {
        toast.success('Phishing simulation launched successfully');
        fetchCampaigns();
      }
    } catch (error) {
      console.error('Error launching simulation:', error);
      toast.error('Failed to launch simulation');
    }
  };

  const handleStopSimulation = async (campaignId) => {
    if (window.confirm('Are you sure you want to stop this simulation?')) {
      try {
        const response = await adminAPI.stopPhishingSimulation(campaignId);
        if (response.data.success) {
          toast.success('Simulation stopped successfully');
          fetchCampaigns();
        }
      } catch (error) {
        console.error('Error stopping simulation:', error);
        toast.error('Failed to stop simulation');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { label: 'DRAFT', color: 'gray', icon: Edit2 },
      scheduled: { label: 'SCHEDULED', color: 'blue', icon: Calendar },
      active: { label: 'ACTIVE', color: 'green', icon: Play },
      completed: { label: 'COMPLETED', color: 'purple', icon: CheckCircle },
      cancelled: { label: 'CANCELLED', color: 'red', icon: StopCircle }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;
    
    return (
      <span className={`status-badge ${config.color}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  const getTemplateIcon = (template) => {
    const icons = {
      email: Mail,
      sms: Activity,
      'social-media': Users,
      website: Activity
    };
    return icons[template] || Mail;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const defaultTemplates = [
    {
      _id: 'template1',
      name: 'Suspicious Activity',
      description: 'Suspicious activity notice',
      content: { subject: 'Suspicious activity notice' },
      status: 'draft',
      template: 'email',
      createdAt: new Date(),
      metrics: { totalSent: 0, totalClicked: 0, totalReported: 0 }
    },
    {
      _id: 'template2',
      name: 'Device Login',
      description: 'New device login',
      content: { subject: 'New device login' },
      status: 'draft',
      template: 'email',
      createdAt: new Date(),
      metrics: { totalSent: 0, totalClicked: 0, totalReported: 0 }
    },
    {
      _id: 'template3',
      name: 'Account Activity Alert',
      description: 'Unusual Activity Detected on Your Account',
      content: { subject: 'Unusual Activity Detected on Your Account' },
      status: 'draft',
      template: 'email',
      createdAt: new Date(),
      metrics: { totalSent: 0, totalClicked: 0, totalReported: 0 }
    }
  ];

  const displayCampaigns = campaigns.length > 0 ? campaigns : defaultTemplates;

  return (
    <div className="phishing-simulation">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Phishing Simulation</h1>
            <p>Manage phishing templates and launch simulations.</p>
          </div>
        </div>
      </div>

      {/* Template Manager Section */}
      <div className="template-manager-section">
        <div className="section-header">
          <h2>Template Manager</h2>
          <button className="btn-primary create-template-btn" onClick={handleCreateTemplate}>
            CREATE TEMPLATE
          </button>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading templates...</p>
          </div>
        ) : (
          <div className="templates-grid">
            {displayCampaigns.map((campaign) => {
              const TemplateIcon = getTemplateIcon(campaign.template);
              
              return (
                <div key={campaign._id} className="template-card">
                  <div className="template-card-header">
                    <div className="template-info">
                      <div className="template-icon">
                        <TemplateIcon size={24} />
                      </div>
                      <div className="template-details">
                        <h3 className="template-title">{campaign.name}</h3>
                        <p className="template-description">
                          Subject: {campaign.content?.subject || campaign.description}
                        </p>
                      </div>
                    </div>
                    <div className="template-status">
                      {getStatusBadge(campaign.status)}
                    </div>
                  </div>

                  <div className="template-card-actions">
                    <button
                      className="action-btn launch-btn"
                      onClick={() => campaign.status === 'active' 
                        ? handleStopSimulation(campaign._id) 
                        : handleLaunchSimulation(campaign._id)}
                      disabled={!campaign._id.startsWith('template')}
                    >
                      {campaign.status === 'active' ? (
                        <>
                          <StopCircle size={16} />
                          STOP SIMULATION
                        </>
                      ) : (
                        <>
                          <Play size={16} />
                          LAUNCH SIMULATION
                        </>
                      )}
                    </button>
                    
                    <button
                      className="action-btn view-btn"
                      onClick={() => handleViewDetails(campaign)}
                    >
                      <Eye size={16} />
                      View Details
                    </button>
                  </div>

                  <div className="template-card-footer">
                    <button
                      className="footer-btn edit-btn"
                      onClick={() => handleEditCampaign(campaign)}
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                    
                    <button
                      className="footer-btn delete-btn"
                      onClick={() => handleDeleteCampaign(campaign._id)}
                      disabled={!campaign._id.startsWith('template')}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="pagination-btn"
            >
              Previous
            </button>
            
            <div className="page-numbers">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  className={`page-btn ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Campaign Modal */}
      {showCampaignModal && (
        <PhishingModal
          campaign={selectedCampaign}
          mode={modalMode}
          onClose={() => setShowCampaignModal(false)}
          onSave={() => {
            setShowCampaignModal(false);
            fetchCampaigns();
          }}
        />
      )}
    </div>
  );
};

export default PhishingSimulation;