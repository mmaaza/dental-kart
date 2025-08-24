/**
 * Meta Pixel Configuration
 * 
 * Replace 'YOUR_PIXEL_ID' with your actual Meta Pixel ID from Facebook Business Manager
 * 
 * To get your Pixel ID:
 * 1. Go to Facebook Business Manager (business.facebook.com)
 * 2. Navigate to Events Manager
 * 3. Select your Pixel
 * 4. Copy the Pixel ID from the settings
 */

export const META_PIXEL_CONFIG = {
  // Your actual Meta Pixel ID
  PIXEL_ID: '774780844933696',
  
  // Default currency for your store
  DEFAULT_CURRENCY: 'NPR',
  
  // Enable/disable tracking in different environments
  ENABLED: {
    development: true, // Set to true if you want tracking in development
    production: true,   // Always true for production
  },
  
  // Standard events configuration
  EVENTS: {
    PAGE_VIEW: 'PageView',
    VIEW_CONTENT: 'ViewContent',
    ADD_TO_CART: 'AddToCart',
    INITIATE_CHECKOUT: 'InitiateCheckout',
    PURCHASE: 'Purchase',
    ADD_TO_WISHLIST: 'AddToWishlist',
    SEARCH: 'Search',
    LEAD: 'Lead',
    COMPLETE_REGISTRATION: 'CompleteRegistration',
  },
  
  // Custom events (if you want to track additional events)
  CUSTOM_EVENTS: {
    NEWSLETTER_SIGNUP: 'Newsletter_Signup',
    PRODUCT_REVIEW: 'Product_Review',
    CONTACT_FORM: 'Contact_Form',
    LIVE_CHAT: 'Live_Chat_Started',
  }
};

/**
 * Check if Meta Pixel should be enabled in the current environment
 */
export const isPixelEnabled = () => {
  const env = process.env.NODE_ENV || 'development';
  return META_PIXEL_CONFIG.ENABLED[env] && META_PIXEL_CONFIG.PIXEL_ID !== '774780844933696';
};

/**
 * Get the current pixel ID
 */
export const getPixelId = () => {
  return META_PIXEL_CONFIG.PIXEL_ID;
};
