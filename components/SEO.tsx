import React, { useEffect } from 'react';
import { useSiteSettings } from '../contexts/SiteSettingsContext';

interface SEOProps {
  title: string;
  description: string;
  image?: string;
}

const SEO: React.FC<SEOProps> = ({ title, description, image }) => {
  const { settings } = useSiteSettings();
  
  // Use provided image, or fallback to global setting, or fallback to placeholder
  const metaImage = image || settings.og_image_url || 'https://via.placeholder.com/1200x630?text=HyperBuild+Labs';

  useEffect(() => {
    // Update title
    document.title = `${title} | ${settings.company_name || 'HyperBuild Labs'}`;

    // Helper to update meta tags
    const updateMeta = (name: string, content: string, attribute = 'name') => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Standard Meta
    updateMeta('description', description);

    // Open Graph / Facebook
    updateMeta('og:type', 'website', 'property');
    updateMeta('og:title', title, 'property');
    updateMeta('og:description', description, 'property');
    updateMeta('og:image', metaImage, 'property');

    // Twitter
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', metaImage);

  }, [title, description, image, settings.company_name, settings.og_image_url, metaImage]);

  return null;
};

export default SEO;