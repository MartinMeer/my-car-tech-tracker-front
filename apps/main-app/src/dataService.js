import { CONFIG } from './config.js';
import { CookieHandler } from './cookieHandler.js';

export const DataService = {
  // Helper function to get authenticated headers
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    
    const authToken = CookieHandler.getAuthToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const csrfToken = CookieHandler.getCSRFToken();
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
    
    return headers;
  },

  // Maintenance operations
  async saveMaintenance(data) {
    try {
      if (CONFIG.useBackend) {
        const response = await fetch(`${CONFIG.apiUrl}/maintenance`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          credentials: 'include',
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
        const response = await fetch(`${CONFIG.apiUrl}/maintenance`, {
          headers: this.getAuthHeaders(),
          credentials: 'include'
        });
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
          headers: this.getAuthHeaders(),
          credentials: 'include',
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
        const response = await fetch(`${CONFIG.apiUrl}/repairs`, {
          headers: this.getAuthHeaders(),
          credentials: 'include'
        });
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
        const response = await fetch(`${CONFIG.apiUrl}/cars`, {
          headers: this.getAuthHeaders(),
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Ошибка загрузки автомобилей');
        return response.json();
      } else {
        try {
          return JSON.parse(localStorage.getItem('cars') || '[]');
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

  async getCar(carId) {
    try {
      const cars = await this.getCars();
      return cars.find(car => car.id == carId) || null;
    } catch (error) {
      console.error('Error getting car by ID:', error);
      return null;
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
  },

  // Service Record operations
  async saveServiceRecord(serviceRecord) {
    try {
      if (CONFIG.useBackend) {
        const response = await fetch(`${CONFIG.apiUrl}/service-records`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(serviceRecord)
        });
        if (!response.ok) throw new Error('Ошибка сохранения записи об обслуживании');
        return response.json();
      } else {
        let existing = [];
        try {
          existing = JSON.parse(localStorage.getItem('serviceRecords') || '[]');
        } catch (e) {
          alert('Ошибка чтения localStorage для записей об обслуживании. Данные будут сброшены.');
          localStorage.removeItem('serviceRecords');
        }
        
        existing.push(serviceRecord);
        
        try {
          localStorage.setItem('serviceRecords', JSON.stringify(existing));
        } catch (e) {
          alert('Ошибка записи в localStorage для записей об обслуживании.');
        }
        return { success: true, id: serviceRecord.id };
      }
    } catch (error) {
      throw new Error('Ошибка сохранения записи об обслуживании: ' + error.message);
    }
  },

  async getServiceRecords(carId = null) {
    try {
      if (CONFIG.useBackend) {
        const url = carId 
          ? `${CONFIG.apiUrl}/service-records?carId=${carId}`
          : `${CONFIG.apiUrl}/service-records`;
        const response = await fetch(url, {
          headers: this.getAuthHeaders(),
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Ошибка загрузки записей об обслуживании');
        return response.json();
      } else {
        try {
          const records = JSON.parse(localStorage.getItem('serviceRecords') || '[]');
          if (carId) {
            return records.filter(record => record.carId == carId);
          }
          return records;
        } catch (e) {
          alert('Ошибка чтения localStorage для записей об обслуживании.');
          localStorage.removeItem('serviceRecords');
          return [];
        }
      }
    } catch (error) {
      throw new Error('Ошибка загрузки записей об обслуживании: ' + error.message);
    }
  },

  async updateServiceRecord(serviceRecordId, updates) {
    try {
      if (CONFIG.useBackend) {
        const response = await fetch(`${CONFIG.apiUrl}/service-records/${serviceRecordId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        if (!response.ok) throw new Error('Ошибка обновления записи об обслуживании');
        return response.json();
      } else {
        let existing = [];
        try {
          existing = JSON.parse(localStorage.getItem('serviceRecords') || '[]');
        } catch (e) {
          throw new Error('Ошибка чтения localStorage для записей об обслуживании');
        }
        
        const index = existing.findIndex(record => record.id == serviceRecordId);
        if (index === -1) {
          throw new Error('Запись об обслуживании не найдена');
        }
        
        existing[index] = { ...existing[index], ...updates };
        
        try {
          localStorage.setItem('serviceRecords', JSON.stringify(existing));
        } catch (e) {
          alert('Ошибка записи в localStorage для записей об обслуживании.');
        }
        return { success: true, id: serviceRecordId };
      }
    } catch (error) {
      throw new Error('Ошибка обновления записи об обслуживании: ' + error.message);
    }
  },

  async deleteServiceRecord(serviceRecordId, deleteOperations = false) {
    try {
      if (CONFIG.useBackend) {
        const response = await fetch(`${CONFIG.apiUrl}/service-records/${serviceRecordId}?deleteOperations=${deleteOperations}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Ошибка удаления записи об обслуживании');
        return response.json();
      } else {
        let existing = [];
        try {
          existing = JSON.parse(localStorage.getItem('serviceRecords') || '[]');
        } catch (e) {
          throw new Error('Ошибка чтения localStorage для записей об обслуживании');
        }
        
        const recordToDelete = existing.find(record => record.id == serviceRecordId);
        if (!recordToDelete) {
          throw new Error('Запись об обслуживании не найдена');
        }
        
        // Remove the service record
        existing = existing.filter(record => record.id != serviceRecordId);
        
        try {
          localStorage.setItem('serviceRecords', JSON.stringify(existing));
        } catch (e) {
          alert('Ошибка записи в localStorage для записей об обслуживании.');
        }
        
        // Optionally delete related operations
        if (deleteOperations) {
          await this.deleteOperationsByServiceRecordId(serviceRecordId);
        }
        
        return { success: true, id: serviceRecordId };
      }
    } catch (error) {
      throw new Error('Ошибка удаления записи об обслуживании: ' + error.message);
    }
  },

  async deleteOperationsByServiceRecordId(serviceRecordId) {
    try {
      if (CONFIG.useBackend) {
        // Backend will handle this automatically
        return { success: true };
      } else {
        // Remove maintenance operations
        let maintenance = [];
        try {
          maintenance = JSON.parse(localStorage.getItem('maintenance') || '[]');
        } catch (e) {
          console.warn('Error reading maintenance data');
        }
        maintenance = maintenance.filter(record => record.serviceRecordId != serviceRecordId);
        localStorage.setItem('maintenance', JSON.stringify(maintenance));
        
        // Remove repair operations
        let repairs = [];
        try {
          repairs = JSON.parse(localStorage.getItem('repairs') || '[]');
        } catch (e) {
          console.warn('Error reading repairs data');
        }
        repairs = repairs.filter(record => record.serviceRecordId != serviceRecordId);
        localStorage.setItem('repairs', JSON.stringify(repairs));
        
        return { success: true };
      }
    } catch (error) {
      throw new Error('Ошибка удаления операций: ' + error.message);
    }
  },

  // Reglament operations
  async getCarReglament(carId) {
    try {
      if (CONFIG.useBackend) {
        const response = await fetch(`${CONFIG.apiUrl}/cars/${carId}/reglament`, {
          headers: this.getAuthHeaders(),
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Ошибка загрузки регламента');
        return response.json();
      } else {
        try {
          const reglament = JSON.parse(localStorage.getItem(`reglament_${carId}`) || '[]');
          return reglament;
        } catch (e) {
          console.error('Ошибка чтения localStorage для регламента:', e);
          localStorage.removeItem(`reglament_${carId}`);
          return [];
        }
      }
    } catch (error) {
      throw new Error('Ошибка загрузки регламента: ' + error.message);
    }
  },

  async saveCarReglament(carId, reglamentData) {
    try {
      if (CONFIG.useBackend) {
        const response = await fetch(`${CONFIG.apiUrl}/cars/${carId}/reglament`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(reglamentData)
        });
        if (!response.ok) throw new Error('Ошибка сохранения регламента');
        return response.json();
      } else {
        try {
          localStorage.setItem(`reglament_${carId}`, JSON.stringify(reglamentData));
          return { success: true };
        } catch (e) {
          throw new Error('Ошибка записи в localStorage для регламента');
        }
      }
    } catch (error) {
      throw new Error('Ошибка сохранения регламента: ' + error.message);
    }
  },

  async saveMaintenancePlan(planData) {
    try {
      if (CONFIG.useBackend) {
        const response = await fetch(`${CONFIG.apiUrl}/maintenance-plans`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(planData)
        });
        if (!response.ok) throw new Error('Ошибка сохранения плана ТО');
        return response.json();
      } else {
        // Store in localStorage for demo
        let existing = [];
        try {
          existing = JSON.parse(localStorage.getItem('maintenance_plans') || '[]');
        } catch (e) {
          localStorage.removeItem('maintenance_plans');
        }
        
        const planWithId = {
          ...planData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        };
        
        existing.push(planWithId);
        localStorage.setItem('maintenance_plans', JSON.stringify(existing));
        return { success: true, id: planWithId.id };
      }
    } catch (error) {
      throw new Error('Ошибка сохранения плана ТО: ' + error.message);
    }
  },

  async getMaintenancePlans(carId = null) {
    try {
      if (CONFIG.useBackend) {
        const url = carId 
          ? `${CONFIG.apiUrl}/maintenance-plans?carId=${carId}`
          : `${CONFIG.apiUrl}/maintenance-plans`;
        const response = await fetch(url, {
          headers: this.getAuthHeaders(),
          credentials: 'include'
        });
        if (!response.ok) throw new Error('Ошибка загрузки планов ТО');
        return response.json();
      } else {
        try {
          const plans = JSON.parse(localStorage.getItem('maintenance_plans') || '[]');
          if (carId) {
            return plans.filter(plan => plan.carId === carId);
          }
          return plans;
        } catch (e) {
          localStorage.removeItem('maintenance_plans');
          return [];
        }
      }
    } catch (error) {
      throw new Error('Ошибка загрузки планов ТО: ' + error.message);
    }
  }
}; 