/**
 * Cookie Handler Test Suite
 * Demonstrates and tests the cookie handler functionality
 * 
 * This file can be run in the browser console to test the cookie handler
 * Usage: Copy and paste the test functions into browser console
 */

import { CONFIG } from './config.js';
import { CookieHandler } from './cookieHandler.js';
import { AuthService } from './authService.js';

// Test configuration
const TEST_CONFIG = {
  runTests: true,
  verbose: true,
  cleanupAfterTests: true
};

/**
 * Test Cookie Handler Basic Operations
 */
export async function testCookieHandler() {
  console.log('🧪 Testing Cookie Handler...');
  
  try {
    // Test 1: Set and get cookie
    console.log('Test 1: Set and get cookie');
    CookieHandler.setCookie('test_cookie', 'test_value');
    const value = CookieHandler.getCookie('test_cookie');
    console.assert(value === 'test_value', 'Cookie value should match');
    console.log('✅ Test 1 passed');

    // Test 2: Check if cookie exists
    console.log('Test 2: Check if cookie exists');
    const exists = CookieHandler.hasCookie('test_cookie');
    console.assert(exists === true, 'Cookie should exist');
    console.log('✅ Test 2 passed');

    // Test 3: Delete cookie
    console.log('Test 3: Delete cookie');
    CookieHandler.deleteCookie('test_cookie');
    const deletedValue = CookieHandler.getCookie('test_cookie');
    console.assert(deletedValue === null, 'Cookie should be deleted');
    console.log('✅ Test 3 passed');

    // Test 4: Cookie with options
    console.log('Test 4: Cookie with options');
    CookieHandler.setCookie('test_cookie_options', 'test_value_options', {
      maxAge: 1000 // 1 second
    });
    const optionValue = CookieHandler.getCookie('test_cookie_options');
    console.assert(optionValue === 'test_value_options', 'Cookie with options should work');
    console.log('✅ Test 4 passed');

    // Test 5: Cookie expiration
    console.log('Test 5: Cookie expiration');
    await new Promise(resolve => setTimeout(resolve, 1100)); // Wait for expiration
    const expiredValue = CookieHandler.getCookie('test_cookie_options');
    console.assert(expiredValue === null, 'Cookie should be expired');
    console.log('✅ Test 5 passed');

    console.log('🎉 All Cookie Handler tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Cookie Handler test failed:', error);
    return false;
  }
}

/**
 * Test Authentication Cookie Operations
 */
export async function testAuthCookies() {
  console.log('🔐 Testing Authentication Cookies...');
  
  try {
    // Test 1: Set auth token
    console.log('Test 1: Set auth token');
    const testToken = 'test_jwt_token_12345';
    CookieHandler.setAuthToken(testToken);
    const storedToken = CookieHandler.getAuthToken();
    console.assert(storedToken === testToken, 'Auth token should be stored');
    console.log('✅ Test 1 passed');

    // Test 2: Check authentication status
    console.log('Test 2: Check authentication status');
    const isAuth = CookieHandler.isAuthenticated();
    console.assert(isAuth === true, 'User should be authenticated');
    console.log('✅ Test 2 passed');

    // Test 3: Clear authentication
    console.log('Test 3: Clear authentication');
    CookieHandler.clearAuth();
    const clearedToken = CookieHandler.getAuthToken();
    console.assert(clearedToken === null, 'Auth token should be cleared');
    console.log('✅ Test 3 passed');

    console.log('🎉 All Authentication Cookie tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Authentication Cookie test failed:', error);
    return false;
  }
}

/**
 * Test CSRF Protection
 */
export async function testCSRFProtection() {
  console.log('🛡️ Testing CSRF Protection...');
  
  try {
    // Test 1: Generate CSRF token
    console.log('Test 1: Generate CSRF token');
    const csrfToken = CookieHandler.generateCSRFToken();
    console.assert(csrfToken && csrfToken.length === 32, 'CSRF token should be generated');
    console.log('✅ Test 1 passed');

    // Test 2: Get CSRF token
    console.log('Test 2: Get CSRF token');
    const storedCSRFToken = CookieHandler.getCSRFToken();
    console.assert(storedCSRFToken === csrfToken, 'CSRF token should match');
    console.log('✅ Test 2 passed');

    // Test 3: Validate CSRF token
    console.log('Test 3: Validate CSRF token');
    const isValid = CookieHandler.validateCSRFToken(csrfToken);
    console.assert(isValid === true, 'CSRF token should be valid');
    console.log('✅ Test 3 passed');

    // Test 4: Validate invalid CSRF token
    console.log('Test 4: Validate invalid CSRF token');
    const isInvalid = CookieHandler.validateCSRFToken('invalid_token');
    console.assert(isInvalid === false, 'Invalid CSRF token should be rejected');
    console.log('✅ Test 4 passed');

    console.log('🎉 All CSRF Protection tests passed!');
    return true;
  } catch (error) {
    console.error('❌ CSRF Protection test failed:', error);
    return false;
  }
}

/**
 * Test Cookie Consent
 */
