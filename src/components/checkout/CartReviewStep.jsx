import React from 'react';
import { useCart } from '../../contexts/CartContext';

const CartReviewStep = ({ onNext, cart = [], items = [], totalValue, formatPrice, orderSummary }) => {
  const { formatPrice: cartFormatPrice } = useCart();
  
  // Use the formatPrice prop if provided, otherwise use the one from context
  const priceFormatter = formatPrice || cartFormatPrice;
  
  // Use items prop if provided, otherwise fall back to cart prop
  const cartItems = items.length > 0 ? items : cart;
  
  // Helper function to get the effective price of a product
  const getProductPrice = (product) => {
    if (!product) return 0;

    // First check for special offer price
    if (product.specialOfferPrice && product.specialOfferPrice < product.regularPrice) {
      return product.specialOfferPrice;
    }
    
    // Then check for discount value
    if (product.discountValue > 0 && product.regularPrice) {
      if (product.discountType === 'percentage') {
        return product.regularPrice * (1 - product.discountValue / 100);
      } else {
        return product.regularPrice - product.discountValue;
      }
    }
    
    // Default to regular price
    return product.regularPrice || 0;
  };
  
  // Calculate cart total based on the updated cart structure
  const cartTotal = cartItems.reduce((total, item) => {
    const price = getProductPrice(item.product);
    return total + (price * item.quantity);
  }, 0);
  
  // Use provided totalValue if available, otherwise calculate from cart
  const displayTotal = totalValue || cartTotal;
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-mobile p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Review Your Cart</h3>
        
        {cartItems.length > 0 ? (
          <div className="space-y-4">
            {/* Cart Items */}
            <div className="divide-y divide-gray-200">
              {cartItems.map((item) => (
                <div key={item._id} className="py-4 flex justify-between">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={item.product.images && item.product.images[0] ? item.product.images[0] : '/images/placeholder.jpg'} 
                      alt={item.product.name}
                      className="w-16 h-16 rounded-md object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{item.product.name}</h4>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      {item.attributes && Object.keys(item.attributes).length > 0 && (
                        <p className="text-xs text-gray-500">
                          {Object.entries(item.attributes).map(([key, value]) => (
                            <span key={key} className="mr-2">{key}: {value}</span>
                          ))}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      Rs. {priceFormatter(getProductPrice(item.product) * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="border-t border-gray-200 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>Rs. {priceFormatter(displayTotal)}</span>
                </div>
                {orderSummary && (
                  <>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Shipping</span>
                      <span>Rs. {priceFormatter(orderSummary.shipping)}</span>
                    </div>
                    <div className="flex justify-between text-base font-medium text-gray-900 pt-2 border-t">
                      <span>Total</span>
                      <span>Rs. {priceFormatter(orderSummary.total)}</span>
                    </div>
                  </>
                )}
                {!orderSummary && (
                  <>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Shipping</span>
                      <span>Calculated next</span>
                    </div>
                    <div className="flex justify-between text-base font-medium text-gray-900 pt-2 border-t">
                      <span>Total</span>
                      <span>Rs. {priceFormatter(displayTotal)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Next Step Button */}
            <button
              onClick={onNext}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-md text-sm font-medium transition duration-300"
            >
              Proceed to Shipping
            </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 mb-4 text-gray-400">
              <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
            <p className="text-gray-500">Add items to your cart to continue shopping</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartReviewStep;