import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1 className="dashboard-title">Dashboard Overview</h1>
          <p className="welcome-message">{greeting}! Here's what's happening with your projects today.</p>
        </div>
        <div className="date-section">
          <div className="current-date">
            <span className="date-label">Today</span>
            <span className="date-value">{currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card projects">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 4V20H21V4H3ZM19 18H5V6H19V18Z" fill="currentColor"/>
              <path d="M7 8H17V10H7V8Z" fill="currentColor"/>
              <path d="M7 12H17V14H7V12Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Total Projects</h3>
            <p className="stat-number">12</p>
            <span className="stat-trend positive">+2 this month</span>
          </div>
        </div>
        
        <div className="stat-card completed">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 16.2L4.8 12L3.4 13.4L9 19L21 7L19.6 5.6L9 16.2Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Completed Tasks</h3>
            <p className="stat-number">45</p>
            <span className="stat-trend positive">+8 this week</span>
          </div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Pending Tasks</h3>
            <p className="stat-number">8</p>
            <span className="stat-trend neutral">2 due today</span>
          </div>
        </div>
        
        <div className="stat-card team">
          <div className="stat-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 4C16.55 4 17 4.45 17 5C17 5.55 16.55 6 16 6C15.45 6 15 5.55 15 5C15 4.45 15.45 4 16 4ZM13 13V7H14L15.5 9.5L17.5 7H19V13H17.5V10.5L15.5 13L13.5 10.5V13H13ZM12.5 11.5C12.5 10.66 11.84 10 11 10H8V9C8 8.45 7.55 8 7 8C6.45 8 6 8.45 6 9V10H4V11H6V16H8V11H11C11.28 11 11.5 11.22 11.5 11.5V16H13V11.5C13 11.22 12.78 11 12.5 11Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="stat-content">
            <h3>Team Members</h3>
            <p className="stat-number">15</p>
            <span className="stat-trend positive">3 active now</span>
          </div>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-section projects-section">
          <div className="section-header">
            <h2>Recent Projects</h2>
            <button className="view-all-btn">View All</button>
          </div>
          <div className="project-list">
            <div className="project-item active">
              <div className="project-header">
                <div className="project-info">
                  <h4>Project Alpha</h4>
                  <span className="project-status in-progress">In Progress</span>
                </div>
                <div className="project-completion">75%</div>
              </div>
              <p className="project-description">Advanced web application development with modern technologies</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '75%'}}></div>
              </div>
              <div className="project-meta">
                <span className="project-team">👥 5 members</span>
                <span className="project-deadline">Due: Jan 15, 2025</span>
              </div>
            </div>
            <div className="project-item">
              <div className="project-header">
                <div className="project-info">
                  <h4>Project Beta</h4>
                  <span className="project-status planning">Planning</span>
                </div>
                <div className="project-completion">25%</div>
              </div>
              <p className="project-description">Mobile application redesign and user experience optimization</p>
              <div className="progress-bar">
                <div className="progress-fill" style={{width: '25%'}}></div>
              </div>
              <div className="project-meta">
                <span className="project-team">👥 3 members</span>
                <span className="project-deadline">Due: Feb 28, 2025</span>
              </div>
            </div>
            <div className="project-item">
              <div className="project-header">
                <div className="project-info">
                  <h4>Project Gamma</h4>
                  <span className="project-status completed">Completed</span>
                </div>
                <div className="project-completion">100%</div>
              </div>
              <p className="project-description">Database optimization and performance enhancement project</p>
              <div className="progress-bar">
                <div className="progress-fill completed" style={{width: '100%'}}></div>
              </div>
              <div className="project-meta">
                <span className="project-team">👥 4 members</span>
                <span className="project-deadline">Completed: Dec 20, 2024</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="dashboard-section deadlines-section">
          <div className="section-header">
            <h2>Upcoming Deadlines</h2>
            <button className="calendar-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H18V1H16V3H8V1H6V3H5C3.89 3 3 3.9 3 5V19C3 20.1 3.89 21 5 21H19C20.11 21 21 20.1 21 19V5C21 3.9 20.11 3 19 3ZM19 19H5V8H19V19Z"/>
              </svg>
              Calendar
            </button>
          </div>
          <div className="deadline-list">
            <div className="deadline-item urgent">
              <div className="deadline-indicator"></div>
              <div className="deadline-content">
                <div className="deadline-main">
                  <span className="deadline-task">Complete Project Alpha Phase 1</span>
                  <span className="deadline-priority high">High Priority</span>
                </div>
                <div className="deadline-meta">
                  <span className="deadline-date">Dec 28, 2024</span>
                  <span className="deadline-time">2 days left</span>
                </div>
              </div>
            </div>
            <div className="deadline-item">
              <div className="deadline-indicator"></div>
              <div className="deadline-content">
                <div className="deadline-main">
                  <span className="deadline-task">Submit Progress Report</span>
                  <span className="deadline-priority medium">Medium Priority</span>
                </div>
                <div className="deadline-meta">
                  <span className="deadline-date">Dec 30, 2024</span>
                  <span className="deadline-time">4 days left</span>
                </div>
              </div>
            </div>
            <div className="deadline-item">
              <div className="deadline-indicator"></div>
              <div className="deadline-content">
                <div className="deadline-main">
                  <span className="deadline-task">Team Performance Review</span>
                  <span className="deadline-priority low">Low Priority</span>
                </div>
                <div className="deadline-meta">
                  <span className="deadline-date">Jan 5, 2025</span>
                  <span className="deadline-time">10 days left</span>
                </div>
              </div>
            </div>
            <div className="deadline-item">
              <div className="deadline-indicator"></div>
              <div className="deadline-content">
                <div className="deadline-main">
                  <span className="deadline-task">Budget Planning Meeting</span>
                  <span className="deadline-priority medium">Medium Priority</span>
                </div>
                <div className="deadline-meta">
                  <span className="deadline-date">Jan 8, 2025</span>
                  <span className="deadline-time">13 days left</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;