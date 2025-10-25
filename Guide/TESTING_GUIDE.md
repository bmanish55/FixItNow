# FixItNow Testing Guide

## Current Status ✅

**Frontend**: Successfully running on http://localhost:3000
- React application is working
- All dependencies installed
- UI components are loading correctly

**Backend**: Needs Maven installation to run

## Quick Testing Steps

### 1. Install Maven (Required for Backend)

**Option A: Download Maven manually**
1. Go to https://maven.apache.org/download.cgi
2. Download "Binary zip archive" (apache-maven-3.9.11-bin.zip)
3. Extract to `C:\apache-maven`
4. Add `C:\apache-maven\bin` to your PATH environment variable
5. Restart your terminal/VS Code

**Option B: Use Chocolatey (if installed)**
```powershell
choco install maven
```

**Option C: Use winget**
```powershell
winget install Apache.Maven
```

### 2. Test Backend

After Maven installation:
```powershell
cd "C:\Users\prasa\OneDrive\Desktop\FixItNow\fixitnow-app\backend"
mvn clean compile
mvn spring-boot:run
```

The backend will start on http://localhost:8080

### 3. Test Frontend (Already Working ✅)

Frontend is already running on http://localhost:3000

## What You Can Test Right Now

### Frontend Features (Working ✅)
1. **Home Page**: Navigate to http://localhost:3000
   - Beautiful landing page with hero section
   - Service categories display
   - Call-to-action buttons

2. **Navigation**: 
   - Click "Services" to browse services
   - Click "Sign Up" to register
   - Click "Login" to sign in

3. **Registration Page**: http://localhost:3000/register
   - Test customer registration form
   - Test service provider registration form
   - Form validation working

4. **Login Page**: http://localhost:3000/login
   - Login form UI
   - Form validation

5. **Services Page**: http://localhost:3000/services
   - Service listing with filters
   - Search functionality
   - Category filtering

## Full Application Testing (After Maven Setup)

### Backend API Endpoints to Test:

1. **Registration API**:
   ```bash
   POST http://localhost:8080/api/auth/signup
   Content-Type: application/json
   
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "password123",
     "role": "customer",
     "location": "New York"
   }
   ```

2. **Login API**:
   ```bash
   POST http://localhost:8080/api/auth/signin
   Content-Type: application/json
   
   {
     "email": "john@example.com",
     "password": "password123"
   }
   ```

### Integration Testing:

1. **Register a new user** via frontend
2. **Login with credentials** 
3. **Check JWT token** in browser dev tools
4. **Access protected dashboard** after login
5. **Test role-based navigation**

## Database Setup (Required for Backend)

1. **Install MySQL** (if not installed):
   - Download from https://dev.mysql.com/downloads/mysql/
   - Or use XAMPP/WAMP

2. **Create Database**:
   ```sql
   CREATE DATABASE fixitnow_db;
   ```

3. **Update credentials** in `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.username=your_mysql_username
   spring.datasource.password=your_mysql_password
   ```

## Expected Test Results

### ✅ What Should Work:
- Frontend UI loads correctly
- Navigation between pages
- Form validations
- Responsive design
- Authentication UI flows

### 🔄 What Needs Backend:
- User registration (saves to database)
- User login (returns JWT token)
- Protected route access
- Dashboard data loading
- API integration

## Troubleshooting

### Frontend Issues:
- If CSS looks broken, ensure Tailwind CSS is working
- Check browser console for JavaScript errors
- Verify all npm packages are installed

### Backend Issues:
- Ensure Java 17+ is installed
- Check MySQL connection
- Verify Maven installation
- Check port 8080 is not in use

## Next Steps After Testing

Once both frontend and backend are running:

1. **Test complete user flow**:
   - Register → Login → Dashboard → Logout

2. **Verify JWT token handling**:
   - Check token storage in localStorage
   - Test token refresh mechanism
   - Test protected route access

3. **Test role-based features**:
   - Register as different user types
   - Verify role-specific dashboards
   - Test role-based navigation

4. **Database verification**:
   - Check if users are saved correctly
   - Verify password encryption
   - Test user roles assignment

## Ready for Next Milestone?

After successful testing, we can proceed to **Milestone 2**:
- Service CRUD operations
- Google Maps integration
- Advanced search and filtering
- Service booking system

---

**Current Status**: Frontend ✅ | Backend ⏳ (needs Maven) | Database ⏳ (needs setup)