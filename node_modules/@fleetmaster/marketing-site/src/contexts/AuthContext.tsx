// apps/marketing-site/src/contexts/AuthContext.tsx
import React, { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthState, User } from '../services/AuthService';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<AuthState>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    plan?: string;
  }) => Promise<AuthState>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}