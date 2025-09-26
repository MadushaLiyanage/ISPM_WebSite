import React from 'react';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import Sidebar from '../components/Sidebar/Sidebar';
import './MainLayout.css';

const MainLayout = ({ children, setCurrentPage, user, onLogout }) => {
  return (
    <div className="main-layout">
      <Header user={user} onLogout={onLogout} />
      <div className="layout-content">
        <Sidebar setCurrentPage={setCurrentPage} />
        <main className="main-content">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;