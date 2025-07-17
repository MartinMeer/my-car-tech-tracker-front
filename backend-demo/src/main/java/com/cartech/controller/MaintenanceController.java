package com.cartech.controller;

import com.cartech.model.Maintenance;
import com.cartech.service.MaintenanceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/maintenance")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "file://"})
public class MaintenanceController {
    
    @Autowired
    private MaintenanceService maintenanceService;
    
    /**
     * Calculate maintenance cost - business logic moved from frontend
     */
    @PostMapping("/calculate")
    public ResponseEntity<MaintenanceService.MaintenanceCalculationResult> calculateCost(
            @RequestBody MaintenanceService.MaintenanceCalculationRequest request) {
        try {
            MaintenanceService.MaintenanceCalculationResult result = 
                maintenanceService.calculateMaintenanceCost(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    /**
     * Save maintenance record
     */
    @PostMapping
    public ResponseEntity<Maintenance> saveMaintenance(@Valid @RequestBody Maintenance maintenance) {
        try {
            Maintenance saved = maintenanceService.saveMaintenance(maintenance);
            return ResponseEntity.ok(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get all maintenance records
     */
    @GetMapping
    public ResponseEntity<List<Maintenance>> getAllMaintenance() {
        try {
            List<Maintenance> records = maintenanceService.getAllMaintenance();
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get maintenance records by car ID
     */
    @GetMapping("/car/{carId}")
    public ResponseEntity<List<Maintenance>> getMaintenanceByCarId(@PathVariable Long carId) {
        try {
            List<Maintenance> records = maintenanceService.getMaintenanceByCarId(carId);
            return ResponseEntity.ok(records);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Get maintenance record by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Maintenance> getMaintenanceById(@PathVariable Long id) {
        try {
            Maintenance record = maintenanceService.getMaintenanceById(id);
            if (record != null) {
                return ResponseEntity.ok(record);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    /**
     * Delete maintenance record
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaintenance(@PathVariable Long id) {
        try {
            maintenanceService.deleteMaintenance(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
} 