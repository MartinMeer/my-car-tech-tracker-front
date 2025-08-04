/**
 * Unified car name formatting utility
 * Provides consistent car name representation across all pages
 */

/**
 * Formats a car name using a consistent pattern:
 * 1. If nickname exists, use it as primary name
 * 2. If brand and model exist, combine them
 * 3. If only name exists (legacy), use it
 * 4. Fallback to "Автомобиль"
 * 
 * @param {Object} car - Car object with properties: brand, model, nickname, name
 * @returns {string} Formatted car name
 */
export function formatCarName(car) {
  if (!car) return 'Автомобиль';
  
  // Priority 1: Use nickname if available
  if (car.nickname) {
    return car.nickname;
  }
  
  // Priority 2: Combine brand and model
  if (car.brand || car.model) {
    const parts = [];
    if (car.brand) parts.push(car.brand);
    if (car.model) parts.push(car.model);
    return parts.join(' ').trim();
  }
  
  // Priority 3: Use legacy name field
  if (car.name) {
    return car.name;
  }
  
  // Fallback
  return 'Автомобиль';
}

/**
 * Formats a car name with nickname in parentheses if available
 * Format: "Brand Model (Nickname)" or "Brand Model" or "Nickname"
 * 
 * @param {Object} car - Car object with properties: brand, model, nickname, name
 * @returns {string} Formatted car name with nickname
 */
export function formatCarNameWithNickname(car) {
  if (!car) return 'Автомобиль';
  
  // If nickname exists, use it as primary with brand/model in parentheses
  if (car.nickname) {
    const brandModel = [];
    if (car.brand) brandModel.push(car.brand);
    if (car.model) brandModel.push(car.model);
    
    if (brandModel.length > 0) {
      return `${car.nickname} (${brandModel.join(' ')})`;
    }
    return car.nickname;
  }
  
  // Otherwise use standard format
  return formatCarName(car);
}

/**
 * Formats a car name for display in lists and menus
 * Includes brand, model, and nickname in a compact format
 * 
 * @param {Object} car - Car object with properties: brand, model, nickname, name
 * @returns {string} Formatted car name for lists
 */
export function formatCarNameForList(car) {
  if (!car) return 'Автомобиль';
  
  const parts = [];
  
  // Add brand and model
  if (car.brand) parts.push(car.brand);
  if (car.model) parts.push(car.model);

  
  // Add nickname in quotes if available
  if (car.nickname) {
    parts.push(`"${car.nickname}"`);
  }
  
  // If no brand/model but has name, use name
  if (parts.length === 0 && car.name) {
    return car.name;
  }

  if (car.year) parts.push(`${car.year} г.`);
  
  
  return parts.length > 0 ? parts.join(' ') : 'Автомобиль';
}

/**
 * Formats a car name for detailed display
 * Includes all available information in a structured format
 * 
 * @param {Object} car - Car object with properties: brand, model, nickname, name, year, vin
 * @returns {Object} Object with formatted name and additional details
 */
export function formatCarNameDetailed(car) {
  if (!car) return { name: 'Автомобиль', details: [] };
  
  const details = [];
  
  // Primary name
  const name = formatCarName(car);
  
  // Additional details
  if (car.year) details.push(`${car.year} г.`);
  if (car.vin) details.push(`VIN: ${car.vin}`);
  if (car.licensePlate) details.push(car.licensePlate);
  
  return {
    name,
    details
  };
} 