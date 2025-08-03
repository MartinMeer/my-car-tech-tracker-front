# Car Name Representation Unification

## Overview
This document summarizes the unification of car name representations across all pages of the application. Previously, car names were displayed inconsistently using different formatting patterns throughout the codebase.

## Changes Made

### 1. Created Unified Car Name Formatter (`src/carNameFormatter.js`)

Created a new utility module with four main functions:

- **`formatCarName(car)`** - Primary formatter that prioritizes nickname, then brand/model, then legacy name
- **`formatCarNameWithNickname(car)`** - Shows nickname with brand/model in parentheses
- **`formatCarNameForList(car)`** - Compact format for lists and menus
- **`formatCarNameDetailed(car)`** - Returns structured object with name and additional details

### 2. Updated Files

The following files were updated to use the unified formatter:

#### Core Files:
- `src/fleetUI.js` - Updated car display in fleet overview
- `src/carsUI.js` - Updated car list display and selection UI
- `src/main.js` - Updated car selection popups
- `src/carOverviewMonitor.js` - Updated car title display
- `src/maintenanceUI.js` - Updated car name display in maintenance history
- `src/userAlertUI.js` - Updated car name display in alerts
- `src/repairUI.js` - Updated car name display in repair history
- `src/mileageHistoryUI.js` - Updated car name display in mileage history
- `src/serviceRecordManager.js` - Updated car name display in service records
- `src/reglamentUI.js` - Updated car name display in maintenance guide
- `src/periodicalMaintGuide.js` - Updated car name display
- `src/maintenancePlanUI.js` - Updated car name display

### 3. Unified Formatting Logic

**Priority Order:**
1. **Nickname** (if available) - Used as primary name
2. **Brand + Model** (if available) - Combined as fallback
3. **Legacy name field** (if no brand/model) - For backward compatibility
4. **"Автомобиль"** - Default fallback

**Examples:**
- Car with nickname: "Моя машина" (Toyota Camry)
- Car without nickname: "Toyota Camry"
- Car with only legacy name: "My Car"
- Car with no data: "Автомобиль"

### 4. Benefits

1. **Consistency** - All pages now display car names using the same logic
2. **Maintainability** - Single source of truth for car name formatting
3. **User Experience** - Consistent car identification across the application
4. **Backward Compatibility** - Still supports legacy car data with only `name` field
5. **Flexibility** - Multiple formatters for different use cases

### 5. Migration Notes

- All existing car data continues to work
- Legacy cars with only `name` field are still supported
- New cars with `brand`/`model`/`nickname` fields are prioritized
- No database changes required

### 6. Usage Examples

```javascript
import { formatCarName, formatCarNameForList, formatCarNameWithNickname } from './carNameFormatter.js';

// Basic usage
const carName = formatCarName(car); // "Моя машина" or "Toyota Camry"

// For lists and menus
const listName = formatCarNameForList(car); // "Toyota Camry \"Моя машина\""

// With nickname in parentheses
const detailedName = formatCarNameWithNickname(car); // "Моя машина (Toyota Camry)"
```

## Files Modified

1. `src/carNameFormatter.js` - **NEW** - Unified formatter utility
2. `src/fleetUI.js` - Updated car display
3. `src/carsUI.js` - Updated car list and selection
4. `src/main.js` - Updated car selection popups
5. `src/carOverviewMonitor.js` - Updated car title
6. `src/maintenanceUI.js` - Updated maintenance history
7. `src/userAlertUI.js` - Updated alert displays
8. `src/repairUI.js` - Updated repair history
9. `src/mileageHistoryUI.js` - Updated mileage history
10. `src/serviceRecordManager.js` - Updated service records
11. `src/reglamentUI.js` - Updated maintenance guide
12. `src/periodicalMaintGuide.js` - Updated guide display
13. `src/maintenancePlanUI.js` - Updated plan display

## Testing Recommendations

1. Test car display on all pages with different car data configurations
2. Verify nickname priority works correctly
3. Test backward compatibility with legacy car data
4. Verify consistent display across all UI components
5. Test car selection and navigation functionality 