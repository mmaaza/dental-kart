import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CartPage = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const cartContext = useCart();
  const { 
    items, 
    itemCount, 
    totalValue, 
    updateCartItem, 
    removeFromCart,
    clearCart,
    formatPrice,
    loading,
    hasDeletedProducts,
    cleanupDeletedProducts
  } = cartContext || {};
  
  // Helper function to calculate the effective price of a product
  const getEffectivePrice = (product) => {
    if (!product) return 0;
    
    // First check for special offer price
    if (product.specialOfferPrice && product.specialOfferPrice < product.regularPrice) {
      return product.specialOfferPrice;
    }
    
    // Then check for discount value
    if (product.discountValue > 0) {
      if (product.discountType === 'percentage') {
        return product.regularPrice * (1 - product.discountValue / 100);
      } else {
        return product.regularPrice - product.discountValue;
      }
    }
    
    // Default to regular price
    return product.regularPrice || 0;
  };
  
  // Helper function to calculate savings for a product
  const getSavings = (product) => {
    if (!product) return 0;
    
    // Special offer price savings
    if (product.specialOfferPrice && product.specialOfferPrice < product.regularPrice) {
      return product.regularPrice - product.specialOfferPrice;
    }
    
    // Discount savings
    if (product.discountValue > 0) {
      if (product.discountType === 'percentage') {
        return (product.regularPrice * product.discountValue) / 100;
      } else {
        return product.discountValue;
      }
    }
    
    return 0;
  };

  const handleQuantityChange = async (itemId, quantity) => {
    if (quantity < 1) return;
    await updateCartItem(itemId, quantity);
  };

  const handleRemoveItem = async (itemId) => {
    await removeFromCart(itemId);
  };

  const handleClearCart = async () => {
    await clearCart();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8 md:py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-admin-slate-800 font-heading mb-4 md:mb-6">Your Cart</h1>
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin inline-block w-8 h-8 border-4 rounded-full text-primary-500 border-t-transparent" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 sm:py-8 md:py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-admin-slate-800 font-heading mb-4 md:mb-6">Your Cart</h1>
        
        {/* Enhanced Empty Cart Section */}
        <div className="bg-white rounded-mobile-lg border border-admin-slate-200 shadow-mobile overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 mx-auto bg-white rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-12 h-12 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-secondary-200 rounded-full opacity-60"></div>
              <div className="absolute -bottom-1 -left-3 w-4 h-4 bg-primary-200 rounded-full opacity-40"></div>
            </div>
            
            <h2 className="text-xl md:text-2xl font-bold text-admin-slate-800 mb-2">Your cart is empty</h2>
            <p className="text-sm md:text-base text-admin-slate-600 max-w-md mx-auto leading-relaxed">
              Looks like you haven't added any medical products to your cart yet. 
              Start exploring our wide range of medical equipment and supplies.
            </p>
          </div>
          
          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
              <div className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-medium text-admin-slate-800 mb-1">Quality Products</h3>
                <p className="text-xs text-admin-slate-600">Certified medical equipment</p>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="font-medium text-admin-slate-800 mb-1">Fast Delivery</h3>
                <p className="text-xs text-admin-slate-600">Quick & secure shipping</p>
              </div>
              
              <div className="text-center p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z" />
                  </svg>
                </div>
                <h3 className="font-medium text-admin-slate-800 mb-1">Expert Support</h3>
                <p className="text-xs text-admin-slate-600">Professional assistance</p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                to="/products" 
                className="flex items-center justify-center bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white py-3 px-6 rounded-mobile text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Browse Products
              </Link>
              
              <Link 
                to="/categories" 
                className="flex items-center justify-center border-2 border-primary-200 text-primary-600 hover:bg-primary-50 py-3 px-6 rounded-mobile text-sm font-medium transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                View Categories
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 md:py-10">
      <h1 className="text-2xl md:text-3xl font-bold text-admin-slate-800 font-heading mb-4 md:mb-6">Your Cart</h1>
      
      {/* Deleted Products Notification */}
      {hasDeletedProducts && typeof hasDeletedProducts === 'function' && hasDeletedProducts() && (
        <div className="mb-4 md:mb-6 bg-amber-50 border border-amber-200 rounded-mobile-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-amber-800">
                Some items in your cart are no longer available
              </h3>
              <p className="mt-1 text-sm text-amber-700">
                These products may have been removed or are out of stock. Click the button below to remove them from your cart.
              </p>
              <div className="mt-3">
                <button
                  onClick={() => {
                    if (cleanupDeletedProducts && typeof cleanupDeletedProducts === 'function') {
                      cleanupDeletedProducts();
                    }
                  }}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-800 text-sm font-medium px-3 py-1.5 rounded-md transition-colors"
                >
                  Remove Unavailable Items
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          {/* Cart items */}
          <div className="bg-white rounded-mobile-lg shadow-mobile overflow-hidden">
            <div className="p-3.5 md:p-4 border-b border-admin-slate-200">
              <div className="flex justify-between items-center">
                <h2 className="text-base md:text-lg font-medium text-admin-slate-800">{itemCount} Items in Cart</h2>
                <button 
                  onClick={handleClearCart}
                  className="text-secondary-500 hover:text-secondary-600 active:text-secondary-700 text-xs md:text-sm font-medium"
                >
                  Clear Cart
                </button>
              </div>
            </div>
            
            <ul>
              {items.map(item => (
                <li key={item._id} className="border-b border-admin-slate-200 last:border-b-0 p-3.5 md:p-4">
                  <div className="flex items-center gap-3 md:gap-4">
                    {/* Product image */}
                    <div className="w-16 h-16 md:w-20 md:h-20 flex-shrink-0">
                      <img 
                        src={item.product.images && item.product.images[0] ? item.product.images[0] : '/images/placeholder.jpg'} 
                        alt={item.product.name}
                        className="w-full h-full object-cover rounded-mobile"
                      />
                    </div>
                    
                    {/* Product info */}
                    <div className="flex-grow">
                      <Link to={`/product/${item.product.slug}`} className="text-sm md:text-base font-medium line-clamp-2 text-admin-slate-800 hover:text-primary-600">
                        {item.product.name}
                      </Link>
                      
                      {/* Product attributes if any */}
                      {item.attributes && Object.keys(item.attributes).length > 0 && (
                        <div className="text-xs md:text-sm text-admin-slate-500 mt-1.5">
                          {Object.entries(item.attributes).map(([key, value]) => (
                            <span key={key} className="mr-2">{key}: {value}</span>
                          ))}
                        </div>
                      )}
                      
                      {/* Price */}
                      <div className="mt-1.5">
                        {/* Current price - using our helper function */}
                        <span className="text-sm md:text-base font-medium text-primary-600">
                          Rs. {formatPrice(getEffectivePrice(item.product))}
                        </span>
                        
                        {/* Show discount info if there are any savings */}
                        {getSavings(item.product) > 0 && (
                          <div className="flex flex-wrap items-center gap-x-2 mt-1">
                            <span className="text-xs md:text-sm text-admin-slate-500 line-through">
                              Rs. {formatPrice(item.product.regularPrice)}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 bg-secondary-50 text-secondary-600 rounded-sm font-medium">
                              {item.product.discountType === 'percentage' && item.product.discountValue > 0
                                ? `${item.product.discountValue}% Off`
                                : `Save Rs. ${formatPrice(getSavings(item.product))}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Quantity controls */}
                    <div className="flex items-center border border-admin-slate-200 rounded-mobile">
                      <button 
                        onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                        className="px-2 md:px-3 py-1 border-r border-admin-slate-200 text-admin-slate-800 active:bg-admin-slate-100 transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span className="px-2 md:px-3 py-1 min-w-[1.5rem] md:min-w-[2rem] text-center text-sm text-admin-slate-800">{item.quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                        className="px-2 md:px-3 py-1 border-l border-admin-slate-200 text-admin-slate-800 active:bg-admin-slate-100 transition-colors"
                        disabled={item.quantity >= (item.product.stock || 99)}
                      >
                        +
                      </button>
                    </div>
                    
                    {/* Item subtotal */}
                    <div className="w-16 md:w-24 text-right text-sm md:text-base font-medium text-primary-600">
                      Rs. {formatPrice(getEffectivePrice(item.product) * item.quantity)}
                    </div>
                    
                    {/* Remove button */}
                    <button 
                      onClick={() => handleRemoveItem(item._id)}
                      className="text-admin-slate-400 hover:text-secondary-500 active:text-secondary-700 ml-1.5 md:ml-2 active:scale-95 transition-all duration-300"
                      aria-label="Remove item"
                    >
                      <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"></path>
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Order summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-mobile-lg shadow-mobile p-4 md:p-5 sticky top-4">
            <h2 className="text-base md:text-lg font-medium text-admin-slate-800 mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-sm md:text-base text-admin-slate-500">Subtotal</span>
                <span className="text-sm md:text-base font-medium text-admin-slate-800">Rs. {formatPrice(totalValue)}</span>
              </div>
              
              {/* Calculate total discount using helper function */}
              {items.some(item => getSavings(item.product) > 0) && (
                <div className="flex justify-between">
                  <span className="text-sm md:text-base text-admin-slate-500">Discount</span>
                  <span className="text-sm md:text-base font-medium text-secondary-600">
                    - Rs. {formatPrice(items.reduce((total, item) => {
                      return total + (getSavings(item.product) * item.quantity);
                    }, 0))}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-sm md:text-base text-admin-slate-500">Shipping</span>
                <span className="text-xs md:text-sm text-admin-slate-500">Calculated at checkout</span>
              </div>
              {/* You can add more details like tax, discounts etc. */}
            </div>
            
            <div className="border-t border-admin-slate-200 pt-3 mb-4">
              <div className="flex justify-between font-medium text-base md:text-lg text-admin-slate-800">
                <span>Total</span>
                <span>Rs. {formatPrice(totalValue)}</span>
              </div>
            </div>
            
            <Link 
              to="/checkout" 
              className="flex items-center justify-center w-full bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-medium py-3 px-4 rounded-mobile shadow-sm transition duration-300"
            >
              Proceed to Checkout
            </Link>
            
            <Link 
              to="/products" 
              className="flex items-center justify-center w-full border border-primary-500 text-primary-600 font-medium py-2.5 px-4 rounded-mobile mt-3 hover:bg-primary-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
