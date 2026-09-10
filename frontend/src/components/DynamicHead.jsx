import { useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { Backendurl } from '../utils/backendUrl';
import { absoluteImage } from '../utils/seoConfig';

const FALLBACK_FAVICON = '/favicon.png';

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
 * Applies brand favicon (+ apple-touch-icon) from settings.companyLogo.
 * Page titles stay owned by SEOHead; we only refresh the browser tab icon.
 */
const DynamicHead = () => {
  const { settings, loading } = useSettings();

  useEffect(() => {
    if (loading) return;

    const logoUrl = settings?.companyLogo
      ? absoluteImage(settings.companyLogo, settings, Backendurl)
      : FALLBACK_FAVICON;

    // Bust cache so updated admin logos show in the tab immediately
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

    // Keep site name meta in sync when settings load
    if (settings?.companyName) {
      const ogSite = document.querySelector('meta[property="og:site_name"]');
      if (ogSite) ogSite.setAttribute('content', settings.companyName);
    }
  }, [settings, loading]);

  return null;
};

export default DynamicHead;
