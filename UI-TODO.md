# UI-TODO.md - Frontend UI Issues to Fix Before Java Backend Development

## 🎯 Overview
This document outlines all frontend UI issues that need to be resolved before starting Java backend development. Based on the architecture principle that **frontend = UI only**, these fixes focus on user interface, data presentation, and user experience.

---

## 🚨 **PRIORITY 1: Critical UI Issues**

### **1. Date Input Format Issues**
**Status**: �� **CRITICAL** - All date inputs and outputs must be in Russian format.
ISO format will be handled internally in backend and become to frontend in russian format, so frontend must working with dates with russian format only.

**Problems**:
- HTML date inputs use `YYYY-MM-DD` format (English)
- Users expect Russian format `DD.MM.YYYY`
- Inconsistent date display across components

**ATTENTION**
- when implement fixes, NOT AFFECT a calendar popups in input fields



### **2. Mileage Input Type Inconsistencies**
**Status**: 🔴 **CRITICAL** - String/number confusion in forms

**Problems**:
- Mileage handled as string in forms but number in interfaces
- No validation for negative values
- Inconsistent type conversion scattered throughout code

**Files Affected**:
- `apps/main-app/src/pages/UserAlert.tsx` (line 240)
- `apps/main-app/src/pages/AddServiceRecord.tsx` (line 380)
- `apps/main-app/src/pages/CarOverview.tsx` (line 350)
- `apps/main-app/src/pages/AddCar.tsx` (line 310)

**TODO**:
- [ ] Create `MileageInput` component with proper validation
- [ ] Ensure mileage is always stored as number
- [ ] Add validation for negative values
- [ ] Add Russian locale formatting for display
- [ ] Update all mileage inputs to use new component

### **3. ServiceOperation Interface Mismatch**
**Status**: 🔴 **CRITICAL** - UI expects different interface than DataService

**Problems**:
- DataService: `type: 'maintenance' | 'repair'`
- UI Components: `type: 'periodical' | 'repair'`
- DataService: `parts?: string[]`
- UI Components: `parts: Array<{name, quantity, cost}>`

**Files Affected**:
- `apps/main-app/src/services/DataService.ts` (line 47-53)
- `apps/main-app/src/pages/AddServiceRecord.tsx` (line 70-80)

**TODO**:
- [ ] Standardize ServiceOperation interface across all files
- [ ] Update DataService to match UI expectations
- [ ] Ensure type safety between UI and data layer
- [ ] Add proper validation for operation types

---

## ⚠️ **PRIORITY 2: UI Error Handling**

### **4. Silent Error Recovery**
**Status**: 🟡 **HIGH** - Users don't know when operations fail

**Problems**:
- localStorage errors are silent
- No user feedback for failed operations
- Data corruption issues hidden from users

**Files Affected**:
- `apps/main-app/src/services/DataService.ts` (line 135-145)
- All form submission handlers

**TODO**:
- [ ] Create `useDataError` hook for centralized error handling
- [ ] Add toast notifications for all data operations
- [ ] Replace silent failures with user feedback
- [ ] Add retry mechanisms for failed operations
- [ ] Add loading states for all async operations

### **5. Missing Error Boundaries**
**Status**: 🟡 **HIGH** - No graceful error handling in UI

**Problems**:
- Component crashes break entire app
- No fallback UI for error states
- Poor user experience during errors

**TODO**:
- [ ] Add React Error Boundaries
- [ ] Create fallback components for error states
- [ ] Add error reporting for debugging
- [ ] Implement graceful degradation

---

## 🔧 **PRIORITY 3: UI Performance Issues**

### **6. Inefficient Data Loading**
**Status**: 🟡 **MEDIUM** - Components load unnecessary data

**Problems**:
- `getAlertsByCarId` loads ALL alerts then filters
- No pagination for large datasets
- No caching of frequently accessed data

**Files Affected**:
- `apps/main-app/src/services/DataService.ts` (line 264-268)
- All list components

**TODO**:
- [ ] Add filtered data methods to DataService
- [ ] Implement pagination for large lists
- [ ] Add data caching for performance
- [ ] Add search/filter UI components
- [ ] Optimize data loading patterns

### **7. Missing Loading States**
**Status**: 🟡 **MEDIUM** - No feedback during data operations

