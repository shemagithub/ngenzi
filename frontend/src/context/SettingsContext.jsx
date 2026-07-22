import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Backendurl } from '../utils/backendUrl';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${Backendurl}/api/settings`);
      
      if (response.data.success) {
        setSettings(response.data.settings);
      } else {
        setError('Failed to load settings');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err.message);
      // Set default settings if fetch fails
      setSettings({
        companyName: 'NGENZI REALESTATE',
        companyEmail: 'support@ngenzirealestate.com',
        companyLogo: null,
        companyPhone: null,
        companyAddress: null,
        websiteUrl: null,
        facebook: null,
        twitter: null,
        instagram: null,
        linkedin: null,
        youtube: null,
        whatsapp: null,
        aboutUs: null,
        termsAndConditions: null,
        privacyPolicy: null
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const value = {
    settings,
    loading,
    error,
    refetch: fetchSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

