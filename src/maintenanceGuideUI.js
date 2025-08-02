import { DataService } from './dataService.js';
import { formatCarName } from './carNameFormatter.js';
import { maintenanceDataService } from './maintenanceDataService.js';

export class MaintenanceGuideUI {
    constructor() {
        this.currentCar = null;
        this.editingItemIndex = null;
        this.init();
    }

    async init() {
        await this.loadCarData();
        await maintenanceDataService.loadMaintenanceSchedule();
        this.setupEventListeners();
        this.updateDisplay();
    }

    async loadCarData() {
        try {
            const carId = this.getCarIdFromUrl();
            console.log('MaintenanceGuideUI: carId from URL:', carId);
            
            if (carId) {
                console.log('MaintenanceGuideUI: Loading car data for ID:', carId);
                this.currentCar = await DataService.getCar(carId);
                console.log('MaintenanceGuideUI: Loaded car:', this.currentCar);
            } else {
                console.log('MaintenanceGuideUI: No carId found in URL');
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
        
        // Fall back to search parameters (for direct URL access)
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('carId');
    }



    setupEventListeners() {
        // CRUD Controls
        document.getElementById('add-maintenance-item-btn')?.addEventListener('click', () => {
            this.showAddModal();
        });

        document.getElementById('save-maintenance-btn')?.addEventListener('click', () => {
            this.saveMaintenanceSchedule();
        });

        document.getElementById('revert-changes-btn')?.addEventListener('click', () => {
            this.revertChanges();
        });

        // Modal Controls
        document.getElementById('close-modal-btn')?.addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('save-item-btn')?.addEventListener('click', () => {
            this.saveMaintenanceItem();
        });

        document.getElementById('cancel-item-btn')?.addEventListener('click', () => {
            this.closeModal();
        });

        // Other buttons
        document.getElementById('create-maintenance-plan-btn')?.addEventListener('click', () => {
            this.createMaintenancePlan();
        });

        document.getElementById('export-guide-btn')?.addEventListener('click', () => {
            this.exportGuide();
        });

        document.getElementById('back-to-overview-btn')?.addEventListener('click', () => {
            this.goBackToOverview();
        });
    }

    updateDisplay() {
        this.updateCarInfo();
        this.renderMaintenanceSchedule();
        this.updateCRUDButtons();
    }

    updateCarInfo() {
        if (this.currentCar) {
            document.getElementById('car-name').textContent = formatCarName(this.currentCar);
            document.getElementById('car-year').textContent = `(${this.currentCar.year})`;
            document.getElementById('car-vin').textContent = this.currentCar.vin ? `VIN: ${this.currentCar.vin}` : '';
            document.getElementById('current-mileage').textContent = (this.currentCar.mileage || 0).toLocaleString();
        }
    }

    renderMaintenanceSchedule() {
        const tbody = document.getElementById('maintenance-schedule-tbody');
        if (!tbody) return;

        const maintenanceSchedule = maintenanceDataService.getMaintenanceSchedule();
        let tableHTML = '';
        
        maintenanceSchedule.forEach((item, index) => {
            tableHTML += `
                <tr class="maintenance-row" data-index="${index}">
                    <td>${index + 1}</td>
                    <td class="operation-name">${item.operation}</td>
                    <td class="mileage">${item.mileage.toLocaleString()}</td>
                    <td class="period">${item.period}</td>
                    <td class="notes">${item.notes}</td>
                    <td class="actions">
                        <button class="edit-btn" onclick="maintenanceGuideUI.editItem(${index})" title="Редактировать">
                            ✏️
                        </button>
                        <button class="delete-btn" onclick="maintenanceGuideUI.deleteItem(${index})" title="Удалить">
                            🗑️
                        </button>
                    </td>
                </tr>
            `;
        });

        tbody.innerHTML = tableHTML;
    }

    updateCRUDButtons() {
        const hasChanges = maintenanceDataService.hasChanges();
        const saveBtn = document.getElementById('save-maintenance-btn');
        const revertBtn = document.getElementById('revert-changes-btn');
        
        if (saveBtn) {
            saveBtn.disabled = !hasChanges;
            saveBtn.style.opacity = hasChanges ? '1' : '0.5';
        }
        
        if (revertBtn) {
            revertBtn.disabled = !hasChanges;
            revertBtn.style.opacity = hasChanges ? '1' : '0.5';
        }
    }

    showAddModal() {
        this.editingItemIndex = null;
        this.showModal('Добавить операцию');
    }

    editItem(index) {
        this.editingItemIndex = index;
        const maintenanceSchedule = maintenanceDataService.getMaintenanceSchedule();
        const item = maintenanceSchedule[index];
        this.showModal('Редактировать операцию', item);
    }

    showModal(title, item = null) {
        const modal = document.getElementById('maintenance-modal');
        const modalTitle = document.getElementById('modal-title');
        const operationInput = document.getElementById('operation-input');
        const mileageInput = document.getElementById('mileage-input');
        const periodInput = document.getElementById('period-input');
        const notesInput = document.getElementById('notes-input');

        modalTitle.textContent = title;

        if (item) {
            operationInput.value = item.operation;
            mileageInput.value = item.mileage;
            periodInput.value = item.period;
            notesInput.value = item.notes;
        } else {
            operationInput.value = '';
            mileageInput.value = '';
            periodInput.value = '';
            notesInput.value = '';
        }

        modal.style.display = 'block';
    }

    closeModal() {
        const modal = document.getElementById('maintenance-modal');
        modal.style.display = 'none';
        this.editingItemIndex = null;
    }

    saveMaintenanceItem() {
        const operationInput = document.getElementById('operation-input');
        const mileageInput = document.getElementById('mileage-input');
        const periodInput = document.getElementById('period-input');
        const notesInput = document.getElementById('notes-input');

        const operation = operationInput.value.trim();
        const mileage = parseInt(mileageInput.value);
        const period = parseInt(periodInput.value);
        const notes = notesInput.value.trim();

        // Validation
        if (!operation) {
            alert('Пожалуйста, введите название операции');
            return;
        }

        if (!mileage || mileage < 0) {
            alert('Пожалуйста, введите корректный пробег');
            return;
        }

        if (!period || period < 0) {
            alert('Пожалуйста, введите корректный период');
            return;
        }

        const newItem = {
            operation: operation,
            mileage: mileage,
            period: period,
            notes: notes
        };

        if (this.editingItemIndex !== null) {
            // Update existing item
            maintenanceDataService.updateMaintenanceItem(this.editingItemIndex, newItem);
        } else {
            // Add new item
            maintenanceDataService.addMaintenanceItem(newItem);
        }

        this.closeModal();
        this.renderMaintenanceSchedule();
        this.updateCRUDButtons();
    }

    deleteItem(index) {
        if (confirm('Вы уверены, что хотите удалить эту операцию?')) {
            maintenanceDataService.deleteMaintenanceItem(index);
            this.renderMaintenanceSchedule();
            this.updateCRUDButtons();
        }
    }

    async saveMaintenanceSchedule() {
        try {
            const success = await maintenanceDataService.saveMaintenanceSchedule();
            this.updateCRUDButtons();
            
            if (success) {
                alert('Изменения сохранены успешно!');
            } else {
                alert('Ошибка при сохранении изменений');
            }
        } catch (error) {
            console.error('Error saving maintenance schedule:', error);
            alert('Ошибка при сохранении изменений');
        }
    }

    revertChanges() {
        if (confirm('Вы уверены, что хотите отменить все изменения?')) {
            maintenanceDataService.revertChanges();
            this.renderMaintenanceSchedule();
            this.updateCRUDButtons();
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
        if (!this.currentCar) {
            window.location.hash = '#my-car-overview';
        } else {
            window.location.hash = `#my-car-overview?car=${this.currentCar.id}`;
        }
    }
}

// Create global instance for inline event handlers
const maintenanceGuideUI = new MaintenanceGuideUI();
window.maintenanceGuideUI = maintenanceGuideUI; 