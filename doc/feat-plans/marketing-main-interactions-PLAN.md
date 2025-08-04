
# 🚀 **Comprehensive Integration Plans**

## **GOALS**

1. Setting up navigation between the two apps
2. Implementing authentication state sharing
3. Planning the user flow integration

```plaintext
   Landing Page → Register/Login → Main App
```

```plaintext
User Journey:
1. Discover → marketing-site (landing)
2. Sign up → marketing-site (register)  
3. Log in → marketing-site (login)
4. Use app → FleetMasterProMain-v00 (fleet management)
5. Manage account → marketing-site (profile)
```

## 📍 **Plan 1: Setting up Navigation Between the Two Apps**

### **Step 1: Environment Configuration & URL Structure**

```javascript
// apps/marketing-site/src/config/app.config.js
export const APP_CONFIG = {
  ENVIRONMENTS: {
    development: {
      MARKETING_URL: 'http://localhost:3000',
      MAIN_APP_URL: 'http://localhost:3001',
      API_URL: 'http://localhost:8080/api'
    },
    staging: {
      MARKETING_URL: 'https://staging-marketing.cartracker.com',
      MAIN_APP_URL: 'https://staging-app.cartracker.com',  
      API_URL: 'https://staging-api.cartracker.com'
    },
    production: {
      MARKETING_URL: 'https://cartracker.com',
      MAIN_APP_URL: 'https://app.cartracker.com',
      API_URL: 'https://api.cartracker.com'
    }
  },
  
  getCurrentConfig() {
    const env = process.env.NODE_ENV || 'development';
    return this.ENVIRONMENTS[env];
  }
};
```

### **Step 2: Cross-App Navigation Service**

```typescript
// apps/marketing-site/src/services/NavigationService.ts
import { APP_CONFIG } from '../config/app.config';

export class NavigationService {
  private static config = APP_CONFIG.getCurrentConfig();

  /**
   * Navigate to main app with authentication token
   */
  static navigateToMainApp(token?: string, redirectPath: string = '/') {
    const url = new URL(this.config.MAIN_APP_URL);
    
    if (token) {
      // Pass token via URL parameter (will be consumed and cleared)
      url.searchParams.set('auth_token', token);
    }
    
    if (redirectPath !== '/') {
      url.searchParams.set('redirect', redirectPath);
    }
    
    window.location.href = url.toString();
  }

  /**
   * Navigate back to marketing site
   */
  static navigateToMarketing(page: string = '/') {
    const url = new URL(page, this.config.MARKETING_URL);
    window.location.href = url.toString();
  }

  /**
   * Navigate to specific marketing pages
   */
  static navigateToLogin(returnUrl?: string) {
    const url = new URL('/login', this.config.MARKETING_URL);
    if (returnUrl) {
      url.searchParams.set('return_url', returnUrl);
    }
    window.location.href = url.toString();
  }

  static navigateToRegister(plan?: 'starter' | 'pro' | 'enterprise') {
    const url = new URL('/register', this.config.MARKETING_URL);
    if (plan) {
      url.searchParams.set('plan', plan);
    }
    window.location.href = url.toString();
  }

  static navigateToAccount() {
    const url = new URL('/account', this.config.MARKETING_URL);
    window.location.href = url.toString();
  }
}
```

### **Step 3: Update Marketing Site Navigation**

```tsx
// apps/marketing-site/src/components/AppNavigation.tsx
import React from 'react';
import { Button } from './ui/button';
import { NavigationService } from '../services/NavigationService';
import { useAuth } from '../hooks/useAuth';

export function AppNavigation() {
  const { user, isAuthenticated } = useAuth();

  const handleLaunchApp = () => {
    if (isAuthenticated) {
      NavigationService.navigateToMainApp();
    } else {
      NavigationService.navigateToLogin(
        window.location.pathname + window.location.search
      );
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {isAuthenticated ? (
        <>
          <span className="text-sm text-muted-foreground">
            Привет, {user?.name}
          </span>
          <Button onClick={handleLaunchApp} className="bg-primary">
            🚗 Запустить приложение
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => NavigationService.navigateToAccount()}
          >
            Аккаунт
          </Button>
        </>
      ) : (
        <>
          <Button 
            variant="ghost" 
            onClick={() => NavigationService.navigateToLogin()}
          >
            Войти
          </Button>
          <Button onClick={() => NavigationService.navigateToRegister()}>
            Начать бесплатно
          </Button>
        </>
      )}
    </div>
  );
}
```

### **Step 4: Main App Entry Point Handler**

```tsx
// apps/main-app/FleetMasterProMain-v00/src/components/AuthHandler.tsx
import React, { useEffect, useState } from 'react';
import { NavigationService } from '../services/NavigationService';

export function AuthHandler({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const handleAuthFromURL = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authToken = urlParams.get('auth_token');
      const redirectPath = urlParams.get('redirect');

      if (authToken) {
        // Store token in localStorage/sessionStorage
        localStorage.setItem('auth_token', authToken);
        
        // Clean URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('auth_token');
        newUrl.searchParams.delete('redirect');
        window.history.replaceState({}, '', newUrl.toString());

        // Redirect if needed
        if (redirectPath && redirectPath !== '/') {
          window.location.hash = redirectPath;
        }
      }

      // Check if user is authenticated
      const token = localStorage.getItem('auth_token');
      if (!token) {
        // Redirect to marketing site login
        NavigationService.navigateToLogin(window.location.pathname);
        return;
      }

      setIsInitialized(true);
    };

    handleAuthFromURL();
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
```

### **Step 5: Update Main App Root**

