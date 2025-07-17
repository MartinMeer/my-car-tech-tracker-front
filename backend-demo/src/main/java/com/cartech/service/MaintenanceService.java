package com.cartech.service;

import com.cartech.model.Maintenance;
import com.cartech.model.ConsumableItem;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class MaintenanceService {
    
    // In-memory storage for demo (replace with database later)
    private final Map<Long, Maintenance> maintenanceRecords = new HashMap<>();
    private final AtomicLong idCounter = new AtomicLong(1);
    
    // Business logic moved from frontend
    public MaintenanceCalculationResult calculateMaintenanceCost(MaintenanceCalculationRequest request) {
        BigDecimal consumablesCost = BigDecimal.ZERO;
        List<ConsumableItem> validatedConsumables = new ArrayList<>();
        
        // Validate and calculate consumables
        if (request.getConsumables() != null) {
            for (ConsumableItem item : request.getConsumables()) {
                if (item.getName() != null && !item.getName().trim().isEmpty()) {
                    // Validate cost and quantity
                    if (item.getCost() == null || item.getCost().compareTo(BigDecimal.ZERO) < 0) {
                        item.setCost(BigDecimal.ZERO);
                    }
                    if (item.getQuantity() == null || item.getQuantity() < 1) {
                        item.setQuantity(1);
                    }
                    
                    item.calculateTotalCost();
                    consumablesCost = consumablesCost.add(item.getTotalCost());
                    validatedConsumables.add(item);
                }
            }
        }
        
        // Validate work cost
        BigDecimal workCost = request.getWorkCost();
        if (workCost == null || workCost.compareTo(BigDecimal.ZERO) < 0) {
            workCost = BigDecimal.ZERO;
        }
        
        BigDecimal totalCost = consumablesCost.add(workCost);
        
        return new MaintenanceCalculationResult(
            validatedConsumables,
            workCost,
            totalCost
        );
    }
    
    public Maintenance saveMaintenance(Maintenance maintenance) {
        // Validate business rules
        validateMaintenance(maintenance);
        
        // Set ID if not provided
        if (maintenance.getId() == null) {
            maintenance.setId(idCounter.getAndIncrement());
        }
        
        // Recalculate total cost
        maintenance.setTotalCost(calculateTotalCost(maintenance));
        
        // Store in memory
        maintenanceRecords.put(maintenance.getId(), maintenance);
        
        return maintenance;
    }
    
    public List<Maintenance> getMaintenanceByCarId(Long carId) {
        return maintenanceRecords.values().stream()
            .filter(m -> m.getCarId().equals(carId))
            .sorted(Comparator.comparing(Maintenance::getDate).reversed())
            .toList();
    }
    
    public List<Maintenance> getAllMaintenance() {
        return maintenanceRecords.values().stream()
            .sorted(Comparator.comparing(Maintenance::getDate).reversed())
            .toList();
    }
    
    public Maintenance getMaintenanceById(Long id) {
        return maintenanceRecords.get(id);
    }
    
    public void deleteMaintenance(Long id) {
        maintenanceRecords.remove(id);
    }
    
    // Business validation logic moved from frontend
    private void validateMaintenance(Maintenance maintenance) {
        List<String> errors = new ArrayList<>();
        
        // Validate date format
        if (maintenance.getDate() == null || !maintenance.getDate().matches("\\d{2}\\.\\d{2}\\.\\d{4}")) {
            errors.add("Invalid date format. Expected dd.MM.yyyy");
        }
        
        // Validate mileage
        if (maintenance.getMileage() == null || maintenance.getMileage() < 0) {
            errors.add("Mileage must be non-negative");
        }
        
        // Validate operation name
        if (maintenance.getOperationName() == null || maintenance.getOperationName().trim().isEmpty()) {
            errors.add("Operation name is required");
        }
        
        if (!errors.isEmpty()) {
            throw new IllegalArgumentException("Validation failed: " + String.join(", ", errors));
        }
    }
    
    // Business calculation logic moved from frontend
    private BigDecimal calculateTotalCost(Maintenance maintenance) {
        BigDecimal consumablesCost = BigDecimal.ZERO;
        
        if (maintenance.getConsumables() != null) {
            for (ConsumableItem item : maintenance.getConsumables()) {
                if (item.getTotalCost() != null) {
                    consumablesCost = consumablesCost.add(item.getTotalCost());
                }
            }
        }
        
        BigDecimal workCost = maintenance.getWorkCost() != null ? maintenance.getWorkCost() : BigDecimal.ZERO;
        return consumablesCost.add(workCost);
    }
    
    // Inner classes for API requests/responses
    public static class MaintenanceCalculationRequest {
        private List<ConsumableItem> consumables;
        private BigDecimal workCost;
        
        // Getters and setters
        public List<ConsumableItem> getConsumables() { return consumables; }
        public void setConsumables(List<ConsumableItem> consumables) { this.consumables = consumables; }
        
        public BigDecimal getWorkCost() { return workCost; }
        public void setWorkCost(BigDecimal workCost) { this.workCost = workCost; }
    }
    
    public static class MaintenanceCalculationResult {
        private List<ConsumableItem> consumables;
        private BigDecimal workCost;
        private BigDecimal totalCost;
        
        public MaintenanceCalculationResult(List<ConsumableItem> consumables, BigDecimal workCost, BigDecimal totalCost) {
            this.consumables = consumables;
            this.workCost = workCost;
            this.totalCost = totalCost;
        }
        
        // Getters
        public List<ConsumableItem> getConsumables() { return consumables; }
        public BigDecimal getWorkCost() { return workCost; }
        public BigDecimal getTotalCost() { return totalCost; }
    }
} 