import { useEffect, useState } from 'react';
import axios from 'axios';
import { backendurl } from '../config/constants';

const DynamicHead = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // No token, use defaults
          setSettings({
            companyName: 'NGENZI REALESTATE',
            companyLogo: null
          });
          setLoading(false);
          return;
        }

        const response = await axios.get(`${backendurl}/api/settings`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setSettings(response.data.settings);
        } else {
          // Use defaults if fetch fails
          setSettings({
            companyName: 'NGENZI REALESTATE',
            companyLogo: null
          });
        }
      } catch (error) {
        console.error('Error fetching settings for head:', error);
        // Use defaults if fetch fails
        setSettings({
          companyName: 'NGENZI REALESTATE',
          companyLogo: null
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  useEffect(() => {
    if (!loading && settings) {
      // Update document title
      const companyName = settings.companyName || 'NGENZI REALESTATE';
      document.title = `${companyName} - Admin Panel`;

      // Update favicon
      const faviconLink = document.querySelector("link[rel='icon']") || document.createElement('link');
      faviconLink.rel = 'icon';
      
      if (settings.companyLogo) {
        // Use company logo as favicon
        const logoUrl = settings.companyLogo.startsWith('http') 
          ? settings.companyLogo 
          : `${backendurl}${settings.companyLogo}`;
        faviconLink.href = logoUrl;
      } else {
        // Fallback to default favicon
        faviconLink.href = './src/assets/administrator.png';
      }
      
      if (!document.querySelector("link[rel='icon']")) {
        document.head.appendChild(faviconLink);
      }
    }
  }, [settings, loading]);

  return null;
};

export default DynamicHead;

