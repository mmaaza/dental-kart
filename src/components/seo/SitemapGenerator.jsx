import React, { useEffect, useState } from 'react';
import { useSeoSettings } from '../../hooks/useHomepageQueries';
import api from '../../services/api';

const SitemapGenerator = () => {
  const { data: seoSettings, isLoading } = useSeoSettings();
  const [sitemapContent, setSitemapContent] = useState('');

  useEffect(() => {
    if (isLoading || !seoSettings?.sitemapEnabled) return;

    const generateSitemap = async () => {
      try {
        // Get base URL
        const baseUrl = window.location.origin;
        const currentDate = new Date().toISOString();

        // Start building XML sitemap
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Add static pages
        const staticPages = [
          { url: '/', priority: '1.0', changefreq: 'daily' },
          { url: '/categories', priority: '0.8', changefreq: 'weekly' },
          { url: '/products', priority: '0.8', changefreq: 'weekly' },
          { url: '/brands', priority: '0.7', changefreq: 'weekly' },
          { url: '/login', priority: '0.3', changefreq: 'monthly' },
          { url: '/signup', priority: '0.3', changefreq: 'monthly' }
        ];

        // Add static pages to sitemap
        staticPages.forEach(page => {
          xml += `  <url>\n`;
          xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
          xml += `    <lastmod>${currentDate}</lastmod>\n`;
          xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
          xml += `    <priority>${page.priority}</priority>\n`;
          xml += `  </url>\n`;
        });

        // Add categories
        try {
          const categoriesResponse = await api.get('/categories', {
            params: { status: 'active' }
          });
          
          if (categoriesResponse.data?.data) {
            categoriesResponse.data.data.forEach(category => {
              xml += `  <url>\n`;
              xml += `    <loc>${baseUrl}/category/${category.slug}</loc>\n`;
              xml += `    <lastmod>${currentDate}</lastmod>\n`;
              xml += `    <changefreq>weekly</changefreq>\n`;
              xml += `    <priority>0.7</priority>\n`;
              xml += `  </url>\n`;
            });
          }
        } catch (error) {
          console.error('Error fetching categories for sitemap:', error);
        }

        // Add brands
        try {
          const brandsResponse = await api.get('/brands', {
            params: { status: 'active' }
          });
          
          if (brandsResponse.data?.data) {
            brandsResponse.data.data.forEach(brand => {
              xml += `  <url>\n`;
              xml += `    <loc>${baseUrl}/brands/${brand.slug}</loc>\n`;
              xml += `    <lastmod>${currentDate}</lastmod>\n`;
              xml += `    <changefreq>weekly</changefreq>\n`;
              xml += `    <priority>0.6</priority>\n`;
              xml += `  </url>\n`;
            });
          }
        } catch (error) {
          console.error('Error fetching brands for sitemap:', error);
        }

        // Add products
        try {
          const productsResponse = await api.get('/products', {
            params: { status: 'active', limit: 1000 }
          });
          
          if (productsResponse.data?.data) {
            productsResponse.data.data.forEach(product => {
              xml += `  <url>\n`;
              xml += `    <loc>${baseUrl}/product/${product.slug}</loc>\n`;
              xml += `    <lastmod>${currentDate}</lastmod>\n`;
              xml += `    <changefreq>weekly</changefreq>\n`;
              xml += `    <priority>0.8</priority>\n`;
              xml += `  </url>\n`;
            });
          }
        } catch (error) {
          console.error('Error fetching products for sitemap:', error);
        }

        xml += '</urlset>';

        setSitemapContent(xml);
      } catch (error) {
        console.error('Error generating sitemap:', error);
      }
    };

    generateSitemap();
  }, [seoSettings, isLoading]);

  useEffect(() => {
    if (!sitemapContent) return;

    // Create a blob with the sitemap content
    const blob = new Blob([sitemapContent], { type: 'application/xml' });
    const sitemapUrl = URL.createObjectURL(blob);

    // Create a link element to download sitemap.xml
    const link = document.createElement('a');
    link.href = sitemapUrl;
    link.download = 'sitemap.xml';
    link.style.display = 'none';
    document.body.appendChild(link);

    // Clean up
    return () => {
      URL.revokeObjectURL(sitemapUrl);
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, [sitemapContent]);

  return null; // This component doesn't render anything
};

export default SitemapGenerator; 