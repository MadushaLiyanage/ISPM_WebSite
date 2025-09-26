import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = () => {
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
            <a href="/dashboard" className="sidebar-link">
              <span className="sidebar-icon">📊</span>
              <span className="sidebar-text">Dashboard</span>
            </a>
          </li>
          <li className="sidebar-item">
            <a href="/projects" className="sidebar-link">
              <span className="sidebar-icon">📁</span>
              <span className="sidebar-text">Projects</span>
            </a>
          </li>
          <li className="sidebar-item">
            <a href="/tasks" className="sidebar-link">
              <span className="sidebar-icon">✓</span>
              <span className="sidebar-text">Tasks</span>
            </a>
          </li>
          <li className="sidebar-item">
            <a href="/calendar" className="sidebar-link">
              <span className="sidebar-icon">📅</span>
              <span className="sidebar-text">Calendar</span>
            </a>
          </li>
          <li className="sidebar-item">
            <a href="/reports" className="sidebar-link">
              <span className="sidebar-icon">📈</span>
              <span className="sidebar-text">Reports</span>
            </a>
          </li>
          <li className="sidebar-item">
            <a href="/settings" className="sidebar-link">
              <span className="sidebar-icon">⚙️</span>
              <span className="sidebar-text">Settings</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;