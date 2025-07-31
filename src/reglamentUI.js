import { DataService } from './dataService.js';

export class ReglamentUI {
    constructor() {
        this.selectedCar = null;
        this.maintenanceData = [];
        this.editingIndex = -1;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadCars();
        this.updateUIState(); // Set initial UI state
        
        // For debugging: auto-select first car if available
        this.autoSelectFirstCar();
    }

    async autoSelectFirstCar() {
        try {
            console.log('Auto-selecting first car...');
            const cars = await DataService.getCars();
            console.log('Available cars:', cars);
            
            if (cars && cars.length > 0) {
                console.log('Auto-selecting first car for testing:', cars[0]);
                await this.selectCar(cars[0].id);
            } else {
                // Use test data
                const testCars = this.getTestCars();
                console.log('No cars found, using test cars:', testCars);
                if (testCars.length > 0) {
                    console.log('Auto-selecting first test car:', testCars[0]);
                    await this.selectCar(testCars[0].id);
                }
            }
        } catch (error) {
            console.error('Error auto-selecting car:', error);
            // Use test data as fallback
            const testCars = this.getTestCars();
            if (testCars.length > 0) {
                console.log('Auto-selecting first test car as fallback:', testCars[0]);
                await this.selectCar(testCars[0].id);
            }
        }
    }

    setupEventListeners() {
        document.getElementById('select-car-btn')?.addEventListener('click', () => this.showCarSelectionPopup());
        document.getElementById('change-car-btn')?.addEventListener('click', () => this.showCarSelectionPopup());
        document.getElementById('add-maintenance-btn')?.addEventListener('click', () => this.showMaintenancePopup());
        document.getElementById('add-maintenance-bottom-btn')?.addEventListener('click', () => this.showMaintenancePopup());
        document.getElementById('maintenance-form')?.addEventListener('submit', (e) => this.handleMaintenanceSubmit(e));
        
        // Event delegation for car selection
        document.addEventListener('click', (e) => {
            if (e.target.closest('.car-item')) {
                const carItem = e.target.closest('.car-item');
                const carId = parseInt(carItem.dataset.carId);
                if (carId) {
                    this.selectCar(carId);
                }
            }
        });
        
        // Event delegation for maintenance actions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-maintenance-btn')) {
                const editBtn = e.target.closest('.edit-maintenance-btn');
                const index = parseInt(editBtn.dataset.index);
                if (!isNaN(index)) {
                    console.log('Edit button clicked for index:', index);
                    this.editMaintenance(index);
                }
            }
            
