import { DataService } from './dataService.js';
import { CONFIG } from './config.js';

// Global variables
let currentCarId = null;
let currentMileage = 0;
let currentDate = new Date().toISOString().split('T')[0];
let selectedCar = null;

// Initialize service plan UI with new flow
export function initializeServicePlanUI() {
  console.log('Service plan UI initializing with new flow...');
  
  // Start with car selection popup
  showCarSelectionPopup();
}

// Show car selection popup
async function showCarSelectionPopup() {
  console.log('Service plan UI: Showing car selection popup...');
  
  try {
    const cars = await DataService.getCars();
    console.log('Service plan UI: Found cars:', cars.length);
    
    if (cars.length === 0) {
      console.log('Service plan UI: No cars found, showing error message');
      showErrorMessage('Сначала добавьте автомобиль в разделе "Мои автомобили"');
      return;
    }
    
    // Create popup HTML
    const popupHTML = `
      <div class="popup-overlay" id="service-plan-car-popup" style="display: flex;">
        <div class="popup-content">
          <div class="popup-header">
            <h2>
              <span class="icon">🚗</span>
              Выберите автомобиль для планирования обслуживания
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
            <button class="btn btn-secondary" onclick="closeServicePlanCarPopup()">Отмена</button>
          </div>
        </div>
      </div>
    `;
    
    // Add popup to DOM
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    
    // Add event listeners for car selection
    const carItems = document.querySelectorAll('.car-selection-item');
    console.log('Service plan UI: Found car items:', carItems.length);
    
    carItems.forEach(item => {
      item.addEventListener('click', function() {
        console.log('Service plan UI: Car item clicked:', this.getAttribute('data-car-id'));
        const carId = this.getAttribute('data-car-id');
        
        // Get selected car details
        const car = cars.find(c => c.id == carId);
        if (car) {
          selectedCar = car;
          currentCarId = carId;
          
          // Remove car selection popup
          removeServicePlanCarPopup();
          
          // Show mileage input popup
          showMileageInputPopup();
        }
      });
    });
    
    // Add close functionality
    window.closeServicePlanCarPopup = closeServicePlanCarPopup;
    
  } catch (error) {
    console.error('Error showing car selection popup:', error);
    showErrorMessage('Ошибка загрузки списка автомобилей');
  }
}

