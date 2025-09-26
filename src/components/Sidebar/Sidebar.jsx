import React, { useState } from 'react';
import './Sidebar.css';

const menuItems = [
  { key: 'dashboard', label: 'Dashboard', icon: 'DB' },
  { key: 'projects', label: 'Projects', icon: 'PR' },
  { key: 'tasks', label: 'Tasks', icon: 'TS' },
];

const Sidebar = ({ currentPage = 'dashboard', onNavigate }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleItemClick = (key) => {
    if (typeof onNavigate === 'function') {
      onNavigate(key);
    } else {
      const nextPath = key === 'dashboard' ? '/' : `/${key}`;
      window.location.href = nextPath;
    }

    if (window.innerWidth <= 768) {
      setIsCollapsed(true);
    }
  };

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle Sidebar"
          type="button"
        >
          MENU
        </button>
      </div>
      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.key} className="sidebar-item">
              <button
                type="button"
                className={`sidebar-link ${currentPage === item.key ? 'active' : ''}`}
                onClick={() => handleItemClick(item.key)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-text">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
