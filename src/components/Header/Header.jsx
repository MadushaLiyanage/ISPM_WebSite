import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      // Call backend logout endpoint (optional)
      await fetch('/api/auth/logout', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.log('Logout request failed, but continuing with local logout');
    } finally {
      // Clear authentication state and redirect to login
      logout();
      navigate('/login');
    }
  };
  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <h1>IPSM Web</h1>
        </div>
        <nav className="navigation">
          <ul className="nav-list">
            <li>
              <button 
                onClick={() => handleNavigation('/dashboard')} 
                className="nav-link"
              >
                Dashboard
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleNavigation('/projects')} 
                className="nav-link"
              >
                Projects
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleNavigation('/tasks')} 
                className="nav-link"
              >
                Tasks
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleNavigation('/reports')} 
                className="nav-link"
              >
                Reports
              </button>
            </li>
          </ul>
        </nav>
        <div className="user-menu">
          <div className="user-info">
            <span>Welcome, {user?.name || 'User'}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;