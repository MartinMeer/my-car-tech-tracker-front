# GitHub Pages 404 Error Fix

## Issue Description

When deploying to GitHub Pages in demo mode, navigation functions (like `navigateToRegister()`) were causing 404 errors by trying to access `https://martinmeer.github.io/` instead of the correct path `https://martinmeer.github.io/my-car-tech-tracker-front/`.

## Root Cause

The problem was in the `NavigationService` URL construction using JavaScript's `URL` constructor:

```typescript
// ❌ WRONG - Strips base path when hash is in first parameter
const url = new URL('/#/register', 'https://martinmeer.github.io/my-car-tech-tracker-front');
// Results in: https://martinmeer.github.io/#/register

// ✅ CORRECT - Concatenate strings then create URL
let url = `${baseUrl}/#/register`;
const urlObj = new URL(url); // For adding query params if needed
```

### Why This Happens

When using `new URL(path, base)`:
- If `path` starts with `/`, it **replaces** the path from the base URL
- A hash `#` in the path makes it a fragment, which further complicates resolution
- Result: `new URL('/#/login', 'https://example.com/my-app')` → `https://example.com/#/login`

## Files Fixed

### 1. Marketing Site Navigation
**File:** `apps/marketing-site/src/services/NavigationService.ts`

**Changes:**
- `navigateToLogin()` - Fixed URL construction
- `navigateToRegister()` - Fixed URL construction  
- `navigateToAccount()` - Fixed URL construction
- `navigateToMarketing()` - Fixed URL construction

### 2. Main App Navigation
**File:** `apps/main-app/src/services/NavigationService.ts`

**Changes:**
- `navigateToLogin()` - Fixed URL construction
- `navigateToMarketing()` - Fixed URL construction

### 3. Configuration Comments
**Files:** 
- `apps/marketing-site/src/config/app.config.js`
- `apps/main-app/src/config/app.config.js`

**Changes:**
- Added clear comments explaining demo mode configuration
- Clarified that the placeholder API URL enables localStorage/demo mode

## How Demo Mode Works

The app is configured to run in **demo mode** (without backend) when deployed to GitHub Pages:

1. **API URL Check:** The `ConfigService.shouldUseBackend()` checks if API_URL contains `'your-api-domain.com'` or `'localhost'`
2. **Demo Detection:** If it finds these placeholders, it returns `false` → uses localStorage
3. **No Backend Needed:** All data is stored in browser localStorage, perfect for demos

### To Enable Real Backend

If you want to connect to a real backend API in production:

1. Update the API_URL in config files:
```javascript
production: {
  MARKETING_URL: 'https://martinmeer.github.io/my-car-tech-tracker-front',
  MAIN_APP_URL: 'https://martinmeer.github.io/my-car-tech-tracker-front/app',
  API_URL: 'https://your-actual-backend-api.com/api' // Your real backend
}
```

2. Deploy your backend and ensure CORS is configured
3. Rebuild and redeploy both apps

## Testing the Fix

After deploying the fixed version:

1. **Navigate to marketing site:** `https://martinmeer.github.io/my-car-tech-tracker-front/`
2. **Click "Register" or "Login"** - Should navigate correctly
3. **Register a new user** - Should work with localStorage
4. **Navigate to main app** - Should redirect correctly to `/app`

## Deployment

To deploy the fix:

```bash
# Build both apps
npm run build

# Or deploy via GitHub Actions (automatically triggered on push to main)
git add .
git commit -m "Fix navigation URL construction for GitHub Pages deployment"
git push origin main
```

The GitHub Actions workflow will automatically:
1. Build both apps with `NODE_ENV=production`
2. Deploy marketing site to root
3. Deploy main app to `/app` subdirectory
4. Create `.nojekyll` file to prevent Jekyll processing

## Verification Checklist

After deployment, verify:
- [ ] Marketing site loads at root URL
- [ ] Main app loads at `/app` URL
- [ ] Navigation between pages works without 404 errors
- [ ] Registration works (saves to localStorage)
- [ ] Login works (uses localStorage)
- [ ] Data persists across page reloads
- [ ] Browser console shows no 404 errors
- [ ] ConfigService debug info shows `Using Backend: false`

## Debug Tips

If issues persist:

1. **Check browser console:**
```javascript
// In browser console
ConfigService.logDebugInfo();
// Should show: Using Backend: false
```

2. **Check localStorage:**
```javascript
// In browser console
console.log(localStorage.getItem('auth_token'));
console.log(localStorage.getItem('user_data'));
```

3. **Check GitHub Actions:**
   - Go to repository → Actions tab
   - Verify "Deploy to GitHub Pages" workflow succeeded
   - Check build logs for errors

4. **Check GitHub Pages settings:**
   - Repository → Settings → Pages
   - Source should be: **GitHub Actions** (not "Deploy from a branch")

## Additional Notes

- Both apps run independently in demo mode
- No backend server required for GitHub Pages deployment
- Perfect for demonstrations, prototypes, or portfolio showcases
- When ready for production, simply update the API_URL and deploy a backend

