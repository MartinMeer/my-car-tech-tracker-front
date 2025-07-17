package com.cartech.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class ConsumableItem {
    private Long id;
    
    @NotBlank(message = "Name is required")
    private String name;
    
    private String item;
    
    @NotNull(message = "Cost is required")
    @Min(value = 0, message = "Cost cannot be negative")
    private BigDecimal cost;
    
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
    
    private BigDecimal totalCost;
    
    // Constructors
    public ConsumableItem() {}
    
    public ConsumableItem(String name, String item, BigDecimal cost, Integer quantity) {
        this.name = name;
        this.item = item;
        this.cost = cost;
        this.quantity = quantity;
        this.totalCost = cost.multiply(BigDecimal.valueOf(quantity));
    }
    
    // Business logic method - moved from frontend
    public void calculateTotalCost() {
        if (cost != null && quantity != null) {
            this.totalCost = cost.multiply(BigDecimal.valueOf(quantity));
        }
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getItem() { return item; }
    public void setItem(String item) { this.item = item; }
    
    public BigDecimal getCost() { return cost; }
    public void setCost(BigDecimal cost) { 
        this.cost = cost;
        calculateTotalCost();
    }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { 
        this.quantity = quantity;
        calculateTotalCost();
    }
    
    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }
} 