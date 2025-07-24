import { CONFIG } from './config.js';
import { CookieHandler } from './cookieHandler.js';

export const DataService = {
  // Authentication helpers
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

  // Error handling helper
  async handleResponse(response, errorMessage) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorMessage || `HTTP ${response.status}`);
    }
    return response.json();
  },

  // Car operations
  async getCars() {
    const response = await fetch(`${CONFIG.apiUrl}/cars`, {
      headers: this.getAuthHeaders(),
      credentials: 'include'
    });
    return this.handleResponse(response, 'Ошибка загрузки автомобилей');
  },

  async saveCar(carData) {
    const response = await fetch(`${CONFIG.apiUrl}/cars`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(carData)
    });
    return this.handleResponse(response, 'Ошибка сохранения автомобиля');
  },

  async updateCar(carId, carData) {
    const response = await fetch(`${CONFIG.apiUrl}/cars/${carId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(carData)
    });
    return this.handleResponse(response, 'Ошибка обновления автомобиля');
  },

  async deleteCar(carId) {
    const response = await fetch(`${CONFIG.apiUrl}/cars/${carId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      credentials: 'include'
    });
    return this.handleResponse(response, 'Ошибка удаления автомобиля');
  },

  async getCurrentCarId() {
    const response = await fetch(`${CONFIG.apiUrl}/cars/current`, {
      headers: this.getAuthHeaders(),
      credentials: 'include'
    });
    return this.handleResponse(response, 'Ошибка получения текущего автомобиля');
  },

  async setCurrentCarId(carId) {
    const response = await fetch(`${CONFIG.apiUrl}/cars/current`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ carId })
    });
    return this.handleResponse(response, 'Ошибка установки текущего автомобиля');
  },

  // Maintenance operations
  async getMaintenance(carId = null) {
    const url = carId ? `${CONFIG.apiUrl}/maintenance/car/${carId}` : `${CONFIG.apiUrl}/maintenance`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
      credentials: 'include'
    });
    return this.handleResponse(response, 'Ошибка загрузки ТО');
  },

  async saveMaintenance(maintenanceData) {
    const response = await fetch(`${CONFIG.apiUrl}/maintenance`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(maintenanceData)
    });
    return this.handleResponse(response, 'Ошибка сохранения ТО');
  },

  async updateMaintenance(maintenanceId, maintenanceData) {
    const response = await fetch(`${CONFIG.apiUrl}/maintenance/${maintenanceId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(maintenanceData)
    });
    return this.handleResponse(response, 'Ошибка обновления ТО');
  },

  async deleteMaintenance(maintenanceId) {
    const response = await fetch(`${CONFIG.apiUrl}/maintenance/${maintenanceId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      credentials: 'include'
    });
    return this.handleResponse(response, 'Ошибка удаления ТО');
  },

  async calculateMaintenanceCost(calculationData) {
    const response = await fetch(`${CONFIG.apiUrl}/maintenance/calculate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(calculationData)
    });
    return this.handleResponse(response, 'Ошибка расчета стоимости ТО');
  },

  // Repair operations
  async getRepairs(carId = null) {
    const url = carId ? `${CONFIG.apiUrl}/repairs/car/${carId}` : `${CONFIG.apiUrl}/repairs`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
      credentials: 'include'
    });
    return this.handleResponse(response, 'Ошибка загрузки ремонтов');
  },

  async saveRepair(repairData) {
    const response = await fetch(`${CONFIG.apiUrl}/repairs`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(repairData)
    });
    return this.handleResponse(response, 'Ошибка сохранения ремонта');
  },

  async updateRepair(repairId, repairData) {
    const response = await fetch(`${CONFIG.apiUrl}/repairs/${repairId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(repairData)
    });
    return this.handleResponse(response, 'Ошибка обновления ремонта');
  },

  async deleteRepair(repairId) {
    const response = await fetch(`${CONFIG.apiUrl}/repairs/${repairId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      credentials: 'include'
    });
    return this.handleResponse(response, 'Ошибка удаления ремонта');
  },

  // Service records
  async getServiceRecords(carId = null) {
    const url = carId ? `${CONFIG.apiUrl}/service-records/car/${carId}` : `${CONFIG.apiUrl}/service-records`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
      credentials: 'include'
    });
    return this.handleResponse(response, 'Ошибка загрузки записей об обслуживании');
  },

  async saveServiceRecord(serviceRecordData) {
    const response = await fetch(`${CONFIG.apiUrl}/service-records`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(serviceRecordData)
    });
    return this.handleResponse(response, 'Ошибка сохранения записи об обслуживании');
  },

  async updateServiceRecord(serviceRecordId, updates) {
    const response = await fetch(`${CONFIG.apiUrl}/service-records/${serviceRecordId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(updates)
    });
    return this.handleResponse(response, 'Ошибка обновления записи об обслуживании');
  },

  async deleteServiceRecord(serviceRecordId) {
    const response = await fetch(`${CONFIG.apiUrl}/service-records/${serviceRecordId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      credentials: 'include'
    });
    return this.handleResponse(response, 'Ошибка удаления записи об обслуживании');
  },

  // Alerts
  async getAlerts(carId = null) {
    const url = carId ? `${CONFIG.apiUrl}/alerts/car/${carId}` : `${CONFIG.apiUrl}/alerts`;
    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
      credentials: 'include'
    });
    return this.handleResponse(response, 'Ошибка загрузки уведомлений');
  },

  async saveAlert(alertData) {
    const response = await fetch(`${CONFIG.apiUrl}/alerts`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(alertData)
    });
    return this.handleResponse(response, 'Ошибка сохранения уведомления');
  },

  async updateAlert(alertId, alertData) {
    const response = await fetch(`${CONFIG.apiUrl}/alerts/${alertId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(alertData)
    });
    return this.handleResponse(response, 'Ошибка обновления уведомления');
  },

  async deleteAlert(alertId) {
    const response = await fetch(`${CONFIG.apiUrl}/alerts/${alertId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      credentials: 'include'
    });
    return this.handleResponse(response, 'Ошибка удаления уведомления');
  },

  // Mileage tracking
  async saveMileage(mileageData) {
    const response = await fetch(`${CONFIG.apiUrl}/mileage`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(mileageData)
    });
    return this.handleResponse(response, 'Ошибка сохранения пробега');
  },

  async getMileageHistory(carId) {
    const response = await fetch(`${CONFIG.apiUrl}/mileage/car/${carId}`, {
      headers: this.getAuthHeaders(),
      credentials: 'include'
    });
    return this.handleResponse(response, 'Ошибка загрузки истории пробега');
  }
}; 