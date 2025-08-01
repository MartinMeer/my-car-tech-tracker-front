import { DataService } from './dataService.js';
import { getUserAlerts, showUserAlertPopup, showUserAlertPopupWithCar } from './userAlertUI.js';
import { showConfirmationDialog } from './dialogs.js';
import { CONFIG } from './config.js';

class CarOverviewMonitor {
    constructor() {
        this.currentCar = null;
        this.alerts = [];
        this.maintenanceData = null;
        this.init();
    }

    async init() {
        await this.loadCarData();
        
        // Add a small delay to ensure DOM elements are ready
        setTimeout(() => {
            this.setupEventListeners();
        }, 100);
        
        this.loadAlerts();
        this.loadMaintenanceData();
    }

    async loadCarData() {
        try {
            const carId = this.getCarIdFromUrl();
            console.log('CarOverviewMonitor: Attempting to load car with ID:', carId);
            
            if (carId) {
                this.currentCar = await DataService.getCar(carId);
                console.log('CarOverviewMonitor: Loaded car:', this.currentCar);
            } else {
                // Try to get current car ID from DataService
                console.log('CarOverviewMonitor: No carId found in URL, trying DataService.getCurrentCarId()');
                try {
                    const currentCarId = await DataService.getCurrentCarId();
                    if (currentCarId) {
                        this.currentCar = await DataService.getCar(currentCarId);
                        console.log('CarOverviewMonitor: Using current car from DataService:', this.currentCar);
                    } else {
                        // Try to get the first available car as fallback
                        console.log('CarOverviewMonitor: No current car, trying to get first available car');
                        const cars = await DataService.getCars();
                        if (cars && cars.length > 0) {
                            this.currentCar = cars[0];
                            console.log('CarOverviewMonitor: Using first available car:', this.currentCar);
                        } else {
                            console.log('CarOverviewMonitor: No cars available');
                        }
                    }
                } catch (error) {
                    console.error('CarOverviewMonitor: Error getting current car from DataService:', error);
                    // Try to get the first available car as fallback
                    const cars = await DataService.getCars();
                    if (cars && cars.length > 0) {
                        this.currentCar = cars[0];
                        console.log('CarOverviewMonitor: Using first available car as fallback:', this.currentCar);
                    }
                }
            }
        } catch (error) {
            console.error('Error loading car data:', error);
        }
    }

    getCarIdFromUrl() {
        // Check hash parameters first (for hash-based routing)
        const hashParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
        const carIdFromHash = hashParams.get('carId');
        if (carIdFromHash) return carIdFromHash;
        
        // Check for 'car' parameter (used by fleetUI)
        const carIdFromCar = hashParams.get('car');
        if (carIdFromCar) return carIdFromCar;
        
        // Fall back to search parameters (for direct URL access)
        const urlParams = new URLSearchParams(window.location.search);
        const carIdFromSearch = urlParams.get('carId');
        if (carIdFromSearch) return carIdFromSearch;
        
        // Check for 'car' parameter in search params
        const carIdFromSearchCar = urlParams.get('car');
        if (carIdFromSearchCar) return carIdFromSearchCar;
        
        // Check if we're on my-car-overview page and try to get carId from localStorage
        if (window.location.hash.includes('my-car-overview')) {
            const selectedCarId = sessionStorage.getItem('selectedCarId');
            if (selectedCarId) return selectedCarId;
            
            // Also check localStorage for currentCarId
            const currentCarId = localStorage.getItem('currentCarId');
            if (currentCarId) return currentCarId;
        }
        
        console.log('CarOverviewMonitor: No carId found in URL or sessionStorage');
        return null;
    }

    setupEventListeners() {
        console.log('CarOverviewMonitor: Setting up event listeners');
        
        // Alert sort select
        const alertSortSelect = document.getElementById('alert-sort-select');
        if (alertSortSelect) {
            console.log('CarOverviewMonitor: Found alert sort select');
            alertSortSelect.addEventListener('change', (e) => {
                this.sortAlerts(e.target.value);
            });
        } else {
            console.log('CarOverviewMonitor: Alert sort select not found');
        }

        // New alert button
        const newAlertBtn = document.getElementById('new-alert-btn');
        if (newAlertBtn) {
            console.log('CarOverviewMonitor: Found new alert button, adding event listener');
            newAlertBtn.addEventListener('click', () => {
                console.log('CarOverviewMonitor: New alert button clicked');
                this.showNewAlertPopup();
            });
        } else {
            console.log('CarOverviewMonitor: New alert button not found, will retry in 500ms');
            // Retry after a delay in case the button is added dynamically
            setTimeout(() => {
                const retryBtn = document.getElementById('new-alert-btn');
                if (retryBtn) {
                    console.log('CarOverviewMonitor: Found new alert button on retry, adding event listener');
                    retryBtn.addEventListener('click', () => {
                        console.log('CarOverviewMonitor: New alert button clicked (retry)');
                        this.showNewAlertPopup();
                    });
                } else {
                    console.log('CarOverviewMonitor: New alert button still not found after retry');
                }
            }, 500);
        }

        // View maintenance plan button
        const viewMaintenancePlanBtn = document.getElementById('view-maintenance-plan-btn');
        if (viewMaintenancePlanBtn) {
            console.log('CarOverviewMonitor: Found view maintenance plan button');
            viewMaintenancePlanBtn.addEventListener('click', () => {
                this.navigateToMaintenancePlan();
            });
        } else {
            console.log('CarOverviewMonitor: View maintenance plan button not found');
        }
    }

