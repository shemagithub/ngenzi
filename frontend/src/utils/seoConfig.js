/**
 * Central SEO site config — aligned with Google Search Central practices.
 * Prefer settings.websiteUrl when available; fall back to production domain.
 */
export const DEFAULT_SITE_URL = 'https://ngenzirealestate.com';
export const DEFAULT_SITE_NAME = 'NGENZI REALESTATE';
export const DEFAULT_LOCALE = 'en_RW';

export const getSiteUrl = (settings) => {
  const fromSettings = settings?.websiteUrl?.trim();
  if (fromSettings && /^https?:\/\//i.test(fromSettings) && !fromSettings.includes('localhost')) {
    return fromSettings.replace(/\/$/, '');
  }
  return DEFAULT_SITE_URL;
};

export const absoluteUrl = (path = '/', settings) => {
  const base = getSiteUrl(settings);
  if (!path || path === '/') return base;
  if (/^https?:\/\//i.test(path)) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};

export const absoluteImage = (src, settings, backendUrl) => {
  if (!src) return `${getSiteUrl(settings)}/logo.png`;
  if (/^https?:\/\//i.test(src) || src.startsWith('data:')) return src;
  if (backendUrl && src.startsWith('/')) return `${backendUrl.replace(/\/$/, '')}${src}`;
  return absoluteUrl(src, settings);
};

/** Truncate meta description to a Google-friendly length */
export const clipDescription = (text, max = 155) => {
  if (!text) return '';
  const clean = String(text).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}…`;
};

export const DEFAULT_DESCRIPTION =
  'Find premium properties, land plots, and cars across Rwanda with NGENZI REALESTATE. Browse verified listings in Kigali and beyond — buy, rent, and invest with confidence.';

export const DEFAULT_KEYWORDS =
  'real estate Rwanda, property Kigali, buy house Kigali, land for sale Rwanda, plots Kigali, apartments Rwanda, villas Nyarutarama, cars for sale Kigali, NGENZI REALESTATE';
