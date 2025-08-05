## MAIN NOTE ##
PAY YOUR ATTENTION: there must be a clear separation between dev mode with further Java backend and demo abilities, working with localStorage

## FIX IT! ##
OK READY There is a car inconsistency through all pages. Pls analyse it and fix it. Note: there is a two mock hardcoded cars. I mean, that they are not needed, for demo using let user add your own mock cars

## REFACTOR IT! ##



## FEAT IT! ##

1. Create a ready-to-work cars list
2. Add car editing capability
3. maintenance-planning: Collapse Периодическое обслуживание to 4 first due-out and due-soon entries, and add View all capability to expand all entries
4. Add a service-shops feature:
    4.1 Create a service-shops list. Columns: Name, Contacts, Rating, Actions (Edit, Delete for whole entry). Attach to table the Add-new functionality
    4.2 Create a button to service-shops list in maintenance-planning header
    4.3 Pull entries from the service-shops list to Планируемый исполнитель
    4.4 All change state operations - with standard project-style confirmation
5.maintenance-planning: add export-to-pdf funcionality.
    5.1 Add html2pdf.js to project
    5.2 Add export button in maintenance-planning between Сохранить план и Отправить на обслуживание
    5.3 Separate exporting from saving: export must be available after saving
OK READY  Add car-edit feature:
    6.1 User select concrete car from main dashboard (root page) and go to this concrete car page
    6.2 In car page add Edit-car button
    6.2 On click, open the add-car page for editing
    6.4 All change state operations - with standard project-style confirmation
7. Add a Refrences (Справочник) funtionality for car (Periodical maintenance guide, Volumes of consumables)


8. FINALLY! Add car-delete feature. 
    8.1 User select concrete car from main dashboard (root page) and go to this concrete car page
    8.2 Create a delete-car button
    8.3 When car leave the fleet, all tis car related information for all time must be archieved on db via backend. Now, untill the backend is not created, let create a json with all gathered information from all parts of app, and let can be saved as file to client's OS filesystem













5. my-car-overview: add color change logic for fleet-maintenance-preview, red-yellow-green, depends on existing overdues and due-soon entries in my-car-overview.
6. my-car-overview: add previews for each car-problem-icons
7. service-card: delete from maitn-entry-popup data autoloading, remain  custom input field with add consumable-item functionality
8. service-record: Add text: Запиши все замечания и рекомендации автосервиса в разделе У нас проблемы! Add button to add new user alert. user-alert must be open for current car, with current date and current mileage (skipping car selection popup and date-mileage selection popup). When save, return back to current service-record page.
9. renderCarsList in reglament page - Has its own implementation of renderCarsList with different styling and layout. 



## IMPLEMENT IT! ##
1. Create a logo and use it everywhere
3. Restore a service-record history, link it to maintenace-history in my-car-overview 

## BACKEND ##
1. service-card: to operation-dropdown, list must become from car-related maintenanca-schedule