    async loadAlerts() {
        try {
            if (!this.currentCar) {
                console.log('CarOverviewMonitor: No car available, showing no alerts message');
                this.showNoCarMessage();
                return;
            }

            console.log('CarOverviewMonitor: Loading alerts for car:', this.currentCar.id);
            this.alerts = await getUserAlerts(this.currentCar.id);
            this.displayAlerts();
        } catch (error) {
            console.error('Error loading alerts:', error);
            this.showAlertsError();
        }
    }

    displayAlerts() {
        const container = document.getElementById('user-alerts-container');
        if (!container) return;

        if (this.alerts.length === 0) {
            container.innerHTML = `
                <div class="alerts-placeholder">
                    <p>Нет активных уведомлений</p>
                </div>
            `;
            return;
        }

        const tableHTML = this.createAlertsTable();
        container.innerHTML = tableHTML;

        // Setup action buttons
        this.setupAlertActions();
    }

    createAlertsTable() {
        const priorityConfig = {
            critical: { icon: '🔴', text: 'Критично' },
            warning: { icon: '🟡', text: 'Непонятно' },
            info: { icon: '🔵', text: 'Потерпим' }
        };

        let tableHTML = `
            <table class="alerts-table">
                <thead>
                    <tr>
                        <th>Дата</th>
                        <th>Приоритет</th>
                        <th>Система</th>
                        <th>Описание</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
        `;

        this.alerts.forEach(alert => {
            const config = priorityConfig[alert.priority] || priorityConfig.info;
            const isArchived = alert.archived || false;

            tableHTML += `
                <tr data-alert-id="${alert.id}">
                    <td>${alert.date}</td>
                    <td>
                        <span class="alert-priority-badge ${alert.priority}">
                            ${config.icon} ${config.text}
                        </span>
                    </td>
                    <td>${alert.subsystem}</td>
                    <td>${this.truncateText(alert.description, 50)}</td>
                    <td class="alert-actions-cell">
                        <button class="alert-action-btn archive ${isArchived ? 'archived' : ''}" 
                                onclick="carOverviewMonitor.toggleAlertArchive(${alert.id})" 
                                title="${isArchived ? 'Восстановить из архива' : 'Отправить в архив'}">
                            ${isArchived ? '📂 В архиве' : '🗄️ В архив'}
                        </button>
                    </td>
                </tr>
            `;
        });

        tableHTML += `
                </tbody>
            </table>
        `;

        return tableHTML;
    }

    setupAlertActions() {
        // Action buttons are already set up in the HTML
    }

