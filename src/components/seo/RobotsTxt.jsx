import React, { useEffect } from 'react';
import { useSeoSettings } from '../../hooks/useHomepageQueries';

const RobotsTxt = () => {
  const { data: seoSettings, isLoading } = useSeoSettings();

  useEffect(() => {
    if (isLoading) return;

    // Create robots.txt content
    const robotsContent = seoSettings?.robotsTxt || 'User-agent: *\nAllow: /';

    // Create a blob with the robots.txt content
    const blob = new Blob([robotsContent], { type: 'text/plain' });
    const robotsUrl = URL.createObjectURL(blob);

    // Create a link element to download robots.txt
    const link = document.createElement('a');
    link.href = robotsUrl;
    link.download = 'robots.txt';
    link.style.display = 'none';
    document.body.appendChild(link);

    // Clean up
    return () => {
      URL.revokeObjectURL(robotsUrl);
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, [seoSettings, isLoading]);

  return null; // This component doesn't render anything
};

export default RobotsTxt; 