import { DataService } from './dataService.js';
import { showConfirmationDialog } from './dialogs.js';

// Service Record State Management
let currentServiceRecord = null;
let subRecordsCounter = 1;

// Service Record Structure
class ServiceRecord {
  constructor(carId, date, mileage = null) {
    this.id = Date.now();
    this.carId = carId;
    this.date = date;
    this.mileage = mileage;
    this.createdAt = new Date().toISOString();
    this.subRecords = [];
  }
}

class SubRecord {
  constructor(type, data) {
    this.id = subRecordsCounter++;
    this.type = type; // 'maintenance' or 'repair'
    this.data = data;
    this.createdAt = new Date().toISOString();
  }
}

// Draft Management
const DRAFT_STORAGE_KEY = 'serviceRecordDraft';

// Save current service record as draft
function saveDraftToStorage() {
  if (!currentServiceRecord) return;
  
  try {
    const draftData = {
      serviceRecord: currentServiceRecord,
      subRecordsCounter: subRecordsCounter,
      savedAt: new Date().toISOString()
    };
    
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
    console.log('📝 Draft saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving draft:', error);
    return false;
  }
}

// Load draft from storage
function loadDraftFromStorage() {
  try {
    const draftJson = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!draftJson) return null;
    
    const draftData = JSON.parse(draftJson);
    console.log('📝 Draft loaded successfully');
    return draftData;
  } catch (error) {
    console.error('Error loading draft:', error);
    // Clear corrupted draft
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    return null;
  }
}

// Clear draft from storage
function clearDraft() {
  localStorage.removeItem(DRAFT_STORAGE_KEY);
  console.log('📝 Draft cleared');
}

// Check if draft exists
function hasDraft() {
  return localStorage.getItem(DRAFT_STORAGE_KEY) !== null;
}

// Auto-save functionality
let autoSaveInterval = null;

function startAutoSave() {
  // Auto-save every 30 seconds
  if (autoSaveInterval) clearInterval(autoSaveInterval);
  
  autoSaveInterval = setInterval(() => {
    if (currentServiceRecord) {
      saveDraftToStorage();
      showSuccessMessage('Черновик автоматически сохранен', 1000);
    }
  }, 30000);
  
  // Also save when user leaves the page
  window.addEventListener('beforeunload', function(e) {
    if (currentServiceRecord) {
      saveDraftToStorage();
    }
  });
}

function stopAutoSave() {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }
}

// Initialize Service Record
export function initializeServiceRecord() {
  console.log('🚗 Service Record Manager: Initializing...');
  
  // Check if there's a draft and offer to load it
  if (hasDraft()) {
    showDraftLoadDialog();
  } else {
    // Show car selection popup first
    showCarSelectionPopup();
  }
}

// Show draft load dialog
function showDraftLoadDialog() {
  const draftData = loadDraftFromStorage();
  if (!draftData) {
    // No valid draft, proceed normally
    showCarSelectionPopup();
    return;
  }
  
  const savedDate = new Date(draftData.savedAt).toLocaleString('ru-RU');
  
  showConfirmationDialog(
    `Найден сохраненный черновик записи от ${savedDate}. Загрузить его?`,
    () => {
      // Load draft
      loadDraft();
    },
    () => {
      // Don't load draft, proceed with new record
      clearDraft();
      showCarSelectionPopup();
    }
  );
}

// Load draft and restore the form
function loadDraft() {
  const draftData = loadDraftFromStorage();
  if (!draftData) return;
  
  try {
    // Restore service record
    currentServiceRecord = draftData.serviceRecord;
    subRecordsCounter = draftData.subRecordsCounter;
    
    // Make available globally
    window.currentServiceRecord = currentServiceRecord;
    
    // Update the UI with draft data
    updateServiceRecordFromDraft();
    
    // Start auto-save
    startAutoSave();
    
    // Show success message
    showSuccessMessage('Черновик загружен');
    
    console.log('Draft loaded successfully:', currentServiceRecord);
  } catch (error) {
    console.error('Error loading draft:', error);
    clearDraft();
    showErrorMessage('Ошибка загрузки черновика');
    showCarSelectionPopup();
  }
}

// Update UI with draft data
async function updateServiceRecordFromDraft() {
  if (!currentServiceRecord) return;
  
  // Update date input
  const dateInput = document.getElementById('service-record-date');
  if (dateInput) {
    dateInput.value = currentServiceRecord.date || '';
  }
  
  // Update mileage input
  const mileageInput = document.getElementById('service-record-mileage');
  if (mileageInput) {
    mileageInput.value = currentServiceRecord.mileage || '';
  }
  
  // Update car information in header
  await updateServiceRecordCarInfo(currentServiceRecord.carId);
  
  // Setup event listeners
  setupServiceRecordEventListeners();
  
  // Update UI with existing sub-records
  updateServiceRecordUI();
}

