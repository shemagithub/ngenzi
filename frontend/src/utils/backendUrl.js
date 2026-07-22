/**
 * Centralized backend URL for the public frontend.
 * Set VITE_BACKEND_URL in .env (e.g. http://localhost:4000 or https://api.example.com) for local/dev.
 * When unset, production API is used.
 */

const PRODUCTION_API_URL = 'https://myambi.wildjourneysrwanda.com';

const getBackendUrl = () => {
  const env = import.meta.env?.VITE_BACKEND_URL;
  if (env && String(env).trim()) {
    let url = String(env).trim();
    if (typeof window !== 'undefined' && window.location?.protocol === 'https:' && url.startsWith('http://')) {
      url = url.replace('http://', 'https://');
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    return url.replace(/\/$/, '');
  }
  return PRODUCTION_API_URL;
};

export const BACKEND_URL = getBackendUrl();
export const Backendurl = BACKEND_URL;

if (import.meta.env?.DEV) {
  console.log('🔗 Backend URL:', BACKEND_URL);
}

export default BACKEND_URL;

