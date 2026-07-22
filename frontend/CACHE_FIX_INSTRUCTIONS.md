# Fix CORS and Cache Issues

## Problem
The application is trying to connect to the old backend URL `http://ngenzi.guzekustomz.com` instead of the new one `https://myambi.wildjourneysrwanda.com`.

## Root Cause
Browser cache or build cache is serving the old JavaScript bundle with the old backend URL.

## Solution Steps

### 1. Stop the Development Server
Press `Ctrl+C` in the terminal where the dev server is running.

### 2. Clear Build Cache
```bash
cd frontend
# Delete the dist folder (build output)
rm -rf dist  # Linux/Mac
# OR
rmdir /s /q dist  # Windows

# Clear Vite cache
rm -rf node_modules/.vite  # Linux/Mac
# OR
rmdir /s /q node_modules\.vite  # Windows
```

### 3. Restart the Development Server
```bash
npm run dev
```

### 4. Clear Browser Cache
- **Chrome/Edge:**
  - Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
  - Select "Cached images and files"
  - Click "Clear data"
  - OR press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac) for hard refresh

- **Firefox:**
  - Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
  - Select "Cache"
  - Click "Clear Now"
  - OR press `Ctrl+F5` for hard refresh

### 5. Verify Backend URL
Open browser DevTools (F12) → Console, and type:
```javascript
// Check what Backendurl is being used
console.log('Backend URL:', window.Backendurl || 'Check App.jsx');
```

### 6. Check Network Tab
- Open DevTools → Network tab
- Reload the page
- Check the API requests - they should go to `https://myambi.wildjourneysrwanda.com`
- If you still see `http://ngenzi.guzekustomz.com`, the cache wasn't cleared properly

## Alternative: Manual Cache Clear

### For Chrome/Edge:
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

### For Firefox:
1. Open DevTools (F12)
2. Go to Network tab
3. Check "Disable cache" checkbox
4. Reload the page

## Verification

After clearing cache, verify the API calls:
1. Open DevTools → Network tab
2. Filter by "XHR" or "Fetch"
3. Look for API calls - they should all go to `https://myambi.wildjourneysrwanda.com`
4. No requests should go to `http://ngenzi.guzekustomz.com`

## If Issues Persist

1. Close all browser tabs with the application
2. Close the browser completely
3. Restart the development server
4. Open a new browser window
5. Navigate to `http://localhost:5173` (or your dev port)

## Current Backend URL Configuration

- **File:** `frontend/src/App.jsx`
- **Line 37:** `export const Backendurl = import.meta.env.VITE_API_BASE_URL || 'https://myambi.wildjourneysrwanda.com';`
- **Environment Variable:** `VITE_API_BASE_URL` (optional, for overriding)

All components should import `Backendurl` from `App.jsx`:

```javascript
import { Backendurl } from '../App.jsx';
// or
import { Backendurl } from '../App';
```

