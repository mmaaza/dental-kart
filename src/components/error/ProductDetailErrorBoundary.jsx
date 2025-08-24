import React from 'react';
import { Link } from 'react-router-dom';

class ProductDetailErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ProductDetail Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-gray-50 min-h-screen">
          <div className="container mx-auto px-3 py-8 text-center">
            <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <div className="text-red-500 mb-3">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2">
                Product Not Found
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                We couldn't find the product you're looking for. It may have been removed or doesn't exist.
              </p>
              <div className="space-y-3">
                <Link
                  to="/products"
                  className="bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 sm:py-3 sm:px-6 rounded-md text-xs sm:text-sm font-medium transition duration-300 inline-block"
                >
                  Browse Products
                </Link>
                <button
                  onClick={() => window.location.reload()}
                  className="block w-full text-gray-500 hover:text-gray-700 text-xs sm:text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ProductDetailErrorBoundary;
