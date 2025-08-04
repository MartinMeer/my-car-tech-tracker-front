// apps/marketing-site/src/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { AuthService, AuthState, User } from '../services/AuthService';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true
  });

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const currentState = AuthService.getAuthState();
      
      // If we have a token, validate it
      if (currentState.token) {
        const user = await AuthService.validateToken(currentState.token);
        if (user) {
          setAuthState({
            user,
            token: currentState.token,
            isAuthenticated: true,
            isLoading: false
          });
        } else {
          setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      } else {
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const newAuthState = await AuthService.login(email, password);
      setAuthState(newAuthState);
      return newAuthState;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const register = useCallback(async (userData: {
    name: string;
    email: string;
    password: string;
    plan?: string;
  }) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const newAuthState = await AuthService.register(userData);
      setAuthState(newAuthState);
      return newAuthState;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    await AuthService.logout();
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    });
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updates } : null
    }));
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    updateUser
  };
}