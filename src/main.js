import { CONFIG } from './config.js';
import { DataService } from './dataService.js';
import { pageMap, loadPage } from './router.js';
import { showConfirmationDialog } from './dialogs.js';
import { initializeMyCarsUI, initializeAddCarUI, updateCarSelectionUI, removeCarFromBackend } from './carsUI.js';
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
  // Always default to #my-cars if no hash
  if (!window.location.hash || window.location.hash === '#') {
    window.location.hash = '#my-cars';
  }
  loadPage(window.location.hash, mainContent, initializePageUI);
  // Always update car selection UI and dropdown
  updateCarSelectionUI();
  // Dropdown menu for 'Мои машины' link
  const myCarsLink = document.getElementById('my-cars-link');
  const carSelectMenu = document.getElementById('car-select-menu');
  if (myCarsLink && carSelectMenu) {
    myCarsLink.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      carSelectMenu.style.display = carSelectMenu.style.display === 'block' ? 'none' : 'block';
    };
    document.addEventListener('click', function(e) {
      if (!carSelectMenu.contains(e.target) && e.target !== myCarsLink) {
        carSelectMenu.style.display = 'none';
      }
    });
  }
});

// Hash navigation
window.addEventListener('hashchange', () => {
  loadPage(window.location.hash, mainContent, initializePageUI);
  // Always update car selection UI and dropdown
  updateCarSelectionUI();
  // Hide car selection popup on navigation
  const carSelectMenu = document.getElementById('car-select-menu');
  if (carSelectMenu) {
    carSelectMenu.style.display = 'none';
  }
});

// Export for testing or further extension
export { mainContent, initializePageUI }; 