import { DataService } from './dataService.js';

class MaintenancePlanUI {
    constructor() {
        this.currentCar = null;
        this.draftData = null;
        this.autoSaveInterval = null;
        this.editingRow = null;
        
        this.init();
    }

    async init() {
        await this.loadCarData();
        this.setupEventListeners();
        this.loadDraft();
        this.startAutoSave();
        this.updateDisplay();
    }

    async loadCarData() {
        try {
            const carId = this.getCarIdFromUrl();
            if (carId) {
                this.currentCar = await DataService.getCar(carId);
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
        // Add row buttons
        document.getElementById('add-maintenance-row').addEventListener('click', () => {
            this.addRow('maintenance');
        });
        
        document.getElementById('add-repairs-row').addEventListener('click', () => {
            this.addRow('repairs');
        });

        // Action buttons
        document.getElementById('save-plan-btn').addEventListener('click', () => {
            this.savePlan();
        });

        document.getElementById('cancel-plan-btn').addEventListener('click', () => {
            this.cancelPlan();
        });

        // PDF Export button
        document.getElementById('export-pdf-btn').addEventListener('click', async () => {
            const exportBtn = document.getElementById('export-pdf-btn');
            const originalText = exportBtn.textContent;
            exportBtn.textContent = 'Создание PDF...';
            exportBtn.disabled = true;
            
            try {
                // Debug: Check library availability
                console.log('html2pdf available:', typeof window.html2pdf !== 'undefined');
                if (window.html2pdf) console.log('html2pdf object:', window.html2pdf);
                
                await this.exportToPDF();
            } finally {
                exportBtn.textContent = originalText;
                exportBtn.disabled = false;
            }
        });

        // Test PDF button
        document.getElementById('test-pdf-btn').addEventListener('click', async () => {
            // First test the HTML content generation
            const currentDate = new Date().toLocaleDateString('ru-RU');
            const carName = this.currentCar?.name || 'Автомобиль';
            const currentMileage = this.currentCar?.currentMileage || 0;
            
            const testContent = this.createPDFHTML(currentDate, carName, currentMileage);
            console.log('Generated HTML content:', testContent);
            
            // Show content in a popup for debugging
            const popup = window.open('', '_blank', 'width=800,height=600');
            popup.document.write(testContent);
            popup.document.close();
            
            const success = await this.testPDFExport();
            if (success) {
                this.showMessage('Тест PDF успешен!', 'success');
            } else {
                this.showMessage('Тест PDF не удался', 'error');
            }
        });

        // Confirmation modal
        document.getElementById('confirm-yes').addEventListener('click', () => {
            this.confirmDelete();
        });

        document.getElementById('confirm-no').addEventListener('click', () => {
            this.hideConfirmModal();
        });

        // Close modal on outside click
        document.getElementById('confirm-modal').addEventListener('click', (e) => {
            if (e.target.id === 'confirm-modal') {
                this.hideConfirmModal();
            }
        });
    }

    updateDisplay() {
        // Set current date
        const currentDate = new Date().toLocaleDateString('ru-RU');
        document.getElementById('current-date').textContent = currentDate;

        // Set current mileage
        if (this.currentCar && this.currentCar.currentMileage) {
            document.getElementById('current-mileage').textContent = this.currentCar.currentMileage;
        } else {
            document.getElementById('current-mileage').textContent = '0';
        }

        // Render tables
        this.renderTable('maintenance');
        this.renderTable('repairs');
    }

    renderTable(tableType) {
        const tbody = document.getElementById(`${tableType}-tbody`);
        const data = this.draftData?.[tableType] || [];
        
        tbody.innerHTML = '';
        
        data.forEach((row, index) => {
            const tr = this.createTableRow(row, index, tableType);
            tbody.appendChild(tr);
        });
    }

    createTableRow(row, index, tableType) {
        const tr = document.createElement('tr');
        tr.dataset.rowId = row.id;
        tr.dataset.tableType = tableType;
        
        tr.innerHTML = `
            <td class="row-number">${index + 1}</td>
            <td class="operation-cell">
                <span class="display-text">${row.operation || ''}</span>
                <input type="text" class="edit-input" value="${row.operation || ''}" style="display: none;">
            </td>
            <td class="resources-cell">
                <span class="display-text">${row.resources || ''}</span>
                <input type="text" class="edit-input" value="${row.resources || ''}" style="display: none;">
            </td>
            <td class="notes-cell">
                <span class="display-text">${row.notes || ''}</span>
                <textarea class="edit-input" style="display: none;">${row.notes || ''}</textarea>
            </td>
            <td class="actions-cell">
                <button class="edit-row-btn" title="Изменить">
                    <span class="btn-icon">✏️</span>
                </button>
                <button class="delete-row-btn" title="Удалить">
                    <span class="btn-icon">🗑️</span>
                </button>
                <button class="save-row-btn" title="Сохранить" style="display: none;">
                    <span class="btn-icon">💾</span>
                </button>
                <button class="cancel-row-btn" title="Отмена" style="display: none;">
                    <span class="btn-icon">❌</span>
                </button>
            </td>
        `;

        // Add event listeners
        this.addRowEventListeners(tr, tableType);
        
        return tr;
    }

    addRowEventListeners(tr, tableType) {
        const editBtn = tr.querySelector('.edit-row-btn');
        const deleteBtn = tr.querySelector('.delete-row-btn');
        const saveBtn = tr.querySelector('.save-row-btn');
        const cancelBtn = tr.querySelector('.cancel-row-btn');

        editBtn.addEventListener('click', () => {
            this.startRowEdit(tr);
        });

        deleteBtn.addEventListener('click', () => {
            this.deleteRow(tr);
        });

        saveBtn.addEventListener('click', () => {
            this.saveRowEdit(tr);
        });

        cancelBtn.addEventListener('click', () => {
            this.cancelRowEdit(tr);
        });
    }

    startRowEdit(tr) {
        if (this.editingRow && this.editingRow !== tr) {
            this.cancelRowEdit(this.editingRow);
        }

        this.editingRow = tr;
        
        // Hide display elements and show edit inputs
        tr.querySelectorAll('.display-text').forEach(el => el.style.display = 'none');
        tr.querySelectorAll('.edit-input').forEach(el => el.style.display = 'block');
        
        // Show/hide action buttons
        tr.querySelector('.edit-row-btn').style.display = 'none';
        tr.querySelector('.delete-row-btn').style.display = 'none';
        tr.querySelector('.save-row-btn').style.display = 'inline-block';
        tr.querySelector('.cancel-row-btn').style.display = 'inline-block';
    }

    saveRowEdit(tr) {
        const tableType = tr.dataset.tableType;
        const rowId = tr.dataset.rowId;
        
        // Get values from inputs
        const operation = tr.querySelector('.operation-cell .edit-input').value;
        const resources = tr.querySelector('.resources-cell .edit-input').value;
        const notes = tr.querySelector('.notes-cell .edit-input').value;

        // Update data
        const rowIndex = this.draftData[tableType].findIndex(row => row.id === rowId);
        if (rowIndex !== -1) {
            this.draftData[tableType][rowIndex] = {
                ...this.draftData[tableType][rowIndex],
                operation,
                resources,
                notes
            };
        }

        // Exit edit mode
        this.exitRowEdit(tr);
        this.saveDraft();
    }

    cancelRowEdit(tr) {
        // Restore original values
        const tableType = tr.dataset.tableType;
        const rowId = tr.dataset.rowId;
        const originalRow = this.draftData[tableType].find(row => row.id === rowId);
        
        if (originalRow) {
            tr.querySelector('.operation-cell .edit-input').value = originalRow.operation || '';
            tr.querySelector('.resources-cell .edit-input').value = originalRow.resources || '';
            tr.querySelector('.notes-cell .edit-input').value = originalRow.notes || '';
        }

        this.exitRowEdit(tr);
    }

    exitRowEdit(tr) {
        // Show display elements and hide edit inputs
        tr.querySelectorAll('.display-text').forEach(el => el.style.display = 'block');
        tr.querySelectorAll('.edit-input').forEach(el => el.style.display = 'none');
        
        // Show/hide action buttons
        tr.querySelector('.edit-row-btn').style.display = 'inline-block';
        tr.querySelector('.delete-row-btn').style.display = 'inline-block';
        tr.querySelector('.save-row-btn').style.display = 'none';
        tr.querySelector('.cancel-row-btn').style.display = 'none';

        // Update display text
        const operation = tr.querySelector('.operation-cell .edit-input').value;
        const resources = tr.querySelector('.resources-cell .edit-input').value;
        const notes = tr.querySelector('.notes-cell .edit-input').value;

        tr.querySelector('.operation-cell .display-text').textContent = operation;
        tr.querySelector('.resources-cell .display-text').textContent = resources;
        tr.querySelector('.notes-cell .display-text').textContent = notes;

        this.editingRow = null;
    }

    deleteRow(tr) {
        this.showConfirmModal('Вы уверены, что хотите удалить эту строку?', () => {
            const tableType = tr.dataset.tableType;
            const rowId = tr.dataset.rowId;
            
            this.draftData[tableType] = this.draftData[tableType].filter(row => row.id !== rowId);
            tr.remove();
            this.saveDraft();
            this.updateRowNumbers(tableType);
        });
    }

    updateRowNumbers(tableType) {
        const tbody = document.getElementById(`${tableType}-tbody`);
        const rows = tbody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            row.querySelector('.row-number').textContent = index + 1;
        });
    }

