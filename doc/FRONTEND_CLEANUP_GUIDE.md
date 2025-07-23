# Frontend Cleanup Guide

## 🎯 Goal
Remove business logic from frontend and make it pure UI-focused.

## 📋 What to Remove from Frontend

### 1. Calculation Functions
**Remove from:**
- `src/maintenanceUI.js` - `calculateMaintTotal()`
- `src/repairUI.js` - `calculateRepairTotal()`
- `src/serviceRecordManager.js` - `calculateMaintTotal()`

**Replace with:**
```javascript
// Instead of calculating locally, call backend API
async function updateMaintenanceTotal() {
  const request = {
    consumables: getConsumablesFromForm(),
    workCost: parseFloat(document.getElementById('work-cost').value) || 0
  };
  
  const response = await fetch('/api/maintenance/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });
  
  const result = await response.json();
  document.getElementById('maint-total').textContent = `${result.totalCost} ₽`;
}
```

### 2. Validation Logic
**Remove from:**
- All form validation functions
- Date format validation
- Mileage validation
- Business rule validation

**Replace with:**
```javascript
// Let backend handle validation
async function saveMaintenance() {
  const formData = collectFormData();
  
  try {
    const response = await fetch('/api/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      showError(error.message);
      return;
    }
    
    showSuccess('Maintenance saved successfully');
  } catch (error) {
    showError('Network error');
  }
}
```

### 3. Data Processing Logic
**Remove from:**
- `src/mileageHandler.js` - Complex mileage calculations
- `src/serviceRecordManager.js` - Service record processing
- All data transformation logic

**Replace with:**
```javascript
// Simple data fetching and display
async function loadMaintenanceHistory() {
  const response = await fetch('/api/maintenance');
  const records = await response.json();
  renderMaintenanceTable(records);
}
```

## 🔧 Quick Wins (Start Here)

### 1. Update DataService.js
```javascript
// Replace localStorage logic with API calls
async saveMaintenance(data) {
  const response = await fetch(`${CONFIG.apiUrl}/maintenance`, {
    method: 'POST',
    headers: this.getAuthHeaders(),
    body: JSON.stringify(data)
  });
  return response.json();
}
```

### 2. Remove Calculation Functions
- Comment out `calculateMaintTotal()` functions
- Replace with API calls to `/api/maintenance/calculate`

### 3. Simplify Form Handling
- Remove client-side validation
- Let backend return validation errors
- Display backend error messages

## 📁 Files to Clean Up

### High Priority
- [ ] `src/maintenanceUI.js` - Remove calculation functions
- [ ] `src/repairUI.js` - Remove calculation functions  
- [ ] `src/serviceRecordManager.js` - Remove business logic
- [ ] `src/mileageHandler.js` - Simplify to API calls only

### Medium Priority
- [ ] `src/dataService.js` - Remove localStorage fallbacks
- [ ] `src/authService.js` - Remove mock authentication
- [ ] All UI files - Remove validation logic

## 🚀 Testing the Clean Frontend

1. **Start Backend:**
   ```bash
   cd backend-demo
   mvn spring-boot:run
   ```

2. **Test Frontend:**
   - Open frontend in browser
   - Try adding maintenance records
   - Verify calculations are done by backend
   - Check that validation errors come from backend

3. **Verify Clean Architecture:**
   - Frontend only handles UI
   - All business logic in backend
   - No calculations in JavaScript
   - Clean separation of concerns

## ✅ Success Criteria

- [ ] No calculation functions in frontend
- [ ] No business validation in frontend
- [ ] All data operations go through API
- [ ] Frontend only renders UI and handles user input
- [ ] Backend handles all business logic
- [ ] Clean, maintainable code structure 