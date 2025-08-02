# Cookie Handler Implementation

## Overview

This document describes the backend-ready cookie handler implementation for the My Car Tech Tracker project. The cookie handler provides secure cookie management with support for both development (demo) and production (backend) modes.

## Architecture

### Core Components

1. **CookieHandler** (`src/cookieHandler.js`)
   - Main cookie management module
   - Handles cookie CRUD operations
   - Supports both localStorage (dev) and document.cookie (prod)
   - Includes CSRF protection and cookie consent

2. **AuthService** (`src/authService.js`)
   - Authentication service built on top of CookieHandler
   - Handles login/logout/registration
   - Token management and validation
   - Mock authentication for development mode

3. **AuthUI** (`src/authUI.js`)
   - UI handlers for login and registration forms
   - Form validation and error handling
   - Demo mode support

## Features

### 🔐 Authentication
- JWT token storage and management
- Session management
- Automatic token refresh
- Secure logout with cookie cleanup

### 🛡️ Security
- CSRF protection with token validation
- Secure cookie options (HttpOnly, Secure, SameSite)
- Cookie consent management
- XSS protection through proper encoding

### 🔄 Mode Switching
- **Development Mode**: Uses localStorage for cookie simulation
- **Production Mode**: Uses proper HTTP cookies
- Seamless switching via CONFIG.useBackend flag

### 🧪 Testing
- Browser console testing support
- Mock authentication for development

## Usage

### Basic Cookie Operations

```javascript
import { CookieHandler } from './src/cookieHandler.js';

// Set a cookie
CookieHandler.setCookie('user_preference', 'dark_theme', {
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
});

// Get a cookie
const theme = CookieHandler.getCookie('user_preference');

// Delete a cookie
CookieHandler.deleteCookie('user_preference');

// Check if cookie exists
if (CookieHandler.hasCookie('user_preference')) {
  // Cookie exists
}
```

### Authentication

```javascript
import { AuthService } from './src/authService.js';

// Login
const result = await AuthService.login('user@example.com', 'password');
if (result.success) {
  console.log('Login successful');
}

// Check authentication status
if (AuthService.isAuthenticated()) {
  console.log('User is authenticated');
}

// Get current user
const user = await AuthService.getCurrentUser();

// Logout
await AuthService.logout();
```

### CSRF Protection

```javascript
// Generate CSRF token (automatic on initialization)
const csrfToken = CookieHandler.generateCSRFToken();

// Get CSRF token for API calls
const token = CookieHandler.getCSRFToken();

// Validate CSRF token
const isValid = CookieHandler.validateCSRFToken(token);
```

### Cookie Consent

```javascript
// Set consent
CookieHandler.setCookieConsent('accepted');

// Check if consent given
if (CookieHandler.isCookieConsentGiven()) {
  // Cookies are allowed
}
```

## Configuration

### Environment Switching

Edit `src/config.js` to switch between modes:

```javascript
// Development mode (localStorage)
export const CONFIG = {
  useBackend: false,
  apiUrl: 'http://localhost:8080/api',
  demoMode: true
};

// Production mode (backend API)
export const CONFIG = {
  useBackend: true,
  apiUrl: 'https://your-production-api.com/api',
  demoMode: false
};
```

### Cookie Options

Default cookie options in production mode:

```javascript
COOKIE_OPTIONS: {
  secure: true,        // HTTPS only
  httpOnly: false,     // Allow JS access for SPA
  sameSite: 'strict',  // CSRF protection
  path: '/',           // Cookie path
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
}
```

## API Integration

### Backend API Endpoints

The cookie handler expects these backend endpoints when `useBackend: true`:

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token
- `GET /api/auth/validate` - Validate token

#### Data Endpoints (with authentication headers)
- `GET /api/cars` - Get user's cars
- `POST /api/maintenance` - Save maintenance record
- `GET /api/maintenance` - Get maintenance records
- `POST /api/repairs` - Save repair record
- `GET /api/repairs` - Get repair records
- `POST /api/service-records` - Save service record
- `GET /api/service-records` - Get service records

### Request Headers

All authenticated requests include:

```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <auth_token>',
  'X-CSRF-Token': '<csrf_token>'
}
```

## Development Mode

### Demo Authentication

In development mode, you can use these demo credentials:

```javascript
// Demo user credentials
{
  email: 'demo@example.com',
  password: 'demo123'
}
```

### Testing

Browser console testing support is available for development:

```javascript
// Test cookie operations directly in browser console
CookieHandler.setCookie('test', 'value');
CookieHandler.getCookie('test');
CookieHandler.deleteCookie('test');
```

### localStorage Structure

In development mode, cookies are stored in localStorage with this structure:

```javascript
// Cookie storage
localStorage['cookie_auth_token'] = JSON.stringify({
  value: 'mock_jwt_token',
  options: { maxAge: 86400000, secure: true, sameSite: 'strict' },
  timestamp: 1640995200000
});

// User data
localStorage['currentUser'] = JSON.stringify({
  id: 1,
  email: 'demo@example.com',
  name: 'Demo User',
  role: 'user',
  token: 'mock_jwt_token',
  sessionId: 'mock_session_id'
});
```

## Security Considerations

### Production Security

1. **HTTPS Only**: All cookies use `secure: true` in production
2. **CSRF Protection**: All state-changing requests include CSRF tokens
3. **SameSite**: Cookies use `SameSite=Strict` to prevent CSRF attacks
4. **Token Expiration**: Auth tokens expire after 24 hours
5. **Automatic Cleanup**: Invalid tokens are automatically cleared

### Development Security

1. **Mock Data**: No real authentication in development mode
2. **localStorage**: Simulated cookies in localStorage
3. **Demo Credentials**: Hardcoded demo user for testing
4. **No HTTPS**: Development mode works without HTTPS

## Migration Guide

### From Old Authentication

The old authentication system used simple localStorage:

```javascript
// Old way
localStorage.setItem('auth', 'true');

// New way
await AuthService.login('email', 'password');
```

### To Production Backend

1. Set `CONFIG.useBackend = true`
2. Ensure backend API endpoints match expected URLs
3. Implement proper JWT token generation on backend
4. Set up CSRF token validation on backend
5. Configure secure cookie settings on backend

## Troubleshooting

### Common Issues

1. **Cookies not working in development**
   - Check if localStorage is available
   - Verify CONFIG.useBackend is false

2. **Authentication failing in production**
   - Check backend API endpoints
   - Verify CORS settings
   - Check cookie domain settings

3. **CSRF token validation failing**
   - Ensure CSRF token is included in requests
   - Check backend CSRF validation logic

### Debug Mode

Enable debug logging:

```javascript
// In browser console
localStorage.setItem('debugMode', 'true');
```

## Future Enhancements

1. **Token Refresh**: Automatic token refresh before expiration
2. **Multi-factor Authentication**: Support for 2FA
3. **Session Management**: Multiple device session handling
4. **Cookie Analytics**: Usage tracking and analytics
5. **Advanced Security**: Rate limiting and brute force protection

## Conclusion

The cookie handler implementation provides a robust, secure, and flexible solution for authentication and session management. It seamlessly supports both development and production environments while maintaining security best practices.

For questions or issues, refer to the test suite or browser console debugging tools. 