```tsx
// apps/main-app/FleetMasterProMain-v00/src/App.tsx
import { HashRouter, Route, Routes } from 'react-router'
import { AuthHandler } from './components/AuthHandler'
import HomePage from './pages/Home'
// ... other imports

export default function App() {
  return (
    <AuthHandler>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/car/:id" element={<CarOverview />} />
          {/* ... other routes */}
        </Routes>
      </HashRouter>
    </AuthHandler>
  )
}
```

---

## 🔐 **Plan 2: Implementing Authentication State Sharing**

### **Step 1: Shared Authentication Service**

```typescript
// shared/auth/AuthService.ts (can be in packages/shared or duplicated)
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
      // Call your authentication API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      
      // Store tokens and user data
      this.setAuthData(data.token, data.user, data.refreshToken);
      
      return {
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false
      };
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      this.setAuthData(data.token, data.user, data.refreshToken);
      
      return {
        user: data.user,
        token: data.token,
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
      const token = this.getToken();
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      this.clearAuthData();
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
   * Refresh authentication token
   */
  static async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      if (!refreshToken) return null;

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        this.clearAuthData();
        return null;
      }

      const data = await response.json();
      localStorage.setItem(this.TOKEN_KEY, data.token);
      
      return data.token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearAuthData();
      return null;
    }
  }

  /**
   * Validate token and get user info
   */
  static async validateToken(token: string): Promise<User | null> {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) return null;

      const user = await response.json();
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
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
```

### **Step 2: React Auth Hook**

```typescript
// shared/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { AuthService, AuthState, User } from '../auth/AuthService';

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
          // Token is invalid, try to refresh
          const newToken = await AuthService.refreshToken();
          if (newToken) {
            const refreshedUser = await AuthService.validateToken(newToken);
            setAuthState({
              user: refreshedUser,
              token: newToken,
              isAuthenticated: !!refreshedUser,
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
```

### **Step 3: Auth Context Provider**

```tsx
// shared/contexts/AuthContext.tsx
import React, { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthState, User } from '../auth/AuthService';

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
```

### **Step 4: Implement in Both Apps**

```tsx
// apps/marketing-site/src/App.tsx
import { AuthProvider } from '../shared/contexts/AuthContext';
import { HashRouter, Route, Routes } from 'react-router';
// ... other imports

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/account" element={<UserAccountPage />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
```

```tsx
// apps/main-app/FleetMasterProMain-v00/src/App.tsx
import { AuthProvider } from '../shared/contexts/AuthContext';
import { AuthGuard } from './components/AuthGuard';
// ... other imports

export default function App() {
  return (
    <AuthProvider>
      <AuthGuard>
        <HashRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* ... other routes */}
          </Routes>
        </HashRouter>
      </AuthGuard>
    </AuthProvider>
  );
}
```

---

## 🌊 **Plan 3: Planning the User Flow Integration**

### **Step 1: User Journey Mapping**

```typescript
// shared/types/UserFlow.ts
export type UserFlowStep = 
  | 'landing'           // First visit to marketing site
  | 'pricing'           // Viewing pricing plans
  | 'register'          // Creating account
  | 'email_verification' // Confirming email
  | 'onboarding'        // First-time setup
  | 'app_entry'         // Entering main app
  | 'first_car'         // Adding first vehicle
  | 'complete';         // Full onboarding done

export interface UserFlowState {
  currentStep: UserFlowStep;
  completedSteps: UserFlowStep[];
  selectedPlan?: 'starter' | 'pro' | 'enterprise';
  onboardingData?: {
    hasSeenWelcome: boolean;
    hasAddedCar: boolean;
    hasViewedDashboard: boolean;
    hasCreatedAlert: boolean;
  };
}

export class UserFlowManager {
  private static readonly FLOW_KEY = 'user_flow_state';

  static getFlowState(): UserFlowState {
    const saved = localStorage.getItem(this.FLOW_KEY);
    return saved ? JSON.parse(saved) : {
      currentStep: 'landing',
      completedSteps: [],
      onboardingData: {
        hasSeenWelcome: false,
        hasAddedCar: false,
        hasViewedDashboard: false,
        hasCreatedAlert: false
      }
    };
  }

  static updateFlowState(updates: Partial<UserFlowState>) {
    const current = this.getFlowState();
    const updated = { ...current, ...updates };
    localStorage.setItem(this.FLOW_KEY, JSON.stringify(updated));
    return updated;
  }

  static completeStep(step: UserFlowStep) {
    const current = this.getFlowState();
    const completedSteps = [...current.completedSteps];
    if (!completedSteps.includes(step)) {
      completedSteps.push(step);
    }
    return this.updateFlowState({
      completedSteps,
      currentStep: this.getNextStep(step)
    });
  }

  private static getNextStep(currentStep: UserFlowStep): UserFlowStep {
    const flowSequence: UserFlowStep[] = [
      'landing',
      'pricing', 
      'register',
      'email_verification',
      'onboarding',
      'app_entry',
      'first_car',
      'complete'
    ];
    
    const currentIndex = flowSequence.indexOf(currentStep);
    return flowSequence[currentIndex + 1] || 'complete';
  }
}
```

### **Step 2: Onboarding Flow Components**

