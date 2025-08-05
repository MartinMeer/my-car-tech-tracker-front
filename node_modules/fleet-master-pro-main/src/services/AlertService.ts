// apps/main-app/src/services/AlertService.ts
import { DataService, Alert } from './DataService';

export type AlertPriority = 'critical' | 'unclear' | 'can-wait';
export type AlertType = 'problem' | 'recommendation';
export type AlertStatus = 'active' | 'archived';

export interface AlertFormData {
  carId: string;
  carName: string;
  type: AlertType;
  priority: AlertPriority;
  description: string;
  location: string;
  mileage: number;
}

/**
 * Service for managing alerts with business logic
 * Handles alert creation, updates, and business rules
 */
export class AlertService {

  /**
   * Create a new alert with validation
   */
  static async createAlert(formData: AlertFormData): Promise<Alert> {
    // Validate required fields
    this.validateAlertData(formData);

    // Create alert
    const alertData = {
      ...formData,
      status: 'active' as AlertStatus
    };

    return await DataService.saveAlert(alertData);
  }

  /**
   * Archive an alert
   */
  static async archiveAlert(alertId: string): Promise<Alert> {
    return await DataService.updateAlert(alertId, { status: 'archived' });
  }

  /**
   * Restore an archived alert
   */
  static async restoreAlert(alertId: string): Promise<Alert> {
    return await DataService.updateAlert(alertId, { status: 'active' });
  }

  /**
   * Update alert details
   */
  static async updateAlert(alertId: string, updates: Partial<AlertFormData>): Promise<Alert> {
    if (updates.description || updates.location || updates.mileage) {
      // Validate if updating core fields
      const currentAlert = await this.getAlertById(alertId);
      if (!currentAlert) {
        throw new Error('Alert not found');
      }

      const updatedData = { ...currentAlert, ...updates };
      this.validateAlertData(updatedData);
    }

    return await DataService.updateAlert(alertId, updates);
  }

  /**
   * Get alert by ID
   */
  static async getAlertById(alertId: string): Promise<Alert | null> {
    const alerts = await DataService.getAlerts();
    return alerts.find(alert => alert.id === alertId) || null;
  }

  /**
   * Get alerts with filtering options
   */
  static async getAlerts(filters?: {
    carId?: string;
    status?: AlertStatus;
    priority?: AlertPriority;
    type?: AlertType;
  }): Promise<Alert[]> {
    let alerts = await DataService.getAlerts();

    if (filters) {
      if (filters.carId) {
        alerts = alerts.filter(alert => alert.carId === filters.carId);
      }
      if (filters.status) {
        alerts = alerts.filter(alert => alert.status === filters.status);
      }
      if (filters.priority) {
        alerts = alerts.filter(alert => alert.priority === filters.priority);
      }
      if (filters.type) {
        alerts = alerts.filter(alert => alert.type === filters.type);
      }
    }

    // Sort by priority and date
    return alerts.sort((a, b) => {
      // First sort by priority
      const priorityOrder = { 'critical': 0, 'unclear': 1, 'can-wait': 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;

      // Then by date (newest first)
      return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
    });
  }

  /**
   * Get priority-specific styling
   */
  static getPriorityColor(priority: AlertPriority): string {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'unclear': return 'bg-yellow-100 text-yellow-800';
      case 'can-wait': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Get human-readable priority text
   */
  static getPriorityText(priority: AlertPriority): string {
    switch (priority) {
      case 'critical': return 'Критично';
      case 'unclear': return 'Непонятно';
      case 'can-wait': return 'Можно подождать';
      default: return priority;
    }
  }

  /**
   * Get priority icon
   */
  static getPriorityIcon(priority: AlertPriority): string {
    switch (priority) {
      case 'critical': return '🔴';
      case 'unclear': return '🟡';
      case 'can-wait': return '🔵';
      default: return '⚪';
    }
  }

  /**
   * Get alert statistics
   */
  static async getAlertStats(): Promise<{
    total: number;
    active: number;
    archived: number;
    critical: number;
    unclear: number;
    canWait: number;
    problems: number;
    recommendations: number;
  }> {
    try {
      const alerts = await DataService.getAlerts();

      return {
        total: alerts.length,
        active: alerts.filter(a => a.status === 'active').length,
        archived: alerts.filter(a => a.status === 'archived').length,
        critical: alerts.filter(a => a.priority === 'critical').length,
        unclear: alerts.filter(a => a.priority === 'unclear').length,
        canWait: alerts.filter(a => a.priority === 'can-wait').length,
        problems: alerts.filter(a => a.type === 'problem').length,
        recommendations: alerts.filter(a => a.type === 'recommendation').length
      };
    } catch (error) {
      console.error('Error calculating alert stats:', error);
      return {
        total: 0,
        active: 0,
        archived: 0,
        critical: 0,
        unclear: 0,
        canWait: 0,
        problems: 0,
        recommendations: 0
      };
    }
  }

  /**
   * Auto-create recommendation alerts based on service records
   */
  static async createRecommendationAlert(
    carId: string,
    carName: string,
    description: string,
    mileage: number
  ): Promise<Alert> {
    const alertData: AlertFormData = {
      carId,
      carName,
      type: 'recommendation',
      priority: 'can-wait',
      description,
      location: 'Система рекомендаций',
      mileage
    };

    return await this.createAlert(alertData);
  }

  /**
   * Validate alert data
   */
  private static validateAlertData(data: AlertFormData): void {
    if (!data.carId?.trim()) {
      throw new Error('Выберите автомобиль');
    }
    if (!data.description?.trim()) {
      throw new Error('Опишите проблему');
    }
    if (!data.location?.trim()) {
      throw new Error('Укажите место обнаружения');
    }
    if (!data.mileage || data.mileage <= 0) {
      throw new Error('Укажите корректный пробег');
    }
    if (!['problem', 'recommendation'].includes(data.type)) {
      throw new Error('Неверный тип сообщения');
    }
    if (!['critical', 'unclear', 'can-wait'].includes(data.priority)) {
      throw new Error('Неверный приоритет');
    }
  }
}