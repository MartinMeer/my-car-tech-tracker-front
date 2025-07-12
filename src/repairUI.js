import { DataService } from './dataService.js';

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
    // Group repairs by carId
    const repairsByCar = {};
    repairs.forEach(r => {
      if (!repairsByCar[r.carId]) repairsByCar[r.carId] = [];
      repairsByCar[r.carId].push(r);
    });

    let html = '';
    cars.forEach(car => {
      const carRepairs = repairsByCar[car.id] || [];
      html += `
        <div class="car-history-block" style="margin-bottom:2.5rem;">
          <div class="car-history-header" style="font-size:1.15rem;font-weight:600;color:#2d3e50;margin-bottom:0.7rem;">
            ${car.brand || ''} ${car.model || ''} ${car.nickname ? '(' + car.nickname + ')' : ''} <span style="color:#888;font-size:0.97rem;">[VIN: ${car.vin || '-'}]</span>
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
  
  // Set default mileage to selected car's mileage from service record
  const mileageInput = document.getElementById('repair-mileage');
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
  const costInput = document.getElementById('spare-cost');
  
  if (nameInput) nameInput.value = '';
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
  
  if (!nameInput || !costInput) return;
  
  const name = nameInput.value.trim();
  const cost = parseFloat(costInput.value) || 0;
  
  if (!name) {
    alert('Введите название запчасти');
    return;
  }
  
  const spare = {
    id: spareCounter++,
    name: name,
    cost: cost
  };
  
  sparesList.push(spare);
  window.sparesList = sparesList; // Update global reference
  
  // Add to UI
  const sparesListDiv = document.getElementById('spares-list');
  if (sparesListDiv) {
    const spareDiv = document.createElement('div');
    spareDiv.className = 'spare-item';
    spareDiv.innerHTML = `
      <span>${spare.id}. ${spare.name}</span>
      <span>${spare.cost.toFixed(2)} ₽</span>
    `;
    sparesListDiv.appendChild(spareDiv);
  }
  
  // Update total
  calculateRepairTotal();
  
  // Close popup
  closeSparePopup();
}

export function calculateRepairTotal() {
  const sparesTotal = sparesList.reduce((sum, spare) => sum + spare.cost, 0);
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