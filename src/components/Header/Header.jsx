import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { toast } from 'react-hot-toast';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>SecureGuard</h1>
        </div>
        <nav className="navigation">
          <ul className="nav-list">
            <li><Link to="/dashboard" className="nav-link">Dashboard</Link></li>
            <li><Link to="/projects" className="nav-link">Projects</Link></li>
            <li><Link to="/tasks" className="nav-link">Tasks</Link></li>
            <li><Link to="/reports" className="nav-link">Reports</Link></li>
          </ul>
        </nav>
        <div className="user-menu">
          <div className="user-info">
            <span>Welcome, {user?.name || 'User'}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;