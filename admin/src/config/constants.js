// Configuration constants
// Default / prod: https://backend.ngenzirealestate.com
// Local backend only: VITE_BACKEND_URL=http://localhost:4000
const PRODUCTION_API_URL = 'https://backend.ngenzirealestate.com';

const getBackendUrl = () => {
  let url = '';

  if (import.meta.env.VITE_BACKEND_URL) {
    url = import.meta.env.VITE_BACKEND_URL.trim();
    const isLocal = url.includes('localhost') || url.includes('127.0.0.1');
    if (!isLocal && window.location.protocol === 'https:' && url.startsWith('http://')) {
      url = url.replace('http://', 'https://');
    }
  } else {
    url = PRODUCTION_API_URL;
  }

  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  return url.replace(/\/$/, '');
};

export const backendurl = getBackendUrl();

export const API_ENDPOINTS = {
  login: '/api/users/admin',
  properties: '/api/products',
  appointments: '/api/appointments',
  users: '/api/users',
  admin: '/api/admin'
};

export const APP_CONSTANTS = {
  TOKEN_KEY: 'token',
  IS_ADMIN_KEY: 'isAdmin',
  DEFAULT_TOAST_DURATION: 3000
};
