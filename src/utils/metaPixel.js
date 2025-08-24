/**
 * Meta Pixel utility functions
 */

import { META_PIXEL_CONFIG, isPixelEnabled } from '../config/metaPixel';

// Check if fbq is available and tracking is enabled
const isFbqAvailable = () => {
  return isPixelEnabled() && typeof window !== 'undefined' && window.fbq;
};

// Standard Events
export const trackPageView = () => {
  if (isFbqAvailable()) {
    window.fbq('track', 'PageView');
  }
};

export const trackViewContent = (contentData = {}) => {
  if (isFbqAvailable()) {
    const data = {
      content_type: contentData.content_type || 'product',
      content_ids: contentData.content_ids || [],
      content_name: contentData.content_name || '',
      content_category: contentData.content_category || '',
      value: contentData.value || 0,
      currency: contentData.currency || META_PIXEL_CONFIG.DEFAULT_CURRENCY,
      ...contentData
    };
    window.fbq('track', 'ViewContent', data);
  }
};

export const trackAddToCart = (cartData = {}) => {
  if (isFbqAvailable()) {
    const data = {
      content_type: cartData.content_type || 'product',
      content_ids: cartData.content_ids || [],
      content_name: cartData.content_name || '',
      content_category: cartData.content_category || '',
      value: cartData.value || 0,
      currency: cartData.currency || META_PIXEL_CONFIG.DEFAULT_CURRENCY,
      ...cartData
    };
    window.fbq('track', 'AddToCart', data);
  }
};

export const trackInitiateCheckout = (checkoutData = {}) => {
  if (isFbqAvailable()) {
    const data = {
      content_type: checkoutData.content_type || 'product',
      content_ids: checkoutData.content_ids || [],
      value: checkoutData.value || 0,
      currency: checkoutData.currency || META_PIXEL_CONFIG.DEFAULT_CURRENCY,
      num_items: checkoutData.num_items || 1,
      ...checkoutData
    };
    window.fbq('track', 'InitiateCheckout', data);
  }
};

export const trackPurchase = (purchaseData = {}) => {
  if (isFbqAvailable()) {
    const data = {
      content_type: purchaseData.content_type || 'product',
      content_ids: purchaseData.content_ids || [],
      value: purchaseData.value || 0,
      currency: purchaseData.currency || META_PIXEL_CONFIG.DEFAULT_CURRENCY,
      num_items: purchaseData.num_items || 1,
      ...purchaseData
    };
    window.fbq('track', 'Purchase', data);
  }
};

export const trackAddToWishlist = (wishlistData = {}) => {
  if (isFbqAvailable()) {
    const data = {
      content_type: wishlistData.content_type || 'product',
      content_ids: wishlistData.content_ids || [],
      content_name: wishlistData.content_name || '',
      content_category: wishlistData.content_category || '',
      value: wishlistData.value || 0,
      currency: wishlistData.currency || META_PIXEL_CONFIG.DEFAULT_CURRENCY,
      ...wishlistData
    };
    window.fbq('track', 'AddToWishlist', data);
  }
};

export const trackSearch = (searchData = {}) => {
  if (isFbqAvailable()) {
    const data = {
      search_string: searchData.search_string || '',
      content_type: searchData.content_type || 'product',
      content_ids: searchData.content_ids || [],
      ...searchData
    };
    window.fbq('track', 'Search', data);
  }
};

export const trackLead = (leadData = {}) => {
  if (isFbqAvailable()) {
    const data = {
      content_name: leadData.content_name || '',
      content_category: leadData.content_category || '',
      value: leadData.value || 0,
      currency: leadData.currency || META_PIXEL_CONFIG.DEFAULT_CURRENCY,
      ...leadData
    };
    window.fbq('track', 'Lead', data);
  }
};

export const trackCompleteRegistration = (registrationData = {}) => {
  if (isFbqAvailable()) {
    const data = {
      content_name: registrationData.content_name || '',
      status: registrationData.status || true,
      ...registrationData
    };
    window.fbq('track', 'CompleteRegistration', data);
  }
};

// Custom Events
export const trackCustomEvent = (eventName, eventData = {}) => {
  if (isFbqAvailable()) {
    window.fbq('trackCustom', eventName, eventData);
  }
};

// Helper function to format product data for tracking
export const formatProductData = (product) => {
  return {
    content_ids: [product.id || product._id || ''],
    content_name: product.name || product.title || '',
    content_category: product.category || product.categoryName || '',
    value: product.price || 0,
    currency: META_PIXEL_CONFIG.DEFAULT_CURRENCY
  };
};

// Helper function to format cart data for tracking
export const formatCartData = (cartItems) => {
  const content_ids = cartItems.map(item => item.id || item._id || item.productId || '');
  const value = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const num_items = cartItems.reduce((total, item) => total + item.quantity, 0);

  return {
    content_ids,
    value,
    currency: META_PIXEL_CONFIG.DEFAULT_CURRENCY,
    num_items,
    content_type: 'product'
  };
};
