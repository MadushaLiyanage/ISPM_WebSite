import React from 'react';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = React.useState('dashboard');

  const renderPage = () => {
    switch(currentPage) {
      case 'projects':
        return <Projects />;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  return (
    <MainLayout>
      {renderPage()}
    </MainLayout>
  );
}

export default App
