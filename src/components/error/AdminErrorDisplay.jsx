import React from 'react';
import { Link } from 'react-router-dom';

/**
 * AdminErrorDisplay - Custom error component for Admin Panel
 * 
 * Styled according to the Admin Panel Theme with:
 * - Prussian Blue background colors
 * - UCLA Blue accent colors
 * - Light Blue text colors
 */
const AdminErrorDisplay = ({ 
  title = 'Error',
  message = 'Something went wrong', 
  actionText = 'Go back', 
  actionLink = '/admin',
  icon
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-10 px-4">
      <div className="w-full max-w-md bg-admin-prussian-300 dark:bg-admin-prussian-200 rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col items-center">
            {/* Custom or default error icon */}
            {icon || (
              <div className="w-16 h-16 bg-admin-ucla-500/20 dark:bg-admin-ucla-500/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-admin-ucla-600 dark:text-admin-ucla-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            )}
            
            {/* Error title */}
            <h2 className="text-xl font-semibold text-admin-light-500 mb-2">{title}</h2>
            
            {/* Error message */}
            <p className="text-admin-light-300 text-center mb-6">{message}</p>
            
            {/* Action button */}
            <Link
              to={actionLink}
              className="px-4 py-2.5 bg-admin-ucla-500 hover:bg-admin-ucla-600 text-white rounded-md transition-colors duration-200 text-sm font-medium shadow-sm"
            >
              {actionText}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminErrorDisplay;
