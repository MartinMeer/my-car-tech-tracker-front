import { DataService } from './dataService.js';
import { showConfirmationDialog } from './dialogs.js';
import { CONFIG } from './config.js';

// Global variables for user alert
let currentAlertData = null;

// Initialize user alert functionality
export function initializeUserAlertUI() {
  console.log('User Alert UI initializing...');
  
  // Set up floating button (available on all pages)
  setupUserAlertButton();
  
  // Only set up form if we're on the user-alert page
  if (window.location.hash === '#user-alert') {
    setupUserAlertForm();
  }
  
  console.log('User Alert UI initialized successfully');
}

// Set up the floating user alert button
function setupUserAlertButton() {
  // Setup floating button
  const floatingAlertBtn = document.getElementById('floating-user-alert-btn');
  if (floatingAlertBtn) {
    floatingAlertBtn.addEventListener('click', function(e) {
      e.preventDefault();
      showUserAlertPopup();
    });
  }
}

// Show the user alert popup for car selection and date
async function showUserAlertPopup() {
  try {
    const cars = await DataService.getCars();
    
    if (!cars || cars.length === 0) {
      alert('Сначала добавьте автомобиль в разделе "Мои машины"');
      return;
    }
    
    // Get current date
    const today = new Date();
    const currentDate = today.toLocaleDateString('ru-RU');
    
    let popupHtml = `
      <div class="user-alert-popup">
        <div class="popup-header">
          <h2>Сообщить о проблеме</h2>
          <button class="close-btn" onclick="closeUserAlertPopup()">&times;</button>
        </div>
        <div class="popup-body">
          <div class="form-section">
            <h3>Выберите автомобиль</h3>
            <div class="car-selection-list">
    `;
    
    cars.forEach(car => {
      const carName = car.nickname || `${car.brand || ''} ${car.model || ''}`.trim() || car.name;
      popupHtml += `
        <div class="car-selection-item" onclick="selectCarForAlert('${car.id}')">
          <div class="car-selection-img">
            ${car.img && car.img.startsWith('data:image/') ? 
              `<img src="${car.img}" alt="${carName}">` : 
              `<span>🚗</span>`
            }
          </div>
          <div class="car-selection-info">
            <div class="car-selection-name">${carName}</div>
            <div class="car-selection-year">${car.year ? `Год: ${car.year}` : ''}</div>
            <div class="car-selection-mileage">${car.mileage ? `Пробег: ${car.mileage} км` : ''}</div>
          </div>
        </div>
      `;
    });
    
    popupHtml += `
            </div>
          </div>
          
          <div class="form-section">
            <h3>Дата обнаружения проблемы</h3>
            <div class="input-group">
              <label for="alert-date-input">Дата:</label>
              <input type="text" id="alert-date-input" value="${currentDate}" 
                     placeholder="дд.мм.гггг" required 
                     pattern="\\d{2}\\.\\d{2}\\.\\d{4}">
            </div>
          </div>
          
          <div class="form-section">
            <h3>Текущий пробег</h3>
            <div class="input-group">
              <label for="alert-mileage-input">
                <span class="icon">🛣️</span>
                Пробег (км):
              </label>
              <input type="number" id="alert-mileage-input" 
                     placeholder="Введите текущий пробег" 
                     min="0" required>
            </div>
          </div>
          
          <div class="popup-footer">
            <button onclick="confirmUserAlert()" class="btn-primary">Продолжить</button>
            <button onclick="closeUserAlertPopup()" class="btn-secondary">Отмена</button>
          </div>
        </div>
      </div>
    `;
    
    // Create and show popup
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.id = 'user-alert-overlay';
    overlay.innerHTML = popupHtml;
    
    document.body.appendChild(overlay);
    
    // Make functions globally available
    window.closeUserAlertPopup = closeUserAlertPopup;
    window.selectCarForAlert = selectCarForAlert;
    window.confirmUserAlert = confirmUserAlert;
    
    // Initialize current alert data
    currentAlertData = {
      carId: null,
      date: currentDate,
      mileage: null
    };
    
  } catch (error) {
    console.error('Error showing user alert popup:', error);
    alert('Ошибка загрузки данных: ' + error.message);
  }
}

// Close user alert popup
function closeUserAlertPopup() {
  const overlay = document.getElementById('user-alert-overlay');
  if (overlay) {
    document.body.removeChild(overlay);
  }
  currentAlertData = null;
}

