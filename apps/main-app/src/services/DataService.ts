// apps/main-app/src/services/DataService.ts
import { APP_CONFIG } from '../config/app.config';
import { ConfigService } from './ConfigService';
import { IdGenerator } from './IdGenerator';

// Data Models
export interface Car {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  vin?: string;
  plateNumber?: string;
  mileage: number;
  image?: string;
  lastService?: string;
  nextService?: string;
  createdAt: string;
}

export interface Alert {
  id: string;
  carId: string;
  carName: string;
  type: 'problem' | 'recommendation';
  priority: 'critical' | 'unclear' | 'can-wait';
  description: string;
  location: string;
  mileage: number;
  reportedAt: string;
  status: 'active' | 'archived';
}

export interface ServiceRecord {
  id: string;
  carId: string;
  carName: string;
  date: string;
  mileage: number;
  serviceProvider: string;
  totalCost: number;
  operations: ServiceOperation[];
  notes?: string;
  createdAt: string;
}

export interface ServiceOperation {
  id: string;
  type: 'maintenance' | 'repair';
  description: string;
  cost: number;
  parts?: string[];
}

export interface MaintenanceEntry {
  id: string;
  carId: string;
  carName: string;
  enteredAt: string;
  reason: string;
  estimatedCompletion?: string;
}

export interface MaintenancePlan {
  id: string;
  carId: string;
  carName: string;
  status: 'draft' | 'scheduled' | 'in-progress' | 'completed';
  plannedDate: string;
  plannedCompletionDate: string;
  plannedMileage?: string;
  periodicOperations: any[];
  repairOperations: any[];
  totalEstimatedCost: number;
  serviceProvider?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Unified data service that handles both localStorage (development) and backend API (production)
 * This service abstracts data access and provides a single interface for all data operations
 */
export class DataService {
  private static config = APP_CONFIG.getCurrentConfig();

  // Initialize ID generator when service is first used
  private static initialized = false;
  private static ensureInitialized(): void {
    if (!this.initialized) {
      IdGenerator.initialize();
      this.initialized = true;
    }
  }

  // Use ConfigService to determine backend usage
  private static get useBackend(): boolean {
    return ConfigService.shouldUseBackend();
  }

