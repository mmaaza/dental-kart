import React, { useState, useEffect, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import StepperComponent from '../components/ui/StepperComponent';
import CartReviewStep from '../components/checkout/CartReviewStep';
import ShippingDetailsStep from '../components/checkout/ShippingDetailsStep';
import PaymentStepEnhanced from '../components/checkout/PaymentStepEnhanced';
import { useCart } from '../contexts/CartContext';
import { useCreateOrder } from '../hooks/queries/useOrderQueries';
import { toast } from 'react-hot-toast';
import { trackInitiateCheckout, trackPurchase, formatCartData } from '../utils/metaPixel';

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

const CheckoutErrorFallback = ({ error, resetErrorBoundary }) => (
  <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
    <div className="bg-white rounded-lg shadow-mobile p-8 max-w-md w-full mx-4">
      <div className="text-center">
        <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Checkout Error
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          {error.message || 'Something went wrong during checkout'}
        </p>
        <div className="mt-6 space-y-3">
          <button
            onClick={resetErrorBoundary}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 px-4 rounded-md text-sm font-medium transition duration-300"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/cart'}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md text-sm font-medium transition duration-300"
          >
            Return to Cart
          </button>
        </div>
      </div>
    </div>
  </div>
);

const CheckoutPageEnhanced = () => {
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

  // Step navigation handlers
  const handleCartNext = () => {
    // Track InitiateCheckout when moving from cart review to shipping
    try {
      const cartData = formatCartData(items.map(item => ({
        id: item.product?._id || item.product,
        price: item.product?.specialOfferPrice || item.product?.regularPrice || 0,
        quantity: item.quantity
      })));
      trackInitiateCheckout(cartData);
    } catch (trackingError) {
      console.warn('Meta Pixel tracking failed:', trackingError);
    }
    
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

    setOrderData(prev => ({
      ...prev,
      shipping: shippingData
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

      // Show loading toast
      const loadingToast = toast.loading('Processing your order...');
      
      try {
        // Prepare data for API call
        const apiOrderData = {
          shipping: completeOrderData.shipping,
          payment: paymentData
        };
        
        // Create order using React Query mutation
        const result = await createOrderMutation.mutateAsync({
          orderData: apiOrderData,
          paymentScreenshot: paymentData.screenshotFile
        });
        
        // Dismiss loading toast
        toast.dismiss(loadingToast);
        
        if (result) {
          // Track Purchase event with Meta Pixel
          try {
            const purchaseData = formatCartData(items.map(item => ({
              id: item.product?._id || item.product,
              price: item.product?.specialOfferPrice || item.product?.regularPrice || 0,
              quantity: item.quantity
            })));
            trackPurchase(purchaseData);
          } catch (trackingError) {
            console.warn('Meta Pixel tracking failed:', trackingError);
          }
          
          // Clear the cart after successful order
          await clearCart();
          
          // Navigate to success page with order data
          navigate('/order-success', { 
            state: { 
              fromCheckout: true,
              orderData: result
            }
          });
        }
      } catch (error) {
        // Dismiss loading toast
        toast.dismiss(loadingToast);
        
        // Error is already handled by the mutation's onError callback
        console.error('Order creation failed:', error);
      }
    } catch (error) {
      console.error('Error in handleOrderComplete:', error);
      toast.error('An unexpected error occurred. Please try again.');
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
    <ErrorBoundary
      FallbackComponent={CheckoutErrorFallback}
      onReset={() => {
        // Reset form state on error boundary reset
        setCurrentStep(1);
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
              <PaymentStepEnhanced
                onBack={handlePaymentBack}
                onComplete={handleOrderComplete}
                orderSummary={orderSummary}
                isLoading={createOrderMutation.isPending}
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

          {/* Debug Info (Development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Debug Info</h4>
              <pre className="text-xs text-gray-600 overflow-auto">
                {JSON.stringify({
                  currentStep,
                  itemCount,
                  totalValue,
                  orderData: {
                    ...orderData,
                    cart: `${items.length} items`
                  },
                  createOrderStatus: {
                    isPending: createOrderMutation.isPending,
                    isError: createOrderMutation.isError,
                    error: createOrderMutation.error?.message
                  }
                }, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CheckoutPageEnhanced;
