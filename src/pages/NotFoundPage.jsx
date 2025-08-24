import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-12">
    <div className="max-w-md w-full text-center">
      <div className="mx-auto h-32 w-32 mb-8">
        <svg className="h-full w-full text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="text-mobile-h1 md:text-3xl lg:text-4xl font-bold font-heading text-gray-900 mb-4">
        404 - Page Not Found
      </h1>
      <p className="text-gray-600 text-base md:text-lg mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="space-y-4">
        <Link
          to="/"
          className="block w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-md text-sm font-medium transition duration-300"
        >
          Go Back Home
        </Link>
        <Link
          to="/products"
          className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-md text-sm font-medium transition duration-300"
        >
          Browse Products
        </Link>
      </div>
    </div>
  </div>
);

export default NotFoundPage;