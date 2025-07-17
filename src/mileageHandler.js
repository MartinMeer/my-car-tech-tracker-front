import { CONFIG } from './config.js';
import { DataService } from './dataService.js';

/**
 * Mileage Handler Service
 * Manages mileage data across the application
 * Supports both production (database) and development (localStorage) modes
 */
export class MileageHandler {
  constructor() {
    this.mileageData = [];
    this.isInitialized = false;
  }

  /**
   * Initialize the mileage handler
   */
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await this.loadMileageData();
      this.isInitialized = true;
      console.log('MileageHandler initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MileageHandler:', error);
      throw error;
    }
  }

  /**
   * Load mileage data from storage
   */
  async loadMileageData() {
    try {
      if (CONFIG.useBackend) {
        // Production mode - load from database
        const response = await fetch(`${CONFIG.apiUrl}/mileage`, {
          headers: DataService.getAuthHeaders(),
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to load mileage data from backend');
        }
        
        this.mileageData = await response.json();
      } else {
        // Development mode - load from localStorage
        const stored = localStorage.getItem('mileageData');
        this.mileageData = stored ? JSON.parse(stored) : [];
      }
    } catch (error) {
      console.error('Error loading mileage data:', error);
      this.mileageData = [];
    }
  }

  /**
   * Save mileage data to storage
   */
  async saveMileageData() {
    try {
      if (CONFIG.useBackend) {
        // Production mode - save to database
        const response = await fetch(`${CONFIG.apiUrl}/mileage`, {
          method: 'POST',
          headers: DataService.getAuthHeaders(),
          credentials: 'include',
          body: JSON.stringify(this.mileageData)
        });
        
        if (!response.ok) {
          throw new Error('Failed to save mileage data to backend');
        }
      } else {
        // Development mode - save to localStorage
        localStorage.setItem('mileageData', JSON.stringify(this.mileageData));
      }
    } catch (error) {
      console.error('Error saving mileage data:', error);
      throw error;
    }
  }

  /**
   * Add initial mileage when a new car is added
   * @param {number} carId - The car ID
   * @param {number} initialMileage - The initial mileage
   * @param {string} date - The date (optional, defaults to current date)
   */
  async addInitialMileage(carId, initialMileage, date = null) {
    await this.initialize();
    
    const currentDate = date || this.formatDate(new Date());
    
    const mileageEntry = {
      id: Date.now(),
      carId: carId,
      date: currentDate,
      mileage: Number(initialMileage),
      type: 'initial',
      createdAt: new Date().toISOString()
    };

    this.mileageData.push(mileageEntry);
    await this.saveMileageData();
    
    console.log('Initial mileage added:', mileageEntry);
    return mileageEntry;
  }

  /**
   * Add mileage entry from any form/entity
   * @param {number} carId - The car ID
   * @param {number} mileage - The mileage
   * @param {string} date - The date
   * @param {string} type - The type of entry (maintenance, repair, service, etc.)
   * @param {object} metadata - Additional metadata
   */
  async addMileageEntry(carId, mileage, date, type = 'manual', metadata = {}) {
    await this.initialize();
    
    const mileageEntry = {
      id: Date.now(),
      carId: carId,
      date: date,
      mileage: Number(mileage),
      type: type,
      metadata: metadata,
      createdAt: new Date().toISOString()
    };

    this.mileageData.push(mileageEntry);
    await this.saveMileageData();
    
    console.log('Mileage entry added:', mileageEntry);
    return mileageEntry;
  }

  /**
   * Get the latest mileage for a specific car
   * @param {number} carId - The car ID
   * @returns {number|null} - The latest mileage or null if not found
   */
  async getLatestMileage(carId) {
    await this.initialize();
    
    const carMileageEntries = this.mileageData
      .filter(entry => entry.carId == carId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return carMileageEntries.length > 0 ? carMileageEntries[0].mileage : null;
  }

  /**
   * Get mileage history for a specific car
   * @param {number} carId - The car ID
   * @returns {Array} - Array of mileage entries sorted by date (newest first)
   */
  async getMileageHistory(carId) {
    await this.initialize();
    
    return this.mileageData
      .filter(entry => entry.carId == carId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  /**
   * Get all mileage data
   * @returns {Array} - All mileage entries
   */
  async getAllMileageData() {
    await this.initialize();
    return this.mileageData;
  }

  /**
   * Update mileage for a specific car and date
   * @param {number} carId - The car ID
   * @param {string} date - The date
   * @param {number} newMileage - The new mileage
   * @param {string} type - The type of entry
   */
  async updateMileage(carId, date, newMileage, type = 'manual') {
    await this.initialize();
    
    // Find existing entry for this car and date
    const existingIndex = this.mileageData.findIndex(
      entry => entry.carId == carId && entry.date === date
    );
    
    if (existingIndex !== -1) {
      // Update existing entry
      this.mileageData[existingIndex].mileage = Number(newMileage);
      this.mileageData[existingIndex].type = type;
      this.mileageData[existingIndex].updatedAt = new Date().toISOString();
    } else {
      // Add new entry
      await this.addMileageEntry(carId, newMileage, date, type);
    }
    
    await this.saveMileageData();
  }

  /**
   * Delete mileage entry
   * @param {number} entryId - The entry ID to delete
   */
  async deleteMileageEntry(entryId) {
    await this.initialize();
    
    const index = this.mileageData.findIndex(entry => entry.id == entryId);
    if (index !== -1) {
      this.mileageData.splice(index, 1);
      await this.saveMileageData();
    }
  }

  /**
   * Get suggested mileage for a car (latest known mileage)
   * @param {number} carId - The car ID
   * @returns {number|null} - Suggested mileage or null if not found
   */
  async getSuggestedMileage(carId) {
    return await this.getLatestMileage(carId);
  }

  /**
   * Suggest current mileage for input fields
   * @param {string} inputId - The input field ID
   * @param {number} carId - The car ID
   */
  async suggestMileageForInput(inputId, carId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    try {
      const suggestedMileage = await this.getSuggestedMileage(carId);
      if (suggestedMileage !== null) {
        input.placeholder = `Текущий пробег: ${suggestedMileage} км`;
        input.setAttribute('data-suggested-mileage', suggestedMileage);
        
        // Add click handler to fill the input with suggested mileage
        input.addEventListener('click', function() {
          if (this.value === '' && this.getAttribute('data-suggested-mileage')) {
            this.value = this.getAttribute('data-suggested-mileage');
          }
        });
      }
    } catch (error) {
      console.error('Error suggesting mileage for input:', error);
    }
  }

  /**
   * Auto-suggest mileage for all mileage inputs on a page
   * @param {number} carId - The car ID
   */
  async suggestMileageForAllInputs(carId) {
    const mileageInputs = document.querySelectorAll('input[type="number"][placeholder*="пробег"], input[type="number"][placeholder*="mileage"], input[id*="mileage"], input[name*="mileage"]');
    
    for (const input of mileageInputs) {
      await this.suggestMileageForInput(input.id, carId);
    }
  }

  /**
   * Format date to DD.MM.YYYY format
   * @param {Date} date - The date to format
   * @returns {string} - Formatted date string
   */
  formatDate(date) {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  }

  /**
   * Parse date from DD.MM.YYYY format
   * @param {string} dateString - The date string to parse
   * @returns {Date|null} - Parsed date or null if invalid
   */
  parseDate(dateString) {
    const match = dateString.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (!match) return null;
    
    const [, day, month, year] = match;
    const date = new Date(year, month - 1, day);
    
    // Validate the date
    if (date.getDate() != day || date.getMonth() != month - 1 || date.getFullYear() != year) {
      return null;
    }
    
    return date;
  }

  /**
   * Validate mileage value
   * @param {number} mileage - The mileage to validate
   * @returns {boolean} - True if valid, false otherwise
   */
  validateMileage(mileage) {
    return !isNaN(mileage) && Number(mileage) >= 0;
  }

  /**
   * Clear all mileage data (for testing/reset purposes)
   */
  async clearAllData() {
    this.mileageData = [];
    await this.saveMileageData();
  }

  /**
   * Debug function to log current mileage data
   */
  async debugMileageData() {
    await this.initialize();
    console.log('Current mileage data:', this.mileageData);
    console.log('Total entries:', this.mileageData.length);
    
    // Group by car
    const byCar = {};
    this.mileageData.forEach(entry => {
      if (!byCar[entry.carId]) byCar[entry.carId] = [];
      byCar[entry.carId].push(entry);
    });
    
    console.log('Mileage data by car:', byCar);
    return this.mileageData;
  }
}

// Create singleton instance
export const mileageHandler = new MileageHandler();

// Auto-initialize when module is imported
mileageHandler.initialize().catch(console.error);
