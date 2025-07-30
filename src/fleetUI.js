import { DataService } from './dataService.js';
import { getUserAlerts } from './userAlertUI.js';

export class FleetUI {
  constructor() {
    this.fleetContainer = null;
    this.carsList = null;
  }

  async initialize() {
    this.fleetContainer = document.getElementById('fleet-overview');
    this.carsList = document.getElementById('fleet-cars-list');
    
    if (!this.fleetContainer || !this.carsList) {
      console.error('Fleet overview elements not found');
      return;
    }

    await this.loadFleetOverview();
  }

  async loadFleetOverview() {
    try {
      const cars = await DataService.getCars();
      
      if (cars.length === 0) {
        this.showEmptyFleet();
        return;
      }

      await this.renderFleetCars(cars);
    } catch (error) {
      console.error('Error loading fleet overview:', error);
      this.showError('Ошибка загрузки данных автопарка');
    }
  }

  async renderFleetCars(cars) {
    this.carsList.innerHTML = '';
    
    for (const car of cars) {
      const carRow = await this.createCarRow(car);
      this.carsList.appendChild(carRow);
    }
  }

  async createCarRow(car) {
    const row = document.createElement('div');
    row.className = 'fleet-car-row';
    row.setAttribute('data-car-id', car.id);

    // Get car alerts for problem icons
    const alerts = await getUserAlerts(car.id);
    const problemCounts = this.countProblemsByPriority(alerts);

    row.innerHTML = `
      <div class="fleet-car-image">
        <img src="${this.getCarImage(car)}" 
             alt="${car.name || 'Автомобиль'}" 
             onerror="this.src='/img/car-by-deault.png'"
             class="car-thumbnail">
      </div>
      
      <div class="fleet-car-info">
        <h3 class="car-name">${this.formatCarName(car)}</h3>
        <div class="car-details">
          ${this.formatCarDetails(car)}
        </div>
      </div>
      
      <div class="fleet-problem-icons">
        <div class="problem-icon critical ${problemCounts.critical > 0 ? 'has-problems' : 'no-problems'}" 
             title="${problemCounts.critical > 0 ? `Критичные проблемы: ${problemCounts.critical}` : 'Критичных проблем нет'}">
          <span class="problem-count">${problemCounts.critical}</span>
        </div>
        <div class="problem-icon warning ${problemCounts.warning > 0 ? 'has-problems' : 'no-problems'}" 
             title="${problemCounts.warning > 0 ? `Проблемы требующие внимания: ${problemCounts.warning}` : 'Проблем требующих внимания нет'}">
          <span class="problem-count">${problemCounts.warning}</span>
        </div>
        <div class="problem-icon info ${problemCounts.info > 0 ? 'has-problems' : 'no-problems'}" 
             title="${problemCounts.info > 0 ? `Информационные проблемы: ${problemCounts.info}` : 'Информационных проблем нет'}">
          <span class="problem-count">${problemCounts.info}</span>
        </div>
      </div>
      
      <div class="fleet-maintenance-preview">
        <div class="maintenance-icon" title="Предварительный просмотр ТО">
          <span class="maintenance-emoji">🔧</span>
        </div>
      </div>
    `;

    // Add click handler to navigate to car overview
    row.addEventListener('click', async () => {
      // Set the current car ID in localStorage before navigating
      await DataService.setCurrentCarId(car.id);
      window.location.hash = `#my-car-overview?car=${car.id}`;
    });

    return row;
  }

  formatCarName(car) {
    const parts = [];
    
    // Handle new structure with brand/model
    if (car.brand) parts.push(car.brand);
    if (car.model) parts.push(car.model);
    
    // Handle old structure with just name
    if (!car.brand && !car.model && car.name) {
      return car.name;
    }
    
    // Add nickname if available
    if (car.nickname) parts.push(`"${car.nickname}"`);
    
    return parts.length > 0 ? parts.join(' ') : 'Автомобиль';
  }

  formatCarDetails(car) {
    const details = [];
    
    if (car.licensePlate) {
      details.push(`<span class="license-plate">${car.licensePlate}</span>`);
    }
    
    if (car.vin) {
      details.push(`<span class="vin">VIN: ${car.vin}</span>`);
    }
    
    // Add year if available
    if (car.year) {
      details.push(`<span class="year">${car.year} г.</span>`);
    }
    
    return details.length > 0 ? details.join(' • ') : '';
  }

  getCarImage(car) {
    // Handle different image formats
    if (car.img) {
      // If it's a base64 image
      if (car.img.startsWith('data:image/')) {
        return car.img;
      }
      // If it's a URL or file path
      if (car.img.startsWith('http') || car.img.startsWith('/')) {
        return car.img;
      }
      // If it's an emoji or simple string, use default
      return '/img/car-by-deault.png';
    }
    
    // Default fallback
    return '/img/car-by-deault.png';
  }

  countProblemsByPriority(alerts) {
    const counts = {
      critical: 0,
      warning: 0,
      info: 0
    };

    alerts.forEach(alert => {
      if (!alert.archived && counts.hasOwnProperty(alert.priority)) {
        counts[alert.priority]++;
      }
    });

    return counts;
  }

  showEmptyFleet() {
    this.carsList.innerHTML = `
      <div class="empty-fleet">
        <div class="empty-fleet-icon">🚗</div>
        <h3>У вас пока нет автомобилей</h3>
        <p>Добавьте свой первый автомобиль, чтобы начать отслеживание</p>
        <button class="btn btn-primary" onclick="window.location.hash='#add-car'">
          Добавить автомобиль
        </button>
      </div>
    `;
  }

  showError(message) {
    this.carsList.innerHTML = `
      <div class="fleet-error">
        <div class="error-icon">⚠️</div>
        <h3>Ошибка загрузки</h3>
        <p>${message}</p>
        <button class="btn btn-secondary" onclick="location.reload()">
          Попробовать снова
        </button>
      </div>
    `;
  }
}

// Export singleton instance
export const fleetUI = new FleetUI(); 