    addRow(tableType) {
        const newRow = {
            id: this.generateId(),
            operation: '',
            resources: '',
            notes: '',
            createdAt: new Date().toISOString()
        };

        if (!this.draftData[tableType]) {
            this.draftData[tableType] = [];
        }
        
        this.draftData[tableType].push(newRow);
        this.renderTable(tableType);
        this.saveDraft();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    loadDraft() {
        const carId = this.getCarIdFromUrl();
        const draftKey = `maintenance_plan_draft_${carId}`;
        
        try {
            const savedDraft = localStorage.getItem(draftKey);
            this.draftData = savedDraft ? JSON.parse(savedDraft) : {
                maintenance: [],
                repairs: [],
                carId: carId,
                lastModified: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error loading draft:', error);
            this.draftData = {
                maintenance: [],
                repairs: [],
                carId: carId,
                lastModified: new Date().toISOString()
            };
        }
    }

    saveDraft() {
        const carId = this.getCarIdFromUrl();
        const draftKey = `maintenance_plan_draft_${carId}`;
        
        this.draftData.lastModified = new Date().toISOString();
        
        try {
            localStorage.setItem(draftKey, JSON.stringify(this.draftData));
        } catch (error) {
            console.error('Error saving draft:', error);
        }
    }

    startAutoSave() {
        this.autoSaveInterval = setInterval(() => {
            if (this.draftData) {
                this.saveDraft();
            }
        }, 30000); // Auto-save every 30 seconds
    }

    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    async savePlan() {
        try {
            const carId = this.getCarIdFromUrl();
            if (!carId) {
                throw new Error('Car ID not found');
            }

            const planData = {
                carId: carId,
                date: new Date().toISOString(),
                mileage: this.currentCar?.currentMileage || 0,
                maintenance: this.draftData.maintenance,
                repairs: this.draftData.repairs,
                status: 'saved'
            };

            // Save to backend
            await DataService.saveMaintenancePlan(planData);
            
            // Export to PDF automatically when saving
            await this.exportToPDF();
            
            // Clear draft
            this.clearDraft();
            
            // Show success message
            this.showMessage('План успешно сохранен и экспортирован в PDF', 'success');
            
                        // Redirect back to car overview
            setTimeout(() => {
              window.location.hash = `#my-car-overview?car=${carId}`;
            }, 2000);
            
        } catch (error) {
            console.error('Error saving plan:', error);
            this.showMessage('Ошибка при сохранении плана', 'error');
        }
    }

    cancelPlan() {
        this.showConfirmModal('Вы уверены, что хотите отменить создание плана? Все несохраненные изменения будут потеряны.', () => {
            this.clearDraft();
            const carId = this.getCarIdFromUrl();
            window.location.hash = `#my-car-overview?car=${carId}`;
        });
    }

    clearDraft() {
        const carId = this.getCarIdFromUrl();
        const draftKey = `maintenance_plan_draft_${carId}`;
        localStorage.removeItem(draftKey);
    }

    showConfirmModal(message, onConfirm) {
        document.getElementById('confirm-message').textContent = message;
        document.getElementById('confirm-modal').style.display = 'flex';
        
        // Store confirmation callback
        this.confirmCallback = onConfirm;
    }

    hideConfirmModal() {
        document.getElementById('confirm-modal').style.display = 'none';
        this.confirmCallback = null;
    }

    confirmDelete() {
        if (this.confirmCallback) {
            this.confirmCallback();
        }
        this.hideConfirmModal();
    }

    showMessage(message, type = 'info') {
        // Create temporary message element
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            border-radius: 5px;
            color: white;
            z-index: 1000;
            ${type === 'success' ? 'background-color: #28a745;' : ''}
            ${type === 'error' ? 'background-color: #dc3545;' : ''}
            ${type === 'info' ? 'background-color: #17a2b8;' : ''}
        `;
        
        document.body.appendChild(messageEl);
        
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }

    async exportToPDF() {
        try {
            // Check if html2pdf is available
            if (typeof window.html2pdf === 'undefined') {
                this.showMessage('Ошибка: библиотека PDF недоступна', 'error');
                return;
            }

            // Check if there's any data to export
            const hasMaintenanceData = this.draftData.maintenance && this.draftData.maintenance.length > 0;
            const hasRepairsData = this.draftData.repairs && this.draftData.repairs.length > 0;
            
            if (!hasMaintenanceData && !hasRepairsData) {
                // Add sample data for testing
                this.draftData.maintenance = [
                    { id: '1', operation: 'Замена масла', resources: 'Масло 5W-30, фильтр', notes: 'Каждые 10,000 км' },
                    { id: '2', operation: 'Замена тормозных колодок', resources: 'Тормозные колодки', notes: 'При износе' }
                ];
                this.draftData.repairs = [
                    { id: '1', operation: 'Ремонт подвески', resources: 'Амортизаторы, пружины', notes: 'При стуке' }
                ];
                console.log('Added sample data for PDF test');
            }

            // Get current date and car info
            const currentDate = new Date().toLocaleDateString('ru-RU');
            const carName = this.currentCar?.name || 'Автомобиль';
            const currentMileage = this.currentCar?.currentMileage || 0;

            // Create HTML content for PDF
            const pdfContent = this.createPDFHTML(currentDate, carName, currentMileage);

            // Create a new window for PDF generation
            const pdfWindow = window.open('', '_blank', 'width=800,height=600');
            pdfWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>PDF Export</title>
                    <style>
                        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
                    </style>
                </head>
                <body>
                    ${pdfContent}
                </body>
                </html>
            `);
            pdfWindow.document.close();

            // Wait for the window to load
            await new Promise(resolve => setTimeout(resolve, 500));

            // Configure html2pdf options
            const options = {
                margin: [10, 10, 10, 10],
                filename: `maintenance_plan_${carName}_${currentDate.replace(/\./g, '-')}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    logging: true
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait' 
                }
            };

            console.log('Starting PDF generation from new window...');

            // Generate PDF from the new window
            await window.html2pdf().from(pdfWindow.document.body).set(options).save();

            // Close the window
            pdfWindow.close();
            
            this.showMessage('PDF успешно экспортирован', 'success');
            
        } catch (error) {
            console.error('Error exporting PDF:', error);
            this.showMessage('Ошибка при экспорте PDF: ' + error.message, 'error');
        }
    }

    createPDFHTML(currentDate, carName, currentMileage) {
        let html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; background-color: white; color: black;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #333; margin-bottom: 10px; font-size: 24px;">План технического обслуживания</h1>
                    <div style="color: #666; font-size: 14px;">
                        <p style="margin: 5px 0;"><strong>Автомобиль:</strong> ${carName}</p>
                        <p style="margin: 5px 0;"><strong>Дата:</strong> ${currentDate}</p>
                        <p style="margin: 5px 0;"><strong>Текущий пробег:</strong> ${currentMileage} км</p>
                    </div>
                </div>
        `;

        // Add maintenance table
        if (this.draftData.maintenance && this.draftData.maintenance.length > 0) {
            html += `
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 5px;">
                        Периодическое техническое обслуживание
                    </h2>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                        <thead>
                            <tr style="background-color: #f8f9fa;">
                                <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left; width: 5%;">№</th>
                                <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left; width: 35%;">Операция</th>
                                <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left; width: 25%;">Ресурсы</th>
                                <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left; width: 35%;">Примечания</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            this.draftData.maintenance.forEach((row, index) => {
                html += `
                    <tr>
                        <td style="border: 1px solid #dee2e6; padding: 8px; text-align: center;">${index + 1}</td>
                        <td style="border: 1px solid #dee2e6; padding: 8px;">${row.operation || ''}</td>
                        <td style="border: 1px solid #dee2e6; padding: 8px;">${row.resources || ''}</td>
                        <td style="border: 1px solid #dee2e6; padding: 8px;">${row.notes || ''}</td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;
        }

        // Add repairs table
        if (this.draftData.repairs && this.draftData.repairs.length > 0) {
            html += `
                <div style="margin-bottom: 30px;">
                    <h2 style="color: #333; border-bottom: 2px solid #dc3545; padding-bottom: 5px;">
                        Ремонтные работы
                    </h2>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                        <thead>
                            <tr style="background-color: #f8f9fa;">
                                <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left; width: 5%;">№</th>
                                <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left; width: 35%;">Операция</th>
                                <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left; width: 25%;">Ресурсы</th>
                                <th style="border: 1px solid #dee2e6; padding: 8px; text-align: left; width: 35%;">Примечания</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            this.draftData.repairs.forEach((row, index) => {
                html += `
                    <tr>
                        <td style="border: 1px solid #dee2e6; padding: 8px; text-align: center;">${index + 1}</td>
                        <td style="border: 1px solid #dee2e6; padding: 8px;">${row.operation || ''}</td>
                        <td style="border: 1px solid #dee2e6; padding: 8px;">${row.resources || ''}</td>
                        <td style="border: 1px solid #dee2e6; padding: 8px;">${row.notes || ''}</td>
                    </tr>
                `;
            });

            html += `
                        </tbody>
                    </table>
                </div>
            `;
        }

        html += `
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #666; font-size: 12px;">
                    Создано: ${currentDate}
                </div>
            </div>
        `;

        return html;
    }



    // Test function for debugging PDF export
    async testPDFExport() {
        try {
            console.log('Testing PDF export...');
            
            // Check if html2pdf is available
            if (typeof window.html2pdf === 'undefined') {
                console.log('No html2pdf library found');
                return false;
            }

            // Create a simple test HTML content
            const testContent = `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: white; color: black;">
                    <h1 style="color: #333; font-size: 24px;">Тест PDF экспорта</h1>
                    <p style="color: #666;">Это тестовый документ для проверки работы html2pdf.js</p>
                    <p style="color: #666;">Русский текст: План технического обслуживания</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr style="background-color: #f8f9fa;">
                            <th style="border: 1px solid #dee2e6; padding: 8px;">№</th>
                            <th style="border: 1px solid #dee2e6; padding: 8px;">Операция</th>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #dee2e6; padding: 8px;">1</td>
                            <td style="border: 1px solid #dee2e6; padding: 8px;">Замена масла</td>
                        </tr>
                    </table>
                </div>
            `;

            // Create a new window for PDF generation
            const pdfWindow = window.open('', '_blank', 'width=800,height=600');
            pdfWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Test PDF Export</title>
                    <style>
                        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
                    </style>
                </head>
                <body>
                    ${testContent}
                </body>
                </html>
            `);
            pdfWindow.document.close();

            // Wait for the window to load
            await new Promise(resolve => setTimeout(resolve, 500));

            // Configure options
            const options = {
                margin: [10, 10, 10, 10],
                filename: 'test.pdf',
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2,
                    useCORS: true,
                    letterRendering: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    logging: true
                },
                jsPDF: { 
                    unit: 'mm', 
                    format: 'a4', 
                    orientation: 'portrait' 
                }
            };

            console.log('Starting test PDF generation from new window...');

            // Generate PDF from the new window
            await window.html2pdf().from(pdfWindow.document.body).set(options).save();
            
            console.log('PDF test successful');
            pdfWindow.close();
            return true;
        } catch (error) {
            console.error('PDF test failed:', error);
            return false;
        }
    }
}

// Export the class for use in main.js
export { MaintenancePlanUI }; 