# Troubleshooting Guide

This guide helps you resolve common issues with Virtual Closet.

## Docker Issues

### Services Won't Start

**Problem**: Docker Compose fails to start services

**Solutions**:
1. Check if Docker is running:
   ```bash
   docker ps
   ```

2. Check for port conflicts:
   ```bash
   # Check if ports are already in use
   lsof -i :3000  # Backend
   lsof -i :5173  # Frontend
   lsof -i :5432  # PostgreSQL
   lsof -i :9000  # MinIO
   ```

3. Remove existing containers and volumes:
   ```bash
   docker compose down -v
   docker compose up -d
   ```

### Database Connection Issues

**Problem**: Backend can't connect to PostgreSQL

**Solutions**:
1. Wait for PostgreSQL to be fully ready:
   ```bash
   docker compose logs postgres
   ```

2. Check PostgreSQL health:
   ```bash
   docker compose exec postgres pg_isready -U virtualcloset
   ```

3. Restart the backend service:
   ```bash
   docker compose restart backend
   ```

### MinIO Connection Issues

**Problem**: Can't upload or access images

**Solutions**:
1. Check MinIO status:
   ```bash
   docker compose logs minio
   ```

2. Access MinIO console at http://localhost:9001
   - Login: minioadmin / minioadmin
   - Check if buckets exist: `body-images`, `garments`, `try-on-results`

3. Restart MinIO:
   ```bash
   docker compose restart minio
   ```

## Backend Issues

### Prisma Migration Errors

**Problem**: Database schema not initialized

**Solutions**:
1. Run migrations manually:
   ```bash
   docker compose exec backend npx prisma migrate dev
   ```

2. Generate Prisma Client:
   ```bash
   docker compose exec backend npx prisma generate
   ```

3. Reset database (WARNING: deletes all data):
   ```bash
   docker compose exec backend npx prisma migrate reset
   ```

### JWT Authentication Errors

**Problem**: "Unauthorized" errors when accessing API

**Solutions**:
1. Check if token is being sent:
   - Open browser DevTools > Network
   - Look for `Authorization: Bearer <token>` header

2. Token might be expired - login again

3. Clear localStorage and login again:
   ```javascript
   localStorage.clear()
   ```

### File Upload Errors

**Problem**: Can't upload images

**Solutions**:
1. Check file size (max 10MB)
2. Check file format (must be image)
3. Check backend logs:
   ```bash
   docker compose logs backend
   ```

## Frontend Issues

### White Screen / App Won't Load

**Problem**: Frontend shows blank page

**Solutions**:
1. Check browser console for errors
2. Verify API URL is correct in `.env`:
   ```
   VITE_API_URL=http://localhost:3000
   ```

3. Rebuild frontend:
   ```bash
   docker compose restart frontend
   ```

### API Connection Errors

**Problem**: "Network Error" or CORS errors

**Solutions**:
1. Verify backend is running:
   ```bash
   curl http://localhost:3000/health
   ```

2. Check CORS configuration in backend

3. Verify API URL in frontend `.env` file

### Images Not Displaying

**Problem**: Image URLs show but images don't load

**Solutions**:
1. Check MinIO is running and accessible
2. Open MinIO console and verify images exist
3. Check browser console for CORS errors
4. MinIO presigned URLs expire after 7 days - re-upload images

## AI Service Issues

### Try-On Results Not Generating

**Problem**: Try-on status stays "PENDING"

**Solutions**:
1. Check AI service logs:
   ```bash
   docker compose logs ai-service
   ```

2. Verify AI service is running:
   ```bash
   curl http://localhost:5000/health
   ```

3. Note: AI service is a placeholder - results won't be real until AI model is integrated

## Performance Issues

### Slow Application Response

**Solutions**:
1. Check system resources:
   ```bash
   docker stats
   ```

2. Increase Docker resources (Docker Desktop):
   - Settings > Resources
   - Increase CPU and Memory

3. Check database query performance:
   ```bash
   docker compose exec backend npx prisma studio
   ```

### High Memory Usage

**Solutions**:
1. Restart services:
   ```bash
   docker compose restart
   ```

2. Clean up unused Docker resources:
   ```bash
   docker system prune -a
   ```

## Development Issues

### Changes Not Reflecting

**Problem**: Code changes don't appear in running app

**Solutions**:
1. For backend: Check if tsx watch is running:
   ```bash
   docker compose logs backend
   ```

2. For frontend: Check if Vite dev server is running:
   ```bash
   docker compose logs frontend
   ```

3. Rebuild containers:
   ```bash
   docker compose up -d --build
   ```

### TypeScript Errors

**Problem**: Type errors in development

**Solutions**:
1. Regenerate types:
   ```bash
   # Backend
   cd backend
   npx prisma generate
   
   # Frontend
   cd frontend
   npm run build
   ```

2. Delete node_modules and reinstall:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

## Getting Help

If you're still experiencing issues:

1. Check existing [GitHub Issues](https://github.com/clara-s-n/virtual-closet/issues)
2. Create a new issue with:
   - Description of the problem
   - Steps to reproduce
   - Error messages
   - System information (OS, Docker version)
   - Relevant logs

## Useful Commands

```bash
# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend

# Restart all services
docker compose restart

# Stop all services
docker compose down

# Stop and remove all data
docker compose down -v

# Rebuild and restart
docker compose up -d --build

# Execute command in container
docker compose exec backend sh
docker compose exec postgres psql -U virtualcloset

# Check service status
docker compose ps

# View resource usage
docker stats
```