// Select car for alert
async function selectCarForAlert(carId) {
  try {
    // Remove previous selection
    document.querySelectorAll('.car-selection-item').forEach(item => {
      item.classList.remove('selected');
    });
    
    // Add selection to clicked item
    event.target.closest('.car-selection-item').classList.add('selected');
    
    // Get car details
    const cars = await DataService.getCars();
    const car = cars.find(c => c.id == carId);
    
    if (car) {
      currentAlertData.carId = carId;
      currentAlertData.mileage = car.mileage;
      
      // Update date input if it's empty
      const dateInput = document.getElementById('alert-date-input');
      if (dateInput && !dateInput.value) {
        const today = new Date();
        dateInput.value = today.toLocaleDateString('ru-RU');
        currentAlertData.date = dateInput.value;
      }
      
      // Update mileage input with car's current mileage
      const mileageInput = document.getElementById('alert-mileage-input');
      if (mileageInput) {
        mileageInput.value = car.mileage || '';
        currentAlertData.mileage = car.mileage || null;
      }
    }
    
  } catch (error) {
    console.error('Error selecting car for alert:', error);
  }
}

// Confirm user alert and navigate to user-alert page
async function confirmUserAlert() {
  try {
    const dateInput = document.getElementById('alert-date-input');
    const mileageInput = document.getElementById('alert-mileage-input');
    const date = dateInput ? dateInput.value : '';
    const mileage = mileageInput ? mileageInput.value : '';
    
    // Validate date format
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(date)) {
      alert('Пожалуйста, введите корректную дату в формате дд.мм.гггг');
      dateInput.style.borderColor = '#dc3545';
      return;
    }
    
    // Validate mileage
    if (!mileage || isNaN(mileage) || Number(mileage) < 0) {
      alert('Пожалуйста, введите корректный пробег');
      mileageInput.style.borderColor = '#dc3545';
      return;
    }
    
    if (!currentAlertData.carId) {
      alert('Пожалуйста, выберите автомобиль');
      return;
    }
    
    // Update current alert data
    currentAlertData.date = date;
    currentAlertData.mileage = Number(mileage);
    
    // Store alert data in session storage for the user-alert page
    sessionStorage.setItem('userAlertData', JSON.stringify(currentAlertData));
    
    // Close popup and navigate to user-alert page
    closeUserAlertPopup();
    window.location.hash = '#user-alert';
    
  } catch (error) {
    console.error('Error confirming user alert:', error);
    alert('Ошибка: ' + error.message);
  }
}

// Set up user alert form
export function setupUserAlertForm() {
  const form = document.getElementById('user-alert-form');
  if (!form) return;
  
  // Load alert data from session storage
  loadAlertData();
  
  // Set up subsystem select change handler
  const subsystemSelect = document.getElementById('subsystem-select');
  if (subsystemSelect) {
    subsystemSelect.addEventListener('change', handleSubsystemChange);
  }
  
  // Set up character counter for description
  const descriptionTextarea = document.getElementById('problem-description');
  if (descriptionTextarea) {
    descriptionTextarea.addEventListener('input', updateCharCounter);
  }
  
  // Handle form submission
  form.addEventListener('submit', handleFormSubmission);
}

// Load alert data and populate the form
async function loadAlertData() {
  try {
    const alertDataStr = sessionStorage.getItem('userAlertData');
    if (!alertDataStr) {
      // No alert data, redirect to main page
      window.location.hash = '#';
      return;
    }
    
    const alertData = JSON.parse(alertDataStr);
    const cars = await DataService.getCars();
    const car = cars.find(c => c.id == alertData.carId);
    
    if (!car) {
      alert('Автомобиль не найден');
      window.location.hash = '#';
      return;
    }
    
    // Populate alert info
    const carName = car.nickname || `${car.brand || ''} ${car.model || ''}`.trim() || car.name;
    document.getElementById('alert-car-name').textContent = carName;
    document.getElementById('alert-date').textContent = alertData.date;
    document.getElementById('alert-mileage').textContent = alertData.mileage ? `${alertData.mileage} км` : 'Не указан';
    
    // Store current alert data
    currentAlertData = alertData;
    
  } catch (error) {
    console.error('Error loading alert data:', error);
    alert('Ошибка загрузки данных: ' + error.message);
    window.location.hash = '#';
  }
}

// Handle subsystem selection change
function handleSubsystemChange(event) {
  const selectedValue = event.target.value;
  const customGroup = document.getElementById('custom-subsystem-group');
  const customInput = document.getElementById('custom-subsystem');
  
  if (selectedValue === 'custom') {
    customGroup.style.display = 'block';
    customInput.required = true;
  } else {
    customGroup.style.display = 'none';
    customInput.required = false;
    customInput.value = '';
  }
}

