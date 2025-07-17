import { DataService } from './dataService.js';
import { showConfirmationDialog } from './dialogs.js';
import { CONFIG } from './config.js';

// Global variables for user alert
let currentAlertData = null;

// Initialize user alert UI (floating button)
export function initializeUserAlertUI() {
  console.log('User alert UI initializing...');
  
  // Set up floating alert button
  setupUserAlertButton();
  
  // Update problems button color
  updateProblemsButtonColor();
  
  console.log('User alert UI initialized successfully');
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
      alert('Сначала добавьте автомобиль в разделе "Мои автомобили"');
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
  
  // Set up priority selector
  setupPrioritySelector();
  
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
      alert('Пожалуйста, выберите систему');
      subsystemSelect.focus();
      return;
    }
    
    if (subsystemSelect.value === 'custom' && !customSubsystem.value.trim()) {
      alert('Пожалуйста, укажите место неисправности');
      customSubsystem.focus();
      return;
    }
    
    if (!priorityInput.value) {
      alert('Пожалуйста, выберите приоритет проблемы');
      return;
    }
    
    if (!problemDescription.value.trim()) {
      alert('Пожалуйста, опишите проблему');
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
    
    // Update problems button color after saving
    await updateProblemsButtonColor();
    
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
    
    // Apply filtering
    let filteredAlerts = alerts;
    if (filterType !== 'all') {
      if (filterType === 'active') {
        filteredAlerts = alerts.filter(alert => !alert.completed);
      } else if (filterType === 'completed') {
        filteredAlerts = alerts.filter(alert => alert.completed);
      } else {
        filteredAlerts = alerts.filter(alert => alert.priority === filterType);
      }
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
      const carName = car.nickname || `${car.brand || ''} ${car.model || ''}`.trim() || car.name;
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
  
  content.innerHTML = '';
  
  // Sort car groups based on sort type
  const sortedCarNames = Object.keys(alertsByCar).sort((a, b) => {
    const carDataA = alertsByCar[a];
    const carDataB = alertsByCar[b];
    
    switch (sortType) {
      case 'date-desc':
        // Sort by newest alert date
        const newestA = Math.max(...carDataA.alerts.map(alert => new Date(alert.date)));
        const newestB = Math.max(...carDataB.alerts.map(alert => new Date(alert.date)));
        return newestB - newestA;
      case 'date-asc':
        // Sort by oldest alert date
        const oldestA = Math.min(...carDataA.alerts.map(alert => new Date(alert.date)));
        const oldestB = Math.min(...carDataB.alerts.map(alert => new Date(alert.date)));
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
        return 0;
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

// Create alert group element
async function createAlertGroup(carName, carData, sortType = 'date-desc') {
  const group = document.createElement('div');
  group.className = 'alert-group';
  
  const header = document.createElement('div');
  header.className = 'alert-group-header';
  header.innerHTML = `
    <div class="alert-group-title">
      <span class="icon">🚗</span>
      ${carName}
    </div>
    <div class="alert-group-count">${carData.alerts.length}</div>
  `;
  
  const content = document.createElement('div');
  content.className = 'alert-group-content';
  
  // Sort alerts based on sort type
  const sortedAlerts = carData.alerts.sort((a, b) => {
    switch (sortType) {
      case 'date-desc':
        return new Date(b.date) - new Date(a.date);
      case 'date-asc':
        return new Date(a.date) - new Date(b.date);
      case 'priority-desc':
        const priorityOrder = { critical: 3, warning: 2, info: 1 };
        return (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
      case 'priority-asc':
        const priorityOrderAsc = { critical: 3, warning: 2, info: 1 };
        return (priorityOrderAsc[a.priority] || 1) - (priorityOrderAsc[b.priority] || 1);
      default:
        return new Date(b.date) - new Date(a.date);
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
  item.className = `alert-item ${alert.completed ? 'completed' : ''}`;
  item.setAttribute('data-alert-id', alert.id);
  
  const priorityConfig = {
    critical: { icon: '🔴', emoji: '🙏', text: 'Критично' },
    warning: { icon: '🟡', emoji: '🤷‍♀️', text: 'Непонятно' },
    info: { icon: '🔵', emoji: '✍️', text: 'Потерпим' }
  };
  
  const config = priorityConfig[alert.priority] || priorityConfig.info;
  
  // Check if alert is in service plan
  let servicePlan = localStorage.getItem('servicePlan');
  let isInPlan = false;
  if (servicePlan) {
    servicePlan = JSON.parse(servicePlan);
    isInPlan = servicePlan.some(item => item.alertId == alert.id);
  }
  
  const planButtonClass = isInPlan ? 'add-to-plan added' : 'add-to-plan';
  const planButtonText = isInPlan ? 'В плане' : 'В план';
  const planButtonIcon = isInPlan ? '✅' : '📋';
  const planButtonTitle = isInPlan ? 'Удалить из плана' : 'Добавить в план';
  
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
      <button class="alert-action-btn ${planButtonClass}" onclick="addAlertToPlan(${alert.id})" title="${planButtonTitle}">
        <span class="icon">${planButtonIcon}</span>
        ${planButtonText}
      </button>
      <button class="alert-action-btn complete ${alert.completed ? 'completed' : ''}" onclick="toggleAlertComplete(${alert.id})" title="${alert.completed ? 'Восстановить' : 'Завершить'}">
        <span class="icon">${alert.completed ? '↩️' : '✅'}</span>
        ${alert.completed ? 'Восстановить' : 'Завершить'}
      </button>
    </div>
  `;
  
  return item;
}

// Show empty alert list
function showEmptyAlertList() {
  const content = document.getElementById('alert-list-content');
  const empty = document.getElementById('alert-list-empty');
  
  if (content && empty) {
    content.style.display = 'none';
    empty.style.display = 'block';
  }
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

// Add alert to service plan
window.addAlertToPlan = async function(alertId) {
  try {
    const alerts = await getUserAlerts();
    const alert = alerts.find(a => a.id == alertId);
    
    if (!alert) {
      alert('Проблема не найдена');
      return;
    }
    
    // Get existing service plan
    let servicePlan = localStorage.getItem('servicePlan');
    if (!servicePlan) {
      servicePlan = [];
    } else {
      servicePlan = JSON.parse(servicePlan);
    }
    
    // Check if alert is already in plan
    const existingIndex = servicePlan.findIndex(item => item.alertId == alertId);
    if (existingIndex !== -1) {
      // Remove from plan
      servicePlan.splice(existingIndex, 1);
      localStorage.setItem('servicePlan', JSON.stringify(servicePlan));
      
      // Update button appearance
      const button = event.target.closest('.add-to-plan');
      if (button) {
        button.classList.remove('added');
        button.innerHTML = '<span class="icon">📋</span>В план';
        button.title = 'Добавить в план';
      }
      
      alert('Проблема удалена из плана');
    } else {
      // Add to plan
      const planItem = {
        id: Date.now(),
        alertId: alertId,
        type: 'alert',
        description: alert.description,
        priority: alert.priority,
        carId: alert.carId,
        date: alert.date,
        addedDate: new Date().toISOString()
      };
      
      servicePlan.push(planItem);
      localStorage.setItem('servicePlan', JSON.stringify(servicePlan));
      
      // Update button appearance
      const button = event.target.closest('.add-to-plan');
      if (button) {
        button.classList.add('added');
        button.innerHTML = '<span class="icon">✅</span>В плане';
        button.title = 'Удалить из плана';
      }
      
      alert('Проблема добавлена в план');
    }
    
  } catch (error) {
    console.error('Error adding alert to plan:', error);
    alert('Ошибка добавления в план: ' + error.message);
  }
};

// Toggle alert completion status
window.toggleAlertComplete = async function(alertId) {
  try {
    const alerts = await getUserAlerts();
    const alert = alerts.find(a => a.id == alertId);
    
    if (!alert) {
      alert('Проблема не найдена');
      return;
    }
    
    // Toggle completion status
    alert.completed = !alert.completed;
    
    // Update in storage
    await updateUserAlert(alert);
    
    // Reload alert list
    loadAlertList();
    
  } catch (error) {
    console.error('Error toggling alert completion:', error);
    alert('Ошибка обновления статуса: ' + error.message);
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
    
    // Update problems button color after updating
    await updateProblemsButtonColor();
    
  } catch (error) {
    console.error('Error updating user alert:', error);
    throw error;
  }
} 

// Update problems button color based on alert priorities
export async function updateProblemsButtonColor() {
  try {
    const problemsButton = document.getElementById('problems-button');
    if (!problemsButton) return;
    
    const alerts = await getUserAlerts();
    const activeAlerts = alerts.filter(alert => !alert.completed);
    
    if (activeAlerts.length === 0) {
      // No active alerts - grey button
      problemsButton.style.color = '#6c757d';
      problemsButton.style.pointerEvents = 'none';
      problemsButton.title = 'Нет активных проблем';
    } else {
      // Check for critical alerts first
      const criticalAlerts = activeAlerts.filter(alert => alert.priority === 'critical');
      if (criticalAlerts.length > 0) {
        // Red for critical alerts
        problemsButton.style.color = '#dc3545';
        problemsButton.style.pointerEvents = 'auto';
        problemsButton.title = `${criticalAlerts.length} критичных проблем!`;
      } else {
        // Check for warning vs info alerts
        const warningAlerts = activeAlerts.filter(alert => alert.priority === 'warning');
        const infoAlerts = activeAlerts.filter(alert => alert.priority === 'info');
        
        if (warningAlerts.length > infoAlerts.length) {
          // Yellow for more warnings
          problemsButton.style.color = '#ffc107';
          problemsButton.style.pointerEvents = 'auto';
          problemsButton.title = `${warningAlerts.length} проблем требуют внимания`;
        } else {
          // Blue-green for more info alerts
          problemsButton.style.color = '#17a2b8';
          problemsButton.style.pointerEvents = 'auto';
          problemsButton.title = `${infoAlerts.length} незначительных проблем`;
        }
      }
    }
  } catch (error) {
    console.error('Error updating problems button color:', error);
  }
} 