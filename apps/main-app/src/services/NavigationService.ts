import { APP_CONFIG } from "../config/app.config";

export class NavigationService {
    private static config = APP_CONFIG.getCurrentConfig();
  
    static navigateToLogin(returnUrl?: string) {
      let url = `${this.config.MARKETING_URL}/#/login`;
      if (returnUrl) {
        const urlObj = new URL(url);
        urlObj.searchParams.set('return_url', returnUrl);
        url = urlObj.toString();
      }
      window.location.href = url;
    }
  
    static navigateToMarketing(page: string = '/') {
      // Handle hash routing - if page doesn't start with #, add it
      const hashPage = page === '/' ? '' : (page.startsWith('#') ? page : `#${page}`);
      window.location.href = `${this.config.MARKETING_URL}/${hashPage}`;
    }
  }