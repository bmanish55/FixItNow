package com.fixitnow.controller;

import java.util.HashMap;
import java.util.Map;
import java.time.LocalDateTime;
import java.util.UUID;

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
import com.fixitnow.model.PasswordResetToken;
import com.fixitnow.repository.UserRepository;
import com.fixitnow.repository.PasswordResetTokenRepository;
import com.fixitnow.security.JwtUtils;
import com.fixitnow.security.UserPrincipal;
import com.fixitnow.service.EmailService;

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
    PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;
    
    @Autowired
    EmailService emailService;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            // Hardcoded admin credentials check
            final String ADMIN_EMAIL = "manish@gmail.com";
            final String ADMIN_PASSWORD = "845905";
            final String ADMIN_NAME = "Admin";
            
            // Check if this is the hardcoded admin trying to log in
            if (loginRequest.getEmail().equalsIgnoreCase(ADMIN_EMAIL)) {
                // Verify hardcoded admin password (plain text comparison)
                if (loginRequest.getPassword().equals(ADMIN_PASSWORD)) {
                    // Create a temporary admin user object for response (not saved to DB)
                    String jwt = jwtUtils.generateJwtToken(ADMIN_EMAIL, "ADMIN");
                    String refreshToken = jwtUtils.generateRefreshToken(ADMIN_EMAIL);

                    Map<String, Object> response = new HashMap<>();
                    response.put("accessToken", jwt);
                    response.put("refreshToken", refreshToken);
                    response.put("type", "Bearer");
                    response.put("id", 0L); // Special ID for hardcoded admin
                    response.put("name", ADMIN_NAME);
                    response.put("email", ADMIN_EMAIL);
                    response.put("role", "ADMIN");
                    response.put("location", "");
                    response.put("phone", "");
                    response.put("profileImage", null);
                    response.put("avatarUrl", null);
                    
                    return ResponseEntity.ok(response);
                } else {
                    // Wrong password for admin
                    Map<String, String> error = new HashMap<>();
                    error.put("message", "Incorrect password. Please try again.");
                    return ResponseEntity.badRequest().body(error);
                }
            }
            
            // Check if user exists first
            User user = userRepository.findByEmail(loginRequest.getEmail())
                    .orElse(null);
                    
            if (user == null) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "No account found with this email address");
                return ResponseEntity.badRequest().body(error);
            }

            // Try to authenticate
            Authentication authentication;
            try {
                authentication = authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
            } catch (Exception authException) {
                // Authentication failed - wrong password
                Map<String, String> error = new HashMap<>();
                error.put("message", "Incorrect password. Please try again.");
                return ResponseEntity.badRequest().body(error);
            }

            SecurityContextHolder.getContext().setAuthentication(authentication);
                    
            // Block login for unverified providers
            if (user.getRole() == User.Role.PROVIDER && (user.getIsVerified() == null || !user.getIsVerified())) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Admin Not Approved This profile yet Please Wait We'll Get Reach You Soon");
                return ResponseEntity.status(403).body(error);
            }

            String jwt = jwtUtils.generateJwtToken(user.getEmail(), user.getRole().name());
            String refreshToken = jwtUtils.generateRefreshToken(user.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", jwt);
            response.put("refreshToken", refreshToken);
            response.put("type", "Bearer");
            response.put("id", user.getId());
            response.put("name", user.getName());
            response.put("email", user.getEmail());
            response.put("role", user.getRole().name());
            response.put("location", user.getLocation());
            response.put("phone", user.getPhone());
            response.put("profileImage", user.getProfileImage());
            response.put("avatarUrl", user.getProfileImage());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Authentication failed. Please check your credentials.");
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
                user.setDocumentType(signUpRequest.getDocumentType());
                user.setVerificationDocument(signUpRequest.getVerificationDocument());
                // Provider starts unverified - will be verified by admin
                user.setIsVerified(false);
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

    @PostMapping("/admin-register")
    public ResponseEntity<?> registerAdmin(@Valid @RequestBody SignupRequest signUpRequest) {
        Map<String, String> response = new HashMap<>();
        
        // DISABLED: Admin registration is not allowed
        // Only one hardcoded admin account exists
        response.put("message", "Admin registration is disabled. Please contact the system administrator.");
        return ResponseEntity.status(403).body(response);
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
            response.put("phone", user.getPhone());
            response.put("profileImage", user.getProfileImage());
            response.put("avatarUrl", user.getProfileImage()); // Also include as avatarUrl for compatibility
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error fetching user: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            
            if (email == null || email.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Email is required");
                return ResponseEntity.badRequest().body(error);
            }

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

            // Generate 6-digit reset code
            String resetCode = String.format("%06d", (int)(Math.random() * 1000000));
            
            // Token expires in 24 hours
            LocalDateTime expiryTime = LocalDateTime.now().plusHours(24);

            // Delete any existing unused tokens for this user
            passwordResetTokenRepository.findByUserAndUsedFalse(user).ifPresent(
                existingToken -> passwordResetTokenRepository.delete(existingToken)
            );

            // Create and save new reset token
            PasswordResetToken resetToken = new PasswordResetToken(resetCode, user, expiryTime);
            passwordResetTokenRepository.save(resetToken);

            // Send reset code via email
            try {
                emailService.sendPasswordResetEmail(email, resetCode);
                
                Map<String, String> response = new HashMap<>();
                response.put("message", "Password reset code sent to your email address. Please check your inbox.");
                return ResponseEntity.ok(response);
                
            } catch (Exception emailError) {
                // If email fails, still return the code in response for development
                System.err.println("Email sending failed: " + emailError.getMessage());
                
                Map<String, String> response = new HashMap<>();
                response.put("message", "Email service temporarily unavailable. Your reset code is: " + resetCode);
                response.put("code", resetCode); // For development only
                return ResponseEntity.ok(response);
            }
            
        } catch (Exception e) {
            System.err.println("Error creating password reset token: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String code = request.get("code");
            String newPassword = request.get("newPassword");

            // Validation
            if (email == null || email.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Email is required");
                return ResponseEntity.badRequest().body(error);
            }

            if (code == null || code.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Reset code is required");
                return ResponseEntity.badRequest().body(error);
            }

            if (newPassword == null || newPassword.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "New password is required");
                return ResponseEntity.badRequest().body(error);
            }

            if (newPassword.length() < 6) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Password must be at least 6 characters");
                return ResponseEntity.badRequest().body(error);
            }

            // Find the reset token by code
            PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(code)
                    .orElseThrow(() -> new RuntimeException("Invalid or expired reset code"));

            // Check if token is expired
            if (resetToken.isExpired()) {
                passwordResetTokenRepository.delete(resetToken);
                Map<String, String> error = new HashMap<>();
                error.put("message", "Reset code has expired. Please request a new one.");
                return ResponseEntity.badRequest().body(error);
            }

            // Check if token has already been used
            if (resetToken.getUsed()) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Reset code has already been used. Please request a new one.");
                return ResponseEntity.badRequest().body(error);
            }

            // Verify email matches
            if (!resetToken.getUser().getEmail().equals(email)) {
                Map<String, String> error = new HashMap<>();
                error.put("message", "Email does not match reset code");
                return ResponseEntity.badRequest().body(error);
            }

            // Update user password
            User user = resetToken.getUser();
            user.setPassword(encoder.encode(newPassword));
            userRepository.save(user);

            // Mark token as used
            resetToken.setUsed(true);
            passwordResetTokenRepository.save(resetToken);

            System.out.println("Password reset successful for user: " + email);

            Map<String, String> response = new HashMap<>();
            response.put("message", "Password reset successfully! You can now login with your new password.");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Error resetting password: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            error.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}