**Problems**:
- Users don't know when operations are in progress
- No loading indicators for async operations
- Poor perceived performance

**TODO**:
- [ ] Add loading spinners to all async operations
- [ ] Create skeleton loaders for data lists
- [ ] Add progress indicators for form submissions
- [ ] Implement optimistic updates where appropriate

---

## 🎨 **PRIORITY 4: UI/UX Improvements**

### **8. Missing Delete Operations**
**Status**: 🟡 **MEDIUM** - No way to delete data in UI

**Problems**:
- No delete buttons for cars, alerts, service records
- No confirmation dialogs for destructive actions
- Incomplete CRUD operations

**TODO**:
- [ ] Create `DeleteConfirmDialog` component
- [ ] Add delete buttons to all entity lists
- [ ] Add confirmation dialogs for all delete operations
- [ ] Implement soft delete where appropriate
- [ ] Add bulk delete functionality

### **9. Inconsistent Form Validation**
**Status**: 🟡 **MEDIUM** - Validation scattered and inconsistent

**Problems**:
- Different validation rules in different components
- No centralized validation logic
- Poor error message consistency

**TODO**:
- [ ] Create centralized validation service
- [ ] Standardize error messages across all forms
- [ ] Add real-time validation feedback
- [ ] Implement form state management
- [ ] Add validation for all required fields

### **10. Missing Responsive Design**
**Status**: 🟡 **MEDIUM** - Poor mobile experience

**Problems**:
- Forms not optimized for mobile
- Date inputs difficult on mobile devices
- Poor touch targets

**TODO**:
- [ ] Optimize all forms for mobile devices
- [ ] Add touch-friendly date pickers
- [ ] Improve mobile navigation
- [ ] Add mobile-specific UI patterns

---

## 📋 **IMPLEMENTATION TIMELINE**

### **Week 1: Core UI Components**
- [ ] Create `RussianDateInput` component
- [ ] Create `MileageInput` component
- [ ] Create `DeleteConfirmDialog` component
- [ ] Create `useDataError` hook
- [ ] Add loading state components

### **Week 2: Interface Standardization**
- [ ] Fix ServiceOperation interface mismatch
- [ ] Standardize all data interfaces
- [ ] Update all components to use new interfaces
- [ ] Add proper TypeScript types

### **Week 3: Error Handling & Validation**
- [ ] Implement centralized error handling
- [ ] Add toast notifications for all operations
- [ ] Create validation service
- [ ] Add error boundaries
- [ ] Implement form validation

### **Week 4: Performance & UX**
- [ ] Add filtered data methods
- [ ] Implement pagination
- [ ] Add search/filter components
- [ ] Optimize mobile experience
- [ ] Add delete operations

### **Week 5: Testing & Polish**
- [ ] Test all components with Russian locale
- [ ] Test error scenarios
- [ ] Test mobile responsiveness
- [ ] Final UI/UX polish
- [ ] Performance testing

---

## �� **SUCCESS CRITERIA**

### **Before Java Backend Development**
- [ ] All date inputs display in Russian format
- [ ] All mileage inputs properly validated
- [ ] No interface mismatches between UI and data
- [ ] All errors properly handled and displayed
- [ ] All forms have proper validation
- [ ] All CRUD operations available in UI
- [ ] Mobile-responsive design
- [ ] Consistent user experience across all pages

### **Quality Standards**
- [ ] No console errors in development
- [ ] All TypeScript types properly defined
- [ ] All components properly tested
- [ ] Performance acceptable on mobile devices
- [ ] Accessibility standards met
- [ ] Russian locale properly implemented

---

## 📝 **NOTES**

### **Architecture Compliance**
- All fixes must maintain the principle that **frontend = UI only**
- No business logic should be added to frontend
- All data operations must go through DataService
- UI components should be purely presentational

### **Backend Preparation**
- All data interfaces must be ready for backend API
- Date formats must be compatible with backend expectations
- Error handling must work for both localStorage and API modes
- All CRUD operations must be implemented for backend integration

### **Testing Requirements**
- Test all components with Russian locale
- Test error scenarios and edge cases
- Test mobile responsiveness
- Test performance with large datasets
- Test data migration scenarios

---

**Last Updated**: January 2025  
**Status**: Ready for implementation  
**Priority**: Must complete before Java backend development 