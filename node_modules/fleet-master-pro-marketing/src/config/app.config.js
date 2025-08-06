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
      MARKETING_URL: '',
      MAIN_APP_URL: '',
      API_URL: ''
    }
  },
  
  getCurrentConfig() {
    const env = process.env.NODE_ENV || 'development';
    return this.ENVIRONMENTS[env];
  }
};