            if (e.target.closest('.delete-maintenance-btn')) {
                const deleteBtn = e.target.closest('.delete-maintenance-btn');
                const index = parseInt(deleteBtn.dataset.index);
                if (!isNaN(index)) {
                    console.log('Delete button clicked for index:', index);
                    this.deleteMaintenance(index);
                }
            }
        });
        
        // Close popups on overlay click
        document.querySelectorAll('.popup-overlay').forEach(overlay => {
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    overlay.style.display = 'none';
                }
            });
        });

        // Save data when page is unloaded
        window.addEventListener('beforeunload', (e) => {
            if (this.selectedCar && this.maintenanceData.length > 0) {
                // Use synchronous localStorage as fallback for page unload
                try {
                    localStorage.setItem(`reglament_${this.selectedCar.id}`, JSON.stringify(this.maintenanceData));
                    console.log('Data saved on page unload');
                } catch (error) {
                    console.error('Error saving data on page unload:', error);
                }
            }
        });

        // Also save data when page becomes hidden (mobile browsers)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden' && this.selectedCar && this.maintenanceData.length > 0) {
                try {
                    localStorage.setItem(`reglament_${this.selectedCar.id}`, JSON.stringify(this.maintenanceData));
                    console.log('Data saved on page visibility change');
                } catch (error) {
                    console.error('Error saving data on visibility change:', error);
                }
            }
        });
    }

    async loadCars() {
        try {
            const cars = await DataService.getCars();
            this.renderCarsList(cars);
        } catch (error) {
            console.error('Error loading cars:', error);
            // Fallback to test data for development
            this.renderCarsList(this.getTestCars());
        }
    }

    getTestCars() {
        return [
            { id: 1, name: "Honda Accord 2004", year: "2004", img: "🚗" },
            { id: 2, name: "Toyota Camry 2010", year: "2010", img: "🚙" },
            { id: 3, name: "BMW 320i 2015", year: "2015", img: "🏎️" }
        ];
    }

    renderCarsList(cars) {
        const carsList = document.getElementById('cars-list');
        if (!carsList) return;

        carsList.innerHTML = cars.map(car => {
            // Handle car image display
            let carImageHtml = '';
            if (car.img && car.img.startsWith('data:image/')) {
                // User uploaded image
                carImageHtml = `<img src="${car.img}" alt="car image" style="width:60px;height:60px;object-fit:cover;border-radius:8px;">`;
            } else if (car.img && car.img.length === 1) {
                // Emoji fallback
                carImageHtml = `<span style="font-size:3rem;">${car.img}</span>`;
            } else {
                // Default car emoji
                carImageHtml = `<span style="font-size:3rem;">🚗</span>`;
            }

            return `
                <div class="p-3 border border-gray-200 rounded cursor-pointer hover:bg-gray-50 car-item" 
                     data-car-id="${car.id}">
                    <div class="flex items-center gap-3">
                        ${carImageHtml}
                        <div>
                            <div class="font-medium">${car.name}</div>
                            <div class="text-sm text-gray-600">${car.year}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    showCarSelectionPopup() {
        const popup = document.getElementById('car-selection-popup');
        if (popup) popup.style.display = 'flex';
    }

    closeCarSelectionPopup() {
        const popup = document.getElementById('car-selection-popup');
        if (popup) popup.style.display = 'none';
    }

    async selectCar(carId) {
        console.log('selectCar called with carId:', carId, 'type:', typeof carId);
        
        try {
            const cars = await DataService.getCars();
            console.log('Loaded cars:', cars);
            console.log('Looking for car with ID:', carId);
            this.selectedCar = cars.find(car => {
                console.log('Checking car:', car.id, 'against', carId, 'result:', car.id == carId);
                return car.id == carId;
            });
            console.log('Found selected car:', this.selectedCar);
        } catch (error) {
            console.error('Error loading cars:', error);
            const testCars = this.getTestCars();
            this.selectedCar = testCars.find(car => car.id == carId);
            console.log('Using test car:', this.selectedCar);
        }

        if (!this.selectedCar) {
            console.error('No car found for ID:', carId);
            return;
        }

        console.log('Setting selected car:', this.selectedCar);

        // Update UI
        const carSelection = document.getElementById('car-selection');
        const selectedCarInfo = document.getElementById('selected-car-info');
        const maintenanceSection = document.getElementById('maintenance-section');

        if (carSelection) carSelection.style.display = 'none';
        if (selectedCarInfo) selectedCarInfo.style.display = 'flex';
        if (maintenanceSection) maintenanceSection.style.display = 'block';

        // Update car image using the same logic as other parts of the app
        const carImage = document.getElementById('car-image');
        if (carImage) {
            if (this.selectedCar.img && this.selectedCar.img.startsWith('data:image/')) {
                // User uploaded image
                carImage.src = this.selectedCar.img;
                carImage.alt = this.selectedCar.name || 'car image';
            } else if (this.selectedCar.img && this.selectedCar.img.length === 1) {
                // Emoji fallback
                carImage.src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='60'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='40'>${encodeURIComponent(this.selectedCar.img)}</text></svg>`;
                carImage.alt = this.selectedCar.name || 'car image';
            } else {
                // Default car emoji
                carImage.src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='60'><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='40'>🚗</text></svg>`;
                carImage.alt = 'car image';
            }
        }
        const carNameElement = document.getElementById('car-name');
        if (carNameElement) {
            carNameElement.textContent = this.selectedCar.name;
        } else {
            console.warn('Car name element not found');
        }

        // Update UI state
        this.updateUIState();

        // Load maintenance data for this car
        await this.loadMaintenanceData();
        this.closeCarSelectionPopup();
    }

    updateUIState() {
        const hasSelectedCar = this.selectedCar && this.selectedCar.id;
        
        // Update add buttons state
        const addButtons = document.querySelectorAll('#add-maintenance-btn, #add-maintenance-bottom-btn');
        addButtons.forEach(btn => {
            if (btn) {
                btn.disabled = !hasSelectedCar;
                btn.style.opacity = hasSelectedCar ? '1' : '0.5';
                btn.style.cursor = hasSelectedCar ? 'pointer' : 'not-allowed';
            }
        });
    }

    async loadMaintenanceData() {
        if (!this.selectedCar || !this.selectedCar.id) {
            console.error('No car selected for loading maintenance data');
            this.maintenanceData = [];
            this.renderMaintenanceTable();
            return;
        }

        try {
            // Try to load from backend
            const data = await DataService.getCarReglament(this.selectedCar.id);
            this.maintenanceData = Array.isArray(data) ? data : [];
            console.log('Loaded maintenance data:', this.maintenanceData);
        } catch (error) {
            console.error('Error loading maintenance data:', error);
            // Fallback to test data for development
            this.maintenanceData = this.getTestReglament();
        }
        this.renderMaintenanceTable();
    }

    getTestReglament() {
        return [
            {
                "operation": "Замена моторного масла и фильтра",
                "mileage": "10000",
                "period": "6",
                "notes": "Обязательно масло 0W-20/5W-30. При тяжёлых условиях - сократить до 8000 км"
            },
            {
                "operation": "Диагностика цепи ГРМ и натяжителя",
                "mileage": "60000",
                "period": "48",
                "notes": "Проверка натяжения цепи, износ направляющих и натяжителя. Обязательно при появлении шумов"
            },
            {
                "operation": "Замена воздушного фильтра двигателя",
                "mileage": "30000",
                "period": "24",
                "notes": "Критично для K24A1 из-за прямого забора воздуха"
            }
        ];
    }

    renderMaintenanceTable() {
        const tbody = document.getElementById('maintenance-tbody');
        if (!tbody) {
            console.error('Maintenance table body not found');
            return;
        }

        if (!Array.isArray(this.maintenanceData)) {
            console.error('Maintenance data is not an array:', this.maintenanceData);
            this.maintenanceData = [];
        }

        tbody.innerHTML = this.maintenanceData.map((item, index) => {
            // Ensure item has all required properties
            const safeItem = {
                operation: item.operation || '',
                mileage: item.mileage || '',
                period: item.period || '',
                notes: item.notes || ''
            };
            
            return `
                <tr>
                    <td>${safeItem.operation}</td>
                    <td>${safeItem.mileage}</td>
                    <td>${safeItem.period}</td>
                    <td>${safeItem.notes}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-warning edit-maintenance-btn" data-index="${index}">
                                ✏️
                            </button>
                            <button class="btn btn-danger delete-maintenance-btn" data-index="${index}">
                                🗑️
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    showMaintenancePopup(index = -1) {
        console.log('showMaintenancePopup called with index:', index);
        console.log('Current selectedCar:', this.selectedCar);
        
        // Check if a car is selected for add operations
        if (index === -1 && (!this.selectedCar || !this.selectedCar.id)) {
            console.error('No car selected for add operation');
            this.showErrorMessage('Пожалуйста, выберите автомобиль сначала');
            return;
        }

        this.editingIndex = index;
        console.log('Set editingIndex to:', this.editingIndex);
        
        const popup = document.getElementById('maintenance-popup');
        const title = document.getElementById('maintenance-popup-title');
        const form = document.getElementById('maintenance-form');

        if (!popup || !title || !form) {
            console.error('Required popup elements not found');
            return;
        }

        if (index >= 0) {
            // Edit mode - check bounds
            if (!this.maintenanceData || !Array.isArray(this.maintenanceData) || index >= this.maintenanceData.length) {
                console.error('Invalid maintenance data index:', index, 'Data length:', this.maintenanceData?.length);
                this.showErrorMessage('Ошибка: данные не найдены');
                return;
            }

            title.textContent = 'Редактировать операцию';
            const item = this.maintenanceData[index];
            console.log('Editing item:', item);
            
            const operationInput = document.getElementById('operation-input');
            const mileageInput = document.getElementById('mileage-input');
            const periodInput = document.getElementById('period-input');
            const notesInput = document.getElementById('notes-input');
            
            if (operationInput) operationInput.value = item.operation || '';
            if (mileageInput) mileageInput.value = item.mileage || '';
            if (periodInput) periodInput.value = item.period || '';
            if (notesInput) notesInput.value = item.notes || '';
        } else {
            // Add mode
            title.textContent = 'Добавить операцию';
            form.reset();
        }

        popup.style.display = 'flex';
    }

    closeMaintenancePopup() {
        const popup = document.getElementById('maintenance-popup');
        if (popup) popup.style.display = 'none';
        this.editingIndex = -1;
    }

    closeConfirmationDialog() {
        const dialog = document.getElementById('confirmation-dialog');
        if (dialog) dialog.style.display = 'none';
    }

    async handleMaintenanceSubmit(e) {
        e.preventDefault();

        console.log('handleMaintenanceSubmit called, editingIndex:', this.editingIndex);
        console.log('Current maintenanceData length:', this.maintenanceData.length);

        // Check if a car is selected
        if (!this.selectedCar || !this.selectedCar.id) {
            this.showErrorMessage('Пожалуйста, выберите автомобиль сначала');
            return;
        }

        const newItem = {
            operation: document.getElementById('operation-input').value,
            mileage: document.getElementById('mileage-input').value,
            period: document.getElementById('period-input').value,
            notes: document.getElementById('notes-input').value
        };

        console.log('New item data:', newItem);

        if (this.editingIndex >= 0) {
            // Edit existing item
            console.log('Editing existing item at index:', this.editingIndex);
            console.log('Original item:', this.maintenanceData[this.editingIndex]);
            this.maintenanceData[this.editingIndex] = newItem;
            console.log('Updated item:', this.maintenanceData[this.editingIndex]);
        } else {
            // Add new item
            console.log('Adding new item');
            this.maintenanceData.push(newItem);
        }

        console.log('Final maintenanceData length:', this.maintenanceData.length);

        // Save to backend
        try {
            const result = await DataService.saveCarReglament(this.selectedCar.id, this.maintenanceData);
            console.log('Maintenance data saved successfully:', result);
            
            // Show success message
            this.showSuccessMessage(this.editingIndex >= 0 ? 'Операция обновлена' : 'Операция добавлена');
        } catch (error) {
            console.error('Error saving maintenance data:', error);
            // Show error message but continue with local data for development
            this.showErrorMessage('Ошибка сохранения: ' + error.message);
        }

        this.renderMaintenanceTable();
        this.closeMaintenancePopup();
    }

    showSuccessMessage(message) {
        // Create a temporary success message
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 1rem;
            border-radius: 4px;
            z-index: 10001;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        successDiv.textContent = message;
        document.body.appendChild(successDiv);
        
        setTimeout(() => {
            if (document.body.contains(successDiv)) {
                document.body.removeChild(successDiv);
            }
        }, 3000);
    }

    showErrorMessage(message) {
        // Create a temporary error message
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 1rem;
            border-radius: 4px;
            z-index: 10001;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
            }
        }, 5000);
    }

    editMaintenance(index) {
        console.log('editMaintenance called with index:', index);
        console.log('Current maintenanceData:', this.maintenanceData);
        
        // Check bounds before showing popup
        if (!this.maintenanceData || !Array.isArray(this.maintenanceData) || index >= this.maintenanceData.length) {
            console.error('Invalid maintenance data index for editing:', index, 'Data length:', this.maintenanceData?.length);
            this.showErrorMessage('Ошибка: данные не найдены');
            return;
        }
        
        console.log('Calling showMaintenancePopup with index:', index);
        this.showMaintenancePopup(index);
    }

    deleteMaintenance(index) {
        console.log('deleteMaintenance called with index:', index);
        
        // Check if a car is selected
        if (!this.selectedCar || !this.selectedCar.id) {
            this.showErrorMessage('Пожалуйста, выберите автомобиль сначала');
            return;
        }

        // Check bounds
        if (!this.maintenanceData || !Array.isArray(this.maintenanceData) || index >= this.maintenanceData.length) {
            console.error('Invalid maintenance data index for deletion:', index, 'Data length:', this.maintenanceData?.length);
            this.showErrorMessage('Ошибка: данные не найдены');
            return;
        }

        console.log('Showing confirmation dialog for deletion');

        // Use existing confirmation dialog
        const confirmationDialog = document.getElementById('confirmation-dialog');
        const confirmYes = document.getElementById('confirm-yes');
        const confirmNo = document.getElementById('confirm-no');
        const confirmationMessage = document.getElementById('confirmation-message');

        if (!confirmationDialog || !confirmYes || !confirmNo || !confirmationMessage) {
            console.error('Confirmation dialog elements not found');
            return;
        }

        // Set the message
        confirmationMessage.textContent = 'Вы уверены, что хотите удалить эту операцию?';

        // Show the dialog
        confirmationDialog.style.display = 'flex';

        // Create one-time event listeners
        const handleConfirm = async () => {
            console.log('Delete confirmed, removing item at index:', index);
            
            // Remove event listeners
            confirmYes.removeEventListener('click', handleConfirm);
            confirmNo.removeEventListener('click', handleCancel);
            
            // Hide dialog
            confirmationDialog.style.display = 'none';

            // Perform deletion
            this.maintenanceData.splice(index, 1);
            
            // Save to backend
            try {
                const result = await DataService.saveCarReglament(this.selectedCar.id, this.maintenanceData);
                console.log('Maintenance data saved after deletion:', result);
                this.showSuccessMessage('Операция удалена');
            } catch (error) {
                console.error('Error saving maintenance data after deletion:', error);
                this.showErrorMessage('Ошибка сохранения: ' + error.message);
            }
            
            this.renderMaintenanceTable();
        };

        const handleCancel = () => {
            console.log('Delete cancelled');
            
            // Remove event listeners
            confirmYes.removeEventListener('click', handleConfirm);
            confirmNo.removeEventListener('click', handleCancel);
            
            // Hide dialog
            confirmationDialog.style.display = 'none';
        };

        // Add event listeners
        confirmYes.addEventListener('click', handleConfirm);
        confirmNo.addEventListener('click', handleCancel);

        // Close on overlay click
        const handleOverlayClick = (e) => {
            if (e.target === confirmationDialog) {
                console.log('Delete cancelled by overlay click');
                confirmationDialog.removeEventListener('click', handleOverlayClick);
                confirmYes.removeEventListener('click', handleConfirm);
                confirmNo.removeEventListener('click', handleCancel);
                confirmationDialog.style.display = 'none';
            }
        };
        confirmationDialog.addEventListener('click', handleOverlayClick);
    }
}

// Global functions for onclick handlers
window.closeCarSelectionPopup = function() {
    window.reglamentUI?.closeCarSelectionPopup();
};

window.closeMaintenancePopup = function() {
    window.reglamentUI?.closeMaintenancePopup();
};

window.closeConfirmationDialog = function() {
    window.reglamentUI?.closeConfirmationDialog();
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing ReglamentUI...');
    window.reglamentUI = new ReglamentUI();
    
    console.log('ReglamentUI initialized successfully');
}); 