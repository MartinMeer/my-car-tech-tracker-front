import { CONFIG } from './config.js';
import { DataService } from './dataService.js';
import { pageMap, loadPage } from './router.js';
import { showConfirmationDialog } from './dialogs.js';
import { initializeMyCarsUI, initializeAddCarUI, updateCarSelectionUI } from './carsUI.js';
import {
  initializeCarOverviewUI,
  initializeServiceCardUI,
  renderMaintenHistory,
  openMaintPopup,
  closeMaintPopup,
  calculateMaintTotal,
  saveMaintenance
} from './maintenanceUI.js';
import {
  renderRepairHistory,
  openRepairPopup,
  closeRepairPopup,
  openSparePopup,
  closeSparePopup,
  addSpare,
  calculateRepairTotal,
  saveRepair
} from './repairUI.js';

// Main content element
const mainContent = document.getElementById('main-content');

// Make functions available globally for HTML onclick handlers
window.openMaintPopup = openMaintPopup;
window.closeMaintPopup = closeMaintPopup;
window.calculateMaintTotal = calculateMaintTotal;
window.saveMaintenance = saveMaintenance;
window.openRepairPopup = openRepairPopup;
window.closeRepairPopup = closeRepairPopup;
window.openSparePopup = openSparePopup;
window.closeSparePopup = closeSparePopup;
window.addSpare = addSpare;
window.calculateRepairTotal = calculateRepairTotal;
window.saveRepair = saveRepair;

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
      initializeServiceCardUI();
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

// Initial page load
window.addEventListener('DOMContentLoaded', () => {
  loadPage(window.location.hash || '#my-car-overview', mainContent, initializePageUI);
  
  // Initialize car selection UI
  updateCarSelectionUI();
  
  // Car image dropdown functionality
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
});

// Hash navigation
window.addEventListener('hashchange', () => {
  loadPage(window.location.hash, mainContent, initializePageUI);
  
  // Hide car selection popup on navigation
  const carSelectMenu = document.getElementById('car-select-menu');
  if (carSelectMenu) {
    carSelectMenu.style.display = 'none';
  }
});

// Export for testing or further extension
export { mainContent, initializePageUI }; 