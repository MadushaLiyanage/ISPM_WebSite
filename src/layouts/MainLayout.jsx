import React from 'react';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import Sidebar from '../components/Sidebar/Sidebar';
import './MainLayout.css';

const MainLayout = ({ children, currentPage, onNavigate }) => {
  return (
    <div className="main-layout">
      <Header />
      <div className="layout-content">
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} />
        <main className="main-content">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
