import React from 'react';

export const LoadingSkeleton = ({ type = 'brands' }) => {
  const itemCount = type === 'brands' ? 12 : 12;
  
  return (
    <div className="w-full bg-gray-50">
      {/* Header skeleton */}
      <div className="bg-primary-500">
        <div className="container mx-auto px-4 py-6">
          <div className="h-8 bg-primary-400 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-primary-400 rounded w-96 animate-pulse"></div>
        </div>
      </div>

      {/* Filter skeleton */}
      <div className="sticky top-[88px] bg-white shadow-md z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="h-12 bg-gray-200 rounded-md mb-4 animate-pulse"></div>
          <div className="flex gap-2 justify-center">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto px-4 py-8">
        <div className="w-48 h-8 bg-gray-200 rounded-md mb-4 animate-pulse"></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(itemCount)].map((_, index) => (
            <div 
              key={index}
              className="bg-white rounded-lg shadow-mobile p-4 flex flex-col items-center"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-200 rounded-full animate-pulse mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-16 mt-2 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ErrorFallback = ({ error, resetErrorBoundary, type = 'content' }) => {
  return (
    <div className="text-center py-12">
      <div className="mx-auto h-16 w-16 mb-4 text-red-400 flex items-center justify-center">
        <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Something went wrong</h3>
      <p className="text-gray-500 mb-6">
        {error?.message || `Failed to load ${type}. Please try again.`}
      </p>
      <button 
        onClick={resetErrorBoundary}
        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600"
      >
        Try Again
      </button>
    </div>
  );
};
