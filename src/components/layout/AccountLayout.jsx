import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AccountNavigation from './AccountNavigation';

const AccountLayout = ({ children, activeLink }) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!currentUser) {
      navigate('/login', { state: { from: window.location.pathname } });
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null; // Prevent flash of unauthenticated content
  }

  return (
    <div className="bg-gray-50 min-h-screen py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar for desktop */}
          <div className="hidden lg:block">
            <AccountNavigation activeLink={activeLink} />
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            {children}
          </div>

          {/* Mobile Navigation Bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden">
            <AccountNavigation activeLink={activeLink} isMobile={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;
