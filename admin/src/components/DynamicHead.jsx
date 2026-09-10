import { useEffect, useState } from 'react';
import axios from 'axios';
import { backendurl } from '../config/constants';

const FALLBACK_FAVICON = '/favicon.png';

const resolveLogoUrl = (logo) => {
  if (!logo) return FALLBACK_FAVICON;
  if (/^https?:\/\//i.test(logo) || logo.startsWith('data:')) return logo;
  return `${backendurl.replace(/\/$/, '')}${logo.startsWith('/') ? logo : `/${logo}`}`;
};

const ensureLink = (rel, attrs = {}) => {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([key, value]) => {
    if (value != null) el.setAttribute(key, value);
  });
  return el;
};

/**
 * Fetches public settings and applies company name + logo to the admin tab.
 */
const DynamicHead = () => {
  const [settings, setSettings] = useState({
    companyName: 'NGENZI REALESTATE',
    companyLogo: null,
  });

  useEffect(() => {
    let cancelled = false;

    const fetchSettings = async () => {
      try {
        const response = await axios.get(`${backendurl}/api/settings`);
        if (!cancelled && response.data?.success && response.data.settings) {
          setSettings(response.data.settings);
        }
      } catch (error) {
        console.warn('Admin head settings unavailable:', error?.message || error);
      }
    };

    fetchSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const companyName = settings.companyName || 'NGENZI REALESTATE';
    document.title = `${companyName} — Admin`;

    const logoUrl = resolveLogoUrl(settings.companyLogo);
    const href = logoUrl.includes('?')
      ? `${logoUrl}&v=${Date.now()}`
      : `${logoUrl}?v=${Date.now()}`;

    const type = href.includes('.svg')
      ? 'image/svg+xml'
      : href.includes('.jpg') || href.includes('.jpeg')
        ? 'image/jpeg'
        : 'image/png';

    ensureLink('icon', { href, type });
    ensureLink('shortcut icon', { href, type });
    ensureLink('apple-touch-icon', { href });
  }, [settings]);

  return null;
};

export default DynamicHead;