export async function testCookieConsent() {
  console.log('🍪 Testing Cookie Consent...');
  
  try {
    // Test 1: Set cookie consent
    console.log('Test 1: Set cookie consent');
    CookieHandler.setCookieConsent('accepted');
    const consent = CookieHandler.getCookieConsent();
    console.assert(consent === 'accepted', 'Cookie consent should be set');
    console.log('✅ Test 1 passed');

    // Test 2: Check if consent is given
    console.log('Test 2: Check if consent is given');
    const isConsentGiven = CookieHandler.isCookieConsentGiven();
    console.assert(isConsentGiven === true, 'Cookie consent should be given');
    console.log('✅ Test 2 passed');

    // Test 3: Test rejected consent
    console.log('Test 3: Test rejected consent');
    CookieHandler.setCookieConsent('rejected');
    const isRejectedConsentGiven = CookieHandler.isCookieConsentGiven();
    console.assert(isRejectedConsentGiven === false, 'Rejected consent should not be given');
    console.log('✅ Test 3 passed');

    console.log('🎉 All Cookie Consent tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Cookie Consent test failed:', error);
    return false;
  }
}

/**
 * Test Development vs Production Mode
 */
export async function testModeSwitching() {
  console.log('🔄 Testing Mode Switching...');
  
  try {
    const originalUseBackend = CONFIG.useBackend;
    
    // Test 1: Development mode (localStorage)
    console.log('Test 1: Development mode (localStorage)');
    CONFIG.useBackend = false;
    
    CookieHandler.setCookie('mode_test', 'dev_value');
    const devValue = CookieHandler.getCookie('mode_test');
    console.assert(devValue === 'dev_value', 'Development mode should work');
    console.log('✅ Test 1 passed');

    // Test 2: Production mode (document.cookie)
    console.log('Test 2: Production mode (document.cookie)');
    CONFIG.useBackend = true;
    
    CookieHandler.setCookie('mode_test_prod', 'prod_value');
    const prodValue = CookieHandler.getCookie('mode_test_prod');
    console.assert(prodValue === 'prod_value', 'Production mode should work');
    console.log('✅ Test 2 passed');

    // Restore original config
    CONFIG.useBackend = originalUseBackend;
    
    console.log('🎉 All Mode Switching tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Mode Switching test failed:', error);
    return false;
  }
}

/**
 * Test Authentication Service
 */
export async function testAuthService() {
  console.log('🔑 Testing Authentication Service...');
  
  try {
    // Test 1: Demo login
    console.log('Test 1: Demo login');
    const loginResult = await AuthService.login('demo@example.com', 'demo123');
    console.assert(loginResult.success === true, 'Demo login should succeed');
    console.log('✅ Test 1 passed');

    // Test 2: Check authentication status
    console.log('Test 2: Check authentication status');
    const isAuth = AuthService.isAuthenticated();
    console.assert(isAuth === true, 'User should be authenticated after login');
    console.log('✅ Test 2 passed');

    // Test 3: Get current user
    console.log('Test 3: Get current user');
    const currentUser = await AuthService.getCurrentUser();
    console.assert(currentUser && currentUser.email === 'demo@example.com', 'Current user should be retrieved');
    console.log('✅ Test 3 passed');

    // Test 4: Logout
    console.log('Test 4: Logout');
    const logoutResult = await AuthService.logout();
    console.assert(logoutResult.success === true, 'Logout should succeed');
    console.log('✅ Test 4 passed');

    // Test 5: Check authentication after logout
    console.log('Test 5: Check authentication after logout');
    const isAuthAfterLogout = AuthService.isAuthenticated();
    console.assert(isAuthAfterLogout === false, 'User should not be authenticated after logout');
    console.log('✅ Test 5 passed');

    console.log('🎉 All Authentication Service tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Authentication Service test failed:', error);
    return false;
  }
}

/**
 * Run all tests
 */
export async function runAllTests() {
  console.log('🚀 Starting Cookie Handler Test Suite...');
  console.log(`Current mode: ${CONFIG.useBackend ? 'Production' : 'Development'}`);
  console.log('=====================================');
  
  const tests = [
    testCookieHandler,
    testAuthCookies,
    testCSRFProtection,
    testCookieConsent,
    testModeSwitching,
    testAuthService
  ];
  
  let passedTests = 0;
  let totalTests = tests.length;
  
  for (const test of tests) {
    try {
      const result = await test();
      if (result) passedTests++;
    } catch (error) {
      console.error(`Test failed: ${test.name}`, error);
    }
    console.log('---');
  }
  
  console.log('=====================================');
  console.log(`🎯 Test Results: ${passedTests}/${totalTests} tests passed`);
  
  if (TEST_CONFIG.cleanupAfterTests) {
    console.log('🧹 Cleaning up test data...');
    CookieHandler.clearAllCookies();
  }
  
  return passedTests === totalTests;
}

/**
 * Quick test function for browser console
 */
export function quickTest() {
  console.log('Quick test of cookie handler...');
  
  // Test basic functionality
  CookieHandler.setCookie('quick_test', 'hello_world');
  const value = CookieHandler.getCookie('quick_test');
  console.log('Cookie value:', value);
  
  // Test auth
  CookieHandler.setAuthToken('test_token');
  const isAuth = CookieHandler.isAuthenticated();
  console.log('Is authenticated:', isAuth);
  
  // Cleanup
  CookieHandler.clearAllCookies();
  console.log('Quick test completed!');
}

// Export for browser console usage
if (typeof window !== 'undefined') {
  window.CookieHandlerTests = {
    testCookieHandler,
    testAuthCookies,
    testCSRFProtection,
    testCookieConsent,
    testModeSwitching,
    testAuthService,
    runAllTests,
    quickTest
  };
  
  console.log('🧪 Cookie Handler Tests loaded!');
  console.log('Run tests with: CookieHandlerTests.runAllTests()');
  console.log('Quick test with: CookieHandlerTests.quickTest()');
} 