// Show car selection popup
async function showCarSelectionPopup() {
  console.log('🚗 Service Record Manager: Showing car selection popup...');
  
  try {
    const cars = await DataService.getCars();
    console.log('🚗 Service Record Manager: Found cars:', cars.length);
    
    if (cars.length === 0) {
      console.log('🚗 Service Record Manager: No cars found, showing error message');
      showErrorMessage('Сначала добавьте автомобиль в разделе "Мои автомобили"');
      return;
    }
    
    // Create popup HTML - only car selection, no date/mileage
    const popupHTML = `
      <div class="popup-overlay" id="car-selection-popup" style="display: flex;">
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
            <button class="btn btn-secondary" onclick="closeCarSelectionPopup()">Отмена</button>
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
        
        // Remove current popup without navigation (we want to stay on service-record page)
        removeCarSelectionPopup();
        
        // Show date/mileage popup for selected car
        showDateMileagePopup(carId);
      });
    });
    
    // Add close functionality
    window.closeCarSelectionPopup = closeCarSelectionPopup;
    
  } catch (error) {
    console.error('Error showing car selection popup:', error);
    showErrorMessage('Ошибка загрузки списка автомобилей');
  }
}

// Show date and mileage selection popup
async function showDateMileagePopup(carId) {
  console.log('🚗 Service Record Manager: Showing date/mileage popup for car:', carId);
  
  try {
    const cars = await DataService.getCars();
    const selectedCar = cars.find(car => car.id == carId);
    
    if (!selectedCar) {
      showErrorMessage('Выбранный автомобиль не найден');
      return;
    }
    
    const displayName = selectedCar.name || `${selectedCar.brand || ''} ${selectedCar.model || ''}`.trim();
    const nickname = selectedCar.nickname ? ` "${selectedCar.nickname}"` : '';
    const fullName = displayName + nickname;
    
    // Create popup HTML for date/mileage selection
    const popupHTML = `
      <div class="popup-overlay" id="date-mileage-popup" style="display: flex;">
        <div class="popup-content">
          <div class="popup-header">
            <h2>
              <span class="icon">📅</span>
              Дата и пробег обслуживания
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
            
            <div class="car-selection-date">
              <label for="date-mileage-date">
                <span class="icon">📅</span>
                Дата обслуживания:
              </label>
              <input type="text" id="date-mileage-date" required pattern="\\d{2}\\.\\d{2}\\.\\d{4}" placeholder="дд.мм.гггг">
            </div>
            
            <div class="car-selection-mileage">
              <label for="date-mileage-mileage">
                <span class="icon">🛣️</span>
                Пробег (км):
              </label>
              <input type="number" id="date-mileage-mileage" required min="0" placeholder="Введите пробег" value="${selectedCar.mileage || ''}">
            </div>
          </div>
          
          <div class="popup-footer">
            <button class="btn btn-primary" onclick="confirmDateMileage('${carId}')">
              <span class="icon">✅</span>
              Продолжить
            </button>
            <button class="btn btn-secondary" onclick="closeDateMileagePopup()">Отмена</button>
          </div>
        </div>
      </div>
    `;
    
    // Add popup to DOM
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    
    // Set default date to today
    const dateInput = document.getElementById('date-mileage-date');
    if (dateInput) {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      dateInput.value = `${dd}.${mm}.${yyyy}`;
    }
    
    // Add global functions for popup buttons
    window.confirmDateMileage = confirmDateMileage;
    window.closeDateMileagePopup = closeDateMileagePopup;
    
  } catch (error) {
    console.error('Error showing date/mileage popup:', error);
    showErrorMessage('Ошибка показа формы даты и пробега');
  }
}

// Confirm date and mileage selection
function confirmDateMileage(carId) {
  const date = document.getElementById('date-mileage-date').value;
  const mileage = document.getElementById('date-mileage-mileage').value;
  
  console.log('Confirming date/mileage:', { carId, date, mileage });
  
  if (!date || !/^\d{2}\.\d{2}\.\d{4}$/.test(date)) {
    showErrorMessage('Пожалуйста, введите корректную дату в формате дд.мм.гггг');
    return;
  }

  if (!mileage || isNaN(mileage) || Number(mileage) < 0) {
    showErrorMessage('Пожалуйста, введите корректный пробег');
    return;
  }
  
  // Close popup without navigation (we want to stay on service-record page)
  removeDateMileagePopup();
  
  // Create service record with selected car, date, and mileage
  createServiceRecordWithCar(carId, date, mileage);
}

// Remove date/mileage popup from DOM (without navigation)
function removeDateMileagePopup() {
  const popup = document.getElementById('date-mileage-popup');
  if (popup) {
    popup.remove();
  }
}

// Close date/mileage popup and navigate back (only when user cancels)
function closeDateMileagePopup() {
  removeDateMileagePopup();
  // Navigate back to overview when user cancels
  window.location.hash = '#my-car-overview';
}

// Remove car selection popup from DOM (without navigation)
function removeCarSelectionPopup() {
  const popup = document.getElementById('car-selection-popup');
  if (popup) {
    popup.remove();
  }
}

// Close car selection popup and navigate back (only when user cancels)
function closeCarSelectionPopup() {
  removeCarSelectionPopup();
  // Navigate back to overview when user cancels
  window.location.hash = '#my-car-overview';
}

// Create service record with selected car
async function createServiceRecordWithCar(carId, date, mileage = null) {
  console.log('Creating service record with car:', carId, 'date:', date, 'mileage:', mileage);
  
  currentServiceRecord = new ServiceRecord(carId, date, mileage);
  subRecordsCounter = 1;
  
  // Make available globally for other modules
  window.currentServiceRecord = currentServiceRecord;
  
  console.log('New service record created:', currentServiceRecord);
  
  // Update the date input in the service record header
  const dateInput = document.getElementById('service-record-date');
  if (dateInput) {
    dateInput.value = date;
    console.log('Updated date input:', date);
  } else {
    console.warn('Date input not found');
  }
  
  // Update the mileage input in the service record header
  const mileageInput = document.getElementById('service-record-mileage');
  if (mileageInput) {
    mileageInput.value = mileage || '';
    console.log('Updated mileage input:', mileage);
  } else {
    console.warn('Mileage input not found');
  }
  
  // Update car information in header
  await updateServiceRecordCarInfo(carId);
  
  // Setup event listeners
  setupServiceRecordEventListeners();
  
  // Update UI
  updateServiceRecordUI();
  
  // Start auto-save
  startAutoSave();
  
  // Show success message
  showSuccessMessage('Запись об обслуживании создана');
  
  console.log('Service record creation completed successfully');
}

// Update car information in service record header
async function updateServiceRecordCarInfo(carId) {
  try {
    const cars = await DataService.getCars();
    const selectedCar = cars.find(car => car.id == carId);
    
    if (!selectedCar) {
      console.error('Selected car not found:', carId);
      return;
    }
    
    const carContainer = document.getElementById('service-record-car');
    const carImgEl = document.getElementById('service-record-car-img');
    const carNameEl = document.getElementById('service-record-car-name');
    const carYearEl = document.getElementById('service-record-car-year');
    
    if (carContainer) {
      carContainer.style.display = 'block';
    }
    
    if (carImgEl) {
      if (selectedCar.img && selectedCar.img.startsWith('data:image/')) {
        // Replace span with img for base64 images
        carImgEl.innerHTML = `<img src="${selectedCar.img}" alt="car image">`;
      } else {
        carImgEl.textContent = selectedCar.img || '🚗';
      }
    }
    
    if (carNameEl) {
      const displayName = selectedCar.name || `${selectedCar.brand || ''} ${selectedCar.model || ''}`.trim();
      const nickname = selectedCar.nickname ? ` "${selectedCar.nickname}"` : '';
      carNameEl.textContent = displayName + nickname;
    }
    
    if (carYearEl && selectedCar.year) {
      carYearEl.textContent = `${selectedCar.year} год`;
    }
    
  } catch (error) {
    console.error('Error updating car info:', error);
  }
}

// Setup event listeners
function setupServiceRecordEventListeners() {
  // Date input change (both input and change events for real-time updates)
  const dateInput = document.getElementById('service-record-date');
  if (dateInput) {
    const updateDate = function() {
      if (currentServiceRecord) {
        currentServiceRecord.date = this.value;
      }
    };
    dateInput.addEventListener('input', updateDate);
    dateInput.addEventListener('change', updateDate);
  }
  
  // Mileage input change (both input and change events for real-time updates)
  const mileageInput = document.getElementById('service-record-mileage');
  if (mileageInput) {
    const updateMileage = function() {
      if (currentServiceRecord) {
        currentServiceRecord.mileage = this.value;
      }
    };
    mileageInput.addEventListener('input', updateMileage);
    mileageInput.addEventListener('change', updateMileage);
  }
  
  // Operation dropdown
  const operationDropdown = document.getElementById('operation-dropdown');
  if (operationDropdown) {
    operationDropdown.addEventListener('change', onOperationSelect);
  }
  
  // Custom repair button
  const customRepairBtn = document.getElementById('custom-repair-btn');
  if (customRepairBtn) {
    customRepairBtn.addEventListener('click', openRepairPopup);
  }
  
  // Add spare button
  const addSpareBtn = document.getElementById('add-spare-btn');
  if (addSpareBtn) {
    addSpareBtn.addEventListener('click', openSparePopup);
  }
  
  // Load operations
  loadOperations();
  
  // Add event listeners for dynamic cost and quantity inputs
  document.addEventListener('input', function(e) {
    if (e.target.classList.contains('cost-input') || e.target.classList.contains('quantity-input')) {
      calculateMaintTotal();
    }
  });
  
  // Add event listener for repair work cost
  document.addEventListener('input', function(e) {
    if (e.target.id === 'repair-work-cost') {
      calculateRepairTotal();
    }
  });
}

// Update service record UI
function updateServiceRecordUI() {
  updateSubRecordsList();
  updateSummary();
  updateSaveButton();
}

// Update sub-records list
function updateSubRecordsList() {
  const listContainer = document.getElementById('sub-records-list');
  if (!listContainer) return;
  
  if (!currentServiceRecord || currentServiceRecord.subRecords.length === 0) {
    listContainer.innerHTML = `
      <div class="empty-state">
        <span class="icon">📝</span>
        <p>Нет добавленных операций</p>
        <p>Добавьте операции из левой панели</p>
      </div>
    `;
    return;
  }
  
  const html = currentServiceRecord.subRecords.map(subRecord => {
    const typeLabel = subRecord.type === 'maintenance' ? 'ТО' : 'Ремонт';
    const typeClass = subRecord.type === 'maintenance' ? 'maintenance' : 'repair';
    
    let details = '';
    let cost = 0;
    
    if (subRecord.type === 'maintenance') {
      const maintData = subRecord.data;
      details = `
        <div class="sub-record-detail">
          <span>Операция:</span>
          <span>${maintData.operationName || 'Не указано'}</span>
        </div>
        <div class="sub-record-detail">
          <span>Пробег:</span>
          <span>${maintData.mileage || 'Не указано'} км</span>
        </div>
      `;
      cost = maintData.totalCost || 0;
    } else {
      const repairData = subRecord.data;
      details = `
        <div class="sub-record-detail">
          <span>Операция:</span>
          <span>${repairData.operationName || 'Не указано'}</span>
        </div>
        <div class="sub-record-detail">
          <span>Пробег:</span>
          <span>${repairData.mileage || 'Не указано'} км</span>
        </div>
        <div class="sub-record-detail">
          <span>Запчасти:</span>
          <span>${repairData.spares ? repairData.spares.length : 0} шт.</span>
        </div>
      `;
      cost = repairData.totalCost || 0;
    }
    
    return `
      <div class="sub-record-item" data-sub-record-id="${subRecord.id}">
        <div class="sub-record-header">
          <div class="sub-record-title">${subRecord.data.operationName || 'Операция'}</div>
          <span class="sub-record-type ${typeClass}">${typeLabel}</span>
        </div>
        <div class="sub-record-details">
          ${details}
        </div>
        <div class="sub-record-cost">${Number(cost).toLocaleString('ru-RU')} ₽</div>
        <div class="sub-record-actions">
          <button class="btn-edit" onclick="editSubRecord(${subRecord.id})">Изменить</button>
          <button class="btn-remove" onclick="removeSubRecord(${subRecord.id})">Удалить</button>
        </div>
      </div>
    `;
  }).join('');
  
  listContainer.innerHTML = html;
}

// Update summary
function updateSummary() {
  const totalOperationsEl = document.getElementById('total-operations');
  const totalCostEl = document.getElementById('total-cost');
  
  if (!currentServiceRecord) {
    if (totalOperationsEl) totalOperationsEl.textContent = '0';
    if (totalCostEl) totalCostEl.textContent = '0 ₽';
    return;
  }
  
  const totalOperations = currentServiceRecord.subRecords.length;
  const totalCost = currentServiceRecord.subRecords.reduce((sum, subRecord) => {
    return sum + (Number(subRecord.data.totalCost) || 0);
  }, 0);
  
  if (totalOperationsEl) totalOperationsEl.textContent = totalOperations;
  if (totalCostEl) totalCostEl.textContent = `${totalCost.toLocaleString('ru-RU')} ₽`;
}

// Update save button state
function updateSaveButton() {
  const saveAndExitBtn = document.getElementById('save-and-exit-btn');
  if (!saveAndExitBtn) return;
  
  const canSave = currentServiceRecord && 
                  currentServiceRecord.date && 
                  currentServiceRecord.mileage &&
                  currentServiceRecord.subRecords.length > 0;
  
  saveAndExitBtn.disabled = !canSave;
}

// Add maintenance to record
export function addMaintenanceToRecord() {
  if (!currentServiceRecord) {
    console.error('No active service record');
    return;
  }
  
  // Validate service record has required data
  if (!currentServiceRecord.date || !currentServiceRecord.mileage) {
    alert('Пожалуйста, заполните дату и пробег в записи об обслуживании');
    return;
  }
  
  // Collect maintenance data from popup
  const workCost = parseFloat(document.getElementById('work-cost')?.value) || 0;
  const operationName = document.getElementById('maint-operation-name')?.textContent;
  
  if (!operationName) {
    alert('Пожалуйста, выберите операцию');
    return;
  }
  
  // Collect consumables
  const consumables = [];
  const consumableItems = document.querySelectorAll('#consumables-list .consumable-item');
  
  consumableItems.forEach(item => {
    const name = item.querySelector('.consumable-name')?.textContent;
    const itemInput = item.querySelector('.item-input')?.value;
    const cost = parseFloat(item.querySelector('.cost-input')?.value) || 0;
    const quantity = parseFloat(item.querySelector('.quantity-input')?.value) || 1;
    
    if (name) {
      consumables.push({
        name: name,
        item: itemInput || name,
        cost: cost,
        quantity: quantity,
        totalCost: cost * quantity
      });
    }
  });
  
  // Calculate total
  const consumablesCost = consumables.reduce((sum, c) => sum + c.totalCost, 0);
  const totalCost = consumablesCost + workCost;
  
  // Create maintenance data using service record mileage
  const maintenanceData = {
    operationName: operationName,
    mileage: Number(currentServiceRecord.mileage),
    consumables: consumables,
    workCost: workCost,
    totalCost: totalCost,
    carId: currentServiceRecord.carId
  };
  
  // Add to service record
  const subRecord = new SubRecord('maintenance', maintenanceData);
  currentServiceRecord.subRecords.push(subRecord);
  
  console.log('Maintenance added to record:', subRecord);
  
  // Update UI
  updateServiceRecordUI();
  
  // Close popup
  closeMaintPopup();
  
  // Show success message
  showSuccessMessage('Операция добавлена в запись');
}

// Add repair to record
export function addRepairToRecord() {
  if (!currentServiceRecord) {
    console.error('No active service record');
    return;
  }
  
  // Validate service record has required data
  if (!currentServiceRecord.date || !currentServiceRecord.mileage) {
    alert('Пожалуйста, заполните дату и пробег в записи об обслуживании');
    return;
  }
  
  // Collect repair data from popup
  const operationName = document.getElementById('repair-operation-name')?.value.trim();
  const workCost = parseFloat(document.getElementById('repair-work-cost')?.value) || 0;
  
  if (!operationName) {
    alert('Пожалуйста, введите название операции');
    return;
  }
  
  // Get spares from global sparesList (from repairUI.js)
  const spares = window.sparesList || [];
  
  // Calculate total
  const sparesCost = spares.reduce((sum, spare) => sum + spare.cost, 0);
  const totalCost = sparesCost + workCost;
  
  // Create repair data using service record mileage
  const repairData = {
    operationName: operationName,
    mileage: Number(currentServiceRecord.mileage),
    spares: spares,
    workCost: workCost,
    totalCost: totalCost,
    carId: currentServiceRecord.carId
  };
  
  // Add to service record
  const subRecord = new SubRecord('repair', repairData);
  currentServiceRecord.subRecords.push(subRecord);
  
  console.log('Repair added to record:', subRecord);
  
  // Update UI
  updateServiceRecordUI();
  
  // Close popup
  closeRepairPopup();
  
  // Show success message
  showSuccessMessage('Операция добавлена в запись');
}

// Save service record
async function saveServiceRecord() {
  if (!currentServiceRecord || currentServiceRecord.subRecords.length === 0) {
    alert('Нет операций для сохранения');
    return;
  }
  
  // Validate date
  if (!currentServiceRecord.date || !/^\d{2}\.\d{2}\.\d{4}$/.test(currentServiceRecord.date)) {
    alert('Пожалуйста, введите корректную дату в формате дд.мм.гггг');
    return;
  }
  
  // Validate mileage
  if (!currentServiceRecord.mileage || isNaN(currentServiceRecord.mileage) || Number(currentServiceRecord.mileage) < 0) {
    alert('Пожалуйста, введите корректный пробег');
    return;
  }
  
  try {
    // First, save the service record itself
    const serviceRecordToSave = {
      id: currentServiceRecord.id,
      carId: currentServiceRecord.carId,
      date: currentServiceRecord.date,
      mileage: currentServiceRecord.mileage, // Include mileage
      createdAt: currentServiceRecord.createdAt,
      subRecordsCount: currentServiceRecord.subRecords.length
    };
    
    await DataService.saveServiceRecord(serviceRecordToSave);
    
    // Then save each sub-record to appropriate storage
    const maintenanceRecords = [];
    const repairRecords = [];
    
    currentServiceRecord.subRecords.forEach(subRecord => {
      const recordData = {
        ...subRecord.data,
        id: subRecord.id,
        date: currentServiceRecord.date,
        mileage: currentServiceRecord.mileage, // Include mileage
        serviceRecordId: currentServiceRecord.id
      };
      
      if (subRecord.type === 'maintenance') {
        maintenanceRecords.push(recordData);
      } else {
        repairRecords.push(recordData);
      }
    });
    
    // Save operations to backend/storage
    const savePromises = [];
    
    if (maintenanceRecords.length > 0) {
      savePromises.push(DataService.saveMaintenance(maintenanceRecords));
    }
    
    if (repairRecords.length > 0) {
      savePromises.push(DataService.saveRepair(repairRecords));
    }
    
    await Promise.all(savePromises);
    
    console.log('Service record and operations saved successfully');
    
    // Show success message
    showSuccessMessage('Запись об обслуживании сохранена!');
    
    // Reset and create new record
    createNewServiceRecord();
    
  } catch (error) {
    console.error('Error saving service record:', error);
    showErrorMessage('Ошибка сохранения: ' + error.message);
  }
}

// Remove service record
function removeServiceRecord() {
  if (!currentServiceRecord) {
    window.location.hash = '#my-car-overview';
    return;
  }
  
  const hasSubRecords = currentServiceRecord.subRecords.length > 0;
  
  showConfirmationDialog(
    hasSubRecords 
      ? 'Удалить запись? Все добавленные операции будут потеряны.'
      : 'Удалить запись?',
    () => {
      // Clear global reference
      window.currentServiceRecord = null;
      currentServiceRecord = null;
      
      // Navigate back
      window.location.hash = '#my-car-overview';
      showSuccessMessage('Запись удалена');
    },
    () => {
      // User cancelled
    }
  );
}

// Create new service record (for save function)
function createNewServiceRecord() {
  // Clear global reference
  window.currentServiceRecord = null;
  currentServiceRecord = null;
  
  // Navigate back to overview
  window.location.hash = '#my-car-overview';
}

// Remove sub-record
export function removeSubRecord(subRecordId) {
  if (!currentServiceRecord) return;
  
  showConfirmationDialog(
    'Удалить операцию из записи?',
    () => {
      currentServiceRecord.subRecords = currentServiceRecord.subRecords.filter(
        sr => sr.id !== subRecordId
      );
      updateServiceRecordUI();
      showSuccessMessage('Операция удалена из записи');
    },
    () => {
      // User cancelled
    }
  );
}

// Edit sub-record (placeholder for future implementation)
export function editSubRecord(subRecordId) {
  // TODO: Implement edit functionality
  alert('Редактирование операций будет доступно в следующей версии');
}

// Success message
function showSuccessMessage(message) {
  const messageEl = document.createElement('div');
  messageEl.className = 'message-popup success';
  messageEl.innerHTML = `
    <div class="message-content">
      <span class="icon">✅</span>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(messageEl);
  
  setTimeout(() => {
    messageEl.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    messageEl.classList.remove('show');
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);
      }
    }, 300);
  }, 3000);
}

