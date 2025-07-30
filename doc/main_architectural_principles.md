## Architectural Principles

Frontend (Vanilla JavaScript + HTML + CSS)
├── Single Page Application (SPA)
├── Client-side routing with hash-based navigation
├── Modular JavaScript architecture
├── Responsive design with mobile-first approach
└── Service-oriented data layer

- **Frontend = UI Only:**
  - The frontend is responsible for rendering views, handling user interactions, and basic client-side validation.
  - No business logic or data processing is performed on the frontend beyond what is necessary for UI responsiveness.
  - All business rules, calculations, and data integrity are enforced by the backend.

- **Backend-Driven:**
  - The Java backend provides all business logic, data storage, and API endpoints.
  - The frontend communicates with the backend via RESTful API calls (or similar), using a service layer abstraction.

- **Lightweight & Maintainable:**
  - Uses vanilla HTML, CSS, and JavaScript (no heavy frameworks) for fast load times and easy maintenance.
  - Modular code structure for easy extension and future feature integration (e.g., AI, analytics).

- **Configurable Data Source:**
  - During development, the frontend can use localStorage for demo/testing.
  - A single config switch enables production mode, using the backend API for all data operations.