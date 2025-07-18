import { DataService } from './dataService.js';
import { CONFIG } from './config.js';

// Global variables
let currentCarId = null;
let currentMileage = 0;
let currentDate = new Date().toISOString().split('T')[0];

// Initialize service plan UI
export function initializeServicePlanUI() {
  console.log('Service plan UI initializing...');
  
  // Set current date in mileage form
  const mileageDateInput = document.getElementById('mileage-date');
  if (mileageDateInput) {
    mileageDateInput.value = currentDate;
  }
  
  // Get current car ID
  currentCarId = localStorage.getItem('currentCarId');
  
  // Load current mileage
  loadCurrentMileage();
  
  // Setup event listeners
  setupEventListeners();
  
  // Load maintenance operations and service plan
  loadMaintenanceOperations();
  loadServicePlan();
  
  console.log('Service plan UI initialized successfully');
}

// Setup event listeners
function setupEventListeners() {
  // Add mileage button
  const addMileageBtn = document.getElementById('add-mileage-btn');
  if (addMileageBtn) {
    addMileageBtn.addEventListener('click', openMileageModal);
  }
  
  // Mileage form submission
  const mileageForm = document.getElementById('mileage-form');
  if (mileageForm) {
    mileageForm.addEventListener('submit', handleMileageSubmission);
  }
  
  // Add operation button
  const addOperationBtn = document.getElementById('add-operation-btn');
  if (addOperationBtn) {
    addOperationBtn.addEventListener('click', openOperationModal);
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

// Load current mileage
async function loadCurrentMileage() {
  try {
    if (!currentCarId) return;
    
    // Get latest mileage entry
    const { mileageHandler } = await import('./mileageHandler.js');
    const mileageData = await mileageHandler.getMileageData(currentCarId);
    
    if (mileageData && mileageData.length > 0) {
      // Get the latest entry
      const latestEntry = mileageData[mileageData.length - 1];
      currentMileage = latestEntry.mileage;
      currentDate = latestEntry.date;
      
      console.log(`Current mileage: ${currentMileage} km, date: ${currentDate}`);
    }
  } catch (error) {
    console.error('Error loading current mileage:', error);
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
    
    // Sort operations by priority (date first, then mileage)
    operations.sort((a, b) => {
      if (a.isFirstByDate && !b.isFirstByDate) return -1;
      if (!a.isFirstByDate && b.isFirstByDate) return 1;
      if (a.isFirstByMileage && !b.isFirstByMileage) return -1;
      if (!a.isFirstByMileage && b.isFirstByMileage) return 1;
      return a.nextMileage - b.nextMileage;
    });
    
    // Render operations
    operationsList.innerHTML = operations.map(operation => `
      <div class="maintenance-operation-item ${operation.isFirstByDate || operation.isFirstByMileage ? 'priority' : ''}">
        <div class="operation-info">
          <div class="operation-name">${operation.name}</div>
          <div class="operation-details">
            <span class="next-mileage">Следующий пробег: ${operation.nextMileage.toLocaleString()} км</span>
            <span class="next-date">Дата: ${operation.nextDate}</span>
          </div>
        </div>
        <div class="operation-actions">
          <button class="btn btn-sm btn-primary add-to-plan-btn" onclick="addMaintenanceToPlan('${operation.id}')">
            <span class="icon">📋</span>
            В план
          </button>
        </div>
      </div>
    `).join('');
    
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

// Modal functions
function openMileageModal() {
  const modal = document.getElementById('mileage-modal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeMileageModal() {
  const modal = document.getElementById('mileage-modal');
  if (modal) {
    modal.style.display = 'none';
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

// Handle mileage form submission
async function handleMileageSubmission(event) {
  event.preventDefault();
  
  try {
    const mileage = parseInt(document.getElementById('current-mileage').value);
    const date = document.getElementById('mileage-date').value;
    
    if (!currentCarId) {
      alert('Пожалуйста, выберите автомобиль');
      return;
    }
    
    // Add mileage entry
    const { mileageHandler } = await import('./mileageHandler.js');
    await mileageHandler.addMileageEntry(currentCarId, mileage, date, 'manual', {
      note: 'Текущий пробег для планирования обслуживания'
    });
    
    // Update current values
    currentMileage = mileage;
    currentDate = date;
    
    // Reload maintenance operations
    loadMaintenanceOperations();
    
    // Close modal
    closeMileageModal();
    
    alert('Пробег успешно добавлен');
    
  } catch (error) {
    console.error('Error saving mileage:', error);
    alert('Ошибка сохранения пробега: ' + error.message);
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
      
      // Reload service plan
      loadServicePlan();
      
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
    
    // Reload service plan
    loadServicePlan();
    
    alert('Операция добавлена в план');
    
  } catch (error) {
    console.error('Error adding maintenance to plan:', error);
    alert('Ошибка добавления в план: ' + error.message);
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
    
    // Reload service plan
    loadServicePlan();
    
    alert('Операция удалена из плана');
    
  } catch (error) {
    console.error('Error removing from plan:', error);
    alert('Ошибка удаления из плана: ' + error.message);
  }
};

// Make functions available globally
window.closeMileageModal = closeMileageModal;
window.closeOperationModal = closeOperationModal;
window.saveOperation = saveOperation; 