// Error message
function showErrorMessage(message) {
  const messageEl = document.createElement('div');
  messageEl.className = 'message-popup error';
  messageEl.innerHTML = `
    <div class="message-content">
      <span class="icon">❌</span>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(messageEl);
  
  setTimeout(() => {
    messageEl.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    messageEl.classList.remove('show');
    setTimeout(() => {
      if (messageEl.parentNode) {
        messageEl.parentNode.removeChild(messageEl);
      }
    }, 300);
  }, 5000);
}

// Load operations from backend
async function loadOperations() {
  try {
    console.log('Loading operations...');
    // Mock data for demo
    const operations = [
      { id: 1, name: 'Замена масла' },
      { id: 2, name: 'Замена тормозных колодок' },
      { id: 3, name: 'Замена фильтров' },
      { id: 4, name: 'Диагностика двигателя' },
      { id: 5, name: 'Замена ремня ГРМ' }
    ];
    
    const dropdown = document.getElementById('operation-dropdown');
    if (!dropdown) {
      console.error('Operation dropdown not found!');
      return;
    }
    
    operations.forEach(op => {
      const option = document.createElement('option');
      option.value = op.id;
      option.textContent = op.name;
      dropdown.appendChild(option);
    });
    
    console.log('Operations loaded successfully:', operations.length);
  } catch (error) {
    console.error('Error loading operations:', error);
  }
}

// Handle operation selection
async function onOperationSelect(event) {
  const operationId = event.target.value;
  if (!operationId) return;
  
  try {
    // Mock data for demo
    window.currentOperation = {
      id: operationId,
      name: event.target.options[event.target.selectedIndex].text,
      consumables: [
        { id: 1, name: 'Моторное масло' },
        { id: 2, name: 'Масляный фильтр' },
        { id: 3, name: 'Воздушный фильтр' }
      ]
    };
    
    openMaintPopup();
  } catch (error) {
    console.error('Error loading operation details:', error);
  }
}

// Open maintenance popup
function openMaintPopup() {
  if (!window.currentOperation) return;
  
  document.getElementById('maint-operation-name').textContent = window.currentOperation.name;
  
  // Populate consumables
  const consumablesList = document.getElementById('consumables-list');
  consumablesList.innerHTML = '';
  
  window.currentOperation.consumables.forEach(consumable => {
    const consumableDiv = document.createElement('div');
    consumableDiv.className = 'consumable-item';
    consumableDiv.innerHTML = `
      <span class="consumable-name">${consumable.name}</span>
      <input type="text" class="item-input" placeholder="${consumable.name}">
      <input type="number" class="quantity-input" placeholder="1" min="1" step="1" value="1">
      <div class="cost-input-wrapper">
        <input type="number" class="cost-input" placeholder="0" min="0" step="0.01">
        <span class="ruble-icon">₽</span>
      </div>
    `;
    consumablesList.appendChild(consumableDiv);
  });
  
  // Reset totals
  document.getElementById('work-cost').value = '0';
  calculateMaintTotal();
  
  document.getElementById('maint-entry-popup').style.display = 'flex';
}

// Close maintenance popup
function closeMaintPopup() {
  document.getElementById('maint-entry-popup').style.display = 'none';
  document.getElementById('operation-dropdown').value = '';
  window.currentOperation = null;
}

// Calculate maintenance total
function calculateMaintTotal() {
  let total = 0;
  
  // Add consumables costs (cost * quantity)
  const consumableItems = document.querySelectorAll('#consumables-list .consumable-item');
  consumableItems.forEach(item => {
    const cost = parseFloat(item.querySelector('.cost-input')?.value) || 0;
    const quantity = parseFloat(item.querySelector('.quantity-input')?.value) || 1;
    total += cost * quantity;
  });
  
  // Add work cost
  const workCost = parseFloat(document.getElementById('work-cost').value) || 0;
  total += workCost;
  
  document.getElementById('maint-total').textContent = `${total.toFixed(2)} ₽`;
}

// Open repair popup
function openRepairPopup() {
  window.sparesList = [];
  window.spareCounter = 1;
  document.getElementById('spares-list').innerHTML = '';
  document.getElementById('repair-total').textContent = '0 ₽';
  document.getElementById('repair-work-cost').value = '';

  document.getElementById('repair-entry-popup').style.display = 'flex';
  // Remove any previous event listeners to avoid duplicates
  const workCostInput = document.getElementById('repair-work-cost');
  if (workCostInput) {
    workCostInput.oninput = calculateRepairTotal;
  }
  calculateRepairTotal();
}

// Close repair popup
function closeRepairPopup() {
  document.getElementById('repair-entry-popup').style.display = 'none';
  window.sparesList = [];
}

// Calculate repair total
function calculateRepairTotal() {
  const sparesTotal = window.sparesList.reduce((sum, spare) => sum + (spare.totalCost || spare.cost), 0);
  const workCost = parseFloat(document.getElementById('repair-work-cost')?.value) || 0;
  const total = sparesTotal + workCost;
  document.getElementById('repair-total').textContent = `${total.toFixed(2)} ₽`;
}

// Add spare to list
function addSpare() {
  const name = document.getElementById('spare-name').value.trim();
  const cost = parseFloat(document.getElementById('spare-cost').value) || 0;
  const quantity = parseFloat(document.getElementById('spare-quantity').value) || 1;
  
  if (!name) {
    alert('Введите название запчасти');
    return;
  }
  
  const spare = {
    id: window.spareCounter++,
    name: name,
    cost: cost,
    quantity: quantity,
    totalCost: cost * quantity
  };
  
  window.sparesList.push(spare);
  
  // Add to UI
  const sparesListDiv = document.getElementById('spares-list');
  const spareDiv = document.createElement('div');
  spareDiv.className = 'spare-item';
  spareDiv.innerHTML = `
    <span>${spare.id}. ${spare.name} (${spare.quantity} шт.)</span>
    <span>${spare.cost.toFixed(2)} ₽ × ${spare.quantity} = ${spare.totalCost.toFixed(2)} ₽</span>
  `;
  sparesListDiv.appendChild(spareDiv);
  
  // Update total
  calculateRepairTotal();
  
  closeSparePopup();
}

// Open spare popup
function openSparePopup() {
  document.getElementById('spare-name').value = '';
  document.getElementById('spare-quantity').value = '1';
  document.getElementById('spare-cost').value = '0';
  document.getElementById('spare-entry-popup').style.display = 'flex';
}

// Close spare popup
function closeSparePopup() {
  document.getElementById('spare-entry-popup').style.display = 'none';
}

// Draft Button Functions
export function saveDraft() {
  if (!currentServiceRecord) {
    showErrorMessage('Нет данных для сохранения в черновик');
    return;
  }
  
  const success = saveDraftToStorage();
  if (success) {
    showSuccessMessage('Черновик сохранен');
  } else {
    showErrorMessage('Ошибка сохранения черновика');
  }
}

export function saveAndExit() {
  if (!currentServiceRecord || currentServiceRecord.subRecords.length === 0) {
    showErrorMessage('Нет операций для сохранения');
    return;
  }
  
  // Validate date
  if (!currentServiceRecord.date || !/^\d{2}\.\d{2}\.\d{4}$/.test(currentServiceRecord.date)) {
    showErrorMessage('Пожалуйста, введите корректную дату в формате дд.мм.гггг');
    return;
  }
  
  // Validate mileage
  if (!currentServiceRecord.mileage || isNaN(currentServiceRecord.mileage) || Number(currentServiceRecord.mileage) < 0) {
    showErrorMessage('Пожалуйста, введите корректный пробег');
    return;
  }
  
  // Save the record permanently and exit
  saveServiceRecordPermanently()
    .then(() => {
      // Clear draft after successful save
      clearDraft();
      stopAutoSave();
      
      // Navigate back to overview
      window.location.hash = '#my-car-overview';
      showSuccessMessage('Запись об обслуживании сохранена!');
    })
    .catch(error => {
      console.error('Error saving service record:', error);
      showErrorMessage('Ошибка сохранения: ' + error.message);
    });
}

export function exitWithoutChanges() {
  const hasSubRecords = currentServiceRecord && currentServiceRecord.subRecords.length > 0;
  const hasDraftData = hasDraft();
  
  let message = 'Выйти без сохранения?';
  if (hasSubRecords || hasDraftData) {
    message = 'Выйти без сохранения? Все несохраненные изменения будут потеряны.';
  }
  
  showConfirmationDialog(
    message,
    () => {
      // Clear everything and exit
      clearDraft();
      stopAutoSave();
      currentServiceRecord = null;
      window.currentServiceRecord = null;
      
      // Navigate back
      window.location.hash = '#my-car-overview';
      showSuccessMessage('Вышли без сохранения');
    },
    () => {
      // User cancelled
    }
  );
}

// Save service record permanently (extracted from original saveServiceRecord)
async function saveServiceRecordPermanently() {
  if (!currentServiceRecord || currentServiceRecord.subRecords.length === 0) {
    throw new Error('Нет операций для сохранения');
  }
  
  // First, save the service record itself
  const serviceRecordToSave = {
    id: currentServiceRecord.id,
    carId: currentServiceRecord.carId,
    date: currentServiceRecord.date,
    mileage: currentServiceRecord.mileage,
    createdAt: currentServiceRecord.createdAt,
    subRecordsCount: currentServiceRecord.subRecords.length
  };
  
  await DataService.saveServiceRecord(serviceRecordToSave);
  
  // Then save each sub-record to appropriate storage
  const maintenanceRecords = [];
  const repairRecords = [];
  
  currentServiceRecord.subRecords.forEach(subRecord => {
    const recordData = {
      ...subRecord.data,
      id: subRecord.id,
      date: currentServiceRecord.date,
      mileage: currentServiceRecord.mileage,
      serviceRecordId: currentServiceRecord.id
    };
    
    if (subRecord.type === 'maintenance') {
      maintenanceRecords.push(recordData);
    } else {
      repairRecords.push(recordData);
    }
  });
  
  // Save operations to backend/storage
  const savePromises = [];
  
  if (maintenanceRecords.length > 0) {
    savePromises.push(DataService.saveMaintenance(maintenanceRecords));
  }
  
  if (repairRecords.length > 0) {
    savePromises.push(DataService.saveRepair(repairRecords));
  }
  
  await Promise.all(savePromises);
  
  console.log('Service record and operations saved successfully');
}

// Make functions available globally
window.addMaintenanceToRecord = addMaintenanceToRecord;
window.addRepairToRecord = addRepairToRecord;
window.removeSubRecord = removeSubRecord;
window.editSubRecord = editSubRecord;
window.openMaintPopup = openMaintPopup;
window.closeMaintPopup = closeMaintPopup;
window.calculateMaintTotal = calculateMaintTotal;
window.openRepairPopup = openRepairPopup;
window.closeRepairPopup = closeRepairPopup;
window.calculateRepairTotal = calculateRepairTotal;
window.saveDraft = saveDraft;
window.saveAndExit = saveAndExit;
window.exitWithoutChanges = exitWithoutChanges;
window.addSpare = addSpare;
window.openSparePopup = openSparePopup;
window.closeSparePopup = closeSparePopup; 