import { DataService } from './dataService.js';
import { formatCarName } from './carNameFormatter.js';
import { showConfirmationDialog } from './dialogs.js';
import { CONFIG } from './config.js';

// Global variables for user alert
let currentAlertData = null;

// Initialize user alert UI
export function initializeUserAlertUI() {
  console.log('User alert UI initializing...');
  
  // Set up new alert button on alert-list page
  setupNewAlertButton();
  
  // Make showUserAlertPopup available globally for backward compatibility
  window.showUserAlertPopup = showUserAlertPopup;
  
  console.log('User alert UI initialized successfully');
}

// Set up the new alert button on alert-list page
function setupNewAlertButton() {
  // Setup new alert button
  const newAlertBtn = document.getElementById('new-alert-btn');
  if (newAlertBtn) {
    console.log('New alert button found and setting up event listener');
    newAlertBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('New alert button clicked!');
      showUserAlertPopup();
    });
  } else {
    console.log('New alert button not found!');
  }
}

// Set up the archive view button
function setupArchiveViewButton() {
  const viewArchiveBtn = document.getElementById('view-archive-btn');
  const backToAlertsBtn = document.getElementById('back-to-alerts-btn');
  
  if (viewArchiveBtn) {
    console.log('Archive view button found and setting up event listener');
    viewArchiveBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Archive view button clicked!');
      showArchiveView();
    });
  } else {
    console.log('Archive view button not found!');
  }
  
  if (backToAlertsBtn) {
    console.log('Back to alerts button found and setting up event listener');
    backToAlertsBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Back to alerts button clicked!');
      showAlertListView();
    });
  } else {
    console.log('Back to alerts button not found!');
  }
}

