package com.cartech.service;

import com.cartech.model.Car;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class CarService {
    
    // In-memory storage for demo (replace with database later)
    private final Map<Long, Car> cars = new HashMap<>();
    private final AtomicLong idCounter = new AtomicLong(1);
    
    public CarService() {
        // Initialize with demo data
        initializeDemoData();
    }
    
    private void initializeDemoData() {
        Car car1 = new Car(1L, "Toyota", "Camry", 2020, "1HGBH41JXMN109186", 50000);
        car1.setNickname("Family Car");
        car1.setImg("🚗");
        cars.put(1L, car1);
        
        Car car2 = new Car(2L, "Lada", "Vesta", 2019, "2T1BURHE0JC123456", 75000);
        car2.setNickname("Work Car");
        car2.setImg("🚙");
        cars.put(2L, car2);
        
        Car car3 = new Car(3L, "BMW", "X5", 2021, "5UXWX7C5*BA", 30000);
        car3.setNickname("Luxury Car");
        car3.setImg("🚘");
        cars.put(3L, car3);
        
        idCounter.set(4); // Set counter to next available ID
    }
    
    public Car saveCar(Car car) {
        // Set ID if not provided
        if (car.getId() == null) {
            car.setId(idCounter.getAndIncrement());
        }
        
        // Store in memory
        cars.put(car.getId(), car);
        return car;
    }
    
    public List<Car> getAllCars() {
        return new ArrayList<>(cars.values());
    }
    
    public Car getCarById(Long id) {
        return cars.get(id);
    }
    
    public void deleteCar(Long id) {
        cars.remove(id);
    }
    
    public Car updateCar(Long id, Car car) {
        if (cars.containsKey(id)) {
            car.setId(id);
            cars.put(id, car);
            return car;
        }
        return null;
    }
} 