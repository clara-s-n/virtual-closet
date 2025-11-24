# Virtual Closet - Application Flow

This document describes the user flows and interactions within the Virtual Closet application.

## User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                      NEW USER JOURNEY                           │
└─────────────────────────────────────────────────────────────────┘

1. Landing → Register Page
   ├─ Enter: Email, Password, Name (optional)
   ├─ Submit Registration
   └─ → Login (automatic) → Dashboard

2. Dashboard
   ├─ View Overview
   ├─ Navigation Options:
   │  ├─ My Wardrobe
   │  ├─ My Outfits
   │  └─ AI Try-On
   └─ Logout Option

3. My Wardrobe
   ├─ View All Garments
   ├─ Filter by Category (Top, Bottom, Dress, etc.)
   ├─ Add New Item:
   │  ├─ Upload Image
   │  ├─ Enter Details (Name, Category, Color, Brand)
   │  └─ Save → Stored in MinIO + Database
   └─ Delete Items

4. My Outfits
   ├─ View All Outfits
   ├─ Create New Outfit:
   │  ├─ Select Garments from Wardrobe
   │  ├─ Name the Outfit
   │  └─ Save → Stored in Database
   └─ Delete Outfits

5. AI Try-On
   ├─ Upload Body Image (if not already uploaded)
   ├─ Select Outfit or Individual Garments
   ├─ Submit Try-On Request
   ├─ View Status (Pending → Processing → Completed/Failed)
   └─ View Result Image (when completed)
```

## Technical Flows

### Authentication Flow

```
┌──────────┐       ┌──────────┐       ┌──────────┐
│ Frontend │───────│ Backend  │───────│ Database │
└──────────┘       └──────────┘       └──────────┘
     │                  │                   │
     │ POST /register   │                   │
     │─────────────────>│                   │
     │  email, password │ Hash password     │
     │                  │─────────────────> │
     │                  │ Create user       │
     │                  │<───────────────── │
     │                  │ Generate JWT      │
     │<─────────────────│                   │
     │  user, token     │                   │
     │                  │                   │
     │ Store in         │                   │
     │ localStorage     │                   │
     │                  │                   │
     │ All future       │                   │
     │ requests include │                   │
     │ JWT in header    │                   │
     │─────────────────>│ Verify JWT        │
     │                  │ Extract user ID   │
     │                  │                   │
```

### Image Upload Flow

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ Frontend │   │ Backend  │   │  MinIO   │   │ Database │
└──────────┘   └──────────┘   └──────────┘   └──────────┘
     │              │              │              │
     │ Select File  │              │              │
     │              │              │              │
     │ POST /api/   │              │              │
     │ garments     │              │              │
     │ FormData     │              │              │
     │─────────────>│              │              │
     │              │ Validate     │              │
     │              │ file         │              │
     │              │              │              │
     │              │ Upload to    │              │
     │              │ MinIO        │              │
     │              │─────────────>│              │
     │              │              │ Store file   │
     │              │<─────────────│              │
     │              │ Get URL      │              │
     │              │              │              │
     │              │ Save to DB   │              │
     │              │─────────────────────────────>│
     │              │              │ Create record│
     │              │<─────────────────────────────│
     │              │              │              │
     │<─────────────│              │              │
     │ Garment data │              │              │
     │ with URL     │              │              │
```

### Try-On Processing Flow

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ Frontend │   │ Backend  │   │    AI    │   │  MinIO   │
└──────────┘   └──────────┘   │ Service  │   └──────────┘
     │              │          └──────────┘        │
     │ POST /api/   │              │              │
     │ try-ons      │              │              │
     │─────────────>│              │              │
     │              │ Create       │              │
     │              │ try-on       │              │
     │              │ record       │              │
     │              │ (PENDING)    │              │
     │<─────────────│              │              │
     │              │              │              │
     │              │ POST /try-on │              │
     │              │─────────────>│              │
     │              │              │ Update       │
     │              │              │ (PROCESSING) │
     │              │              │              │
     │              │              │ Fetch images │
     │              │              │<─────────────│
     │              │              │              │
     │              │              │ AI Process   │
     │              │              │ (Placeholder)│
     │              │              │              │
     │              │              │ Upload result│
     │              │              │─────────────>│
     │              │<─────────────│              │
     │              │ Update DB    │              │
     │              │ (COMPLETED)  │              │
     │              │              │              │
     │ Poll /api/   │              │              │
     │ try-ons/:id  │              │              │
     │─────────────>│              │              │
     │<─────────────│              │              │
     │ Get result   │              │              │
     │ with URL     │              │              │
