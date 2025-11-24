# Virtual Closet - AI Virtual Try-On Application

A full-stack application that allows users to manage their wardrobe, create outfits, and virtually try them on using AI technology.

## Features

- **User Authentication**: Secure JWT-based authentication
- **Wardrobe Management**: Upload and organize clothing items by category
- **Outfit Creation**: Combine multiple garments into outfits
- **AI Virtual Try-On**: Upload body images and see how outfits look (AI service placeholder)
- **Image Storage**: MinIO S3-compatible object storage for all images
- **RESTful API**: Well-documented Swagger API
- **Modern UI**: Responsive React interface with Tailwind CSS

## Tech Stack

### Backend
- **Node.js** with **Fastify** framework
- **TypeScript** with ESM modules
- **PostgreSQL** database
- **Prisma** ORM
- **JWT** authentication
- **Swagger/OpenAPI** documentation
- **MinIO** for object storage

### Frontend
- **React** 18
- **Vite** build tool
- **TypeScript**
- **Tailwind CSS**
- **React Router** for navigation
- **Zustand** for state management
- **Axios** for API calls

### AI Service
- **Python** with **Flask**
- **MinIO** client for image storage
- Placeholder for AI model integration

### Infrastructure
- **Docker Compose** for orchestration
- **PostgreSQL** database container
- **MinIO** object storage container

## Getting Started

### Prerequisites
- Docker and Docker Compose installed
- At least 4GB of available RAM

### Quick Start

1. Clone the repository:
```bash
git clone https://github.com/clara-s-n/virtual-closet.git
cd virtual-closet
```

2. Start all services with Docker Compose:
```bash
docker-compose up -d
```

3. Wait for all services to start (may take a few minutes on first run)

4. Access the application:
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:3000
   - **API Documentation**: http://localhost:3000/docs
   - **MinIO Console**: http://localhost:9001 (login: minioadmin/minioadmin)

### Initial Setup

1. **Database Migration**:
   The database will be automatically initialized when the backend starts. To run migrations manually:
   ```bash
   docker-compose exec backend npx prisma migrate dev
   ```

2. **Create an Account**:
   - Navigate to http://localhost:5173
   - Click "Register" and create an account
   - Login with your credentials

3. **Start Using the App**:
   - Upload body images
   - Add clothing items to your wardrobe
   - Create outfits
   - Try on outfits virtually

## Project Structure

```
virtual-closet/
├── backend/                 # Backend API service
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Authentication middleware
│   │   ├── utils/          # Utilities (Prisma, MinIO)
│   │   └── index.ts        # Main server file
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── stores/         # State management
│   │   ├── types/          # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
├── ai-service/              # AI service placeholder
│   ├── app.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── README.md
└── docker-compose.yml       # Docker Compose configuration
```

## API Documentation

Once the backend is running, visit http://localhost:3000/docs for complete API documentation.

### Main Endpoints

- **Authentication**
  - `POST /api/auth/register` - Register new user
  - `POST /api/auth/login` - Login user
  - `GET /api/auth/me` - Get current user

- **Garments**
  - `GET /api/garments` - Get all garments
  - `POST /api/garments` - Create garment with image
  - `DELETE /api/garments/:id` - Delete garment

- **Outfits**
  - `GET /api/outfits` - Get all outfits
  - `POST /api/outfits` - Create outfit
  - `DELETE /api/outfits/:id` - Delete outfit

- **Body Images**
  - `GET /api/body-images` - Get all body images
  - `POST /api/body-images` - Upload body image
  - `DELETE /api/body-images/:id` - Delete body image

- **Try-Ons**
  - `GET /api/try-ons` - Get all try-ons
  - `POST /api/try-ons` - Create try-on request
  - `GET /api/try-ons/:id` - Get try-on by ID

## Development

### Backend Development

```bash
cd backend
npm install
npm run dev
```

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

### Database Management

```bash
# Generate Prisma Client
cd backend
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Open Prisma Studio
npx prisma studio
```

## Environment Variables

### Backend (.env)
```
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/virtualcloset
JWT_SECRET=your-secret-key
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_USE_SSL=false
AI_SERVICE_URL=http://ai-service:5000
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
```

## AI Integration

The AI service is currently a placeholder. To integrate a real virtual try-on AI model:

1. Choose an AI model (VITON, CP-VTON, Stable Diffusion + ControlNet, etc.)
2. Update `ai-service/app.py` with the model implementation
3. Add model dependencies to `ai-service/requirements.txt`
4. Update the Docker image if GPU support is needed

See `ai-service/README.md` for detailed integration instructions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License

## Support

For issues or questions, please open an issue on GitHub.