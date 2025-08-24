import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

const NavLink = ({ to, children, className, ...props }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={cn(
        "px-3 py-2 rounded-md text-sm font-medium transition-colors",
        isActive 
          ? "bg-blue-100 text-blue-700" 
          : "text-gray-700 hover:text-blue-600 hover:bg-gray-100",
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
};

export default NavLink;
