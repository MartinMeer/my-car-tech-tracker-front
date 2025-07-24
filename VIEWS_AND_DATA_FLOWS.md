# 🚗 Car Tech Tracker - Views & Data Flows Documentation

## 📋 Overview

This document describes all user interface views and their corresponding data flows in the Car Tech Tracker application. The application follows a modular architecture with clear separation between UI components and data services.

---

## 🏗️ Application Architecture

### **Data Flow Pattern**
```
User Action → UI Component → DataService → Backend API → Database → Response → UI Update
```

### **Key Components**
- **Views**: HTML pages with embedded JavaScript
- **UI Modules**: JavaScript files handling specific feature UI logic
- **DataService**: Centralized data communication layer
- **Backend**: Spring Boot API with business logic
- **Authentication**: JWT-based auth with cookie management

---

## 🎯 Core Views & Data Flows

### **1. Main Dashboard (`index.html`)**

#### **View Purpose**
- Primary application interface
- Car selection and navigation hub
- Quick access to main features

#### **Data Flow**
```
Page Load → Check Authentication → Load Current Car → Update UI → Setup Navigation
```

#### **Key Components**
- **Car Selection**: Dropdown with user's cars
- **Main Action Buttons**: Service card, problems, planning, history
- **Navigation**: Sidebar with feature access
- **Mobile Menu**: Responsive navigation

#### **Data Interactions**
```javascript
// Load current car info
DataService.getCurrentCarId() → Update car image/name
DataService.getCars() → Populate car selection menu
CookieHandler.getAuthToken() → Verify authentication
```

---

### **2. Car Management Views**

#### **2.1 My Cars List (`cars/my-cars.html`)**

**View Purpose**: Display all user's cars with selection capability

**Data Flow**:
```
Page Load → Load Cars List → Render Car Cards → Setup Click Handlers → Navigation
```

**Key Features**:
- Grid layout of car cards
- Car image/nickname display
- Click to select car
- Add new car button

**Data Interactions**:
```javascript
DataService.getCars() → Render car list
DataService.setCurrentCarId(carId) → Switch active car
```

#### **2.2 Add Car Form (`cars/add-car.html`)**

**View Purpose**: Create new car entries with validation

**Data Flow**:
```
Form Input → Validation → Image Processing → Save Car → Update List → Navigation
```

**Key Features**:
- Multi-step form with sections
- Image upload with preview
- Real-time validation
- Draft saving capability

**Data Interactions**:
```javascript
// Form validation
validateCarForm() → Show/hide errors

// Image processing
FileReader.readAsDataURL() → Base64 conversion

// Save car
DataService.saveCars(updatedCars) → Backend API call
```

#### **2.3 Car Overview (`cars/my-car-overview.html`)**

**View Purpose**: Detailed car information with financial summaries

**Data Flow**:
```
Load Car Details → Calculate Totals → Render Overview → Setup Action Buttons
```

**Key Features**:
- Car details display
- Financial summaries (TO costs, repair costs, total ownership)
- Quick access to maintenance/repair history
- Edit/delete car actions

**Data Interactions**:
```javascript
// Load car details
DataService.getCars() → Find current car → Display info

// Calculate financial totals
DataService.getMaintenance() → Filter by car → Sum costs
DataService.getRepairs() → Filter by car → Sum costs

// Setup actions
DataService.deleteCar(carId) → Confirmation → Remove from list
```

---

### **3. Service Management Views**

#### **3.1 Service Card (`service-card.html`)**

**View Purpose**: Comprehensive service record creation with multiple operations

**Data Flow**:
```
Initialize Form → Load Operations → Add Sub-Records → Calculate Totals → Save Draft/Final
```

**Key Features**:
- Two-panel layout (add operations + sub-records list)
- Operation templates with auto-fill
- Custom operation creation
- Draft saving system
- Real-time calculations

**Data Interactions**:
```javascript
// Load operation templates
DataService.getOperationTemplates() → Populate dropdown

// Add sub-record
createSubRecord(operationData) → Add to list → Update totals

// Save draft
DataService.saveServiceRecord(draftData) → Local storage/API

// Save final
DataService.saveServiceRecord(finalData) → Backend API
```

