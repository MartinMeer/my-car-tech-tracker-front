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
    // --- New layout population ---
    // Car image
    const imgEl = document.getElementById('car-overview-img');
    if (imgEl) {
      if (car.img && car.img.startsWith('data:image/')) {
        imgEl.src = car.img;
        imgEl.alt = car.name || 'car image';
      } else if (car.img && car.img.length === 1) {
        imgEl.src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='170' height='170'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='100'>${encodeURIComponent(car.img)}</text></svg>`;
        imgEl.alt = car.name || 'car image';
      } else {
        imgEl.src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='170' height='170'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='100'>🚗</text></svg>`;
        imgEl.alt = 'car image';
      }
    }
    // Car name
    const title = document.getElementById('car-title');
    if (title) title.textContent = `${car.brand || ''} ${car.model || ''}`.trim() || car.name;
    // Nickname
    const nicknameDiv = document.getElementById('car-nickname');
    if (nicknameDiv) {
      if (car.nickname) {
        nicknameDiv.textContent = car.nickname;
        nicknameDiv.style.display = '';
      } else {
        nicknameDiv.textContent = '';
        nicknameDiv.style.display = 'none';
      }
    }
    // Year
    const yearDiv = document.getElementById('car-year');
    if (yearDiv) yearDiv.textContent = car.year ? `Год выпуска: ${car.year}` : '';
    // VIN
    const vinDiv = document.getElementById('car-vin');
    if (vinDiv) vinDiv.textContent = car.vin ? `VIN: ${car.vin}` : '';
    // Mileage
    const mileageDiv = document.getElementById('car-mileage');
    if (mileageDiv) mileageDiv.textContent = car.mileage ? `Пробег: ${car.mileage} км` : '';
    
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
  
  // Add event listener for work cost input
  document.addEventListener('input', function(e) {
    if (e.target.id === 'work-cost') {
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
    
    // Enhanced mock data for demo with more realistic operations
    const operations = [
      // Engine & Oil
      { id: 1, name: 'Замена масла и фильтров', category: 'engine', consumables: [
        { id: 1, name: 'Моторное масло', defaultItem: '5W-30 синтетическое', defaultCost: 2500 },
        { id: 2, name: 'Масляный фильтр', defaultItem: 'Масляный фильтр', defaultCost: 800 },
        { id: 3, name: 'Воздушный фильтр', defaultItem: 'Воздушный фильтр', defaultCost: 600 }
      ]},
      { id: 2, name: 'Замена масла (только масло)', category: 'engine', consumables: [
        { id: 1, name: 'Моторное масло', defaultItem: '5W-30 синтетическое', defaultCost: 2500 },
        { id: 2, name: 'Масляный фильтр', defaultItem: 'Масляный фильтр', defaultCost: 800 }
      ]},
      
      // Brakes
      { id: 3, name: 'Замена тормозных колодок', category: 'brakes', consumables: [
        { id: 1, name: 'Тормозные колодки передние', defaultItem: 'Тормозные колодки', defaultCost: 3500 },
        { id: 2, name: 'Тормозные колодки задние', defaultItem: 'Тормозные колодки', defaultCost: 2800 },
        { id: 3, name: 'Тормозная жидкость', defaultItem: 'DOT-4', defaultCost: 400 }
      ]},
      { id: 4, name: 'Замена тормозных дисков', category: 'brakes', consumables: [
        { id: 1, name: 'Тормозные диски передние', defaultItem: 'Тормозные диски', defaultCost: 4500 },
        { id: 2, name: 'Тормозные диски задние', defaultItem: 'Тормозные диски', defaultCost: 3800 },
        { id: 3, name: 'Тормозные колодки', defaultItem: 'Тормозные колодки', defaultCost: 2800 }
      ]},
      
      // Cooling System
      { id: 5, name: 'Замена охлаждающей жидкости', category: 'cooling', consumables: [
        { id: 1, name: 'Охлаждающая жидкость', defaultItem: 'Антифриз G12', defaultCost: 1200 },
        { id: 2, name: 'Патрубки системы охлаждения', defaultItem: 'Патрубки', defaultCost: 800 }
      ]},
      
      // Transmission
      { id: 6, name: 'Замена масла в коробке передач', category: 'transmission', consumables: [
        { id: 1, name: 'Трансмиссионное масло', defaultItem: 'Масло ATF', defaultCost: 1800 },
        { id: 2, name: 'Масляный фильтр АКПП', defaultItem: 'Фильтр АКПП', defaultCost: 1200 }
      ]},
      
      // Suspension
      { id: 7, name: 'Замена амортизаторов', category: 'suspension', consumables: [
        { id: 1, name: 'Амортизаторы передние', defaultItem: 'Амортизаторы', defaultCost: 3200 },
        { id: 2, name: 'Амортизаторы задние', defaultItem: 'Амортизаторы', defaultCost: 2800 },
        { id: 3, name: 'Опорные подшипники', defaultItem: 'Подшипники', defaultCost: 600 }
      ]},
      
      // Electrical
      { id: 8, name: 'Замена аккумулятора', category: 'electrical', consumables: [
        { id: 1, name: 'Аккумулятор', defaultItem: 'АКБ 60 Ач', defaultCost: 4500 }
      ]},
      
      // Filters
      { id: 9, name: 'Замена всех фильтров', category: 'filters', consumables: [
        { id: 1, name: 'Масляный фильтр', defaultItem: 'Масляный фильтр', defaultCost: 800 },
        { id: 2, name: 'Воздушный фильтр', defaultItem: 'Воздушный фильтр', defaultCost: 600 },
        { id: 3, name: 'Топливный фильтр', defaultItem: 'Топливный фильтр', defaultCost: 900 },
        { id: 4, name: 'Салонный фильтр', defaultItem: 'Салонный фильтр', defaultCost: 500 }
      ]},
      
      // Timing Belt
      { id: 10, name: 'Замена ремня ГРМ', category: 'timing', consumables: [
        { id: 1, name: 'Ремень ГРМ', defaultItem: 'Ремень ГРМ', defaultCost: 2800 },
        { id: 2, name: 'Ролик натяжителя', defaultItem: 'Ролик натяжителя', defaultCost: 1200 },
        { id: 3, name: 'Помпа системы охлаждения', defaultItem: 'Помпа', defaultCost: 1800 }
      ]}
    ];
    
    const dropdown = document.getElementById('operation-dropdown');
    if (!dropdown) {
      console.error('Operation dropdown not found!');
      return;
    }
    
    // Clear existing options except the first one
    while (dropdown.children.length > 1) {
      dropdown.removeChild(dropdown.lastChild);
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
export async function onOperationSelect(event) {
  const operationId = event.target.value;
  if (!operationId) return;
  
  // Check if service record exists
  if (!window.currentServiceRecord) {
    alert('Сначала выберите автомобиль для обслуживания');
    event.target.value = '';
    return;
  }
  
  try {
    // Replace with actual backend call
    // const response = await fetch(`/api/maintenance/operations/${operationId}`);
    // currentOperation = await response.json();
    
    // Mock data for demo - find the selected operation
    const operations = [
      { id: 1, name: 'Замена масла и фильтров', category: 'engine', consumables: [
        { id: 1, name: 'Моторное масло', defaultItem: '5W-30 синтетическое', defaultCost: 2500 },
        { id: 2, name: 'Масляный фильтр', defaultItem: 'Масляный фильтр', defaultCost: 800 },
        { id: 3, name: 'Воздушный фильтр', defaultItem: 'Воздушный фильтр', defaultCost: 600 }
      ]},
      { id: 2, name: 'Замена масла (только масло)', category: 'engine', consumables: [
        { id: 1, name: 'Моторное масло', defaultItem: '5W-30 синтетическое', defaultCost: 2500 },
        { id: 2, name: 'Масляный фильтр', defaultItem: 'Масляный фильтр', defaultCost: 800 }
      ]},
      { id: 3, name: 'Замена тормозных колодок', category: 'brakes', consumables: [
        { id: 1, name: 'Тормозные колодки передние', defaultItem: 'Тормозные колодки', defaultCost: 3500 },
        { id: 2, name: 'Тормозные колодки задние', defaultItem: 'Тормозные колодки', defaultCost: 2800 },
        { id: 3, name: 'Тормозная жидкость', defaultItem: 'DOT-4', defaultCost: 400 }
      ]},
      { id: 4, name: 'Замена тормозных дисков', category: 'brakes', consumables: [
        { id: 1, name: 'Тормозные диски передние', defaultItem: 'Тормозные диски', defaultCost: 4500 },
        { id: 2, name: 'Тормозные диски задние', defaultItem: 'Тормозные диски', defaultCost: 3800 },
        { id: 3, name: 'Тормозные колодки', defaultItem: 'Тормозные колодки', defaultCost: 2800 }
      ]},
      { id: 5, name: 'Замена охлаждающей жидкости', category: 'cooling', consumables: [
        { id: 1, name: 'Охлаждающая жидкость', defaultItem: 'Антифриз G12', defaultCost: 1200 },
        { id: 2, name: 'Патрубки системы охлаждения', defaultItem: 'Патрубки', defaultCost: 800 }
      ]},
      { id: 6, name: 'Замена масла в коробке передач', category: 'transmission', consumables: [
        { id: 1, name: 'Трансмиссионное масло', defaultItem: 'Масло ATF', defaultCost: 1800 },
        { id: 2, name: 'Масляный фильтр АКПП', defaultItem: 'Фильтр АКПП', defaultCost: 1200 }
      ]},
      { id: 7, name: 'Замена амортизаторов', category: 'suspension', consumables: [
        { id: 1, name: 'Амортизаторы передние', defaultItem: 'Амортизаторы', defaultCost: 3200 },
        { id: 2, name: 'Амортизаторы задние', defaultItem: 'Амортизаторы', defaultCost: 2800 },
        { id: 3, name: 'Опорные подшипники', defaultItem: 'Подшипники', defaultCost: 600 }
      ]},
      { id: 8, name: 'Замена аккумулятора', category: 'electrical', consumables: [
        { id: 1, name: 'Аккумулятор', defaultItem: 'АКБ 60 Ач', defaultCost: 4500 }
      ]},
      { id: 9, name: 'Замена всех фильтров', category: 'filters', consumables: [
        { id: 1, name: 'Масляный фильтр', defaultItem: 'Масляный фильтр', defaultCost: 800 },
        { id: 2, name: 'Воздушный фильтр', defaultItem: 'Воздушный фильтр', defaultCost: 600 },
        { id: 3, name: 'Топливный фильтр', defaultItem: 'Топливный фильтр', defaultCost: 900 },
        { id: 4, name: 'Салонный фильтр', defaultItem: 'Салонный фильтр', defaultCost: 500 }
      ]},
      { id: 10, name: 'Замена ремня ГРМ', category: 'timing', consumables: [
        { id: 1, name: 'Ремень ГРМ', defaultItem: 'Ремень ГРМ', defaultCost: 2800 },
        { id: 2, name: 'Ролик натяжителя', defaultItem: 'Ролик натяжителя', defaultCost: 1200 },
        { id: 3, name: 'Помпа системы охлаждения', defaultItem: 'Помпа', defaultCost: 1800 }
      ]}
    ];
    
    currentOperation = operations.find(op => op.id == operationId);
    
    if (currentOperation) {
      openMaintPopup();
    }
  } catch (error) {
    console.error('Error loading operation details:', error);
  }
}

// Open maintenance popup
export function openMaintPopup() {
  if (!currentOperation) return;
  
  document.getElementById('maint-operation-name').textContent = currentOperation.name;
  
  // Set default mileage to selected car's mileage from service record
  const mileageInput = document.getElementById('maint-mileage');
  if (mileageInput) {
    // Get mileage from service record if available
    const serviceRecord = window.currentServiceRecord;
    if (serviceRecord && serviceRecord.carId) {
      // Try to get car mileage from service record context
      DataService.getCars().then(cars => {
        const car = cars.find(c => c.id == serviceRecord.carId);
        if (car && car.mileage != null) {
          mileageInput.value = car.mileage;
        } else {
          mileageInput.value = '';
        }
      });
    } else {
      // Fallback to current car
      getCurrentCarFromBackend().then(car => {
        if (car && car.mileage != null) {
          mileageInput.value = car.mileage;
        } else {
          mileageInput.value = '';
        }
      });
    }
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

// Render maintenance history
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

// Helper function to get current car
async function getCurrentCarFromBackend() {
  // TODO: Replace with actual API call
  // return fetch(`/api/cars/${carId}`).then(res => res.json());
  
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