import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ setCurrentPage }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
        >
          ☰
        </button>
      </div>
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          <li className="sidebar-item">
            <button className="sidebar-link" onClick={() => setCurrentPage('dashboard')}>
              <span className="sidebar-icon">📊</span>
              <span className="sidebar-text">Dashboard</span>
            </button>
          </li>
          <li className="sidebar-item">
            <button className="sidebar-link" onClick={() => setCurrentPage('employee-dashboard')}>
              <span className="sidebar-icon">👤</span>
              <span className="sidebar-text">Employee Dashboard</span>
            </button>
          </li>
          <li className="sidebar-item">
            <button className="sidebar-link" onClick={() => setCurrentPage('my-policies')}>
              <span className="sidebar-icon">📋</span>
              <span className="sidebar-text">My Policies</span>
            </button>
          </li>
          <li className="sidebar-item">
            <button className="sidebar-link" onClick={() => setCurrentPage('notifications')}>
              <span className="sidebar-icon">🔔</span>
              <span className="sidebar-text">Notifications</span>
            </button>
          </li>
          <li className="sidebar-item">
            <button className="sidebar-link" onClick={() => setCurrentPage('projects')}>
              <span className="sidebar-icon">📁</span>
              <span className="sidebar-text">Projects</span>
            </button>
          </li>
          <li className="sidebar-item">
            <button className="sidebar-link" onClick={() => setCurrentPage('tasks')}>
              <span className="sidebar-icon">📝</span>
              <span className="sidebar-text">Tasks</span>
            </button>
          </li>
          <li className="sidebar-item">
            <button className="sidebar-link" onClick={() => setCurrentPage('profile-settings')}>
              <span className="sidebar-icon">⚙️</span>
              <span className="sidebar-text">Profile Settings</span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
