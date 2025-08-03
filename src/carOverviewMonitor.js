import { DataService } from './dataService.js';
import { getUserAlerts } from './userAlertUI.js';
import { showConfirmationDialog } from './dialogs.js';
import { CONFIG } from './config.js';
import { periodicalMaintDataService } from './periodicalMaintDataService.js';
import { formatCarName } from './carNameFormatter.js';

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
        this.updateCarDisplay();
        
        // Subscribe to maintenance data changes
        this.unsubscribeMaintenance = periodicalMaintDataService.subscribe(() => {
            this.loadMaintenanceData();
        });
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

        // Dynamic monitor action buttons (created dynamically)
        this.setupDynamicMonitorButtons();

        // Maintenance guide button
        const maintenanceGuideBtn = document.getElementById('maintenance-guide-btn');
        if (maintenanceGuideBtn) {
            console.log('CarOverviewMonitor: Found maintenance guide button');
            maintenanceGuideBtn.addEventListener('click', () => {
                this.navigateToMaintenanceGuide();
            });
        } else {
            console.log('CarOverviewMonitor: Maintenance guide button not found');
        }

        // Mileage modal functionality
        this.setupMileageModal();
    }

    setupMileageModal() {
        console.log('CarOverviewMonitor: Setting up mileage modal');
        
        // Mileage field click handler
        const inlineMileageContainer = document.getElementById('inline-mileage-container');
        const editMileageBtn = document.getElementById('edit-mileage-btn');
        
        if (inlineMileageContainer) {
            inlineMileageContainer.addEventListener('click', () => {
                this.openMileageModal();
            });
        }
        
        if (editMileageBtn) {
            editMileageBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering the container click
                this.openMileageModal();
            });
        }

        // Modal close handlers
        const closeModalBtn = document.getElementById('close-mileage-modal');
        const cancelBtn = document.getElementById('cancel-mileage-update');
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                this.closeMileageModal();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeMileageModal();
            });
        }

        // Save mileage handler
        const saveBtn = document.getElementById('save-mileage-update');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveMileageUpdate();
            });
        }

        // Close modal when clicking outside
        const modal = document.getElementById('mileage-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeMileageModal();
                }
            });
        }

        // Set current date as default
        const mileageDateInput = document.getElementById('mileage-date');
        if (mileageDateInput) {
            const today = new Date().toISOString().split('T')[0];
            mileageDateInput.value = today;
        }
    }

    openMileageModal() {
        console.log('CarOverviewMonitor: Opening mileage modal');
        const modal = document.getElementById('mileage-modal');
        const newMileageInput = document.getElementById('new-mileage');
        
        if (modal && newMileageInput) {
            // Set current mileage as default value
            const currentMileage = this.currentCar?.mileage || 0;
            newMileageInput.value = currentMileage;
            newMileageInput.focus();
            
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    }

    closeMileageModal() {
        console.log('CarOverviewMonitor: Closing mileage modal');
        const modal = document.getElementById('mileage-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = ''; // Restore scrolling
        }
    }

    async saveMileageUpdate() {
        console.log('CarOverviewMonitor: Saving mileage update');
        
        const newMileageInput = document.getElementById('new-mileage');
        const mileageDateInput = document.getElementById('mileage-date');
        const mileageNotesInput = document.getElementById('mileage-notes');
        
        if (!newMileageInput || !mileageDateInput) {
            console.error('CarOverviewMonitor: Required form elements not found');
            return;
        }

        const newMileage = parseInt(newMileageInput.value);
        const mileageDate = mileageDateInput.value;
        const mileageNotes = mileageNotesInput?.value || '';

        if (!newMileage || newMileage < 0) {
            alert('Пожалуйста, введите корректный пробег');
            return;
        }

        if (!mileageDate) {
            alert('Пожалуйста, выберите дату обновления');
            return;
        }

        try {
            // Update car mileage in DataService
            if (this.currentCar) {
                // Get all cars and update the current car
                const cars = await DataService.getCars();
                const carIndex = cars.findIndex(car => car.id === this.currentCar.id);
                
                if (carIndex !== -1) {
                    // Update the car in the array
                    cars[carIndex] = { ...cars[carIndex], mileage: newMileage };
                    
                    // Save the updated cars array
                    await DataService.saveCars(cars);
                    
                    // Update current car reference
                    this.currentCar = cars[carIndex];
                    
                    // Update display
                    this.updateMileageDisplay(newMileage);
                    
                    console.log('CarOverviewMonitor: Mileage updated successfully:', newMileage);
                    this.closeMileageModal();
                    
                    // Show success message
                    alert(`Пробег успешно обновлен: ${newMileage} км`);
                } else {
                    throw new Error('Car not found in cars array');
                }
            }
        } catch (error) {
            console.error('CarOverviewMonitor: Error updating mileage:', error);
            alert('Ошибка при обновлении пробега');
        }
    }

    updateMileageDisplay(newMileage) {
        const mileageElement = document.getElementById('car-mileage');
        if (mileageElement) {
            mileageElement.textContent = newMileage.toLocaleString();
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
            const isInPlan = alert.inPlan || false;

            tableHTML += `
                <tr data-alert-id="${alert.id}" class="${isInPlan ? 'alert-in-plan' : ''}">
                    <td>${alert.date}</td>
                    <td>
                        <span class="alert-priority-badge ${alert.priority}">
                            ${config.icon} ${config.text}
                        </span>
                    </td>
                    <td>${alert.subsystem}</td>
                    <td>${this.truncateText(alert.description, 50)}</td>
                    <td class="alert-actions-cell">
                        <button class="alert-action-btn add-to-plan ${isInPlan ? 'in-plan' : ''}" 
                                onclick="carOverviewMonitor.toggleAlertPlan(${alert.id})" 
                                title="${isInPlan ? 'Удалить из плана' : 'Добавить в план'}">
                            ${isInPlan ? '📋 В плане' : '📋 В план'}
                        </button>
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

    // Helper function to parse Russian date format (dd.mm.yyyy)
    parseRussianDate(dateString) {
        if (!dateString) return new Date(0);
        
        // Check if it's already in Russian format (dd.mm.yyyy)
        if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
            const [day, month, year] = dateString.split('.');
            return new Date(year, month - 1, day);
        }
        
        // Try to parse as regular date
        return new Date(dateString);
    }

    sortAlerts(sortType) {
        const sortedAlerts = [...this.alerts].sort((a, b) => {
            switch (sortType) {
                case 'date-desc':
                    return this.parseRussianDate(b.date) - this.parseRussianDate(a.date);
                case 'date-asc':
                    return this.parseRussianDate(a.date) - this.parseRussianDate(b.date);
                case 'priority-desc':
                    const priorityOrder = { critical: 3, warning: 2, info: 1 };
                    return (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
                case 'priority-asc':
                    const priorityOrderAsc = { critical: 3, warning: 2, info: 1 };
                    return (priorityOrderAsc[a.priority] || 1) - (priorityOrderAsc[b.priority] || 1);
                default:
                    return this.parseRussianDate(b.date) - this.parseRussianDate(a.date);
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

    async toggleAlertPlan(alertId) {
        try {
            const alert = this.alerts.find(a => a.id == alertId);
            if (!alert) return;

            if (alert.inPlan) {
                // Remove from plan
                await this.removeAlertFromPlan(alert);
            } else {
                // Add to plan
                await this.addAlertToPlan(alert);
            }
            
            // Update in storage
            await this.updateAlert(alert);
            
            // Reload alerts
            await this.loadAlerts();
        } catch (error) {
            console.error('Error toggling alert plan:', error);
        }
    }

    async addAlertToPlan(alert) {
        try {
            // Create plan entry
            const planEntry = {
                id: this.generateId(),
                operation: `${alert.subsystem}: ${alert.description}`,
                resources: '',
                notes: `Добавлено из уведомления от ${alert.date} со статусом "${this.getPriorityText(alert.priority)}"`,
                createdAt: new Date().toISOString(),
                alertId: alert.id // Link back to original alert
            };

            // Add to repairs table in maintenance plan
            const carId = this.currentCar.id;
            const planKey = `maintenance_plan_draft_${carId}`;
            
            let planData = localStorage.getItem(planKey);
            if (planData) {
                planData = JSON.parse(planData);
            } else {
                planData = {
                    maintenance: [],
                    repairs: [],
                    carId: carId,
                    lastModified: new Date().toISOString()
                };
            }

            // Add to repairs table
            if (!planData.repairs) {
                planData.repairs = [];
            }
            planData.repairs.push(planEntry);
            
            // Save plan data
            localStorage.setItem(planKey, JSON.stringify(planData));
            
            // Mark alert as in plan
            alert.inPlan = true;
            
            console.log('Alert added to plan:', alert.id);
        } catch (error) {
            console.error('Error adding alert to plan:', error);
            throw error;
        }
    }

    async removeAlertFromPlan(alert) {
        try {
            const carId = this.currentCar.id;
            const planKey = `maintenance_plan_draft_${carId}`;
            
            let planData = localStorage.getItem(planKey);
            if (planData) {
                planData = JSON.parse(planData);
                
                // Remove from repairs table
                if (planData.repairs) {
                    planData.repairs = planData.repairs.filter(entry => entry.alertId !== alert.id);
                }
                
                // Save updated plan data
                localStorage.setItem(planKey, JSON.stringify(planData));
            }
            
            // Mark alert as not in plan
            alert.inPlan = false;
            
            console.log('Alert removed from plan:', alert.id);
        } catch (error) {
            console.error('Error removing alert from plan:', error);
            throw error;
        }
    }

    getPriorityText(priority) {
        const priorityTexts = {
            critical: 'Критично',
            warning: 'Непонятно',
            info: 'Потерпим'
        };
        return priorityTexts[priority] || 'Потерпим';
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
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
        
        if (!this.currentCar) {
            console.log('CarOverviewMonitor: No current car, showing error');
            window.alert('Сначала выберите автомобиль');
            return;
        }
        
        // Show date & mileage popup directly (skip car selection)
        console.log('CarOverviewMonitor: Showing date & mileage popup for car ID:', this.currentCar.id);
        try {
            await this.showDateAndMileagePopup(this.currentCar.id);
        } catch (error) {
            console.error('CarOverviewMonitor: Error showing date & mileage popup:', error);
            window.alert('Ошибка: ' + error.message);
        }
    }

    async showDateAndMileagePopup(carId) {
        console.log('CarOverviewMonitor: showDateAndMileagePopup called with carId:', carId);
        try {
            const car = await DataService.getCar(carId);
            console.log('Retrieved car:', car);
            
            if (!car) {
                window.alert('Автомобиль не найден');
                return;
            }
            
            // Get current date
            const today = new Date();
            const currentDate = today.toLocaleDateString('ru-RU');
            
            const carName = formatCarName(car);
            const currentMileage = car.mileage || 0;
            
            let popupHtml = `
                <div class="date-mileage-popup">
                    <div class="popup-header">
                        <h2>Добавить новое уведомление</h2>
                        <button class="close-btn" onclick="closeDateAndMileagePopup()">&times;</button>
                    </div>
                    <div class="popup-body">
                        <div class="form-section">
                            <h3>Автомобиль</h3>
                            <div class="selected-car-info">
                                <div class="selected-car-img">
                                    ${car.img && car.img.startsWith('data:image/') ? 
                                        `<img src="${car.img}" alt="${carName}">` : 
                                        `<span>🚗</span>`
                                    }
                                </div>
                                <div class="selected-car-details">
                                    <div class="selected-car-name">${carName}</div>
                                    <div class="selected-car-year">${car.year ? `Год: ${car.year}` : ''}</div>
                                    <div class="selected-car-mileage">${car.mileage ? `Пробег: ${car.mileage} км` : ''}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h3>Дата обнаружения проблемы</h3>
                            <div class="input-group">
                                <label for="alert-date-input">Дата:</label>
                                <input type="text" id="alert-date-input" value="${currentDate}" 
                                       placeholder="дд.мм.гггг" required 
                                       pattern="\\d{2}\\.\\d{2}\\.\\d{4}">
                            </div>
                        </div>
                        
                        <div class="form-section">
                            <h3>Актуальный пробег</h3>
                            <div class="input-group">
                                <label for="alert-mileage-input">
                                    <span class="icon">🛣️</span>
                                    Пробег (км):
                                </label>
                                <input type="number" id="alert-mileage-input" 
                                       value="${currentMileage}"
                                       placeholder="Введите текущий пробег" 
                                       min="0" required>
                            </div>
                        </div>
                        
                        <div class="popup-footer">
                            <button onclick="confirmDateAndMileage()" class="btn-primary">Продолжить</button>
                            <button onclick="closeDateAndMileagePopup()" class="btn-secondary">Отмена</button>
                        </div>
                    </div>
                </div>
            `;
            
            // Create and show popup
            const overlay = document.createElement('div');
            overlay.className = 'popup-overlay';
            overlay.id = 'date-mileage-overlay';
            overlay.innerHTML = popupHtml;
            
            document.body.appendChild(overlay);
            
            // Make functions globally available
            window.closeDateAndMileagePopup = this.closeDateAndMileagePopup.bind(this);
            window.confirmDateAndMileage = this.confirmDateAndMileage.bind(this);
            
            // Initialize current alert data
            this.currentAlertData = {
                carId: carId,
                date: currentDate,
                mileage: currentMileage
            };
            
            // Suggest current mileage from mileage handler
            try {
                const { mileageHandler } = await import('./mileageHandler.js');
                await mileageHandler.suggestMileageForInput('alert-mileage-input', carId);
            } catch (error) {
                console.error('Failed to suggest mileage:', error);
            }
            
        } catch (error) {
            console.error('Error showing date & mileage popup:', error);
            window.alert('Ошибка загрузки данных: ' + error.message);
        }
    }

    closeDateAndMileagePopup() {
        const overlay = document.getElementById('date-mileage-overlay');
        if (overlay) {
            document.body.removeChild(overlay);
        }
        this.currentAlertData = null;
    }

    async confirmDateAndMileage() {
        console.log('CarOverviewMonitor: confirmDateAndMileage called');
        try {
            const dateInput = document.getElementById('alert-date-input');
            const mileageInput = document.getElementById('alert-mileage-input');
            
            const date = dateInput ? dateInput.value : '';
            const mileage = mileageInput ? mileageInput.value : '';
            
            console.log('Date input value:', date);
            console.log('Mileage input value:', mileage);
            
            // Validate date format
            if (!/^\d{2}\.\d{2}\.\d{4}$/.test(date)) {
                window.alert('Пожалуйста, введите корректную дату в формате дд.мм.гггг');
                dateInput.style.borderColor = '#dc3545';
                return;
            }
            
            // Validate mileage
            if (!mileage || isNaN(mileage) || Number(mileage) < 0) {
                window.alert('Пожалуйста, введите корректный пробег');
                mileageInput.style.borderColor = '#dc3545';
                return;
            }
            
            // Update current alert data
            this.currentAlertData.date = date;
            this.currentAlertData.mileage = Number(mileage);
            
            console.log('Updated currentAlertData:', this.currentAlertData);
            
            // Store alert data in session storage for the user-alert page
            sessionStorage.setItem('userAlertData', JSON.stringify(this.currentAlertData));
            
            // Close popup and navigate to user-alert page
            this.closeDateAndMileagePopup();
            window.location.hash = '#user-alert';
            
        } catch (error) {
            console.error('Error confirming date and mileage:', error);
            window.alert('Ошибка: ' + error.message);
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
            // Always show the dynamic monitor content
            await this.displayMaintenanceData(null);
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

    async displayMaintenanceData(maintenanceData) {
        const container = document.getElementById('maintenance-container');
        if (!container) return;

        // Always show the dynamic monitor content
        container.innerHTML = await this.createDynamicMonitorContent();
        
        // Setup event listeners for the dynamically created buttons
        setTimeout(() => {
            this.setupDynamicMonitorButtons();
        }, 100);
    }

    async createDynamicMonitorContent() {
        if (!this.currentCar) {
            return `
                <div class="maintenance-placeholder">
                    <p>Выберите автомобиль для просмотра плана обслуживания</p>
                </div>
            `;
        }

        const maintenanceRows = await this.createMaintenanceScheduleRows();

        return `
            <!-- Maintenance Schedule Table -->
            <div class="schedule-section">
               
                <div class="table-container">
                    <table id="maintenance-schedule-table" class="data-table">
                        <thead>
                            <tr>
                                <th>№</th>
                                <th>Операция</th>
                                <th>Пробег (км)</th>
                                <th>Период (мес)</th>
                                <th>Статус</th>
                                <th>Примечания</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody id="maintenance-schedule-tbody">
                            ${maintenanceRows}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Legend -->
            <div class="legend-section">
                <h3 class="legend-title">Условные обозначения:</h3>
                <div class="legend-items">
                    <div class="legend-item">
                        <span class="status-icon overdue">🔴</span>
                        <span class="legend-text">Просрочено</span>
                    </div>
                    <div class="legend-item">
                        <span class="status-icon due-soon">🟡</span>
                        <span class="legend-text">Скоро потребуется</span>
                    </div>
                    <div class="legend-item">
                        <span class="status-icon ok">🟢</span>
                        <span class="legend-text">В порядке</span>
                    </div>
                    <div class="legend-item">
                        <span class="status-icon completed">✅</span>
                        <span class="legend-text">Выполнено</span>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            
        `;
    }

    async createMaintenanceScheduleRows() {
        try {
            // Get maintenance schedule from data service
            const maintenanceSchedule = periodicalMaintDataService.getMaintenanceSchedule();
            const currentMileage = this.currentCar.mileage || 0;
            let tableHTML = '';

            maintenanceSchedule.forEach((item, index) => {
                            const status = periodicalMaintDataService.calculateMaintenanceStatus(item, currentMileage);
            const statusIcon = periodicalMaintDataService.getStatusIcon(status);
            const statusText = periodicalMaintDataService.getStatusText(status);
                const isInPlan = this.isMaintenanceItemInPlan(item);
                
                tableHTML += `
                    <tr class="maintenance-row ${status} ${isInPlan ? 'maintenance-in-plan' : ''}" data-maintenance-id="${index}">
                        <td>${index + 1}</td>
                        <td class="operation-name">${item.operation}</td>
                        <td class="mileage">${item.mileage.toLocaleString()}</td>
                        <td class="period">${item.period}</td>
                        <td class="status">
                            <span class="status-icon">${statusIcon}</span>
                            <span class="status-text">${statusText}</span>
                        </td>
                        <td class="notes">${item.notes}</td>
                        <td class="maintenance-actions">
                            <button class="maintenance-action-btn add-to-plan ${isInPlan ? 'in-plan' : ''}" 
                                    onclick="carOverviewMonitor.toggleMaintenancePlan(${index})" 
                                    title="${isInPlan ? 'Удалить из плана' : 'Добавить в план'}">
                                ${isInPlan ? '📋 В плане' : '📋 В план'}
                            </button>
                        </td>
                    </tr>
                `;
            });

            return tableHTML;
        } catch (error) {
            console.error('Error loading maintenance schedule:', error);
            return '<tr><td colspan="7">Ошибка загрузки данных обслуживания</td></tr>';
        }
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

    navigateToMaintenanceGuide() {
        if (!this.currentCar) return;
                    window.location.hash = `#periodical-maint-guide?carId=${this.currentCar.id}`;
    }

    setupDynamicMonitorButtons() {
        // Create maintenance plan button
        const createMaintenancePlanBtn = document.getElementById('create-maintenance-plan-btn');
        if (createMaintenancePlanBtn) {
            createMaintenancePlanBtn.addEventListener('click', () => {
                this.createMaintenancePlan();
            });
        }

        // Export guide button
        const exportGuideBtn = document.getElementById('export-guide-btn');
        if (exportGuideBtn) {
            exportGuideBtn.addEventListener('click', () => {
                this.exportGuide();
            });
        }

        // Back to overview button
        const backToOverviewBtn = document.getElementById('back-to-overview-btn');
        if (backToOverviewBtn) {
            backToOverviewBtn.addEventListener('click', () => {
                this.goBackToOverview();
            });
        }
    }

    createMaintenancePlan() {
        if (!this.currentCar) return;
        window.location.hash = `#maintenance-plan?carId=${this.currentCar.id}`;
    }

    exportGuide() {
        // TODO: Implement PDF export functionality
        console.log('Export guide to PDF');
        alert('Функция экспорта в разработке');
    }

    goBackToOverview() {
        // Already on overview page, just refresh
        window.location.reload();
    }

    updateCarDisplay() {
        if (!this.currentCar) return;

        // Update car title
        const carTitle = document.getElementById('car-title');
        if (carTitle) {
            const carName = formatCarName(this.currentCar);
            carTitle.textContent = carName;
        }

        // Update car image
        const carImg = document.getElementById('car-overview-img');
        if (carImg && this.currentCar.img) {
            if (this.currentCar.img.startsWith('data:image/')) {
                carImg.src = this.currentCar.img;
            } else if (this.currentCar.img !== 'car-by-deault.png') {
                carImg.src = this.currentCar.img;
            }
        }

        // Update car details in the new format
        const carBrand = document.getElementById('car-brand');
        const carModel = document.getElementById('car-model');
        const carYear = document.getElementById('car-year');
        const carVin = document.getElementById('car-vin');
        const carLicensePlate = document.getElementById('car-license-plate');
        const carMileage = document.getElementById('car-mileage');

        if (carBrand) {
            carBrand.textContent = this.currentCar.brand || '';
            carBrand.style.display = this.currentCar.brand ? 'inline' : 'none';
        }

        if (carModel) {
            carModel.textContent = this.currentCar.model || '';
            carModel.style.display = this.currentCar.model ? 'inline' : 'none';
        }

        if (carYear) {
            carYear.textContent = this.currentCar.year || '';
            carYear.style.display = this.currentCar.year ? 'inline' : 'none';
        }

        if (carVin) {
            carVin.textContent = this.currentCar.vin || '';
            carVin.style.display = this.currentCar.vin ? 'inline' : 'none';
        }

        if (carLicensePlate) {
            carLicensePlate.textContent = this.currentCar.licensePlate || '';
            carLicensePlate.style.display = this.currentCar.licensePlate ? 'inline' : 'none';
        }

        if (carMileage) {
            carMileage.textContent = this.currentCar.mileage ? `${this.currentCar.mileage} км` : '';
            carMileage.style.display = this.currentCar.mileage ? 'inline' : 'none';
        }

        // Update separators visibility
        this.updateSeparatorsVisibility();
    }

    updateSeparatorsVisibility() {
        const separators = document.querySelectorAll('.car-separator');
        const detailsLine = document.querySelector('.car-details-line');
        
        if (!detailsLine) return;
        
        const visibleElements = [];
        detailsLine.childNodes.forEach(child => {
            if (child.nodeType === Node.ELEMENT_NODE && 
                child.style.display !== 'none' && 
                child.textContent.trim() !== '') {
                visibleElements.push(child);
            }
        });
        
        // Show/hide separators based on visible elements
        separators.forEach((separator, index) => {
            const nextElement = separator.nextElementSibling;
            const prevElement = separator.previousElementSibling;
            
            // Hide separator if next element is hidden or empty
            if (!nextElement || 
                nextElement.style.display === 'none' || 
                nextElement.textContent.trim() === '' ||
                nextElement.classList.contains('car-separator')) {
                separator.style.display = 'none';
            } else {
                separator.style.display = 'inline';
            }
        });
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

    isMaintenanceItemInPlan(item) {
        // Check if maintenance item is in plan
        const carId = this.currentCar.id;
        const planKey = `maintenance_plan_draft_${carId}`;
        
        try {
            const planData = localStorage.getItem(planKey);
            if (planData) {
                const plan = JSON.parse(planData);
                if (plan.maintenance) {
                    return plan.maintenance.some(planItem => 
                        planItem.maintenanceId === item.operation
                    );
                }
            }
        } catch (error) {
            console.error('Error checking if maintenance item is in plan:', error);
        }
        
        return false;
    }

    async toggleMaintenancePlan(maintenanceIndex) {
        try {
            const maintenanceSchedule = periodicalMaintDataService.getMaintenanceSchedule();
            const item = maintenanceSchedule[maintenanceIndex];
            
            if (!item) {
                console.error('Maintenance item not found:', maintenanceIndex);
                return;
            }

            if (this.isMaintenanceItemInPlan(item)) {
                // Remove from plan
                await this.removeMaintenanceFromPlan(item);
            } else {
                // Add to plan
                await this.addMaintenanceToPlan(item, maintenanceIndex);
            }
            
            // Reload maintenance data to update display
            await this.loadMaintenanceData();
        } catch (error) {
            console.error('Error toggling maintenance plan:', error);
        }
    }

    async addMaintenanceToPlan(item, maintenanceIndex) {
        try {
            // Create plan entry
            const planEntry = {
                id: this.generateId(),
                operation: item.operation,
                resources: '',
                notes: `Добавлено из периодического обслуживания. Пробег: ${item.mileage.toLocaleString()} км, период: ${item.period} мес. ${item.notes}`,
                createdAt: new Date().toISOString(),
                maintenanceId: item.operation, // Link back to original maintenance item
                maintenanceIndex: maintenanceIndex
            };

            // Add to maintenance table in maintenance plan
            const carId = this.currentCar.id;
            const planKey = `maintenance_plan_draft_${carId}`;
            
            let planData = localStorage.getItem(planKey);
            if (planData) {
                planData = JSON.parse(planData);
            } else {
                planData = {
                    maintenance: [],
                    repairs: [],
                    carId: carId,
                    lastModified: new Date().toISOString()
                };
            }

            // Add to maintenance table
            if (!planData.maintenance) {
                planData.maintenance = [];
            }
            planData.maintenance.push(planEntry);
            
            // Save plan data
            localStorage.setItem(planKey, JSON.stringify(planData));
            
            console.log('Maintenance item added to plan:', item.operation);
        } catch (error) {
            console.error('Error adding maintenance to plan:', error);
            throw error;
        }
    }

    async removeMaintenanceFromPlan(item) {
        try {
            const carId = this.currentCar.id;
            const planKey = `maintenance_plan_draft_${carId}`;
            
            let planData = localStorage.getItem(planKey);
            if (planData) {
                planData = JSON.parse(planData);
                
                // Remove from maintenance table
                if (planData.maintenance) {
                    planData.maintenance = planData.maintenance.filter(entry => 
                        entry.maintenanceId !== item.operation
                    );
                }
                
                // Save updated plan data
                localStorage.setItem(planKey, JSON.stringify(planData));
            }
            
            console.log('Maintenance item removed from plan:', item.operation);
        } catch (error) {
            console.error('Error removing maintenance from plan:', error);
            throw error;
        }
    }

    destroy() {
        // Unsubscribe from maintenance data changes
        if (this.unsubscribeMaintenance) {
            this.unsubscribeMaintenance();
        }
    }
}

// Create global instance
const carOverviewMonitor = new CarOverviewMonitor();

// Make methods globally available
window.carOverviewMonitor = carOverviewMonitor;

export { CarOverviewMonitor }; 