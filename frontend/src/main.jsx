import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Suppress browser extension errors (content.js, browser is not defined, etc.)
// These errors come from browser extensions, not the application code
if (import.meta.env.DEV) {
  const originalError = console.error;
  console.error = (...args) => {
    // Filter out browser extension errors
    const errorMessage = args.join(' ');
    if (
      errorMessage.includes('content.js') ||
      errorMessage.includes('browser is not defined') ||
      errorMessage.includes('chrome-extension://') ||
      errorMessage.includes('moz-extension://') ||
      errorMessage.includes('Download the React DevTools')
    ) {
      // Silently ignore browser extension errors
      return;
    }
    // Log all other errors normally
    originalError.apply(console, args);
  };

  // Also suppress unhandled errors from extensions
  window.addEventListener('error', (event) => {
    if (
      event.filename?.includes('content.js') ||
      event.filename?.includes('chrome-extension://') ||
      event.filename?.includes('moz-extension://') ||
      event.message?.includes('browser is not defined')
    ) {
      event.preventDefault();
      return false;
    }
  }, true);

  // Suppress unhandled promise rejections from extensions
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason?.toString() || '';
    if (
      reason.includes('content.js') ||
      reason.includes('browser is not defined') ||
      reason.includes('chrome-extension://') ||
      reason.includes('moz-extension://')
    ) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
