## FIX IT! ##
✅ New car creating: year selector don't select a needed date
✅ Cover: remove icons from login/pswd
✅ Register.html: remove icons from all fields

✅ Unify car name representations in all pages
✅ add-car: make mileage field not required because it is not static info, controls by dynamic monitor
✅ add-car: when cancel without saving, opens a old car-list page.
✅ add-car: integrate mileage to technical-state-section, because it is not static info, controls by dynamic monitor
✅ my-car-overview: in tech-state-header, a selection user alerts by date is not working
✅ service-history: when save&close, return back to service-history page

1. Check out all links in the site map

## REFACTOR IT! ##
1. my-car-overview: rename sectons
Create a comprehensive, step-by-step migration guide from current vanilla JavaScript app to Vue.js 3. This must be designed for someone new to modern frontend frameworks. Core Principle: Frontend = Pure UI Layer
What Frontend SHOULD do:
✅ Display data from backend
✅ Capture user input
✅ Handle UI state (loading, errors)
✅ Client-side routing
✅ Form validation (UX only)
✅ UI interactions and animations
What Frontend SHOULD NOT do:
❌ Business calculations (cost totals, maintenance schedules)
❌ Data validation (backend validates)
❌ Business rules (maintenance intervals, due dates)
❌ Data persistence logic
❌ Complex data transformations
PAY YOUR ATTENTION: there must be a clear separation between dev mode with further Java backend and demo abilities, working with localStorage
DO NOT write any code, just create a comprehensive, step-by-step migration guide for further step-by-step implementation instructions for AI




## FEAT IT! ##

2. my-car-overview: add to plan btn and functionality for each alert entry
✅ index.html: delete right-icons section
❌❌❌ Create a very compact site-map in footer:

5. my-car-overview: add color change logic for fleet-maintenance-preview, red-yellow-green, depends on existing overdues and due-soon entries in my-car-overview.
6. my-car-overview: add previews for each car-problem-icons
7. service-card: delete from maitn-entry-popup data autoloading, remain  custom input field with add consumable-item functionality
8. service-record: Add text: Запиши все замечания и рекомендации автосервиса в разделе У нас проблемы! Add button to add new user alert. user-alert must be open for current car, with current date and current mileage (skipping car selection popup and date-mileage selection popup). When save, return back to current service-record page.
9. renderCarsList in reglament page - Has its own implementation of renderCarsList with different styling and layout. 



## IMPLEMENT IT! ##
1. Create a logo and add it everywhere
2. Create a cover's banner, a blocks to cover (or landing page)
3. Restore a service-record history, link it to maintenace-history in my-car-overview 

## BACKEND ##
1. service-card: to operation-dropdown, list must become from car-related maintenanca-schedule