```

## Page Components

### Login Page
```
┌─────────────────────────────────┐
│        Virtual Closet          │
│            Login               │
├─────────────────────────────────┤
│  Email: [____________]         │
│  Password: [____________]      │
│                                 │
│  [     Login Button      ]     │
│                                 │
│  Don't have an account?        │
│  Register →                    │
└─────────────────────────────────┘
```

### Dashboard
```
┌─────────────────────────────────────┐
│  Virtual Closet    Welcome, User ▼ │
│  Wardrobe | Outfits | Try-On       │
├─────────────────────────────────────┤
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │   📦     │  │   👔     │        │
│  │ Wardrobe │  │ Outfits  │        │
│  │ Manage   │  │ Create   │        │
│  └──────────┘  └──────────┘        │
│                                     │
│  ┌──────────┐                      │
│  │   🤖     │                      │
│  │ AI Try-On│                      │
│  │ Virtual  │                      │
│  └──────────┘                      │
└─────────────────────────────────────┘
```

### Wardrobe Page
```
┌─────────────────────────────────────┐
│  Virtual Closet    Welcome, User ▼ │
│  Wardrobe | Outfits | Try-On       │
├─────────────────────────────────────┤
│  My Wardrobe        [+ Add Item]   │
│                                     │
│  Filter: [All ▼]                   │
│                                     │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐      │
│  │IMG │ │IMG │ │IMG │ │IMG │      │
│  │Top │ │Jean│ │Dres│ │Shoe│      │
│  │Blue│ │Blac│ │Red │ │Wht │      │
│  │[X] │ │[X] │ │[X] │ │[X] │      │
│  └────┘ └────┘ └────┘ └────┘      │
└─────────────────────────────────────┘
```

### Outfit Creation
```
┌─────────────────────────────────────┐
│  Virtual Closet    Welcome, User ▼ │
│  Wardrobe | Outfits | Try-On       │
├─────────────────────────────────────┤
│  My Outfits      [+ Create Outfit] │
│                                     │
│  ┌───────────────┐ ┌──────────────┐│
│  │ Summer Look   │ │ Office Style ││
│  │ ┌──┐ ┌──┐    │ │ ┌──┐ ┌──┐   ││
│  │ │  │ │  │    │ │ │  │ │  │   ││
│  │ └──┘ └──┘    │ │ └──┘ └──┘   ││
│  │ 3 items       │ │ 4 items      ││
│  │ [Delete]      │ │ [Delete]     ││
│  └───────────────┘ └──────────────┘│
└─────────────────────────────────────┘
```

### Try-On Page
```
┌─────────────────────────────────────┐
│  Virtual Closet    Welcome, User ▼ │
│  Wardrobe | Outfits | Try-On       │
├─────────────────────────────────────┤
│  AI Try-On        [+ New Try-On]   │
│                                     │
│  ┌────────────────────────────────┐│
│  │  Body Image  │    Result       ││
│  │  ┌────────┐  │  ┌────────┐    ││
│  │  │        │  │  │        │    ││
│  │  │  User  │  │  │ Try-On │    ││
│  │  │  Photo │  │  │ Result │    ││
│  │  └────────┘  │  └────────┘    ││
│  │  Status: ✓ Completed           ││
│  │  Outfit: Summer Look            ││
│  └────────────────────────────────┘│
└─────────────────────────────────────┘
```

## Data Models

### User
- id: UUID
- email: string (unique)
- password: string (hashed)
- name: string (optional)
- createdAt: DateTime
- Relations: garments[], bodyImages[], outfits[], tryOns[]

### Garment
- id: UUID
- userId: UUID
- name: string
- category: enum (TOP, BOTTOM, DRESS, OUTERWEAR, SHOES, ACCESSORY)
- color: string (optional)
- brand: string (optional)
- imageUrl: string
- description: string (optional)
- createdAt: DateTime

### Outfit
- id: UUID
- userId: UUID
- name: string
- createdAt: DateTime
- Relations: garments[] (many-to-many)

### BodyImage
- id: UUID
- userId: UUID
- imageUrl: string
- createdAt: DateTime

### TryOn
- id: UUID
- userId: UUID
- bodyImageId: UUID
- outfitId: UUID (optional)
- status: enum (PENDING, PROCESSING, COMPLETED, FAILED)
- resultUrl: string (optional)
- createdAt: DateTime
- Relations: garments[] (many-to-many)

## API Request/Response Examples

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepass123",
  "name": "John Doe"
}

Response 201:
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "jwt.token.here"
}
```

### Upload Garment
```http
POST /api/garments
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: [image file]
name: "Blue T-Shirt"
category: "TOP"
color: "Blue"
brand: "Nike"

Response 201:
{
  "id": "uuid",
  "name": "Blue T-Shirt",
  "category": "TOP",
  "color": "Blue",
  "brand": "Nike",
  "imageUrl": "https://minio:9000/garments/uuid.jpg"
}
```

### Create Try-On
```http
POST /api/try-ons
Authorization: Bearer {token}
Content-Type: application/json

{
  "bodyImageId": "uuid",
  "outfitId": "uuid"
}

Response 201:
{
  "id": "uuid",
  "bodyImageId": "uuid",
  "outfitId": "uuid",
  "status": "PENDING",
  "createdAt": "2025-11-24T13:00:00Z"
}
```

## State Management

### Frontend State (Zustand)
```typescript
authStore:
  - user: User | null
  - token: string | null
  - setAuth(user, token)
  - logout()
  - isAuthenticated()
```

### Component State (React)
- Local form inputs
- Loading states
- Modal visibility
- Selected items
- Error messages

## Error Handling

### API Errors
- 400: Bad Request (validation errors)
- 401: Unauthorized (invalid/missing token)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error

### User Feedback
- Loading indicators during async operations
- Error messages for failed operations
- Success confirmations
- Form validation feedback

---

**Version**: 1.0.0
**Last Updated**: 2025-11-24
