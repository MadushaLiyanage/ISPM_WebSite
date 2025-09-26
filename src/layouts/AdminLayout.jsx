import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Activity, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronDown,
  Shield
} from 'lucide-react';
import { useAuth } from '../App';
import { toast } from 'react-hot-toast';
import './AdminLayout.css';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const navItems = [
    {
      path: '/admin',
      icon: LayoutDashboard,
      label: 'Dashboard',
      exact: true
    },
    {
      path: '/admin/employees',
      icon: Users,
      label: 'Employee Management'
    },
    {
      path: '/admin/content',
      icon: FileText,
      label: 'Educational Content'
    },
    {
      path: '/admin/quizzes',
      icon: Activity,
      label: 'Quiz Management'
    },
    {
      path: '/admin/phishing',
      icon: Shield,
      label: 'Phishing Simulation'
    },
    {
      path: '/admin/policies',
      icon: FileText,
      label: 'Policy Management'
    }
  ];

  const isActiveRoute = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="brand">
            <Shield size={24} />
            <span>SecureGuard</span>
          </div>
          <button className="close-sidebar" onClick={closeSidebar}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`nav-link ${isActiveRoute(item.path, item.exact) ? 'active' : ''}`}
                    onClick={closeSidebar}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          <div className="header-left">
            <button className="menu-toggle" onClick={toggleSidebar}>
              <Menu size={20} />
            </button>
            <h1>SecureGuard</h1>
          </div>

          <div className="header-right">
            <div className="user-menu">
              <button 
                className="user-menu-trigger"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="user-avatar small">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="user-name-header">{user?.name}</span>
                <ChevronDown size={16} />
              </button>

              {userMenuOpen && (
                <div className="user-menu-dropdown">
                  <div className="user-info-dropdown">
                    <div className="user-name">{user?.name}</div>
                    <div className="user-email">{user?.email}</div>
                    <div className="user-role-badge">{user?.role}</div>
                  </div>
                  <div className="menu-divider"></div>
                  <Link to="/dashboard" className="menu-item">
                    <LayoutDashboard size={16} />
                    User Dashboard
                  </Link>
                  <button className="menu-item" onClick={() => setUserMenuOpen(false)}>
                    <Settings size={16} />
                    Settings
                  </button>
                  <div className="menu-divider"></div>
                  <button className="menu-item logout" onClick={handleLogout}>
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          {children}
        </main>
      </div>

      {/* Sidebar Overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}
    </div>
  );
};

export default AdminLayout;