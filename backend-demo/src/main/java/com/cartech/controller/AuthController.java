package com.cartech.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000", "file://"})
public class AuthController {
    
    @Value("${demo.default-user.email}")
    private String demoEmail;
    
    @Value("${demo.default-user.password}")
    private String demoPassword;
    
    @Value("${demo.default-user.name}")
    private String demoName;
    
    /**
     * Demo login endpoint
     */
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest) {
        String email = loginRequest.get("email");
        String password = loginRequest.get("password");
        
        // Simple demo authentication
        if (demoEmail.equals(email) && demoPassword.equals(password)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Успешный вход");
            
            Map<String, Object> user = new HashMap<>();
            user.put("id", 1);
            user.put("email", email);
            user.put("name", demoName);
            user.put("role", "user");
            
            response.put("user", user);
            response.put("token", "demo-token-" + System.currentTimeMillis());
            
            return ResponseEntity.ok(response);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Неверный email или пароль");
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    /**
     * Demo logout endpoint
     */
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Выход выполнен успешно");
        return ResponseEntity.ok(response);
    }
    
    /**
     * Get current user info
     */
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        Map<String, Object> user = new HashMap<>();
        user.put("id", 1);
        user.put("email", demoEmail);
        user.put("name", demoName);
        user.put("role", "user");
        
        Map<String, Object> response = new HashMap<>();
        response.put("user", user);
        return ResponseEntity.ok(response);
    }
} 