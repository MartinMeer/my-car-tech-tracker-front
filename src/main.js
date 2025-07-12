import { CONFIG } from './config.js';
import { DataService } from './dataService.js';
import { pageMap, loadPage } from './router.js';
import { showConfirmationDialog } from './dialogs.js';
import { initializeMyCarsUI, initializeAddCarUI, updateCarSelectionUI, removeCarFromBackend } from './carsUI.js';
import {
  initializeCarOverviewUI,
  initializeServiceCardUI,
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
import { initializeServiceRecord } from './serviceRecordManager.js';

// Main content element
const mainContent = document.getElementById('main-content');

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
      initializeServiceCardUI();
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