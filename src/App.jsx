import React from 'react';
import MainLayout from './layouts/MainLayout';
import ManagerLayout from './layouts/ManagerLayout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import TeamManagement from './pages/manager/Team_management';
import './App.css';

const validPages = new Set(['dashboard', 'projects', 'tasks', 'team-management']);

function resolvePageFromPathname(pathname) {
  const slug = pathname.replace(/^\//, '') || 'dashboard';
  return validPages.has(slug) ? slug : 'dashboard';
}

function App() {
  const [currentPage, setCurrentPage] = React.useState(() => resolvePageFromPathname(window.location.pathname));

  React.useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(resolvePageFromPathname(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = React.useCallback((page) => {
    const nextPage = validPages.has(page) ? page : 'dashboard';
    setCurrentPage(nextPage);
    const nextPath = nextPage === 'dashboard' ? '/' : `/${nextPage}`;
    window.history.pushState({}, '', nextPath);
  }, []);

  const renderCorePage = () => {
    switch (currentPage) {
      case 'projects':
        return <Projects />;
      case 'tasks':
        return <Tasks />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  if (currentPage === 'team-management') {
    return (
      <ManagerLayout onNavigate={handleNavigate}>
        <TeamManagement />
      </ManagerLayout>
    );
  }

  return (
    <MainLayout currentPage={currentPage} onNavigate={handleNavigate}>
      {renderCorePage()}
    </MainLayout>
  );
}

export default App;
