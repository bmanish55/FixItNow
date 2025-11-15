# Email Setup Instructions for Password Reset

## Overview
The password reset feature sends a 6-digit code to the user's email address. To enable this, you need to configure Gmail SMTP settings.

## Step 1: Enable Gmail App Password

1. **Go to your Google Account settings**: https://myaccount.google.com/
2. **Enable 2-Factor Authentication** (if not already enabled):
   - Go to Security → 2-Step Verification
   - Follow the steps to enable it
3. **Generate an App Password**:
   - Go to Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Enter "FixItNow Backend" as the name
   - Click "Generate"
   - **Copy the 16-character password** (spaces removed)

## Step 2: Configure application.properties

Open `backend/src/main/resources/application.properties` and update these lines:

```properties
# Email Configuration (Gmail SMTP)
spring.mail.username=YOUR_EMAIL@gmail.com
spring.mail.password=YOUR_16_CHAR_APP_PASSWORD
```

Replace:
- `YOUR_EMAIL@gmail.com` with your actual Gmail address (e.g., `prasadpolavarapu57@gmail.com`)
- `YOUR_16_CHAR_APP_PASSWORD` with the 16-character app password from Step 1

**Example:**
```properties
spring.mail.username=prasadpolavarapu57@gmail.com
spring.mail.password=abcd efgh ijkl mnop
```

## Step 3: Test the Password Reset Flow

1. **Start the backend**: 
   ```bash
   cd backend
   mvn spring-boot:run
   ```

2. **Start the frontend**: 
   ```bash
   cd frontend
   npm start
   ```

3. **Test password reset**:
   - Go to http://localhost:3000/forgot-password
   - Enter a registered user's email
   - Check the email inbox for the 6-digit reset code
   - Use the code to reset the password

## API Endpoints

### 1. Request Password Reset
**POST** `/api/auth/forgot-password`

Request body:
```json
{
  "email": "user@example.com"
}
```

Response (success):
```json
{
  "message": "Password reset code sent to your email address. Please check your inbox."
}
```

### 2. Reset Password
**POST** `/api/auth/reset-password`

Request body:
```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "newSecurePassword123"
}
```

Response (success):
```json
{
  "message": "Password reset successfully! You can now login with your new password."
}
```

## Troubleshooting

### Email not sending
- **Check logs**: Look for email-related errors in the backend console
- **Verify credentials**: Make sure email and app password are correct
- **Check firewall**: Ensure port 587 is not blocked
- **Gmail security**: Sometimes Gmail blocks "less secure apps" - use app passwords instead

### "Email service temporarily unavailable"
If email sending fails, the backend will return the reset code in the response for development purposes:
```json
{
  "message": "Email service temporarily unavailable. Your reset code is: 123456",
  "code": "123456"
}
```

### Reset code expired
Reset codes expire after 24 hours. Request a new code if needed.

## Security Notes

1. **Never commit credentials**: The email password in `application.properties` should never be committed to Git
2. **Use environment variables** (recommended for production):
   ```properties
   spring.mail.username=${EMAIL_USERNAME}
   spring.mail.password=${EMAIL_PASSWORD}
   ```
   Then set environment variables before running:
   ```bash
   set EMAIL_USERNAME=your-email@gmail.com
   set EMAIL_PASSWORD=your-app-password
   mvn spring-boot:run
   ```

3. **Reset codes are single-use**: Once a code is used, it cannot be reused
4. **Codes expire**: All codes expire after 24 hours

## Alternative Email Providers

If you want to use a different email provider instead of Gmail:

### Outlook/Hotmail
```properties
spring.mail.host=smtp-mail.outlook.com
spring.mail.port=587
```

### Yahoo
```properties
spring.mail.host=smtp.mail.yahoo.com
spring.mail.port=587
```

### Custom SMTP Server
```properties
spring.mail.host=your.smtp.server.com
spring.mail.port=587
spring.mail.username=your-username
spring.mail.password=your-password
```

## Email Templates

The system sends three types of emails:

1. **Password Reset**: Sent when user requests password reset (includes 6-digit code)
2. **Welcome Email**: Sent when new user registers (currently not enabled)
3. **Provider Verification**: Sent when admin approves/rejects provider account (currently not enabled)

To customize email templates, edit `backend/src/main/java/com/fixitnow/service/EmailService.java`