```tsx
// apps/marketing-site/src/components/onboarding/OnboardingFlow.tsx
import React, { useState, useEffect } from 'react';
import { UserFlowManager, UserFlowStep } from '../../../shared/types/UserFlow';
import { WelcomeStep } from './steps/WelcomeStep';
import { PlanSelectionStep } from './steps/PlanSelectionStep';
import { EmailVerificationStep } from './steps/EmailVerificationStep';

export function OnboardingFlow() {
  const [flowState, setFlowState] = useState(UserFlowManager.getFlowState());

  const handleStepComplete = (step: UserFlowStep, data?: any) => {
    const updated = UserFlowManager.completeStep(step);
    setFlowState(updated);
    
    // Handle step-specific logic
    if (step === 'register' && data?.plan) {
      UserFlowManager.updateFlowState({ selectedPlan: data.plan });
    }
  };

  const renderCurrentStep = () => {
    switch (flowState.currentStep) {
      case 'landing':
        return <WelcomeStep onComplete={() => handleStepComplete('landing')} />;
      
      case 'pricing':
        return (
          <PlanSelectionStep 
            onComplete={(plan) => handleStepComplete('pricing', { plan })} 
          />
        );
      
      case 'email_verification':
        return (
          <EmailVerificationStep 
            onComplete={() => handleStepComplete('email_verification')} 
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      {renderCurrentStep()}
    </div>
  );
}
```

### **Step 3: Main App Onboarding**

```tsx
// apps/main-app/FleetMasterProMain-v00/src/components/onboarding/AppOnboarding.tsx
import React, { useState, useEffect } from 'react';
import { UserFlowManager } from '../../../shared/types/UserFlow';
import { useAuthContext } from '../../../shared/contexts/AuthContext';
import { NavigationService } from '../services/NavigationService';

export function AppOnboarding({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthContext();
  const [flowState, setFlowState] = useState(UserFlowManager.getFlowState());
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const flow = UserFlowManager.getFlowState();
      
      // Check if user needs onboarding
      if (flow.currentStep === 'app_entry' || !flow.onboardingData?.hasSeenWelcome) {
        setShowOnboarding(true);
      }
    }
  }, [isAuthenticated, user]);

  const handleOnboardingComplete = () => {
    UserFlowManager.updateFlowState({
      currentStep: 'complete',
      onboardingData: {
        ...flowState.onboardingData,
        hasSeenWelcome: true
      }
    });
    setShowOnboarding(false);
  };

  const handleAddFirstCar = () => {
    UserFlowManager.updateFlowState({
      onboardingData: {
        ...flowState.onboardingData,
        hasAddedCar: true
      }
    });
  };

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50">
        <OnboardingWelcome 
          user={user}
          onComplete={handleOnboardingComplete}
          onAddCar={handleAddFirstCar}
        />
      </div>
    );
  }

  return <>{children}</>;
}

function OnboardingWelcome({ 
  user, 
  onComplete, 
  onAddCar 
}: {
  user: any;
  onComplete: () => void;
  onAddCar: () => void;
}) {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Добро пожаловать, {user?.name}! 🎉
        </h1>
        <p className="text-xl text-gray-600">
          Давайте настроим ваш первый автомобиль
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <OnboardingStep
          number={1}
          title="Добавьте автомобиль"
          description="Создайте профиль вашего первого автомобиля"
          action={
            <Button onClick={onAddCar} className="w-full">
              Добавить автомобиль
            </Button>
          }
        />
        
        <OnboardingStep
          number={2}
          title="Настройте уведомления"
          description="Получайте напоминания о техобслуживании"
        />
        
        <OnboardingStep
          number={3}
          title="Изучите возможности"
          description="Откройте для себя все функции приложения"
        />
      </div>

      <div className="text-center">
        <Button variant="outline" onClick={onComplete}>
          Пропустить настройку
        </Button>
      </div>
    </div>
  );
}
```

### **Step 4: Cross-App Flow Coordination**

```tsx
// shared/services/FlowCoordinator.ts
import { UserFlowManager, UserFlowStep } from '../types/UserFlow';
import { NavigationService } from './NavigationService';

export class FlowCoordinator {
  /**
   * Handle user registration completion
   */
  static async handleRegistrationSuccess(userData: any) {
    UserFlowManager.completeStep('register');
    
    // If email verification is required
    if (!userData.emailVerified) {
      UserFlowManager.updateFlowState({ currentStep: 'email_verification' });
      return;
    }
    
    // Direct to app onboarding
    this.navigateToAppOnboarding(userData.token);
  }

  /**
   * Handle login success
   */
  static async handleLoginSuccess(userData: any) {
    const flowState = UserFlowManager.getFlowState();
    
    // If user hasn't completed onboarding, continue where they left off
    if (flowState.currentStep !== 'complete') {
      this.navigateToAppOnboarding(userData.token);
    } else {
      // Regular app entry
      NavigationService.navigateToMainApp(userData.token);
    }
  }

  /**
   * Navigate to app with onboarding flag
   */
  private static navigateToAppOnboarding(token: string) {
    NavigationService.navigateToMainApp(token, '/?onboarding=true');
  }

  /**
   * Handle plan upgrade flow
   */
  static handlePlanUpgrade(newPlan: 'pro' | 'enterprise') {
    UserFlowManager.updateFlowState({ selectedPlan: newPlan });
    NavigationService.navigateToMarketing('/account?upgrade=success');
  }

  /**
   * Handle feature gating
   */
  static checkFeatureAccess(feature: string, userPlan: string): boolean {
    const featureMatrix = {
      'advanced-analytics': ['pro', 'enterprise'],
      'multi-driver': ['pro', 'enterprise'],
      'api-access': ['enterprise'],
      'custom-branding': ['enterprise']
    };

    return featureMatrix[feature]?.includes(userPlan) ?? true;
  }

  /**
   * Handle feature upgrade prompts
   */
  static promptFeatureUpgrade(feature: string) {
    const upgradeUrl = `/register?upgrade=${feature}&current_plan=starter`;
    NavigationService.navigateToMarketing(upgradeUrl);
  }
}
```

