# PDF Export Feature for Maintenance Plan

## Overview
The maintenance plan now includes a PDF export feature that allows users to generate a professional PDF document containing their maintenance plan data.

## Features

### Manual PDF Export
- Users can click the "Экспорт в PDF" button to generate a PDF of the current maintenance plan
- The PDF includes both maintenance and repair data
- Automatic filename generation based on car name and date

### Automatic PDF Export on Save
- When users save the maintenance plan, a PDF is automatically generated
- This ensures users always have a backup copy of their saved plan

## PDF Content

### Header Information
- Title: "План технического обслуживания"
- Car name
- Current date
- Current mileage

### Maintenance Table
- Periodic maintenance operations
- Resources required
- Notes and comments
- Automatic numbering

### Repairs Table
- Repair operations
- Resources required
- Notes and comments
- Automatic numbering

### Footer
- Creation date

## Technical Implementation

### Dependencies
- jsPDF library (loaded from CDN)
- Version: 2.5.1

### File Structure
- `public/index.html`: Added jsPDF library
- `public/maintenance/maintenance-plan.html`: Added export button
- `src/maintenancePlanUI.js`: PDF generation logic

### Key Functions
- `exportToPDF()`: Main PDF generation function
- `splitText()`: Text wrapping for long content
- Loading state management for better UX

## User Experience

### Loading States
- Button shows "Создание PDF..." during generation
- Button is disabled during processing
- Success/error messages displayed

### Error Handling
- Checks for jsPDF library availability
- Validates data presence before export
- Detailed error messages for troubleshooting

### File Naming
- Format: `maintenance_plan_[car_name]_[date].pdf`
- Date format: DD-MM-YYYY
- Special characters in car names are handled

## Browser Compatibility
- Works in all modern browsers
- Requires internet connection for jsPDF library
- Fallback error handling if library fails to load

## Future Enhancements
- Custom PDF templates
- Additional formatting options
- Print-friendly styling
- Multiple language support 