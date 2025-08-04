/**
 * Login page component for user authentication
 * Supports both Russian and English languages
 * Implements modern authentication UI with social login options
 */

import React, { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { useAuth } from '../hooks/useAuth';
import { NavigationService } from '../services/NavigationService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Languages,
  LogIn,
  Zap
} from 'lucide-react';

export default function LoginPage() {
  /**
   * State management for form and UI
   */
  const [language, setLanguage] = useState<'ru' | 'en'>('ru');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, isLoading } = useAuth();

  /**
   * Translation object for bilingual support
   */
  const translations = {
    ru: {
      // Header
      languageToggle: 'EN',
      backToHome: 'На главную',
      pageTitle: 'Войти — My Car Tech Tracker',
      
      // Main content
      welcomeTitle: 'Добро пожаловать',
      welcomeSubtitle: 'Войдите в свой аккаунт',
      
      // Form labels
      emailLabel: 'Email',
      passwordLabel: 'Пароль',
      forgotPassword: 'Забыли пароль?',
      
      // Buttons
      loginButton: 'Войти в систему',
      
      // Demo section
      quickAccessTitle: '🚀 Быстрый доступ',
      demoButton: 'Использовать демо аккаунт',
      demoCredentials: 'demo@example.com / demo123',
      
      // Social login
      socialLoginTitle: 'Или войдите через',
      googleLogin: 'Google',
      githubLogin: 'GitHub',
      
      // Footer
      noAccount: 'Нет аккаунта?',
      registerLink: 'Зарегистрироваться'
    },
    en: {
      // Header
      languageToggle: 'RU',
      backToHome: 'Back to Home',
      pageTitle: 'Login — My Car Tech Tracker',
      
      // Main content
      welcomeTitle: 'Welcome Back',
      welcomeSubtitle: 'Sign in to your account',
      
      // Form labels
      emailLabel: 'Email',
      passwordLabel: 'Password',
      forgotPassword: 'Forgot password?',
      
      // Buttons
      loginButton: 'Sign In',
      
      // Demo section
      quickAccessTitle: '🚀 Quick Access',
      demoButton: 'Use Demo Account',
      demoCredentials: 'demo@example.com / demo123',
      
      // Social login
      socialLoginTitle: 'Or sign in with',
      googleLogin: 'Google',
      githubLogin: 'GitHub',
      
      // Footer
      noAccount: 'Don\'t have an account?',
      registerLink: 'Sign up'
    }
  };

  const t = translations[language];

  /**
   * Handle demo account login
   */
  const handleDemoLogin = () => {
    setEmail('demo@cartracker.com');
    setPassword('demo123');
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      // On successful login, navigate to main app
      NavigationService.navigateToMainApp();
    } catch (error) {
      setError(error.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Language Toggle Button */}
      <div className="absolute top-6 right-6 z-50">
        <Button
          onClick={() => setLanguage(language === 'ru' ? 'en' : 'ru')}
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm border-gray-300 hover:bg-white/95"
        >
          <Languages className="w-4 h-4 mr-2" />
          {t.languageToggle}
        </Button>
      </div>

      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-50">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm border-gray-300 hover:bg-white/95"
        >
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.backToHome}
          </Link>
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen px-4 py-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-4">
              <span className="text-4xl">🚗</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t.welcomeTitle}
            </h1>
            <p className="text-gray-600">
              {t.welcomeSubtitle}
            </p>
          </div>

          {/* Login Form */}
          <Card className="border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">{t.emailLabel}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">{t.passwordLabel}</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password */}
                <div className="text-right">
                  <Link 
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {t.forgotPassword}
                  </Link>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                    {error}
                  </div>
                )}

                {/* Login Button */}
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isLoading}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  {isLoading ? 'Signing in...' : t.loginButton}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Demo Account Section */}
          <Card className="mt-6 border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="text-center">
                <h3 className="font-medium text-orange-800 mb-2">
                  {t.quickAccessTitle}
                </h3>
                <Button
                  onClick={handleDemoLogin}
                  variant="outline"
                  className="w-full border-orange-300 text-orange-700 hover:bg-orange-100 mb-2"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  {t.demoButton}
                </Button>
                <p className="text-xs text-orange-600">
                  demo@cartracker.com / demo123
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Social Login */}
          <div className="mt-6">
            <div className="text-center text-sm text-gray-500 mb-4">
              {t.socialLoginTitle}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full border-gray-300"
                onClick={() => console.log('Google login')}
              >
                <span className="mr-2">🔍</span>
                {t.googleLogin}
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-300"
                onClick={() => console.log('GitHub login')}
              >
                <span className="mr-2">🐙</span>
                {t.githubLogin}
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              {t.noAccount}{' '}
              <Link 
                to="/register"
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
              >
                {t.registerLink}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}