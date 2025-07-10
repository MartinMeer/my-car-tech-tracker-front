import { DataService } from './dataService.js';
import { openRepairPopup, openSparePopup } from './repairUI.js';

// Global variables for service card
let currentOperation = null;

export function initializeCarOverviewUI() {
  // Get selected car ID
  const carId = localStorage.getItem('currentCarId');
  if (!carId) return;
  
  DataService.getCars().then(cars => {
    const car = cars.find(c => c.id == carId);
    if (!car) return;
    
    // Fill in car details
    const title = document.getElementById('car-title');
    const vin = document.getElementById('car-vin');
    const mileage = document.getElementById('car-mileage');
    
    if (title) title.textContent = `${car.brand || ''} ${car.model || ''} ${car.nickname || ''}`.trim() || car.name;
    if (vin) vin.textContent = `VIN: ${car.vin || '-'}`;
    if (mileage) mileage.textContent = `Пробег: ${car.mileage != null ? car.mileage + ' км' : '-'}`;
    
    // --- Finance totals ---
    const maintenField = document.getElementById('total-mainten-cost');
    const repairField = document.getElementById('total-repair-cost');
    const ownField = document.getElementById('total-own-cost');
    
    if (maintenField) maintenField.textContent = '...';
    if (repairField) repairField.textContent = '...';
    if (ownField) ownField.textContent = '...';
    
    fetchCarTotalsFromBackend(car.id)
      .then(totals => {
        if (maintenField) maintenField.textContent = totals.maintenance != null ? Number(totals.maintenance).toLocaleString('ru-RU') + ' ₽' : '—';
        if (repairField) repairField.textContent = totals.repair != null ? Number(totals.repair).toLocaleString('ru-RU') + ' ₽' : '—';
        if (ownField) ownField.textContent = totals.own != null ? Number(totals.own).toLocaleString('ru-RU') + ' ₽' : '—';
      })
      .catch(error => {
        if (maintenField) maintenField.textContent = 'Ошибка';
        if (repairField) repairField.textContent = 'Ошибка';
        if (ownField) ownField.textContent = 'Ошибка';
      });
  });
}

export function initializeServiceCardUI() {
  console.log('Service card UI initializing...');
  loadOperations();
  updateServiceHeader();
  
  // Event listeners
  const operationDropdown = document.getElementById('operation-dropdown');
  const customRepairBtn = document.getElementById('custom-repair-btn');
  const addSpareBtn = document.getElementById('add-spare-btn');
  
  if (operationDropdown) {
    operationDropdown.addEventListener('change', onOperationSelect);
  }
  if (customRepairBtn) {
    customRepairBtn.addEventListener('click', openRepairPopup);
  }
  if (addSpareBtn) {
    addSpareBtn.addEventListener('click', openSparePopup);
  }
  
  // Add event listeners for dynamic cost inputs
  document.addEventListener('input', function(e) {
    if (e.target.classList.contains('cost-input')) {
      calculateMaintTotal();
    }
  });
  
  console.log('Service card UI initialized successfully');
}