### **Step 5: User Flow Analytics & Tracking**

```typescript
// shared/analytics/FlowAnalytics.ts
export class FlowAnalytics {
  /**
   * Track user flow progression
   */
  static trackFlowStep(step: UserFlowStep, metadata?: any) {
    // Analytics implementation (Google Analytics, Mixpanel, etc.)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'user_flow_step', {
        step_name: step,
        ...metadata
      });
    }
    
    // Also store for internal analytics
    this.storeFlowEvent({
      step,
      timestamp: new Date().toISOString(),
      metadata
    });
  }

  /**
   * Track conversion funnel
   */
  static trackConversion(from: UserFlowStep, to: UserFlowStep, duration?: number) {
    this.trackFlowStep('conversion', {
      from_step: from,
      to_step: to,
      duration_ms: duration
    });
  }

  /**
   * Track user drop-off points
   */
  static trackDropOff(step: UserFlowStep, reason?: string) {
    this.trackFlowStep('drop_off', {
      step_name: step,
      reason
    });
  }

  private static storeFlowEvent(event: any) {
    const events = JSON.parse(localStorage.getItem('flow_events') || '[]');
    events.push(event);
    
    // Keep only last 100 events
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }
    
    localStorage.setItem('flow_events', JSON.stringify(events));
  }
}
```

### **Step 6: Implementation Checklist**

```markdown
## 🚀 Implementation Checklist

### Phase 1: Basic Navigation
- [ ] Set up environment configuration
- [ ] Implement NavigationService in both apps
- [ ] Update marketing site navigation components
- [ ] Add AuthHandler to main app
- [ ] Test cross-app navigation

### Phase 2: Authentication Integration  
- [ ] Implement shared AuthService
- [ ] Create useAuth hook
- [ ] Set up AuthContext in both apps
- [ ] Add token validation and refresh
- [ ] Test authentication flow

### Phase 3: User Flow Management
- [ ] Implement UserFlowManager
- [ ] Create onboarding components
- [ ] Set up FlowCoordinator
- [ ] Add analytics tracking
- [ ] Test complete user journey

### Phase 4: Testing & Optimization
- [ ] End-to-end testing of user flows
- [ ] Performance optimization
- [ ] Error handling and edge cases
- [ ] Analytics validation
- [ ] Security audit

### Phase 5: Deployment
- [ ] Environment-specific configuration
- [ ] CORS setup for cross-origin requests
- [ ] SSL certificates for both domains
- [ ] CDN configuration
- [ ] Monitoring and alerting
```

This comprehensive plan provides a seamless, professional user experience that maintains the separation of concerns while ensuring smooth transitions between your marketing site and main application! 🎉

```javascript
// apps/marketing-site/src/config/app.config.js
export const APP_CONFIG = {
  ENVIRONMENTS: {
    development: {
      MARKETING_URL: 'http://localhost:3000',
      MAIN_APP_URL: 'http://localhost:3001',
      API_URL: 'http://localhost:8080/api'
    },
    staging: {
      MARKETING_URL: 'https://staging-marketing.cartracker.com',
      MAIN_APP_URL: 'https://staging-app.cartracker.com',  
      API_URL: 'https://staging-api.cartracker.com'
    },
    production: {
      MARKETING_URL: 'https://cartracker.com',
      MAIN_APP_URL: 'https://app.cartracker.com',
      API_URL: 'https://api.cartracker.com'
    }
  },
  
  getCurrentConfig() {
    const env = process.env.NODE_ENV || 'development';
    return this.ENVIRONMENTS[env];
  }
};
```

```typescript
// apps/marketing-site/src/services/NavigationService.ts
import { APP_CONFIG } from '../config/app.config';

export class NavigationService {
  private static config = APP_CONFIG.getCurrentConfig();

  /**
   * Navigate to main app with authentication token
   */
  static navigateToMainApp(token?: string, redirectPath: string = '/') {
    const url = new URL(this.config.MAIN_APP_URL);
    
    if (token) {
      // Pass token via URL parameter (will be consumed and cleared)
      url.searchParams.set('auth_token', token);
    }
    
    if (redirectPath !== '/') {
      url.searchParams.set('redirect', redirectPath);
    }
    
    window.location.href = url.toString();
  }

  /**
   * Navigate back to marketing site
   */
  static navigateToMarketing(page: string = '/') {
    const url = new URL(page, this.config.MARKETING_URL);
    window.location.href = url.toString();
  }

  /**
   * Navigate to specific marketing pages
   */
  static navigateToLogin(returnUrl?: string) {
    const url = new URL('/login', this.config.MARKETING_URL);
    if (returnUrl) {
      url.searchParams.set('return_url', returnUrl);
    }
    window.location.href = url.toString();
  }

  static navigateToRegister(plan?: 'starter' | 'pro' | 'enterprise') {
    const url = new URL('/register', this.config.MARKETING_URL);
    if (plan) {
      url.searchParams.set('plan', plan);
    }
    window.location.href = url.toString();
  }

  static navigateToAccount() {
    const url = new URL('/account', this.config.MARKETING_URL);
    window.location.href = url.toString();
  }
}
```

