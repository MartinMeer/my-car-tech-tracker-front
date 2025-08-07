## MAIN NOTE ##
PAY YOUR ATTENTION: there must be a clear separation between dev mode with further Java backend and demo abilities, working with localStorage

## FIX IT! ##
1. 


1. add-service-record: is not available selecting car. Investigate this issue for future backend integration and current demo implementation

## REFACTOR IT! ##



## FEAT IT! ##

1. Create a ready-to-work cars list

3. maintenance-planning: Collapse Периодическое обслуживание to 4 first due-out and due-soon entries, and add View all capability to expand all entries
OK READY Add a service-shops feature:
    4.1 Create a service-shops list. Columns: Name, Contacts, Rating, Actions (Edit, Delete for whole entry). Attach to table the Add-new functionality
    4.2 Create a button to service-shops list in maintenance-planning header
    4.3 Pull entries from the service-shops list to Планируемый исполнитель
    4.4 All change state operations - with standard project-style confirmation
OK READY maintenance-planning: add export-to-pdf funcionality.
    5.1 Add html2pdf.js to project
    5.2 Add export button in maintenance-planning between Сохранить план и Отправить на обслуживание
    5.3 When export, save the pdf localy via standart system window
    NOTE Separate exporting from saving: export must be available after saving
OK READY  Add car-edit feature:
    6.1 User select concrete car from main dashboard (root page) and go to this concrete car page
    6.2 In car page add Edit-car button
    6.2 On click, open the add-car page for editing
    6.4 All change state operations - with standard project-style confirmation

7. Add a Refrences (Справочник) funtionality for car (Periodical maintenance guide, Volumes of consumables)

8. Alerts: When alert was send to archve, add to each entry in archved alerts a field with date was sent (using current date in moment to archivation)

9. Let's start implementation of Periodical maintenance guide (PMG)
Overview: the PMG is a list of maintenance orerations, based on reglament by car manufacturer. It is related to concrete car in fleet. Each entry from PMG must be shows: a. on maintanence plan page as a source for list of periodical operations according to selected car. b. in add-service-record page, a name of operation only.
Current implementation: I see that on maintanence plan page alredy present hardcoded list of operations, and on add-service-record page exist an another hardcoded list.
Task:
1. Make full comprehensive analyse for curent situation



FINALLY! Add car-delete feature. 
    Flow: User select concrete car from main dashboard (root page) and go to this concrete car page.
    Let's implement:
    1 Let create a delete-car button
    2 When car leave the fleet, all car related information for all time must be archieved on db via backend. Now, untill the backend is not created, let create a json with all gathered information from all parts of app, and let can be saved as file to client's OS filesystem

    I'll help you create a comprehensive plan for the car-delete feature. Let me first examine the current codebase structure to understand the existing car management functionality.

Search files...
Now let me examine the current car management structure and data services to understand how cars are stored and managed:

Read file: apps/main-app/src/services/DataService.ts
Now let me check if there's already a delete car method in the DataService:

Ran tool
Let me check the current car overview page to see the existing structure:

Read file: apps/main-app/src/pages/CarOverview.tsx
Now let me check what data is associated with cars to understand what needs to be archived:

Search files...
Based on my analysis of the codebase, I can now create a comprehensive plan for the car-delete feature. Here's the detailed implementation plan:

# Car Delete Feature Implementation Plan

## Overview
The car delete feature will allow users to remove cars from their fleet while preserving all related data for archival purposes. The implementation will follow the existing patterns in the codebase and ensure data integrity.

## Data Analysis
Based on the codebase analysis, the following data is associated with cars and needs to be archived:

1. **Car Information** - Basic car details (brand, model, year, VIN, etc.)
2. **Alerts** - All alerts (active and archived) for the car
3. **Service Records** - Complete service history with operations and costs
4. **Maintenance Entries** - Current maintenance status
5. **Maintenance Plans** - Planned maintenance schedules
6. **Mileage History** - Historical mileage records
7. **User Alerts** - User-reported problems and recommendations

## Implementation Plan

### Phase 1: Data Service Enhancement

#### 1.1 Add Delete Car Method to DataService
```typescript
// Add to DataService.ts
static async deleteCar(carId: string): Promise<void> {
  if (this.useBackend) {
    await this.apiCall(`/cars/${carId}`, {
      method: 'DELETE'
    });
  } else {
    // Remove from cars list
    const cars = await this.getCars();
    const updatedCars = cars.filter(car => car.id !== carId);
    this.setToStorage('cars', updatedCars);
  }
}
```

#### 1.2 Add Archive Data Collection Method
```typescript
// Add to DataService.ts
static async collectCarArchiveData(carId: string): Promise<CarArchiveData> {
  const [car, alerts, serviceRecords, maintenanceEntries, maintenancePlans] = await Promise.all([
    this.getCarById(carId),
    this.getAlertsByCarId(carId),
    this.getServiceRecordsByCarId(carId),
    this.getMaintenanceEntries().then(entries => entries.filter(e => e.carId === carId)),
    this.getMaintenancePlans().then(plans => plans.filter(p => p.carId === carId))
  ]);

  // Get mileage history from localStorage
  const mileageHistory = JSON.parse(localStorage.getItem('mileage-history') || '[]')
    .filter((entry: any) => entry.carId === carId);

  return {
    car,
    alerts,
    serviceRecords,
    maintenanceEntries,
    maintenancePlans,
    mileageHistory,
    archivedAt: new Date().toISOString(),
    archiveReason: 'car_deleted'
  };
}
```

