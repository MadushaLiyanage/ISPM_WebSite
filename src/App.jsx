import React from 'react';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import EmployeeDashboard from './pages/EmployeeDashboard';
import MyPolicies from './pages/MyPolicies';
import ProfileSettings from './pages/ProfileSettings';
import Notifications from './pages/Notifications';
import { authAPI } from './services/api';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = React.useState('dashboard');
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await authAPI.getMe();
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCurrentPage('dashboard');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch(currentPage) {
      case 'projects':
        return <Projects />;
      case 'tasks':
        return <Tasks />;
      case 'employee-dashboard':
        return <EmployeeDashboard />;
      case 'my-policies':
        return <MyPolicies />;
      case 'profile-settings':
        return <ProfileSettings />;
      case 'notifications':
        return <Notifications />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  return (
    <MainLayout setCurrentPage={setCurrentPage} user={user} onLogout={handleLogout}>
      {renderPage()}
    </MainLayout>
  );
}

export default App
