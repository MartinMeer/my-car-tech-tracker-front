✅ For histories pages add a btn Go to car overview
✅ After saving new car redirect to defaut page
✅ Service Record CRUD Implementation - Complete service record storage system with proper separation from operations
✅ Frontend Fixes - Fixed all major issues preventing the frontend from working properly
✅ Fixed duplicate function declaration error in maintenanceUI.js
✅ Updated service history page to group records by cars with clickable entries
✅ Remove mileage input to main service-card page - Fixed data gathering logic: mileage is now common for all operations in a service record, just like the date
    After saving service-card redirect to default page
    Collect all TODO comments fron entirely project to TODO adding a structure 

# Project TODOs (by Area and Type)

## FRONT

### Fix It!
- *(No pure frontend bugfix TODOs found in code comments)*

### Implement It!
- **src/serviceRecordManager.js**: Implement edit functionality  
  - `editSubRecord(subRecordId)` is a placeholder; needs real edit logic for sub-records.

### Add Feature
- *(No pure frontend feature TODOs found in code comments)*

### Extend It
- **src/main.js**: Add more cases for other modules  
  - `initializePageUI(page)` switch-case: add logic for new modules/pages as the app grows.

---

## BACK

### Fix It!
- *(No pure backend bugfix TODOs found in code comments)*

### Implement It!
- **src/repairUI.js**: Replace with actual API call  
  - `getCurrentCarFromBackend()` uses localStorage; needs real backend call.
- **src/maintenanceUI.js**: Replace with real backend API call  
  - `fetchCarTotalsFromBackend(carId)` uses localStorage; needs real backend call.
- **src/userAlertUI.js**: Replace with actual backend API call  
  - `saveUserAlert`, `getUserAlerts`, `deleteUserAlert` use localStorage; need real backend calls.
- **src/dataService.js**: Implement backend call for currentCarId if needed  
  - `getCurrentCarId()` and `setCurrentCarId(carId)` have TODOs for backend logic.
- **src/dataService.js**: Implement backend call to save cars if needed  
  - `saveCars(cars)` has a TODO for backend logic.

### Add Feature
- *(No explicit backend-only feature TODOs found in code comments; most are about connecting frontend to backend)*

### Extend It
- *(No explicit backend-only extension TODOs found in code comments; add here as needed)*

---

*This list is auto-generated from code comments. Please update as you address TODOs or add new ones.* 