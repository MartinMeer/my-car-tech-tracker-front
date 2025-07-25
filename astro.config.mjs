// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://my-car-tech-tracker.com',
  base: '/',
  trailingSlash: 'never',
  build: {
    assets: 'assets',
    inlineStylesheets: 'auto'
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'auth': ['/src/authUI.js'],
            'cars': ['/src/carsUI.js'],
            'maintenance': ['/src/maintenanceUI.js'],
            'repair': ['/src/repairUI.js'],
            'user-alert': ['/src/userAlertUI.js'],
            'service-record': ['/src/serviceRecordManager.js']
          }
        }
      }
    }
  }
});
