# Minimal Backend Demo for Car Tech Tracker

## 🎯 Goal
Create a minimal working backend that handles business logic, allowing the frontend to be clean and UI-focused.

## 🏗️ Architecture
- **Frontend**: Pure UI, no business logic
- **Backend**: Simple Java Spring Boot with essential business logic
- **Data**: In-memory storage for demo (easy to switch to database later)

## 📁 Structure
```
backend-demo/
├── src/main/java/com/cartech/
│   ├── controller/     # REST API endpoints
│   ├── service/        # Business logic
│   ├── model/          # Data models
│   └── config/         # Configuration
├── pom.xml             # Maven dependencies
└── application.yml     # Spring configuration
```

## 🚀 Quick Start
1. Install Java 17+
2. Run: `mvn spring-boot:run`
3. Backend will be available at: `http://localhost:8080`
4. Frontend config: Set `useBackend: true` in `src/config.js`

## 📋 API Endpoints
- `POST /api/auth/login` - User authentication
- `GET /api/cars` - Get user's cars
- `POST /api/maintenance` - Save maintenance record
- `GET /api/maintenance` - Get maintenance history
- `POST /api/repairs` - Save repair record
- `GET /api/repairs` - Get repair history
- `POST /api/maintenance/calculate` - Calculate maintenance costs
- `GET /api/maintenance/alerts/{carId}` - Get maintenance alerts 