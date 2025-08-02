import { DataService } from './dataService.js';
import { formatCarName } from './carNameFormatter.js';
import { mileageHandler } from './mileageHandler.js';

// Initialize mileage history UI
export function initializeMileageHistoryUI() {
  console.log('Mileage History UI initializing...');
  
  // Load and display mileage history
  loadMileageHistory();
  
  // Set up event listeners
  setupEventListeners();
  
  console.log('Mileage History UI initialized successfully');
}

// Load and display mileage history
async function loadMileageHistory(carId = null) {
  try {
    const [mileageData, cars] = await Promise.all([
      mileageHandler.getAllMileageData(),
      DataService.getCars()
    ]);
    
    // Populate car selection dropdown
    populateCarSelect(cars, carId);
    
    if (!mileageData || mileageData.length === 0) {
      showEmptyMileageHistory();
      updateStatistics([]);
      return;
    }
    
    // Filter by car if specified
    let filteredData = mileageData;
    if (carId) {
      filteredData = mileageData.filter(entry => entry.carId == carId);
    }
    
    if (filteredData.length === 0) {
      showEmptyMileageHistory();
      updateStatistics([]);
      return;
    }
    
    // Sort by date (newest first)
    filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Display mileage history
    displayMileageHistory(filteredData, cars);
    
    // Update statistics
    updateStatistics(filteredData);
    
  } catch (error) {
    console.error('Error loading mileage history:', error);
    showErrorMessage('Ошибка загрузки истории пробега: ' + error.message);
  }
}

// Populate car selection dropdown
function populateCarSelect(cars, selectedCarId = null) {
  const carSelect = document.getElementById('car-select');
  if (!carSelect) return;
  
  // Clear existing options except "All cars"
  carSelect.innerHTML = '<option value="">Все автомобили</option>';
  
  // Add car options
  cars.forEach(car => {
    const option = document.createElement('option');
    option.value = car.id;
            option.textContent = formatCarName(car);
    if (selectedCarId && car.id == selectedCarId) {
      option.selected = true;
    }
    carSelect.appendChild(option);
  });
}

// Display mileage history in table
function displayMileageHistory(mileageData, cars) {
  const tbody = document.getElementById('mileage-history-tbody');
  if (!tbody) return;
  
  let html = '';
  
  mileageData.forEach(entry => {
    const car = cars.find(c => c.id == entry.carId);
    const carName = car ? formatCarName(car) : 'Неизвестный автомобиль';
    
    const typeLabels = {
      'initial': 'Начальный пробег',
      'maintenance': 'Техобслуживание',
      'repair': 'Ремонт',
      'service': 'Обслуживание',
      'alert': 'Проблема',
      'manual': 'Ручной ввод'
    };
    
    const typeLabel = typeLabels[entry.type] || entry.type;
    
    let additionalInfo = '';
    if (entry.metadata) {
      if (entry.metadata.operationName) {
        additionalInfo = `Операция: ${entry.metadata.operationName}`;
      } else if (entry.metadata.subsystem) {
        additionalInfo = `Система: ${entry.metadata.subsystem}`;
      }
    }
    
    html += `
      <tr>
        <td>${entry.date}</td>
        <td>${carName}</td>
        <td class="mileage-cell">${entry.mileage.toLocaleString('ru-RU')} км</td>
        <td>${typeLabel}</td>
        <td>${additionalInfo}</td>
      </tr>
    `;
  });
  
  tbody.innerHTML = html;
}

// Show empty mileage history message
function showEmptyMileageHistory() {
  const tbody = document.getElementById('mileage-history-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = `
    <tr>
      <td colspan="5" class="empty">
        <div style="text-align: center; padding: 2rem; color: #666;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🛣️</div>
          <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">История пробега пуста</div>
          <div>Добавьте автомобиль и начните отслеживать пробег</div>
        </div>
      </td>
    </tr>
  `;
}

// Update statistics
function updateStatistics(mileageData) {
  if (!mileageData || mileageData.length === 0) {
    document.getElementById('total-mileage').textContent = '-';
    document.getElementById('avg-mileage-per-day').textContent = '-';
    document.getElementById('last-update').textContent = '-';
    return;
  }
  
  // Calculate total mileage (latest entry for each car)
  const cars = new Set();
  let totalMileage = 0;
  
  mileageData.forEach(entry => {
    if (!cars.has(entry.carId)) {
      cars.add(entry.carId);
      totalMileage += entry.mileage;
    }
  });
  
  // Calculate average mileage per day
  const sortedData = mileageData.sort((a, b) => new Date(a.date) - new Date(b.date));
  const firstDate = new Date(sortedData[0].date);
  const lastDate = new Date(sortedData[sortedData.length - 1].date);
  const daysDiff = Math.max(1, Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)));
  const avgMileagePerDay = Math.round(totalMileage / daysDiff);
  
  // Get last update
  const lastUpdate = sortedData[sortedData.length - 1].date;
  
  // Update UI
  document.getElementById('total-mileage').textContent = `${totalMileage.toLocaleString('ru-RU')} км`;
  document.getElementById('avg-mileage-per-day').textContent = `${avgMileagePerDay.toLocaleString('ru-RU')} км/день`;
  document.getElementById('last-update').textContent = lastUpdate;
}

// Setup event listeners
function setupEventListeners() {
  // Car selection change
  const carSelect = document.getElementById('car-select');
  if (carSelect) {
    carSelect.addEventListener('change', function() {
      const selectedCarId = this.value || null;
      loadMileageHistory(selectedCarId);
    });
  }
}

// Show error message
function showErrorMessage(message) {
  const tbody = document.getElementById('mileage-history-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = `
    <tr>
      <td colspan="5" class="error">
        <div style="text-align: center; padding: 2rem; color: #dc3545;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
          <div style="font-size: 1.2rem; margin-bottom: 0.5rem;">Ошибка</div>
          <div>${message}</div>
        </div>
      </td>
    </tr>
  `;
}

// Export functions for external use
export { loadMileageHistory, displayMileageHistory, updateStatistics };
