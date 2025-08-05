// apps/main-app/src/services/CarStatusService.ts
import { DataService, Alert, MaintenanceEntry } from './DataService';

export type CarStatus = 'active' | 'maintenance' | 'problem' | 'scheduled' | 'inactive';

export interface CarStatusInfo {
  status: CarStatus;
  statusText: string;
  statusColor: string;
  alertCount: number;
  criticalAlertCount: number;
  isInMaintenance: boolean;
}

/**
 * Service for calculating and managing car status based on business rules
 * This centralizes all car status-related business logic
 */
export class CarStatusService {
  
  /**
   * Calculate comprehensive car status information
   */
  static async getCarStatusInfo(carId: string): Promise<CarStatusInfo> {
    try {
      // Fetch relevant data
      const [alerts, maintenanceEntries] = await Promise.all([
        DataService.getAlertsByCarId(carId),
        DataService.getMaintenanceEntries()
      ]);

      const activeAlerts = alerts.filter(alert => alert.status === 'active');
      const criticalAlerts = activeAlerts.filter(alert => alert.priority === 'critical');
      const isInMaintenance = maintenanceEntries.some(entry => entry.carId === carId);

      // Apply business rules to determine status
      const status = this.calculateStatus(isInMaintenance, activeAlerts, criticalAlerts);

      return {
        status,
        statusText: this.getStatusText(status),
        statusColor: this.getStatusColor(status),
        alertCount: activeAlerts.length,
        criticalAlertCount: criticalAlerts.length,
        isInMaintenance
      };
    } catch (error) {
      console.error('Error calculating car status:', error);
      // Return safe default status
      return {
        status: 'inactive',
        statusText: 'Неизвестно',
        statusColor: 'bg-gray-100 text-gray-800',
        alertCount: 0,
        criticalAlertCount: 0,
        isInMaintenance: false
      };
    }
  }

  /**
   * Calculate car status based on business rules
   */
  private static calculateStatus(
    isInMaintenance: boolean, 
    activeAlerts: Alert[], 
    criticalAlerts: Alert[]
  ): CarStatus {
    // Priority 1: Car is in maintenance
    if (isInMaintenance) {
      return 'maintenance';
    }

    // Priority 2: Car has critical alerts
    if (criticalAlerts.length > 0) {
      return 'problem';
    }

    // Priority 3: Car has non-critical alerts but is operational
    if (activeAlerts.length > 0) {
      return 'scheduled'; // Needs attention but can still operate
    }

    // Default: Car is ready for operation
    return 'active';
  }

  /**
   * Get human-readable status text
   */
  static getStatusText(status: CarStatus): string {
    switch (status) {
      case 'active': return 'Готов к работе';
      case 'maintenance': return 'На обслуживании';
      case 'problem': return 'Требует внимания';
      case 'scheduled': return 'Запланировано ТО';
      case 'inactive': return 'Неактивен';
      default: return 'Неизвестно';
    }
  }

  /**
   * Get CSS classes for status styling
   */
  static getStatusColor(status: CarStatus): string {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'problem': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get status information for multiple cars efficiently
   */
  static async getMultipleCarStatusInfo(carIds: string[]): Promise<Map<string, CarStatusInfo>> {
    try {
      // Fetch all data once
      const [alerts, maintenanceEntries] = await Promise.all([
        DataService.getAlerts(),
        DataService.getMaintenanceEntries()
      ]);

      const statusMap = new Map<string, CarStatusInfo>();

      // Calculate status for each car
      for (const carId of carIds) {
        const carAlerts = alerts.filter(alert => alert.carId === carId && alert.status === 'active');
        const criticalAlerts = carAlerts.filter(alert => alert.priority === 'critical');
        const isInMaintenance = maintenanceEntries.some(entry => entry.carId === carId);

        const status = this.calculateStatus(isInMaintenance, carAlerts, criticalAlerts);

        statusMap.set(carId, {
          status,
          statusText: this.getStatusText(status),
          statusColor: this.getStatusColor(status),
          alertCount: carAlerts.length,
          criticalAlertCount: criticalAlerts.length,
          isInMaintenance
        });
      }

      return statusMap;
    } catch (error) {
      console.error('Error calculating multiple car statuses:', error);
      return new Map();
    }
  }

  /**
   * Get fleet overview statistics
   */
  static async getFleetStats(): Promise<{
    totalCars: number;
    activeCars: number;
    carsInMaintenance: number;
    carsWithProblems: number;
    totalActiveAlerts: number;
    totalCriticalAlerts: number;
  }> {
    try {
      const [cars, alerts, maintenanceEntries] = await Promise.all([
        DataService.getCars(),
        DataService.getAlerts(),
        DataService.getMaintenanceEntries()
      ]);

      const activeAlerts = alerts.filter(alert => alert.status === 'active');
      const criticalAlerts = activeAlerts.filter(alert => alert.priority === 'critical');
      
      const carIds = cars.map(car => car.id);
      const statusMap = await this.getMultipleCarStatusInfo(carIds);

      let activeCars = 0;
      let carsInMaintenance = 0;
      let carsWithProblems = 0;

      statusMap.forEach(statusInfo => {
        switch (statusInfo.status) {
          case 'active':
            activeCars++;
            break;
          case 'maintenance':
            carsInMaintenance++;
            break;
          case 'problem':
            carsWithProblems++;
            break;
        }
      });

      return {
        totalCars: cars.length,
        activeCars,
        carsInMaintenance,
        carsWithProblems,
        totalActiveAlerts: activeAlerts.length,
        totalCriticalAlerts: criticalAlerts.length
      };
    } catch (error) {
      console.error('Error calculating fleet stats:', error);
      return {
        totalCars: 0,
        activeCars: 0,
        carsInMaintenance: 0,
        carsWithProblems: 0,
        totalActiveAlerts: 0,
        totalCriticalAlerts: 0
      };
    }
  }
}