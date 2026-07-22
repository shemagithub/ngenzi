# Dark Mode Implementation Guide

## ✅ Completed

1. **ThemeContext Created** (`frontend/src/context/ThemeContext.jsx`)
   - Manages theme state (light/dark)
   - Persists to localStorage
   - Detects system preference
   - Applies theme to document root

2. **ThemeProvider Added to App.jsx**
   - Wraps entire application
   - Provides theme context to all components

3. **Navbar Updated**
   - Desktop: Theme toggle button (Sun/Moon icon)
   - Mobile: Theme toggle button in mobile menu
   - Dark mode classes applied to navbar components

4. **App.jsx Wrapper**
   - Added dark mode background classes to main wrapper
   - `bg-white dark:bg-gray-900`
   - `text-gray-900 dark:text-gray-100`

5. **Pages Updated**
   - Home.jsx - Dark mode background
   - Aiagent.jsx - Full dark mode support

## 🎨 Dark Mode Classes Pattern

Use these Tailwind classes for consistent dark mode styling:

### Backgrounds
- `bg-white dark:bg-gray-900` - Main backgrounds
- `bg-gray-50 dark:bg-gray-800` - Secondary backgrounds
- `bg-gray-100 dark:bg-gray-700` - Tertiary backgrounds

### Text
- `text-gray-900 dark:text-gray-100` - Primary text
- `text-gray-800 dark:text-gray-200` - Secondary text
- `text-gray-600 dark:text-gray-400` - Tertiary text
- `text-gray-500 dark:text-gray-500` - Muted text

### Borders
- `border-gray-200 dark:border-gray-700` - Standard borders
- `border-gray-300 dark:border-gray-600` - Stronger borders

### Cards/Components
- `bg-white dark:bg-gray-800` - Cards, modals, dropdowns
- `shadow-md dark:shadow-lg` - Shadows (optional)

### Buttons
- `bg-blue-600 dark:bg-blue-500` - Primary buttons
- `hover:bg-blue-700 dark:hover:bg-blue-600` - Hover states

### Alerts/Messages
- `bg-red-50 dark:bg-red-900/20` - Error backgrounds
- `text-red-700 dark:text-red-400` - Error text
- `bg-yellow-50 dark:bg-yellow-900/20` - Warning backgrounds
- `text-yellow-700 dark:text-yellow-400` - Warning text

## 📋 Remaining Pages to Update

### High Priority
- [ ] `frontend/src/pages/Properties.jsx`
- [ ] `frontend/src/pages/Plots.jsx`
- [ ] `frontend/src/pages/About.jsx`
- [ ] `frontend/src/pages/Contact.jsx`
- [ ] `frontend/src/pages/Services.jsx`
- [ ] `frontend/src/pages/MyProfile.jsx`
- [ ] `frontend/src/pages/SavedProperties.jsx`
- [ ] `frontend/src/pages/Settings.jsx`
- [ ] `frontend/src/pages/Notifications.jsx`
- [ ] `frontend/src/pages/BlogDetail.jsx`
- [ ] `frontend/src/pages/MapSearch.jsx`

### Components
- [ ] `frontend/src/components/footer.jsx`
- [ ] `frontend/src/components/Hero.jsx`
- [ ] `frontend/src/components/Features.jsx`
- [ ] `frontend/src/components/propertiesshow.jsx`
- [ ] `frontend/src/components/Steps.jsx`
- [ ] `frontend/src/components/testimonial.jsx`
- [ ] `frontend/src/components/Blog.jsx`
- [ ] `frontend/src/components/properties/Propertycard.jsx`
- [ ] `frontend/src/components/properties/propertydetail.jsx`
- [ ] `frontend/src/components/login.jsx`
- [ ] `frontend/src/components/signup.jsx`

## 🔧 Quick Update Pattern

When updating a component/page, replace:
- `bg-white` → `bg-white dark:bg-gray-800`
- `bg-gray-50` → `bg-gray-50 dark:bg-gray-900`
- `text-gray-900` → `text-gray-900 dark:text-gray-100`
- `text-gray-800` → `text-gray-800 dark:text-gray-200`
- `text-gray-600` → `text-gray-600 dark:text-gray-400`
- `border-gray-200` → `border-gray-200 dark:border-gray-700`

## 🚀 Usage

The theme toggle is available in:
- **Desktop**: Navbar (next to currency selector)
- **Mobile**: Mobile menu (between currency and auth sections)

Theme preference is:
- Saved to localStorage
- Persists across page reloads
- Respects system preference on first visit

## 💡 Tips

1. Always add `transition-colors duration-200` for smooth theme transitions
2. Use `/20` or `/30` opacity for dark mode backgrounds when needed (e.g., `bg-red-900/20`)
3. Test both themes to ensure readability
4. Icons should have dark mode variants when needed (e.g., `text-blue-600 dark:text-blue-400`)


