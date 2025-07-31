/**
 * User Account UI Management
 * Handles user account page functionality including profile updates
 */

import { AuthService } from './authService.js';

export const UserAccountUI = {
  /**
   * Initialize user account page
   */
  async init() {
    await this.loadUserData();
    this.setupEventListeners();
    this.setupImageUpload();
  },

  /**
   * Load current user data and populate form
   */
  async loadUserData() {
    try {
      const user = await AuthService.getCurrentUser();
      if (!user) {
        window.location.href = 'auth/login.html';
        return;
      }

      // Set user image
      const userImage = document.getElementById('userImage');
      if (user.profileImage) {
        userImage.src = user.profileImage;
      }

      // Set user name
      document.getElementById('userName').textContent = user.name || 'Пользователь';
      document.getElementById('displayName').value = user.name || '';

      // Set user role
      const roleSelect = document.getElementById('userRoleSelect');
      const roleText = document.getElementById('userRole');
      
      const roleLabels = {
        'fleet_manager': 'Fleet Manager',
        'technician': 'Technician', 
        'driver': 'Driver'
      };

      roleSelect.value = user.role || 'driver';
      roleText.textContent = roleLabels[user.role] || 'Driver';

    } catch (error) {
      this.showAlert('Ошибка загрузки данных пользователя', 'error');
      console.error('Error loading user data:', error);
    }
  },

  /**
   * Setup form event listeners
   */
  setupEventListeners() {
    const form = document.getElementById('userAccountForm');
    const inputs = form.querySelectorAll('input, select');
    
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        this.hasChanges = true;
        this.updateSaveButton();
      });
      
      input.addEventListener('input', () => {
        this.hasChanges = true;
        this.updateSaveButton();
      });
    });

    form.addEventListener('submit', (e) => this.handleFormSubmit(e));
  },

  /**
   * Setup image upload functionality
   */
  setupImageUpload() {
    const imageInput = document.getElementById('imageInput');
    imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
  },

  /**
   * Handle image upload
   */
  async handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.showAlert('Пожалуйста, выберите изображение', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      this.showAlert('Размер файла не должен превышать 5MB', 'error');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        document.getElementById('userImage').src = e.target.result;
        this.hasChanges = true;
        this.updateSaveButton();
      };
      reader.readAsDataURL(file);
    } catch (error) {
      this.showAlert('Ошибка при загрузке изображения', 'error');
    }
  },

  /**
   * Handle form submission
   */
  async handleFormSubmit(event) {
    event.preventDefault();
    
    const saveButton = document.getElementById('saveButton');
    saveButton.disabled = true;
    saveButton.textContent = 'Сохранение...';

    try {
      const userData = {
        name: document.getElementById('displayName').value.trim(),
        role: document.getElementById('userRoleSelect').value,
        profileImage: document.getElementById('userImage').src
      };

      // Password change validation
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (newPassword || confirmPassword) {
        if (!currentPassword) {
          this.showAlert('Введите текущий пароль', 'error');
          return;
        }
        if (newPassword !== confirmPassword) {
          this.showAlert('Новые пароли не совпадают', 'error');
          return;
        }
        if (newPassword.length < 6) {
          this.showAlert('Новый пароль должен содержать минимум 6 символов', 'error');
          return;
        }
        userData.currentPassword = currentPassword;
        userData.newPassword = newPassword;
      }

      await this.updateUserProfile(userData);
      
      this.showAlert('Данные успешно сохранены', 'success');
      this.hasChanges = false;
      this.updateSaveButton();
      
      // Clear password fields
      document.getElementById('currentPassword').value = '';
      document.getElementById('newPassword').value = '';
      document.getElementById('confirmPassword').value = '';

    } catch (error) {
      this.showAlert('Ошибка при сохранении данных', 'error');
      console.error('Error saving user data:', error);
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = 'Сохранить изменения';
    }
  },

  /**
   * Update user profile (mock implementation)
   */
  async updateUserProfile(userData) {
    // Mock implementation - in real app this would call the backend
    return new Promise((resolve) => {
      setTimeout(() => {
        // Update localStorage for demo
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const updatedUser = { ...currentUser, ...userData };
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        // Update display
        document.getElementById('userName').textContent = userData.name;
        document.getElementById('userRole').textContent = {
          'fleet_manager': 'Fleet Manager',
          'technician': 'Technician',
          'driver': 'Driver'
        }[userData.role];
        
        resolve();
      }, 1000); // Simulate network delay
    });
  },

  /**
   * Cancel changes
   */
  cancelChanges() {
    if (this.hasChanges) {
      if (confirm('У вас есть несохраненные изменения. Вы уверены, что хотите отменить?')) {
        this.resetForm();
      }
    } else {
      window.location.href = 'index.html';
    }
  },

  /**
   * Reset form to original values
   */
  resetForm() {
    // This would reset to original values
    // For now, just clear the form
    document.getElementById('displayName').value = '';
    document.getElementById('userRoleSelect').value = 'driver';
    document.getElementById('userImage').src = '/img/car-by-deault.png';
    
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    
    this.hasChanges = false;
    this.updateSaveButton();
  },

  /**
   * Update save button state
   */
  updateSaveButton() {
    const saveButton = document.getElementById('saveButton');
    if (saveButton) {
      saveButton.disabled = !this.hasChanges;
    }
  },

  /**
   * Show alert message
   */
  showAlert(message, type) {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    alertContainer.appendChild(alert);
    
    setTimeout(() => {
      alert.remove();
    }, 5000);
  },

  /**
   * Toggle password visibility
   */
  togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    
    if (input.type === 'password') {
      input.type = 'text';
      button.textContent = '🙈';
    } else {
      input.type = 'password';
      button.textContent = '👁️';
    }
  }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  UserAccountUI.init();
});

// Make togglePassword globally available
window.togglePassword = UserAccountUI.togglePassword.bind(UserAccountUI);
window.cancelChanges = UserAccountUI.cancelChanges.bind(UserAccountUI); 