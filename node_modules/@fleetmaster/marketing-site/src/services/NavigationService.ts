// apps/marketing-site/src/services/NavigationService.ts
import { APP_CONFIG } from '../config/app.config';

export class NavigationService {
  private static config = APP_CONFIG.getCurrentConfig();

  /**
   * Navigate to main app with authentication token
   */
  static navigateToMainApp(token?: string, redirectPath: string = '/') {
    const url = new URL(this.config.MAIN_APP_URL);
    
    // Get token from localStorage if not provided
    const authToken = token || localStorage.getItem('auth_token');
    
    if (authToken) {
      // Pass token via URL parameter (will be consumed and cleared)
      url.searchParams.set('auth_token', authToken);
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
    // Handle hash routing - if page doesn't start with #, add it
    const hashPage = page === '/' ? '/' : (page.startsWith('#') ? page : `/#${page}`);
    const url = new URL(hashPage, this.config.MARKETING_URL);
    window.location.href = url.toString();
  }

  /**
   * Navigate to specific marketing pages
   */
  static navigateToLogin(returnUrl?: string) {
    const url = new URL('/#/login', this.config.MARKETING_URL);
    if (returnUrl) {
      url.searchParams.set('return_url', returnUrl);
    }
    window.location.href = url.toString();
  }

  static navigateToRegister(plan?: 'starter' | 'pro' | 'enterprise') {
    const url = new URL('/#/register', this.config.MARKETING_URL);
    if (plan) {
      url.searchParams.set('plan', plan);
    }
    window.location.href = url.toString();
  }

  static navigateToAccount() {
    const url = new URL('/#/account', this.config.MARKETING_URL);
    window.location.href = url.toString();
  }
}