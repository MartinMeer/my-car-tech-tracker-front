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
  - The Java backend provides all business logic, data storage, and API endpoints.
  - The frontend communicates with the backend via RESTful API calls (or similar), using a service layer abstraction.

- **Lightweight & Maintainable:**
  - Uses vanilla HTML, CSS, and JavaScript (no heavy frameworks) for fast load times and easy maintenance.
  - Modular code structure for easy extension and future feature integration (e.g., AI, analytics).

- **Configurable Data Source:**
  - During development, the frontend can use localStorage for demo/testing.
  - A single config switch enables production mode, using the backend API for all data operations.

---

## Backend Modules (Planned)
1. **User Accounts:** Authentication, authorization, and user management.
2. **Car Accounts:** Add/update/remove car info, with future integration to manufacturer databases.
3. **Technical Maintenance:** Scheduling, logging, and reminders for periodic maintenance.
4. **Repair Works:** Tracking repairs, preventive actions, and repair history.
5. **Finance Accounting:** Oils, spares, insurance, and financial statistics.

---

## Frontend Responsibilities
- **UI Rendering:** Dynamic loading of HTML partials for each section/page.
- **Routing:** Hash-based navigation for SPA-like experience.
- **User Interaction:** Forms, popups, confirmation dialogs, and responsive design.
- **Service Layer:** Abstracts data operations, switching between localStorage (demo) and backend API (production).
- **Minimal Client Logic:** Only basic validation and UI state management; all critical logic is backend-driven.

---

## Extensibility & Future-Proofing
- **Modular Design:** Easy to add new features or integrate with external APIs.
- **AI-Ready:** Clean data flow and separation of concerns make it easy to add analytics or AI features later.
- **Documentation:** This file serves as a reference for future contributors and maintainers.

---

## Key Takeaways
- **Frontend = UI/UX only.**
- **All business logic = Java backend.**
- **Lightweight, maintainable, and scalable.**
- **Easy to switch between demo and production modes.**

---

*For any architectural or integration questions, refer to this summary as the guiding principle for frontend/backend separation and project extensibility.* 