// Load operations from backend
export async function loadOperations() {
  try {
    console.log('Loading operations...');
    // Replace with actual backend call
    // const response = await fetch('/api/maintenance/operations');
    // const operations = await response.json();
    
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

// Update service header with car name
export async function updateServiceHeader() {
  try {
    const car = await fetchSelectedCarFromBackend();
    if (car) {
      const header = document.getElementById('service-header');
      header.textContent = `Забрал ${car.name} из ремонта?`;
    } else {
      // No car selected, show default message
      const header = document.getElementById('service-header');
      header.textContent = 'Забрал автомобиль из ремонта?';
    }
  } catch (error) {
    console.error('Error updating service header:', error);
    // Show default message on error
    const header = document.getElementById('service-header');
    header.textContent = 'Забрал автомобиль из ремонта?';
  }
}

// Handle operation selection
export async function onOperationSelect(event) {
  const operationId = event.target.value;
  if (!operationId) return;
  
  try {
    // Replace with actual backend call
    // const response = await fetch(`/api/maintenance/operations/${operationId}`);
    // currentOperation = await response.json();
    
    // Mock data for demo
    currentOperation = {
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
export function openMaintPopup() {
  if (!currentOperation) return;
  
  document.getElementById('maint-operation-name').textContent = currentOperation.name;
  
  // Set default date to today
  const dateInput = document.getElementById('maint-date');
  if (dateInput) {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    dateInput.value = `${dd}.${mm}.${yyyy}`;
  }
  
  // Set default mileage to current car's mileage
  const mileageInput = document.getElementById('maint-mileage');
  if (mileageInput) {
    getCurrentCarFromBackend().then(car => {
      if (car && car.mileage != null) {
        mileageInput.value = car.mileage;
      } else {
        mileageInput.value = '';
      }
    });
  }
  
  // Populate consumables
  const consumablesList = document.getElementById('consumables-list');
  consumablesList.innerHTML = '';
  
  currentOperation.consumables.forEach(consumable => {
    const consumableDiv = document.createElement('div');
    consumableDiv.className = 'consumable-item';
    consumableDiv.innerHTML = `
      <span class="consumable-name">${consumable.name}</span>
      <input type="text" class="item-input" placeholder="${consumable.name}" value="${consumable.name}">
      <input type="number" class="cost-input" placeholder="0" min="0" step="0.01" value="0">
    `;
    consumablesList.appendChild(consumableDiv);
  });
  
  // Reset totals
  document.getElementById('work-cost').value = '0';
  calculateMaintTotal();
  
  document.getElementById('maint-entry-popup').style.display = 'flex';
}

// Close maintenance popup
export function closeMaintPopup() {
  document.getElementById('maint-entry-popup').style.display = 'none';
  document.getElementById('operation-dropdown').value = '';
  currentOperation = null;
}

// Calculate maintenance total
export function calculateMaintTotal() {
  let total = 0;
  
  // Add consumables costs
  const costInputs = document.querySelectorAll('#consumables-list .cost-input');
  costInputs.forEach(input => {
    total += parseFloat(input.value) || 0;
  });
  
  // Add work cost
  const workCost = parseFloat(document.getElementById('work-cost').value) || 0;
  total += workCost;
  
  document.getElementById('maint-total').textContent = `${total.toFixed(2)} ₽`;
}

// Save maintenance entry
export async function saveMaintenance() {
  try {
    // Validate date and mileage
    const date = document.getElementById('maint-date').value.trim();
    const mileage = document.getElementById('maint-mileage').value.trim();
    
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(date)) {
      alert('Пожалуйста, введите корректную дату в формате дд.мм.гггг');
      return;
    }
    if (!mileage || isNaN(mileage) || Number(mileage) < 0) {
      alert('Пожалуйста, введите корректный пробег');
      return;
    }
    
    const consumables = [];
    const consumableItems = document.querySelectorAll('#consumables-list .consumable-item');
    
    consumableItems.forEach(item => {
      const name = item.querySelector('.consumable-name').textContent;
      const itemInput = item.querySelector('.item-input').value;
      const cost = parseFloat(item.querySelector('.cost-input').value) || 0;
      
      consumables.push({
        name: name,
        item: itemInput,
        cost: cost
      });
    });
    
    const workCost = parseFloat(document.getElementById('work-cost').value) || 0;
    const total = parseFloat(document.getElementById('maint-total').textContent) || 0;
    
    const maintenanceData = {
      id: Date.now(), // Simple ID for demo
      date: date,
      operationId: currentOperation.id,
      operationName: currentOperation.name,
      consumables: consumables,
      workCost: workCost,
      totalCost: total,
      carId: localStorage.getItem('currentCarId'),
      mileage: Number(mileage)
    };
    
    // Save using DataService (handles localStorage vs backend)
    const result = await DataService.saveMaintenance(maintenanceData);
    
    console.log('Saving maintenance:', maintenanceData);
    console.log('Save result:', result);
    closeMaintPopup();
    alert('Отчет о техобслуживании сохранен!');
    
  } catch (error) {
    console.error('Error saving maintenance:', error);
    alert('Ошибка сохранения: ' + error.message);
  }
}

// Fetch car totals from backend (mock/demo implementation)
export async function fetchCarTotalsFromBackend(carId) {
  // TODO: Replace with real backend API call
  // Example: return fetch(`/api/cars/${carId}/totals`).then(res => res.json());
  // For demo, calculate from localStorage
  const [maintenances, repairs] = await Promise.all([
    DataService.getMaintenance(),
    DataService.getRepairs()
  ]);
  const maintTotal = maintenances.filter(m => m.carId == carId).reduce((sum, m) => sum + (Number(m.totalCost) || 0), 0);
  const repairTotal = repairs.filter(r => r.carId == carId).reduce((sum, r) => sum + (Number(r.totalCost) || 0), 0);
  return {
    maintenance: maintTotal,
    repair: repairTotal,
    own: maintTotal + repairTotal // You can add more (e.g. insurance, spares) if needed
  };
}

export async function renderMaintenHistory() {
  const container = document.getElementById('mainten-history-list');
  if (!container) return;
  
  container.innerHTML = '<div class="loading">Загрузка истории ТО...</div>';
  
  try {
    const [maintenances, cars] = await Promise.all([
      DataService.getMaintenance(),
      DataService.getCars()
    ]);
    
    if (!maintenances || maintenances.length === 0) {
      container.innerHTML = '<div class="empty">Нет записей о ТО.</div>';
      return;
    }
    
    // Group by carId
    const maintByCar = {};
    maintenances.forEach(m => {
      if (!maintByCar[m.carId]) maintByCar[m.carId] = [];
      maintByCar[m.carId].push(m);
    });

    let html = '';
    cars.forEach(car => {
      const carMaints = maintByCar[car.id] || [];
      html += `
        <div class="car-history-block" style="margin-bottom:2.5rem;">
          <div class="car-history-header" style="font-size:1.15rem;font-weight:600;color:#2d3e50;margin-bottom:0.7rem;">
            ${car.brand || ''} ${car.model || ''} ${car.nickname ? '(' + car.nickname + ')' : ''} <span style="color:#888;font-size:0.97rem;">[VIN: ${car.vin || '-'}]</span>
          </div>
      `;
      if (carMaints.length === 0) {
        html += `<div class="empty" style="margin-bottom:1.5rem;">Нет записей о ТО для этого автомобиля.</div>`;
      } else {
        html += `
          <table class="history-table">
            <thead>
              <tr>
                <th>Дата</th>
                <th>Пробег</th>
                <th>Название</th>
                <th>Итого</th>
              </tr>
            </thead>
            <tbody>
              ${carMaints.map((m, i) => `
                <tr${i % 2 === 1 ? ' class="alt-row"' : ''}>
                  <td>${m.date || '-'}</td>
                  <td>${m.mileage != null ? m.mileage : '-'}</td>
                  <td>${m.operationName || '-'}</td>
                  <td>${m.totalCost != null ? Number(m.totalCost).toLocaleString('ru-RU') + ' ₽' : '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
      html += `</div>`;
    });
    container.innerHTML = html;
  } catch (error) {
    container.innerHTML = `<div class="error">Ошибка загрузки: ${error.message}</div>`;
  }
}

// Helper functions
async function getCurrentCarFromBackend() {
  const carId = localStorage.getItem('currentCarId');
  const cars = await DataService.getCars();
  return cars.find(c => c.id == carId);
}

async function fetchSelectedCarFromBackend() {
  const carId = localStorage.getItem('currentCarId');
  console.log('Selected car ID:', carId);
  
  if (!carId) {
    console.log('No car ID found in localStorage');
    return null;
  }
  
  const cars = await DataService.getCars();
  console.log('Available cars:', cars);
  
  const selectedCar = cars.find(c => c.id == carId);
  console.log('Selected car:', selectedCar);
  
  return selectedCar || null;
} 