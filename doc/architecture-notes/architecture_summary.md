# My Car Tech Tracker — Concept & Architecture Summary

## Project Vision
A modular, scalable car maintenance and repair tracker for individuals and small/medium transportation companies. The frontend is lightweight and focused solely on UI and client-side logic, while all business logic and data management are delegated to a Java backend.

---

## Architectural Principles

- **Frontend = UI Only:**
  - The frontend is responsible for rendering views, handling user interactions, and basic client-side validation.
  - No business logic or data processing is performed on the frontend beyond what is necessary for UI responsiveness.
  - All business rules, calculations, and data integrity are enforced by the backend.

- **Backend-Driven:**
  - The Java backend (will be crated later) provides all business logic, data storage, and API endpoints.
  - The frontend communicates with the backend via RESTful API calls (or similar), using a service layer abstraction.


- **Configurable Data Source:**
  - During development, the frontend can use localStorage for demo/testing.
  - A single config switch enables production mode, using the backend API for all data operations.

