// apps/marketing-site/src/services/AuthService.ts
export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'starter' | 'pro' | 'enterprise';
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export class AuthService {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'user_data';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

  /**
   * Login with email and password
   */
  static async login(email: string, password: string): Promise<AuthState> {
    try {
      // For demo purposes, simulate API call with mock data
      // In production, replace with actual API call
      if (email === 'demo@cartracker.com' && password === 'demo123') {
        const mockUser: User = {
          id: '1',
          name: 'Demo User',
          email: 'demo@cartracker.com',
          plan: 'starter',
          createdAt: new Date().toISOString()
        };
        
        const mockToken = 'demo_token_' + Date.now();
        
        this.setAuthData(mockToken, mockUser);
        
        return {
          user: mockUser,
          token: mockToken,
          isAuthenticated: true,
          isLoading: false
        };
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * Register new user
   */
  static async register(userData: {
    name: string;
    email: string;
    password: string;
    plan?: string;
  }): Promise<AuthState> {
    try {
      // For demo purposes, simulate API call with mock data
      // In production, replace with actual API call
      const mockUser: User = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        plan: (userData.plan as any) || 'starter',
        createdAt: new Date().toISOString()
      };
      
      const mockToken = 'demo_token_' + Date.now();
      
      this.setAuthData(mockToken, mockUser);
      
      return {
        user: mockUser,
        token: mockToken,
        isAuthenticated: true,
        isLoading: false
      };
    } catch (error) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      // In production, call logout API endpoint
      this.clearAuthData();
    } catch (error) {
      console.error('Logout failed:', error);
      this.clearAuthData(); // Clear data anyway
    }
  }

  /**
   * Get current auth state
   */
  static getAuthState(): AuthState {
    const token = this.getToken();
    const user = this.getUser();
    
    return {
      user,
      token,
      isAuthenticated: !!(token && user),
      isLoading: false
    };
  }

  /**
   * Validate token (placeholder for real API validation)
   */
  static async validateToken(token: string): Promise<User | null> {
    try {
      // In production, make API call to validate token
      // For demo, just check if user data exists
      const user = this.getUser();
      return user;
    } catch (error) {
      console.error('Token validation failed:', error);
      return null;
    }
  }

  // Private helper methods
  private static setAuthData(token: string, user: User, refreshToken?: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    if (refreshToken) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  private static clearAuthData() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  private static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private static getUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }
}