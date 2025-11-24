# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                            Client Browser                            │
│                        (React + TypeScript)                         │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Frontend Service                            │
│                   (Vite + React + Tailwind CSS)                    │
│                         Port: 5173                                  │
└────────────────────────────┬────────────────────────────────────────┘
                             │ REST API
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Backend Service                             │
│                  (Node.js + Fastify + TypeScript)                  │
│                         Port: 3000                                  │
│  ┌──────────────────────────────────────────────────────────┐      │
│  │  Routes: /api/auth, /api/garments, /api/outfits, etc.   │      │
│  │  Middleware: JWT Authentication, CORS                    │      │
│  │  Services: Prisma ORM, MinIO Client                      │      │
│  └──────────────────────────────────────────────────────────┘      │
└────────┬───────────────────────┬────────────────────┬───────────────┘
         │                       │                    │
         │ Prisma                │ S3 Protocol        │ HTTP
         ▼                       ▼                    ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │      MinIO       │    │   AI Service    │
│   Database      │    │ Object Storage   │    │  (Flask/Python) │
│   Port: 5432    │    │   Port: 9000     │    │   Port: 5000    │
│                 │    │   Console: 9001  │    │                 │
│  ┌───────────┐  │    │  ┌────────────┐  │    │  ┌───────────┐  │
│  │  Tables:  │  │    │  │  Buckets:  │  │    │  │Placeholder│  │
│  │  - Users  │  │    │  │  - Body    │  │    │  │  for AI   │  │
│  │  - Garments│ │    │  │    Images  │  │    │  │  Model    │  │
│  │  - Outfits│  │    │  │  - Garments│  │    │  │Integration│  │
│  │  - TryOns │  │    │  │  - Results │  │    │  └───────────┘  │
│  └───────────┘  │    │  └────────────┘  │    └─────────────────┘
└─────────────────┘    └──────────────────┘
```

## Data Flow

### 1. User Authentication Flow
```
User → Frontend → Backend → Database
                     ↓
              JWT Token Generated
                     ↓
         Token Stored in LocalStorage
                     ↓
        Used for Authenticated Requests
```

### 2. Garment Upload Flow
```
User Selects Image → Frontend
                        ↓
              Multipart Form Data → Backend
                                      ↓
                             Image Uploaded → MinIO
                                      ↓
                             URL Stored → Database
                                      ↓
                             Response with URL → Frontend
```

### 3. Try-On Request Flow
```
User Selects Body Image + Outfit → Frontend
                                      ↓
                            Request → Backend
                                      ↓
                          Create Try-On Record → Database
                                      ↓
                        Async Request → AI Service
                                      ↓
                           Fetch Images ← MinIO
                                      ↓
                        Process (Placeholder)
                                      ↓
                           Upload Result → MinIO
                                      ↓
                         Update Try-On Status → Database
                                      ↓
                           User Polls for Status ← Frontend
```

## Component Architecture

### Backend Components

```
backend/
├── src/
│   ├── index.ts              # Main server setup, plugin registration
│   ├── routes/               # API route handlers
│   │   ├── auth.ts          # Authentication endpoints
│   │   ├── garments.ts      # Wardrobe management
│   │   ├── outfits.ts       # Outfit creation
│   │   ├── body-images.ts   # Body image uploads
│   │   └── try-ons.ts       # Try-on requests
│   ├── middleware/
│   │   └── auth.ts          # JWT verification
│   └── utils/
│       ├── prisma.ts        # Database client
│       └── minio.ts         # Object storage client
└── prisma/
    └── schema.prisma        # Database schema definition
```

### Frontend Components

```
frontend/
├── src/
│   ├── main.tsx             # Application entry point
│   ├── App.tsx              # Router configuration
│   ├── pages/               # Page components
│   │   ├── Login.tsx        # Login page
│   │   ├── Register.tsx     # Registration page
│   │   ├── Dashboard.tsx    # Main dashboard
│   │   ├── Wardrobe.tsx     # Wardrobe management
│   │   ├── Outfits.tsx      # Outfit creation
│   │   └── TryOn.tsx        # Try-on interface
│   ├── components/
│   │   └── NavBar.tsx       # Navigation component
│   ├── services/            # API service layer
│   │   ├── api.ts           # Axios instance
│   │   ├── auth.ts          # Auth API calls
│   │   ├── garments.ts      # Garment API calls
│   │   ├── outfits.ts       # Outfit API calls
│   │   ├── bodyImages.ts    # Body image API calls
│   │   └── tryOns.ts        # Try-on API calls
│   ├── stores/
│   │   └── authStore.ts     # Global auth state (Zustand)
│   └── types/
│       └── index.ts         # TypeScript type definitions
```

## Database Schema

```
User
├── id (UUID, PK)
├── email (String, Unique)
├── password (String, Hashed)
├── name (String?)
├── createdAt (DateTime)
└── updatedAt (DateTime)

