package com.fixitnow.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fixitnow.dto.JwtResponse;
import com.fixitnow.dto.LoginRequest;
import com.fixitnow.dto.SignupRequest;
import com.fixitnow.model.User;
import com.fixitnow.repository.UserRepository;
import com.fixitnow.security.JwtUtils;
import com.fixitnow.security.UserPrincipal;

import jakarta.validation.Valid;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElseThrow(() -> new RuntimeException("User not found"));
                    
            String jwt = jwtUtils.generateJwtToken(user.getEmail(), user.getRole().name());
            String refreshToken = jwtUtils.generateRefreshToken(user.getEmail());

            return ResponseEntity.ok(new JwtResponse(jwt, refreshToken, user.getId(), 
                    user.getName(), user.getEmail(), user.getRole().name(), user.getLocation()));
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid credentials");
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        Map<String, String> response = new HashMap<>();
        
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            response.put("message", "Error: Email is already taken!");
            return ResponseEntity.badRequest().body(response);
        }

        try {
            // Create new user account
            User user = new User(signUpRequest.getName(),
                               signUpRequest.getEmail(),
                               encoder.encode(signUpRequest.getPassword()),
                               User.Role.valueOf(signUpRequest.getRole().toUpperCase()));

            user.setLocation(signUpRequest.getLocation());
            user.setPhone(signUpRequest.getPhone());
            
            if ("PROVIDER".equals(signUpRequest.getRole().toUpperCase())) {
                user.setBio(signUpRequest.getBio());
                user.setExperience(signUpRequest.getExperience());
                user.setServiceArea(signUpRequest.getServiceArea());
            }

            userRepository.save(user);

            response.put("message", "User registered successfully!");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshtoken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        
        if (refreshToken != null && jwtUtils.validateJwtToken(refreshToken)) {
            String email = jwtUtils.getEmailFromJwtToken(refreshToken);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
                    
            String newAccessToken = jwtUtils.generateJwtToken(user.getEmail(), user.getRole().name());
            
            Map<String, String> response = new HashMap<>();
            response.put("accessToken", newAccessToken);
            response.put("refreshToken", refreshToken);
            
            return ResponseEntity.ok(response);
        }
        
        Map<String, String> error = new HashMap<>();
        error.put("message", "Invalid refresh token");
        return ResponseEntity.badRequest().body(error);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        try {
            if (userPrincipal == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Not authenticated");
                return ResponseEntity.status(401).body(error);
            }

            User user = userRepository.findById(userPrincipal.getId())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("name", user.getName());
            response.put("email", user.getEmail());
            response.put("role", user.getRole().name());
            response.put("location", user.getLocation());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error fetching user: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}