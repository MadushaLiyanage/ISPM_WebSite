import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome to your IPSM Web Dashboard</p>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Total Projects</h3>
            <p className="stat-number">12</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-content">
            <h3>Completed Tasks</h3>
            <p className="stat-number">45</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <h3>Pending Tasks</h3>
            <p className="stat-number">8</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Team Members</h3>
            <p className="stat-number">15</p>
          </div>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>Recent Projects</h2>
          <div className="project-list">
            <div className="project-item">
              <h4>Project Alpha</h4>
              <p>Status: In Progress</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '75%'}}></div>
              </div>
            </div>
            <div className="project-item">
              <h4>Project Beta</h4>
              <p>Status: Planning</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '25%'}}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="dashboard-section">
          <h2>Upcoming Deadlines</h2>
          <div className="deadline-list">
            <div className="deadline-item">
              <span className="deadline-date">Dec 28</span>
              <span className="deadline-task">Complete Project Alpha Phase 1</span>
            </div>
            <div className="deadline-item">
              <span className="deadline-date">Dec 30</span>
              <span className="deadline-task">Submit Progress Report</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;