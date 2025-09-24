import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>IPSM Web</h1>
        </div>
        <nav className="navigation">
          <ul className="nav-list">
            <li><a href="/" className="nav-link">Dashboard</a></li>
            <li><a href="/projects" className="nav-link">Projects</a></li>
            <li><a href="/tasks" className="nav-link">Tasks</a></li>
            <li><a href="/reports" className="nav-link">Reports</a></li>
          </ul>
        </nav>
        <div className="user-menu">
          <div className="user-info">
            <span>Welcome, User</span>
            <button className="logout-btn">Logout</button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;