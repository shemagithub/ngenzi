import { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { Backendurl } from '../utils/backendUrl';

const DynamicHead = () => {
  const { settings, loading } = useSettings();

  useEffect(() => {
    if (!loading && settings) {
      // Update document title
      const companyName = settings.companyName || 'NGENZI REALESTATE';
      document.title = `${companyName} - Premium Real Estate Platform | Find Your Perfect Home`;

      // Update favicon
      const faviconLink = document.querySelector("link[rel='icon']") || document.createElement('link');
      faviconLink.rel = 'icon';
      
      if (settings.companyLogo) {
        // Use company logo as favicon
        faviconLink.href = settings.companyLogo.startsWith('http') 
          ? settings.companyLogo 
          : `${Backendurl}${settings.companyLogo}`;
      } else {
        // Fallback to default favicon
        faviconLink.href = './src/assets/home-regular-24.png';
      }
      
      if (!document.querySelector("link[rel='icon']")) {
        document.head.appendChild(faviconLink);
      }

      // Update meta description if available
      if (settings.metaDescription) {
        let metaDescription = document.querySelector("meta[name='description']");
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.name = 'description';
          document.head.appendChild(metaDescription);
        }
        metaDescription.content = settings.metaDescription;
      }

      // Update Open Graph title
      if (settings.metaTitle || settings.companyName) {
        let ogTitle = document.querySelector("meta[property='og:title']");
        if (!ogTitle) {
          ogTitle = document.createElement('meta');
          ogTitle.setAttribute('property', 'og:title');
          document.head.appendChild(ogTitle);
        }
        ogTitle.content = settings.metaTitle || `${companyName} - Premium Real Estate Platform`;
      }

      // Update Open Graph image if logo is available
      if (settings.companyLogo) {
        const logoUrl = settings.companyLogo.startsWith('http') 
          ? settings.companyLogo 
          : `${Backendurl}${settings.companyLogo}`;
        
        let ogImage = document.querySelector("meta[property='og:image']");
        if (!ogImage) {
          ogImage = document.createElement('meta');
          ogImage.setAttribute('property', 'og:image');
          document.head.appendChild(ogImage);
        }
        ogImage.content = logoUrl;
      }
    }
  }, [settings, loading]);

  return null;
};

export default DynamicHead;

