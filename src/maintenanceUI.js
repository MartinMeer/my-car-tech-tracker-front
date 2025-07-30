import { DataService } from './dataService.js';
import { openRepairPopup, openSparePopup } from './repairUI.js';
import { showConfirmationDialog } from './dialogs.js';
import { removeCarFromBackend } from './carsUI.js';
import { CONFIG } from './config.js';

// Global variables for service card
let currentOperation = null;

export function initializeCarOverviewUI() {
  // Get selected car ID - check URL parameters first, then localStorage
  let carId = null;
  
  // Check if there's a car parameter in the URL
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const carParam = urlParams.get('car');
  
  if (carParam) {
    carId = carParam;
    // Set the car ID in localStorage for consistency
    DataService.setCurrentCarId(carId);
  } else {
    // Fall back to localStorage
    carId = localStorage.getItem('currentCarId');
  }
  
  if (!carId) return;
  
  // Set up button event listeners
  setupCarActionButtons(carId);
  
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
    
    // License Plate
    const licensePlateDiv = document.getElementById('car-license-plate');
    if (licensePlateDiv) {
      if (car.licensePlate) {
        licensePlateDiv.textContent = `Гос. номер: ${car.licensePlate}`;
        licensePlateDiv.style.display = '';
      } else {
        licensePlateDiv.textContent = '';
        licensePlateDiv.style.display = 'none';
      }
    }
    
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

// Set up car action buttons (edit and delete)
function setupCarActionButtons(carId) {
  const editBtn = document.getElementById('edit-car-btn');
  const deleteBtn = document.getElementById('delete-car-btn');
  
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      // Navigate to add-car page with edit mode
      window.location.hash = `#add-car?edit=${carId}`;
    });
  }
  
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      // Get car info for confirmation dialog
      DataService.getCars().then(cars => {
        const car = cars.find(c => c.id == carId);
        if (!car) return;
        
        const carName = car.nickname || `${car.brand || ''} ${car.model || ''}`.trim() || car.name;
        
        showConfirmationDialog(
          `Вы уверены, что хотите удалить автомобиль "${carName}"? Это действие нельзя отменить.`,
          async () => {
            try {
              await removeCarFromBackend(carId);
              // Redirect to my-cars page after successful deletion
              window.location.hash = '#my-cars';
            } catch (error) {
              alert('Ошибка удаления: ' + error.message);
            }
          },
          () => {
            // User cancelled - do nothing
          }
        );
      });
    });
  }
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
  
  // Add event listeners for dynamic cost and quantity inputs
  document.addEventListener('input', function(e) {
    if (e.target.classList.contains('cost-input') || e.target.classList.contains('quantity-input')) {
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
      DataService.getCars().then(async cars => {
        const car = cars.find(c => c.id == serviceRecord.carId);
        if (car && car.mileage != null) {
          mileageInput.value = car.mileage;
        } else {
          mileageInput.value = '';
        }
        
        // Suggest current mileage from mileage handler
        try {
          const { mileageHandler } = await import('./mileageHandler.js');
          await mileageHandler.suggestMileageForInput('maint-mileage', serviceRecord.carId);
        } catch (error) {
          console.error('Failed to suggest mileage:', error);
        }
      });
    } else {
      // Fallback to current car
      getCurrentCarFromBackend().then(async car => {
        if (car && car.mileage != null) {
          mileageInput.value = car.mileage;
        } else {
          mileageInput.value = '';
        }
        
        // Suggest current mileage from mileage handler
        try {
          const { mileageHandler } = await import('./mileageHandler.js');
          await mileageHandler.suggestMileageForInput('maint-mileage', car.id);
        } catch (error) {
          console.error('Failed to suggest mileage:', error);
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
      <label>Наименование</label>
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
export function closeMaintPopup() {
  document.getElementById('maint-entry-popup').style.display = 'none';
  document.getElementById('operation-dropdown').value = '';
  currentOperation = null;
}

// Calculate maintenance total
export function calculateMaintTotal() {
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
    
    // Check if we should filter by current car (when accessed from my-car-overview)
    const currentCarId = localStorage.getItem('currentCarId');
    const showAllCars = localStorage.getItem('showAllCars') === 'true';
    let carsToShow = cars;
    
    if (currentCarId && !showAllCars) {
      // Filter to show only the current car
      carsToShow = cars.filter(car => car.id == currentCarId);
      if (carsToShow.length === 0) {
        container.innerHTML = '<div class="error">Выбранный автомобиль не найден.</div>';
        return;
      }
    }
    
    // Group by carId
    const maintByCar = {};
    maintenances.forEach(m => {
      if (!maintByCar[m.carId]) maintByCar[m.carId] = [];
      maintByCar[m.carId].push(m);
    });

    let html = '';
    
    // Add header indicating if we're showing filtered results
    if (currentCarId && carsToShow.length === 1) {
      const currentCar = carsToShow[0];
      html += `
        <div class="filter-notice" style="
          background: #e3f2fd;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          border-left: 4px solid #2196f3;
          color: #1976d2;
        ">
          <strong>Показана история ТО для автомобиля:</strong> ${currentCar.brand || ''} ${currentCar.model || ''} ${currentCar.nickname ? '(' + currentCar.nickname + ')' : ''}
          <div style="margin-top: 0.5rem;">
            <a href="#mainten-history" onclick="localStorage.setItem('showAllCars', 'true'); renderMaintenHistory();" style="color: #1976d2; text-decoration: underline;">
              Показать для всех автомобилей
            </a>
          </div>
        </div>
      `;
    } else if (showAllCars && currentCarId) {
      // Show notice when displaying all cars but we have a current car context
      const currentCar = cars.find(car => car.id == currentCarId);
      if (currentCar) {
        html += `
          <div class="filter-notice" style="
            background: #fff3e0;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            border-left: 4px solid #ff9800;
            color: #f57c00;
          ">
            <strong>Показана история ТО для всех автомобилей</strong>
            <div style="margin-top: 0.5rem;">
              <a href="#mainten-history" onclick="localStorage.removeItem('showAllCars'); renderMaintenHistory();" style="color: #f57c00; text-decoration: underline;">
                Показать только для ${currentCar.brand || ''} ${currentCar.model || ''} ${currentCar.nickname ? '(' + currentCar.nickname + ')' : ''}
              </a>
            </div>
          </div>
        `;
      }
    }
    
    carsToShow.forEach(car => {
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
    
    // Update back button text and behavior based on filter state
    const backBtn = document.getElementById('mainten-back-btn');
    if (backBtn) {
      if (currentCarId && carsToShow.length === 1) {
        backBtn.innerHTML = '← К обзору автомобиля';
        backBtn.onclick = () => window.location.hash = '#my-car-overview';
      } else {
        backBtn.innerHTML = '← Вернуться';
        // When showing all cars, still return to current car's overview
        backBtn.onclick = () => window.location.hash = '#my-car-overview';
      }
    }
  } catch (error) {
    container.innerHTML = `<div class="error">Ошибка загрузки: ${error.message}</div>`;
  }
}

// Render service history (combined maintenance and repairs)
export async function renderServiceHistory() {
  const container = document.getElementById('service-history-list');
  if (!container) return;
  
  container.innerHTML = '<div class="loading">Загрузка истории обслуживания...</div>';
  
  try {
    // Try to get service records first (new system)
    const serviceRecords = await DataService.getServiceRecords();
    
    if (serviceRecords && serviceRecords.length > 0) {
      // Use new service record system
      await renderServiceRecordsNew(serviceRecords);
    } else {
      // Fallback to old system for backward compatibility
      await renderServiceRecordsLegacy();
    }
    
  } catch (error) {
    console.error('Error loading service history:', error);
    container.innerHTML = `<div class="error">Ошибка загрузки: ${error.message}</div>`;
  }
}

// New service record rendering system - grouped by cars
async function renderServiceRecordsNew(serviceRecords) {
  const container = document.getElementById('service-history-list');
  if (!container) return;
  
  try {
    const [maintenances, repairs, cars] = await Promise.all([
      DataService.getMaintenance(),
      DataService.getRepairs(),
      DataService.getCars()
    ]);
    
    // Group service records by car
    const serviceRecordsByCar = {};
    serviceRecords.forEach(serviceRecord => {
      const carId = serviceRecord.carId;
      if (!serviceRecordsByCar[carId]) {
        serviceRecordsByCar[carId] = [];
      }
      serviceRecordsByCar[carId].push(serviceRecord);
    });
    
    // Sort service records within each car by date (newest first)
    Object.keys(serviceRecordsByCar).forEach(carId => {
      serviceRecordsByCar[carId].sort((a, b) => {
        const dateA = a.date ? new Date(a.date.split('.').reverse().join('-')) : new Date(0);
        const dateB = b.date ? new Date(b.date.split('.').reverse().join('-')) : new Date(0);
        return dateB - dateA;
      });
    });
    
    let html = `
      <div class="service-history-summary" style="
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 2rem;
        border-left: 4px solid #2d3e50;
      ">
        <div style="font-weight: 600; color: #2d3e50; margin-bottom: 0.5rem;">Общая статистика:</div>
        <div style="display: flex; gap: 2rem; flex-wrap: wrap; font-size: 0.9rem; color: #666;">
          <span>Автомобилей: <strong>${Object.keys(serviceRecordsByCar).length}</strong></span>
          <span>Записей об обслуживании: <strong>${serviceRecords.length}</strong></span>
          <span>Всего операций: <strong>${serviceRecords.reduce((sum, sr) => sum + (sr.subRecordsCount || 0), 0)}</strong></span>
          <span>Общая стоимость: <strong>${calculateTotalCost(serviceRecords, maintenances, repairs).toLocaleString('ru-RU')} ₽</strong></span>
        </div>
      </div>
    `;
    
    // Render each car's service records
    Object.keys(serviceRecordsByCar).forEach(carId => {
      const car = cars.find(c => c.id == carId);
      const carName = car ? `${car.brand || ''} ${car.model || ''}`.trim() || car.name : 'Неизвестный автомобиль';
      const carDisplayName = car && car.nickname ? `${carName} (${car.nickname})` : carName;
      const carVin = car ? car.vin : 'VIN не указан';
      
      const carServiceRecords = serviceRecordsByCar[carId];
      const carTotalCost = carServiceRecords.reduce((sum, sr) => sum + calculateServiceRecordCost(sr.id, maintenances, repairs), 0);
      const carTotalOperations = carServiceRecords.reduce((sum, sr) => sum + (sr.subRecordsCount || 0), 0);
      
      html += `
        <div class="car-history-block" style="
          margin-bottom: 2.5rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow: hidden;
        ">
          <div class="car-history-header" style="
            font-size: 1.15rem;
            font-weight: 600;
            color: #2d3e50;
            padding: 1rem 1.5rem;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            justify-content: space-between;
            align-items: center;
          ">
            <div>
              <div style="font-weight: 600; color: #2d3e50;">${carDisplayName}</div>
              <div style="font-size: 0.9rem; color: #888; margin-top: 0.2rem;">VIN: ${carVin}</div>
            </div>
            <div style="text-align: right; font-size: 0.9rem; color: #666;">
              <div>Записей: <strong>${carServiceRecords.length}</strong></div>
              <div>Операций: <strong>${carTotalOperations}</strong></div>
              <div>Стоимость: <strong>${carTotalCost.toLocaleString('ru-RU')} ₽</strong></div>
            </div>
          </div>
          
          <div style="padding: 0;">
            <table class="history-table" style="margin: 0; border: none;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="border: none; padding: 0.75rem 1rem;">Дата</th>
                  <th style="border: none; padding: 0.75rem 1rem;">Операций</th>
                  <th style="border: none; padding: 0.75rem 1rem;">Стоимость</th>
                  <th style="border: none; padding: 0.75rem 1rem;">Действия</th>
                </tr>
              </thead>
              <tbody>
      `;
      
      carServiceRecords.forEach((serviceRecord, i) => {
        const serviceRecordCost = calculateServiceRecordCost(serviceRecord.id, maintenances, repairs);
        
        html += `
          <tr${i % 2 === 1 ? ' class="alt-row"' : ''} 
              style="cursor: pointer; transition: background 0.2s; border: none;" 
              onclick="handleServiceRecordClick(event, '${serviceRecord.id}')"
              onmouseover="this.style.background='#e8f4fd'"
              onmouseout="this.style.background='${i % 2 === 1 ? '#f4f7fb' : 'white'}'">
            <td style="border: none; padding: 0.75rem 1rem;">${serviceRecord.date || '-'}</td>
            <td style="border: none; padding: 0.75rem 1rem;">
              <span style="
                padding: 0.2rem 0.5rem;
                border-radius: 12px;
                font-size: 0.8rem;
                font-weight: 500;
                color: white;
                background: #007bff;
              ">${serviceRecord.subRecordsCount || 0} операций</span>
            </td>
            <td style="border: none; padding: 0.75rem 1rem; font-weight:600;">${serviceRecordCost.toLocaleString('ru-RU')} ₽</td>
            <td style="border: none; padding: 0.75rem 1rem; text-align: center; white-space: nowrap;">
              <button onclick="event.stopPropagation(); viewServiceRecordDetails('${serviceRecord.id}')" 
                      style="
                        background: #17a2b8;
                        color: white;
                        border: none;
                        padding: 0.3rem 0.6rem;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 0.8rem;
                        margin-right: 0.3rem;
                      " title="Просмотр деталей">
                👁️
              </button>
              <button onclick="event.stopPropagation(); deleteServiceRecord('${serviceRecord.id}')" 
                      style="
                        background: #dc3545;
                        color: white;
                        border: none;
                        padding: 0.3rem 0.6rem;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 0.8rem;
                      " title="Удалить запись">
                🗑️
              </button>
            </td>
          </tr>
        `;
      });
      
      html += `
              </tbody>
            </table>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
    
    // Make functions globally available
    window.handleServiceRecordClick = handleServiceRecordClick;
    window.viewServiceRecordDetails = viewServiceRecordDetails;
    window.deleteServiceRecord = deleteServiceRecord;
    window.deleteIndividualRecord = deleteIndividualRecord;
    
  } catch (error) {
    console.error('Error rendering service records:', error);
    container.innerHTML = `<div class="error">Ошибка отображения: ${error.message}</div>`;
  }
}

// Legacy rendering for backward compatibility - grouped by cars
async function renderServiceRecordsLegacy() {
  const container = document.getElementById('service-history-list');
  if (!container) return;
  
  try {
    const [maintenances, repairs, cars] = await Promise.all([
      DataService.getMaintenance(),
      DataService.getRepairs(),
      DataService.getCars()
    ]);
    
    if ((!maintenances || maintenances.length === 0) && (!repairs || repairs.length === 0)) {
      container.innerHTML = '<div class="empty">Нет записей об обслуживании.</div>';
      return;
    }
    
    // Combine all records
    const allRecords = [];
    
    // Add maintenance records
    maintenances.forEach(m => {
      const car = cars.find(c => c.id == m.carId);
      allRecords.push({
        ...m,
        type: 'maintenance',
        typeLabel: 'ТО',
        typeClass: 'maintenance',
        carName: car ? `${car.brand || ''} ${car.model || ''}`.trim() || car.name : 'Неизвестный автомобиль',
        carNickname: car ? car.nickname : null,
        carVin: car ? car.vin : null
      });
    });
    
    // Add repair records
    repairs.forEach(r => {
      const car = cars.find(c => c.id == r.carId);
      allRecords.push({
        ...r,
        type: 'repair',
        typeLabel: 'Ремонт',
        typeClass: 'repair',
        carName: car ? `${car.brand || ''} ${car.model || ''}`.trim() || car.name : 'Неизвестный автомобиль',
        carNickname: car ? car.nickname : null,
        carVin: car ? car.vin : null
      });
    });
    
    // Group records by car
    const recordsByCar = {};
    allRecords.forEach(record => {
      const carId = record.carId;
      if (!recordsByCar[carId]) {
        recordsByCar[carId] = [];
      }
      recordsByCar[carId].push(record);
    });
    
    // Sort records within each car by date (newest first)
    Object.keys(recordsByCar).forEach(carId => {
      recordsByCar[carId].sort((a, b) => {
        const dateA = a.date ? new Date(a.date.split('.').reverse().join('-')) : new Date(0);
        const dateB = b.date ? new Date(b.date.split('.').reverse().join('-')) : new Date(0);
        return dateB - dateA;
      });
    });
    
    let html = `
      <div class="service-history-summary" style="
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 2rem;
        border-left: 4px solid #2d3e50;
      ">
        <div style="font-weight: 600; color: #2d3e50; margin-bottom: 0.5rem;">Общая статистика (устаревший формат):</div>
        <div style="display: flex; gap: 2rem; flex-wrap: wrap; font-size: 0.9rem; color: #666;">
          <span>Автомобилей: <strong>${Object.keys(recordsByCar).length}</strong></span>
          <span>Всего записей: <strong>${allRecords.length}</strong></span>
          <span>ТО: <strong>${allRecords.filter(r => r.type === 'maintenance').length}</strong></span>
          <span>Ремонты: <strong>${allRecords.filter(r => r.type === 'repair').length}</strong></span>
          <span>Общая стоимость: <strong>${allRecords.reduce((sum, r) => sum + (Number(r.totalCost) || 0), 0).toLocaleString('ru-RU')} ₽</strong></span>
        </div>
      </div>
    `;
    
    // Render each car's records
    Object.keys(recordsByCar).forEach(carId => {
      const car = cars.find(c => c.id == carId);
      const carName = car ? `${car.brand || ''} ${car.model || ''}`.trim() || car.name : 'Неизвестный автомобиль';
      const carDisplayName = car && car.nickname ? `${carName} (${car.nickname})` : carName;
      const carVin = car ? car.vin : 'VIN не указан';
      
      const carRecords = recordsByCar[carId];
      const carTotalCost = carRecords.reduce((sum, r) => sum + (Number(r.totalCost) || 0), 0);
      const carMaintenanceCount = carRecords.filter(r => r.type === 'maintenance').length;
      const carRepairCount = carRecords.filter(r => r.type === 'repair').length;
      
      html += `
        <div class="car-history-block" style="
          margin-bottom: 2.5rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          overflow: hidden;
        ">
          <div class="car-history-header" style="
            font-size: 1.15rem;
            font-weight: 600;
            color: #2d3e50;
            padding: 1rem 1.5rem;
            background: #f8f9fa;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            justify-content: space-between;
            align-items: center;
          ">
            <div>
              <div style="font-weight: 600; color: #2d3e50;">${carDisplayName}</div>
              <div style="font-size: 0.9rem; color: #888; margin-top: 0.2rem;">VIN: ${carVin}</div>
            </div>
            <div style="text-align: right; font-size: 0.9rem; color: #666;">
              <div>Записей: <strong>${carRecords.length}</strong></div>
              <div>ТО: <strong>${carMaintenanceCount}</strong> | Ремонты: <strong>${carRepairCount}</strong></div>
              <div>Стоимость: <strong>${carTotalCost.toLocaleString('ru-RU')} ₽</strong></div>
            </div>
          </div>
          
          <div style="padding: 0;">
            <table class="history-table" style="margin: 0; border: none;">
              <thead>
                <tr style="background: #f8f9fa;">
                  <th style="border: none; padding: 0.75rem 1rem;">Дата</th>
                  <th style="border: none; padding: 0.75rem 1rem;">Тип</th>
                  <th style="border: none; padding: 0.75rem 1rem;">Операция</th>
                  <th style="border: none; padding: 0.75rem 1rem;">Стоимость</th>
                  <th style="border: none; padding: 0.75rem 1rem;">Действия</th>
                </tr>
              </thead>
              <tbody>
      `;
      
      carRecords.forEach((record, i) => {
        const operationName = record.operationName || record.name || '-';
        const cost = record.totalCost != null ? Number(record.totalCost).toLocaleString('ru-RU') + ' ₽' : '-';
        
        html += `
          <tr${i % 2 === 1 ? ' class="alt-row"' : ''} 
              style="cursor: pointer; transition: background 0.2s; border: none;" 
              onclick="handleRowClick(event, '${record.id}', '${record.type}')"
              onmouseover="this.style.background='#e8f4fd'"
              onmouseout="this.style.background='${i % 2 === 1 ? '#f4f7fb' : 'white'}'">
            <td style="border: none; padding: 0.75rem 1rem;">${record.date || '-'}</td>
            <td style="border: none; padding: 0.75rem 1rem;">
              <span class="record-type-badge ${record.typeClass}" style="
                padding: 0.2rem 0.5rem;
                border-radius: 12px;
                font-size: 0.8rem;
                font-weight: 500;
                color: white;
                background: ${record.type === 'maintenance' ? '#28a745' : '#dc3545'};
              ">${record.typeLabel}</span>
            </td>
            <td style="border: none; padding: 0.75rem 1rem;">${operationName}</td>
            <td style="border: none; padding: 0.75rem 1rem; font-weight:600;">${cost}</td>
            <td style="border: none; padding: 0.75rem 1rem; text-align: center; white-space: nowrap;">
              <button onclick="event.stopPropagation(); editServiceRecord('${record.id}', '${record.type}')" 
                      style="
                        background: #007bff;
                        color: white;
                        border: none;
                        padding: 0.3rem 0.6rem;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 0.8rem;
                        margin-right: 0.3rem;
                      " title="Редактировать">
                ✏️
              </button>
              <button onclick="event.stopPropagation(); deleteIndividualRecord('${record.id}', '${record.type}', '${operationName}')" 
                      style="
                        background: #dc3545;
                        color: white;
                        border: none;
                        padding: 0.3rem 0.6rem;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 0.8rem;
                      " title="Удалить">
                🗑️
              </button>
            </td>
          </tr>
        `;
      });
      
      html += `
              </tbody>
            </table>
          </div>
        </div>
      `;
    });
    
    container.innerHTML = html;
    
    // Make the function globally available
    window.showServiceRecordDetails = showServiceRecordDetails;
    window.handleRowClick = handleRowClick;
    window.editServiceRecord = editServiceRecord;
    window.deleteServiceRecord = deleteServiceRecord;
    window.deleteIndividualRecord = deleteIndividualRecord;
    
  } catch (error) {
    container.innerHTML = `<div class="error">Ошибка загрузки: ${error.message}</div>`;
  }
}

// Helper functions for new service record system
function calculateTotalCost(serviceRecords, maintenances, repairs) {
  return serviceRecords.reduce((total, serviceRecord) => {
    return total + calculateServiceRecordCost(serviceRecord.id, maintenances, repairs);
  }, 0);
}

function calculateServiceRecordCost(serviceRecordId, maintenances, repairs) {
  const maintenanceCost = maintenances
    .filter(m => m.serviceRecordId == serviceRecordId)
    .reduce((sum, m) => sum + (Number(m.totalCost) || 0), 0);
    
  const repairCost = repairs
    .filter(r => r.serviceRecordId == serviceRecordId)
    .reduce((sum, r) => sum + (Number(r.totalCost) || 0), 0);
    
  return maintenanceCost + repairCost;
}

// New event handlers for service records
function handleServiceRecordClick(event, serviceRecordId) {
  viewServiceRecordDetails(serviceRecordId);
}

async function viewServiceRecordDetails(serviceRecordId) {
  try {
    const serviceRecords = await DataService.getServiceRecords();
    const serviceRecord = serviceRecords.find(sr => sr.id == serviceRecordId);
    
    if (!serviceRecord) {
      alert('Запись об обслуживании не найдена');
      return;
    }
    
    const [maintenances, repairs, cars] = await Promise.all([
      DataService.getMaintenance(),
      DataService.getRepairs(),
      DataService.getCars()
    ]);
    
    const car = cars.find(c => c.id == serviceRecord.carId);
    const carName = car ? `${car.brand || ''} ${car.model || ''}`.trim() || car.name : 'Неизвестный автомобиль';
    
    // Get operations for this service record
    const serviceMaintenances = maintenances.filter(m => m.serviceRecordId == serviceRecordId);
    const serviceRepairs = repairs.filter(r => r.serviceRecordId == serviceRecordId);
    
    let detailsHtml = `
      <div class="service-record-details-popup">
        <div class="popup-header">
          <h2>Детали записи об обслуживании</h2>
          <button class="close-btn" onclick="closeServiceRecordDetails()">&times;</button>
        </div>
        <div class="popup-body">
          <div class="detail-section">
            <h3>Основная информация</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Автомобиль:</span>
                <span class="detail-value">${carName}${car && car.nickname ? ` (${car.nickname})` : ''}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Дата:</span>
                <span class="detail-value">${serviceRecord.date}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Количество операций:</span>
                <span class="detail-value">${serviceRecord.subRecordsCount || 0}</span>
              </div>
            </div>
          </div>
    `;
    
    if (serviceMaintenances.length > 0) {
      detailsHtml += `
        <div class="detail-section">
          <h3>Техобслуживание (${serviceMaintenances.length} операций)</h3>
          <div class="consumables-list">
      `;
      
      serviceMaintenances.forEach(maint => {
        detailsHtml += `
          <div class="consumable-detail">
            <div class="consumable-name">${maint.operationName || 'Операция'}</div>
            <div class="consumable-cost">${Number(maint.totalCost || 0).toLocaleString('ru-RU')} ₽</div>
          </div>
        `;
      });
      
      detailsHtml += `
          </div>
        </div>
      `;
    }
    
    if (serviceRepairs.length > 0) {
      detailsHtml += `
        <div class="detail-section">
          <h3>Ремонт (${serviceRepairs.length} операций)</h3>
          <div class="consumables-list">
      `;
      
      serviceRepairs.forEach(repair => {
        detailsHtml += `
          <div class="consumable-detail">
            <div class="consumable-name">${repair.operationName || 'Операция'}</div>
            <div class="consumable-cost">${Number(repair.totalCost || 0).toLocaleString('ru-RU')} ₽</div>
          </div>
        `;
      });
      
      detailsHtml += `
          </div>
        </div>
      `;
    }
    
    const totalCost = calculateServiceRecordCost(serviceRecordId, maintenances, repairs);
    
    detailsHtml += `
          <div class="total-section">
            <h3>Итого</h3>
            <div class="total-amount">${totalCost.toLocaleString('ru-RU')} ₽</div>
          </div>
        </div>
      </div>
    `;
    
    // Create and show popup
    const popup = document.createElement('div');
    popup.className = 'popup-overlay';
    popup.style.display = 'flex';
    popup.innerHTML = detailsHtml;
    
    document.body.appendChild(popup);
    
    // Make close function available
    window.closeServiceRecordDetails = () => {
      document.body.removeChild(popup);
    };
    
  } catch (error) {
    console.error('Error viewing service record details:', error);
    alert('Ошибка загрузки деталей: ' + error.message);
  }
}

// Updated delete function for service records
async function deleteServiceRecord(serviceRecordId) {
  try {
    const serviceRecords = await DataService.getServiceRecords();
    const serviceRecord = serviceRecords.find(sr => sr.id == serviceRecordId);
    
    if (!serviceRecord) {
      alert('Запись об обслуживании не найдена');
      return;
    }
    
    const cars = await DataService.getCars();
    const car = cars.find(c => c.id == serviceRecord.carId);
    const carName = car ? `${car.brand || ''} ${car.model || ''}`.trim() || car.name : 'Неизвестный автомобиль';
    
    showConfirmationDialog(
      `Удалить запись об обслуживании от ${serviceRecord.date} для автомобиля "${carName}"? Все связанные операции будут также удалены.`,
      async () => {
        try {
          await DataService.deleteServiceRecord(serviceRecordId, true); // true = delete operations too
          showSuccessMessage('Запись об обслуживании удалена');
          renderServiceHistory(); // Refresh the list
        } catch (error) {
          alert('Ошибка удаления: ' + error.message);
        }
      },
      () => {
        // User cancelled
      }
    );
  } catch (error) {
    console.error('Error deleting service record:', error);
    alert('Ошибка: ' + error.message);
  }
}

// Success message function
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

// Function to show detailed view of a service record
async function showServiceRecordDetails(recordId, recordType) {
  try {
    let record;
    
    if (recordType === 'maintenance') {
      const maintenances = await DataService.getMaintenance();
      record = maintenances.find(m => m.id == recordId);
    } else {
      const repairs = await DataService.getRepairs();
      record = repairs.find(r => r.id == recordId);
    }
    
    if (!record) {
      alert('Запись не найдена');
      return;
    }
    
    const cars = await DataService.getCars();
    const car = cars.find(c => c.id == record.carId);
    const carName = car ? `${car.brand || ''} ${car.model || ''}`.trim() || car.name : 'Неизвестный автомобиль';
    
    let detailsHtml = `
      <div class="service-record-details-popup">
        <div class="popup-header">
          <h2>Детали ${recordType === 'maintenance' ? 'техобслуживания' : 'ремонта'}</h2>
          <button class="close-btn" onclick="closeServiceRecordDetails()">&times;</button>
        </div>
        <div class="popup-body">
          <div class="detail-section">
            <h3>Основная информация</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Автомобиль:</span>
                <span class="detail-value">${carName}${car && car.nickname ? ` (${car.nickname})` : ''}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Дата:</span>
                <span class="detail-value">${record.date || '-'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Пробег:</span>
                <span class="detail-value">${record.mileage != null ? record.mileage + ' км' : '-'}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Операция:</span>
                <span class="detail-value">${record.operationName || record.name || '-'}</span>
              </div>
            </div>
          </div>
    `;
    
    if (recordType === 'maintenance' && record.consumables && record.consumables.length > 0) {
      detailsHtml += `
        <div class="detail-section">
          <h3>Расходные материалы</h3>
          <div class="consumables-list">
      `;
      
      record.consumables.forEach(consumable => {
        detailsHtml += `
          <div class="consumable-detail">
            <span class="consumable-name">${consumable.name}</span>
            <span class="consumable-item">${consumable.item || '-'}</span>
            <span class="consumable-cost">${consumable.cost ? Number(consumable.cost).toLocaleString('ru-RU') + ' ₽' : '-'}</span>
          </div>
        `;
      });
      
      detailsHtml += `
          </div>
        </div>
      `;
    }
    
    if (recordType === 'repair' && record.spares && record.spares.length > 0) {
      detailsHtml += `
        <div class="detail-section">
          <h3>Запчасти</h3>
          <div class="spares-list">
      `;
      
      record.spares.forEach(spare => {
        detailsHtml += `
          <div class="spare-detail">
            <span class="spare-name">${spare.name}</span>
            <span class="spare-cost">${spare.cost ? Number(spare.cost).toLocaleString('ru-RU') + ' ₽' : '-'}</span>
          </div>
        `;
      });
      
      detailsHtml += `
          </div>
        </div>
      `;
    }
    
    if (record.workCost && record.workCost > 0) {
      detailsHtml += `
        <div class="detail-section">
          <h3>Работы</h3>
          <div class="work-cost">
            <span class="work-cost-label">Стоимость работ:</span>
            <span class="work-cost-value">${Number(record.workCost).toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>
      `;
    }
    
    detailsHtml += `
          <div class="detail-section total-section">
            <h3>Итого</h3>
            <div class="total-amount">
              ${record.totalCost ? Number(record.totalCost).toLocaleString('ru-RU') + ' ₽' : '-'}
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Create and show popup
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.id = 'service-record-details-overlay';
    overlay.innerHTML = detailsHtml;
    
    document.body.appendChild(overlay);
    
    // Make close function globally available
    window.closeServiceRecordDetails = closeServiceRecordDetails;
    
  } catch (error) {
    console.error('Error showing service record details:', error);
    alert('Ошибка загрузки деталей: ' + error.message);
  }
}

// Function to close service record details popup
function closeServiceRecordDetails() {
  const overlay = document.getElementById('service-record-details-overlay');
  if (overlay) {
    document.body.removeChild(overlay);
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

// Make the function globally available
window.showServiceRecordDetails = showServiceRecordDetails;
window.handleRowClick = handleRowClick;
window.editServiceRecord = editServiceRecord;
window.deleteServiceRecord = deleteServiceRecord;
window.deleteIndividualRecord = deleteIndividualRecord;

// Function to handle row clicks (for viewing details)
function handleRowClick(event, recordId, recordType) {
  // Only show details if the click wasn't on a button
  if (!event.target.closest('button')) {
    showServiceRecordDetails(recordId, recordType);
  }
}

// Function to edit a service record
async function editServiceRecord(recordId, recordType) {
  try {
    let record;
    
    if (recordType === 'maintenance') {
      const maintenances = await DataService.getMaintenance();
      record = maintenances.find(m => m.id == recordId);
    } else {
      const repairs = await DataService.getRepairs();
      record = repairs.find(r => r.id == recordId);
    }
    
    if (!record) {
      alert('Запись не найдена');
      return;
    }
    
    // Show edit form
    showEditServiceRecordForm(record, recordType);
    
  } catch (error) {
    console.error('Error editing service record:', error);
    alert('Ошибка редактирования: ' + error.message);
  }
}

// Function to delete an individual maintenance or repair record
async function deleteIndividualRecord(recordId, recordType, operationName) {
  const recordTypeText = recordType === 'maintenance' ? 'техобслуживания' : 'ремонта';
  
  showConfirmationDialog(
    `Вы уверены, что хотите удалить запись ${recordTypeText} "${operationName}"?`,
    async () => {
      try {
        if (recordType === 'maintenance') {
          await deleteMaintenanceRecord(recordId);
        } else {
          await deleteRepairRecord(recordId);
        }
        
        // Refresh the service history
        renderServiceHistory();
        alert('Запись успешно удалена');
        
      } catch (error) {
        console.error('Error deleting service record:', error);
        alert('Ошибка удаления: ' + error.message);
      }
    },
    () => {
      // User cancelled
    }
  );
}

// Function to delete maintenance record
async function deleteMaintenanceRecord(recordId) {
  const maintenances = await DataService.getMaintenance();
  const updatedMaintenances = maintenances.filter(m => m.id != recordId);
  
  if (CONFIG.useBackend) {
    // TODO: Replace with actual backend API call
    // await fetch(`${CONFIG.apiUrl}/maintenance/${recordId}`, { method: 'DELETE' });
    throw new Error('Backend API not implemented yet');
  } else {
    localStorage.setItem('maintenance', JSON.stringify(updatedMaintenances));
  }
}

// Function to delete repair record
async function deleteRepairRecord(recordId) {
  const repairs = await DataService.getRepairs();
  const updatedRepairs = repairs.filter(r => r.id != recordId);
  
  if (CONFIG.useBackend) {
    // TODO: Replace with actual backend API call
    // await fetch(`${CONFIG.apiUrl}/repairs/${recordId}`, { method: 'DELETE' });
    throw new Error('Backend API not implemented yet');
  } else {
    localStorage.setItem('repairs', JSON.stringify(updatedRepairs));
  }
}

// Function to show edit form for service record
async function showEditServiceRecordForm(record, recordType) {
  const cars = await DataService.getCars();
  const car = cars.find(c => c.id == record.carId);
  const carName = car ? `${car.brand || ''} ${car.model || ''}`.trim() || car.name : 'Неизвестный автомобиль';
  
  let formHtml = `
    <div class="service-record-edit-popup">
      <div class="popup-header">
        <h2>Редактировать ${recordType === 'maintenance' ? 'техобслуживание' : 'ремонт'}</h2>
        <button class="close-btn" onclick="closeEditServiceRecordForm()">&times;</button>
      </div>
      <div class="popup-body">
        <form id="edit-service-record-form">
          <input type="hidden" id="edit-record-id" value="${record.id}">
          <input type="hidden" id="edit-record-type" value="${recordType}">
          
          <div class="form-section">
            <h3>Основная информация</h3>
            <div class="form-grid">
              <div class="input-group">
                <label for="edit-car-select">Автомобиль:</label>
                <select id="edit-car-select" required>
                  ${cars.map(c => `
                    <option value="${c.id}" ${c.id == record.carId ? 'selected' : ''}>
                      ${c.brand || ''} ${c.model || ''} ${c.nickname ? `(${c.nickname})` : ''}
                    </option>
                  `).join('')}
                </select>
              </div>
              <div class="input-group">
                <label for="edit-date">Дата:</label>
                <input type="text" id="edit-date" value="${record.date || ''}" 
                       placeholder="дд.мм.гггг" required 
                       pattern="\\d{2}\\.\\d{2}\\.\\d{4}">
              </div>
              <div class="input-group">
                <label for="edit-mileage">Пробег (км):</label>
                <input type="number" id="edit-mileage" value="${record.mileage || ''}" 
                       min="0" required>
              </div>
              <div class="input-group">
                <label for="edit-operation">Операция:</label>
                <input type="text" id="edit-operation" 
                       value="${record.operationName || record.name || ''}" required>
              </div>
            </div>
          </div>
  `;
  
  if (recordType === 'maintenance') {
    formHtml += `
      <div class="form-section">
        <h3>Расходные материалы</h3>
        <div id="edit-consumables-list">
    `;
    
    if (record.consumables && record.consumables.length > 0) {
      record.consumables.forEach((consumable, index) => {
        formHtml += `
          <div class="consumable-edit-item">
            <input type="text" class="consumable-name-input" 
                   value="${consumable.name}" placeholder="Название" required>
            <input type="text" class="consumable-item-input" 
                   value="${consumable.item || ''}" placeholder="Деталь">
            <input type="number" class="consumable-quantity-input" 
                   value="${consumable.quantity || 1}" placeholder="1" min="1" step="1">
            <div class="cost-input-wrapper">
              <input type="number" class="consumable-cost-input" 
                     value="${consumable.cost || 0}" placeholder="0" min="0" step="0.01">
              <span class="ruble-icon">₽</span>
            </div>
            <button type="button" onclick="removeConsumableItem(this)" 
                    style="background: #dc3545; color: white; border: none; padding: 0.3rem; border-radius: 4px; cursor: pointer;">
              ✕
            </button>
          </div>
        `;
      });
    }
    
    formHtml += `
        </div>
        <button type="button" onclick="addConsumableItem()" 
                style="background: #28a745; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-top: 0.5rem;">
          + Добавить расходный материал
        </button>
      </div>
    `;
  }
  
  if (recordType === 'repair') {
    formHtml += `
      <div class="form-section">
        <h3>Запчасти</h3>
        <div id="edit-spares-list">
    `;
    
    if (record.spares && record.spares.length > 0) {
      record.spares.forEach((spare, index) => {
        formHtml += `
          <div class="spare-edit-item">
            <input type="text" class="spare-name-input" 
                   value="${spare.name}" placeholder="Название запчасти" required>
            <input type="number" class="spare-quantity-input" 
                   value="${spare.quantity || 1}" placeholder="1" min="1" step="1">
            <div class="cost-input-wrapper">
              <input type="number" class="spare-cost-input" 
                     value="${spare.cost || 0}" placeholder="0" min="0" step="0.01">
              <span class="ruble-icon">₽</span>
            </div>
            <button type="button" onclick="removeSpareItem(this)" 
                    style="background: #dc3545; color: white; border: none; padding: 0.3rem; border-radius: 4px; cursor: pointer;">
              ✕
            </button>
          </div>
        `;
      });
    }
    
    formHtml += `
        </div>
        <button type="button" onclick="addSpareItem()" 
                style="background: #28a745; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-top: 0.5rem;">
          + Добавить запчасть
        </button>
      </div>
    `;
  }
  
  formHtml += `
          <div class="form-section">
            <h3>Работы</h3>
            <div class="input-group">
              <label for="edit-work-cost">Стоимость работ (₽):</label>
              <input type="number" id="edit-work-cost" 
                     value="${record.workCost || 0}" placeholder="0" min="0" step="0.01">
            </div>
          </div>
          
          <div class="form-section total-section">
            <h3>Итого: <span id="edit-total-amount">${record.totalCost ? Number(record.totalCost).toLocaleString('ru-RU') + ' ₽' : '0 ₽'}</span></h3>
          </div>
          
          <div class="form-actions">
            <button type="submit" class="btn-primary">Сохранить изменения</button>
            <button type="button" onclick="closeEditServiceRecordForm()" class="btn-secondary">Отмена</button>
          </div>
        </form>
      </div>
    </div>
  `;
  
  // Create and show popup
  const overlay = document.createElement('div');
  overlay.className = 'popup-overlay';
  overlay.id = 'edit-service-record-overlay';
  overlay.innerHTML = formHtml;
  
  document.body.appendChild(overlay);
  
  // Setup form event listeners
  setupEditFormEventListeners();
  
  // Make functions globally available
  window.closeEditServiceRecordForm = closeEditServiceRecordForm;
  window.addConsumableItem = addConsumableItem;
  window.removeConsumableItem = removeConsumableItem;
  window.addSpareItem = addSpareItem;
  window.removeSpareItem = removeSpareItem;
}

// Function to close edit form
function closeEditServiceRecordForm() {
  const overlay = document.getElementById('edit-service-record-overlay');
  if (overlay) {
    document.body.removeChild(overlay);
  }
}

// Function to setup edit form event listeners
function setupEditFormEventListeners() {
  const form = document.getElementById('edit-service-record-form');
  if (!form) return;
  
  // Add event listeners for cost and quantity inputs to recalculate total
  form.addEventListener('input', function(e) {
    if (e.target.classList.contains('consumable-cost-input') || 
        e.target.classList.contains('spare-cost-input') || 
        e.target.classList.contains('consumable-quantity-input') || 
        e.target.classList.contains('spare-quantity-input') || 
        e.target.id === 'edit-work-cost') {
      calculateEditTotal();
    }
  });
  
  // Handle form submission
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#dc3545';
        isValid = false;
      } else {
        field.style.borderColor = '';
      }
    });
    
    if (!isValid) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }
    
    // Validate date format
    const dateInput = document.getElementById('edit-date');
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(dateInput.value)) {
      alert('Пожалуйста, введите корректную дату в формате дд.мм.гггг');
      dateInput.style.borderColor = '#dc3545';
      return;
    }
    
    try {
      await saveEditedServiceRecord();
      closeEditServiceRecordForm();
      renderServiceHistory();
      alert('Запись успешно обновлена');
    } catch (error) {
      console.error('Error saving edited record:', error);
      alert('Ошибка сохранения: ' + error.message);
    }
  });
}

// Function to calculate total in edit form
function calculateEditTotal() {
  let total = 0;
  
  // Add consumables costs (cost * quantity)
  const consumableItems = document.querySelectorAll('.consumable-edit-item');
  consumableItems.forEach(item => {
    const cost = parseFloat(item.querySelector('.consumable-cost-input')?.value) || 0;
    const quantity = parseFloat(item.querySelector('.consumable-quantity-input')?.value) || 1;
    total += cost * quantity;
  });
  
  // Add spares costs (cost * quantity)
  const spareItems = document.querySelectorAll('.spare-edit-item');
  spareItems.forEach(item => {
    const cost = parseFloat(item.querySelector('.spare-cost-input')?.value) || 0;
    const quantity = parseFloat(item.querySelector('.spare-quantity-input')?.value) || 1;
    total += cost * quantity;
  });
  
  // Add work cost
  const workCost = parseFloat(document.getElementById('edit-work-cost')?.value) || 0;
  total += workCost;
  
  const totalElement = document.getElementById('edit-total-amount');
  if (totalElement) {
    totalElement.textContent = total.toLocaleString('ru-RU') + ' ₽';
  }
}

// Function to add consumable item in edit form
function addConsumableItem() {
  const list = document.getElementById('edit-consumables-list');
  const item = document.createElement('div');
  item.className = 'consumable-edit-item';
  item.innerHTML = `
    <input type="text" class="consumable-name-input" placeholder="Название" required>
    <input type="text" class="consumable-item-input" placeholder="Деталь">
    <input type="number" class="consumable-quantity-input" placeholder="1" min="1" step="1" value="1">
    <div class="cost-input-wrapper">
      <input type="number" class="consumable-cost-input" placeholder="0" min="0" step="0.01">
      <span class="ruble-icon">₽</span>
    </div>
    <button type="button" onclick="removeConsumableItem(this)" 
            style="background: #dc3545; color: white; border: none; padding: 0.3rem; border-radius: 4px; cursor: pointer;">
      ✕
    </button>
  `;
  list.appendChild(item);
}

// Function to remove consumable item in edit form
function removeConsumableItem(button) {
  button.parentElement.remove();
  calculateEditTotal();
}

// Function to add spare item in edit form
function addSpareItem() {
  const list = document.getElementById('edit-spares-list');
  const item = document.createElement('div');
  item.className = 'spare-edit-item';
  item.innerHTML = `
    <input type="text" class="spare-name-input" placeholder="Название запчасти" required>
    <input type="number" class="spare-quantity-input" placeholder="1" min="1" step="1" value="1">
    <div class="cost-input-wrapper">
      <input type="number" class="spare-cost-input" placeholder="0" min="0" step="0.01">
      <span class="ruble-icon">₽</span>
    </div>
    <button type="button" onclick="removeSpareItem(this)" 
            style="background: #dc3545; color: white; border: none; padding: 0.3rem; border-radius: 4px; cursor: pointer;">
      ✕
    </button>
  `;
  list.appendChild(item);
}

// Function to remove spare item in edit form
function removeSpareItem(button) {
  button.parentElement.remove();
  calculateEditTotal();
}

// Function to save edited service record
async function saveEditedServiceRecord() {
  try {
    const recordId = document.getElementById('edit-record-id')?.value;
    const recordType = document.getElementById('edit-record-type')?.value;
    const carId = document.getElementById('edit-car-select')?.value;
    const date = document.getElementById('edit-date')?.value;
    const mileage = parseInt(document.getElementById('edit-mileage')?.value);
    const operation = document.getElementById('edit-operation')?.value;
    const workCost = parseFloat(document.getElementById('edit-work-cost')?.value) || 0;
    
    // Validate that all required elements exist
    if (!recordId || !recordType || !carId || !date || !operation) {
      throw new Error('Не удалось найти необходимые поля формы');
    }
  
  let totalCost = workCost;
  
  if (recordType === 'maintenance') {
    const consumables = [];
    const consumableItems = document.querySelectorAll('.consumable-edit-item');
    
    consumableItems.forEach(item => {
      const name = item.querySelector('.consumable-name-input').value.trim();
      const itemValue = item.querySelector('.consumable-item-input').value.trim();
      const cost = parseFloat(item.querySelector('.consumable-cost-input').value) || 0;
      const quantity = parseFloat(item.querySelector('.consumable-quantity-input').value) || 1;
      
      if (name) {
        consumables.push({ name, item: itemValue, cost, quantity, totalCost: cost * quantity });
        totalCost += cost * quantity;
      }
    });
    
    const maintenanceData = {
      id: parseInt(recordId),
      carId: parseInt(carId),
      date,
      mileage,
      operationName: operation,
      consumables,
      workCost,
      totalCost
    };
    
    await updateMaintenanceRecord(maintenanceData);
    
  } else if (recordType === 'repair') {
    const spares = [];
    const spareItems = document.querySelectorAll('.spare-edit-item');
    
    spareItems.forEach(item => {
      const name = item.querySelector('.spare-name-input').value.trim();
      const cost = parseFloat(item.querySelector('.spare-cost-input').value) || 0;
      const quantity = parseFloat(item.querySelector('.spare-quantity-input').value) || 1;
      
      if (name) {
        spares.push({ name, cost, quantity, totalCost: cost * quantity });
        totalCost += cost * quantity;
      }
    });
    
    const repairData = {
      id: parseInt(recordId),
      carId: parseInt(carId),
      date,
      mileage,
      operationName: operation,
      spares,
      workCost,
      totalCost
    };
    
    await updateRepairRecord(repairData);
  }
  } catch (error) {
    console.error('Error in saveEditedServiceRecord:', error);
    throw new Error('Ошибка при сохранении записи: ' + error.message);
  }
}

// Function to update maintenance record
async function updateMaintenanceRecord(maintenanceData) {
  const maintenances = await DataService.getMaintenance();
  const index = maintenances.findIndex(m => m.id == maintenanceData.id);
  
  if (index === -1) {
    throw new Error('Запись не найдена');
  }
  
  maintenances[index] = maintenanceData;
  
  if (CONFIG.useBackend) {
    // TODO: Replace with actual backend API call
    // await fetch(`${CONFIG.apiUrl}/maintenance/${maintenanceData.id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(maintenanceData)
    // });
    throw new Error('Backend API not implemented yet');
  } else {
    localStorage.setItem('maintenance', JSON.stringify(maintenances));
  }
}

// Function to update repair record
async function updateRepairRecord(repairData) {
  const repairs = await DataService.getRepairs();
  const index = repairs.findIndex(r => r.id == repairData.id);
  
  if (index === -1) {
    throw new Error('Запись не найдена');
  }
  
  repairs[index] = repairData;
  
  if (CONFIG.useBackend) {
    // TODO: Replace with actual backend API call
    // await fetch(`${CONFIG.apiUrl}/repairs/${repairData.id}`, {
    //   method: 'PUT',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(repairData)
    // });
    throw new Error('Backend API not implemented yet');
  } else {
    localStorage.setItem('repairs', JSON.stringify(repairs));
  }
}

// Make functions globally available for onclick handlers
window.renderMaintenHistory = renderMaintenHistory; 