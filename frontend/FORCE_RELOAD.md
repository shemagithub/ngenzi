# FORCE RELOAD - Critical Instructions

## The Issue
Even though the code is correct, the browser is still using cached JavaScript with the old URL `http://ngenzi.guzekustomz.com`.

## IMMEDIATE SOLUTION - Follow These Steps:

### Step 1: Stop the Dev Server
Press `Ctrl+C` in the terminal to stop the running dev server.

### Step 2: Clear ALL Caches
```powershell
# From the frontend directory
cd frontend

# Clear Vite cache
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue

# Clear dist folder
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# Clear npm cache (optional but recommended)
npm cache clean --force
```

### Step 3: Close ALL Browser Windows
**IMPORTANT**: Close ALL browser windows completely (not just the tab, close the entire browser application).

### Step 4: Restart Dev Server
```powershell
cd frontend
npm run dev
```

### Step 5: Open Browser in Incognito/Private Mode
- **Chrome/Edge**: Press `Ctrl+Shift+N`
- **Firefox**: Press `Ctrl+Shift+P`

This ensures no cached data is used.

### Step 6: Navigate to the Application
Open `http://localhost:5173` in the incognito window.

### Step 7: Verify Backend URL
1. Open DevTools (F12)
2. Go to Console tab
3. Look for: `🔗 Backend URL configured: https://myambi.wildjourneysrwanda.com`
4. If you see `http://ngenzi.guzekustomz.com`, the cache wasn't cleared properly

### Step 8: Check Network Tab
1. Open DevTools → Network tab
2. Reload the page (Ctrl+R)
3. Look at API requests - they should all go to `https://myambi.wildjourneysrwanda.com`
4. **NO requests should go to `http://ngenzi.guzekustomz.com`**

## If Still Not Working:

### Nuclear Option - Full Reset:

1. **Stop dev server** (`Ctrl+C`)

2. **Delete all cache and build folders:**
   ```powershell
   cd frontend
   Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
   Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
   Remove-Item -Recurse -Force .vite -ErrorAction SilentlyContinue
   ```

3. **Clear browser data completely:**
   - Chrome: Settings → Privacy and Security → Clear browsing data
   - Select "All time"
   - Check "Cached images and files" and "Cookies and other site data"
   - Click "Clear data"

4. **Close browser completely**

5. **Restart dev server:**
   ```powershell
   npm run dev
   ```

6. **Open new browser window** (not incognito, fresh session)

7. **Navigate to:** `http://localhost:5173`

## Verification Checklist:

- [ ] Dev server restarted with `npm run dev`
- [ ] Browser completely closed and reopened
- [ ] Console shows: `🔗 Backend URL configured: https://myambi.wildjourneysrwanda.com`
- [ ] Network tab shows requests to `https://myambi.wildjourneysrwanda.com`
- [ ] NO requests to `http://ngenzi.guzekustomz.com`

## Why This Happens:

Vite bundles JavaScript and the browser caches it. Even though the source code is correct, the browser is loading an old cached bundle that still references the old URL. This is why you need to:
1. Clear Vite's cache
2. Clear browser cache
3. Restart the dev server
4. Use a fresh browser session

---

**Current Backend URL in code:** `https://myambi.wildjourneysrwanda.com` ✅  
**Old cached URL:** `http://ngenzi.guzekustomz.com` ❌ (needs to be cleared)