#### **3.2 Maintenance History (`maintenance/mainten-history.html`)**

**View Purpose**: Display chronological maintenance records

**Data Flow**:
```
Load Maintenance Data → Filter by Car → Sort by Date → Render Table → Setup Actions
```

**Key Features**:
- Chronological list of maintenance records
- Cost summaries
- Operation details
- Edit/delete capabilities

**Data Interactions**:
```javascript
DataService.getMaintenance() → Filter by current car → Sort by date
DataService.deleteMaintenance(recordId) → Remove from list
```

#### **3.3 Repair History (`repair/repair-history.html`)**

**View Purpose**: Display repair records with cost tracking

**Data Flow**:
```
Load Repair Data → Filter by Car → Sort by Date → Render Table → Setup Actions
```

**Key Features**:
- Repair records with spares used
- Cost breakdowns
- Problem descriptions
- Service provider info

**Data Interactions**:
```javascript
DataService.getRepairs() → Filter by current car → Sort by date
DataService.deleteRepair(recordId) → Remove from list
```

---

### **4. Planning & Alerts Views**

#### **4.1 Service Plan (`service-plan.html`)**

**View Purpose**: Plan future maintenance and track upcoming service needs

**Data Flow**:
```
Load Current Mileage → Calculate Next Service → Display Plan → Add Custom Operations
```

**Key Features**:
- Next maintenance calculations
- Custom service plan items
- Mileage tracking
- Due date alerts

**Data Interactions**:
```javascript
// Load current mileage
DataService.getCurrentMileage() → Calculate next service

// Add mileage entry
DataService.saveMileage(mileageData) → Update calculations

// Add custom operation
DataService.saveServicePlan(planItem) → Add to plan
```

#### **4.2 User Alerts (`user-alert.html`)**

**View Purpose**: Report car problems with priority classification

**Data Flow**:
```
Load Car Info → Select Problem Type → Set Priority → Describe Issue → Save Alert
```

**Key Features**:
- Problem categorization by system
- Priority levels (critical, warning, info)
- Detailed problem descriptions
- Auto-filled car/mileage info

**Data Interactions**:
```javascript
// Load current car info
DataService.getCurrentCar() → Auto-fill car details

// Save alert
DataService.saveAlert(alertData) → Backend API
```

#### **4.3 Alert List (`alert-list.html`)**

**View Purpose**: Manage and view all reported problems

**Data Flow**:
```
Load Alerts → Filter by Priority → Render List → Setup Actions
```

**Key Features**:
- Priority-based filtering
- Problem status tracking
- Resolution notes
- Bulk actions

**Data Interactions**:
```javascript
DataService.getAlerts() → Filter by car → Sort by priority
DataService.updateAlert(alertId, updates) → Mark resolved
```

---

### **5. Authentication Views**

#### **5.1 Login (`auth/login.html`)**

**View Purpose**: User authentication with demo mode support

**Data Flow**:
```
Form Input → Validation → Authentication → Token Storage → Redirect to Dashboard
```

**Key Features**:
- Email/password authentication
- Demo mode with preset credentials
- Remember me functionality
- Error handling

**Data Interactions**:
```javascript
// Authentication
AuthService.login(credentials) → JWT token → Cookie storage

// Demo mode
localStorage.setItem('demo_user', userData) → Auto-login
```

#### **5.2 Registration (`auth/register.html`)**

**View Purpose**: New user account creation

**Data Flow**:
```
Form Input → Validation → Account Creation → Auto-login → Redirect
```

**Key Features**:
- Email verification
- Password strength validation
- Terms acceptance
- Welcome flow

**Data Interactions**:
```javascript
AuthService.register(userData) → Account creation → Auto-login
```

---

### **6. Information Views**

#### **6.1 Oils Info (`info/oils.html`)**
- Static content about car oils and fluids
- No data interactions

#### **6.2 Spares Info (`info/spares.html`)**
- Information about spare parts
- No data interactions

#### **6.3 Shops Info (`info/shops.html`)**
- Service shop information
- No data interactions

