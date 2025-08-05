/**
 * Registration page component for new user signup
 * Supports both Russian and English languages
 * Implements modern registration UI with social signup options
 */

import React, { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { useAuth } from '../hooks/useAuth';
import { NavigationService } from '../services/NavigationService';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Languages,
  UserPlus
} from 'lucide-react';

export default function RegisterPage() {
  /**
   * State management for form and UI
   */
  const [language, setLanguage] = useState<'ru' | 'en'>('ru');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  
  const { register, isLoading } = useAuth();

  /**
   * Translation object for bilingual support
   */
  const translations = {
    ru: {
      // Header
      languageToggle: 'EN',
      backToHome: 'На главную',
      pageTitle: 'Зарегистрироваться — My Car Tech Tracker',
      
      // Main content
      createAccountTitle: 'Создать аккаунт',
      createAccountSubtitle: 'Присоединяйтесь к My Car Tech Tracker',
      
      // Form labels
      nameLabel: 'Имя',
      emailLabel: 'Email',
      passwordLabel: 'Пароль',
      passwordPlaceholder: 'Введите пароль',
      confirmPasswordLabel: 'Подтвердите пароль',
      confirmPasswordPlaceholder: 'Подтвердите пароль',
      
      // Terms
      agreeToTerms: 'Я согласен с',
      termsOfService: 'условиями использования',
      and: 'и',
      privacyPolicy: 'политикой конфиденциальности',
      
      // Buttons
      createAccountButton: 'Создать аккаунт',
      
      // Social signup
      socialSignupTitle: 'Или зарегистрируйтесь через',
      googleSignup: 'Google',
      githubSignup: 'GitHub',
      
      // Footer
      haveAccount: 'Уже есть аккаунт?',
      loginLink: 'Войти'
    },
    en: {
      // Header
      languageToggle: 'RU',
      backToHome: 'Back to Home',
      pageTitle: 'Sign Up — My Car Tech Tracker',
      
      // Main content
      createAccountTitle: 'Create Account',
      createAccountSubtitle: 'Join My Car Tech Tracker today',
      
      // Form labels
      nameLabel: 'Full Name',
      emailLabel: 'Email',
      passwordLabel: 'Password',
      passwordPlaceholder: 'Enter password',
      confirmPasswordLabel: 'Confirm Password',
      confirmPasswordPlaceholder: 'Confirm password',
      
      // Terms
      agreeToTerms: 'I agree to the',
      termsOfService: 'Terms of Service',
      and: 'and',
      privacyPolicy: 'Privacy Policy',
      
      // Buttons
      createAccountButton: 'Create Account',
      
      // Social signup
      socialSignupTitle: 'Or sign up with',
      googleSignup: 'Google',
      githubSignup: 'GitHub',
      
      // Footer
      haveAccount: 'Already have an account?',
      loginLink: 'Sign in'
    }
  };

  const t = translations[language];

  /**
   * Handle input changes
   */
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!formData.agreeTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }
    
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        plan: 'starter'
      });
      // On successful registration, navigate to main app
      NavigationService.navigateToMainApp();
    } catch (error) {
      setError(error.message || 'Registration failed');
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
              {t.createAccountTitle}
            </h1>
            <p className="text-gray-600">
              {t.createAccountSubtitle}
            </p>
          </div>

          {/* Registration Form */}
          <Card className="border-gray-200 shadow-lg">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div className="space-y-2">
                  <Label htmlFor="name">{t.nameLabel}</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    className="w-full"
                  />
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">{t.emailLabel}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
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
                      placeholder={t.passwordPlaceholder}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
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

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t.confirmPasswordLabel}</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder={t.confirmPasswordPlaceholder}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                      className="w-full pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeTerms}
                    onCheckedChange={(checked) => handleInputChange('agreeTerms', !!checked)}
                    className="mt-1"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600 leading-5">
                    {t.agreeToTerms}{' '}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-800 hover:underline">
                      {t.termsOfService}
                    </Link>{' '}
                    {t.and}{' '}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-800 hover:underline">
                      {t.privacyPolicy}
                    </Link>
                  </label>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                    {error}
                  </div>
                )}

                {/* Create Account Button */}
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={!formData.agreeTerms || isLoading}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isLoading ? 'Creating Account...' : t.createAccountButton}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Social Signup */}
          <div className="mt-6">
            <div className="text-center text-sm text-gray-500 mb-4">
              {t.socialSignupTitle}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full border-gray-300"
                onClick={() => console.log('Google signup')}
              >
                <span className="mr-2">🔍</span>
                {t.googleSignup}
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-300"
                onClick={() => console.log('GitHub signup')}
              >
                <span className="mr-2">🐙</span>
                {t.githubSignup}
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              {t.haveAccount}{' '}
              <Link 
                to="/login"
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
              >
                {t.loginLink}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}