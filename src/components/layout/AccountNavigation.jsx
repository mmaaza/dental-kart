import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { cn } from '../../lib/utils';
import { 
  Home, 
  ShoppingBag, 
  Heart, 
  User, 
  Settings,
  ChevronRight
} from 'lucide-react';

const navigation = [
  {
    name: 'Account',
    path: '/account',
    icon: Home,
    description: 'Account overview and dashboard'
  },
  {
    name: 'Orders',
    path: '/account/orders',
    icon: ShoppingBag,
    description: 'View order history'
  },
  {
    name: 'Wishlist',
    path: '/account/wishlist',
    icon: Heart,
    description: 'Saved items'
  },
  {
    name: 'Profile',
    path: '/account/profile',
    icon: User,
    description: 'Manage personal information'
  },
  {
    name: 'Settings',
    path: '/account/settings',
    icon: Settings,
    description: 'Account preferences'
  }
];

const AccountNavigation = ({ variant = 'desktop' }) => {
  const location = useLocation();

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  // Mobile Bottom Navigation
  if (variant === 'mobile') {
    return (
      <NavigationMenu.Root className="w-full">
        <NavigationMenu.List className="flex items-center justify-around p-2 bg-white">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path);
            
            return (
              <NavigationMenu.Item key={item.name} value={item.name}>
                <NavigationMenu.Link asChild>
                  <Link
                    to={item.path}
                    className={cn(
                      // Base styles - mobile first
                      "flex flex-col items-center justify-center",
                      "py-2 px-1 min-w-[4rem]",
                      "rounded-lg transition-all duration-200",
                      "touch-manipulation", // Better touch handling
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                      // Active/inactive states
                      isActive
                        ? "text-primary-600 bg-primary-50"
                        : "text-slate-600 hover:text-primary-600 hover:bg-slate-50 active:bg-slate-100"
                    )}
                  >
                    <Icon 
                      className={cn(
                        "w-5 h-5 mb-1 transition-transform duration-200",
                        isActive && "scale-110"
                      )} 
                    />
                    <span className={cn(
                      "text-2xs font-medium leading-tight",
                      isActive && "font-semibold"
                    )}>
                      {item.name}
                    </span>
                  </Link>
                </NavigationMenu.Link>
              </NavigationMenu.Item>
            );
          })}
        </NavigationMenu.List>
      </NavigationMenu.Root>
    );
  }

  // Desktop Sidebar Navigation
  return (
    <NavigationMenu.Root orientation="vertical" className="w-full">
      <NavigationMenu.List className="flex flex-col space-y-1 p-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveRoute(item.path);
          
          return (
            <NavigationMenu.Item key={item.name} value={item.name}>
              <NavigationMenu.Link asChild>
                <Link
                  to={item.path}
                  className={cn(
                    // Base styles
                    "flex items-center justify-between",
                    "px-4 py-3 rounded-lg",
                    "text-mobile-small font-medium",
                    "transition-all duration-200",
                    "group relative overflow-hidden",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                    // Active/inactive states
                    isActive
                      ? "bg-primary-100 text-primary-700 shadow-sm"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200"
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <Icon 
                      className={cn(
                        "w-5 h-5 transition-all duration-200",
                        isActive 
                          ? "text-primary-600" 
                          : "text-slate-500 group-hover:text-slate-600"
                      )} 
                    />
                    <div className="flex flex-col">
                      <span className={cn(
                        "transition-colors duration-200",
                        isActive && "font-semibold"
                      )}>
                        {item.name}
                      </span>
                      <span className="text-2xs text-slate-500 mt-0.5 hidden sm:block">
                        {item.description}
                      </span>
                    </div>
                  </div>
                  
                  {/* Hover chevron */}
                  <ChevronRight 
                    className={cn(
                      "w-4 h-4 text-slate-400 transition-all duration-200",
                      "group-hover:text-slate-600 group-hover:translate-x-1",
                      isActive ? "opacity-0" : "opacity-0 group-hover:opacity-100"
                    )}
                  />
                </Link>
              </NavigationMenu.Link>
            </NavigationMenu.Item>
          );
        })}
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
};

export default AccountNavigation;