#### **6.4 Contacts (`info/contacts.html`)**
- Contact information
- No data interactions

#### **6.5 Privacy (`info/privacy.html`)**
- Privacy policy
- No data interactions

---

## 🔄 Data Service Layer

### **Core Data Operations**

#### **Car Management**
```javascript
DataService.getCars() → Returns user's cars
DataService.saveCars(cars) → Saves car list
DataService.getCurrentCarId() → Returns active car ID
DataService.setCurrentCarId(carId) → Sets active car
```

#### **Maintenance Operations**
```javascript
DataService.saveMaintenance(data) → Saves maintenance record
DataService.getMaintenance() → Returns maintenance history
DataService.deleteMaintenance(id) → Removes maintenance record
```

#### **Repair Operations**
```javascript
DataService.saveRepair(data) → Saves repair record
DataService.getRepairs() → Returns repair history
DataService.deleteRepair(id) → Removes repair record
```

#### **Service Records**
```javascript
DataService.saveServiceRecord(record) → Saves service record
DataService.getServiceRecords(carId) → Returns service records
DataService.updateServiceRecord(id, updates) → Updates record
```

#### **Alerts & Planning**
```javascript
DataService.saveAlert(alert) → Saves user alert
DataService.getAlerts() → Returns alerts list
DataService.saveMileage(mileage) → Saves mileage entry
```

---

## 🔐 Authentication Flow

### **Login Process**
```
1. User enters credentials
2. AuthService.login() called
3. Backend validates credentials
4. JWT token returned
5. Token stored in cookies
6. User redirected to dashboard
```

### **Protected Routes**
```
1. Check for valid JWT token
2. Validate token with backend
3. Load user data
4. Allow access to protected views
```

### **Token Management**
```javascript
CookieHandler.setAuthToken(token) → Store JWT
CookieHandler.getAuthToken() → Retrieve JWT
CookieHandler.clearAuthToken() → Remove JWT
```

---

## 📱 Mobile Responsiveness

### **Responsive Design Patterns**
- **Desktop**: Full sidebar navigation
- **Tablet**: Collapsible sidebar
- **Mobile**: Bottom navigation + hamburger menu

### **Touch Interactions**
- Swipe gestures for car selection
- Touch-friendly form inputs
- Mobile-optimized buttons

---

## 🎨 UI Component Patterns

### **Common UI Elements**
- **Cards**: Car display, service records
- **Forms**: Multi-step validation
- **Modals**: Confirmations, inputs
- **Tables**: History displays
- **Buttons**: Primary, secondary, danger actions

### **State Management**
- **Loading States**: Spinners, placeholders
- **Error States**: Error messages, retry options
- **Empty States**: Helpful messages, action buttons
- **Success States**: Confirmations, next steps

---

## 🔧 Error Handling

### **Network Errors**
```javascript
try {
  const data = await DataService.getCars();
  renderCars(data);
} catch (error) {
  showError('Ошибка загрузки: ' + error.message);
  showRetryButton();
}
```

### **Validation Errors**
```javascript
validateForm() → Show field-specific errors
handleBackendValidation(response) → Display server errors
```

### **User Feedback**
- **Success Messages**: Green notifications
- **Warning Messages**: Yellow alerts
- **Error Messages**: Red error displays
- **Info Messages**: Blue information

---

## 📊 Performance Considerations

### **Data Loading**
- **Lazy Loading**: Load data only when needed
- **Caching**: Cache frequently accessed data
- **Pagination**: Large datasets pagination

### **UI Optimization**
- **Debouncing**: Form input validation
- **Throttling**: Scroll events
- **Virtual Scrolling**: Large lists

---

## 🧪 Testing Strategy

### **Unit Tests**
- DataService methods
- UI component functions
- Utility functions

### **Integration Tests**
- API communication
- Authentication flow
- Data persistence

### **E2E Tests**
- User workflows
- Cross-browser compatibility
- Mobile responsiveness

---

This comprehensive view and data flow documentation provides a complete understanding of how users interact with the application and how data flows through the system. Each view has specific responsibilities and clear data interactions that maintain the application's modular architecture. 