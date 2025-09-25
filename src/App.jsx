import React from 'react';
import MainLayout from './layouts/MainLayout';
import ManagerLayout from './layouts/ManagerLayout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import ManagerDashboard from './pages/manager/M_dashboard';
import TeamManagement from './pages/manager/Team_management';
import AssignmentManagement from './pages/manager/Assignment_management';
import TeamProgress from './pages/manager/Team_progress';
import NonCompliance from './pages/manager/Non_compliance';
import './App.css';

const managerPages = new Set([
  'team-dashboard',
  'team-management',
  'assignment-management',
  'team-progress',
  'non-compliance',
]);

const corePages = new Set(['dashboard', 'projects', 'tasks']);

function resolvePageFromPathname(pathname) {
  const slug = pathname.replace(/^\//, '') || 'dashboard';
  if (corePages.has(slug) || managerPages.has(slug)) {
    return slug;
  }
  return 'dashboard';
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
    const nextPage = resolvePageFromPathname(`/${page}`);
    setCurrentPage(nextPage);
    const nextPath = nextPage === 'dashboard' ? '/' : `/${nextPage}`;
    window.history.pushState({}, '', nextPath);
  }, []);

  if (managerPages.has(currentPage)) {
    let content = null;
    switch (currentPage) {
      case 'team-management':
        content = <TeamManagement />;
        break;
      case 'assignment-management':
        content = <AssignmentManagement />;
        break;
      case 'team-progress':
        content = <TeamProgress />;
        break;
      case 'non-compliance':
        content = <NonCompliance />;
        break;
      case 'team-dashboard':
      default:
        content = <ManagerDashboard />;
        break;
    }

    return (
      <ManagerLayout currentPage={currentPage} onNavigate={handleNavigate}>
        {content}
      </ManagerLayout>
    );
  }

  let coreContent = null;
  switch (currentPage) {
    case 'projects':
      coreContent = <Projects />;
      break;
    case 'tasks':
      coreContent = <Tasks />;
      break;
    case 'dashboard':
    default:
      coreContent = <Dashboard />;
      break;
  }

  return (
    <MainLayout currentPage={currentPage} onNavigate={handleNavigate}>
      {coreContent}
    </MainLayout>
  );
}

export default App;
