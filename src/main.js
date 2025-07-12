import { CONFIG } from './config.js';
import { DataService } from './dataService.js';
import { pageMap, loadPage } from './router.js';
import { showConfirmationDialog } from './dialogs.js';
import { initializeMyCarsUI, initializeAddCarUI, updateCarSelectionUI, removeCarFromBackend } from './carsUI.js';
import {
  initializeCarOverviewUI,
  renderMaintenHistory,
  renderServiceHistory,
  openMaintPopup,
  closeMaintPopup,
  calculateMaintTotal
} from './maintenanceUI.js';
import { initializeUserAlertUI, setupUserAlertForm } from './userAlertUI.js';
import {
  renderRepairHistory,
  openRepairPopup,
  closeRepairPopup,
  openSparePopup,
  closeSparePopup,
  addSpare,
  calculateRepairTotal
} from './repairUI.js';
import { 
  initializeServiceRecord, 
  addMaintenanceToRecord, 
  addRepairToRecord, 
  removeSubRecord, 
  editSubRecord 
} from './serviceRecordManager.js';

// Main content element
const mainContent = document.getElementById('main-content');

// Global variables for service card functionality
window.currentOperation = null;
window.sparesList = [];
window.spareCounter = 1;

// Make functions available globally for HTML onclick handlers
window.openMaintPopup = openMaintPopup;
window.closeMaintPopup = closeMaintPopup;
window.calculateMaintTotal = calculateMaintTotal;
window.openRepairPopup = openRepairPopup;
window.closeRepairPopup = closeRepairPopup;
window.openSparePopup = openSparePopup;
window.closeSparePopup = closeSparePopup;
window.addSpare = addSpare;
window.calculateRepairTotal = calculateRepairTotal;
window.removeCarFromBackend = removeCarFromBackend;
window.showConfirmationDialog = showConfirmationDialog;

// Service Record Manager functions
window.addMaintenanceToRecord = addMaintenanceToRecord;
window.addRepairToRecord = addRepairToRecord;
window.removeSubRecord = removeSubRecord;
window.editSubRecord = editSubRecord;

// Add save and remove functions for service record
window.saveServiceRecord = async function() {
  if (!window.currentServiceRecord || window.currentServiceRecord.subRecords.length === 0) {
    alert('Нет операций для сохранения');
    return;
  }
  
  // Validate date
  if (!window.currentServiceRecord.date || !/^\d{2}\.\d{2}\.\d{4}$/.test(window.currentServiceRecord.date)) {
    alert('Пожалуйста, введите корректную дату в формате дд.мм.гггг');
    return;
  }
  
  try {
    // First, save the service record itself
    const serviceRecordToSave = {
      id: window.currentServiceRecord.id,
      carId: window.currentServiceRecord.carId,
      date: window.currentServiceRecord.date,
      createdAt: window.currentServiceRecord.createdAt,
      subRecordsCount: window.currentServiceRecord.subRecords.length
    };
    
    await DataService.saveServiceRecord(serviceRecordToSave);
    
    // Then save each sub-record to appropriate storage
    const maintenanceRecords = [];
    const repairRecords = [];
    
    window.currentServiceRecord.subRecords.forEach(subRecord => {
      const recordData = {
        ...subRecord.data,
        id: subRecord.id,
        date: window.currentServiceRecord.date,
        serviceRecordId: window.currentServiceRecord.id
      };
      
      if (subRecord.type === 'maintenance') {
        maintenanceRecords.push(recordData);
      } else {
        repairRecords.push(recordData);
      }
    });
    
    // Save operations to backend/storage
    const savePromises = [];
    
    if (maintenanceRecords.length > 0) {
      savePromises.push(DataService.saveMaintenance(maintenanceRecords));
    }
    
    if (repairRecords.length > 0) {
      savePromises.push(DataService.saveRepair(repairRecords));
    }
    
    await Promise.all(savePromises);
    
    console.log('Service record and operations saved successfully');
    
    // Show success message
    alert('Запись об обслуживании сохранена!');
    
    // Navigate back to overview
    window.location.hash = '#my-car-overview';
    
  } catch (error) {
    console.error('Error saving service record:', error);
    alert('Ошибка сохранения: ' + error.message);
  }
};

window.removeServiceRecord = function() {
  if (!window.currentServiceRecord) {
    window.location.hash = '#my-car-overview';
    return;
  }
  
  const hasSubRecords = window.currentServiceRecord.subRecords.length > 0;
  
  showConfirmationDialog(
    hasSubRecords 
      ? 'Удалить запись? Все добавленные операции будут потеряны.'
      : 'Удалить запись?',
    () => {
      // Clear global reference
      window.currentServiceRecord = null;
      
      // Navigate back
      window.location.hash = '#my-car-overview';
      alert('Запись удалена');
    },
    () => {
      // User cancelled
    }
  );
};

// Add missing functions that are referenced in HTML
// Note: saveMaintenance and saveRepair functions are now handled by the service record system
// and are no longer needed as standalone functions

// UI initialization stub (to be replaced with real logic)
function initializePageUI(page) {
  switch(page) {
    case 'my-cars':
      initializeMyCarsUI();
      break;
    case 'add-car':
      initializeAddCarUI();
      break;
    case 'my-car-overview':
      initializeCarOverviewUI();
      break;
    case 'service-card':
      initializeServiceRecord();
      break;
    case 'service-history':
      renderServiceHistory();
      break;
    case 'user-alert':
      // User alert UI is initialized globally, just set up the form
      setupUserAlertForm();
      break;
    case 'mainten-history':
      renderMaintenHistory();
      break;
    case 'repair-history':
      renderRepairHistory();
      break;
    // TODO: Add more cases for other modules
    default:
      break;
  }
}

// Initialize the application
async function initializeApp() {
  try {
    // Load initial page
    const hash = window.location.hash || '#my-cars';
    await loadPage(hash, mainContent, initializePageUI);
    
    // Initialize car selection UI
    updateCarSelectionUI();
    
    // Initialize user alert UI (floating button) - available on all pages
    initializeUserAlertUI();
    
    // Setup hash change listener
    window.addEventListener('hashchange', async () => {
      await loadPage(window.location.hash, mainContent, initializePageUI);
      
      // Hide car selection popup on navigation
      const carSelectMenu = document.getElementById('car-select-menu');
      if (carSelectMenu) {
        carSelectMenu.style.display = 'none';
      }
    });
    
    // Setup car image dropdown
    setupCarImageDropdown();
    
    console.log('App initialized successfully');
  } catch (error) {
    console.error('Error initializing app:', error);
  }
}

// Setup car image dropdown functionality
function setupCarImageDropdown() {
  const carImgDiv = document.getElementById('current-car-img');
  const carSelectMenu = document.getElementById('car-select-menu');
  
  if (carImgDiv && carSelectMenu) {
    carImgDiv.onclick = function(e) {
      e.stopPropagation();
      carSelectMenu.style.display = carSelectMenu.style.display === 'block' ? 'none' : 'block';
    };
    
    document.addEventListener('click', function(e) {
      if (!carSelectMenu.contains(e.target) && e.target !== carImgDiv) {
        carSelectMenu.style.display = 'none';
      }
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp); 