
# Project TODOs (by Area and Type)

## FRONT

###Do Refactoring!
- ✅ **COMPLETED** rename current-cad-img to my-cars-img and all corresoinded names, change hover behavior for this img likewise as user-alert

### Fix It!
- ✅ **COMPLETED** When edit a repair history entry and maintenance history entry, user can add or delele a spare or consumable, but when he try to save changes, a popup with error: Ошибка сохранения: Cannot read properties of null (reading 'value')
- alert: car names are only nicknames. change it for names



### Implement It!
- ✅ **COMPLETED** split single css to files according to main divisions
- ✅ **COMPLETED** service-record: maint-entry-popup, repair-entry-popup: add a Russian Ruble icon to each cost-input.
- ✅ **COMPLETED** service-record: maint-entry-popup, repair-entry-popup: add a quantity field after each consumable-name (and between spare-entry-popup too). Fill these quantity fields with 1 by default. Implement new cost counting logic depends on quantity of items.

- ✅ **COMPLETED** cookie handler - Backend-ready cookie handler with test implementation for dev mode
- **src/serviceRecordManager.js**: Implement edit functionality  
- `editSubRecord(subRecordId)` is a placeholder; needs real edit logic for sub-records.

### Add Feature
- ✅ **COMPLETED** add-car: car-year: add dropdown selector of year from 1900 to current, staring to current year
- ✅ **COMPLETED** service-record: add draft saving logic for continuing filling, if user will occasionally leave a form. Delete current buttons. Add a buttons Save draft, Save&Exit, Exit without changes


- Alerting notification: if alerts exist

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