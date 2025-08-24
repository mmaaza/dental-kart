import React, { useEffect } from 'react';
import { useSeoSettings } from '../../hooks/useHomepageQueries';

const GoogleAnalytics = () => {
  const { data: seoSettings, isLoading } = useSeoSettings();

  useEffect(() => {
    if (isLoading) return;

    // If no GA ID is configured, don't do anything
    if (!seoSettings?.googleAnalyticsId) {
      console.log('Google Analytics ID not configured in SEO settings');
      return;
    }

    // Load Google Analytics script dynamically
    const loadGoogleAnalytics = () => {
      // Check if GA is already loaded
      if (window.gtag) {
        console.log('Google Analytics already loaded');
        return;
      }

      // Create and load the GA script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${seoSettings.googleAnalyticsId}`;
      
      script.onload = () => {
        // Initialize gtag
        window.dataLayer = window.dataLayer || [];
        window.gtag = function() {
          window.dataLayer.push(arguments);
        };
        
        // Configure Google Analytics
        window.gtag('js', new Date());
        window.gtag('config', seoSettings.googleAnalyticsId, {
          page_title: document.title,
          page_location: window.location.href,
          send_page_view: true
        });
        
        console.log('Google Analytics loaded and configured with ID:', seoSettings.googleAnalyticsId);
      };

      script.onerror = () => {
        console.error('Failed to load Google Analytics script');
      };

      // Add script to head
      document.head.appendChild(script);
    };

    // Load GA
    loadGoogleAnalytics();
  }, [seoSettings, isLoading]);

  // Track page views when the route changes
  useEffect(() => {
    if (isLoading || !seoSettings?.googleAnalyticsId || !window.gtag) return;

    const trackPageView = () => {
      if (window.gtag) {
        window.gtag('event', 'page_view', {
          page_title: document.title,
          page_location: window.location.href
        });
        console.log('Page view tracked:', window.location.href);
      }
    };

    // Track initial page view
    trackPageView();

    // Listen for route changes (for SPA navigation)
    const handleRouteChange = () => {
      setTimeout(trackPageView, 100);
    };

    // Listen for popstate (back/forward navigation)
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [seoSettings, isLoading]);

  return null; // This component doesn't render anything
};

export default GoogleAnalytics; 