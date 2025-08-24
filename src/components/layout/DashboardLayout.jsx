import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import * as Separator from '@radix-ui/react-separator';
import { cn } from '../../lib/utils';
import AccountNavigation from './AccountNavigation';

const DashboardLayout = () => {
  const { currentUser } = useAuth();

  // Prevent body scrolling when dashboard is active
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  return (
    <div className="h-screen md:h-[calc(100vh-4rem)] bg-slate-50 flex flex-col overflow-hidden">
      {/* Mobile Header - Visible only on mobile */}
      <header className="md:hidden bg-white shadow-sm border-b border-slate-200 flex-shrink-0 z-header">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={currentUser?.avatar} 
                  alt={currentUser?.name || 'User avatar'} 
                />
                <AvatarFallback className="bg-primary-100 text-primary-600 font-semibold">
                  {currentUser?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <h2 className="text-mobile-small font-semibold text-slate-900 truncate">
                  Welcome back
                </h2>
                <p className="text-2xs text-slate-600 truncate">
                  {currentUser?.name || 'User'}
                </p>
              </div>
            </div>
            
            {/* Optional: Add mobile menu trigger here */}
            <div className="w-6 h-6" /> {/* Placeholder for balance */}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Desktop Sidebar - Hidden on mobile */}
        <aside className="hidden md:flex md:flex-col md:w-80 md:flex-shrink-0 md:h-full">
          <div className="flex flex-col h-full bg-white shadow-lg border-r border-slate-200">
            {/* Desktop User Profile Section */}
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage 
                    src={currentUser?.avatar} 
                    alt={currentUser?.name || 'User avatar'} 
                  />
                  <AvatarFallback className="bg-primary-100 text-primary-600 text-lg font-semibold">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-slate-900 truncate">
                    {currentUser?.name || 'User'}
                  </h3>
                  <p className="text-sm text-slate-600 truncate">
                    {currentUser?.email}
                  </p>
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-2xs text-slate-500">Online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <ScrollArea.Root className="flex-1">
              <ScrollArea.Viewport className="h-full w-full">
                <div className="py-4">
                  <AccountNavigation variant="desktop" />
                </div>
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar 
                className="flex select-none touch-none p-0.5 bg-slate-100 transition-colors duration-150 ease-out hover:bg-slate-200 data-[orientation=vertical]:w-2.5 data-[orientation=horizontal]:flex-col data-[orientation=horizontal]:h-2.5"
                orientation="vertical"
              >
                <ScrollArea.Thumb className="flex-1 bg-slate-400 rounded-[10px] relative before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-full before:h-full before:min-w-[44px] before:min-h-[44px]" />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>

            {/* Desktop Footer */}
            <div className="p-4 border-t border-slate-200">
              <div className="text-2xs text-slate-500 text-center">
                <p>Medical Bazaar Dashboard</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden">
          <div className="p-4 md:p-8 pb-40 md:pb-8">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation - Fixed at bottom */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-sticky bg-white border-t border-slate-200 shadow-bottom-nav flex-shrink-0">
        <AccountNavigation variant="mobile" />
      </div>
    </div>
  );
};

export default DashboardLayout;