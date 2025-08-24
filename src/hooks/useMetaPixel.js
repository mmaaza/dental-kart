import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/metaPixel';

/**
 * Hook to track page views automatically when route changes
 */
export const useMetaPixelPageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView();
  }, [location.pathname]);
};

/**
 * Hook to provide Meta Pixel tracking functions
 */
export const useMetaPixel = () => {
  return {
    trackPageView: () => trackPageView(),
    trackViewContent: (data) => {
      const { trackViewContent } = require('../utils/metaPixel');
      trackViewContent(data);
    },
    trackAddToCart: (data) => {
      const { trackAddToCart } = require('../utils/metaPixel');
      trackAddToCart(data);
    },
    trackInitiateCheckout: (data) => {
      const { trackInitiateCheckout } = require('../utils/metaPixel');
      trackInitiateCheckout(data);
    },
    trackPurchase: (data) => {
      const { trackPurchase } = require('../utils/metaPixel');
      trackPurchase(data);
    },
    trackAddToWishlist: (data) => {
      const { trackAddToWishlist } = require('../utils/metaPixel');
      trackAddToWishlist(data);
    },
    trackSearch: (data) => {
      const { trackSearch } = require('../utils/metaPixel');
      trackSearch(data);
    },
    trackLead: (data) => {
      const { trackLead } = require('../utils/metaPixel');
      trackLead(data);
    },
    trackCompleteRegistration: (data) => {
      const { trackCompleteRegistration } = require('../utils/metaPixel');
      trackCompleteRegistration(data);
    },
    trackCustomEvent: (eventName, data) => {
      const { trackCustomEvent } = require('../utils/metaPixel');
      trackCustomEvent(eventName, data);
    }
  };
};
