/**
 * Advanced Meta Pixel Implementation Examples
 * 
 * This file contains examples of advanced Meta Pixel tracking implementations
 * that you can use throughout your application.
 */

import { 
  trackCustomEvent, 
  trackLead, 
  trackCompleteRegistration,
  trackAddToWishlist,
  formatProductData 
} from '../utils/metaPixel';

// Example: Newsletter Subscription Tracking
export const trackNewsletterSignup = (email, location = '') => {
  trackLead({
    content_name: 'Newsletter Subscription',
    content_category: 'Email Marketing',
    value: 0,
    currency: 'NPR',
    custom_data: {
      email_location: location // e.g., 'footer', 'popup', 'sidebar'
    }
  });

  // Also track as custom event for detailed analysis
  trackCustomEvent('Newsletter_Signup', {
    location: location,
    timestamp: new Date().toISOString()
  });
};

// Example: User Registration Tracking
export const trackUserRegistration = (userType = 'customer') => {
  trackCompleteRegistration({
    content_name: `${userType}_registration`,
    status: true,
    value: 0,
    currency: 'NPR'
  });
};

// Example: Contact Form Submission
export const trackContactFormSubmission = (formType, inquiryType = '') => {
  trackLead({
    content_name: 'Contact Form',
    content_category: formType, // e.g., 'General', 'Support', 'Sales'
    value: 0,
    currency: 'NPR',
    custom_data: {
      inquiry_type: inquiryType,
      form_location: formType
    }
  });
};

// Example: Advanced Wishlist Tracking
export const trackWishlistAction = (product, action = 'add') => {
  if (action === 'add') {
    const productData = formatProductData(product);
    trackAddToWishlist(productData);
  }
  
  // Track custom event for wishlist analytics
  trackCustomEvent('Wishlist_Action', {
    action: action, // 'add', 'remove', 'view'
    product_id: product.id || product._id,
    product_name: product.name,
    product_category: product.category || product.categoryName,
    product_price: product.price || product.regularPrice || 0
  });
};

// Example: Product Review Tracking
export const trackProductReview = (product, rating, reviewData = {}) => {
  trackCustomEvent('Product_Review', {
    content_ids: [product.id || product._id],
    content_name: product.name,
    content_category: product.category || 'products',
    rating: rating,
    review_length: reviewData.review ? reviewData.review.length : 0,
    has_photo: reviewData.photos ? reviewData.photos.length > 0 : false,
    value: product.price || 0,
    currency: 'NPR'
  });
};

// Example: Category Browse Tracking
export const trackCategoryView = (category, productCount = 0) => {
  trackCustomEvent('Category_View', {
    content_name: category.name,
    content_category: 'categories',
    product_count: productCount,
    category_slug: category.slug
  });
};

// Example: Brand Page Tracking
export const trackBrandView = (brand, productCount = 0) => {
  trackCustomEvent('Brand_View', {
    content_name: brand.name,
    content_category: 'brands',
    product_count: productCount,
    brand_slug: brand.slug
  });
};

// Example: Live Chat Tracking
export const trackLiveChatInteraction = (action, data = {}) => {
  trackCustomEvent('Live_Chat', {
    action: action, // 'started', 'message_sent', 'ended'
    chat_duration: data.duration || 0,
    messages_count: data.messageCount || 0,
    resolved: data.resolved || false
  });
};

// Example: Download Tracking (for catalogs, brochures, etc.)
export const trackFileDownload = (fileName, fileType, category = '') => {
  trackCustomEvent('File_Download', {
    content_name: fileName,
    content_category: category || 'downloads',
    file_type: fileType, // 'pdf', 'jpg', 'doc', etc.
    value: 0,
    currency: 'NPR'
  });
};

// Example: Video Interaction Tracking
export const trackVideoInteraction = (videoData, action, progress = 0) => {
  trackCustomEvent('Video_Interaction', {
    content_name: videoData.title || 'Product Video',
    action: action, // 'play', 'pause', 'complete', 'progress_25', 'progress_50', 'progress_75'
    video_duration: videoData.duration || 0,
    progress_percentage: progress,
    video_type: videoData.type || 'product_demo'
  });
};

// Example: Advanced Search Tracking
export const trackAdvancedSearch = (searchData) => {
  trackCustomEvent('Advanced_Search', {
    search_string: searchData.query,
    filters_applied: searchData.filters ? Object.keys(searchData.filters).length : 0,
    sort_option: searchData.sort || 'relevance',
    results_count: searchData.resultsCount || 0,
    category_filter: searchData.categoryFilter || 'all',
    price_range: searchData.priceRange || ''
  });
};

// Example: Subscription Plan Selection (if you have premium features)
export const trackSubscriptionInterest = (planType, planPrice) => {
  trackLead({
    content_name: `${planType} Plan Interest`,
    content_category: 'subscription',
    value: planPrice,
    currency: 'NPR'
  });
};

// Example: Error Tracking (for UX optimization)
export const trackUserError = (errorType, errorMessage, pageLocation) => {
  // Only track in production and don't send sensitive data
  if (process.env.NODE_ENV === 'production') {
    trackCustomEvent('User_Error', {
      error_type: errorType, // 'form_validation', 'api_error', 'page_load', etc.
      error_category: pageLocation, // 'checkout', 'product_page', 'cart', etc.
      // Don't send actual error message for privacy
      has_error: true
    });
  }
};

// Example: Feature Usage Tracking
export const trackFeatureUsage = (featureName, action = 'used') => {
  trackCustomEvent('Feature_Usage', {
    feature_name: featureName,
    action: action, // 'used', 'discovered', 'abandoned'
    timestamp: new Date().toISOString()
  });
};

// Example: Social Share Tracking
export const trackSocialShare = (contentType, contentId, platform, contentName = '') => {
  trackCustomEvent('Social_Share', {
    content_type: contentType, // 'product', 'category', 'article'
    content_ids: [contentId],
    content_name: contentName,
    platform: platform, // 'facebook', 'twitter', 'instagram', 'whatsapp'
    value: 0,
    currency: 'NPR'
  });
};

// Example: Exit Intent Tracking (for popup optimization)
export const trackExitIntent = (pageType, timeSpent) => {
  trackCustomEvent('Exit_Intent', {
    page_type: pageType, // 'product', 'cart', 'checkout', 'home'
    time_spent: timeSpent, // in seconds
    showed_popup: false // set to true if exit intent popup was shown
  });
};

// Helper function to track page engagement
export const trackPageEngagement = (pageType, engagementData) => {
  trackCustomEvent('Page_Engagement', {
    page_type: pageType,
    time_on_page: engagementData.timeOnPage || 0,
    scroll_depth: engagementData.scrollDepth || 0,
    clicks_count: engagementData.clicksCount || 0,
    form_interactions: engagementData.formInteractions || 0
  });
};