```typescriptreact
// apps/marketing-site/src/components/AppNavigation.tsx
import React from 'react';
import { Button } from './ui/button';
import { NavigationService } from '../services/NavigationService';
import { useAuth } from '../hooks/useAuth';

export function AppNavigation() {
  const { user, isAuthenticated } = useAuth();

  const handleLaunchApp = () => {
    if (isAuthenticated) {
      NavigationService.navigateToMainApp();
    } else {
      NavigationService.navigateToLogin(
        window.location.pathname + window.location.search
      );
    }
  };

  return (
    <div className="flex items-center space-x-4">
      {isAuthenticated ? (
        <>
          <span className="text-sm text-muted-foreground">
            Привет, {user?.name}
          </span>
          <Button onClick={handleLaunchApp} className="bg-primary">
            🚗 Запустить приложение
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => NavigationService.navigateToAccount()}
          >
            Аккаунт
          </Button>
        </>
      ) : (
        <>
          <Button 
            variant="ghost" 
            onClick={() => NavigationService.navigateToLogin()}
          >
            Войти
          </Button>
          <Button onClick={() => NavigationService.navigateToRegister()}>
            Начать бесплатно
          </Button>
        </>
      )}
    </div>
  );
}
```

```typescriptreact
// apps/main-app/FleetMasterProMain-v00/src/components/AuthHandler.tsx
import React, { useEffect, useState } from 'react';
import { NavigationService } from '../services/NavigationService';

export function AuthHandler({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const handleAuthFromURL = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authToken = urlParams.get('auth_token');
      const redirectPath = urlParams.get('redirect');

      if (authToken) {
        // Store token in localStorage/sessionStorage
        localStorage.setItem('auth_token', authToken);
        
        // Clean URL
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('auth_token');
        newUrl.searchParams.delete('redirect');
        window.history.replaceState({}, '', newUrl.toString());

        // Redirect if needed
        if (redirectPath && redirectPath !== '/') {
          window.location.hash = redirectPath;
        }
      }

      // Check if user is authenticated
      const token = localStorage.getItem('auth_token');
      if (!token) {
        // Redirect to marketing site login
        NavigationService.navigateToLogin(window.location.pathname);
        return;
      }

      setIsInitialized(true);
    };

    handleAuthFromURL();
  }, []);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
```

```typescriptreact
// apps/main-app/FleetMasterProMain-v00/src/App.tsx
import { HashRouter, Route, Routes } from 'react-router'
import { AuthHandler } from './components/AuthHandler'
import HomePage from './pages/Home'
// ... other imports

export default function App() {
  return (
    <AuthHandler>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/car/:id" element={<CarOverview />} />
          {/* ... other routes */}
        </Routes>
      </HashRouter>
    </AuthHandler>
  )
}
```

```typescript
// shared/auth/AuthService.ts (can be in packages/shared or duplicated)
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
      // Call your authentication API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      
      // Store tokens and user data
      this.setAuthData(data.token, data.user, data.refreshToken);
      
      return {
        user: data.user,
        token: data.token,
        isAuthenticated: true,
        isLoading: false
      };
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      this.setAuthData(data.token, data.user, data.refreshToken);
      
      return {
        user: data.user,
        token: data.token,
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
      const token = this.getToken();
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      this.clearAuthData();
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
   * Refresh authentication token
   */
  static async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      if (!refreshToken) return null;

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        this.clearAuthData();
        return null;
      }

      const data = await response.json();
      localStorage.setItem(this.TOKEN_KEY, data.token);
      
      return data.token;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearAuthData();
      return null;
    }
  }

  /**
   * Validate token and get user info
   */
  static async validateToken(token: string): Promise<User | null> {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) return null;

      const user = await response.json();
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
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
```

```typescript
// shared/hooks/useAuth.ts
import { useState, useEffect, useCallback } from 'react';
import { AuthService, AuthState, User } from '../auth/AuthService';

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
          // Token is invalid, try to refresh
          const newToken = await AuthService.refreshToken();
          if (newToken) {
            const refreshedUser = await AuthService.validateToken(newToken);
            setAuthState({
              user: refreshedUser,
              token: newToken,
              isAuthenticated: !!refreshedUser,
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
```

```typescriptreact
// shared/contexts/AuthContext.tsx
import React, { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthState, User } from '../auth/AuthService';

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
```

```typescriptreact
// apps/marketing-site/src/App.tsx
import { AuthProvider } from '../shared/contexts/AuthContext';
import { HashRouter, Route, Routes } from 'react-router';
// ... other imports

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/account" element={<UserAccountPage />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
```

```typescriptreact
// apps/main-app/FleetMasterProMain-v00/src/App.tsx
import { AuthProvider } from '../shared/contexts/AuthContext';
import { AuthGuard } from './components/AuthGuard';
// ... other imports

export default function App() {
  return (
    <AuthProvider>
      <AuthGuard>
        <HashRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* ... other routes */}
          </Routes>
        </HashRouter>
      </AuthGuard>
    </AuthProvider>
  );
}
```