// Update character counter
function updateCharCounter(event) {
  const textarea = event.target;
  const charCount = document.getElementById('char-count');
  const currentLength = textarea.value.length;
  const maxLength = textarea.maxLength;
  
  charCount.textContent = currentLength;
  
  // Change color when approaching limit
  if (currentLength > maxLength * 0.9) {
    charCount.style.color = '#dc3545';
  } else if (currentLength > maxLength * 0.7) {
    charCount.style.color = '#ffc107';
  } else {
    charCount.style.color = '#6c757d';
  }
}

// Handle form submission
async function handleFormSubmission(event) {
  event.preventDefault();
  
  try {
    const subsystemSelect = document.getElementById('subsystem-select');
    const customSubsystem = document.getElementById('custom-subsystem');
    const problemDescription = document.getElementById('problem-description');
    
    // Validate required fields
    if (!subsystemSelect.value) {
      alert('Пожалуйста, выберите систему');
      subsystemSelect.focus();
      return;
    }
    
    if (subsystemSelect.value === 'custom' && !customSubsystem.value.trim()) {
      alert('Пожалуйста, укажите место неисправности');
      customSubsystem.focus();
      return;
    }
    
    if (!problemDescription.value.trim()) {
      alert('Пожалуйста, опишите проблему');
      problemDescription.focus();
      return;
    }
    
    // Create alert data
    const alertData = {
      id: Date.now(), // Simple ID generation
      carId: currentAlertData.carId,
      date: currentAlertData.date,
      mileage: currentAlertData.mileage,
      subsystem: subsystemSelect.value === 'custom' ? customSubsystem.value.trim() : subsystemSelect.options[subsystemSelect.selectedIndex].text,
      subsystemType: subsystemSelect.value,
      description: problemDescription.value.trim(),
      createdAt: new Date().toISOString()
    };
    
    // Save alert data
    await saveUserAlert(alertData);
    
    // Clear session storage
    sessionStorage.removeItem('userAlertData');
    
    // Show success message and redirect
    alert('Проблема успешно записана!');
    window.location.hash = '#';
    
  } catch (error) {
    console.error('Error saving user alert:', error);
    alert('Ошибка сохранения: ' + error.message);
  }
}

// Save user alert to storage
async function saveUserAlert(alertData) {
  try {
    let alerts = [];
    
    if (CONFIG.useBackend) {
      // TODO: Replace with actual backend API call
      // const response = await fetch(`${CONFIG.apiUrl}/user-alerts`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(alertData)
      // });
      // if (!response.ok) throw new Error('Ошибка сохранения на сервере');
      throw new Error('Backend API not implemented yet');
    } else {
      // Save to localStorage
      const existingAlerts = localStorage.getItem('userAlerts');
      if (existingAlerts) {
        alerts = JSON.parse(existingAlerts);
      }
      
      alerts.push(alertData);
      localStorage.setItem('userAlerts', JSON.stringify(alerts));
    }
    
  } catch (error) {
    console.error('Error saving user alert:', error);
    throw error;
  }
}

// Get user alerts for a specific car
export async function getUserAlerts(carId = null) {
  try {
    if (CONFIG.useBackend) {
      // TODO: Replace with actual backend API call
      // const url = carId ? `${CONFIG.apiUrl}/user-alerts?carId=${carId}` : `${CONFIG.apiUrl}/user-alerts`;
      // const response = await fetch(url);
      // return await response.json();
      throw new Error('Backend API not implemented yet');
    } else {
      const existingAlerts = localStorage.getItem('userAlerts');
      if (!existingAlerts) return [];
      
      const alerts = JSON.parse(existingAlerts);
      return carId ? alerts.filter(alert => alert.carId == carId) : alerts;
    }
  } catch (error) {
    console.error('Error getting user alerts:', error);
    return [];
  }
}

// Delete user alert
export async function deleteUserAlert(alertId) {
  try {
    if (CONFIG.useBackend) {
      // TODO: Replace with actual backend API call
      // await fetch(`${CONFIG.apiUrl}/user-alerts/${alertId}`, { method: 'DELETE' });
      throw new Error('Backend API not implemented yet');
    } else {
      const existingAlerts = localStorage.getItem('userAlerts');
      if (!existingAlerts) return;
      
      const alerts = JSON.parse(existingAlerts);
      const updatedAlerts = alerts.filter(alert => alert.id != alertId);
      localStorage.setItem('userAlerts', JSON.stringify(updatedAlerts));
    }
  } catch (error) {
    console.error('Error deleting user alert:', error);
    throw error;
  }
} 