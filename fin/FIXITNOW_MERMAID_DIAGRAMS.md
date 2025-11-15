# FixItNow - Essential Mermaid Diagrams for PPT

---

## 1. DATABASE ER DIAGRAM

```mermaid
erDiagram
    USERS ||--o{ SERVICES : "creates"
    USERS ||--o{ BOOKINGS : "books/receives"
    USERS ||--o{ REVIEWS : "writes/receives"
    USERS ||--o{ CHAT_ROOMS : "participates"
    SERVICES ||--o{ BOOKINGS : "has"
    BOOKINGS ||--o{ REVIEWS : "gets"
    CHAT_ROOMS ||--o{ CHAT_MESSAGES : "contains"
    
    USERS {
        bigint id PK
        varchar name
        varchar email UK
        varchar password
        enum role "CUSTOMER, PROVIDER, ADMIN"
        boolean isVerified
        boolean isActive
    }
    
    SERVICES {
        bigint id PK
        bigint provider_id FK
        varchar title
        varchar category
        decimal price
        double latitude
        double longitude
        boolean isActive
    }
    
    BOOKINGS {
        bigint id PK
        bigint service_id FK
        bigint customer_id FK
        date booking_date
        enum status "PENDING, CONFIRMED, COMPLETED, CANCELLED"
    }
    
    REVIEWS {
        bigint id PK
        bigint booking_id FK
        int rating "1-5"
        text comment
    }
    
    CHAT_ROOMS {
        bigint id PK
        bigint customer_id FK
        bigint provider_id FK
    }
    
    CHAT_MESSAGES {
        bigint id PK
        bigint chat_room_id FK
        bigint sender_id FK
        text content
        boolean is_read
    }
```

---

## 2. SYSTEM ARCHITECTURE

```mermaid
graph TB
    subgraph "Client Layer - Presentation Tier"
        A[Web Browser] --> B[React Application]
        B --> C[Components]
        B --> D[Pages]
        B --> E[Context API]
        B --> F[Services/API]
    end
    
    subgraph "Communication Layer"
        F --> G[Axios HTTP Client]
        F --> H[WebSocket/STOMP]
        G --> I[REST APIs]
        H --> J[WebSocket Endpoint]
    end
    
    subgraph "Server Layer - Application Tier"
        I --> K[Spring Security Filter]
        J --> K
        K --> L[JWT Validation]
        L --> M[Controllers]
        M --> N[Service Layer]
        N --> O[Repository Layer]
        M --> P[WebSocket Handler]
    end
    
    subgraph "Data Layer - Persistence Tier"
        O --> Q[JPA/Hibernate]
        Q --> R[(MySQL Database)]
    end
    
    subgraph "External Services"
        N --> S[Google Maps API]
        N --> T[Email Service SMTP]
        N --> U[File Storage]
    end
    
    style A fill:#e1f5ff
    style B fill:#fff4e1
    style R fill:#ffe1e1
    style S fill:#e1ffe1
    style T fill:#e1ffe1
    style U fill:#e1ffe1
```

---

## 3. COMPLETE SYSTEM FLOW DIAGRAM

