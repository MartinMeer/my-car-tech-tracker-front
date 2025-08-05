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
