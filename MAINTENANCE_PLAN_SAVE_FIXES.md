# Maintenance Plan Save Functionality Fixes

## Issues Identified and Fixed

### 1. **Duplicate Plan Creation Issue**
**Problem**: Auto-save was creating new plans every time instead of updating existing ones.

**Fix**: 
- Modified `savePlanData` function to properly handle `editingPlanId`
- When `editingPlanId` exists, the function now updates the existing plan using `DataService.updateMaintenancePlan()`
- When `editingPlanId` is null, it creates a new plan using `DataService.saveMaintenancePlan()`

### 2. **editingPlanId Not Set Properly**
**Problem**: When loading a plan for viewing, `editingPlanId` was not set, preventing proper updates.

**Fix**:
- Updated `loadPlanForEditing` function to set `editingPlanId` when loading a plan
- This enables the plan to be updated instead of creating duplicates

### 3. **Multiple Save Behaviors**
**Problem**: Multiple save functions could conflict and create duplicate saves.

**Fix**:
- Added `isSaving` state to prevent multiple rapid clicks
- All save functions now check `isSaving` before proceeding
- Clear auto-save interval after successful manual saves

### 4. **Auto-save Interval Management**
**Problem**: Auto-save interval was being recreated on every form change, potentially causing multiple intervals.

**Fix**:
- Properly clear existing interval before creating a new one
- Only create auto-save interval when not viewing a saved plan and when a car is selected
- Clear interval after successful manual saves

### 5. **Rapid Auto-save Prevention**
**Problem**: Auto-save could trigger multiple times rapidly, creating duplicate plans.

**Fix**:
- Added debouncing mechanism with 10-second minimum interval between auto-saves
- Added `formChanged` state to only auto-save when form has actually changed
- Prevent auto-save when form is being loaded (`isLoadingPlan`)

## Code Changes Made

### 1. Updated `savePlanData` function
```typescript
// Before: Prevented updating existing plans
if (editingPlanId) {
  alert('Редактирование существующих планов обслуживания не поддерживается.')
  return false
}

// After: Properly updates existing plans
if (editingPlanId) {
  const updatedPlan = await DataService.updateMaintenancePlan(editingPlanId, planData)
  const updatedPlans = savedPlans.map(plan => 
    plan.id === editingPlanId ? updatedPlan : plan
  )
  setSavedPlans(updatedPlans)
  
  if (!isAutoSave) {
    alert('План обслуживания обновлен!')
  }
}
```

### 2. Updated `loadPlanForEditing` function
```typescript
// Before: Didn't set editingPlanId
// Don't set editingPlanId - this prevents saving/updating

// After: Sets editingPlanId to enable updates
setEditingPlanId(plan.id)
```

### 3. Enhanced auto-save function
```typescript
const autoSaveDraft = async () => {
  // Don't auto-save when viewing a saved plan (planId exists) or when no car is selected
  if (!selectedCarId || !plannedDate || planId) return

  const selectedPeriodicOps = periodicItems.filter(item => item.selected)
  const selectedRepairOps = repairItems.filter(item => item.selected)
  
  if (selectedPeriodicOps.length === 0 && selectedRepairOps.length === 0) return

  // Prevent auto-save if already saving
  if (isSaving) return

  // Only auto-save if form has changed and not currently loading
  if (!formChanged || isLoadingPlan) return

  // Debounce auto-save to prevent rapid saves (minimum 10 seconds between auto-saves)
  const now = Date.now()
  if (now - lastAutoSave < 10000) return

  // Use the shared savePlanData function for auto-saving
  try {
    await savePlanData(false, true) // Don't close after auto-save, is auto-save
    setLastAutoSave(now)
    setFormChanged(false) // Reset form changed flag after successful save
    console.log('Draft auto-saved')
  } catch (error) {
    console.error('Error auto-saving draft:', error)
  }
}
```

### 4. Added new state variables
```typescript
const [lastAutoSave, setLastAutoSave] = useState<number>(0)
const [formChanged, setFormChanged] = useState(false)
```

### 5. Updated auto-save interval management
```typescript
useEffect(() => {
  // Clear existing interval
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval)
    setAutoSaveInterval(null)
  }
  
  // Don't set up auto-save when viewing a saved plan or when no car is selected
  if (!planId && selectedCarId) {
    const interval = setInterval(autoSaveDraft, 30000)
    setAutoSaveInterval(interval)
  }

  // Set form changed flag when form data changes (but not on initial load)
  if (selectedCarId && !isLoading) {
    setFormChanged(true)
  }

  // Cleanup on unmount or when dependencies change
  return () => {
    if (autoSaveInterval) {
      clearInterval(autoSaveInterval)
    }
  }
}, [selectedCarId, plannedDate, plannedCompletionDate, plannedMileage, serviceProvider, planNotes, periodicItems, repairItems, planId])
```

## Testing Recommendations

1. **Test Auto-save Functionality**:
   - Create a new maintenance plan
   - Make changes to the form
   - Wait 30 seconds for auto-save
   - Verify only one plan is created

2. **Test Manual Save**:
   - Create a new plan
   - Click "Save" multiple times rapidly
   - Verify only one plan is created

3. **Test Plan Editing**:
   - Load an existing plan
   - Make changes
   - Save the plan
   - Verify the existing plan is updated, not duplicated

4. **Test Auto-save Debouncing**:
   - Make rapid changes to the form
   - Verify auto-save only triggers once per 10 seconds

5. **Test Form Loading**:
   - Load a saved plan
   - Verify auto-save doesn't trigger during loading

## Benefits of These Fixes

1. **Prevents Duplicate Plans**: Auto-save now updates existing plans instead of creating new ones
2. **Improves Performance**: Debouncing prevents excessive save operations
3. **Better User Experience**: Clear feedback when plans are saved or updated
4. **Robust Error Handling**: Prevents multiple simultaneous save operations
5. **Proper State Management**: Form state is properly tracked and managed

## Files Modified

- `apps/main-app/src/pages/MaintenancePlanning.tsx`: Main component with save functionality
- `apps/main-app/src/services/DataService.ts`: Service layer for data operations (no changes needed, already supported update operations) 