// Show the user alert popup for car selection and date
export async function showUserAlertPopup() {
  try {
    const cars = await DataService.getCars();
    
    if (!cars || cars.length === 0) {
      window.alert('Сначала добавьте автомобиль в разделе "Мои автомобили"');
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
      const carName = formatCarName(car);
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
    window.alert('Ошибка загрузки данных: ' + error.message);
  }
}

// Show the user alert popup with pre-selected car (skips car selection)
export async function showUserAlertPopupWithCar(carId) {
  console.log('showUserAlertPopupWithCar called with carId:', carId);
  try {
    const car = await DataService.getCar(carId);
    console.log('Retrieved car:', car);
    
    if (!car) {
      window.alert('Автомобиль не найден');
      return;
    }
    
    // Get current date
    const today = new Date();
    const currentDate = today.toLocaleDateString('ru-RU');
    
    const carName = formatCarName(car);
    
    let popupHtml = `
      <div class="user-alert-popup">
        <div class="popup-header">
          <h2>Сообщить о проблеме</h2>
          <button class="close-btn" onclick="closeUserAlertPopup()">&times;</button>
        </div>
        <div class="popup-body">
          <div class="form-section">
            <h3>Автомобиль</h3>
            <div class="selected-car-info">
              <div class="selected-car-img">
                ${car.img && car.img.startsWith('data:image/') ? 
                  `<img src="${car.img}" alt="${carName}">` : 
                  `<span>🚗</span>`
                }
              </div>
              <div class="selected-car-details">
                <div class="selected-car-name">${carName}</div>
                <div class="selected-car-year">${car.year ? `Год: ${car.year}` : ''}</div>
                <div class="selected-car-mileage">${car.mileage ? `Пробег: ${car.mileage} км` : ''}</div>
              </div>
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
          
          <div class="popup-footer">
            <button onclick="confirmUserAlertWithCar()" class="btn-primary">Продолжить</button>
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
    
    console.log('showUserAlertPopupWithCar: Created overlay element');
    console.log('showUserAlertPopupWithCar: Overlay HTML length:', popupHtml.length);
    
    document.body.appendChild(overlay);
    console.log('showUserAlertPopupWithCar: Added overlay to document.body');
    console.log('showUserAlertPopupWithCar: Overlay element:', overlay);
    
    // Make functions globally available
    window.closeUserAlertPopup = closeUserAlertPopup;
    
    // Store carId in a closure for the confirm function
    window.confirmUserAlertWithCar = function() {
      confirmUserAlertWithCar(carId);
    };
    
    // Initialize current alert data with pre-selected car
    currentAlertData = {
      carId: carId,
      date: currentDate,
      mileage: car.mileage
    };
    
  } catch (error) {
    console.error('Error showing user alert popup with car:', error);
    window.alert('Ошибка загрузки данных: ' + error.message);
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
      
      // Store car's current mileage for later use
      currentAlertData.mileage = car.mileage || null;
    }
    
  } catch (error) {
    console.error('Error selecting car for alert:', error);
  }
}

// Confirm user alert and show mileage confirmation popup
async function confirmUserAlert() {
  try {
    const dateInput = document.getElementById('alert-date-input');
    const date = dateInput ? dateInput.value : '';
    
    // Validate date format
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(date)) {
      window.alert('Пожалуйста, введите корректную дату в формате дд.мм.гггг');
      dateInput.style.borderColor = '#dc3545';
      return;
    }
    
    if (!currentAlertData.carId) {
      window.alert('Пожалуйста, выберите автомобиль');
      return;
    }
    
    // Update current alert data with date
    currentAlertData.date = date;
    
    // Show mileage confirmation popup
    showMileageConfirmationPopup();
    
  } catch (error) {
    console.error('Error confirming user alert:', error);
    window.alert('Ошибка: ' + error.message);
  }
}

// Confirm user alert with pre-selected car and show mileage confirmation popup
async function confirmUserAlertWithCar(carId) {
  console.log('confirmUserAlertWithCar called with carId:', carId);
  try {
    const dateInput = document.getElementById('alert-date-input');
    const date = dateInput ? dateInput.value : '';
    
    console.log('Date input value:', date);
    
    // Validate date format
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(date)) {
      window.alert('Пожалуйста, введите корректную дату в формате дд.мм.гггг');
      dateInput.style.borderColor = '#dc3545';
      return;
    }
    
    // Update current alert data with date and car
    currentAlertData.carId = carId;
    currentAlertData.date = date;
    
    console.log('Updated currentAlertData:', currentAlertData);
    
    // Show mileage confirmation popup
    showMileageConfirmationPopup();
    
  } catch (error) {
    console.error('Error confirming user alert with car:', error);
    window.alert('Ошибка: ' + error.message);
  }
}

// Show mileage confirmation popup
async function showMileageConfirmationPopup() {
  try {
    const cars = await DataService.getCars();
    const car = cars.find(c => c.id == currentAlertData.carId);
    
    if (!car) {
      window.alert('Автомобиль не найден');
      return;
    }
    
    const currentMileage = car.mileage || 0;
    
    let popupHtml = `
      <div class="mileage-confirmation-popup">
        <div class="popup-header">
          <h2>Подтверждение пробега</h2>
          <button class="close-btn" onclick="closeMileageConfirmationPopup()">&times;</button>
        </div>
        <div class="popup-body">
          <div class="form-section">
            <h3>Введите актуальный пробег. Или оставим текущий?</h3>
            <div class="input-group">
              <label for="mileage-confirmation-input">
                <span class="icon">🛣️</span>
                Пробег (км):
              </label>
              <input type="number" id="mileage-confirmation-input" 
                     value="${currentMileage}"
                     placeholder="Введите текущий пробег" 
                     min="0" required>
            </div>
          </div>
          
          <div class="popup-footer">
            <button onclick="saveMileageAndContinue()" class="btn-primary">Сохранить пробег</button>
            <button onclick="keepCurrentMileage()" class="btn-secondary">Оставить текущий</button>
          </div>
        </div>
      </div>
    `;
    
    // Create and show popup
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.id = 'mileage-confirmation-overlay';
    overlay.innerHTML = popupHtml;
    
    document.body.appendChild(overlay);
    
    // Make functions globally available
    window.closeMileageConfirmationPopup = closeMileageConfirmationPopup;
    window.saveMileageAndContinue = saveMileageAndContinue;
    window.keepCurrentMileage = keepCurrentMileage;
    
    // Suggest current mileage from mileage handler
    try {
      const { mileageHandler } = await import('./mileageHandler.js');
      await mileageHandler.suggestMileageForInput('mileage-confirmation-input', currentAlertData.carId);
    } catch (error) {
      console.error('Failed to suggest mileage:', error);
    }
    
  } catch (error) {
    console.error('Error showing mileage confirmation popup:', error);
    window.alert('Ошибка: ' + error.message);
  }
}

// Close mileage confirmation popup
function closeMileageConfirmationPopup() {
  const overlay = document.getElementById('mileage-confirmation-overlay');
  if (overlay) {
    document.body.removeChild(overlay);
  }
}

// Save mileage and continue to user-alert page
async function saveMileageAndContinue() {
  try {
    const mileageInput = document.getElementById('mileage-confirmation-input');
    const mileage = mileageInput ? mileageInput.value : '';
    
    // Validate mileage
    if (!mileage || isNaN(mileage) || Number(mileage) < 0) {
      window.alert('Пожалуйста, введите корректный пробег');
      mileageInput.style.borderColor = '#dc3545';
      return;
    }
    
    // Update current alert data with new mileage
    currentAlertData.mileage = Number(mileage);
    
    // Store alert data in session storage for the user-alert page
    sessionStorage.setItem('userAlertData', JSON.stringify(currentAlertData));
    
    // Close both popups and navigate to user-alert page
    closeMileageConfirmationPopup();
    closeUserAlertPopup();
    window.location.hash = '#user-alert';
    
  } catch (error) {
    console.error('Error saving mileage and continuing:', error);
    window.alert('Ошибка: ' + error.message);
  }
}

// Keep current mileage and continue to user-alert page
async function keepCurrentMileage() {
  try {
    // Keep the current mileage from the car data
    const cars = await DataService.getCars();
    const car = cars.find(c => c.id == currentAlertData.carId);
    
    if (car) {
      currentAlertData.mileage = car.mileage || null;
    }
    
    // Store alert data in session storage for the user-alert page
    sessionStorage.setItem('userAlertData', JSON.stringify(currentAlertData));
    
    // Close both popups and navigate to user-alert page
    closeMileageConfirmationPopup();
    closeUserAlertPopup();
    window.location.hash = '#user-alert';
    
  } catch (error) {
    console.error('Error keeping current mileage:', error);
    window.alert('Ошибка: ' + error.message);
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
  
  // Set up priority selector
  setupPrioritySelector();
  
  // Handle form submission
  form.addEventListener('submit', handleFormSubmission);
}

// Load alert data and populate the form
async function loadAlertData() {
  try {
    // Check for problems flow data first
    const problemsCarId = sessionStorage.getItem('problemsCarId');
    const problemsDate = sessionStorage.getItem('problemsDate');
    const problemsMileage = sessionStorage.getItem('problemsMileage');
    
    if (problemsCarId && problemsDate) {
      // Handle problems flow data
      const cars = await DataService.getCars();
      const car = cars.find(c => c.id == problemsCarId);
      
      if (!car) {
        window.alert('Автомобиль не найден');
        window.location.hash = '#';
        return;
      }
      
      // Populate alert info from problems flow
      const carName = formatCarName(car);
      document.getElementById('alert-car-name').textContent = carName;
      document.getElementById('alert-date').textContent = problemsDate;
      document.getElementById('alert-mileage').textContent = problemsMileage ? `${problemsMileage} км` : 'Не указан';
      
      // Store current alert data
      currentAlertData = {
        carId: problemsCarId,
        date: problemsDate,
        mileage: problemsMileage ? parseInt(problemsMileage) : null
      };
      
      // Clear problems flow data
      sessionStorage.removeItem('problemsCarId');
      sessionStorage.removeItem('problemsDate');
      sessionStorage.removeItem('problemsMileage');
      
      return;
    }
    
    // Handle regular alert data
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
      window.alert('Автомобиль не найден');
      window.location.hash = '#';
      return;
    }
    
    // Populate alert info
    const carName = formatCarName(car);
    document.getElementById('alert-car-name').textContent = carName;
    document.getElementById('alert-date').textContent = alertData.date;
    document.getElementById('alert-mileage').textContent = alertData.mileage ? `${alertData.mileage} км` : 'Не указан';
    
    // Store current alert data
    currentAlertData = alertData;
    
  } catch (error) {
    console.error('Error loading alert data:', error);
    window.alert('Ошибка загрузки данных: ' + error.message);
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

// Setup priority selector functionality
function setupPrioritySelector() {
  const priorityOptions = document.querySelectorAll('.priority-option');
  const priorityInput = document.getElementById('priority-input');
  
  priorityOptions.forEach(option => {
    option.addEventListener('click', function() {
      // Remove selection from all options
      priorityOptions.forEach(opt => opt.classList.remove('selected'));
      
      // Add selection to clicked option
      this.classList.add('selected');
      
      // Update hidden input value
      const priority = this.getAttribute('data-priority');
      priorityInput.value = priority;
    });
  });
}

// Handle form submission
async function handleFormSubmission(event) {
  event.preventDefault();
  
  try {
    const subsystemSelect = document.getElementById('subsystem-select');
    const customSubsystem = document.getElementById('custom-subsystem');
    const problemDescription = document.getElementById('problem-description');
    const priorityInput = document.getElementById('priority-input');
    
    // Validate required fields
    if (!subsystemSelect.value) {
      window.alert('Пожалуйста, выберите систему');
      subsystemSelect.focus();
      return;
    }
    
    if (subsystemSelect.value === 'custom' && !customSubsystem.value.trim()) {
      window.alert('Пожалуйста, укажите место неисправности');
      customSubsystem.focus();
      return;
    }
    
    if (!priorityInput.value) {
      window.alert('Пожалуйста, выберите приоритет проблемы');
      return;
    }
    
    if (!problemDescription.value.trim()) {
      window.alert('Пожалуйста, опишите проблему');
      problemDescription.focus();
      return;
    }
    
    // Get priority display text
    const priorityTexts = {
      'critical': 'Совсем плохо/совсем страшно',
      'warning': 'Непонятно',
      'info': 'Потерпим'
    };
    
    // Create alert data
    const alertData = {
      id: Date.now(), // Simple ID generation
      carId: currentAlertData.carId,
      date: currentAlertData.date,
      mileage: currentAlertData.mileage,
      subsystem: subsystemSelect.value === 'custom' ? customSubsystem.value.trim() : subsystemSelect.options[subsystemSelect.selectedIndex].text,
      subsystemType: subsystemSelect.value,
      priority: priorityInput.value,
      priorityText: priorityTexts[priorityInput.value],
      description: problemDescription.value.trim(),
      createdAt: new Date().toISOString()
    };
    
    // Save alert data
    await saveUserAlert(alertData);
    
    // Clear session storage
    sessionStorage.removeItem('userAlertData');
    
    // Show success message and redirect
    window.alert('Проблема успешно записана!');
    window.location.hash = '#';
    
  } catch (error) {
    console.error('Error saving user alert:', error);
    window.alert('Ошибка сохранения: ' + error.message);
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
    
    // Add mileage entry to mileage handler
    if (alertData.mileage) {
      try {
        const { mileageHandler } = await import('./mileageHandler.js');
        await mileageHandler.addMileageEntry(alertData.carId, alertData.mileage, alertData.date, 'alert', {
          subsystem: alertData.subsystem,
          priority: alertData.priority,
          description: alertData.description
        });
      } catch (error) {
        console.error('Failed to add mileage entry for alert:', error);
      }
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

// Initialize alert list page
export function initializeAlertListUI() {
  console.log('Alert list UI initializing...');
  
  // Set up new alert button
  console.log('Setting up new alert button...');
  setupNewAlertButton();
  
  // Set up archive view button
  setupArchiveViewButton();
  
  // Load and display alerts
  loadAlertList();
  
  // Set up event listeners
  setupAlertListEventListeners();
  
  console.log('Alert list UI initialized successfully');
}

// Load and display alert list
async function loadAlertList(sortType = 'date-desc', filterType = 'all') {
  try {
    const alerts = await getUserAlerts();
    const cars = await DataService.getCars();
    
    if (alerts.length === 0) {
      showEmptyAlertList();
      return;
    }
    
    // Apply filtering - only show non-archived alerts by default
    let filteredAlerts = alerts;
    if (filterType !== 'all') {
      if (filterType === 'active') {
        filteredAlerts = alerts.filter(alert => !alert.archived);
      } else if (filterType === 'archived') {
        filteredAlerts = alerts.filter(alert => alert.archived);
      } else {
        filteredAlerts = alerts.filter(alert => alert.priority === filterType && !alert.archived);
      }
    } else {
      // Default filter: show only non-archived alerts
      filteredAlerts = alerts.filter(alert => !alert.archived);
    }
    
    if (filteredAlerts.length === 0) {
      showEmptyAlertList();
      return;
    }
    
    // Group alerts by car
    const alertsByCar = groupAlertsByCar(filteredAlerts, cars);
    
    // Display alerts with sorting
    displayAlertList(alertsByCar, sortType);
    
  } catch (error) {
    console.error('Error loading alert list:', error);
    showEmptyAlertList();
  }
}

// Group alerts by car
function groupAlertsByCar(alerts, cars) {
  const alertsByCar = {};
  
  alerts.forEach(alert => {
    const car = cars.find(c => c.id == alert.carId);
    if (car) {
      const carName = formatCarName(car);
      if (!alertsByCar[carName]) {
        alertsByCar[carName] = {
          car: car,
          alerts: []
        };
      }
      alertsByCar[carName].alerts.push(alert);
    }
  });
  
  return alertsByCar;
}

// Display alert list
async function displayAlertList(alertsByCar, sortType = 'date-desc') {
  const content = document.getElementById('alert-list-content');
  const empty = document.getElementById('alert-list-empty');
  
  if (!content || !empty) return;
  
  content.style.display = 'block';
  empty.style.display = 'none';
  
  // Preserve the page description and clear only the alerts
  const description = content.querySelector('.page-description');
  content.innerHTML = '';
  
  // Restore the description if it exists
  if (description) {
    content.appendChild(description);
  }
  
  // Sort car groups based on sort type
  const sortedCarNames = Object.keys(alertsByCar).sort((a, b) => {
    const carDataA = alertsByCar[a];
    const carDataB = alertsByCar[b];
    
    switch (sortType) {
      case 'date-desc':
        // Sort by newest alert date
        const newestA = Math.max(...carDataA.alerts.map(alert => parseRussianDate(alert.date)));
        const newestB = Math.max(...carDataB.alerts.map(alert => parseRussianDate(alert.date)));
        return newestB - newestA;
      case 'date-asc':
        // Sort by oldest alert date
        const oldestA = Math.min(...carDataA.alerts.map(alert => parseRussianDate(alert.date)));
        const oldestB = Math.min(...carDataB.alerts.map(alert => parseRussianDate(alert.date)));
        return oldestA - oldestB;
      case 'priority-desc':
        // Sort by highest priority (critical > warning > info)
        const priorityOrder = { critical: 3, warning: 2, info: 1 };
        const maxPriorityA = Math.max(...carDataA.alerts.map(alert => priorityOrder[alert.priority] || 1));
        const maxPriorityB = Math.max(...carDataB.alerts.map(alert => priorityOrder[alert.priority] || 1));
        return maxPriorityB - maxPriorityA;
      case 'priority-asc':
        // Sort by lowest priority (info > warning > critical)
        const minPriorityA = Math.min(...carDataA.alerts.map(alert => priorityOrder[alert.priority] || 1));
        const minPriorityB = Math.min(...carDataB.alerts.map(alert => priorityOrder[alert.priority] || 1));
        return minPriorityA - minPriorityB;
      default:
        return 'priority-desc';
    }
  });
  
  // Use Promise.all to handle async createAlertGroup
  const alertGroups = await Promise.all(sortedCarNames.map(carName => {
    const carData = alertsByCar[carName];
    return createAlertGroup(carName, carData, sortType);
  }));
  
  alertGroups.forEach(alertGroup => {
    content.appendChild(alertGroup);
  });
}

// Helper function to parse Russian date format (dd.mm.yyyy)
function parseRussianDate(dateString) {
  if (!dateString) return new Date(0);
  
  // Check if it's already in Russian format (dd.mm.yyyy)
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split('.');
    return new Date(year, month - 1, day);
  }
  
  // Try to parse as regular date
  return new Date(dateString);
}

// Create alert group for a specific car
async function createAlertGroup(carName, carData, sortType = 'date-desc') {
  const group = document.createElement('div');
  group.className = 'alert-group';
  
  const header = document.createElement('div');
  header.className = 'alert-group-header';
  
  // Calculate newest and oldest dates for sorting groups
  const dates = carData.alerts.map(alert => parseRussianDate(alert.date));
  const newestDate = Math.max(...dates);
  const oldestDate = Math.min(...dates);
  
  header.innerHTML = `
    <div class="alert-group-title">
      <span class="car-name">${carName}</span>
      <span class="alert-count">(${carData.alerts.length})</span>
    </div>
    <div class="alert-group-dates">
      <span class="date-range">
        ${oldestDate.toLocaleDateString('ru-RU')} - ${newestDate.toLocaleDateString('ru-RU')}
      </span>
    </div>
    <div class="alert-group-toggle">
      <span class="toggle-icon">▼</span>
    </div>
  `;
  
  const content = document.createElement('div');
  content.className = 'alert-group-content';
  
  // Sort alerts based on sort type
  const sortedAlerts = carData.alerts.sort((a, b) => {
    switch (sortType) {
      case 'date-desc':
        return parseRussianDate(b.date) - parseRussianDate(a.date);
      case 'date-asc':
        return parseRussianDate(a.date) - parseRussianDate(b.date);
      case 'priority-desc':
        const priorityOrder = { critical: 3, warning: 2, info: 1 };
        return (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
      case 'priority-asc':
        const priorityOrderAsc = { critical: 3, warning: 2, info: 1 };
        return (priorityOrderAsc[a.priority] || 1) - (priorityOrderAsc[b.priority] || 1);
      default:
        return parseRussianDate(b.date) - parseRussianDate(a.date);
    }
  });
  
  // Use Promise.all to handle async createAlertItem
  const alertItems = await Promise.all(sortedAlerts.map(alert => createAlertItem(alert)));
  alertItems.forEach(alertItem => {
    content.appendChild(alertItem);
  });
  
  group.appendChild(header);
  group.appendChild(content);
  
  // Add click handler to expand/collapse
  header.addEventListener('click', () => {
    group.classList.toggle('expanded');
  });
  
  return group;
}

// Create individual alert item
async function createAlertItem(alert) {
  const item = document.createElement('div');
  item.className = `alert-item ${alert.archived ? 'archived' : ''} ${alert.inPlan ? 'alert-in-plan' : ''}`;
  item.setAttribute('data-alert-id', alert.id);
  
  const priorityConfig = {
    critical: { icon: '🔴', emoji: '🙏', text: 'Критично' },
    warning: { icon: '🟡', emoji: '🤷‍♀️', text: 'Непонятно' },
    info: { icon: '🔵', emoji: '✍️', text: 'Потерпим' }
  };
  
  const config = priorityConfig[alert.priority] || priorityConfig.info;
  
  // Check if alert is archived or in plan
  const isArchived = alert.archived || false;
  const isInPlan = alert.inPlan || false;
  
  item.innerHTML = `
    <div class="alert-priority-marker ${alert.priority}">
      <span class="alert-priority-icon">${config.icon}</span>
      <span class="alert-priority-emoji">${config.emoji}</span>
    </div>
    
    <div class="alert-content">
      <div class="alert-header">
        <span class="alert-date">${alert.date}</span>
        <span class="alert-priority-text ${alert.priority}">${config.text}</span>
        <span class="alert-subsystem">${alert.subsystem}</span>
      </div>
      <div class="alert-description">${alert.description}</div>
      <div class="alert-mileage">Пробег: ${alert.mileage} км</div>
    </div>
    
    <div class="alert-actions">
      <button class="alert-action-btn add-to-plan ${isInPlan ? 'in-plan' : ''}" onclick="toggleAlertPlan(${alert.id})" title="${isInPlan ? 'Удалить из плана' : 'Добавить в план'}">
        <span class="icon">📋</span>
        ${isInPlan ? 'В плане' : 'В план'}
      </button>
      <button class="alert-action-btn archive ${isArchived ? 'archived' : ''}" onclick="toggleAlertArchive(${alert.id})" title="${isArchived ? 'Восстановить из архива' : 'Отправить в архив'}">
        <span class="icon">${isArchived ? '📂' : '🗄️'}</span>
        ${isArchived ? 'В архиве' : 'В архив'}
      </button>
    </div>
  `;
  
  return item;
}

// Show empty alert list
async function showEmptyAlertList() {
  const content = document.getElementById('alert-list-content');
  const empty = document.getElementById('alert-list-empty');
  
  if (content && empty) {
    content.style.display = 'none';
    empty.style.display = 'block';
    
    // Check if there are no active alerts (not archived)
    const alerts = await getUserAlerts();
    const activeAlerts = alerts.filter(alert => !alert.archived);
    
    // Hide the "Сообщить о проблеме" button if there are no active alerts
    const reportButton = empty.querySelector('button');
    if (reportButton && activeAlerts.length === 0) {
      reportButton.style.display = 'none';
    } else if (reportButton) {
      reportButton.style.display = 'block';
    }
  }
}

// Show archive view
async function showArchiveView() {
  const alertListView = document.getElementById('alert-list-content');
  const alertListEmpty = document.getElementById('alert-list-empty');
  const archiveView = document.getElementById('archive-view');
  const archiveContent = document.getElementById('archive-content');
  const archiveEmpty = document.getElementById('archive-empty');
  
  if (alertListView) alertListView.style.display = 'none';
  if (alertListEmpty) alertListEmpty.style.display = 'none';
  if (archiveView) archiveView.style.display = 'block';
  
  // Load archived alerts
  await loadArchiveView();
}

// Show alert list view
function showAlertListView() {
  const alertListView = document.getElementById('alert-list-content');
  const alertListEmpty = document.getElementById('alert-list-empty');
  const archiveView = document.getElementById('archive-view');
  
  if (archiveView) archiveView.style.display = 'none';
  if (alertListView) alertListView.style.display = 'block';
  if (alertListEmpty) alertListEmpty.style.display = 'none';
  
  // Reload alert list
  loadAlertList();
}

// Load archive view
async function loadArchiveView() {
  try {
    const alerts = await getUserAlerts();
    const cars = await DataService.getCars();
    
    // Filter only archived alerts
    const archivedAlerts = alerts.filter(alert => alert.archived);
    
    if (archivedAlerts.length === 0) {
      showEmptyArchiveView();
      return;
    }
    
    // Group archived alerts by car
    const alertsByCar = groupAlertsByCar(archivedAlerts, cars);
    
    // Display archived alerts in table format
    displayArchiveTable(alertsByCar);
    
  } catch (error) {
    console.error('Error loading archive view:', error);
    showEmptyArchiveView();
  }
}

// Show empty archive view
function showEmptyArchiveView() {
  const archiveContent = document.getElementById('archive-content');
  const archiveEmpty = document.getElementById('archive-empty');
  
  if (archiveContent && archiveEmpty) {
    archiveContent.style.display = 'none';
    archiveEmpty.style.display = 'block';
  }
}

// Display archive table
async function displayArchiveTable(alertsByCar) {
  const archiveContent = document.getElementById('archive-content');
  const archiveEmpty = document.getElementById('archive-empty');
  
  if (!archiveContent || !archiveEmpty) return;
  
  archiveContent.style.display = 'block';
  archiveEmpty.style.display = 'none';
  
  // Sort car groups by newest alert date
  const sortedCarNames = Object.keys(alertsByCar).sort((a, b) => {
    const carDataA = alertsByCar[a];
    const carDataB = alertsByCar[b];
    
    // Sort by newest alert date
    const newestA = Math.max(...carDataA.alerts.map(alert => parseRussianDate(alert.date)));
    const newestB = Math.max(...carDataB.alerts.map(alert => parseRussianDate(alert.date)));
    return newestB - newestA;
  });
  
  let tableHTML = `
    <div class="archive-table">
      <table>
        <thead>
          <tr>
            <th>Автомобиль</th>
            <th>Дата</th>
            <th>Система</th>
            <th>Приоритет</th>
            <th>Описание</th>
            <th>Пробег</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  sortedCarNames.forEach(carName => {
    const carData = alertsByCar[carName];
    
    // Sort alerts by date (newer first)
    const sortedAlerts = carData.alerts.sort((a, b) => parseRussianDate(b.date) - parseRussianDate(a.date));
    
    sortedAlerts.forEach(alert => {
      const priorityConfig = {
        critical: { icon: '🔴', text: 'Критично' },
        warning: { icon: '🟡', text: 'Непонятно' },
        info: { icon: '🔵', text: 'Потерпим' }
      };
      
      const config = priorityConfig[alert.priority] || priorityConfig.info;
      
      tableHTML += `
        <tr>
          <td class="car-name">${carName}</td>
          <td class="alert-date">${alert.date}</td>
          <td class="alert-subsystem">${alert.subsystem}</td>
          <td class="alert-priority">
            <span class="priority-badge ${alert.priority}">
              ${config.icon} ${config.text}
            </span>
          </td>
          <td class="alert-description">${alert.description}</td>
          <td class="alert-mileage">${alert.mileage ? `${alert.mileage} км` : '-'}</td>
          <td class="alert-actions">
            <button class="btn btn-sm btn-primary recall-from-archive-btn" onclick="recallAlertFromArchive(${alert.id})" title="Восстановить из архива">
              <span class="icon">↩️</span>
              Восстановить
            </button>
          </td>
        </tr>
      `;
    });
  });
  
  tableHTML += `
        </tbody>
      </table>
    </div>
  `;
  
  archiveContent.innerHTML = tableHTML;
}

// Setup alert list event listeners
function setupAlertListEventListeners() {
  const sortSelect = document.getElementById('sort-select');
  const filterSelect = document.getElementById('filter-select');
  
  if (sortSelect) {
    sortSelect.addEventListener('change', handleAlertSort);
  }
  
  if (filterSelect) {
    filterSelect.addEventListener('change', handleAlertFilter);
  }
}

// Handle alert sorting
async function handleAlertSort(event) {
  const sortType = event.target.value;
  await loadAlertList(sortType, document.getElementById('filter-select')?.value || 'all');
}

// Handle alert filtering
async function handleAlertFilter(event) {
  const filterType = event.target.value;
  await loadAlertList(document.getElementById('sort-select')?.value || 'date-desc', filterType);
}

// Toggle alert archive status
window.toggleAlertArchive = async function(alertId) {
  try {
    const alerts = await getUserAlerts();
    const alertItem = alerts.find(a => a.id == alertId);
    
    if (!alertItem) {
      window.alert('Проблема не найдена');
      return;
    }
    
    // Toggle archive status
    alertItem.archived = !alertItem.archived;
    
    // If restoring from archive and alert is in plan, remove from plan
    if (!alertItem.archived && alertItem.inPlan) {
      await removeAlertFromPlan(alertItem);
    }
    
    // Update in storage
    await updateUserAlert(alertItem);
    
    // Reload alert list
    loadAlertList();
    
  } catch (error) {
    console.error('Error toggling alert archive:', error);
    window.alert('Ошибка обновления статуса архива: ' + error.message);
  }
};

// Remove alert from plan (helper function)
async function removeAlertFromPlan(alert) {
  try {
    // Get all cars to find the one this alert belongs to
    const cars = await DataService.getCars();
    const car = cars.find(c => c.id == alert.carId);
    
    if (car) {
      const planKey = `maintenance_plan_draft_${car.id}`;
      
      let planData = localStorage.getItem(planKey);
      if (planData) {
        planData = JSON.parse(planData);
        
        // Remove from repairs table
        if (planData.repairs) {
          planData.repairs = planData.repairs.filter(entry => entry.alertId !== alert.id);
        }
        
        // Save updated plan data
        localStorage.setItem(planKey, JSON.stringify(planData));
      }
    }
    
    // Mark alert as not in plan
    alert.inPlan = false;
    
  } catch (error) {
    console.error('Error removing alert from plan:', error);
    throw error;
  }
}

// Toggle alert plan status
window.toggleAlertPlan = async function(alertId) {
  try {
    const alerts = await getUserAlerts();
    const alertItem = alerts.find(a => a.id == alertId);
    
    if (!alertItem) {
      window.alert('Проблема не найдена');
      return;
    }
    
    if (alertItem.inPlan) {
      // Remove from plan
      await removeAlertFromPlan(alertItem);
    } else {
      // Add to plan
      await addAlertToPlan(alertItem);
    }
    
    // Update in storage
    await updateUserAlert(alertItem);
    
    // Reload alert list
    loadAlertList();
    
  } catch (error) {
    console.error('Error toggling alert plan:', error);
    window.alert('Ошибка обновления статуса плана: ' + error.message);
  }
};

// Add alert to plan (helper function)
async function addAlertToPlan(alert) {
  try {
    // Create plan entry
    const planEntry = {
      id: generateId(),
      operation: `${alert.subsystem}: ${alert.description}`,
      resources: '',
      notes: `Добавлено из уведомления от ${alert.date} со статусом "${getPriorityText(alert.priority)}"`,
      createdAt: new Date().toISOString(),
      alertId: alert.id // Link back to original alert
    };

    // Get all cars to find the one this alert belongs to
    const cars = await DataService.getCars();
    const car = cars.find(c => c.id == alert.carId);
    
    if (car) {
      const planKey = `maintenance_plan_draft_${car.id}`;
      
      let planData = localStorage.getItem(planKey);
      if (planData) {
        planData = JSON.parse(planData);
      } else {
        planData = {
          maintenance: [],
          repairs: [],
          carId: car.id,
          lastModified: new Date().toISOString()
        };
      }

      // Add to repairs table
      if (!planData.repairs) {
        planData.repairs = [];
      }
      planData.repairs.push(planEntry);
      
      // Save plan data
      localStorage.setItem(planKey, JSON.stringify(planData));
    }
    
    // Mark alert as in plan
    alert.inPlan = true;
    
  } catch (error) {
    console.error('Error adding alert to plan:', error);
    throw error;
  }
}

// Helper functions
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function getPriorityText(priority) {
  const priorityTexts = {
    critical: 'Критично',
    warning: 'Непонятно',
    info: 'Потерпим'
  };
  return priorityTexts[priority] || 'Потерпим';
}

// Recall alert from archive
window.recallAlertFromArchive = async function(alertId) {
  try {
    const alerts = await getUserAlerts();
    const alertItem = alerts.find(a => a.id == alertId);
    
    if (!alertItem) {
      window.alert('Проблема не найдена');
      return;
    }
    
    // Remove from archive
    alertItem.archived = false;
    
    // Update in storage
    await updateUserAlert(alertItem);
    
    // Reload archive view
    loadArchiveView();
    
    // Show success message
    window.alert('Проблема восстановлена из архива');
    
  } catch (error) {
    console.error('Error recalling alert from archive:', error);
    window.alert('Ошибка восстановления из архива: ' + error.message);
  }
};



// Update user alert in storage
async function updateUserAlert(updatedAlert) {
  try {
    if (CONFIG.useBackend) {
      // TODO: Replace with actual backend API call
      throw new Error('Backend API not implemented yet');
    } else {
      const existingAlerts = localStorage.getItem('userAlerts');
      if (!existingAlerts) return;
      
      const alerts = JSON.parse(existingAlerts);
      const updatedAlerts = alerts.map(alert => 
        alert.id == updatedAlert.id ? updatedAlert : alert
      );
      
      localStorage.setItem('userAlerts', JSON.stringify(updatedAlerts));
    }
    

    
  } catch (error) {
    console.error('Error updating user alert:', error);
    throw error;
  }
} 

 