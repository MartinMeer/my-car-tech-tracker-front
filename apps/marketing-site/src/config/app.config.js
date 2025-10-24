// apps/marketing-site/src/config/app.config.js
export const APP_CONFIG = {
  ENVIRONMENTS: {
    development: {
      MARKETING_URL: 'http://localhost:3000',
      MAIN_APP_URL: 'http://localhost:3001',
      API_URL: 'http://localhost:8080/api'
    },
    staging: {
      MARKETING_URL: '',
      MAIN_APP_URL: '',  
      API_URL: ''
    },
    production: {
      MARKETING_URL: 'https://martinmeer.github.io/my-car-tech-tracker-front',
      MAIN_APP_URL: 'https://martinmeer.github.io/my-car-tech-tracker-front/app',
      // DEMO MODE: Keep this placeholder to run in localStorage/demo mode without backend
      // To use real API: Replace with your actual backend URL (e.g., 'https://api.yourserver.com/api')
      API_URL: 'https://your-api-domain.com/api'
    }
  },
  
  getCurrentConfig() {
    const env = process.env.NODE_ENV || 'development';
    return this.ENVIRONMENTS[env];
  }
};
