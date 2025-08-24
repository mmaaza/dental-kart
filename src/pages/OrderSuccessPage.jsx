import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  const hasClearedCart = useRef(false);
  
  // Get order details from location state
  const orderData = location.state?.orderData;
  
  // Use actual order number from backend
  const orderNumber = orderData?.orderNumber || "N/A";
  
  // Calculate estimated delivery date (7 days from now)
  const [deliveryDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  });
  
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  
  // Clear cart when the success page loads
  useEffect(() => {
    // Only clear the cart if we navigated from checkout and haven't cleared it yet
    if (location.state && location.state.fromCheckout && !hasClearedCart.current) {
      hasClearedCart.current = true;
      clearCart();
    }
    
    // If someone visits this page directly without an order, redirect to home
    if (!location.state || !location.state.fromCheckout) {
      // We'll add a small timeout to allow the page to render briefly
      const redirectTimer = setTimeout(() => {
        navigate('/');
      }, 5000);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [location.state, navigate]); // Removed clearCart from dependencies

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl text-center">
        <div className="bg-white rounded-lg shadow-mobile p-8">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for your order. We'll send you a confirmation email with your order details.
          </p>

          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="text-left space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Order Number:</span>
                <span className="text-sm font-medium text-gray-900">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Estimated Delivery:</span>
                <span className="text-sm font-medium text-gray-900">By {formattedDeliveryDate}</span>
              </div>
              <div className="border-t border-gray-200 my-3 pt-3">
                <p className="text-sm text-gray-600 text-center">
                  A confirmation email has been sent to your email address.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to={orderData?._id ? `/account/orders/${orderData._id}` : "/account/orders"}
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-md text-sm font-medium transition duration-300"
            >
              View Order
            </Link>
            <Link
              to="/"
              className="flex-1 bg-gray-100 text-gray-600 hover:bg-gray-200 py-3 px-4 rounded-md text-sm font-medium transition duration-300"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;