```typescript
// shared/types/UserFlow.ts
export type UserFlowStep = 
  | 'landing'           // First visit to marketing site
  | 'pricing'           // Viewing pricing plans
  | 'register'          // Creating account
  | 'email_verification' // Confirming email
  | 'onboarding'        // First-time setup
  | 'app_entry'         // Entering main app
  | 'first_car'         // Adding first vehicle
  | 'complete';         // Full onboarding done

export interface UserFlowState {
  currentStep: UserFlowStep;
  completedSteps: UserFlowStep[];
  selectedPlan?: 'starter' | 'pro' | 'enterprise';
  onboardingData?: {
    hasSeenWelcome: boolean;
    hasAddedCar: boolean;
    hasViewedDashboard: boolean;
    hasCreatedAlert: boolean;
  };
}

export class UserFlowManager {
  private static readonly FLOW_KEY = 'user_flow_state';

  static getFlowState(): UserFlowState {
    const saved = localStorage.getItem(this.FLOW_KEY);
    return saved ? JSON.parse(saved) : {
      currentStep: 'landing',
      completedSteps: [],
      onboardingData: {
        hasSeenWelcome: false,
        hasAddedCar: false,
        hasViewedDashboard: false,
        hasCreatedAlert: false
      }
    };
  }

  static updateFlowState(updates: Partial<UserFlowState>) {
    const current = this.getFlowState();
    const updated = { ...current, ...updates };
    localStorage.setItem(this.FLOW_KEY, JSON.stringify(updated));
    return updated;
  }

  static completeStep(step: UserFlowStep) {
    const current = this.getFlowState();
    const completedSteps = [...current.completedSteps];
    if (!completedSteps.includes(step)) {
      completedSteps.push(step);
    }
    return this.updateFlowState({
      completedSteps,
      currentStep: this.getNextStep(step)
    });
  }

  private static getNextStep(currentStep: UserFlowStep): UserFlowStep {
    const flowSequence: UserFlowStep[] = [
      'landing',
      'pricing', 
      'register',
      'email_verification',
      'onboarding',
      'app_entry',
      'first_car',
      'complete'
    ];
    
    const currentIndex = flowSequence.indexOf(currentStep);
    return flowSequence[currentIndex + 1] || 'complete';
  }
}
```

```typescriptreact
// apps/marketing-site/src/components/onboarding/OnboardingFlow.tsx
import React, { useState, useEffect } from 'react';
import { UserFlowManager, UserFlowStep } from '../../../shared/types/UserFlow';
import { WelcomeStep } from './steps/WelcomeStep';
import { PlanSelectionStep } from './steps/PlanSelectionStep';
import { EmailVerificationStep } from './steps/EmailVerificationStep';

export function OnboardingFlow() {
  const [flowState, setFlowState] = useState(UserFlowManager.getFlowState());

  const handleStepComplete = (step: UserFlowStep, data?: any) => {
    const updated = UserFlowManager.completeStep(step);
    setFlowState(updated);
    
    // Handle step-specific logic
    if (step === 'register' && data?.plan) {
      UserFlowManager.updateFlowState({ selectedPlan: data.plan });
    }
  };

  const renderCurrentStep = () => {
    switch (flowState.currentStep) {
      case 'landing':
        return <WelcomeStep onComplete={() => handleStepComplete('landing')} />;
      
      case 'pricing':
        return (
          <PlanSelectionStep 
            onComplete={(plan) => handleStepComplete('pricing', { plan })} 
          />
        );
      
      case 'email_verification':
        return (
          <EmailVerificationStep 
            onComplete={() => handleStepComplete('email_verification')} 
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      {renderCurrentStep()}
    </div>
  );
}
```

```typescriptreact
// apps/main-app/FleetMasterProMain-v00/src/components/onboarding/AppOnboarding.tsx
import React, { useState, useEffect } from 'react';
import { UserFlowManager } from '../../../shared/types/UserFlow';
import { useAuthContext } from '../../../shared/contexts/AuthContext';
import { NavigationService } from '../services/NavigationService';

export function AppOnboarding({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthContext();
  const [flowState, setFlowState] = useState(UserFlowManager.getFlowState());
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      const flow = UserFlowManager.getFlowState();
      
      // Check if user needs onboarding
      if (flow.currentStep === 'app_entry' || !flow.onboardingData?.hasSeenWelcome) {
        setShowOnboarding(true);
      }
    }
  }, [isAuthenticated, user]);

  const handleOnboardingComplete = () => {
    UserFlowManager.updateFlowState({
      currentStep: 'complete',
      onboardingData: {
        ...flowState.onboardingData,
        hasSeenWelcome: true
      }
    });
    setShowOnboarding(false);
  };

  const handleAddFirstCar = () => {
    UserFlowManager.updateFlowState({
      onboardingData: {
        ...flowState.onboardingData,
        hasAddedCar: true
      }
    });
  };

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gray-50">
        <OnboardingWelcome 
          user={user}
          onComplete={handleOnboardingComplete}
          onAddCar={handleAddFirstCar}
        />
      </div>
    );
  }

  return <>{children}</>;
}

function OnboardingWelcome({ 
  user, 
  onComplete, 
  onAddCar 
}: {
  user: any;
  onComplete: () => void;
  onAddCar: () => void;
}) {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Добро пожаловать, {user?.name}! 🎉
        </h1>
        <p className="text-xl text-gray-600">
          Давайте настроим ваш первый автомобиль
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <OnboardingStep
          number={1}
          title="Добавьте автомобиль"
          description="Создайте профиль вашего первого автомобиля"
          action={
            <Button onClick={onAddCar} className="w-full">
              Добавить автомобиль
            </Button>
          }
        />
        
        <OnboardingStep
          number={2}
          title="Настройте уведомления"
          description="Получайте напоминания о техобслуживании"
        />
        
        <OnboardingStep
          number={3}
          title="Изучите возможности"
          description="Откройте для себя все функции приложения"
        />
      </div>

      <div className="text-center">
        <Button variant="outline" onClick={onComplete}>
          Пропустить настройку
        </Button>
      </div>
    </div>
  );
}
```

