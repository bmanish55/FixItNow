package com.fixitnow.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;
    
    public void sendPasswordResetEmail(String toEmail, String resetCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("FixItNow - Password Reset Request");
            
            String emailBody = String.format(
                "Hello,\n\n" +
                "You requested to reset your password for your FixItNow account.\n\n" +
                "Your password reset code is: %s\n\n" +
                "This code will expire in 24 hours.\n\n" +
                "To reset your password:\n" +
                "1. Go to: %s/reset-password\n" +
                "2. Enter your email address\n" +
                "3. Enter the reset code: %s\n" +
                "4. Create your new password\n\n" +
                "If you didn't request this password reset, please ignore this email.\n\n" +
                "Best regards,\n" +
                "FixItNow Team",
                resetCode,
                frontendUrl,
                resetCode
            );
            
            message.setText(emailBody);
            
            mailSender.send(message);
            logger.info("Password reset email sent successfully to: {}", toEmail);
            
        } catch (Exception e) {
            logger.error("Failed to send password reset email to: {}", toEmail, e);
            throw new RuntimeException("Failed to send email. Please try again later.");
        }
    }
    
    public void sendWelcomeEmail(String toEmail, String userName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Welcome to FixItNow!");
            
            String emailBody = String.format(
                "Hello %s,\n\n" +
                "Welcome to FixItNow - Your Neighborhood Service Marketplace!\n\n" +
                "Your account has been created successfully.\n\n" +
                "You can now:\n" +
                "- Browse and book local services\n" +
                "- Connect with trusted service providers\n" +
                "- Manage your bookings and reviews\n\n" +
                "Get started at: %s\n\n" +
                "Best regards,\n" +
                "FixItNow Team",
                userName,
                frontendUrl
            );
            
            message.setText(emailBody);
            
            mailSender.send(message);
            logger.info("Welcome email sent successfully to: {}", toEmail);
            
        } catch (Exception e) {
            logger.error("Failed to send welcome email to: {}", toEmail, e);
            // Don't throw exception for welcome emails - it's not critical
        }
    }
    
    public void sendProviderVerificationEmail(String toEmail, String providerName, boolean approved) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            
            if (approved) {
                message.setSubject("FixItNow - Your Provider Account is Approved!");
                
                String emailBody = String.format(
                    "Hello %s,\n\n" +
                    "Great news! Your service provider account has been approved by our admin team.\n\n" +
                    "You can now:\n" +
                    "- Login to your account\n" +
                    "- Create and manage your services\n" +
                    "- Start receiving bookings from customers\n\n" +
                    "Login now: %s/login\n\n" +
                    "Thank you for joining FixItNow!\n\n" +
                    "Best regards,\n" +
                    "FixItNow Team",
                    providerName,
                    frontendUrl
                );
                
                message.setText(emailBody);
            } else {
                message.setSubject("FixItNow - Provider Account Update");
                
                String emailBody = String.format(
                    "Hello %s,\n\n" +
                    "Thank you for your interest in becoming a service provider on FixItNow.\n\n" +
                    "Unfortunately, we were unable to verify your account at this time.\n\n" +
                    "Please contact our support team for more information.\n\n" +
                    "Best regards,\n" +
                    "FixItNow Team",
                    providerName
                );
                
                message.setText(emailBody);
            }
            
            mailSender.send(message);
            logger.info("Provider verification email sent successfully to: {}", toEmail);
            
        } catch (Exception e) {
            logger.error("Failed to send provider verification email to: {}", toEmail, e);
            // Don't throw exception - this is informational
        }
    }
}
