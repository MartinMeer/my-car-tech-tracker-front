import { CONFIG } from './config.js';
import { CookieHandler } from './cookieHandler.js';

/**
 * Authentication Service - Backend-ready authentication with dev mode support
 * 
 * Features:
 * - Login/logout functionality
 * - Session management
 * - Token refresh
 * - User profile management
 * - Development mode with mock authentication
 * - Production mode with backend API integration
 */

export const AuthService = {
  // Mock user data for development mode
  MOCK_USERS: [
    {
      id: 1,
      email: 'demo@example.com',
      password: 'demo123', // In real app, this would be hashed
      name: 'Demo User',
      role: 'user'
    }
  ],

  /**
   * Authenticate user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} - Authentication result
   */
  async login(email, password) {
    try {
      if (CONFIG.useBackend) {
        // Production mode - call backend API
        const response = await fetch(`${CONFIG.apiUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': CookieHandler.getCSRFToken()
          },
          credentials: 'include', // Include cookies
          body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Ошибка входа');
        }

        const data = await response.json();
        
        // Set authentication cookies
        if (data.token) {
          CookieHandler.setAuthToken(data.token);
        }
        if (data.userId) {
          CookieHandler.setCookie(CookieHandler.COOKIE_NAMES.USER_ID, data.userId);
        }
        if (data.sessionId) {
          CookieHandler.setCookie(CookieHandler.COOKIE_NAMES.SESSION_ID, data.sessionId);
        }

        return {
          success: true,
          user: data.user,
          message: 'Успешный вход'
        };
      } else {
        // Development mode - mock authentication
        const user = this.MOCK_USERS.find(u => u.email === email && u.password === password);
        
        if (!user) {
          throw new Error('Неверный email или пароль');
        }

        // Generate mock token
        const mockToken = CookieHandler.generateRandomToken(64);
        const mockSessionId = CookieHandler.generateRandomToken(32);

        // Set authentication cookies
        CookieHandler.setAuthToken(mockToken);
        CookieHandler.setCookie(CookieHandler.COOKIE_NAMES.USER_ID, user.id.toString());
        CookieHandler.setCookie(CookieHandler.COOKIE_NAMES.SESSION_ID, mockSessionId);

        // Store user data in localStorage for development
        localStorage.setItem('currentUser', JSON.stringify({
          ...user,
          token: mockToken,
          sessionId: mockSessionId
        }));

        return {
          success: true,
          user: { id: user.id, email: user.email, name: user.name, role: user.role },
          message: 'Успешный вход (demo режим)'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Ошибка входа');
    }
  },

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} - Registration result
   */
  async register(userData) {
    try {
      if (CONFIG.useBackend) {
        // Production mode - call backend API
        const response = await fetch(`${CONFIG.apiUrl}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': CookieHandler.getCSRFToken()
          },
          credentials: 'include',
          body: JSON.stringify(userData)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Ошибка регистрации');
        }

        const data = await response.json();
        return {
          success: true,
          user: data.user,
          message: 'Регистрация успешна'
        };
      } else {
        // Development mode - mock registration
        const existingUser = this.MOCK_USERS.find(u => u.email === userData.email);
        if (existingUser) {
          throw new Error('Пользователь с таким email уже существует');
        }

        const newUser = {
          id: this.MOCK_USERS.length + 1,
          email: userData.email,
          password: userData.password, // In real app, this would be hashed
          name: userData.name || userData.email,
          role: 'user'
        };

        this.MOCK_USERS.push(newUser);

        return {
          success: true,
          user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
          message: 'Регистрация успешна (demo режим)'
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Ошибка регистрации');
    }
  },

  /**
   * Logout user
   * @returns {Promise<Object>} - Logout result
   */
  async logout() {
    try {
      if (CONFIG.useBackend) {
        // Production mode - call backend API
        const response = await fetch(`${CONFIG.apiUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'X-CSRF-Token': CookieHandler.getCSRFToken(),
            'Authorization': `Bearer ${CookieHandler.getAuthToken()}`
          },
          credentials: 'include'
        });

        // Clear cookies regardless of response
        CookieHandler.clearAuth();
      } else {
        // Development mode - just clear cookies and localStorage
        CookieHandler.clearAuth();
        localStorage.removeItem('currentUser');
      }

      return {
        success: true,
        message: 'Выход выполнен успешно'
      };
    } catch (error) {
      console.error('Logout error:', error);
      // Clear cookies even if logout fails
      CookieHandler.clearAuth();
      localStorage.removeItem('currentUser');
      
      return {
        success: true,
        message: 'Выход выполнен успешно'
      };
    }
  },

  /**
   * Get current user information
   * @returns {Promise<Object|null>} - Current user or null
   */
  async getCurrentUser() {
    try {
      if (!CookieHandler.isAuthenticated()) {
        return null;
      }

      if (CONFIG.useBackend) {
        // Production mode - call backend API
        const response = await fetch(`${CONFIG.apiUrl}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${CookieHandler.getAuthToken()}`,
            'X-CSRF-Token': CookieHandler.getCSRFToken()
          },
          credentials: 'include'
        });

        if (!response.ok) {
          // Token might be invalid, clear auth
          CookieHandler.clearAuth();
          return null;
        }

        const data = await response.json();
        return data.user;
      } else {
        // Development mode - get from localStorage
        const userData = localStorage.getItem('currentUser');
        if (!userData) {
          CookieHandler.clearAuth();
          return null;
        }

        const user = JSON.parse(userData);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    } catch (error) {
      console.error('Get current user error:', error);
      CookieHandler.clearAuth();
      return null;
    }
  },

  /**
   * Refresh authentication token
   * @returns {Promise<boolean>} - True if refresh successful
   */
  async refreshToken() {
    try {
      if (CONFIG.useBackend) {
        // Production mode - call backend API
        const response = await fetch(`${CONFIG.apiUrl}/auth/refresh`, {
          method: 'POST',
          headers: {
            'X-CSRF-Token': CookieHandler.getCSRFToken()
          },
          credentials: 'include'
        });

        if (!response.ok) {
          return false;
        }

        const data = await response.json();
        if (data.token) {
          CookieHandler.setAuthToken(data.token);
          return true;
        }
      } else {
        // Development mode - generate new mock token
        const mockToken = CookieHandler.generateRandomToken(64);
        CookieHandler.setAuthToken(mockToken);
        
        // Update localStorage
        const userData = localStorage.getItem('currentUser');
        if (userData) {
          const user = JSON.parse(userData);
          user.token = mockToken;
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
        
        return true;
      }

      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} - True if authenticated
   */
  isAuthenticated() {
    return CookieHandler.isAuthenticated();
  },

  /**
   * Get authentication token
   * @returns {string|null} - Auth token or null
   */
  getAuthToken() {
    return CookieHandler.getAuthToken();
  },

  /**
   * Validate authentication token
   * @returns {Promise<boolean>} - True if token is valid
   */
  async validateToken() {
    try {
      if (!this.isAuthenticated()) {
        return false;
      }

      if (CONFIG.useBackend) {
        // Production mode - validate with backend
        const response = await fetch(`${CONFIG.apiUrl}/auth/validate`, {
          headers: {
            'Authorization': `Bearer ${CookieHandler.getAuthToken()}`,
            'X-CSRF-Token': CookieHandler.getCSRFToken()
          },
          credentials: 'include'
        });

        return response.ok;
      } else {
        // Development mode - check if token exists
        return !!CookieHandler.getAuthToken();
      }
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  },

  /**
   * Initialize authentication service
   * Checks for existing session and validates token
   */
  async initialize() {
    try {
      // Check if user is already authenticated
      if (this.isAuthenticated()) {
        // Validate existing token
        const isValid = await this.validateToken();
        if (!isValid) {
          // Token is invalid, clear authentication
          await this.logout();
        } else {
          console.log('User is authenticated');
        }
      }

      console.log('Authentication service initialized');
    } catch (error) {
      console.error('Error initializing authentication service:', error);
    }
  }
};

export default AuthService; 