```typescriptreact
// shared/services/FlowCoordinator.ts
import { UserFlowManager, UserFlowStep } from '../types/UserFlow';
import { NavigationService } from './NavigationService';

export class FlowCoordinator {
  /**
   * Handle user registration completion
   */
  static async handleRegistrationSuccess(userData: any) {
    UserFlowManager.completeStep('register');
    
    // If email verification is required
    if (!userData.emailVerified) {
      UserFlowManager.updateFlowState({ currentStep: 'email_verification' });
      return;
    }
    
    // Direct to app onboarding
    this.navigateToAppOnboarding(userData.token);
  }

  /**
   * Handle login success
   */
  static async handleLoginSuccess(userData: any) {
    const flowState = UserFlowManager.getFlowState();
    
    // If user hasn't completed onboarding, continue where they left off
    if (flowState.currentStep !== 'complete') {
      this.navigateToAppOnboarding(userData.token);
    } else {
      // Regular app entry
      NavigationService.navigateToMainApp(userData.token);
    }
  }

  /**
   * Navigate to app with onboarding flag
   */
  private static navigateToAppOnboarding(token: string) {
    NavigationService.navigateToMainApp(token, '/?onboarding=true');
  }

  /**
   * Handle plan upgrade flow
   */
  static handlePlanUpgrade(newPlan: 'pro' | 'enterprise') {
    UserFlowManager.updateFlowState({ selectedPlan: newPlan });
    NavigationService.navigateToMarketing('/account?upgrade=success');
  }

  /**
   * Handle feature gating
   */
  static checkFeatureAccess(feature: string, userPlan: string): boolean {
    const featureMatrix = {
      'advanced-analytics': ['pro', 'enterprise'],
      'multi-driver': ['pro', 'enterprise'],
      'api-access': ['enterprise'],
      'custom-branding': ['enterprise']
    };

    return featureMatrix[feature]?.includes(userPlan) ?? true;
  }

  /**
   * Handle feature upgrade prompts
   */
  static promptFeatureUpgrade(feature: string) {
    const upgradeUrl = `/register?upgrade=${feature}&current_plan=starter`;
    NavigationService.navigateToMarketing(upgradeUrl);
  }
}
```

```typescript
// shared/analytics/FlowAnalytics.ts
export class FlowAnalytics {
  /**
   * Track user flow progression
   */
  static trackFlowStep(step: UserFlowStep, metadata?: any) {
    // Analytics implementation (Google Analytics, Mixpanel, etc.)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'user_flow_step', {
        step_name: step,
        ...metadata
      });
    }
    
    // Also store for internal analytics
    this.storeFlowEvent({
      step,
      timestamp: new Date().toISOString(),
      metadata
    });
  }

  /**
   * Track conversion funnel
   */
  static trackConversion(from: UserFlowStep, to: UserFlowStep, duration?: number) {
    this.trackFlowStep('conversion', {
      from_step: from,
      to_step: to,
      duration_ms: duration
    });
  }

  /**
   * Track user drop-off points
   */
  static trackDropOff(step: UserFlowStep, reason?: string) {
    this.trackFlowStep('drop_off', {
      step_name: step,
      reason
    });
  }

  private static storeFlowEvent(event: any) {
    const events = JSON.parse(localStorage.getItem('flow_events') || '[]');
    events.push(event);
    
    // Keep only last 100 events
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }
    
    localStorage.setItem('flow_events', JSON.stringify(events));
  }
}
```

```markdown
## 🚀 Implementation Checklist

### Phase 1: Basic Navigation
- [ ] Set up environment configuration
- [ ] Implement NavigationService in both apps
- [ ] Update marketing site navigation components
- [ ] Add AuthHandler to main app
- [ ] Test cross-app navigation

### Phase 2: Authentication Integration  
- [ ] Implement shared AuthService
- [ ] Create useAuth hook
- [ ] Set up AuthContext in both apps
- [ ] Add token validation and refresh
- [ ] Test authentication flow

### Phase 3: User Flow Management
- [ ] Implement UserFlowManager
- [ ] Create onboarding components
- [ ] Set up FlowCoordinator
- [ ] Add analytics tracking
- [ ] Test complete user journey

### Phase 4: Testing & Optimization
- [ ] End-to-end testing of user flows
- [ ] Performance optimization
- [ ] Error handling and edge cases
- [ ] Analytics validation
- [ ] Security audit

### Phase 5: Deployment
- [ ] Environment-specific configuration
- [ ] CORS setup for cross-origin requests
- [ ] SSL certificates for both domains
- [ ] CDN configuration
- [ ] Monitoring and alerting
```

---

**User**

For the code present, we get this error:
```
Cannot find module '../hooks/useAuth' or its corresponding type declarations.
```
How can I resolve this? If you propose a fix, please make it concise.

---

**Cursor**

```typescriptreact
const { user, isAuthenticated } = useAuth();
```

You need to create the missing `useAuth` hook. Here's a quick fix:

Create the missing hook file:

```typescript
// apps/marketing-site/src/hooks/useAuth.ts
import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored auth data
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
  }, []);

  return {
    user,
    isAuthenticated
  };
}
```

This provides the basic `user` and `isAuthenticated` properties that `AppNavigation` expects, with simple localStorage-based state management.

```typescript
// apps/marketing-site/src/hooks/useAuth.ts
import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored auth data
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
    }
  }, []);

  return {
    user,
    isAuthenticated
  };
}
```

---

**User**

For the code present, we get this error:
```
Cannot find module 'react' or its corresponding type declarations.
```
How can I resolve this? If you propose a fix, please make it concise.

---

**Cursor**

The issue is missing React types. You need to create the `NavigationService` and ensure proper React setup.

**Quick fixes:**

1. **Create the missing NavigationService:**

```typescript
// apps/main-app/FleetMasterProMain-v00/src/services/NavigationService.ts
export class NavigationService {
  static navigateToLogin(currentPath?: string) {
    const marketingUrl = 'http://localhost:3000'; // or from config
    const loginUrl = new URL('/login', marketingUrl);
    if (currentPath) {
      loginUrl.searchParams.set('return_url', currentPath);
    }
    window.location.href = loginUrl.toString();
  }
}
```

2. **Check React is installed in main app:**

