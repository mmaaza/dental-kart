import React from 'react';

const HomePageSkeleton = () => {
  return (
    <div
      className="bg-gray-50 min-h-screen"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading homepage…</span>
      {/* Hero Section Skeleton */}
      <div
        className="w-full h-40 xs:h-48 sm:h-64 md:h-80 lg:h-96 bg-gray-200 animate-pulse relative"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent flex items-center">
          <div className="container mx-auto px-4 sm:px-6 md:px-8">
            <div className="max-w-lg">
              <div className="h-8 bg-gray-300 rounded mb-4 w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded mb-6 w-1/2"></div>
              <div className="h-10 bg-gray-300 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePageSkeleton;
