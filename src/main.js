import { CONFIG } from './config.js';
import { DataService } from './dataService.js';
import { pageMap, loadPage } from './router.js';
import { showConfirmationDialog } from './dialogs.js';
import { initializeMyCarsUI, initializeAddCarUI, updateCarSelectionUI, removeCarFromBackend } from './carsUI.js';
import {
  initializeCarOverviewUI,
  renderMaintenHistory,
  renderServiceHistory,
  openMaintPopup,
  closeMaintPopup,
  calculateMaintTotal
} from './maintenanceUI.js';
import { initializeUserAlertUI, setupUserAlertForm, initializeAlertListUI } from './userAlertUI.js';
import { initializeMileageHistoryUI } from './mileageHistoryUI.js';
import { ReglamentUI } from './reglamentUI.js';
import { fleetUI } from './fleetUI.js';
import { MaintenancePlanUI } from './maintenancePlanUI.js';

import {
  renderRepairHistory,
  openRepairPopup,
  closeRepairPopup,
  openSparePopup,
  closeSparePopup,
  addSpare,
  calculateRepairTotal
} from './repairUI.js';
import { 
  initializeServiceRecord, 
  addMaintenanceToRecord, 
  addRepairToRecord, 
  removeSubRecord, 
  editSubRecord 
} from './serviceRecordManager.js';
import { CookieHandler } from './cookieHandler.js';
import { AuthService } from './authService.js';

// Main content element
const mainContent = document.getElementById('main-content');

// Global variables for service card functionality
window.currentOperation = null;
window.sparesList = [];
window.spareCounter = 1;

// Make functions available globally for HTML onclick handlers
window.openMaintPopup = openMaintPopup;
window.closeMaintPopup = closeMaintPopup;
window.calculateMaintTotal = calculateMaintTotal;
window.openRepairPopup = openRepairPopup;
window.closeRepairPopup = closeRepairPopup;
window.openSparePopup = openSparePopup;
window.closeSparePopup = closeSparePopup;
window.addSpare = addSpare;
window.calculateRepairTotal = calculateRepairTotal;
window.removeCarFromBackend = removeCarFromBackend;
window.showConfirmationDialog = showConfirmationDialog;
window.handleProblemsButtonClick = handleProblemsButtonClick;
window.handleServiceButtonClick = handleServiceButtonClick;

// Service Record Manager functions
window.addMaintenanceToRecord = addMaintenanceToRecord;
window.addRepairToRecord = addRepairToRecord;
window.removeSubRecord = removeSubRecord;
window.editSubRecord = editSubRecord;

// Mileage Handler debug function (for testing)
window.debugMileage = async () => {
  const { mileageHandler } = await import('./mileageHandler.js');
  return await mileageHandler.debugMileageData();
};

// Old save and remove functions have been moved to serviceRecordManager.js
// with new draft functionality

// Add missing functions that are referenced in HTML
// Note: saveMaintenance and saveRepair functions are now handled by the service record system
// and are no longer needed as standalone functions

// Handle problems button click - new flow
async function handleProblemsButtonClick() {
  console.log('🚨 Problems button clicked - showing car selection popup');
  await showProblemsCarSelectionPopup();
}

