# FixItNow - Changelog (November 8, 2025)

## 🎉 What's New

Hello team! I've made several important updates to the FixItNow project today. Here's everything that changed and how to run the updated project on your laptop.

---

## 📝 Changes Made Today

### 1. ✅ Fixed Provider Registration Bug
**Problem:** When providers tried to register with business certificates, the system crashed with error:
```
Data truncation: Data too long for column 'verification_document' at row 1
```

**Solution:** 
- Updated the database column size from `VARCHAR(255)` to `MEDIUMTEXT`
- Modified `User.java` model to support larger file paths
- **Action Required:** You need to update your local database (see setup instructions below)

---

### 2. 📧 NEW FEATURE: Password Reset via Email
**What it does:** Users can now reset their forgotten passwords by receiving a 6-digit code via email!

**New Files Added:**
- `backend/src/main/java/com/fixitnow/service/EmailService.java` - Email sending service
- `EMAIL_SETUP.md` - Complete email setup instructions

**Files Modified:**
- `backend/src/main/java/com/fixitnow/controller/AuthController.java` - Added email-based reset endpoints
- `backend/src/main/resources/application.properties` - Added Gmail SMTP configuration
- `backend/pom.xml` - Added Spring Mail dependency
- `frontend/src/pages/ForgotPassword.js` - Complete UI redesign for better UX
- `frontend/src/pages/ResetPassword.js` - Simplified password reset form

**How it works:**
1. User enters email on Forgot Password page
2. System sends 6-digit code to their email
3. User enters code and creates new password
4. Done! Can login with new password

**Action Required:** Configure Gmail SMTP (see Email Setup section below)

---

### 3. 🔧 Updated Admin Credentials
- Admin email changed to: `prasadpolavarapu57@gmail.com`
- Password remains: `prasad050704`
- File: `backend/src/main/java/com/fixitnow/controller/AuthController.java`

---

### 4. 🗑️ Cleaned Up Database Migration Files
**What was removed:**
- Entire `backend/src/main/resources/db/migration/` folder and all SQL files inside

**Why?**
- Our project uses Hibernate DDL auto-update, NOT Flyway migrations
- The migration files were never being executed
- They were causing confusion and errors
- Database schema is automatically managed by Hibernate from Java models

**Impact:** None! Everything still works perfectly. Database tables are created automatically.

---

## 🚀 How to Run This Project on Your Laptop

### Prerequisites
Make sure you have these installed:
- **Java 17** or higher
- **Maven 3.6+** (or use the wrapper)
- **MySQL 8.0+**
- **Node.js 16+** and **npm**
- **Git**

---

## 📋 Step-by-Step Setup Instructions

### Step 1: Pull Latest Code
```bash
cd path/to/fixitnowFinal/fin
git pull origin main
```

### Step 2: Database Setup

#### 2.1 Create Database
Open MySQL Command Line or MySQL Workbench and run:
```sql
CREATE DATABASE IF NOT EXISTS fixitnow_db;
USE fixitnow_db;
```

#### 2.2 Update Database Column (IMPORTANT!)
This fixes the provider registration bug. Run this SQL command:
```sql
ALTER TABLE users MODIFY COLUMN verification_document MEDIUMTEXT;
```

If the `users` table doesn't exist yet, don't worry - it will be created automatically when you run the backend.

#### 2.3 Update Database Credentials
Edit `backend/src/main/resources/application.properties`:
```properties
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
```
Replace `YOUR_MYSQL_PASSWORD` with your MySQL root password.

---

### Step 3: Email Setup (Optional but Recommended)

To enable password reset emails, you need to configure Gmail SMTP:

#### 3.1 Generate Gmail App Password
1. Go to your Google Account: https://myaccount.google.com/
2. Go to **Security** → **2-Step Verification** (enable if not already)
3. Go to **Security** → **App passwords**
4. Select **Mail** and **Other (Custom name)**
5. Enter "FixItNow Backend"
6. Click **Generate**
7. Copy the 16-character password (remove spaces)

#### 3.2 Update Email Configuration
Edit `backend/src/main/resources/application.properties`:
```properties
spring.mail.username=your-email@gmail.com
spring.mail.password=abcd efgh ijkl mnop
```
Replace with your actual Gmail and the app password from step 3.1.

**Note:** If you skip this step, password reset will still work but the code will be shown in the API response instead of being emailed.

See `EMAIL_SETUP.md` for detailed instructions.

---

### Step 4: Install Backend Dependencies
```bash
cd backend
mvn clean install
```

This will download all dependencies including the new Spring Mail library.

---

### Step 5: Run the Backend
```bash
cd backend
mvn spring-boot:run
```

**Expected output:**
- Backend should start on `http://localhost:8080`
- You should see: `Started FixItNowApplication in X seconds`
- Database tables will be created automatically
- Check for any errors in the console

