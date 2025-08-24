import React, { useEffect } from 'react';
import { useSeoSettings } from '../../hooks/useHomepageQueries';

const SEOHead = ({ 
  title, 
  description, 
  image, 
  url, 
  type = 'website',
  keywords = '',
  noIndex = false 
}) => {
  const { data: seoSettings, isLoading } = useSeoSettings();

  useEffect(() => {
    if (isLoading) return;

    // Get default values from SEO settings
    const defaultTitle = seoSettings?.defaultMetaTitle || 'Medical Devices Nepal | Quality Healthcare Equipment';
    const defaultDescription = seoSettings?.defaultMetaDescription || 'Your trusted source for medical devices and healthcare equipment in Nepal. Quality products from leading manufacturers.';
    const defaultImage = seoSettings?.defaultSocialImage || '';

    // Use provided values or fall back to defaults
    const finalTitle = title || defaultTitle;
    const finalDescription = description || defaultDescription;
    const finalImage = image || defaultImage;
    const finalUrl = url || window.location.href;

    // Update document title
    document.title = finalTitle;

    // Update or create meta tags
    const updateMetaTag = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = name;
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    const updatePropertyTag = (property, content) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Basic SEO meta tags
    updateMetaTag('description', finalDescription);
    if (keywords) {
      updateMetaTag('keywords', keywords);
    }
    if (noIndex) {
      updateMetaTag('robots', 'noindex, nofollow');
    } else {
      updateMetaTag('robots', 'index, follow');
    }

    // Open Graph meta tags
    updatePropertyTag('og:title', finalTitle);
    updatePropertyTag('og:description', finalDescription);
    updatePropertyTag('og:image', finalImage);
    updatePropertyTag('og:url', finalUrl);
    updatePropertyTag('og:type', type);
    updatePropertyTag('og:site_name', 'Medical Devices Nepal');

    // Twitter Card meta tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', finalTitle);
    updateMetaTag('twitter:description', finalDescription);
    updateMetaTag('twitter:image', finalImage);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = finalUrl;

    // Google Analytics (if configured)
    if (seoSettings?.googleAnalyticsId) {
      // Initialize Google Analytics
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('config', seoSettings.googleAnalyticsId, {
          page_title: finalTitle,
          page_location: finalUrl
        });
      }
    }

  }, [title, description, image, url, type, keywords, noIndex, seoSettings, isLoading]);

  return null; // This component doesn't render anything
};

export default SEOHead; 