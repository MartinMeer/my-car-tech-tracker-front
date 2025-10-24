// apps/main-app/src/services/ConfigService.ts
import { APP_CONFIG } from '../config/app.config';

/**
 * Configuration service to manage environment settings and feature flags
 */
export class ConfigService {
  private static readonly USE_BACKEND_KEY = 'use_backend_override';

  /**
   * Check if the app should use backend API or localStorage
   * Priority: localStorage override > valid API URL check > environment variable
   */
  static shouldUseBackend(): boolean {
    // Check for manual override in localStorage (for development/testing)
    const override = localStorage.getItem(this.USE_BACKEND_KEY);
    if (override !== null) {
      return override === 'true';
    }

    // Check if we have a valid API URL configured
    const config = APP_CONFIG.getCurrentConfig();
    const hasValidApiUrl = config.API_URL && 
                          !config.API_URL.includes('your-api-domain.com') &&
                          !config.API_URL.includes('localhost');

    // In production, only use backend if we have a valid API URL
    if (process.env.NODE_ENV === 'production') {
      return hasValidApiUrl;
    }

    // Development default - use localStorage
    return false;
  }

  /**
   * Manually override backend usage (useful for testing)
   */
  static setBackendOverride(useBackend: boolean): void {
    localStorage.setItem(this.USE_BACKEND_KEY, useBackend.toString());
    console.log(`Backend usage ${useBackend ? 'enabled' : 'disabled'} via override`);
  }

  /**
   * Clear backend override (use environment default)
   */
  static clearBackendOverride(): void {
    localStorage.removeItem(this.USE_BACKEND_KEY);
    console.log('Backend override cleared, using environment default');
  }

  /**
   * Get current configuration
   */
  static getCurrentConfig() {
    return APP_CONFIG.getCurrentConfig();
  }

  /**
   * Get debug information about current configuration
   */
  static getDebugInfo() {
    const override = localStorage.getItem(this.USE_BACKEND_KEY);
    const useBackend = this.shouldUseBackend();
    const config = this.getCurrentConfig();

    return {
      environment: process.env.NODE_ENV || 'development',
      useBackend,
      hasOverride: override !== null,
      overrideValue: override,
      apiUrl: config.API_URL,
      marketingUrl: config.MARKETING_URL,
      mainAppUrl: config.MAIN_APP_URL
    };
  }

  /**
   * Log current configuration to console (for debugging)
   */
  static logDebugInfo(): void {
    const info = this.getDebugInfo();
    console.group('🔧 Configuration Debug Info');
    console.log('Environment:', info.environment);
    console.log('Using Backend:', info.useBackend);
    console.log('Has Override:', info.hasOverride);
    if (info.hasOverride) {
      console.log('Override Value:', info.overrideValue);
    }
    console.log('API URL:', info.apiUrl);
    console.log('Marketing URL:', info.marketingUrl);
    console.log('Main App URL:', info.mainAppUrl);
    console.groupEnd();
  }
}