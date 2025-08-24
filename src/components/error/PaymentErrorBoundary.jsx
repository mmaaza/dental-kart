import React from 'react';
import { toast } from 'react-hot-toast';

class PaymentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('Payment Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
      retryCount: this.state.retryCount + 1
    });

    // Report error to monitoring service (if available)
    if (typeof window !== 'undefined' && window.reportError) {
      window.reportError(error, {
        context: 'payment_flow',
        errorInfo,
        retryCount: this.state.retryCount
      });
    }

    // Show user-friendly error message
    toast.error('Something went wrong with your payment. Please try again.');
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
    
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleResetToCart = () => {
    window.location.href = '/cart';
  };

  handleContactSupport = () => {
    // You can implement contact support functionality here
    const subject = encodeURIComponent('Payment Issue - Order Processing Error');
    const body = encodeURIComponent(`
I encountered an error during checkout:

Error: ${this.state.error?.message || 'Unknown error'}
Time: ${new Date().toLocaleString()}
Retry Count: ${this.state.retryCount}

Please assist me with completing my order.
    `);
    
    window.open(`mailto:support@mbnepal.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg 
                  className="h-8 w-8 text-red-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
                  />
                </svg>
              </div>

              {/* Error Message */}
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Payment Processing Error
              </h3>
              
              <p className="text-sm text-gray-600 mb-6">
                {this.state.retryCount >= 3 
                  ? "We're experiencing technical difficulties. Please try again later or contact support."
                  : "Something went wrong while processing your payment. Don't worry, your items are still in your cart."
                }
              </p>

              {/* Error Details (Development only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-3 bg-gray-100 rounded-md text-left">
                  <p className="text-xs font-medium text-gray-900 mb-1">Error Details:</p>
                  <p className="text-xs text-gray-600 break-all">
                    {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer">Stack Trace</summary>
                      <pre className="text-xs text-gray-500 mt-1 overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {this.state.retryCount < 3 && (
                  <button
                    onClick={this.handleRetry}
                    className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-md text-sm font-medium transition duration-300"
                  >
                    Try Again
                  </button>
                )}
                
                <button
                  onClick={this.handleResetToCart}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-md text-sm font-medium transition duration-300"
                >
                  Return to Cart
                </button>
                
                <button
                  onClick={this.handleContactSupport}
                  className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 py-3 px-4 rounded-md text-sm font-medium transition duration-300"
                >
                  Contact Support
                </button>
              </div>

              {/* Retry Counter */}
              {this.state.retryCount > 0 && (
                <p className="text-xs text-gray-500 mt-4">
                  Attempt {this.state.retryCount} of 3
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional component wrapper for easier use with hooks
export const PaymentErrorBoundaryWrapper = ({ children, onRetry, fallback: CustomFallback }) => {
  if (CustomFallback) {
    return (
      <PaymentErrorBoundary onRetry={onRetry} fallback={CustomFallback}>
        {children}
      </PaymentErrorBoundary>
    );
  }

  return (
    <PaymentErrorBoundary onRetry={onRetry}>
      {children}
    </PaymentErrorBoundary>
  );
};

export default PaymentErrorBoundary;