// Show mileage input popup with current car mileage pre-filled
async function showMileageInputPopup() {
  console.log('Service plan UI: Showing mileage input popup for car:', currentCarId);
  
  try {
    if (!selectedCar) {
      showErrorMessage('Выбранный автомобиль не найден');
      return;
    }
    
    const displayName = selectedCar.name || `${selectedCar.brand || ''} ${selectedCar.model || ''}`.trim();
    const nickname = selectedCar.nickname ? ` "${selectedCar.nickname}"` : '';
    const fullName = displayName + nickname;
    
    // Get current mileage from mileage handler
    let currentCarMileage = selectedCar.mileage || 0;
    try {
      const { mileageHandler } = await import('./mileageHandler.js');
      const mileageData = await mileageHandler.getMileageData(currentCarId);
      
      if (mileageData && mileageData.length > 0) {
        // Get the latest entry
        const latestEntry = mileageData[mileageData.length - 1];
        currentCarMileage = latestEntry.mileage;
        currentDate = latestEntry.date;
      }
    } catch (error) {
      console.error('Error loading mileage data:', error);
    }
    
    // Create popup HTML for mileage input
    const popupHTML = `
      <div class="popup-overlay" id="service-plan-mileage-popup" style="display: flex;">
        <div class="popup-content">
          <div class="popup-header">
            <h2>
              <span class="icon">📊</span>
              Текущий пробег автомобиля
            </h2>
          </div>
          
          <div class="popup-body">
            <div class="selected-car-info" style="background: #f5f5f5; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <div class="car-selection-img">
                  ${selectedCar.img && selectedCar.img.startsWith('data:image/') 
                    ? `<img src="${selectedCar.img}" alt="car image" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">`
                    : `<span style="font-size:3rem;">${selectedCar.img || '🚗'}</span>`
                  }
                </div>
                <div>
                  <div style="font-weight: bold; font-size: 1.1rem;">${fullName}</div>
                  ${selectedCar.year ? `<div style="color: #666;">${selectedCar.year} год</div>` : ''}
                </div>
              </div>
            </div>
            
            <form id="service-plan-mileage-form">
              <div class="form-group">
                <label for="service-plan-current-mileage">
                  <span class="icon">🛣️</span>
                  Текущий пробег (км):
                </label>
                <input type="number" id="service-plan-current-mileage" name="current-mileage" 
                       required min="0" value="${currentCarMileage}" placeholder="Введите текущий пробег">
              </div>
              
              <div class="form-group">
                <label for="service-plan-mileage-date">
                  <span class="icon">📅</span>
                  Дата:
                </label>
                <input type="date" id="service-plan-mileage-date" name="mileage-date" 
                       required value="${currentDate}">
              </div>
            </form>
          </div>
          
          <div class="popup-footer">
            <button type="button" class="btn btn-primary" onclick="confirmServicePlanMileage()">
              <span class="icon">✅</span>
              Продолжить
            </button>
            <button type="button" class="btn btn-secondary" onclick="closeServicePlanMileagePopup()">Отмена</button>
          </div>
        </div>
      </div>
    `;
    
    // Add popup to DOM
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    
    // Add close functionality
    window.closeServicePlanMileagePopup = closeServicePlanMileagePopup;
    window.confirmServicePlanMileage = confirmServicePlanMileage;
    
  } catch (error) {
    console.error('Error showing mileage input popup:', error);
    showErrorMessage('Ошибка загрузки данных автомобиля');
  }
}

// Confirm mileage and proceed to main service plan screen
async function confirmServicePlanMileage() {
  try {
    const mileage = parseInt(document.getElementById('service-plan-current-mileage').value);
    const date = document.getElementById('service-plan-mileage-date').value;
    
    if (!currentCarId) {
      alert('Пожалуйста, выберите автомобиль');
      return;
    }
    
    if (!mileage || mileage < 0) {
      alert('Пожалуйста, введите корректный пробег');
      return;
    }
    
    // Update current values
    currentMileage = mileage;
    currentDate = date;
    
    // Add mileage entry to mileage handler
    const { mileageHandler } = await import('./mileageHandler.js');
    await mileageHandler.addMileageEntry(currentCarId, mileage, date, 'manual', {
      note: 'Текущий пробег для планирования обслуживания'
    });
    
    // Remove mileage popup
    removeServicePlanMileagePopup();
    
    // Initialize main service plan screen
    initializeMainServicePlanScreen();
    
    console.log(`Service plan UI: Mileage confirmed - ${mileage} km, date: ${date}`);
    
  } catch (error) {
    console.error('Error confirming mileage:', error);
    alert('Ошибка сохранения пробега: ' + error.message);
  }
}

// Initialize main service plan screen
function initializeMainServicePlanScreen() {
  console.log('Service plan UI: Initializing main service plan screen...');
  
  // Display current car info
  displayCurrentCarInfo();
  
  // Setup event listeners
  setupEventListeners();
  
  // Load maintenance operations, critical alerts, and service plan
  loadMaintenanceOperations();
  loadCriticalAlerts();
  loadServicePlan();
  
  console.log('Service plan UI: Main screen initialized successfully');
}

// Display current car information
function displayCurrentCarInfo() {
  if (!selectedCar) return;
  
  const carInfoDiv = document.getElementById('current-car-info');
  const carNameSpan = document.getElementById('current-car-name');
  const mileageDisplaySpan = document.getElementById('current-mileage-display');
  
  if (carInfoDiv) {
    carInfoDiv.style.display = 'flex';
  }
  
  if (carNameSpan) {
    const displayName = selectedCar.name || `${selectedCar.brand || ''} ${selectedCar.model || ''}`.trim();
    const nickname = selectedCar.nickname ? ` "${selectedCar.nickname}"` : '';
    carNameSpan.textContent = displayName + nickname;
  }
  
  if (mileageDisplaySpan) {
    mileageDisplaySpan.textContent = currentMileage.toLocaleString();
  }
}

// Check if operation is already in service plan
function isOperationInPlan(operationName) {
  try {
    const servicePlan = localStorage.getItem('servicePlan');
    if (!servicePlan) return false;
    
    const plan = JSON.parse(servicePlan);
    return plan.some(item => 
      item.description === operationName && 
      item.carId == currentCarId
    );
  } catch (error) {
    console.error('Error checking operation in plan:', error);
    return false;
  }
}

// Get service plan item by operation name
function getServicePlanItem(operationName) {
  try {
    const servicePlan = localStorage.getItem('servicePlan');
    if (!servicePlan) return null;
    
    const plan = JSON.parse(servicePlan);
    return plan.find(item => 
      item.description === operationName && 
      item.carId == currentCarId
    );
  } catch (error) {
    console.error('Error getting service plan item:', error);
    return null;
  }
}

// Remove car selection popup from DOM
function removeServicePlanCarPopup() {
  const popup = document.getElementById('service-plan-car-popup');
  if (popup) {
    popup.remove();
  }
}

// Close car selection popup and navigate back
function closeServicePlanCarPopup() {
  removeServicePlanCarPopup();
  // Navigate back to overview when user cancels
  window.location.hash = '#my-car-overview';
}

// Remove mileage input popup from DOM
function removeServicePlanMileagePopup() {
  const popup = document.getElementById('service-plan-mileage-popup');
  if (popup) {
    popup.remove();
  }
}

// Close mileage input popup and go back to car selection
function closeServicePlanMileagePopup() {
  removeServicePlanMileagePopup();
  // Go back to car selection
  showCarSelectionPopup();
}

// Show error message
function showErrorMessage(message) {
  alert(message);
  // Navigate back to overview
  window.location.hash = '#my-car-overview';
}

// Setup event listeners
function setupEventListeners() {
  // Add operation button
  const addOperationBtn = document.getElementById('add-operation-btn');
  if (addOperationBtn) {
    addOperationBtn.addEventListener('click', openOperationModal);
  }
  
  // View all alerts button
  const viewAllAlertsBtn = document.getElementById('view-all-alerts-btn');
  if (viewAllAlertsBtn) {
    viewAllAlertsBtn.addEventListener('click', showAllAlertsModal);
  }
  
  // Operation type selection
  const operationOptions = document.querySelectorAll('.operation-option');
  operationOptions.forEach(option => {
    option.addEventListener('click', handleOperationTypeSelection);
  });
  
  // Maintenance operation selection
  const maintenanceSelect = document.getElementById('maintenance-operation-select');
  if (maintenanceSelect) {
    maintenanceSelect.addEventListener('change', handleMaintenanceSelection);
  }
}

// Load critical alerts
async function loadCriticalAlerts() {
  try {
    const alertsList = document.getElementById('critical-alerts-list');
    if (!alertsList) return;
    
    if (!currentCarId) {
      alertsList.innerHTML = '<div class="empty-state">Выберите автомобиль для просмотра предупреждений</div>';
      return;
    }
    
    // Get alerts from localStorage (in a real app, this would come from backend)
    let alerts = [];
    try {
      const storedAlerts = localStorage.getItem('userAlerts');
      if (storedAlerts) {
        alerts = JSON.parse(storedAlerts);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
    
    // Filter alerts for current car and get critical ones
    const carAlerts = alerts.filter(alert => alert.carId == currentCarId);
    const criticalAlerts = carAlerts.filter(alert => alert.priority === 'critical');
    
    if (criticalAlerts.length === 0) {
      alertsList.innerHTML = '<div class="empty-state">Критических предупреждений нет</div>';
      return;
    }
    
    // Render critical alerts
    alertsList.innerHTML = criticalAlerts.map(alert => {
      const alertDate = new Date(alert.date).toLocaleDateString();
      const isInPlan = isAlertInPlan(alert.id);
      
      return `
        <div class="critical-alert-item ${isInPlan ? 'in-plan' : ''}">
          <div class="alert-checkbox">
            <span class="checkbox ${isInPlan ? 'checked' : ''}">
              ${isInPlan ? '☑️' : '☐'}
            </span>
          </div>
          <div class="alert-info">
            <div class="alert-title ${isInPlan ? 'crossed' : ''}">${alert.title || 'Предупреждение'}</div>
            <div class="alert-description">${alert.description}</div>
            <div class="alert-details">
              <span class="alert-date">Дата: ${alertDate}</span>
              <span class="alert-priority critical">Критично</span>
            </div>
          </div>
          <div class="alert-actions">
            ${isInPlan ? 
              `<button class="btn btn-sm btn-danger recall-alert-from-plan-btn" onclick="recallAlertFromPlan('${alert.id}')">
                <span class="icon">↩️</span>
                Убрать из плана
              </button>` : ''
            }
          </div>
        </div>
      `;
    }).join('');
    
  } catch (error) {
    console.error('Error loading critical alerts:', error);
  }
}

// Check if alert is already in service plan
function isAlertInPlan(alertId) {
  try {
    const servicePlan = localStorage.getItem('servicePlan');
    if (!servicePlan) return false;
    
    const plan = JSON.parse(servicePlan);
    return plan.some(item => 
      item.alertId === alertId && 
      item.carId == currentCarId
    );
  } catch (error) {
    console.error('Error checking alert in plan:', error);
    return false;
  }
}



// Recall alert from plan
window.recallAlertFromPlan = function(alertId) {
  try {
    let servicePlan = localStorage.getItem('servicePlan');
    if (!servicePlan) {
      alert('План обслуживания пуст');
      return;
    }
    
    servicePlan = JSON.parse(servicePlan);
    
    // Find and remove the alert
    const index = servicePlan.findIndex(item => 
      item.alertId === alertId && 
      item.carId == currentCarId
    );
    
    if (index === -1) {
      alert('Предупреждение не найдено в плане');
      return;
    }
    
    servicePlan.splice(index, 1);
    localStorage.setItem('servicePlan', JSON.stringify(servicePlan));
    
    // Reload service plan and critical alerts
    loadServicePlan();
    loadCriticalAlerts();
    
    alert('Предупреждение убрано из плана');
    
  } catch (error) {
    console.error('Error recalling alert from plan:', error);
    alert('Ошибка удаления из плана: ' + error.message);
  }
};

// Show all alerts modal
function showAllAlertsModal() {
  try {
    if (!currentCarId) {
      alert('Пожалуйста, выберите автомобиль');
      return;
    }
    
    // Get all alerts for current car
    let alerts = [];
    try {
      const storedAlerts = localStorage.getItem('userAlerts');
      if (storedAlerts) {
        alerts = JSON.parse(storedAlerts);
      }
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
    
    const carAlerts = alerts.filter(alert => alert.carId == currentCarId);
    
    if (carAlerts.length === 0) {
      alert('Предупреждений для этого автомобиля нет');
      return;
    }
    
    // Create modal HTML
    const modalHTML = `
      <div class="popup-overlay" id="all-alerts-modal" style="display: flex;">
        <div class="popup-content" style="max-width: 800px; max-height: 80vh; overflow-y: auto;">
          <div class="popup-header">
            <h2>
              <span class="icon">📋</span>
              Все предупреждения
            </h2>
            <button class="modal-close" onclick="closeAllAlertsModal()">&times;</button>
          </div>
          
          <div class="popup-body">
            <div class="all-alerts-list">
              ${carAlerts.map(alert => {
                const alertDate = new Date(alert.date).toLocaleDateString();
                const isInPlan = isAlertInPlan(alert.id);
                const priorityClass = alert.priority === 'critical' ? 'critical' : 
                                    alert.priority === 'warning' ? 'warning' : 'info';
                const priorityText = alert.priority === 'critical' ? 'Критично' : 
                                   alert.priority === 'warning' ? 'Предупреждение' : 'Информация';
                
                return `
                  <div class="alert-item ${isInPlan ? 'in-plan' : ''} ${priorityClass}">
                    <div class="alert-checkbox">
                      <span class="checkbox ${isInPlan ? 'checked' : ''}">
                        ${isInPlan ? '☑️' : '☐'}
                      </span>
                    </div>
                    <div class="alert-info">
                      <div class="alert-title ${isInPlan ? 'crossed' : ''}">${alert.title || 'Предупреждение'}</div>
                      <div class="alert-description">${alert.description}</div>
                      <div class="alert-details">
                        <span class="alert-date">Дата: ${alertDate}</span>
                        <span class="alert-priority ${priorityClass}">${priorityText}</span>
                      </div>
                    </div>
                    <div class="alert-actions">
                      ${isInPlan ? 
                        `<button class="btn btn-sm btn-danger recall-alert-from-plan-btn" onclick="recallAlertFromPlan('${alert.id}')">
                          <span class="icon">↩️</span>
                          Убрать из плана
                        </button>` : ''
                      }
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          
          <div class="popup-footer">
            <button class="btn btn-secondary" onclick="closeAllAlertsModal()">Закрыть</button>
          </div>
        </div>
      </div>
    `;
    
    // Add modal to DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add close functionality
    window.closeAllAlertsModal = closeAllAlertsModal;
    
  } catch (error) {
    console.error('Error showing all alerts modal:', error);
    alert('Ошибка загрузки предупреждений: ' + error.message);
  }
}

// Close all alerts modal
function closeAllAlertsModal() {
  const modal = document.getElementById('all-alerts-modal');
  if (modal) {
    modal.remove();
  }
}



// Load maintenance operations
async function loadMaintenanceOperations() {
  try {
    const operationsList = document.getElementById('maintenance-operations-list');
    if (!operationsList) return;
    
    if (!currentCarId || currentMileage === 0) {
      operationsList.innerHTML = '<div class="empty-state">Добавьте текущий пробег для расчета следующего обслуживания</div>';
      return;
    }
    
    // Calculate next maintenance operations based on current mileage
    const operations = calculateNextMaintenance(currentMileage);
    
    if (operations.length === 0) {
      operationsList.innerHTML = '<div class="empty-state">Все операции обслуживания выполнены</div>';
      return;
    }
    
    // Calculate priority scores for each operation
    operations.forEach(operation => {
      // Calculate days until next service
      const nextDate = new Date(operation.nextDate);
      const currentDateObj = new Date(currentDate);
      const daysUntilService = Math.ceil((nextDate - currentDateObj) / (1000 * 60 * 60 * 24));
      
      // Calculate mileage until next service
      const mileageUntilService = operation.nextMileage - currentMileage;
      
      // Create a combined priority score (lower is more urgent)
      // Weight: 70% date priority, 30% mileage priority
      const dateScore = Math.max(0, daysUntilService) * 0.7;
      const mileageScore = Math.max(0, mileageUntilService) * 0.3;
      operation.priorityScore = dateScore + mileageScore;
      
      // Mark priority operations (first by date and mileage)
      operation.isFirstByDate = false;
      operation.isFirstByMileage = false;
    });
    
    // Sort operations by priority score (most urgent first)
    operations.sort((a, b) => a.priorityScore - b.priorityScore);
    
    // Mark the first operations as priority
    if (operations.length > 0) {
      operations[0].isFirstByMileage = true;
    }
    
    // Get only the 3 closest operations
    const closestOperations = operations.slice(0, 3);
    
    // Render operations
    operationsList.innerHTML = closestOperations.map(operation => {
      // Calculate days until service for display
      const nextDate = new Date(operation.nextDate);
      const currentDateObj = new Date(currentDate);
      const daysUntilService = Math.ceil((nextDate - currentDateObj) / (1000 * 60 * 60 * 24));
      
      // Calculate mileage until service for display
      const mileageUntilService = operation.nextMileage - currentMileage;
      
      // Determine urgency level
      let urgencyClass = '';
      let urgencyText = '';
      if (daysUntilService <= 30 || mileageUntilService <= 5000) {
        urgencyClass = 'urgent';
        urgencyText = 'Срочно';
      } else if (daysUntilService <= 90 || mileageUntilService <= 15000) {
        urgencyClass = 'soon';
        urgencyText = 'Скоро';
      } else {
        urgencyClass = 'normal';
        urgencyText = 'Планово';
      }
      
      // Check if operation is already in plan
      const isInPlan = isOperationInPlan(operation.name);
      const planItem = getServicePlanItem(operation.name);
      
      return `
        <div class="maintenance-operation-item ${operation.isFirstByDate || operation.isFirstByMileage ? 'priority' : ''} ${urgencyClass} ${isInPlan ? 'in-plan' : ''}">
          <div class="operation-checkbox">
            <span class="checkbox ${isInPlan ? 'checked' : ''}">
              ${isInPlan ? '☑️' : '☐'}
            </span>
          </div>
          <div class="operation-info">
            <div class="operation-name ${isInPlan ? 'crossed' : ''}">${operation.name}</div>
            <div class="operation-details">
              <span class="next-mileage">Следующий пробег: ${operation.nextMileage.toLocaleString()} км</span>
              <span class="next-date">Дата: ${operation.nextDate}</span>
              <span class="urgency-badge ${urgencyClass}">${urgencyText}</span>
            </div>
            <div class="operation-timing">
              <span class="days-until">${daysUntilService > 0 ? `через ${daysUntilService} дн.` : 'сегодня'}</span>
              <span class="mileage-until">${mileageUntilService > 0 ? `через ${mileageUntilService.toLocaleString()} км` : 'по пробегу'}</span>
            </div>
          </div>
          <div class="operation-actions">
            ${isInPlan ? 
              `<button class="btn btn-sm btn-danger recall-from-plan-btn" onclick="recallMaintenanceFromPlan('${operation.name}')">
                <span class="icon">↩️</span>
                Убрать из плана
              </button>` :
              `<button class="btn btn-sm btn-primary add-to-plan-btn" onclick="addMaintenanceToPlan('${operation.id}')">
                <span class="icon">📋</span>
                В план
              </button>`
            }
          </div>
        </div>
      `;
    }).join('');
    
    // Add "Show all operations" button if there are more than 3
    if (operations.length > 3) {
      operationsList.innerHTML += `
        <div class="show-all-operations">
          <button class="btn btn-secondary" onclick="showAllMaintenanceOperations()">
            <span class="icon">📋</span>
            Показать все операции (${operations.length})
          </button>
        </div>
      `;
    }
    
  } catch (error) {
    console.error('Error loading maintenance operations:', error);
  }
}

// Calculate next maintenance operations
function calculateNextMaintenance(currentMileage) {
  // This is a simplified calculation - in a real app, this would use car-specific maintenance schedules
  const operations = [
    {
      id: 'oil-change',
      name: 'Замена масла',
      interval: 10000,
      nextMileage: Math.ceil(currentMileage / 10000) * 10000,
      nextDate: calculateNextDate(currentMileage, 10000)
    },
    {
      id: 'oil-filter',
      name: 'Замена масляного фильтра',
      interval: 10000,
      nextMileage: Math.ceil(currentMileage / 10000) * 10000,
      nextDate: calculateNextDate(currentMileage, 10000)
    },
    {
      id: 'air-filter',
      name: 'Замена воздушного фильтра',
      interval: 30000,
      nextMileage: Math.ceil(currentMileage / 30000) * 30000,
      nextDate: calculateNextDate(currentMileage, 30000)
    },
    {
      id: 'fuel-filter',
      name: 'Замена топливного фильтра',
      interval: 60000,
      nextMileage: Math.ceil(currentMileage / 60000) * 60000,
      nextDate: calculateNextDate(currentMileage, 60000)
    },
    {
      id: 'brake-fluid',
      name: 'Замена тормозной жидкости',
      interval: 40000,
      nextMileage: Math.ceil(currentMileage / 40000) * 40000,
      nextDate: calculateNextDate(currentMileage, 40000)
    },
    {
      id: 'spark-plugs',
      name: 'Замена свечей зажигания',
      interval: 80000,
      nextMileage: Math.ceil(currentMileage / 80000) * 80000,
      nextDate: calculateNextDate(currentMileage, 80000)
    }
  ];
  
  // Mark priority operations (first by date and mileage)
  const sortedByDate = [...operations].sort((a, b) => new Date(a.nextDate) - new Date(b.nextDate));
  const sortedByMileage = [...operations].sort((a, b) => a.nextMileage - b.nextMileage);
  
  if (sortedByDate.length > 0) {
    sortedByDate[0].isFirstByDate = true;
  }
  if (sortedByMileage.length > 0) {
    sortedByMileage[0].isFirstByMileage = true;
  }
  
  return operations;
}

// Calculate next date based on mileage interval
function calculateNextDate(currentMileage, interval) {
  const nextMileage = Math.ceil(currentMileage / interval) * interval;
  const mileageDiff = nextMileage - currentMileage;
  
  // Assume average 15,000 km per year
  const daysToAdd = Math.ceil((mileageDiff / 15000) * 365);
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + daysToAdd);
  
  return nextDate.toISOString().split('T')[0];
}

// Load service plan
async function loadServicePlan() {
  try {
    const planList = document.getElementById('service-plan-list');
    if (!planList) return;
    
    // Get service plan from localStorage
    let servicePlan = localStorage.getItem('servicePlan');
    if (!servicePlan) {
      servicePlan = [];
    } else {
      servicePlan = JSON.parse(servicePlan);
    }
    
    if (servicePlan.length === 0) {
      planList.innerHTML = '<div class="empty-state">План обслуживания пуст. Добавьте операции из списка выше или создайте новые.</div>';
      return;
    }
    
    // Render service plan items
    planList.innerHTML = servicePlan.map((item, index) => `
      <div class="service-plan-item">
        <div class="plan-item-info">
          <div class="plan-item-type">${item.type === 'alert' ? '🚨 Проблема' : item.type === 'maintenance' ? '🔧 Обслуживание' : '🔨 Ремонт'}</div>
          <div class="plan-item-description">${item.description}</div>
          <div class="plan-item-date">Добавлено: ${new Date(item.addedDate).toLocaleDateString()}</div>
        </div>
        <div class="plan-item-actions">
          <button class="btn btn-sm btn-danger" onclick="removeFromPlan(${index})">
            <span class="icon">🗑️</span>
            Удалить
          </button>
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Error loading service plan:', error);
  }
}



function openOperationModal() {
  const modal = document.getElementById('operation-modal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeOperationModal() {
  const modal = document.getElementById('operation-modal');
  if (modal) {
    modal.style.display = 'none';
    // Reset form
    document.getElementById('maintenance-dropdown').style.display = 'none';
    document.getElementById('repair-form').style.display = 'none';
    document.getElementById('maintenance-operation-select').value = '';
    document.getElementById('repair-description').value = '';
  }
}



// Handle operation type selection
function handleOperationTypeSelection(event) {
  const type = event.currentTarget.getAttribute('data-type');
  const maintenanceDropdown = document.getElementById('maintenance-dropdown');
  const repairForm = document.getElementById('repair-form');
  
  // Hide both forms
  maintenanceDropdown.style.display = 'none';
  repairForm.style.display = 'none';
  
  // Show selected form
  if (type === 'maintenance') {
    maintenanceDropdown.style.display = 'block';
  } else if (type === 'repair') {
    repairForm.style.display = 'block';
  }
}

// Handle maintenance operation selection
function handleMaintenanceSelection(event) {
  const selectedValue = event.target.value;
  const saveBtn = document.getElementById('save-operation-btn');
  
  if (selectedValue) {
    saveBtn.disabled = false;
  } else {
    saveBtn.disabled = true;
  }
}

// Save operation to service plan
async function saveOperation() {
  try {
    const maintenanceDropdown = document.getElementById('maintenance-dropdown');
    const repairForm = document.getElementById('repair-form');
    
    let operationData = null;
    
    if (maintenanceDropdown.style.display !== 'none') {
      // Maintenance operation
      const selectedOperation = document.getElementById('maintenance-operation-select').value;
      if (!selectedOperation) {
        alert('Пожалуйста, выберите операцию');
        return;
      }
      
      const operationNames = {
        'oil-change': 'Замена масла',
        'oil-filter': 'Замена масляного фильтра',
        'air-filter': 'Замена воздушного фильтра',
        'fuel-filter': 'Замена топливного фильтра',
        'brake-fluid': 'Замена тормозной жидкости',
        'coolant': 'Замена охлаждающей жидкости',
        'spark-plugs': 'Замена свечей зажигания',
        'timing-belt': 'Замена ремня ГРМ',
        'brake-pads': 'Замена тормозных колодок',
        'tires': 'Замена шин'
      };
      
      operationData = {
        id: Date.now(),
        type: 'maintenance',
        description: operationNames[selectedOperation],
        carId: currentCarId,
        addedDate: new Date().toISOString()
      };
      
    } else if (repairForm.style.display !== 'none') {
      // Repair operation
      const description = document.getElementById('repair-description').value.trim();
      if (!description) {
        alert('Пожалуйста, опишите ремонт');
        return;
      }
      
      operationData = {
        id: Date.now(),
        type: 'repair',
        description: description,
        carId: currentCarId,
        addedDate: new Date().toISOString()
      };
    }
    
    if (operationData) {
      // Add to service plan
      let servicePlan = localStorage.getItem('servicePlan');
      if (!servicePlan) {
        servicePlan = [];
      } else {
        servicePlan = JSON.parse(servicePlan);
      }
      
      servicePlan.push(operationData);
      localStorage.setItem('servicePlan', JSON.stringify(servicePlan));
      
      // Reload service plan and maintenance operations
      loadServicePlan();
      loadMaintenanceOperations();
      
      // Close modal
      closeOperationModal();
      
      alert('Операция добавлена в план');
    }
    
  } catch (error) {
    console.error('Error saving operation:', error);
    alert('Ошибка сохранения операции: ' + error.message);
  }
}

// Add maintenance operation to plan
window.addMaintenanceToPlan = function(operationId) {
  try {
    const operations = calculateNextMaintenance(currentMileage);
    const operation = operations.find(op => op.id === operationId);
    
    if (!operation) {
      alert('Операция не найдена');
      return;
    }
    
    const operationData = {
      id: Date.now(),
      type: 'maintenance',
      description: operation.name,
      carId: currentCarId,
      nextMileage: operation.nextMileage,
      nextDate: operation.nextDate,
      addedDate: new Date().toISOString()
    };
    
    // Add to service plan
    let servicePlan = localStorage.getItem('servicePlan');
    if (!servicePlan) {
      servicePlan = [];
    } else {
      servicePlan = JSON.parse(servicePlan);
    }
    
    servicePlan.push(operationData);
    localStorage.setItem('servicePlan', JSON.stringify(servicePlan));
    
    // Reload service plan and maintenance operations
    loadServicePlan();
    loadMaintenanceOperations();
    
    alert('Операция добавлена в план');
    
  } catch (error) {
    console.error('Error adding maintenance to plan:', error);
    alert('Ошибка добавления в план: ' + error.message);
  }
};

// Recall maintenance operation from plan
window.recallMaintenanceFromPlan = function(operationName) {
  try {
    let servicePlan = localStorage.getItem('servicePlan');
    if (!servicePlan) {
      alert('План обслуживания пуст');
      return;
    }
    
    servicePlan = JSON.parse(servicePlan);
    
    // Find and remove the operation
    const index = servicePlan.findIndex(item => 
      item.description === operationName && 
      item.carId == currentCarId
    );
    
    if (index === -1) {
      alert('Операция не найдена в плане');
      return;
    }
    
    servicePlan.splice(index, 1);
    localStorage.setItem('servicePlan', JSON.stringify(servicePlan));
    
    // Reload service plan and maintenance operations
    loadServicePlan();
    loadMaintenanceOperations();
    
    alert('Операция убрана из плана');
    
  } catch (error) {
    console.error('Error recalling maintenance from plan:', error);
    alert('Ошибка удаления из плана: ' + error.message);
  }
};

// Remove item from plan
window.removeFromPlan = function(index) {
  try {
    let servicePlan = localStorage.getItem('servicePlan');
    if (!servicePlan) return;
    
    servicePlan = JSON.parse(servicePlan);
    servicePlan.splice(index, 1);
    localStorage.setItem('servicePlan', JSON.stringify(servicePlan));
    
    // Reload service plan, maintenance operations, and critical alerts
    loadServicePlan();
    loadMaintenanceOperations();
    loadCriticalAlerts();
    
    alert('Операция удалена из плана');
    
  } catch (error) {
    console.error('Error removing from plan:', error);
    alert('Ошибка удаления из плана: ' + error.message);
  }
};

// Show all maintenance operations
window.showAllMaintenanceOperations = function() {
  loadAllMaintenanceOperations();
};

// Load all maintenance operations (not just the 3 closest)
async function loadAllMaintenanceOperations() {
  try {
    const operationsList = document.getElementById('maintenance-operations-list');
    if (!operationsList) return;
    
    if (!currentCarId || currentMileage === 0) {
      operationsList.innerHTML = '<div class="empty-state">Добавьте текущий пробег для расчета следующего обслуживания</div>';
      return;
    }
    
    // Calculate next maintenance operations based on current mileage
    const operations = calculateNextMaintenance(currentMileage);
    
    if (operations.length === 0) {
      operationsList.innerHTML = '<div class="empty-state">Все операции обслуживания выполнены</div>';
      return;
    }
    
    // Calculate priority scores for each operation
    operations.forEach(operation => {
      // Calculate days until next service
      const nextDate = new Date(operation.nextDate);
      const currentDateObj = new Date(currentDate);
      const daysUntilService = Math.ceil((nextDate - currentDateObj) / (1000 * 60 * 60 * 24));
      
      // Calculate mileage until next service
      const mileageUntilService = operation.nextMileage - currentMileage;
      
      // Create a combined priority score (lower is more urgent)
      const dateScore = Math.max(0, daysUntilService) * 0.7;
      const mileageScore = Math.max(0, mileageUntilService) * 0.3;
      operation.priorityScore = dateScore + mileageScore;
      
      // Mark priority operations
      operation.isFirstByDate = false;
      operation.isFirstByMileage = false;
    });
    
    // Sort operations by priority score (most urgent first)
    operations.sort((a, b) => a.priorityScore - b.priorityScore);
    
    // Mark the first operations as priority
    if (operations.length > 0) {
      operations[0].isFirstByMileage = true;
    }
    
    // Render all operations
    operationsList.innerHTML = operations.map(operation => {
      // Calculate days until service for display
      const nextDate = new Date(operation.nextDate);
      const currentDateObj = new Date(currentDate);
      const daysUntilService = Math.ceil((nextDate - currentDateObj) / (1000 * 60 * 60 * 24));
      
      // Calculate mileage until service for display
      const mileageUntilService = operation.nextMileage - currentMileage;
      
      // Determine urgency level
      let urgencyClass = '';
      let urgencyText = '';
      if (daysUntilService <= 30 || mileageUntilService <= 5000) {
        urgencyClass = 'urgent';
        urgencyText = 'Срочно';
      } else if (daysUntilService <= 90 || mileageUntilService <= 15000) {
        urgencyClass = 'soon';
        urgencyText = 'Скоро';
      } else {
        urgencyClass = 'normal';
        urgencyText = 'Планово';
      }
      
      // Check if operation is already in plan
      const isInPlan = isOperationInPlan(operation.name);
      const planItem = getServicePlanItem(operation.name);
      
      return `
        <div class="maintenance-operation-item ${operation.isFirstByDate || operation.isFirstByMileage ? 'priority' : ''} ${urgencyClass} ${isInPlan ? 'in-plan' : ''}">
          <div class="operation-checkbox">
            <span class="checkbox ${isInPlan ? 'checked' : ''}">
              ${isInPlan ? '☑️' : '☐'}
            </span>
          </div>
          <div class="operation-info">
            <div class="operation-name ${isInPlan ? 'crossed' : ''}">${operation.name}</div>
            <div class="operation-details">
              <span class="next-mileage">Следующий пробег: ${operation.nextMileage.toLocaleString()} км</span>
              <span class="next-date">Дата: ${operation.nextDate}</span>
              <span class="urgency-badge ${urgencyClass}">${urgencyText}</span>
            </div>
            <div class="operation-timing">
              <span class="days-until">${daysUntilService > 0 ? `через ${daysUntilService} дн.` : 'сегодня'}</span>
              <span class="mileage-until">${mileageUntilService > 0 ? `через ${mileageUntilService.toLocaleString()} км` : 'по пробегу'}</span>
            </div>
          </div>
          <div class="operation-actions">
            ${isInPlan ? 
              `<button class="btn btn-sm btn-danger recall-from-plan-btn" onclick="recallMaintenanceFromPlan('${operation.name}')">
                <span class="icon">↩️</span>
                Убрать из плана
              </button>` :
              `<button class="btn btn-sm btn-primary add-to-plan-btn" onclick="addMaintenanceToPlan('${operation.id}')">
                <span class="icon">📋</span>
                В план
              </button>`
            }
          </div>
        </div>
      `;
    }).join('');
    
    // Add "Show only closest" button
    operationsList.innerHTML += `
      <div class="show-closest-operations">
        <button class="btn btn-secondary" onclick="loadMaintenanceOperations()">
          <span class="icon">📋</span>
          Показать только ближайшие (3)
        </button>
      </div>
    `;
    
  } catch (error) {
    console.error('Error loading all maintenance operations:', error);
  }
};

// Make functions available globally
window.closeOperationModal = closeOperationModal;
window.saveOperation = saveOperation;
window.loadMaintenanceOperations = loadMaintenanceOperations; 