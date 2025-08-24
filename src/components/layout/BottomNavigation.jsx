import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { 
  MdHome, 
  MdGridView, 
  MdStorefront, 
  MdShoppingCart, 
  MdPerson 
} from 'react-icons/md';

const BottomNavigation = () => {
  const location = useLocation();
  const { currentUser } = useAuth();
  const { itemCount = 0 } = useCart();

  // Don't show bottom navigation on account routes or certain pages
  const hideOnRoutes = ['/login', '/signup', '/forgot-password', '/verify-email'];
  const isAccountRoute = location.pathname.startsWith('/account');
  
  if (hideOnRoutes.includes(location.pathname) || isAccountRoute) {
    return null;
  }

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: MdHome,
      path: '/',
      isActive: location.pathname === '/'
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: MdGridView,
      path: '/categories',
      isActive: location.pathname === '/categories' || location.pathname.startsWith('/category/')
    },
    {
      id: 'brands',
      label: 'Brands',
      icon: MdStorefront,
      path: '/brands',
      isActive: location.pathname === '/brands' || location.pathname.startsWith('/brand/')
    },
    {
      id: 'cart',
      label: 'Cart',
      icon: MdShoppingCart,
      path: '/cart',
      isActive: location.pathname === '/cart',
      badge: itemCount > 0 ? itemCount : null
    },
    {
      id: 'account',
      label: 'Account',
      icon: MdPerson,
      path: currentUser ? '/account' : '/login',
      isActive: location.pathname.startsWith('/account') || location.pathname === '/login'
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`flex flex-col items-center justify-center px-1 py-2 text-xs transition-colors relative ${
                item.isActive 
                  ? 'text-primary-600 bg-primary-50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="relative">
                <Icon className="w-6 h-6 mb-1" />
                {item.badge && (
                  <span className="absolute -top-2 -right-2 bg-secondary-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold min-w-[20px]">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs truncate max-w-full ${
                item.isActive ? 'font-medium' : ''
              }`}>
                {item.label}
              </span>
              {item.isActive && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-primary-600"></div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