  // Helper method to get auth headers for API calls
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    };
  }

  // Helper method for API calls with error handling
  private static async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(`${this.config.API_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers
        }
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Helper method for localStorage operations with error handling
  private static getFromStorage<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  }

  private static setToStorage<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      throw error;
    }
  }

  // ===== CAR OPERATIONS =====
  
  static async getCars(): Promise<Car[]> {
    if (this.useBackend) {
      return await this.apiCall<Car[]>('/cars');
    } else {
      // Return mock data for development
      const stored = this.getFromStorage<Car[]>('cars', []);
      /*if (stored.length === 0) {
        // Return default mock cars
        return [
          {
            id: '1',
            name: 'Транспорт #1',
            brand: 'Toyota',
            model: 'Camry',
            year: 2020,
            mileage: 85000,
            lastService: '2024-07-15',
            nextService: '2024-09-15',
            image: 'https://pub-cdn.sider.ai/u/U0GVH7028Y5/web-coder/689049900cd2d7c5a2675d8b/resource/2c6f2845-9f8d-4c49-b85a-014eadfa4238.jpg',
            createdAt: new Date().toISOString()
          },
          {
            id: '2',
            name: 'Грузовик #2',
            brand: 'Mercedes',
            model: 'Sprinter',
            year: 2019,
            mileage: 120000,
            lastService: '2024-06-20',
            nextService: '2024-08-20',
            image: 'https://pub-cdn.sider.ai/u/U0GVH7028Y5/web-coder/689049900cd2d7c5a2675d8b/resource/fa1dad86-c2d8-43aa-aee5-1a3e010f4480.jpg',
            createdAt: new Date().toISOString()
          }
        ];
      }*/
      return stored;
    }
  }

  static async getCarById(id: string): Promise<Car | null> {
    if (this.useBackend) {
      try {
        return await this.apiCall<Car>(`/cars/${id}`);
      } catch (error) {
        if (error.message.includes('404')) {
          return null;
        }
        throw error;
      }
    } else {
      const cars = await this.getCars();
      return cars.find(car => car.id === id) || null;
    }
  }

  static async saveCar(carData: Omit<Car, 'id' | 'createdAt'>): Promise<Car> {
    if (this.useBackend) {
      return await this.apiCall<Car>('/cars', {
        method: 'POST',
        body: JSON.stringify(carData)
      });
    } else {
      this.ensureInitialized();
      
      const newCar: Car = {
        ...carData,
        id: IdGenerator.generateCarId(),
        createdAt: new Date().toISOString()
      };
      
      const existing = await this.getCars();
      const updated = [...existing, newCar];
      this.setToStorage('cars', updated);
      
      return newCar;
    }
  }

  static async updateCar(id: string, carData: Partial<Car>): Promise<Car> {
    if (this.useBackend) {
      return await this.apiCall<Car>(`/cars/${id}`, {
        method: 'PUT',
        body: JSON.stringify(carData)
      });
    } else {
      const cars = await this.getCars();
      const index = cars.findIndex(car => car.id === id);
      if (index === -1) {
        throw new Error('Car not found');
      }
      
      cars[index] = { ...cars[index], ...carData };
      this.setToStorage('cars', cars);
      
      return cars[index];
    }
  }

  // ===== ALERT OPERATIONS =====
  
  static async getAlerts(): Promise<Alert[]> {
    if (this.useBackend) {
      return await this.apiCall<Alert[]>('/alerts');
    } else {
      return this.getFromStorage<Alert[]>('fleet-alerts', []);
    }
  }

  static async getAlertsByCarId(carId: string): Promise<Alert[]> {
    const alerts = await this.getAlerts();
    return alerts.filter(alert => alert.carId === carId);
  }

  static async saveAlert(alertData: Omit<Alert, 'id' | 'reportedAt'>): Promise<Alert> {
    if (this.useBackend) {
      return await this.apiCall<Alert>('/alerts', {
        method: 'POST',
        body: JSON.stringify(alertData)
      });
    } else {
      this.ensureInitialized();
      
      const newAlert: Alert = {
        ...alertData,
        id: IdGenerator.generateAlertId(),
        reportedAt: new Date().toISOString()
      };
      
      const existing = await this.getAlerts();
      const updated = [...existing, newAlert];
      this.setToStorage('fleet-alerts', updated);
      
      return newAlert;
    }
  }

  static async updateAlert(id: string, alertData: Partial<Alert>): Promise<Alert> {
    if (this.useBackend) {
      return await this.apiCall<Alert>(`/alerts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(alertData)
      });
    } else {
      const alerts = await this.getAlerts();
      const index = alerts.findIndex(alert => alert.id === id);
      if (index === -1) {
        throw new Error('Alert not found');
      }
      
      alerts[index] = { ...alerts[index], ...alertData };
      this.setToStorage('fleet-alerts', alerts);
      
      return alerts[index];
    }
  }

  // ===== SERVICE RECORD OPERATIONS =====
  
  static async getServiceRecords(): Promise<ServiceRecord[]> {
    if (this.useBackend) {
      return await this.apiCall<ServiceRecord[]>('/service-records');
    } else {
      return this.getFromStorage<ServiceRecord[]>('service-records', []);
    }
  }

  static async getServiceRecordsByCarId(carId: string): Promise<ServiceRecord[]> {
    const records = await this.getServiceRecords();
    return records.filter(record => record.carId === carId);
  }

  static async saveServiceRecord(recordData: Omit<ServiceRecord, 'id' | 'createdAt'>): Promise<ServiceRecord> {
    if (this.useBackend) {
      return await this.apiCall<ServiceRecord>('/service-records', {
        method: 'POST',
        body: JSON.stringify(recordData)
      });
    } else {
      this.ensureInitialized();
      
      const newRecord: ServiceRecord = {
        ...recordData,
        id: IdGenerator.generateServiceRecordId(),
        createdAt: new Date().toISOString()
      };
      
      const existing = await this.getServiceRecords();
      const updated = [...existing, newRecord];
      this.setToStorage('service-records', updated);
      
      return newRecord;
    }
  }

  // ===== MAINTENANCE OPERATIONS =====
  
  static async getMaintenanceEntries(): Promise<MaintenanceEntry[]> {
    if (this.useBackend) {
      return await this.apiCall<MaintenanceEntry[]>('/maintenance');
    } else {
      return this.getFromStorage<MaintenanceEntry[]>('in-maintenance', []);
    }
  }

  static async saveMaintenanceEntry(entryData: Omit<MaintenanceEntry, 'id' | 'enteredAt'>): Promise<MaintenanceEntry> {
    if (this.useBackend) {
      return await this.apiCall<MaintenanceEntry>('/maintenance', {
        method: 'POST',
        body: JSON.stringify(entryData)
      });
    } else {
      this.ensureInitialized();
      
      const newEntry: MaintenanceEntry = {
        ...entryData,
        id: IdGenerator.generateMaintenanceEntryId(),
        enteredAt: new Date().toISOString()
      };
      
      const existing = await this.getMaintenanceEntries();
      const updated = [...existing, newEntry];
      this.setToStorage('in-maintenance', updated);
      
      return newEntry;
    }
  }

  static async removeMaintenanceEntry(carId: string): Promise<void> {
    if (this.useBackend) {
      await this.apiCall(`/maintenance/car/${carId}`, {
        method: 'DELETE'
      });
    } else {
      const entries = await this.getMaintenanceEntries();
      const updated = entries.filter(entry => entry.carId !== carId);
      this.setToStorage('in-maintenance', updated);
    }
  }

  // ===== MAINTENANCE PLAN OPERATIONS =====
  
  static async getMaintenancePlans(): Promise<MaintenancePlan[]> {
    if (this.useBackend) {
      return await this.apiCall<MaintenancePlan[]>('/maintenance-plans');
    } else {
      return this.getFromStorage<MaintenancePlan[]>('maintenance-plans', []);
    }
  }

  static async saveMaintenancePlan(planData: Omit<MaintenancePlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenancePlan> {
    if (this.useBackend) {
      return await this.apiCall<MaintenancePlan>('/maintenance-plans', {
        method: 'POST',
        body: JSON.stringify(planData)
      });
    } else {
      this.ensureInitialized();
      
      const newPlan: MaintenancePlan = {
        ...planData,
        id: IdGenerator.generateMaintenancePlanId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const existing = await this.getMaintenancePlans();
      const updated = [...existing, newPlan];
      this.setToStorage('maintenance-plans', updated);
      
      return newPlan;
    }
  }

  static async updateMaintenancePlan(id: string, planData: Partial<MaintenancePlan>): Promise<MaintenancePlan> {
    if (this.useBackend) {
      return await this.apiCall<MaintenancePlan>(`/maintenance-plans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(planData)
      });
    } else {
      const plans = await this.getMaintenancePlans();
      const index = plans.findIndex(plan => plan.id === id);
      if (index === -1) {
        throw new Error('Maintenance plan not found');
      }
      
      plans[index] = { 
        ...plans[index], 
        ...planData, 
        updatedAt: new Date().toISOString() 
      };
      this.setToStorage('maintenance-plans', plans);
      
      return plans[index];
    }
  }

  // ===== UTILITY METHODS =====
  
  /**
   * Clear all local data (useful for logout or reset)
   */
  static clearLocalData(): void {
    const keys = [
      'cars',
      'fleet-alerts', 
      'service-records',
      'in-maintenance',
      'maintenance-plans',
      'id_counter'
    ];
    
    keys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error clearing localStorage key "${key}":`, error);
      }
    });

    // Also clear session storage
    try {
      sessionStorage.removeItem('demo_session_id');
    } catch (error) {
      console.error('Error clearing session storage:', error);
    }

    // Reset ID generator
    IdGenerator.resetCounter();
  }

  /**
   * Get current environment configuration
   */
  static getConfig() {
    return this.config;
  }

  /**
   * Check if using backend or localStorage
   */
  static isUsingBackend(): boolean {
    return this.useBackend;
  }
}