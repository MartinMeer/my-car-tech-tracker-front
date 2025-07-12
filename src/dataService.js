import { CONFIG } from './config.js';

export const DataService = {
  // Maintenance operations
  async saveMaintenance(data) {
    try {
      if (CONFIG.useBackend) {
        const response = await fetch(`${CONFIG.apiUrl}/maintenance`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Ошибка сохранения ТО');
        return response.json();
      } else {
        let existing = [];
        try {
          existing = JSON.parse(localStorage.getItem('maintenance') || '[]');
        } catch (e) {
          alert('Ошибка чтения localStorage для ТО. Данные будут сброшены.');
          localStorage.removeItem('maintenance');
        }
        
        // Handle both single record and array of records
        const recordsToAdd = Array.isArray(data) ? data : [data];
        existing.push(...recordsToAdd);
        
        try {
          localStorage.setItem('maintenance', JSON.stringify(existing));
        } catch (e) {
          alert('Ошибка записи в localStorage для ТО.');
        }
        return { success: true, id: Array.isArray(data) ? data.map(r => r.id) : data.id };
      }
    } catch (error) {
      throw new Error('Ошибка сохранения ТО: ' + error.message);
    }
  },

  async getMaintenance() {
    try {
      if (CONFIG.useBackend) {
        const response = await fetch(`${CONFIG.apiUrl}/maintenance`);
        if (!response.ok) throw new Error('Ошибка загрузки ТО');
        return response.json();
      } else {
        try {
          return JSON.parse(localStorage.getItem('maintenance') || '[]');
        } catch (e) {
          alert('Ошибка чтения localStorage для ТО.');
          localStorage.removeItem('maintenance');
          return [];
        }
      }
    } catch (error) {
      throw new Error('Ошибка загрузки ТО: ' + error.message);
    }
  },

  // Repair operations
  async saveRepair(data) {
    try {
      if (CONFIG.useBackend) {
        const response = await fetch(`${CONFIG.apiUrl}/repairs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Ошибка сохранения ремонта');
        return response.json();
      } else {
        let existing = [];
        try {
          existing = JSON.parse(localStorage.getItem('repairs') || '[]');
        } catch (e) {
          alert('Ошибка чтения localStorage для ремонтов. Данные будут сброшены.');
          localStorage.removeItem('repairs');
        }
        
        // Handle both single record and array of records
        const recordsToAdd = Array.isArray(data) ? data : [data];
        existing.push(...recordsToAdd);
        
        try {
          localStorage.setItem('repairs', JSON.stringify(existing));
        } catch (e) {
          alert('Ошибка записи в localStorage для ремонтов.');
        }
        return { success: true, id: Array.isArray(data) ? data.map(r => r.id) : data.id };
      }
    } catch (error) {
      throw new Error('Ошибка сохранения ремонта: ' + error.message);
    }
  },

  // Alias for saveRepair to maintain compatibility
  async saveRepairs(data) {
    return this.saveRepair(data);
  },

  async getRepairs() {
    try {
      if (CONFIG.useBackend) {
        const response = await fetch(`${CONFIG.apiUrl}/repairs`);
        if (!response.ok) throw new Error('Ошибка загрузки ремонтов');
        return response.json();
      } else {
        try {
          return JSON.parse(localStorage.getItem('repairs') || '[]');
        } catch (e) {
          alert('Ошибка чтения localStorage для ремонтов.');
          localStorage.removeItem('repairs');
          return [];
        }
      }
    } catch (error) {
      throw new Error('Ошибка загрузки ремонтов: ' + error.message);
    }
  },

  // Car operations
  async getCars() {
    try {
      if (CONFIG.useBackend) {
        const response = await fetch(`${CONFIG.apiUrl}/cars`);
        if (!response.ok) throw new Error('Ошибка загрузки автомобилей');
        return response.json();
      } else {
        try {
          const stored = localStorage.getItem('cars');
          if (stored) return JSON.parse(stored);
          return [
            { id: 1, name: 'Toyota Camry', img: '🚗' },
            { id: 2, name: 'Lada Vesta', img: '🚙' },
            { id: 3, name: 'BMW X5', img: '🚘' }
          ];
        } catch (e) {
          alert('Ошибка чтения localStorage для автомобилей.');
          localStorage.removeItem('cars');
          return [];
        }
      }
    } catch (error) {
      throw new Error('Ошибка загрузки автомобилей: ' + error.message);
    }
  },

  // Add currentCarId management
  async getCurrentCarId() {
    try {
      if (CONFIG.useBackend) {
        // TODO: Implement backend call for currentCarId if needed
        return null;
      } else {
        return localStorage.getItem('currentCarId');
      }
    } catch (error) {
      alert('Ошибка чтения currentCarId.');
      return null;
    }
  },

  async setCurrentCarId(carId) {
    try {
      if (CONFIG.useBackend) {
        // TODO: Implement backend call for currentCarId if needed
      } else {
        localStorage.setItem('currentCarId', carId);
      }
    } catch (error) {
      alert('Ошибка записи currentCarId.');
    }
  },

  // Add saveCars for updating the cars array
  async saveCars(cars) {
    try {
      if (CONFIG.useBackend) {
        // TODO: Implement backend call to save cars if needed
      } else {
        localStorage.setItem('cars', JSON.stringify(cars));
      }
    } catch (error) {
      alert('Ошибка записи автомобилей.');
    }
  }
}; 