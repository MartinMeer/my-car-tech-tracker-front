export const CONFIG = {
  useBackend: false, // Backend is now ready
  apiUrl: 'http://localhost:8080/api',
  demoMode: true, // Keep demo mode for development
  
  // Path configuration to replace hard-coded paths
  paths: {
    // Base paths relative to different locations
    main: {
      index: '../index.html',           // From auth/ to main index
      indexFromSrc: 'index.html'        // From user account to main index
    },
    auth: {
      login: 'login.html',              // From register to login (same directory)
      loginFromMain: 'auth/login.html', // From main app to login
      loginFromUserAccount: 'auth/login.html' // From user account to login
    }
  }
};

/**
 * Path utility to get correct paths based on current location
 */
export const PathUtils = {
  /**
   * Get the correct path to main index based on current location
   */
  getMainIndexPath() {
    const currentPath = window.location.pathname;
    
    // If we're in auth directory, go up one level
    if (currentPath.includes('/auth/')) {
      return '../index.html';
    }
    
    // If we're in main directory (e.g., user-account.html)
    return 'index.html';
  },
  
  /**
   * Get the correct path to login based on current location
   */
  getLoginPath() {
    const currentPath = window.location.pathname;
    
    // If we're in auth directory (register page), stay in same directory
    if (currentPath.includes('/auth/')) {
      return 'login.html';
    }
    
    // If we're in main directory, go to auth subdirectory
    return 'auth/login.html';
  },
  
  /**
   * Navigate to main index page
   */
  navigateToMain() {
    window.location.href = this.getMainIndexPath();
  },
  
  /**
   * Navigate to login page
   */
  navigateToLogin() {
    window.location.href = this.getLoginPath();
  }
}; 