Garment
├── id (UUID, PK)
├── userId (UUID, FK → User)
├── name (String)
├── category (Enum: TOP, BOTTOM, DRESS, etc.)
├── color (String?)
├── brand (String?)
├── imageUrl (String)
├── description (String?)
├── createdAt (DateTime)
└── updatedAt (DateTime)

Outfit
├── id (UUID, PK)
├── userId (UUID, FK → User)
├── name (String)
├── createdAt (DateTime)
└── updatedAt (DateTime)

OutfitGarment (Join Table)
├── id (UUID, PK)
├── outfitId (UUID, FK → Outfit)
└── garmentId (UUID, FK → Garment)

BodyImage
├── id (UUID, PK)
├── userId (UUID, FK → User)
├── imageUrl (String)
├── createdAt (DateTime)
└── updatedAt (DateTime)

TryOn
├── id (UUID, PK)
├── userId (UUID, FK → User)
├── bodyImageId (UUID, FK → BodyImage)
├── outfitId (UUID?, FK → Outfit)
├── status (Enum: PENDING, PROCESSING, COMPLETED, FAILED)
├── resultUrl (String?)
├── createdAt (DateTime)
└── updatedAt (DateTime)

TryOnGarment (Join Table)
├── id (UUID, PK)
├── tryOnId (UUID, FK → TryOn)
└── garmentId (UUID, FK → Garment)
```

## Security Considerations

1. **Authentication**: JWT tokens with secure secrets
2. **Password Storage**: Bcrypt hashing with salt rounds
3. **CORS**: Configured to allow frontend domain
4. **File Upload**: Size limits and type validation
5. **Authorization**: User-scoped data access
6. **SQL Injection**: Protected via Prisma ORM
7. **XSS**: React's built-in escaping

## Scalability Considerations

### Current Architecture
- Single instance of each service
- Suitable for small to medium user base
- Development and demo purposes

### Future Scaling Options
1. **Horizontal Scaling**
   - Multiple backend instances behind load balancer
   - Redis for session management
   - Separate read/write database replicas

2. **Microservices**
   - Separate services for auth, wardrobe, try-on
   - Message queue (RabbitMQ, Kafka) for async processing
   - Service mesh (Istio) for service communication

3. **Storage**
   - CDN for static assets
   - Distributed MinIO cluster
   - Database sharding by user

4. **AI Service**
   - GPU-enabled containers
   - Model serving with TensorFlow Serving or TorchServe
   - Batch processing for try-ons
   - Caching of results

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 | UI framework |
| Frontend Build | Vite | Fast build tool |
| Frontend Styling | Tailwind CSS | Utility-first CSS |
| Frontend State | Zustand | Global state management |
| Frontend Routing | React Router | Client-side routing |
| Backend Framework | Fastify | Fast web framework |
| Backend Runtime | Node.js 20 | JavaScript runtime |
| Backend Language | TypeScript | Type safety |
| Database | PostgreSQL 15 | Relational database |
| ORM | Prisma | Type-safe database client |
| Object Storage | MinIO | S3-compatible storage |
| Authentication | JWT | Token-based auth |
| API Documentation | Swagger/OpenAPI | Interactive API docs |
| AI Service | Flask (Python) | AI model serving |
| Containerization | Docker | Application packaging |
| Orchestration | Docker Compose | Multi-container management |

## Port Allocation

| Service | Port | Purpose |
|---------|------|---------|
| Frontend | 5173 | React development server |
| Backend | 3000 | API server |
| PostgreSQL | 5432 | Database connection |
| MinIO | 9000 | S3 API |
| MinIO Console | 9001 | Web interface |
| AI Service | 5000 | AI processing |