**Common Issues:**
- **Out of memory error:** Add this flag: `set MAVEN_OPTS=-Xmx512m` before running
- **Port 8080 already in use:** Kill the existing process or change port in `application.properties`

---

### Step 6: Install Frontend Dependencies
```bash
cd frontend
npm install
```

This installs all React dependencies.

---

### Step 7: Run the Frontend
```bash
cd frontend
npm start
```

**Expected output:**
- Frontend should start on `http://localhost:3000`
- Browser will open automatically
- You should see the FixItNow homepage

---

## 🧪 How to Test the New Features

### Test 1: Provider Registration
1. Go to `http://localhost:3000/register`
2. Select **Service Provider** role
3. Fill in all details
4. Upload any business certificate (PDF, JPG, PNG) - any size!
5. Click **Create Account**
6. ✅ Should succeed without errors

### Test 2: Password Reset via Email
1. Go to `http://localhost:3000/forgot-password`
2. Enter a registered user's email
3. Click **Send Code**
4. Check email for 6-digit code (e.g., 123456)
5. Enter the code on the same page
6. Click **Proceed to Reset Password**
7. Enter new password twice
8. Click **Reset Password**
9. ✅ Should redirect to login
10. Login with new password

### Test 3: Admin Login
1. Go to `http://localhost:3000/admin`
2. Email: `prasadpolavarapu57@gmail.com`
3. Password: `prasad050704`
4. Click **Sign in as Admin**
5. ✅ Should login successfully

---

## 📁 Project Structure Changes

### New Files
```
backend/src/main/java/com/fixitnow/service/EmailService.java
EMAIL_SETUP.md
CHANGELOG_NOV_8_2025.md (this file)
```

### Modified Files
```
backend/src/main/java/com/fixitnow/model/User.java
backend/src/main/java/com/fixitnow/controller/AuthController.java
backend/src/main/resources/application.properties
backend/pom.xml
frontend/src/pages/ForgotPassword.js
frontend/src/pages/ResetPassword.js
```

### Deleted Files
```
backend/src/main/resources/db/migration/ (entire folder)
  - V3__add_service_coordinates.sql
  - V4__insert_sample_services.sql
  - V5__add_urgency_level_to_bookings.sql
  - V6__add_verification_and_dispute.sql
  - V7__add_document_type.sql
  - V9__add_soft_delete.sql
```

---

## 🔧 Configuration Summary

### Backend Configuration (`application.properties`)
```properties
# Database (UPDATE THIS!)
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

# Email (UPDATE THIS!)
spring.mail.username=your-email@gmail.com
spring.mail.password=your-16-char-app-password
```

### Frontend Configuration (`.env`)
No changes needed - should already have:
```
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

---

## 🐛 Troubleshooting

### Backend won't start
**Error:** "Data truncation: Data too long for column 'verification_document'"
- **Fix:** Run this SQL: `ALTER TABLE users MODIFY COLUMN verification_document MEDIUMTEXT;`

**Error:** "Out of memory"
- **Fix:** Run: `set MAVEN_OPTS=-Xmx512m` then start backend again

**Error:** "Port 8080 already in use"
- **Fix:** Kill existing Java process or change port in `application.properties`

### Email not working
**Error:** Email not received
- Check spam folder
- Verify Gmail app password is correct (16 characters)
- Check backend console for email errors
- If email fails, the code will be shown in API response for testing

### Frontend compilation errors
- **Fix:** Delete `node_modules` folder and run `npm install` again

---

## 📊 API Endpoints Summary

### New Endpoints
```
POST /api/auth/forgot-password
Body: { "email": "user@example.com" }
Response: { "message": "Reset code sent to your email" }

POST /api/auth/reset-password
Body: { 
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "newPassword123"
}
Response: { "message": "Password reset successfully!" }
```

---

## 💡 Tips for Developers

1. **Always pull latest code** before starting work
2. **Update your database** with the SQL command above
3. **Configure email** for full functionality
4. **Check console logs** if something doesn't work
5. **Clear browser cache** if frontend behaves strangely
6. **Restart backend** after changing `application.properties`

---

## 📞 Need Help?

If you face any issues:
1. Check the Troubleshooting section above
2. Check backend console for errors
3. Check browser console (F12) for frontend errors
4. Contact me on the team chat

---

## ✅ Quick Start Checklist

- [ ] Pull latest code from git
- [ ] Update MySQL credentials in `application.properties`
- [ ] Run SQL command to fix users table
- [ ] (Optional) Configure Gmail SMTP for emails
- [ ] Run `mvn clean install` in backend folder
- [ ] Run `mvn spring-boot:run` in backend folder
- [ ] Run `npm install` in frontend folder
- [ ] Run `npm start` in frontend folder
- [ ] Test provider registration
- [ ] Test password reset
- [ ] Test admin login

---

**Happy Coding! 🚀**

Last updated: November 8, 2025
