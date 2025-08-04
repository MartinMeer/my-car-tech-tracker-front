import { APP_CONFIG } from "../config/app.config";

export class NavigationService {
    private static config = APP_CONFIG.getCurrentConfig();
  
    static navigateToLogin(returnUrl?: string) {
      const url = new URL('/#/login', this.config.MARKETING_URL);
      if (returnUrl) {
        url.searchParams.set('return_url', returnUrl);
      }
      window.location.href = url.toString();
    }
  
    static navigateToMarketing(page: string = '/') {
      // Handle hash routing - if page doesn't start with #, add it
      const hashPage = page === '/' ? '/' : (page.startsWith('#') ? page : `/#${page}`);
      const url = new URL(hashPage, this.config.MARKETING_URL);
      window.location.href = url.toString();
    }
  }