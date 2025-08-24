import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import BottomNavigation from './BottomNavigation';
import { ChatWidget } from '../ui/ChatWidget';

const Layout = () => {
  const location = useLocation();
  const isAccountRoute = location.pathname.startsWith('/account');

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex flex-col -mt-0 pb-16 md:pb-0">
        <Outlet />
      </main>
      {!isAccountRoute && <Footer />}
      <BottomNavigation />
      <ChatWidget />
    </div>
  );
};

export default Layout;
