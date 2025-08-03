import { CONFIG } from './config.js';

class PeriodicalMaintDataService {
    constructor() {
        this.maintenanceSchedule = [];
        this.originalSchedule = [];
        this.listeners = [];
    }

    // Load maintenance schedule from reglament.json
    async loadMaintenanceSchedule() {
        try {
            const response = await fetch('../../doc/reglament.json');
            if (!response.ok) {
                throw new Error('Failed to load maintenance schedule');
            }
            
            this.maintenanceSchedule = await response.json();
            // Convert string values to numbers
            this.maintenanceSchedule = this.maintenanceSchedule.map(item => ({
                ...item,
                mileage: parseInt(item.mileage),
                period: parseInt(item.period)
            }));
            
            // Create backup for revert functionality
            this.originalSchedule = JSON.parse(JSON.stringify(this.maintenanceSchedule));
            
            console.log('PeriodicalMaintDataService: Loaded maintenance schedule:', this.maintenanceSchedule);
            this.notifyListeners();
            return this.maintenanceSchedule;
        } catch (error) {
            console.error('Error loading maintenance schedule:', error);
            // Fallback to default schedule
            this.maintenanceSchedule = this.getDefaultSchedule();
            this.originalSchedule = JSON.parse(JSON.stringify(this.maintenanceSchedule));
            this.notifyListeners();
            return this.maintenanceSchedule;
        }
    }

    getDefaultSchedule() {
        return [
            {
                "operation": "Замена моторного масла и фильтра",
                "mileage": 10000,
                "period": 6,
                "notes": "Обязательно масло 0W-20/5W-30. При тяжёлых условиях - сократить до 8000 км"
            },
            {
                "operation": "Диагностика цепи ГРМ и натяжителя",
                "mileage": 60000,
                "period": 48,
                "notes": "Проверка натяжения цепи, износ направляющих и натяжителя. Обязательно при появлении шумов"
            }
        ];
    }

    // Get current maintenance schedule
    getMaintenanceSchedule() {
        return this.maintenanceSchedule;
    }

    // Add new maintenance item
    addMaintenanceItem(item) {
        this.maintenanceSchedule.push(item);
        this.notifyListeners();
    }

    // Update existing maintenance item
    updateMaintenanceItem(index, item) {
        if (index >= 0 && index < this.maintenanceSchedule.length) {
            this.maintenanceSchedule[index] = item;
            this.notifyListeners();
        }
    }

    // Delete maintenance item
    deleteMaintenanceItem(index) {
        if (index >= 0 && index < this.maintenanceSchedule.length) {
            this.maintenanceSchedule.splice(index, 1);
            this.notifyListeners();
        }
    }

    // Save changes
    async saveMaintenanceSchedule() {
        try {
            // In a real application, this would save to the backend
            // For now, we'll just update the original schedule
            this.originalSchedule = JSON.parse(JSON.stringify(this.maintenanceSchedule));
            
            console.log('PeriodicalMaintDataService: Saved maintenance schedule:', this.maintenanceSchedule);
            return true;
        } catch (error) {
            console.error('Error saving maintenance schedule:', error);
            return false;
        }
    }

    // Revert changes
    revertChanges() {
        this.maintenanceSchedule = JSON.parse(JSON.stringify(this.originalSchedule));
        this.notifyListeners();
    }

    // Check if there are unsaved changes
    hasChanges() {
        return JSON.stringify(this.maintenanceSchedule) !== JSON.stringify(this.originalSchedule);
    }

    // Subscribe to data changes
    subscribe(listener) {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    // Notify all listeners of data changes
    notifyListeners() {
        this.listeners.forEach(listener => {
            try {
                listener(this.maintenanceSchedule);
            } catch (error) {
                console.error('Error in maintenance data listener:', error);
            }
        });
    }

    // Calculate maintenance status for display
    calculateMaintenanceStatus(item, currentMileage) {
        const mileageDiff = currentMileage - item.mileage;
        
        if (mileageDiff >= 0) {
            // Past due
            if (mileageDiff > item.mileage * 0.2) {
                return 'overdue';
            } else {
                return 'due-soon';
            }
        } else {
            // Not due yet
            const remainingMileage = Math.abs(mileageDiff);
            if (remainingMileage <= item.mileage * 0.1) {
                return 'due-soon';
            } else {
                return 'ok';
            }
        }
    }

    // Get status icon
    getStatusIcon(status) {
        const icons = {
            'overdue': '🔴',
            'due-soon': '🟡',
            'ok': '🟢',
            'completed': '✅'
        };
        return icons[status] || '⚪';
    }

    // Get status text
    getStatusText(status) {
        const texts = {
            'overdue': 'Просрочено',
            'due-soon': 'Скоро потребуется',
            'ok': 'В порядке',
            'completed': 'Выполнено'
        };
        return texts[status] || 'Неизвестно';
    }
}

// Create global instance
const periodicalMaintDataService = new PeriodicalMaintDataService();

export { PeriodicalMaintDataService, periodicalMaintDataService }; 