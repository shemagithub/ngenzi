/**
 * Centralized backend URL for the public frontend.
 * Set VITE_BACKEND_URL in .env (e.g. http://localhost:4000).
 * In Vite DEV mode, defaults to local backend when unset.
 */

const PRODUCTION_API_URL = 'https://backend.ngenzirealestate.com';

const getBackendUrl = () => {
  const env = import.meta.env?.VITE_BACKEND_URL;
  if (env && String(env).trim()) {
    let url = String(env).trim();
    // Don't force https upgrade for localhost
    const isLocal =
      url.includes('localhost') ||
      url.includes('127.0.0.1') ||
      url.startsWith('http://localhost') ||
      url.startsWith('http://127.0.0.1');

    if (
      !isLocal &&
      typeof window !== 'undefined' &&
      window.location?.protocol === 'https:' &&
      url.startsWith('http://')
    ) {
      url = url.replace('http://', 'https://');
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    return url.replace(/\/$/, '');
  }

  // Default: live API (override with VITE_BACKEND_URL=http://localhost:4000 for local backend)
  return PRODUCTION_API_URL;
};

export const BACKEND_URL = getBackendUrl();
export const Backendurl = BACKEND_URL;

if (import.meta.env?.DEV) {
  console.log('🔗 Backend URL:', BACKEND_URL);
}

export default BACKEND_URL;
