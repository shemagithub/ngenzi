// Configuration constants
// Auto-detect protocol based on current page protocol, or use env variable
const getBackendUrl = () => {
  let url = '';
  
  // If VITE_BACKEND_URL is set, use it (allows override)
  if (import.meta.env.VITE_BACKEND_URL) {
    url = import.meta.env.VITE_BACKEND_URL.trim();
    // If env URL is HTTP but page is HTTPS, convert to HTTPS
    if (window.location.protocol === 'https:' && url.startsWith('http://')) {
      url = url.replace('http://', 'https://');
    }
  } else if (window.location.protocol === 'https:') {
    // Auto-detect: if page is HTTPS, use HTTPS for backend
    // In production, try to determine backend URL from current domain
    const hostname = window.location.hostname;
    if (hostname.includes('ngenziadmin.guzekustomz.com')) {
      url = 'https://ngenzi.guzekustomz.com';
    } else {
      // Default to production API for HTTPS
      url = 'https://myambi.wildjourneysrwanda.com';
    }
  } else {
    // Default to production API for local development
    url = 'https://myambi.wildjourneysrwanda.com';
  }
  
  // Ensure URL always has protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  // Remove trailing slash if present
  return url.replace(/\/$/, '');
};

export const backendurl = getBackendUrl();

// API endpoints
export const API_ENDPOINTS = {
  login: '/api/users/admin',
  properties: '/api/products',
  appointments: '/api/appointments',
  users: '/api/users',
  admin: '/api/admin'
};

// App constants
export const APP_CONSTANTS = {
  TOKEN_KEY: 'token',
  IS_ADMIN_KEY: 'isAdmin',
  DEFAULT_TOAST_DURATION: 3000
};
