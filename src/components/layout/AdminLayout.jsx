import React, { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLoading } from '../../contexts/LoadingContext';
import { useChat } from '../../contexts/ChatContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { AdminSearchProvider, useAdminSearch } from '../../contexts/AdminSearchContext';
import AdminSearchResults from '../ui/AdminSearchResults';
import AdminNotificationsPanel from '../ui/AdminNotificationsPanel';

const AdminSearch = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    performSearch, 
    clearSearch,
    setShowResults,
    recentSearches,
    handleKeyNavigation
  } = useAdminSearch();

  const inputRef = useRef(null);

  // Focus the search input when pressing Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Focus search on Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim().length >= 1) {
      setShowResults(true);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  // Handle input focus
  const handleFocus = () => {
    if (searchQuery.trim() || recentSearches.length > 0) {
      setShowResults(true);
    }
  };

  // Handle keyboard input
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); // Prevent cursor movement in the input
      handleKeyNavigation(e.key);
    }
  };

  return (
    <div className="flex-1 max-w-lg lg:max-w-xs relative">
      <form onSubmit={handleSubmit}>
        <label htmlFor="search" className="sr-only">Search</label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <svg className="h-5 w-5 text-admin-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="search"
            name="search"
            id="search"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-admin-slate-900 dark:text-admin-slate-100 bg-admin-slate-50 dark:bg-admin-slate-700 ring-1 ring-inset ring-admin-slate-300 dark:ring-admin-slate-600 placeholder:text-admin-slate-400 focus:ring-2 focus:ring-admin-slate-500 sm:text-sm sm:leading-6"
            placeholder="Search dashboard... (Ctrl+K)"
            autoComplete="off"
          />
          {searchQuery && (
            <button 
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-admin-slate-400 hover:text-admin-slate-500 cursor-pointer"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {!searchQuery && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <kbd className="hidden xs:inline-flex h-5 w-auto px-1.5 items-center justify-center rounded border border-admin-slate-300 dark:border-admin-slate-700 bg-admin-slate-100 dark:bg-admin-slate-800 text-xs text-admin-slate-500 dark:text-admin-slate-400">
                Ctrl+K
              </kbd>
            </div>
          )}
        </div>
      </form>
      <AdminSearchResults />
    </div>
  );
};

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const { isLoading } = useLoading();
  const { unreadCount: chatUnreadCount } = useChat();
  const { unreadCount: notificationUnreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const notificationButtonRef = useRef(null);

  const navigation = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      name: 'Products',
      path: '/admin/products',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    },
    {
      name: 'Reviews',
      path: '/admin/reviews',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    },
    {
      name: 'Categories',
      path: '/admin/categories',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      )
    },
    {
      name: 'Brands',
      path: '/admin/brands',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 4v12l-4-2-4 2V4M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: 'Media',
      path: '/admin/media',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: 'Blog',
      path: '/admin/blog',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
      )
    },
    {
      name: 'Customers',
      path: '/admin/customers',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      name: 'Orders',
      path: '/admin/orders',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      )
    },
    {
      name: 'Carts',
      path: '/admin/carts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      name: 'Admin Users',
      path: '/admin/users',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      name: 'Vendors',
      path: '/admin/vendors',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: 'Push Notifications',
      path: '/admin/notifications',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    },
    {
      name: 'Chat',
      path: '/admin/chat',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      badge: chatUnreadCount > 0 ? chatUnreadCount : null
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
  ];

  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      document.documentElement.classList.remove('dark');
    };
  }, []);
  
  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is outside both the button and the notification panel
      const notificationPanel = document.querySelector('.notification-panel');
      
      if (isNotificationPanelOpen && 
          notificationButtonRef.current && 
          !notificationButtonRef.current.contains(event.target) &&
          (!notificationPanel || !notificationPanel.contains(event.target))) {
        setIsNotificationPanelOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationPanelOpen]);

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <AdminSearchProvider>
      <div className="flex h-screen overflow-hidden bg-admin-slate-100 dark:bg-admin-slate-900">
        {/* Sidebar */}
        <aside className={`
          fixed top-0 left-0 z-40 h-full w-72 bg-admin-slate-50 dark:bg-admin-slate-800 border-r border-admin-slate-200 dark:border-admin-slate-700
          transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static
          flex flex-col
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          {/* Logo Header */}
          <div className="flex h-16 items-center justify-between px-6 bg-admin-slate-800 dark:bg-admin-slate-900 text-white flex-shrink-0">
            <Link to="/admin" className="flex items-center gap-2">
              <img 
                src="/uploads/logo-main.png" 
                alt="Dental Kart Nepal" 
                className="h-8 w-auto object-contain brightness-0 invert"
              />
              <span className="text-lg font-bold">Admin</span>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden -mr-2 p-2 hover:bg-admin-slate-700 rounded-md"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-admin">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActiveRoute(item.path)
                    ? 'bg-admin-slate-200 dark:bg-admin-slate-700 text-admin-slate-900 dark:text-white'
                    : 'text-admin-slate-600 dark:text-admin-slate-300 hover:bg-admin-slate-100 dark:hover:bg-admin-slate-700 hover:text-admin-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </div>
                {item.badge && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-admin-ucla-600 text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-admin-slate-200 dark:border-admin-slate-700 p-4 bg-admin-slate-50 dark:bg-admin-slate-800 flex-shrink-0">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-admin-slate-600 dark:bg-admin-slate-700 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {currentUser?.name?.charAt(0) || 'A'}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-200">
                  {currentUser?.name || 'Admin User'}
                </p>
                <p className="text-xs text-admin-slate-500 dark:text-admin-slate-400">
                  {currentUser?.email || 'admin@mbnepal.com'}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Admin Topbar */}
          <header className="bg-white dark:bg-admin-slate-800 shadow-sm flex-shrink-0 border-b border-admin-slate-200 dark:border-admin-slate-700">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden -m-2.5 p-2.5 text-admin-slate-500 hover:text-admin-slate-700 dark:text-admin-slate-400 dark:hover:text-admin-slate-200"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <div className="ml-4 lg:ml-0">
                  <h2 className="text-lg font-medium text-admin-slate-900 dark:text-admin-slate-100 hidden md:block">
                    Welcome, Admin DK Nepal
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-x-4 lg:gap-x-6">
                {/* Search Bar */}
                <AdminSearch />

                {/* Notification Button */}
                <div className="relative">
                  <button 
                    ref={notificationButtonRef}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsNotificationPanelOpen(prevState => !prevState);
                    }}
                    className="relative p-2 text-admin-slate-500 hover:text-admin-slate-700 dark:text-admin-slate-400 dark:hover:text-admin-slate-200"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {notificationUnreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-admin-ucla-600"></span>
                    )}
                  </button>
                  
                  {isNotificationPanelOpen && (
                    <AdminNotificationsPanel 
                      isOpen={isNotificationPanelOpen}
                      onClose={() => setIsNotificationPanelOpen(false)} 
                    />
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-x-3"
                  >
                    <div className="h-8 w-8 rounded-full bg-admin-slate-600 dark:bg-admin-slate-700 flex items-center justify-center">
                      <span className="text-sm font-medium text-white">
                        {currentUser?.name?.charAt(0) || 'A'}
                      </span>
                    </div>
                    <span className="hidden lg:flex lg:items-center">
                      <span className="text-sm font-medium text-admin-slate-900 dark:text-admin-slate-100">
                        {currentUser?.name || 'Admin'}
                      </span>
                      <svg 
                        className={`ml-2 h-5 w-5 text-admin-slate-400 transition-transform duration-200 ${
                          isProfileDropdownOpen ? 'transform rotate-180' : ''
                        }`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 z-20 mt-2.5 w-32 origin-top-right rounded-md bg-white dark:bg-admin-slate-800 py-2 border border-admin-slate-600 shadow-lg ring-1 ring-admin-slate-900/5 focus:outline-none">
                      <Link
                        to="/admin/profile"
                        className="block px-3 py-1 text-sm leading-6 text-admin-slate-700 dark:text-admin-slate-200 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700"
                      >
                        Your Profile
                      </Link>
                      <Link
                        to="/admin/settings"
                        className="block px-3 py-1 text-sm leading-6 text-admin-slate-700 dark:text-admin-slate-200 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700"
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-3 py-1 text-sm leading-6 text-admin-slate-700 dark:text-admin-slate-200 hover:bg-admin-slate-50 dark:hover:bg-admin-slate-700"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className={`absolute bottom-0 left-0 h-0.5 bg-admin-slate-600 transition-all duration-300 ${isLoading ? 'w-full' : 'w-0'}`}></div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-admin-slate-50 dark:bg-admin-slate-900 scrollbar-admin">
            <div className="container mx-auto px-4 py-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </AdminSearchProvider>
  );
};

export default AdminLayout;