```mermaid
graph TB
    subgraph "USER LAYER"
        U1[Customer] 
        U2[Provider]
        U3[Admin]
    end
    
    subgraph "PRESENTATION LAYER - React Frontend"
        P1[Login/Register Pages]
        P2[Service Browsing<br/>List & Map View]
        P3[Booking Management]
        P4[Chat Interface]
        P5[Review System]
        P6[Admin Dashboard]
    end
    
    subgraph "API LAYER - REST & WebSocket"
        A1[Authentication<br/>POST /auth/signin]
        A2[Service APIs<br/>GET/POST /services]
        A3[Booking APIs<br/>GET/POST/PUT /bookings]
        A4[WebSocket /ws<br/>STOMP Protocol]
        A5[Review APIs<br/>GET/POST /reviews]
        A6[Admin APIs<br/>GET/PUT/DELETE]
    end
    
    subgraph "SECURITY LAYER"
        S1[JWT Filter]
        S2[Token Validation]
        S3[Role-Based Access<br/>CUSTOMER/PROVIDER/ADMIN]
    end
    
    subgraph "BUSINESS LOGIC LAYER - Spring Services"
        B1[UserService<br/>Registration & Auth]
        B2[ServiceService<br/>CRUD Operations]
        B3[BookingService<br/>Booking Management]
        B4[ChatService<br/>Real-time Messaging]
        B5[ReviewService<br/>Rating & Feedback]
        B6[AdminService<br/>Verification & Reports]
    end
    
    subgraph "DATA ACCESS LAYER - JPA Repositories"
        D1[UserRepository]
        D2[ServiceRepository]
        D3[BookingRepository]
        D4[ChatRepository]
        D5[ReviewRepository]
    end
    
    subgraph "DATABASE LAYER"
        DB[(MySQL Database<br/>Users | Services | Bookings<br/>Reviews | Chat | Disputes)]
    end
    
    subgraph "EXTERNAL SERVICES"
        E1[Google Maps API<br/>Location Services]
        E2[Email Service<br/>SMTP Notifications]
        E3[File Storage<br/>Images & Documents]
    end
    
    U1 --> P1
    U1 --> P2
    U1 --> P3
    U1 --> P4
    U1 --> P5
    
    U2 --> P1
    U2 --> P2
    U2 --> P3
    U2 --> P4
    
    U3 --> P6
    
    P1 --> A1
    P2 --> A2
    P3 --> A3
    P4 --> A4
    P5 --> A5
    P6 --> A6
    
    A1 --> S1
    A2 --> S1
    A3 --> S1
    A4 --> S1
    A5 --> S1
    A6 --> S1
    
    S1 --> S2
    S2 --> S3
    
    S3 --> B1
    S3 --> B2
    S3 --> B3
    S3 --> B4
    S3 --> B5
    S3 --> B6
    
    B1 --> D1
    B2 --> D2
    B3 --> D3
    B4 --> D4
    B5 --> D5
    B6 --> D1
    B6 --> D2
    
    D1 --> DB
    D2 --> DB
    D3 --> DB
    D4 --> DB
    D5 --> DB
    
    B2 --> E1
    B1 --> E2
    B6 --> E2
    B2 --> E3
    B1 --> E3
    
    style U1 fill:#4caf50,color:#fff
    style U2 fill:#ff9800,color:#fff
    style U3 fill:#9c27b0,color:#fff
    style S1 fill:#f44336,color:#fff
    style DB fill:#2196f3,color:#fff
    style E1 fill:#00bcd4,color:#fff
    style E2 fill:#00bcd4,color:#fff
    style E3 fill:#00bcd4,color:#fff
```

---

## 4. TECHNOLOGY STACK DIAGRAM

```mermaid
graph LR
    subgraph "Frontend Technologies"
        F1[React 18.2.0]
        F2[Tailwind CSS]
        F3[Axios]
        F4[React Router DOM]
        F5[STOMP.js/SockJS]
        F6[Google Maps API]
    end
    
    subgraph "Backend Technologies"
        B1[Spring Boot 3.2.12]
        B2[Spring Security + JWT]
        B3[Spring Data JPA]
        B4[Spring WebSocket]
        B5[Spring Mail]
    end
    
    subgraph "Database & Tools"
        D1[(MySQL 8.0.33)]
        D2[Hibernate ORM]
        D3[Maven Build Tool]
    end
    
    subgraph "External APIs"
        E1[Google Maps]
        E2[SMTP Email]
    end
    
    F1 --> B1
    F3 --> B1
    F5 --> B4
    F6 --> E1
    
    B1 --> D1
    B3 --> D2
    D2 --> D1
    
    B5 --> E2
    
    style F1 fill:#61dafb,color:#000
    style B1 fill:#6db33f,color:#fff
    style D1 fill:#4479a1,color:#fff
```

---

## HOW TO USE THESE DIAGRAMS

### Quick Steps:
1. **Copy Mermaid code** from any diagram above
2. **Paste into** https://mermaid.live/
3. **Export as PNG/SVG** for your presentation
4. **Insert into PowerPoint slides**

### Color Code Legend:
- 🟢 Green: Customer/Success
- 🟠 Orange: Provider/Warning  
- 🟣 Purple: Admin/Special
- 🔵 Blue: Database/Primary
- 🔴 Red: Security/Error
- 🔷 Cyan: External Services

---

**Essential Diagrams for Presentation:**
1. **Database ER Diagram** - Shows data structure
2. **System Architecture** - Three-tier architecture  
3. **Complete System Flow** - End-to-end workflow
4. **Technology Stack** - All technologies used

*Use mermaid.live to render and export these diagrams for your PPT!*
