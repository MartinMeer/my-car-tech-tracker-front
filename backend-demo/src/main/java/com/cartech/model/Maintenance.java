package com.cartech.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class Maintenance {
    private Long id;
    
    @NotNull(message = "Car ID is required")
    private Long carId;
    
    @NotBlank(message = "Date is required")
    @Pattern(regexp = "\\d{2}\\.\\d{2}\\.\\d{4}", message = "Date must be in format dd.MM.yyyy")
    private String date;
    
    @NotNull(message = "Mileage is required")
    @Min(value = 0, message = "Mileage cannot be negative")
    private Integer mileage;
    
    @NotBlank(message = "Operation name is required")
    private String operationName;
    
    @Valid
    private List<ConsumableItem> consumables;
    
    @NotNull(message = "Work cost is required")
    @Min(value = 0, message = "Work cost cannot be negative")
    private BigDecimal workCost;
    
    @NotNull(message = "Total cost is required")
    @Min(value = 0, message = "Total cost cannot be negative")
    private BigDecimal totalCost;
    
    private Long serviceRecordId;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    // Constructors
    public Maintenance() {}
    
    public Maintenance(Long carId, String date, Integer mileage, String operationName, 
                      List<ConsumableItem> consumables, BigDecimal workCost) {
        this.carId = carId;
        this.date = date;
        this.mileage = mileage;
        this.operationName = operationName;
        this.consumables = consumables;
        this.workCost = workCost;
        this.totalCost = calculateTotalCost();
        this.createdAt = LocalDateTime.now();
    }
    
    // Business logic method - moved from frontend
    private BigDecimal calculateTotalCost() {
        BigDecimal consumablesCost = BigDecimal.ZERO;
        if (consumables != null) {
            for (ConsumableItem item : consumables) {
                BigDecimal itemCost = item.getCost().multiply(BigDecimal.valueOf(item.getQuantity()));
                consumablesCost = consumablesCost.add(itemCost);
            }
        }
        return consumablesCost.add(workCost != null ? workCost : BigDecimal.ZERO);
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getCarId() { return carId; }
    public void setCarId(Long carId) { this.carId = carId; }
    
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    
    public Integer getMileage() { return mileage; }
    public void setMileage(Integer mileage) { this.mileage = mileage; }
    
    public String getOperationName() { return operationName; }
    public void setOperationName(String operationName) { this.operationName = operationName; }
    
    public List<ConsumableItem> getConsumables() { return consumables; }
    public void setConsumables(List<ConsumableItem> consumables) { 
        this.consumables = consumables;
        this.totalCost = calculateTotalCost(); // Recalculate when consumables change
    }
    
    public BigDecimal getWorkCost() { return workCost; }
    public void setWorkCost(BigDecimal workCost) { 
        this.workCost = workCost;
        this.totalCost = calculateTotalCost(); // Recalculate when work cost changes
    }
    
    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }
    
    public Long getServiceRecordId() { return serviceRecordId; }
    public void setServiceRecordId(Long serviceRecordId) { this.serviceRecordId = serviceRecordId; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
} 