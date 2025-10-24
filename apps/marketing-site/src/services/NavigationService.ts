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
    const hashPage = page === '/' ? '' : (page.startsWith('#') ? page : `#${page}`);
    window.location.href = `${this.config.MARKETING_URL}/${hashPage}`;
  }

  /**
   * Navigate to specific marketing pages
   */
  static navigateToLogin(returnUrl?: string) {
    let url = `${this.config.MARKETING_URL}/#/login`;
    if (returnUrl) {
      const urlObj = new URL(url);
      urlObj.searchParams.set('return_url', returnUrl);
      url = urlObj.toString();
    }
    window.location.href = url;
  }

  static navigateToRegister(plan?: 'starter' | 'pro' | 'enterprise') {
    let url = `${this.config.MARKETING_URL}/#/register`;
    if (plan) {
      const urlObj = new URL(url);
      urlObj.searchParams.set('plan', plan);
      url = urlObj.toString();
    }
    window.location.href = url;
  }

  static navigateToAccount() {
    window.location.href = `${this.config.MARKETING_URL}/#/account`;
  }
}