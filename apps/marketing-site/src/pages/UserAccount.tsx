/**
 * User account management page for profile settings and password changes
 * Supports both Russian and English languages
 * Implements modern account management UI with role selection and profile updates
 */

import React, { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Languages,
  Save,
  X,
  User,
  Camera,
  Shield,
  Settings
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { NavigationService } from '../services/NavigationService';

export default function UserAccountPage() {
  /**
   * State management for form and UI
   */
  const [language, setLanguage] = useState<'ru' | 'en'>('ru');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: 'Иван Петров',
    email: 'ivan.petrov@example.com',
    role: 'fleet-manager',
    avatar: null as string | null
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  /**
   * Translation object for bilingual support
   */
  const translations = {
    ru: {
      // Header
      languageToggle: 'EN',
      backToHome: 'Вернуться к главной',
      pageTitle: 'Личный кабинет — My Car Tech Tracker',
      
      // Main content
      accountSettings: 'Настройки аккаунта',
      profileSettings: 'Настройки профиля',
      manageAccount: 'Управляйте настройками вашей учётной записи',
      
      // Profile section
      profilePhoto: 'Фото профиля',
      uploadPhoto: 'Загрузить фото',
      changePhoto: 'Изменить фото',
      
      // Form labels
      fullName: 'Полное имя',
      emailAddress: 'Email адрес',
      userRole: 'Роль пользователя',
      
      // Role options
      fleetManager: 'Менеджер автопарка',
      technician: 'Механик',
      driver: 'Водитель',
      owner: 'Владелец',
      
      // Password section
      passwordChange: 'Изменение пароля',
      passwordChangeDesc: 'Обновите пароль для обеспечения безопасности аккаунта',
      currentPassword: 'Текущий пароль',
      newPassword: 'Новый пароль',
      confirmNewPassword: 'Подтвердите новый пароль',
      
      // Buttons
      saveChanges: 'Сохранить изменения',
      cancel: 'Отмена',
      updatePassword: 'Обновить пароль',
      
      // Status messages
      loading: 'Загрузка...',
      profileUpdated: 'Профиль успешно обновлён',
      passwordUpdated: 'Пароль успешно обновлён',
      
      // Account stats
      accountCreated: 'Аккаунт создан',
      lastLogin: 'Последний вход',
      vehiclesManaged: 'Управляемых автомобилей'
    },
    en: {
      // Header
      languageToggle: 'RU',
      backToHome: 'Back to Home',
      pageTitle: 'User Account — My Car Tech Tracker',
      
      // Main content
      accountSettings: 'Account Settings',
      profileSettings: 'Profile Settings',
      manageAccount: 'Manage your account settings and preferences',
      
      // Profile section
      profilePhoto: 'Profile Photo',
      uploadPhoto: 'Upload Photo',
      changePhoto: 'Change Photo',
      
      // Form labels
      fullName: 'Full Name',
      emailAddress: 'Email Address',
      userRole: 'User Role',
      
      // Role options
      fleetManager: 'Fleet Manager',
      technician: 'Technician',
      driver: 'Driver',
      owner: 'Owner',
      
      // Password section
      passwordChange: 'Password Change',
      passwordChangeDesc: 'Update your password to keep your account secure',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmNewPassword: 'Confirm New Password',
      
      // Buttons
      saveChanges: 'Save Changes',
      cancel: 'Cancel',
      updatePassword: 'Update Password',
      
      // Status messages
      loading: 'Loading...',
      profileUpdated: 'Profile updated successfully',
      passwordUpdated: 'Password updated successfully',
      
      // Account stats
      accountCreated: 'Account Created',
      lastLogin: 'Last Login',
      vehiclesManaged: 'Vehicles Managed'
    }
  };

  const t = translations[language];

  /**
   * Handle profile data changes
   */
  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Handle password data changes
   */
  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  /**
   * Handle profile photo upload
   */
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({
          ...prev,
          avatar: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Handle profile save
   */
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    alert(t.profileUpdated);
  };

  /**
   * Handle password update
   */
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    alert(t.passwordUpdated);
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
          variant="outline"
          size="sm"
          className="bg-white/90 backdrop-blur-sm border-gray-300 hover:bg-white/95"
          onClick={() => NavigationService.navigateToMainApp()}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t.backToHome}
        </Button>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-4">
            <span className="text-4xl">🚗</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t.accountSettings}
          </h1>
          <p className="text-gray-600">
            {t.manageAccount}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Info Card */}
          <div className="lg:col-span-1">
            <Card className="border-gray-200 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto overflow-hidden">
                    {profileData.avatar ? (
                      <img 
                        src={profileData.avatar} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-12 h-12 text-blue-600" />
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2">
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                        <Camera className="w-4 h-4 text-white" />
                      </div>
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                </div>
                <CardTitle className="text-xl">{profileData.name}</CardTitle>
                <CardDescription>{profileData.email}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t.accountCreated}:</span>
                    <span className="font-medium">
                      {language === 'ru' ? '15 окт 2024' : 'Oct 15, 2024'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t.lastLogin}:</span>
                    <span className="font-medium">
                      {language === 'ru' ? '2 часа назад' : '2 hours ago'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t.vehiclesManaged}:</span>
                    <span className="font-medium">12</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Forms */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Settings */}
            <Card className="border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  {t.profileSettings}
                </CardTitle>
                <CardDescription>
                  {t.manageAccount}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">{t.fullName}</Label>
                    <Input
                      id="name"
                      type="text"
                      value={profileData.name}
                      onChange={(e) => handleProfileChange('name', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">{t.emailAddress}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleProfileChange('email', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  {/* User Role */}
                  <div className="space-y-2">
                    <Label htmlFor="role">{t.userRole}</Label>
                    <Select
                      value={profileData.role}
                      onValueChange={(value) => handleProfileChange('role', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fleet-manager">{t.fleetManager}</SelectItem>
                        <SelectItem value="technician">{t.technician}</SelectItem>
                        <SelectItem value="driver">{t.driver}</SelectItem>
                        <SelectItem value="owner">{t.owner}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      disabled={isLoading}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? t.loading : t.saveChanges}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => window.location.reload()}
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t.cancel}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card className="border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  {t.passwordChange}
                </CardTitle>
                <CardDescription>
                  {t.passwordChangeDesc}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  {/* Current Password */}
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">{t.currentPassword}</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        className="w-full pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">{t.newPassword}</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        className="w-full pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">{t.confirmNewPassword}</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
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

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button 
                      type="submit" 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      disabled={isLoading}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      {isLoading ? t.loading : t.updatePassword}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      })}
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t.cancel}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}