import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import StepperComponent from '../components/ui/StepperComponent';
import CartReviewStep from '../components/checkout/CartReviewStep';
import ShippingDetailsStep from '../components/checkout/ShippingDetailsStep';
import PaymentStep from '../components/checkout/PaymentStep';
import PaymentErrorBoundary from '../components/error/PaymentErrorBoundary';
import { useCart } from '../contexts/CartContext';
import { useCreateOrder } from '../hooks/queries/useOrderQueries';
import { toast } from 'react-hot-toast';
import paymentService from '../services/paymentService';

// Loading components for Suspense
const CheckoutSkeleton = () => (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="container mx-auto px-4 max-w-3xl">
      {/* Stepper Skeleton */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              {step < 3 && <div className="w-16 h-0.5 bg-gray-200 mx-2 animate-pulse" />}
            </div>
          ))}
        </div>
      </div>
      
      {/* Content Skeleton */}
      <div className="bg-white rounded-lg shadow-mobile p-6">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { 
    items, 
    itemCount, 
    totalValue, 
    formatPrice, 
    loading: cartLoading, 
    isInitialized, 
    clearCart 
  } = useCart();
  
  const createOrderMutation = useCreateOrder();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [orderData, setOrderData] = useState({
    cart: [],
    shipping: null,
    payment: null
  });
  const [processingProgress, setProcessingProgress] = useState(0);

  // Redirect to cart if no items or not initialized
  useEffect(() => {
    if (isInitialized && !cartLoading && items.length === 0) {
      toast.error('Your cart is empty. Please add items before checkout.');
      navigate('/cart');
    }
  }, [items, isInitialized, cartLoading, navigate]);
  
  useEffect(() => {
    // Update order data with cart items
    setOrderData(prev => ({
      ...prev,
      cart: items
    }));
  }, [items]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      paymentService.cleanup();
    };
  }, []);

  // Step navigation handlers
  const handleCartNext = () => {
    setCurrentStep(2);
  };

  const handleShippingBack = () => {
    setCurrentStep(1);
  };

  const handleShippingNext = (shippingData) => {
    // Validate shipping data
    if (!shippingData || !shippingData.fullName || !shippingData.email) {
      toast.error('Please fill in all required shipping details');
      return;
    }

    // Ensure all required fields are present
    const requiredFields = ['fullName', 'phone', 'email', 'address', 'city', 'province'];
    const missingFields = requiredFields.filter(field => !shippingData[field]);
    
    if (missingFields.length > 0) {
      toast.error(`Missing required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Store shipping data with consistent structure
    setOrderData(prev => ({
      ...prev,
      shipping: {
        fullName: shippingData.fullName?.trim() || '',
        phone: shippingData.phone?.trim() || '',
        email: shippingData.email?.trim() || '',
        address: shippingData.address?.trim() || '',
        city: shippingData.city?.trim() || '',
        province: shippingData.province?.trim() || '',
        panNumber: shippingData.panNumber?.trim() || '',
        clinicName: shippingData.clinicName?.trim() || '',
        orderNote: shippingData.orderNote?.trim() || ''
      }
    }));
    setCurrentStep(3);
  };

  const handlePaymentBack = () => {
    setCurrentStep(2);
  };

  const handleOrderComplete = async (paymentData) => {
    try {
      // Validate payment data
      if (!paymentData || !paymentData.paymentMethod) {
        toast.error('Please select a payment method');
        return;
      }

      if (paymentData.paymentMethod === 'pay-now' && !paymentData.screenshotFile) {
        toast.error('Please upload a payment screenshot for online payment');
        return;
      }

      // Update order data with payment info
      const completeOrderData = {
        ...orderData,
        payment: paymentData
      };
      setOrderData(completeOrderData);

      // Progress callback for enhanced UX
      const progressCallback = ({ progress, message }) => {
        setProcessingProgress(progress);
        if (message) {
          toast.loading(message, { id: 'order-progress' });
        }
      };

      // Show initial loading toast
      toast.loading('Preparing your order...', { id: 'order-progress' });
      setProcessingProgress(5);
      
      try {
        // Use the enhanced payment service for order creation
        const result = await paymentService.createOrder(
          {
            shipping: completeOrderData.shipping,
            payment: paymentData
          },
          paymentData.screenshotFile,
          progressCallback
        );
        
        // Dismiss loading toast
        toast.dismiss('order-progress');
        setProcessingProgress(100);
        
        if (result && result.success) {
          // Clear the cart after successful order
          await clearCart();
          
          // Navigate to success page with order data
          navigate('/order-success', { 
            state: { 
              fromCheckout: true,
              orderData: result.data
            }
          });
        }
      } catch (error) {
        // Dismiss loading toast
        toast.dismiss('order-progress');
        setProcessingProgress(0);
        
        console.error('Order creation failed:', error);
        
        // Show specific error message
        const errorMessage = error.message || 'Failed to create order. Please try again.';
        toast.error(errorMessage);
        
        // If it's a validation error, don't show generic message
        if (!error.message?.includes('Validation') && !error.message?.includes('File validation')) {
          toast.error('Please check your internet connection and try again.');
        }
      }
    } catch (error) {
      console.error('Error in handleOrderComplete:', error);
      toast.error('An unexpected error occurred. Please try again.');
      setProcessingProgress(0);
    }
  };

  // Calculate order summary with validation
  const calculateOrderSummary = () => {
    const subtotal = totalValue || 0;
    const shipping = 100; // Rs. 100 fixed shipping
    return {
      subtotal,
      shipping,
      total: subtotal + shipping
    };
  };

  // Show loading skeleton while cart is loading
  if (cartLoading || !isInitialized) {
    return <CheckoutSkeleton />;
  }

  // Early return if no items (will trigger redirect effect)
  if (items.length === 0) {
    return <CheckoutSkeleton />;
  }

  const orderSummary = calculateOrderSummary();

  return (
    <PaymentErrorBoundary
      onRetry={() => {
        // Reset form state on error boundary reset
        setCurrentStep(1);
        setProcessingProgress(0);
        setOrderData({
          cart: items,
          shipping: null,
          payment: null
        });
      }}
    >
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Progress Stepper */}
          <div className="mb-8">
            <StepperComponent currentStep={currentStep} />
          </div>

          {/* Processing Progress Bar */}
          {processingProgress > 0 && processingProgress < 100 && (
            <div className="mb-6 bg-white rounded-lg p-4 shadow-mobile">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Processing your order...</span>
                <span>{Math.round(processingProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary-500 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Main Content */}
          <Suspense fallback={<CheckoutSkeleton />}>
            {currentStep === 1 && (
              <CartReviewStep
                items={items}
                totalValue={totalValue}
                formatPrice={formatPrice}
                onNext={handleCartNext}
                orderSummary={orderSummary}
              />
            )}

            {currentStep === 2 && (
              <ShippingDetailsStep
                onBack={handleShippingBack}
                onNext={handleShippingNext}
                initialData={orderData.shipping}
                orderSummary={orderSummary}
              />
            )}

            {currentStep === 3 && (
              <PaymentStep
                onBack={handlePaymentBack}
                onComplete={handleOrderComplete}
                orderSummary={orderSummary}
                isLoading={createOrderMutation.isPending || processingProgress > 0}
              />
            )}
          </Suspense>

          {/* Order Summary Sticky Bar (Mobile) */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total ({itemCount} items)</p>
                <p className="text-lg font-semibold text-gray-900">
                  Rs. {formatPrice(orderSummary.total)}
                </p>
              </div>
              {currentStep < 3 && (
                <div className="text-sm text-gray-500">
                  Step {currentStep} of 3
                </div>
              )}
            </div>
          </div>

          {/* Security Notice */}
          {currentStep === 3 && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    <strong>Secure Checkout:</strong> Your payment information is encrypted and secure. We never store your payment details.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </PaymentErrorBoundary>
  );
};

export default CheckoutPage;