#### 1.3 Create Archive Data Interface
```typescript
// Add to DataService.ts
export interface CarArchiveData {
  car: Car | null;
  alerts: Alert[];
  serviceRecords: ServiceRecord[];
  maintenanceEntries: MaintenanceEntry[];
  maintenancePlans: MaintenancePlan[];
  mileageHistory: any[];
  archivedAt: string;
  archiveReason: string;
}
```

### Phase 2: UI Components

#### 2.1 Add Delete Button to CarOverview Page
- Add a delete button in the header next to the edit button
- Style it with a red/danger variant
- Add confirmation dialog

#### 2.2 Create Archive Download Component
- Create a component to generate and download the archive JSON file
- Include all car-related data in a structured format
- Add timestamp and metadata to the archive

### Phase 3: Confirmation and Safety Features

#### 3.1 Enhanced Confirmation Dialog
- Show comprehensive warning about data loss
- List all data that will be archived
- Require explicit confirmation

#### 3.2 Data Validation
- Check if car is currently in maintenance
- Warn about active alerts
- Prevent deletion if critical data exists

### Phase 4: Archive File Generation

#### 4.1 JSON Archive Structure
```json
{
  "metadata": {
    "archivedAt": "2024-01-15T10:30:00Z",
    "archiveReason": "car_deleted",
    "version": "1.0"
  },
  "car": { /* car data */ },
  "alerts": [ /* all alerts */ ],
  "serviceRecords": [ /* all service records */ ],
  "maintenanceEntries": [ /* maintenance entries */ ],
  "maintenancePlans": [ /* maintenance plans */ ],
  "mileageHistory": [ /* mileage history */ ]
}
```

#### 4.2 File Download Implementation
- Use browser's download API
- Generate filename with car name and timestamp
- Include proper MIME type for JSON

### Phase 5: Data Cleanup

#### 5.1 Remove Related Data
- Remove car from cars list
- Remove all alerts for the car
- Remove all service records for the car
- Remove maintenance entries for the car
- Remove maintenance plans for the car
- Clean up mileage history

#### 5.2 Update Related Services
- Update CarStatusService to handle deleted cars
- Update fleet statistics calculations
- Trigger UI updates across the application

## Implementation Steps

### Step 1: DataService Enhancement
1. Add `deleteCar` method to DataService
2. Add `collectCarArchiveData` method
3. Add archive data interface
4. Test with existing data

### Step 2: UI Implementation
1. Add delete button to CarOverview page
2. Create confirmation dialog component
3. Implement archive download functionality
4. Add proper error handling

### Step 3: Integration
1. Connect delete functionality to DataService
2. Test archive generation
3. Test data cleanup
4. Update related components

### Step 4: Testing and Validation
1. Test with cars that have various data
2. Test archive file generation
3. Test data cleanup completeness
4. Test UI updates across the app

## File Structure Changes

### New Files
- `components/ui/confirm-delete-dialog.tsx` - Reusable delete confirmation dialog
- `utils/archive-generator.ts` - Archive file generation utilities

### Modified Files
- `services/DataService.ts` - Add delete and archive methods
- `pages/CarOverview.tsx` - Add delete button and functionality
- `services/CarStatusService.ts` - Handle deleted cars in status calculations

## Safety Considerations

1. **Data Backup**: Always generate archive before deletion
2. **Confirmation**: Require explicit user confirmation
3. **Validation**: Check for critical data before allowing deletion
4. **Rollback**: Provide option to restore from archive if needed
5. **Audit Trail**: Log all deletion operations

## User Experience Flow

1. User navigates to car overview page
2. User clicks delete button
3. System shows confirmation dialog with data summary
4. User confirms deletion
5. System generates archive file and triggers download
6. System removes car and all related data
7. User is redirected to home page
8. System shows success message

This plan ensures comprehensive data preservation while providing a clean deletion process that follows the existing codebase patterns and maintains data integrity.















5. my-car-overview: add color change logic for fleet-maintenance-preview, red-yellow-green, depends on existing overdues and due-soon entries in my-car-overview.
6. my-car-overview: add previews for each car-problem-icons
7. service-card: delete from maitn-entry-popup data autoloading, remain  custom input field with add consumable-item functionality
8. service-record: Add text: Запиши все замечания и рекомендации автосервиса в разделе У нас проблемы! Add button to add new user alert. user-alert must be open for current car, with current date and current mileage (skipping car selection popup and date-mileage selection popup). When save, return back to current service-record page.
9. renderCarsList in reglament page - Has its own implementation of renderCarsList with different styling and layout. 



## IMPLEMENT IT! ##
1. Create a logo and use it everywhere
3. Restore a service-record history, link it to maintenace-history in my-car-overview 

## BACKEND ##
1. service-card: to operation-dropdown, list must become from car-related maintenanca-schedule
