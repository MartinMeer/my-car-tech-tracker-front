
# Project TODOs (by Area and Type)

## FRONT

###Do Refactoring!
- rename current-cad-img to my-cars-img and all corresoinded names, change hover behavior for this img likewise as user-alert

### Fix It!
- ✅ **COMPLETED** my-car-oveview: in desktop mode make view wide to full main view area
- ✅ **COMPLETED** service-record: in desktop mode make view wide to full main view area  
- ✅ **COMPLETED** service-history: in desktop mode make view wide to full main view area
- ✅ **COMPLETED** mainten-history: in desktop mode make view wide to full main view area
- ✅ **COMPLETED** repair-history: in desktop mode make view wide to full main view area
- ✅ **COMPLETED** service-record: proper flow: 1. click заполни карточку -> car selector without date&mileage selection -> date and mileage selection popup -> service-record main 
- ✅ **COMPLETED** user-alert: add mileage field when create a new alert

- my-car-overview: in histories of maintenance and repair must show info linked to current car only, not for all cars
- limit the car year dropdown to show only 6 options at a time.
- К обзору автомобиля button open an unknown car

### Implement It!
- ✅ **COMPLETED** split single css to files according to main divisions
- ✅ **COMPLETED** service-record: maint-entry-popup, repair-entry-popup: add a Russian Ruble icon to each cost-input.
- ✅ **COMPLETED** service-record: maint-entry-popup, repair-entry-popup: add a quantity field after each consumable-name (and between spare-entry-popup too). Fill these quantity fields with 1 by default. Implement new cost counting logic depends on quantity of items.

- cookie handler
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

## **Proposed CSS Structure**

```
<code_block_to_apply_changes_from>
src/styles/
├── index.css              # Main import file
├── base/
│   ├── reset.css         # CSS reset, box-sizing
│   ├── typography.css    # Font families, text styles
│   └── variables.css     # CSS custom properties (colors, spacing)
├── layout/
│   ├── header.css        # Header styles
│   ├── sidebar.css       # Sidebar navigation
│   ├── footer.css        # Footer styles
│   └── container.css     # Main container, grid layouts
├── components/
│   ├── buttons.css       # All button styles
│   ├── forms.css         # Form inputs, labels, validation
│   ├── popups.css        # Modal/popup overlays
│   ├── tables.css        # History tables
│   ├── cards.css         # Car cards, service cards
│   └── alerts.css        # Messages, notifications
├── pages/
│   ├── cover.css         # Cover/landing page
│   ├── cars.css          # Car-related pages
│   ├── service-card.css  # Service card page
│   ├── service-record.css # Service record page
│   ├── history.css       # History pages
│   └── user-alert.css    # User alert page
└── utils/
    ├── responsive.css    # Media queries
    └── utilities.css     # Helper classes
```