import { CONFIG } from './config.js';

/**
 * Cookie Handler - Backend-ready cookie management with dev mode support
 * 
 * Features:
 * - Secure cookie handling for authentication
 * - Session management
 * - CSRF protection
 * - Cookie consent management
 * - Development mode with localStorage fallback
 * - Production mode with proper HTTP-only cookies
 */

export const CookieHandler = {
  // Cookie names for consistency
  COOKIE_NAMES: {
    AUTH_TOKEN: 'auth_token',
    SESSION_ID: 'session_id',
    CSRF_TOKEN: 'csrf_token',
    USER_ID: 'user_id',
    CONSENT: 'cookie_consent',
    THEME: 'theme',
    LANGUAGE: 'lang'
  },

  // Cookie options for production
  COOKIE_OPTIONS: {
    secure: true, // HTTPS only
    httpOnly: false, // Allow JS access for SPA
    sameSite: 'strict', // CSRF protection
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  },

  /**
   * Set a cookie with proper options
   * @param {string} name - Cookie name
   * @param {string} value - Cookie value
   * @param {Object} options - Cookie options
   */
  setCookie(name, value, options = {}) {
    try {
      if (CONFIG.useBackend) {
        // Production mode - use proper cookie setting
        const cookieOptions = {
          ...this.COOKIE_OPTIONS,
          ...options
        };

        let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
        
        if (cookieOptions.path) cookieString += `; path=${cookieOptions.path}`;
        if (cookieOptions.domain) cookieString += `; domain=${cookieOptions.domain}`;
        if (cookieOptions.maxAge) cookieString += `; max-age=${cookieOptions.maxAge}`;
        if (cookieOptions.expires) cookieString += `; expires=${cookieOptions.expires.toUTCString()}`;
        if (cookieOptions.secure) cookieString += '; secure';
        if (cookieOptions.sameSite) cookieString += `; samesite=${cookieOptions.sameSite}`;

        document.cookie = cookieString;
      } else {
        // Development mode - use localStorage with cookie prefix
        const storageKey = `cookie_${name}`;
        const cookieData = {
          value,
          options,
          timestamp: Date.now()
        };
        localStorage.setItem(storageKey, JSON.stringify(cookieData));
      }
    } catch (error) {
      console.error('Error setting cookie:', error);
      throw new Error(`Failed to set cookie ${name}: ${error.message}`);
    }
  },

  /**
   * Get a cookie value
   * @param {string} name - Cookie name
   * @returns {string|null} - Cookie value or null if not found
   */
  getCookie(name) {
    try {
      if (CONFIG.useBackend) {
        // Production mode - read from document.cookie
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
          const [cookieName, cookieValue] = cookie.trim().split('=');
          if (cookieName === name) {
            return decodeURIComponent(cookieValue);
          }
        }
        return null;
      } else {
        // Development mode - read from localStorage
        const storageKey = `cookie_${name}`;
        const cookieData = localStorage.getItem(storageKey);
        if (!cookieData) return null;

        const parsed = JSON.parse(cookieData);
        
        // Check if cookie has expired
        if (parsed.options && parsed.options.maxAge) {
          const age = Date.now() - parsed.timestamp;
          if (age > parsed.options.maxAge) {
            this.deleteCookie(name);
            return null;
          }
        }

        return parsed.value;
      }
    } catch (error) {
      console.error('Error getting cookie:', error);
      return null;
    }
  },

  /**
   * Delete a cookie
   * @param {string} name - Cookie name
   */
  deleteCookie(name) {
    try {
      if (CONFIG.useBackend) {
        // Production mode - set expiration to past date
        document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      } else {
        // Development mode - remove from localStorage
        const storageKey = `cookie_${name}`;
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      console.error('Error deleting cookie:', error);
    }
  },

  /**
   * Check if a cookie exists
   * @param {string} name - Cookie name
   * @returns {boolean} - True if cookie exists
   */
  hasCookie(name) {
    return this.getCookie(name) !== null;
  },

  /**
   * Clear all cookies
   */
  clearAllCookies() {
    try {
      if (CONFIG.useBackend) {
        // Production mode - clear all cookies by setting them to expire
        const cookies = document.cookie.split(';');
        cookies.forEach(cookie => {
          const name = cookie.split('=')[0].trim();
          this.deleteCookie(name);
        });
      } else {
        // Development mode - clear all cookie-prefixed localStorage items
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('cookie_')) {
            localStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.error('Error clearing cookies:', error);
    }
  },

  // Authentication-specific methods
  /**
   * Set authentication token
   * @param {string} token - JWT or session token
   * @param {Object} options - Additional options
   */
  setAuthToken(token, options = {}) {
    const authOptions = {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours for auth tokens
      secure: true,
      sameSite: 'strict',
      ...options
    };
    this.setCookie(this.COOKIE_NAMES.AUTH_TOKEN, token, authOptions);
  },

  /**
   * Get authentication token
   * @returns {string|null} - Auth token or null
   */
  getAuthToken() {
    return this.getCookie(this.COOKIE_NAMES.AUTH_TOKEN);
  },

  /**
   * Clear authentication data
   */
  clearAuth() {
    this.deleteCookie(this.COOKIE_NAMES.AUTH_TOKEN);
    this.deleteCookie(this.COOKIE_NAMES.SESSION_ID);
    this.deleteCookie(this.COOKIE_NAMES.USER_ID);
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if authenticated
   */
  isAuthenticated() {
    return this.hasCookie(this.COOKIE_NAMES.AUTH_TOKEN);
  },

  // CSRF protection
  /**
   * Generate and set CSRF token
   * @returns {string} - Generated CSRF token
   */
  generateCSRFToken() {
    const token = this.generateRandomToken(32);
    this.setCookie(this.COOKIE_NAMES.CSRF_TOKEN, token, {
      maxAge: 60 * 60 * 1000, // 1 hour
      secure: true,
      sameSite: 'strict'
    });
    return token;
  },

  /**
   * Get CSRF token
   * @returns {string|null} - CSRF token or null
   */
  getCSRFToken() {
    return this.getCookie(this.COOKIE_NAMES.CSRF_TOKEN);
  },

  /**
   * Validate CSRF token
   * @param {string} token - Token to validate
   * @returns {boolean} - True if valid
   */
  validateCSRFToken(token) {
    const storedToken = this.getCSRFToken();
    return storedToken && storedToken === token;
  },

  // Cookie consent
  /**
   * Set cookie consent
   * @param {string} consent - 'accepted', 'rejected', or 'partial'
   */
  setCookieConsent(consent) {
    this.setCookie(this.COOKIE_NAMES.CONSENT, consent, {
      maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      secure: true
    });
  },

  /**
   * Get cookie consent status
   * @returns {string|null} - Consent status or null
   */
  getCookieConsent() {
    return this.getCookie(this.COOKIE_NAMES.CONSENT);
  },

  /**
   * Check if cookies are allowed
   * @returns {boolean} - True if cookies are allowed
   */
  isCookieConsentGiven() {
    const consent = this.getCookieConsent();
    return consent === 'accepted' || consent === 'partial';
  },

  // Utility methods
  /**
   * Generate random token
   * @param {number} length - Token length
   * @returns {string} - Random token
   */
  generateRandomToken(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Get all cookies as object
   * @returns {Object} - All cookies
   */
  getAllCookies() {
    const cookies = {};
    
    if (CONFIG.useBackend) {
      // Production mode
      const cookieString = document.cookie;
      if (!cookieString) return cookies;

      cookieString.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
          cookies[decodeURIComponent(name)] = decodeURIComponent(value);
        }
      });
    } else {
      // Development mode
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cookie_')) {
          const cookieName = key.replace('cookie_', '');
          const cookieData = localStorage.getItem(key);
          if (cookieData) {
            try {
              const parsed = JSON.parse(cookieData);
              cookies[cookieName] = parsed.value;
            } catch (e) {
              console.error('Error parsing cookie data:', e);
            }
          }
        }
      });
    }

    return cookies;
  },

  /**
   * Initialize cookie handler
   * Sets up CSRF protection and checks consent
   */
  initialize() {
    try {
      // Generate CSRF token if not exists
      if (!this.getCSRFToken()) {
        this.generateCSRFToken();
      }

      // Check cookie consent
      if (!this.isCookieConsentGiven()) {
        console.log('Cookie consent not given - some features may be limited');
      }

      console.log('Cookie handler initialized successfully');
    } catch (error) {
      console.error('Error initializing cookie handler:', error);
    }
  }
};

// Auto-initialize when module is loaded
CookieHandler.initialize();

export default CookieHandler; 