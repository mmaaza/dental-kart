import React from 'react';
import { Link } from 'react-router-dom';

const ServerErrorPage = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 py-12">
    <div className="max-w-md w-full text-center">
      <div className="mx-auto h-32 w-32 mb-8">
        <svg className="h-full w-full text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h1 className="text-mobile-h1 md:text-3xl lg:text-4xl font-bold font-heading text-gray-900 mb-4">
        501 - Server Error
      </h1>
      <p className="text-gray-600 text-base md:text-lg mb-8">
        Sorry, we're experiencing technical difficulties. Please try again later.
      </p>
      <div className="space-y-4">
        <Link
          to="/"
          className="block w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-md text-sm font-medium transition duration-300"
        >
          Go Back Home
        </Link>
        <button
          onClick={() => window.location.reload()}
          className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-md text-sm font-medium transition duration-300"
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
);

export default ServerErrorPage;