import React from 'react';
import { Link } from 'react-router-dom';

const ErrorDisplay = ({ 
  message = 'Something went wrong', 
  actionText = 'Go back', 
  actionLink = '/' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
      <p className="text-gray-600 text-center mb-6">{message}</p>
      <Link
        to={actionLink}
        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
      >
        {actionText}
      </Link>
    </div>
  );
};

export default ErrorDisplay;
