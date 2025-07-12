import { DataService } from './dataService.js';
import { showConfirmationDialog } from './dialogs.js';

// Service Record State Management
let currentServiceRecord = null;
let subRecordsCounter = 1;

// Service Record Structure
class ServiceRecord {
  constructor(carId, date) {
    this.id = Date.now();
    this.carId = carId;
    this.date = date;
    this.subRecords = [];
    this.createdAt = new Date().toISOString();
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

// Initialize Service Record
export function initializeServiceRecord() {
  console.log('🚗 Service Record Manager: Initializing...');
  
  // Show car selection popup first
  showCarSelectionPopup();
}

// Show car selection popup
async function showCarSelectionPopup() {
  console.log('🚗 Service Record Manager: Showing car selection popup...');
  
  try {
    const cars = await DataService.getCars();
    console.log('🚗 Service Record Manager: Found cars:', cars.length);
    
    if (cars.length === 0) {
      console.log('🚗 Service Record Manager: No cars found, showing error message');
      showErrorMessage('Сначала добавьте автомобиль в разделе "Мои машины"');
      return;
    }
    
    // Create popup HTML
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
            
            <div class="car-selection-date">
              <label for="car-selection-date">
                <span class="icon">📅</span>
                Дата обслуживания:
              </label>
              <input type="text" id="car-selection-date" required pattern="\\d{2}\\.\\d{2}\\.\\d{4}" placeholder="дд.мм.гггг">
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
    
    // Set default date to today
    const dateInput = document.getElementById('car-selection-date');
    if (dateInput) {
      const today = new Date();
      const dd = String(today.getDate()).padStart(2, '0');
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const yyyy = today.getFullYear();
      dateInput.value = `${dd}.${mm}.${yyyy}`;
    }
    
    // Add event listeners for car selection
    const carItems = document.querySelectorAll('.car-selection-item');
    console.log('Found car items:', carItems.length);
    
    carItems.forEach(item => {
      item.addEventListener('click', function() {
        console.log('Car item clicked:', this.getAttribute('data-car-id'));
        const carId = this.getAttribute('data-car-id');
        const date = document.getElementById('car-selection-date').value;
        
        console.log('Selected car ID:', carId, 'date:', date);
        
        if (!date || !/^\d{2}\.\d{2}\.\d{4}$/.test(date)) {
          showErrorMessage('Пожалуйста, введите корректную дату в формате дд.мм.гггг');
          return;
        }
        
        // Create service record with selected car and date
        createServiceRecordWithCar(carId, date);
        
        // Close popup
        closeCarSelectionPopup();
      });
    });
    
    // Add close functionality
    window.closeCarSelectionPopup = closeCarSelectionPopup;
    
  } catch (error) {
    console.error('Error showing car selection popup:', error);
    showErrorMessage('Ошибка загрузки списка автомобилей');
  }
}

// Close car selection popup
function closeCarSelectionPopup() {
  const popup = document.getElementById('car-selection-popup');
  if (popup) {
    popup.remove();
  }
  // Don't navigate away - stay on the service card page
  // window.history.back(); // Remove this line
}

// Create service record with selected car
async function createServiceRecordWithCar(carId, date) {
  console.log('Creating service record with car:', carId, 'date:', date);
  
  currentServiceRecord = new ServiceRecord(carId, date);
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
  
  // Update car information in header
  await updateServiceRecordCarInfo(carId);
  
  // Setup event listeners
  setupServiceRecordEventListeners();
  
  // Update UI
  updateServiceRecordUI();
  
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
  // Save record button
  const saveBtn = document.getElementById('save-service-record-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveServiceRecord);
  }
  
  // Remove record button
  const removeBtn = document.getElementById('remove-service-record-btn');
  if (removeBtn) {
    removeBtn.addEventListener('click', removeServiceRecord);
  }
  
  // Date input change
  const dateInput = document.getElementById('service-record-date');
  if (dateInput) {
    dateInput.addEventListener('change', function() {
      if (currentServiceRecord) {
        currentServiceRecord.date = this.value;
      }
    });
  }
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
  const saveBtn = document.getElementById('save-service-record-btn');
  if (!saveBtn) return;
  
  const canSave = currentServiceRecord && 
                  currentServiceRecord.date && 
                  currentServiceRecord.subRecords.length > 0;
  
  saveBtn.disabled = !canSave;
}

// Add maintenance to record
export function addMaintenanceToRecord() {
  if (!currentServiceRecord) {
    console.error('No active service record');
    return;
  }
  
  // Collect maintenance data from popup
  const mileage = document.getElementById('maint-mileage')?.value;
  const workCost = parseFloat(document.getElementById('work-cost')?.value) || 0;
  const operationName = document.getElementById('maint-operation-name')?.textContent;
  
  if (!mileage || !operationName) {
    alert('Пожалуйста, заполните все обязательные поля');
    return;
  }
  
  // Collect consumables
  const consumables = [];
  const consumableItems = document.querySelectorAll('#consumables-list .consumable-item');
  
  consumableItems.forEach(item => {
    const name = item.querySelector('.consumable-name')?.textContent;
    const itemInput = item.querySelector('.item-input')?.value;
    const cost = parseFloat(item.querySelector('.cost-input')?.value) || 0;
    
    if (name) {
      consumables.push({
        name: name,
        item: itemInput || name,
        cost: cost
      });
    }
  });
  
  // Calculate total
  const consumablesCost = consumables.reduce((sum, c) => sum + c.cost, 0);
  const totalCost = consumablesCost + workCost;
  
  // Create maintenance data
  const maintenanceData = {
    operationName: operationName,
    mileage: Number(mileage),
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
  
  // Collect repair data from popup
  const mileage = document.getElementById('repair-mileage')?.value;
  const operationName = document.getElementById('repair-operation-name')?.value.trim();
  const workCost = parseFloat(document.getElementById('repair-work-cost')?.value) || 0;
  
  if (!mileage || !operationName) {
    alert('Пожалуйста, заполните все обязательные поля');
    return;
  }
  
  // Get spares from global sparesList (from repairUI.js)
  const spares = window.sparesList || [];
  
  // Calculate total
  const sparesCost = spares.reduce((sum, spare) => sum + spare.cost, 0);
  const totalCost = sparesCost + workCost;
  
  // Create repair data
  const repairData = {
    operationName: operationName,
    mileage: Number(mileage),
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
  
  try {
    // Save each sub-record to appropriate storage
    const maintenanceRecords = [];
    const repairRecords = [];
    
    currentServiceRecord.subRecords.forEach(subRecord => {
      const recordData = {
        ...subRecord.data,
        id: subRecord.id,
        date: currentServiceRecord.date,
        serviceRecordId: currentServiceRecord.id
      };
      
      if (subRecord.type === 'maintenance') {
        maintenanceRecords.push(recordData);
      } else {
        repairRecords.push(recordData);
      }
    });
    
    // Save to backend/storage
    const savePromises = [];
    
    if (maintenanceRecords.length > 0) {
      savePromises.push(DataService.saveMaintenance(maintenanceRecords));
    }
    
    if (repairRecords.length > 0) {
      savePromises.push(DataService.saveRepairs(repairRecords));
    }
    
    await Promise.all(savePromises);
    
    console.log('Service record saved successfully');
    
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

// Make functions available globally
window.addMaintenanceToRecord = addMaintenanceToRecord;
window.addRepairToRecord = addRepairToRecord;
window.removeSubRecord = removeSubRecord;
window.editSubRecord = editSubRecord; 