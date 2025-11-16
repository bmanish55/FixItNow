# FixItNow – AI Agent Guide

**FixItNow** is a neighborhood service & repair marketplace (Spring Boot 3 + React 18). This guide ensures AI agents are immediately productive.

## Architecture Overview

- **Backend**: Spring Boot 3 REST API + STOMP WebSocket at `/api` context path
  - Entry: `backend/src/main/java/com/fixitnow/FixItNowApplication.java`
  - Controllers: 12 REST endpoints (Auth, Service, Booking, Chat, Admin, etc.) in `controller/`
  - Models: 9 JPA entities (User, Service, Booking, ChatMessage, Review, Dispute, etc.)
  - Security: JWT + role-based (`CUSTOMER`, `PROVIDER`, `ADMIN`) enforced via `@EnableMethodSecurity`

- **Frontend**: React 18 SPA (Create React App)
  - Entry: `frontend/src/index.js` → `frontend/src/App.js`
  - Auth state: `AuthContext.js` (localStorage for tokens, Axios interceptors for refresh)
  - Pages: 25+ components across auth, dashboard, services, bookings, chat, admin

- **Integration**: Frontend calls backend REST at `REACT_APP_API_URL` (default `http://localhost:8080/api`); real-time chat via STOMP WebSocket at `/api/ws`

## Critical Patterns & Conventions

### Authentication & Authorization
- **JWT tokens** returned by `/auth/signin` and `/auth/signup` as `{ accessToken, refreshToken, ...userData }`
- Frontend stores both tokens in `localStorage` and sets Axios default header: `Authorization: Bearer ${accessToken}`
- **Token refresh**: If 401 response, frontend calls `/auth/refresh` with `refreshToken` to get new `accessToken` (see `api.js` interceptor)
- **Role-based security**: All endpoints in `WebSecurityConfig.java` use `requestMatchers` + role checks; **do not add ad-hoc role logic**

### Endpoint Security Rules
- **Public (no auth)**: `/auth/**`, `/services`, `/services/**`, `/services/map/**`, `/services/{id}/reviews`, `/uploads/**`, `/ws`
- **Authenticated**: `/upload`, `/bookings/**`, `/reviews`, `/users/**`
- **Provider+**: `/provider/**` (PROVIDER or ADMIN)
- **Customer+**: `/customer/**` (CUSTOMER or ADMIN)
- **Admin only**: `/admin/**`

### Database & Models
- **Models** in `model/`: User (with `role` enum), Service (latitude/longitude fields for maps), Booking, ChatMessage, Review, Dispute, etc.
- **Repositories**: Spring Data JPA with custom queries where needed
- **File uploads**: Images stored in `backend/uploads/avatar/` and `backend/uploads/service/`; served publicly via `/uploads/**`

### Frontend State & Routing
- **Auth state**: `useAuth()` hook provides `{ user, login, logout, isProvider(), isCustomer(), isAdmin() }`
- **Protected routes**: `ProtectedRoute.js` wraps pages requiring authentication
- **Role-specific pages**: `/services` (public), `/dashboard` (customer), `/my-services` (provider), `/admin/**` (admin)

### Real-time Communication
- **WebSocket endpoint**: `/api/ws` (SockJS + STOMP)
- **Chat prefixes**: Messages sent to `/app/sendMessage` are routed to `/topic/messages/{roomId}` or `/queue/messages/{userId}`
- **Handler**: `WebSocketChatController.java` processes `@MessageMapping` endpoints

## Build & Dev Commands (Windows PowerShell)

```powershell
# Backend: Maven 3.6+, Java 17
cd fin/backend
mvn clean install           # Build (H2 for tests, MySQL for local)
mvn spring-boot:run         # Start on http://localhost:8080/api

# Frontend: Node 16+
cd fin/frontend
npm install                 # Install dependencies
npm start                   # Start on http://localhost:3000

# Convenience scripts (Windows batch files)
.\fin\bat\start-dev.bat     # Start both backend and frontend in separate terminals
.\fin\bat\test-system.bat   # Run integration tests
```

## Project Structure & Key Files

