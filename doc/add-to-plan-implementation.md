# Add-to-Plan Functionality Implementation

## Overview

This document describes the implementation of the "Add to Plan" functionality for the my-car-overview page, which allows users to add periodic maintenance items to the maintenance plan.

## Requirements

Based on the requirements from the development chat:

1. **Add "В план" button** to each entry in the periodic maintenance section with restoring ability
2. **On click**: Send entry to plan into maintenance-table and fill a row there
3. **Visual feedback**: In alert section let this entry remain crosslined
4. **Mapping**: operation to operation; to note add a string generated from date/mileage field with status comment; resource field in plan remain empty
5. **Restore functionality**: When restore in alert section OR delete in plan page:
   - Delete the entry from plan
   - Clear cross-line
6. **Use existing styles** where possible

## Implementation Details

### 1. JavaScript Changes

#### File: `src/carOverviewMonitor.js`

**New Methods Added:**
- `isMaintenanceItemInPlan(item)` - Checks if a maintenance item is already in the plan
- `toggleMaintenancePlan(maintenanceIndex)` - Toggles the plan status of a maintenance item
- `addMaintenanceToPlan(item, maintenanceIndex)` - Adds a maintenance item to the plan
- `removeMaintenanceFromPlan(item)` - Removes a maintenance item from the plan

**Modified Methods:**
- `createMaintenanceScheduleRows()` - Added actions column and "В план" button
- `createDynamicMonitorContent()` - Updated table header to include actions column

### 2. CSS Changes

#### File: `src/styles/maintenance-guide.css`

**New Styles Added:**
- `.maintenance-actions` - Container for action buttons
- `.maintenance-action-btn` - Base button styling
- `.maintenance-action-btn.add-to-plan` - Specific styling for add-to-plan button
- `.maintenance-action-btn.add-to-plan.in-plan` - Styling for items already in plan
- `.maintenance-in-plan` - Styling for items in plan (strikethrough, opacity)

#### File: `src/styles/maintenance-plan.css`

**New Styles Added:**
- Similar maintenance action button styles for the maintenance plan page

### 3. Integration with Maintenance Plan

#### File: `src/maintenancePlanUI.js`

**Modified Methods:**
- `deleteRow()` - Added handling for maintenance items (not just alerts)
- Added confirmation dialog for maintenance items with appropriate messaging

## Data Flow

### Adding to Plan:
1. User clicks "📋 В план" button in my-car-overview
2. `toggleMaintenancePlan()` is called with maintenance index
3. `addMaintenanceToPlan()` creates plan entry with:
   - Operation: Original maintenance operation
   - Resources: Empty (as required)
   - Notes: Generated string with mileage, period, and original notes
   - maintenanceId: Links back to original item
4. Plan data is saved to localStorage
5. UI is updated to show strikethrough and "📋 В плане" button

### Removing from Plan:
1. User clicks "📋 В плане" button (restore) OR deletes from maintenance plan
2. `removeMaintenanceFromPlan()` removes entry from plan
3. Plan data is updated in localStorage
4. UI is updated to remove strikethrough and restore "📋 В план" button

## Storage Structure

### localStorage Keys:
- `maintenance_plan_draft_{carId}` - Contains plan data with maintenance and repairs arrays

### Plan Entry Structure:
```javascript
{
  id: "generated_id",
  operation: "Original maintenance operation",
  resources: "",
  notes: "Добавлено из периодического обслуживания. Пробег: X км, период: Y мес. Original notes",
  createdAt: "ISO date string",
  maintenanceId: "Original operation name", // For linking back
  maintenanceIndex: 0 // Original index in maintenance schedule
}
```

## Visual Feedback

### Items in Plan:
- **Strikethrough text** for operation, mileage, period, and notes
- **Reduced opacity** (0.7)
- **Button text** changes from "📋 В план" to "📋 В плане"
- **Button styling** changes to green theme

### Items not in Plan:
- **Normal text** without strikethrough
- **Full opacity**
- **Button text** shows "📋 В план"
- **Button styling** uses blue theme

## Error Handling

- **Graceful degradation** if localStorage is not available
- **Console logging** for debugging
- **Try-catch blocks** around all localStorage operations
- **Validation** of data before saving/loading

## Testing

### Test File: `test-add-to-plan.html`
- Automated tests for core functionality
- Manual test instructions
- Verification of localStorage integration
- CSS class availability checks

### Manual Testing Steps:
1. Navigate to my-car-overview page
2. Click "📋 В план" button next to maintenance item
3. Verify strikethrough styling and button change
4. Navigate to maintenance-plan page
5. Verify item appears in maintenance table
6. Delete item from plan
7. Return to my-car-overview and verify restoration

## Browser Compatibility

- **Modern browsers** with localStorage support
- **Fallback handling** for older browsers
- **Responsive design** for mobile devices

## Performance Considerations

- **Efficient localStorage operations** with minimal data transfer
- **Lazy loading** of maintenance data
- **Debounced updates** to prevent excessive re-renders
- **Memory management** with proper cleanup

## Future Enhancements

1. **Backend integration** for persistent storage
2. **Real-time synchronization** between multiple tabs
3. **Bulk operations** for adding multiple items at once
4. **Export functionality** for plan data
5. **Notification system** for plan updates

## Dependencies

- `maintenanceDataService.js` - For maintenance schedule data
- `dataService.js` - For car data management
- CSS files for styling
- localStorage API for data persistence 