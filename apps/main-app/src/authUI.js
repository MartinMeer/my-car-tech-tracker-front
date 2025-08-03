import { AuthService } from './authService.js';

/**
 * Authentication UI Handler
 * Handles login and registration forms
 */

export const AuthUI = {
  /**
   * Initialize login page
   */
  initializeLogin() {
    const loginForm = document.querySelector('.auth-form');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      
      if (!email || !password) {
        alert('Пожалуйста, заполните все поля');
        return;
      }

      try {
        // Show loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Вход...';
        submitBtn.disabled = true;

        const result = await AuthService.login(email, password);
        
        if (result.success) {
          alert(result.message);
          // Redirect to main app
          window.location.href = '../index.html';
        }
      } catch (error) {
        alert('Ошибка входа: ' + error.message);
      } finally {
        // Restore button state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  },

  /**
   * Initialize registration page
   */
  initializeRegister() {
    const registerForm = document.querySelector('.auth-form');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;
      const confirmPassword = document.getElementById('register-confirm-password').value;
      const name = document.getElementById('register-name')?.value || '';
      
      // Validation
      if (!email || !password || !confirmPassword) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
      }

      if (password !== confirmPassword) {
        alert('Пароли не совпадают');
        return;
      }

      if (password.length < 6) {
        alert('Пароль должен содержать минимум 6 символов');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Пожалуйста, введите корректный email');
        return;
      }

      try {
        // Show loading state
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Регистрация...';
        submitBtn.disabled = true;

        const userData = {
          email,
          password,
          name: name || email
        };

        const result = await AuthService.register(userData);
        
        if (result.success) {
          alert(result.message + '\nТеперь вы можете войти в систему');
          // Redirect to login page
          window.location.href = 'login.html';
        }
      } catch (error) {
        alert('Ошибка регистрации: ' + error.message);
      } finally {
        // Restore button state
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  },

  /**
   * Initialize demo mode for development
   */
  initializeDemoMode() {
    // Add demo login button for development
    if (window.location.pathname.includes('login.html')) {
      const demoBtn = document.createElement('button');
      demoBtn.type = 'button';
      demoBtn.className = 'demo-btn';
      demoBtn.textContent = 'Demo Login';
      demoBtn.style.cssText = `
        background: #27ae60;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        margin-top: 10px;
        cursor: pointer;
        width: 100%;
      `;
      
      demoBtn.addEventListener('click', async function() {
        try {
          const result = await AuthService.login('demo@example.com', 'demo123');
          if (result.success) {
            alert('Demo login successful!');
            window.location.href = '../index.html';
          }
        } catch (error) {
          alert('Demo login failed: ' + error.message);
        }
      });

      const form = document.querySelector('.auth-form');
      if (form) {
        form.appendChild(demoBtn);
      }
    }
  }
};

export default AuthUI; 