```bash
cd apps/main-app/FleetMasterProMain-v00
npm install react @types/react react-dom @types/react-dom
```

3. **Alternative simple fix - remove AuthHandler dependency from App.tsx temporarily:**

```tsx
// apps/main-app/FleetMasterProMain-v00/src/App.tsx
// Remove this line temporarily:
// import { AuthHandler } from './components/AuthHandler'

// And wrap routes directly:
<HashRouter>
  <Routes>
    {/* your routes */}
  </Routes>
</HashRouter>
```

The React types installation should resolve both the React import and JSX errors.

```typescript
// apps/main-app/FleetMasterProMain-v00/src/services/NavigationService.ts
export class NavigationService {
  static navigateToLogin(currentPath?: string) {
    const marketingUrl = 'http://localhost:3000'; // or from config
    const loginUrl = new URL('/login', marketingUrl);
    if (currentPath) {
      loginUrl.searchParams.set('return_url', currentPath);
    }
    window.location.href = loginUrl.toString();
  }
}
```

```shellscript
cd apps/main-app/FleetMasterProMain-v00
npm install react @types/react react-dom @types/react-dom
```

```typescriptreact
// apps/main-app/FleetMasterProMain-v00/src/App.tsx
// Remove this line temporarily:
// import { AuthHandler } from './components/AuthHandler'

// And wrap routes directly:
<HashRouter>
  <Routes>
    {/* your routes */}
  </Routes>
</HashRouter>
```

---

**User**

For the code present, we get this error:
```
Cannot find module '../services/NavigationService' or its corresponding type declarations.
```
Navigation Service must be managed using config, as it planned for marketing app?

---

**Cursor**

Yes, exactly! The NavigationService should use the same config-based approach. Create it in the main app:

```typescript
// apps/main-app/FleetMasterProMain-v00/src/services/NavigationService.ts
const APP_CONFIG = {
  ENVIRONMENTS: {
    development: {
      MARKETING_URL: 'http://localhost:3000',
      MAIN_APP_URL: 'http://localhost:3001'
    },
    staging: {
      MARKETING_URL: '',
      MAIN_APP_URL: ''
    },
    production: {
      MARKETING_URL: '',
      MAIN_APP_URL: ''
    }
  },
  
  getCurrentConfig() {
    const env = process.env.NODE_ENV || 'development';
    return this.ENVIRONMENTS[env];
  }
};

export class NavigationService {
  private static config = APP_CONFIG.getCurrentConfig();

  static navigateToLogin(returnUrl?: string) {
    const url = new URL('/login', this.config.MARKETING_URL);
    if (returnUrl) {
      url.searchParams.set('return_url', returnUrl);
    }
    window.location.href = url.toString();
  }

  static navigateToMarketing(page: string = '/') {
    const url = new URL(page, this.config.MARKETING_URL);
    window.location.href = url.toString();
  }
}
```

This keeps both apps consistent with the same config-based navigation pattern. The main app navigates **to** the marketing site, while the marketing site navigates **to** the main app.

```typescript
// apps/main-app/FleetMasterProMain-v00/src/services/NavigationService.ts
const APP_CONFIG = {
  ENVIRONMENTS: {
    development: {
      MARKETING_URL: 'http://localhost:3000',
      MAIN_APP_URL: 'http://localhost:3001'
    },
    staging: {
      MARKETING_URL: '',
      MAIN_APP_URL: ''
    },
    production: {
      MARKETING_URL: '',
      MAIN_APP_URL: ''
    }
  },
  
  getCurrentConfig() {
    const env = process.env.NODE_ENV || 'development';
    return this.ENVIRONMENTS[env];
  }
};

export class NavigationService {
  private static config = APP_CONFIG.getCurrentConfig();

  static navigateToLogin(returnUrl?: string) {
    const url = new URL('/login', this.config.MARKETING_URL);
    if (returnUrl) {
      url.searchParams.set('return_url', returnUrl);
    }
    window.location.href = url.toString();
  }

  static navigateToMarketing(page: string = '/') {
    const url = new URL(page, this.config.MARKETING_URL);
    window.location.href = url.toString();
  }
}
```

---

**User**

For the code present, we get this error:
```
'AuthHandler' is declared but its value is never read.
```
How can I resolve this? If you propose a fix, please make it concise.

---

**Cursor**

You need to actually use the `AuthHandler` to wrap your routes. Update the App.tsx:

```tsx
export default function App() {
  return (
    <AuthHandler>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/car/:id" element={<CarOverview />} />
          <Route path="/add-car" element={<AddCar />} />
          <Route path="/user-alert" element={<UserAlert />} />
          <Route path="/alerts" element={<AlertList />} />
          <Route path="/add-service-record" element={<AddServiceRecord />} />
          <Route path="/service-history" element={<ServiceHistory />} />
          <Route path="/maintenance-planning" element={<MaintenancePlanning />} />
        </Routes>
      </HashRouter>
    </AuthHandler>
  )
}
```

This wraps your entire app with the authentication handler, which will check for auth tokens and redirect to the marketing site if unauthenticated.

```typescriptreact
export default function App() {
  return (
    <AuthHandler>
      <HashRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/car/:id" element={<CarOverview />} />
          <Route path="/add-car" element={<AddCar />} />
          <Route path="/user-alert" element={<UserAlert />} />
          <Route path="/alerts" element={<AlertList />} />
          <Route path="/add-service-record" element={<AddServiceRecord />} />
          <Route path="/service-history" element={<ServiceHistory />} />
          <Route path="/maintenance-planning" element={<MaintenancePlanning />} />
        </Routes>
      </HashRouter>
    </AuthHandler>
  )
}
```