    sortAlerts(sortType) {
        const sortedAlerts = [...this.alerts].sort((a, b) => {
            switch (sortType) {
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'priority-desc':
                    const priorityOrder = { critical: 3, warning: 2, info: 1 };
                    return (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
                case 'priority-asc':
                    const priorityOrderAsc = { critical: 3, warning: 2, info: 1 };
                    return (priorityOrderAsc[a.priority] || 1) - (priorityOrderAsc[b.priority] || 1);
                default:
                    return new Date(b.date) - new Date(a.date);
            }
        });

        this.alerts = sortedAlerts;
        this.displayAlerts();
    }

    async toggleAlertArchive(alertId) {
        try {
            const alert = this.alerts.find(a => a.id == alertId);
            if (!alert) return;

            alert.archived = !alert.archived;
            
            // Update in storage
            await this.updateAlert(alert);
            
            // Reload alerts
            await this.loadAlerts();
        } catch (error) {
            console.error('Error toggling alert archive:', error);
        }
    }

    async updateAlert(updatedAlert) {
        try {
            if (CONFIG.useBackend) {
                throw new Error('Backend API not implemented yet');
            } else {
                const existingAlerts = localStorage.getItem('userAlerts');
                if (!existingAlerts) return;
                
                const alerts = JSON.parse(existingAlerts);
                const updatedAlerts = alerts.map(alert => 
                    alert.id == updatedAlert.id ? updatedAlert : alert
                );
                
                localStorage.setItem('userAlerts', JSON.stringify(updatedAlerts));
            }
        } catch (error) {
            console.error('Error updating alert:', error);
            throw error;
        }
    }

    async showNewAlertPopup() {
        console.log('CarOverviewMonitor: showNewAlertPopup called');
        console.log('CarOverviewMonitor: currentCar:', this.currentCar);
        
        // Use the existing user alert popup system with pre-selected car
        // This skips car selection since car is already selected
        if (this.currentCar) {
            console.log('CarOverviewMonitor: Using showUserAlertPopupWithCar with car ID:', this.currentCar.id);
            try {
                await showUserAlertPopupWithCar(this.currentCar.id);
            } catch (error) {
                console.error('CarOverviewMonitor: Error calling showUserAlertPopupWithCar:', error);
                // Fallback to regular popup
                await showUserAlertPopup();
            }
        } else {
            console.log('CarOverviewMonitor: No current car, using regular popup');
            // Fallback to regular popup if no car is selected
            await showUserAlertPopup();
        }
    }

    async loadMaintenanceData() {
        try {
            if (!this.currentCar) {
                console.log('CarOverviewMonitor: No car available, showing no maintenance message');
                this.showNoMaintenanceMessage();
                return;
            }

            console.log('CarOverviewMonitor: Loading maintenance data for car:', this.currentCar.id);
            // Load maintenance plan data
            const maintenanceData = await this.getMaintenanceData();
            this.displayMaintenanceData(maintenanceData);
        } catch (error) {
            console.error('Error loading maintenance data:', error);
            this.showMaintenanceError();
        }
    }

    async getMaintenanceData() {
        try {
            if (CONFIG.useBackend) {
                throw new Error('Backend API not implemented yet');
            } else {
                const maintenanceKey = `maintenancePlan_${this.currentCar.id}`;
                const data = localStorage.getItem(maintenanceKey);
                return data ? JSON.parse(data) : null;
            }
        } catch (error) {
            console.error('Error getting maintenance data:', error);
            return null;
        }
    }

    displayMaintenanceData(maintenanceData) {
        const container = document.getElementById('maintenance-container');
        if (!container) return;

        if (!maintenanceData || !maintenanceData.maintenance || maintenanceData.maintenance.length === 0) {
            container.innerHTML = `
                <div class="maintenance-placeholder">
                    <p>План обслуживания не найден</p>
                </div>
            `;
            return;
        }

        const itemsHTML = this.createMaintenanceItems(maintenanceData);
        container.innerHTML = `
            <div class="maintenance-items">
                ${itemsHTML}
            </div>
        `;
    }

    createMaintenanceItems(maintenanceData) {
        const items = maintenanceData.maintenance || [];
        const currentMileage = this.currentCar.mileage || 0;

        return items.map(item => {
            const status = this.getMaintenanceStatus(item, currentMileage);
            const icon = this.getMaintenanceIcon(item.type);
            
            return `
                <div class="maintenance-item ${status}">
                    <div class="maintenance-icon">${icon}</div>
                    <div class="maintenance-content">
                        <div class="maintenance-title">${item.title || item.description}</div>
                        <div class="maintenance-description">${item.description}</div>
                        <div class="maintenance-date">Пробег: ${item.mileage} км</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getMaintenanceStatus(item, currentMileage) {
        const itemMileage = item.mileage || 0;
        const difference = itemMileage - currentMileage;
        
        if (difference <= 0) return 'urgent';
        if (difference <= 1000) return 'warning';
        return 'info';
    }

    getMaintenanceIcon(type) {
        const icons = {
            'oil': '🛢️',
            'filter': '🔧',
            'brakes': '🛑',
            'tires': '🛞',
            'timing': '⚙️',
            'default': '🔧'
        };
        return icons[type] || icons.default;
    }

    navigateToMaintenancePlan() {
        if (!this.currentCar) return;
        window.location.hash = `#maintenance-plan?carId=${this.currentCar.id}`;
    }

    showNoCarMessage() {
        const container = document.getElementById('user-alerts-container');
        if (container) {
            container.innerHTML = `
                <div class="alerts-placeholder">
                    <p>Выберите автомобиль для просмотра уведомлений</p>
                </div>
            `;
        }
    }

    showAlertsError() {
        const container = document.getElementById('user-alerts-container');
        if (container) {
            container.innerHTML = `
                <div class="alerts-placeholder">
                    <p>Ошибка загрузки уведомлений</p>
                </div>
            `;
        }
    }

    showNoMaintenanceMessage() {
        const container = document.getElementById('maintenance-container');
        if (container) {
            container.innerHTML = `
                <div class="maintenance-placeholder">
                    <p>Выберите автомобиль для просмотра плана обслуживания</p>
                </div>
            `;
        }
    }

    showMaintenanceError() {
        const container = document.getElementById('maintenance-container');
        if (container) {
            container.innerHTML = `
                <div class="maintenance-placeholder">
                    <p>Ошибка загрузки плана обслуживания</p>
                </div>
            `;
        }
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
}

// Create global instance
const carOverviewMonitor = new CarOverviewMonitor();

// Make methods globally available
window.carOverviewMonitor = carOverviewMonitor;

export { CarOverviewMonitor }; 