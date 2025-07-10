import { DataService } from './dataService.js';

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

// Global variables for repair popup
let sparesList = [];
let spareCounter = 1;

export function openRepairPopup() {
  sparesList = [];
  spareCounter = 1;
  document.getElementById('spares-list').innerHTML = '';
  document.getElementById('repair-total').textContent = '0 ₽';
  document.getElementById('repair-work-cost').value = '';
  
  // Set default date to today
  const dateInput = document.getElementById('repair-date');
  if (dateInput) {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    dateInput.value = `${dd}.${mm}.${yyyy}`;
  } 
  
  // Set default mileage to current car's mileage
  const mileageInput = document.getElementById('repair-mileage');
  if (mileageInput) {
    getCurrentCarFromBackend().then(car => {
      if (car && car.mileage != null) {
        mileageInput.value = car.mileage;
      } else {
        mileageInput.value = '';
      }
    });
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
  document.getElementById('repair-entry-popup').style.display = 'none';
  sparesList = [];
}

export function openSparePopup() {
  document.getElementById('spare-name').value = '';
  document.getElementById('spare-cost').value = '0';
  document.getElementById('spare-entry-popup').style.display = 'flex';
}

export function closeSparePopup() {
  document.getElementById('spare-entry-popup').style.display = 'none';
}

export function addSpare() {
  const name = document.getElementById('spare-name').value.trim();
  const cost = parseFloat(document.getElementById('spare-cost').value) || 0;
  
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
  
  // Add to UI
  const sparesListDiv = document.getElementById('spares-list');
  const spareDiv = document.createElement('div');
  spareDiv.className = 'spare-item';
  spareDiv.innerHTML = `
    <span>${spare.id}. ${spare.name}</span>
    <span>${spare.cost.toFixed(2)} ₽</span>
  `;
  sparesListDiv.appendChild(spareDiv);
  
  // Update total
  calculateRepairTotal();
  
  closeSparePopup();
}

export function calculateRepairTotal() {
  const sparesTotal = sparesList.reduce((sum, spare) => sum + spare.cost, 0);
  const workCost = parseFloat(document.getElementById('repair-work-cost')?.value) || 0;
  const total = sparesTotal + workCost;
  document.getElementById('repair-total').textContent = `${total.toFixed(2)} ₽`;
}

export async function saveRepair() {
  try {
    // Validate date and mileage
    const date = document.getElementById('repair-date').value.trim();
    const mileage = document.getElementById('repair-mileage').value.trim();
    
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(date)) {
      alert('Пожалуйста, введите корректную дату в формате дд.мм.гггг');
      return;
    }
    if (!mileage || isNaN(mileage) || Number(mileage) < 0) {
      alert('Пожалуйста, введите корректный пробег');
      return;
    }
    
    const total = parseFloat(document.getElementById('repair-total').textContent) || 0;
    const operationName = document.getElementById('repair-operation-name') ? document.getElementById('repair-operation-name').value.trim() : '';
    const workCost = parseFloat(document.getElementById('repair-work-cost')?.value) || 0;
    
    const repairData = {
      operationName: operationName,
      id: Date.now(), // Simple ID for demo
      date: date,
      spares: sparesList,
      workCost: workCost,
      totalCost: total,
      carId: localStorage.getItem('currentCarId'),
      mileage: Number(mileage)
    };
    
    // Save using DataService (handles localStorage vs backend)
    const result = await DataService.saveRepair(repairData);
    
    console.log('Saving repair:', repairData);
    console.log('Save result:', result);
    closeRepairPopup();
    alert('Отчет о ремонте сохранен!');
  } catch (error) {
    console.error('Error saving repair:', error);
    alert('Ошибка сохранения: ' + error.message);
  }
}

// Helper function
async function getCurrentCarFromBackend() {
  const carId = localStorage.getItem('currentCarId');
  const cars = await DataService.getCars();
  return cars.find(c => c.id == carId);
} 