```
fin/
├── backend/
│   ├── pom.xml              # Maven dependencies (JWT, Spring Security, WebSocket, MySQL)
│   ├── src/main/java/com/fixitnow/
│   │   ├── controller/      # 12 REST controllers (Auth, Service, Booking, etc.)
│   │   ├── service/         # Business logic (e.g., BookingService, ReviewService)
│   │   ├── model/           # JPA entities (User, Service, Booking, ChatMessage, Review, Dispute)
│   │   ├── repository/      # Spring Data repositories
│   │   ├── config/          # WebSecurityConfig, WebSocketConfig, CorsConfig
│   │   ├── security/        # JWT token provider, AuthTokenFilter
│   │   └── dto/             # Request/response DTOs
│   └── src/main/resources/
│       ├── application.properties   # MySQL, JWT secret, CORS allowed origins, email config
│       ├── db/migration/    # Flyway SQL migrations (V1..V5)
│       └── uploads/         # File upload storage
├── frontend/
│   ├── package.json         # React dependencies (axios, @stomp/stompjs, react-router, tailwind)
│   ├── public/index.html
│   └── src/
│       ├── App.js           # Main router
│       ├── contexts/        # AuthContext.js (global auth state)
│       ├── pages/           # 25+ page components
│       ├── components/      # Reusable components (Navbar, MapView, ChatMessageModal, etc.)
│       └── services/        # api.js (Axios instance), googleMapsService.js, webSocketService.js
└── bat/
    ├── start-dev.bat        # Start backend + frontend
    ├── test-system.bat      # Run integration tests
    └── setup.bat            # Initial setup
```

## Configuration & Environment

### Backend: `application.properties`
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/fixitnow_db
spring.datasource.username=root
spring.datasource.password=845905
app.jwt.secret=fixitnowSecretKey2024!@#$%^&*()_+
app.jwt.expiration=86400000
app.cors.allowed-origins=http://localhost:3000
spring.mail.username=# Gmail SMTP for password reset
```

### Frontend: `.env` (create in `frontend/` root)
```
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_GOOGLE_MAPS_API_KEY=YOUR_KEY_HERE
```

## Common Code Patterns

### Adding a new authenticated endpoint
1. Create controller method in `controller/SomeController.java`
2. Add `@PostMapping("/some-path")` and use `@AuthenticationPrincipal User user` or `SecurityContextHolder.getAuthentication()`
3. Update `WebSecurityConfig.java` `requestMatchers` if role-based access needed
4. Frontend calls `api.post('/some-path', data)` (auth header auto-added by Axios interceptor)

### Adding a new role
1. Add to `Role` enum in `model/User.java`
2. Update `WebSecurityConfig.java` `requestMatchers` rules
3. Update frontend role-check methods in `AuthContext.js` if UI logic differs

### File upload pattern
- Frontend: POST multipart form to `/upload` (authenticated)
- Backend: `FileUploadController.java` saves to `uploads/` and returns file path
- Public access: path served via `/uploads/**` matcher

### WebSocket real-time feature
- Backend: Listen with `@MessageMapping("/app/...")` in `WebSocketChatController.java`
- Frontend: Connect via `SockJS + STOMP` in `webSocketService.js`, send to `/app/...`
- Routing: Use `/topic/...` for broadcasts, `/queue/...` for user-specific messages

## Debugging & Troubleshooting

| Issue | Solution |
|-------|----------|
| 401 Unauthorized after login | Check JWT token refresh loop in `api.js` interceptor; verify `accessToken` in localStorage |
| CORS error | Verify `app.cors.allowed-origins` includes frontend URL; check browser console for allowed methods (GET, POST, PUT, PATCH, DELETE) |
| WebSocket not connecting | Ensure backend running; check `/api/ws` path in `webSocketService.js`; verify no ad-hoc CORS bypass (use `WebSocketConfig.java`) |
| File upload fails | Check `spring.servlet.multipart.max-file-size=10MB` limit; verify `/upload` endpoint is authenticated in `WebSecurityConfig` |
| Google Maps not showing | Verify `REACT_APP_GOOGLE_MAPS_API_KEY` in `.env`; check browser console for API key errors |

## Testing & CI Notes

- **Backend tests** use H2 in-memory database (see `application-test.properties`)
- **Frontend tests** use Jest + React Testing Library (see `npm test`)
- **Integration tests** via `test-system.bat` or manual `mvn test`

---

**Questions? Unclear sections?** Ask for clarification on specific areas (auth flow, entity relationships, WebSocket patterns, etc.) and I will expand.
