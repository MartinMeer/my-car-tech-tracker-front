import { DataService } from './dataService.js';
import { formatCarNameWithNickname } from './carNameFormatter.js';

// Global variables for repair operations
let sparesList = [];
let spareCounter = 1;

// Make sparesList globally accessible for service record manager
window.sparesList = sparesList;

export async function renderRepairHistory() {
  const container = document.getElementById('repair-history-list');
  if (!container) return;
  container.innerHTML = '<div class="loading">Загрузка истории ремонтов...</div>';
  
  try {
    const [repairs, cars] = await Promise.all([
      DataService.getRepairs(),
      DataService.getCars()
    ]);
    
    if (!repairs || repairs.length === 0) {
      container.innerHTML = '<div class="empty">Нет записей о ремонтах.</div>';
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
    
    // Group repairs by carId
    const repairsByCar = {};
    repairs.forEach(r => {
      if (!repairsByCar[r.carId]) repairsByCar[r.carId] = [];
      repairsByCar[r.carId].push(r);
    });

    let html = '';
    
    // Add header indicating if we're showing filtered results
    if (currentCarId && carsToShow.length === 1) {
      const currentCar = carsToShow[0];
      html += `
        <div class="filter-notice" style="
          background: #fff3e0;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          border-left: 4px solid #ff9800;
          color: #f57c00;
        ">
          <strong>Показана история ремонтов для автомобиля:</strong> ${formatCarNameWithNickname(currentCar)}
          <div style="margin-top: 0.5rem;">
            <a href="#repair-history" onclick="localStorage.setItem('showAllCars', 'true'); renderRepairHistory();" style="color: #f57c00; text-decoration: underline;">
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
            background: #e8f5e8;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            border-left: 4px solid #4caf50;
            color: #2e7d32;
          ">
            <strong>Показана история ремонтов для всех автомобилей</strong>
            <div style="margin-top: 0.5rem;">
              <a href="#repair-history" onclick="localStorage.removeItem('showAllCars'); renderRepairHistory();" style="color: #2e7d32; text-decoration: underline;">
                Показать только для ${formatCarNameWithNickname(currentCar)}
              </a>
            </div>
          </div>
        `;
      }
    }
    
    carsToShow.forEach(car => {
      const carRepairs = repairsByCar[car.id] || [];
      html += `
        <div class="car-history-block" style="margin-bottom:2.5rem;">
          <div class="car-history-header" style="font-size:1.15rem;font-weight:600;color:#2d3e50;margin-bottom:0.7rem;">
            ${formatCarNameWithNickname(car)} <span style="color:#888;font-size:0.97rem;">[VIN: ${car.vin || '-'}]</span>
          </div>
      `;
      if (carRepairs.length === 0) {
        html += `<div class="empty" style="margin-bottom:1.5rem;">Нет записей о ремонтах для этого автомобиля.</div>`;
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
              ${carRepairs.map((r, i) => `
                <tr${i % 2 === 1 ? ' class="alt-row"' : ''}>
                  <td>${r.date || '-'}</td>
                  <td>${r.mileage != null ? r.mileage : '-'}</td>
                  <td>${r.operationName || '-'}</td>
                  <td>${r.totalCost != null ? Number(r.totalCost).toLocaleString('ru-RU') + ' ₽' : '-'}</td>
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
    const backBtn = document.getElementById('repair-back-btn');
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

// Open repair popup
export function openRepairPopup() {
  // Check if service record exists
  if (!window.currentServiceRecord) {
    alert('Сначала выберите автомобиль для обслуживания');
    return;
  }
  
  sparesList = [];
  spareCounter = 1;
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

export function closeRepairPopup() {
  const popup = document.getElementById('repair-entry-popup');
  if (popup) {
    popup.style.display = 'none';
  }
  
  // Reset spares list
  sparesList = [];
  window.sparesList = sparesList;
}

export function openSparePopup() {
  // Reset spare form
  const nameInput = document.getElementById('spare-name');
  const quantityInput = document.getElementById('spare-quantity');
  const costInput = document.getElementById('spare-cost');
  
  if (nameInput) nameInput.value = '';
  if (quantityInput) quantityInput.value = '1';
  if (costInput) costInput.value = '0';
  
  // Show popup
  const popup = document.getElementById('spare-entry-popup');
  if (popup) {
    popup.style.display = 'flex';
  }
}

export function closeSparePopup() {
  const popup = document.getElementById('spare-entry-popup');
  if (popup) {
    popup.style.display = 'none';
  }
}

export function addSpare() {
  const nameInput = document.getElementById('spare-name');
  const costInput = document.getElementById('spare-cost');
  const quantityInput = document.getElementById('spare-quantity');
  
  if (!nameInput || !costInput || !quantityInput) return;
  
  const name = nameInput.value.trim();
  const cost = parseFloat(costInput.value) || 0;
  const quantity = parseFloat(quantityInput.value) || 1;
  
  if (!name) {
    alert('Введите название запчасти');
    return;
  }
  
  const spare = {
    id: spareCounter++,
    name: name,
    cost: cost,
    quantity: quantity,
    totalCost: cost * quantity
  };
  
  sparesList.push(spare);
  window.sparesList = sparesList; // Update global reference
  
  // Add to UI
  const sparesListDiv = document.getElementById('spares-list');
  if (sparesListDiv) {
    const spareDiv = document.createElement('div');
    spareDiv.className = 'spare-item';
    spareDiv.innerHTML = `
      <span>${spare.id}. ${spare.name} (${spare.quantity} шт.)</span>
      <span>${spare.cost.toFixed(2)} ₽ × ${spare.quantity} = ${spare.totalCost.toFixed(2)} ₽</span>
    `;
    sparesListDiv.appendChild(spareDiv);
  }
  
  // Update total
  calculateRepairTotal();
  
  // Close popup
  closeSparePopup();
}

export function calculateRepairTotal() {
  const sparesTotal = sparesList.reduce((sum, spare) => sum + (spare.totalCost || spare.cost), 0);
  const workCostInput = document.getElementById('repair-work-cost');
  const workCost = workCostInput ? parseFloat(workCostInput.value) || 0 : 0;
  const total = sparesTotal + workCost;
  
  const totalDiv = document.getElementById('repair-total');
  if (totalDiv) {
    totalDiv.textContent = `${total.toFixed(2)} ₽`;
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

// Make functions globally available for onclick handlers
window.renderRepairHistory = renderRepairHistory; 