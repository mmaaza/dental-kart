import React, { useEffect, useState } from 'react';
import { useCart } from '../../contexts/CartContext';

const CartCleanupNotification = () => {
  const cartContext = useCart();
  const { hasDeletedProducts, cleanupDeletedProducts, isInitialized } = cartContext || {};
  const [showNotification, setShowNotification] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  useEffect(() => {
    // Check for deleted products after cart is initialized
    if (isInitialized && hasDeletedProducts && typeof hasDeletedProducts === 'function' && hasDeletedProducts()) {
      setShowNotification(true);
    } else {
      setShowNotification(false);
    }
  }, [isInitialized, hasDeletedProducts]);

  const handleCleanup = async () => {
    if (!cleanupDeletedProducts || typeof cleanupDeletedProducts !== 'function') {
      console.warn('cleanupDeletedProducts function not available');
      return;
    }
    
    setIsCleaningUp(true);
    try {
      await cleanupDeletedProducts();
      setShowNotification(false);
    } catch (error) {
      console.error('Failed to cleanup cart:', error);
    } finally {
      setIsCleaningUp(false);
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
  };

  if (!showNotification || !hasDeletedProducts || typeof hasDeletedProducts !== 'function') {
    return null;
  }

  // Double-check if there are actually deleted products
  try {
    if (!hasDeletedProducts()) {
      return null;
    }
  } catch (error) {
    console.warn('Error checking for deleted products:', error);
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-white border border-amber-200 rounded-lg shadow-lg z-50">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-gray-900">
              Cart needs cleanup
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Some items in your cart are no longer available.
            </p>
            <div className="mt-3 flex space-x-3">
              <button
                onClick={handleCleanup}
                disabled={isCleaningUp}
                className="bg-amber-100 hover:bg-amber-200 disabled:bg-amber-50 text-amber-800 text-sm font-medium px-3 py-1.5 rounded-md transition-colors flex items-center"
              >
                {isCleaningUp ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cleaning...
                  </>
                ) : (
                  'Clean Up'
                )}
              </button>
              <button
                onClick={handleDismiss}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
          <div className="ml-3 flex-shrink-0">
            <button
              onClick={handleDismiss}
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartCleanupNotification;
