import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Activity, 
  BookOpen,
  Shield,
  Plus,
  TrendingUp,
  Calendar,
  BarChart3,
  ArrowRight,
  Settings,
  Edit
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../App';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('Weekly');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await adminAPI.getDashboard();
      setDashboardData(response.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="guardians-dashboard loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="guardians-dashboard error">
        <div className="error-message">Failed to load dashboard data</div>
      </div>
    );
  }

  const { overview, emailEngagement } = dashboardData;

  return (
    <div className="guardians-dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1>Admin Dashboard</h1>
            <p>Overview of employees, content, quizzes, and simulations</p>
          </div>
          <div className="header-actions">
            <button className="action-btn primary">
              <Plus size={16} />
              
            </button>
            <button className="action-btn secondary">
              <Plus size={16} />
              
            </button>
            <button className="action-btn tertiary">
              <Plus size={16} />
              
            </button>
          </div>
        </div>
      </div>

      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <div className="welcome-text">
            <h2>Welcome, {user?.name || 'Admin'} 👋</h2>
            <p>Here's what's happening across employees, content, quizzes, and simulations today.</p>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Employees</span>
            <span className="metric-action">View →</span>
          </div>
          <div className="metric-value">{overview.employees || 7}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Active Content</span>
            <span className="metric-action">View →</span>
          </div>
          <div className="metric-value">{overview.activeContent || 3}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Published Quizzes</span>
            <span className="metric-action">View →</span>
          </div>
          <div className="metric-value">{overview.publishedQuizzes || 2} / {overview.totalQuizzes || 15}</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Phishing Campaigns</span>
            <span className="metric-action">View →</span>
          </div>
          <div className="metric-value">{overview.phishingCampaigns || 4}</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Email Engagement Trends */}
        <div className="dashboard-card email-trends">
          <div className="card-header">
            <h3>Email Engagement Trends</h3>
            <div className="period-selector">
              <select 
                value={selectedPeriod} 
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
              </select>
              <span className="overview-link">Weekly Overview</span>
            </div>
          </div>
          <div className="chart-container">
            <div className="chart-data">
              <div className="chart-bars">
                {emailEngagement?.weekly?.map((data, index) => (
                  <div key={index} className="chart-bar">
                    <div 
                      className="bar-fill"
                      style={{ height: `${data.value}%` }}
                    ></div>
                    <span className="bar-label">{data.period}</span>
                  </div>
                )) || [
                  <div key="0" className="chart-bar">
                    <div className="bar-fill" style={{ height: '85%' }}></div>
                    <span className="bar-label">2025-38</span>
                  </div>,
                  <div key="1" className="chart-bar">
                    <div className="bar-fill" style={{ height: '92%' }}></div>
                    <span className="bar-label">2025-39</span>
                  </div>,
                  <div key="2" className="chart-bar">
                    <div className="bar-fill" style={{ height: '100%' }}></div>
                    <span className="bar-label">2025-40</span>
                  </div>
                ]}
              </div>
              <div className="chart-axis">
                <span>0</span>
                <span>2</span>
                <span>4</span>
                <span>6</span>
                <span>8</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="dashboard-card quick-links">
          <div className="card-header">
            <h3>Quick Links</h3>
          </div>
          <div className="links-grid">
            <div className="link-item">
              <Users size={20} />
              <span>Manage Employees</span>
            </div>
            <div className="link-item">
              <BookOpen size={20} />
              <span>Manage Quizzes</span>
            </div>
            <div className="link-item">
              <Shield size={20} />
              <span>Phishing Simulation</span>
            </div>
            <div className="link-item">
              <Activity size={20} />
              <span>Policy Management</span>
            </div>
            <div className="link-item activate">
              <Settings size={20} />
              <span>Edit Profile</span>
              <span className="activate-text">Activate</span>
              <span className="activate-subtext">Go to Settings to activate Windows</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;