// Show car selection popup for problems (modified from service record)
async function showProblemsCarSelectionPopup() {
  console.log('🚨 Problems: Showing car selection popup...');
  
  try {
    const cars = await DataService.getCars();
    console.log('🚨 Problems: Found cars:', cars.length);
    
    if (cars.length === 0) {
      console.log('🚨 Problems: No cars found, showing error message');
      showErrorMessage('Сначала добавьте автомобиль в разделе "Мои автомобили"');
      return;
    }
    
    // Create popup HTML - only car selection, no date/mileage
    const popupHTML = `
      <div class="popup-overlay" id="problems-car-selection-popup" style="display: flex;">
        <div class="popup-content">
          <div class="popup-header">
            <h2>
              <span class="icon">🚗</span>
              Выберите автомобиль
            </h2>
          </div>
          
          <div class="popup-body">
            <div class="car-selection-list">
              ${cars.map(car => {
                const displayName = car.name || `${car.brand || ''} ${car.model || ''}`.trim();
                const nickname = car.nickname ? ` "${car.nickname}"` : '';
                const fullName = displayName + nickname;
                
                return `
                  <div class="car-selection-item" data-car-id="${car.id}">
                    <div class="car-selection-img">
                      ${car.img && car.img.startsWith('data:image/') 
                        ? `<img src="${car.img}" alt="car image" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">`
                        : `<span style="font-size:3rem;">${car.img || '🚗'}</span>`
                      }
                    </div>
                    <div class="car-selection-info">
                      <div class="car-selection-name">${fullName}</div>
                      ${car.year ? `<div class="car-selection-year">${car.year} год</div>` : ''}
                      ${car.mileage ? `<div class="car-selection-mileage">Пробег: ${car.mileage} км</div>` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          
          <div class="popup-footer">
            <button class="btn btn-secondary" onclick="closeProblemsCarSelectionPopup()">Отмена</button>
          </div>
        </div>
      </div>
    `;
    
    // Add popup to DOM
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    
    // Add event listeners for car selection
    const carItems = document.querySelectorAll('.car-selection-item');
    console.log('Found car items:', carItems.length);
    
    carItems.forEach(item => {
      item.addEventListener('click', function() {
        console.log('Car item clicked:', this.getAttribute('data-car-id'));
        const carId = this.getAttribute('data-car-id');
        
        // Remove current popup
        closeProblemsCarSelectionPopup();
        
        // Show date/mileage popup for selected car
        showProblemsDateMileagePopup(carId);
      });
    });
    
    // Add close functionality
    window.closeProblemsCarSelectionPopup = closeProblemsCarSelectionPopup;
    
  } catch (error) {
    console.error('Error showing problems car selection popup:', error);
    showErrorMessage('Ошибка загрузки списка автомобилей');
  }
}

// Show date and mileage input popup for problems
async function showProblemsDateMileagePopup(carId) {
  console.log('🚨 Problems: Showing date/mileage popup for car:', carId);
  
  try {
    const cars = await DataService.getCars();
    const selectedCar = cars.find(car => car.id == carId);
    
    if (!selectedCar) {
      showErrorMessage('Выбранный автомобиль не найден');
      return;
    }
    
    // Get current date in dd.mm.yyyy format
    const today = new Date();
    const currentDate = today.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    // Get current mileage
    const currentMileage = selectedCar.mileage || 0;
    
    // Create popup HTML
    const popupHTML = `
      <div class="popup-overlay" id="problems-date-mileage-popup" style="display: flex;">
        <div class="popup-content">
          <div class="popup-header">
            <h2>
              <span class="icon">📅</span>
              Дата и пробег
            </h2>
          </div>
          
          <div class="popup-body">
            <div class="date-mileage-inputs">
              <div class="input-group">
                <label for="problems-date-input">Дата:</label>
                <input type="text" id="problems-date-input" value="${currentDate}" placeholder="дд.мм.гггг">
              </div>
              <div class="input-group">
                <label for="problems-mileage-input">Пробег (км):</label>
                <input type="number" id="problems-mileage-input" value="${currentMileage}" placeholder="0">
              </div>
            </div>
          </div>
          
          <div class="popup-footer">
            <button class="btn btn-secondary" onclick="closeProblemsDateMileagePopup()">Отмена</button>
            <button class="btn btn-primary" onclick="saveProblemsDateMileage('${carId}')">Сохранить</button>
          </div>
        </div>
      </div>
    `;
    
    // Add popup to DOM
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    
    // Add close functionality
    window.closeProblemsDateMileagePopup = closeProblemsDateMileagePopup;
    window.saveProblemsDateMileage = saveProblemsDateMileage;
    
  } catch (error) {
    console.error('Error showing problems date/mileage popup:', error);
    showErrorMessage('Ошибка создания формы даты и пробега');
  }
}

// Close problems car selection popup
function closeProblemsCarSelectionPopup() {
  const popup = document.getElementById('problems-car-selection-popup');
  if (popup) {
    popup.remove();
  }
}

// Close problems date mileage popup
function closeProblemsDateMileagePopup() {
  const popup = document.getElementById('problems-date-mileage-popup');
  if (popup) {
    popup.remove();
  }
}

// Save problems date and mileage, then open user-alert page
async function saveProblemsDateMileage(carId) {
  try {
    const dateInput = document.getElementById('problems-date-input');
    const mileageInput = document.getElementById('problems-mileage-input');
    
    if (!dateInput || !mileageInput) {
      showErrorMessage('Ошибка получения данных формы');
      return;
    }
    
    const date = dateInput.value.trim();
    const mileage = parseInt(mileageInput.value) || 0;
    
    // Validate date format (dd.mm.yyyy)
    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!dateRegex.test(date)) {
      showErrorMessage('Неверный формат даты. Используйте формат дд.мм.гггг');
      return;
    }
    
    // Close the popup
    closeProblemsDateMileagePopup();
    
    // Store the data temporarily for user-alert page
    sessionStorage.setItem('problemsCarId', carId);
    sessionStorage.setItem('problemsDate', date);
    sessionStorage.setItem('problemsMileage', mileage.toString());
    
    // Navigate to user-alert page
    window.location.hash = '#user-alert';
    
  } catch (error) {
    console.error('Error saving problems date/mileage:', error);
    showErrorMessage('Ошибка сохранения данных');
  }
}

// Show error message (reuse existing function or create simple one)
function showErrorMessage(message) {
  alert(message); // Simple implementation - can be enhanced with better UI
}

// Handle service button click - new flow
async function handleServiceButtonClick() {
  console.log('🔧 Service button clicked - showing car selection popup');
  await showServiceCarSelectionPopup();
}

// Show car selection popup for service (modified from problems)
async function showServiceCarSelectionPopup() {
  console.log('🔧 Service: Showing car selection popup...');
  
  try {
    const cars = await DataService.getCars();
    console.log('🔧 Service: Found cars:', cars.length);
    
    if (cars.length === 0) {
      console.log('🔧 Service: No cars found, showing error message');
      showErrorMessage('Сначала добавьте автомобиль в разделе "Мои автомобили"');
      return;
    }
    
    // Create popup HTML - only car selection, no date/mileage
    const popupHTML = `
      <div class="popup-overlay" id="service-car-selection-popup" style="display: flex;">
        <div class="popup-content">
          <div class="popup-header">
            <h2>
              <span class="icon">🚗</span>
              Выберите автомобиль для обслуживания
            </h2>
          </div>
          
          <div class="popup-body">
            <div class="car-selection-list">
              ${cars.map(car => {
                const displayName = car.name || `${car.brand || ''} ${car.model || ''}`.trim();
                const nickname = car.nickname ? ` "${car.nickname}"` : '';
                const fullName = displayName + nickname;
                
                return `
                  <div class="car-selection-item" data-car-id="${car.id}">
                    <div class="car-selection-img">
                      ${car.img && car.img.startsWith('data:image/') 
                        ? `<img src="${car.img}" alt="car image" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">`
                        : `<span style="font-size:3rem;">${car.img || '🚗'}</span>`
                      }
                    </div>
                    <div class="car-selection-info">
                      <div class="car-selection-name">${fullName}</div>
                      ${car.year ? `<div class="car-selection-year">${car.year} год</div>` : ''}
                      ${car.mileage ? `<div class="car-selection-mileage">Пробег: ${car.mileage} км</div>` : ''}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          
          <div class="popup-footer">
            <button class="btn btn-secondary" onclick="closeServiceCarSelectionPopup()">Отмена</button>
          </div>
        </div>
      </div>
    `;
    
    // Add popup to DOM
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    
    // Add event listeners for car selection
    const carItems = document.querySelectorAll('.car-selection-item');
    console.log('Found car items:', carItems.length);
    
    carItems.forEach(item => {
      item.addEventListener('click', function() {
        console.log('Car item clicked:', this.getAttribute('data-car-id'));
        const carId = this.getAttribute('data-car-id');
        
        // Remove current popup
        closeServiceCarSelectionPopup();
        
        // Show date/mileage popup for selected car
        showServiceDateMileagePopup(carId);
      });
    });
    
    // Add close functionality
    window.closeServiceCarSelectionPopup = closeServiceCarSelectionPopup;
    
  } catch (error) {
    console.error('Error showing service car selection popup:', error);
    showErrorMessage('Ошибка загрузки списка автомобилей');
  }
}

// Show date and mileage input popup for service
async function showServiceDateMileagePopup(carId) {
  console.log('🔧 Service: Showing date/mileage popup for car:', carId);
  
  try {
    const cars = await DataService.getCars();
    const selectedCar = cars.find(car => car.id == carId);
    
    if (!selectedCar) {
      showErrorMessage('Выбранный автомобиль не найден');
      return;
    }
    
    // Get current date in dd.mm.yyyy format
    const today = new Date();
    const currentDate = today.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    // Get current mileage
    const currentMileage = selectedCar.mileage || 0;
    
    // Create popup HTML
    const popupHTML = `
      <div class="popup-overlay" id="service-date-mileage-popup" style="display: flex;">
        <div class="popup-content">
          <div class="popup-header">
            <h2>
              <span class="icon">📅</span>
              Дата и пробег
            </h2>
          </div>
          
          <div class="popup-body">
            <div class="date-mileage-inputs">
              <div class="input-group">
                <label for="service-date-input">Дата:</label>
                <input type="text" id="service-date-input" value="${currentDate}" placeholder="дд.мм.гггг">
              </div>
              <div class="input-group">
                <label for="service-mileage-input">Пробег (км):</label>
                <input type="number" id="service-mileage-input" value="${currentMileage}" placeholder="0">
              </div>
            </div>
          </div>
          
          <div class="popup-footer">
            <button class="btn btn-secondary" onclick="closeServiceDateMileagePopup()">Отмена</button>
            <button class="btn btn-primary" onclick="saveServiceDateMileage('${carId}')">Сохранить</button>
          </div>
        </div>
      </div>
    `;
    
    // Add popup to DOM
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    
    // Add close functionality
    window.closeServiceDateMileagePopup = closeServiceDateMileagePopup;
    window.saveServiceDateMileage = saveServiceDateMileage;
    
  } catch (error) {
    console.error('Error showing service date/mileage popup:', error);
    showErrorMessage('Ошибка создания формы даты и пробега');
  }
}

// Close service car selection popup
function closeServiceCarSelectionPopup() {
  const popup = document.getElementById('service-car-selection-popup');
  if (popup) {
    popup.remove();
  }
}

// Close service date mileage popup
function closeServiceDateMileagePopup() {
  const popup = document.getElementById('service-date-mileage-popup');
  if (popup) {
    popup.remove();
  }
}

// Save service date and mileage, then open service-card page
async function saveServiceDateMileage(carId) {
  try {
    const dateInput = document.getElementById('service-date-input');
    const mileageInput = document.getElementById('service-mileage-input');
    
    if (!dateInput || !mileageInput) {
      showErrorMessage('Ошибка получения данных формы');
      return;
    }
    
    const date = dateInput.value.trim();
    const mileage = parseInt(mileageInput.value) || 0;
    
    // Validate date format (dd.mm.yyyy)
    const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!dateRegex.test(date)) {
      showErrorMessage('Неверный формат даты. Используйте формат дд.мм.гггг');
      return;
    }
    
    // Close the popup
    closeServiceDateMileagePopup();
    
    // Store the data temporarily for service-card page
    sessionStorage.setItem('serviceCarId', carId);
    sessionStorage.setItem('serviceDate', date);
    sessionStorage.setItem('serviceMileage', mileage.toString());
    
    // Navigate to service-card page
    window.location.hash = '#service-card';
    
  } catch (error) {
    console.error('Error saving service date/mileage:', error);
    showErrorMessage('Ошибка сохранения данных');
  }
}

// UI initialization stub (to be replaced with real logic)
function initializePageUI(page) {
  switch(page) {
    case 'my-cars':
      initializeMyCarsUI();
      break;
    case 'add-car':
      initializeAddCarUI();
      break;
    case 'my-car-overview':
      initializeCarOverviewUI();
      break;
    case 'service-card':
      initializeServiceRecord();
      break;
    case 'service-history':
      renderServiceHistory();
      break;
    case 'user-alert':
      // User alert UI is initialized globally, just set up the form
      setupUserAlertForm();
      break;
    case 'alert-list':
      // Initialize alert list UI
      initializeAlertListUI();
      break;
    case 'reglament':
      // Initialize reglament UI
      new ReglamentUI();
      break;
    case 'mainten-history':
      renderMaintenHistory();
      break;
    case 'repair-history':
      renderRepairHistory();
      break;
    case 'maintenance-plan':
      // Initialize maintenance plan UI
      new MaintenancePlanUI();
      break;
    case 'mileage-history':
      initializeMileageHistoryUI();
      break;
    case 'fleet':
      fleetUI.initialize();
      break;
    case '': // Root page
      fleetUI.initialize();
      break;

    // TODO: Add more cases for other modules
    default:
      break;
  }
}

// Initialize the application
async function initializeApp() {
  try {
    // Initialize authentication and cookie handling
    await AuthService.initialize();
    
    // Check authentication for protected pages
    await checkAuthentication();
    
    // Load initial page
    const hash = window.location.hash || '#';
    await loadPage(hash, mainContent, initializePageUI);
    
    // Initialize car selection UI
    updateCarSelectionUI();
    
    // Initialize user alert UI (floating button) - available on all pages
    initializeUserAlertUI();
    
    // Setup hash change listener
    window.addEventListener('hashchange', async () => {
      await loadPage(window.location.hash, mainContent, initializePageUI);
      
      // Update car selection UI after page change
      updateCarSelectionUI();
      
      // Hide car selection popup on navigation
      const carSelectMenu = document.getElementById('car-select-menu');
      if (carSelectMenu) {
        carSelectMenu.style.display = 'none';
      }
    });
    
    // Setup car image dropdown
    setupCarImageDropdown();
    
    // Setup authentication-related event listeners
    setupAuthEventListeners();
    
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

// Setup car image dropdown functionality
function setupCarImageDropdown() {
  const carImgDiv = document.getElementById('my-cars-img');
  const carSelectMenu = document.getElementById('car-select-menu');
  
  if (carImgDiv && carSelectMenu) {
    carImgDiv.onclick = function(e) {
      e.stopPropagation();
      carSelectMenu.style.display = carSelectMenu.style.display === 'block' ? 'none' : 'block';
    };
    
    document.addEventListener('click', function(e) {
      if (!carSelectMenu.contains(e.target) && e.target !== carImgDiv) {
        carSelectMenu.style.display = 'none';
      }
    });
  }
}

// Check authentication for protected pages
async function checkAuthentication() {
  const publicPages = [
    'cover.html',
    'login.html',
    'register.html',
    'contacts.html',
    'privacy.html'
  ];
  
  const currentPage = window.location.pathname.split('/').pop();
  const isPublic = publicPages.includes(currentPage);
  
  if (!isPublic) {
    // Check authentication using AuthService
    const isAuthServiceAuthenticated = AuthService.isAuthenticated();
    const hasDirectAuthToken = localStorage.getItem('auth_token');
    
    console.log('Auth check - AuthService:', isAuthServiceAuthenticated);
    console.log('Auth check - Direct token:', hasDirectAuthToken);
    
    if (!isAuthServiceAuthenticated && !hasDirectAuthToken) {
      console.log('User not authenticated, redirecting to cover page');
      window.location.href = 'cover.html';
      return;
    }
  }
}

// Setup authentication-related event listeners
function setupAuthEventListeners() {
  // Logout button
  const logoutBtn = document.querySelector('.logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function(e) {
      e.preventDefault();
      try {
        // Try AuthService logout first
        await AuthService.logout();
      } catch (error) {
        console.error('AuthService logout error:', error);
      }
      
      // Also clear direct localStorage auth tokens (for demo mode)
      localStorage.removeItem('auth_token');
      localStorage.removeItem('session_id');
      localStorage.removeItem('user_id');
      localStorage.removeItem('currentUser');
      
      // Clear all cookie-related localStorage items
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('cookie_')) {
          localStorage.removeItem(key);
        }
      });
      
      window.location.href = 'cover.html';
    });
  }

  // Cookie consent popup
  const cookiePopup = document.getElementById('cookie-popup');
  if (cookiePopup) {
    // Check if consent already given
    if (CookieHandler.isCookieConsentGiven()) {
      cookiePopup.style.display = 'none';
      return;
    }
    
    cookiePopup.style.display = 'flex';
    
    const acceptBtn = document.getElementById('cookie-accept');
    const rejectBtn = document.getElementById('cookie-reject');
    
    if (acceptBtn) {
      acceptBtn.onclick = function() {
        CookieHandler.setCookieConsent('accepted');
        cookiePopup.style.display = 'none';
      };
    }
    
    if (rejectBtn) {
      rejectBtn.onclick = function() {
        CookieHandler.setCookieConsent('rejected');
        cookiePopup.style.display = 'none';
      };
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp); 