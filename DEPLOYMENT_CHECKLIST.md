# Deployment Checklist

Use this checklist to ensure your Virtual Closet application is properly configured before deployment.

## Pre-Deployment

### Security Configuration
- [ ] Generate a secure JWT secret: `openssl rand -base64 32`
- [ ] Create `.env` file with your JWT secret
- [ ] Change default PostgreSQL password (optional but recommended)
- [ ] Review and update MinIO access credentials
- [ ] Ensure Flask debug mode is disabled (check FLASK_DEBUG env var)
- [ ] Review CORS settings in backend for production domain

### Environment Setup
- [ ] Docker and Docker Compose are installed
- [ ] Required ports are available (3000, 5173, 5432, 9000, 9001, 5000)
- [ ] Sufficient disk space (at least 5GB for images and database)
- [ ] Sufficient RAM (minimum 4GB recommended)

### Configuration Files
- [ ] Backend `.env` created from `.env.example`
- [ ] Frontend `.env` created from `.env.example`
- [ ] Root `.env` created with JWT_SECRET
- [ ] Review `docker-compose.yml` environment variables
- [ ] Update API URLs for production if needed

## Deployment

### Initial Deployment
- [ ] Run validation script: `./validate.sh`
- [ ] Start services: `./start.sh` or `docker compose up -d`
- [ ] Wait for services to initialize (~30-60 seconds)
- [ ] Check service health: `docker compose ps`
- [ ] View logs for errors: `docker compose logs`

### Database Setup
- [ ] Verify PostgreSQL is running: `docker compose logs postgres`
- [ ] Check database migration status
- [ ] Run migrations if needed: `docker compose exec backend npx prisma migrate dev`
- [ ] Verify tables are created: `docker compose exec postgres psql -U virtualcloset -d virtualcloset -c "\dt"`

### Storage Setup
- [ ] Verify MinIO is running: `docker compose logs minio`
- [ ] Access MinIO console at http://localhost:9001
- [ ] Verify buckets are created: body-images, garments, try-on-results
- [ ] Test image upload functionality

### Application Testing
- [ ] Access frontend at http://localhost:5173
- [ ] Register a new user account
- [ ] Login with the new account
- [ ] Upload a body image
- [ ] Add a clothing item to wardrobe
- [ ] Create an outfit
- [ ] Test try-on functionality
- [ ] Verify images display correctly
- [ ] Test logout and login again

### API Testing
- [ ] Access API documentation at http://localhost:3000/docs
- [ ] Test authentication endpoints
- [ ] Test file upload endpoints
- [ ] Verify API responses are correct
- [ ] Check error handling

## Production Considerations

### Security Hardening
- [ ] Use strong, unique JWT secret (not the default)
- [ ] Use strong database password
- [ ] Configure firewall rules
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure reverse proxy (nginx/traefik)
- [ ] Enable rate limiting
- [ ] Set up monitoring and logging
- [ ] Regular security updates

### Performance Optimization
- [ ] Configure database connection pooling
- [ ] Set up database backups
- [ ] Configure MinIO replication (if using multiple nodes)
- [ ] Enable CDN for static assets
- [ ] Set up caching (Redis)
- [ ] Monitor resource usage
- [ ] Configure auto-scaling if needed

### Monitoring & Logging
- [ ] Set up application logging
- [ ] Configure error tracking (Sentry, etc.)
- [ ] Set up uptime monitoring
- [ ] Configure alerts for service failures
- [ ] Monitor database performance
- [ ] Track API usage and metrics

### Backup & Recovery
- [ ] Set up automated database backups
- [ ] Configure MinIO backup/replication
- [ ] Test backup restoration process
- [ ] Document recovery procedures
- [ ] Store backups securely off-site

### Documentation
- [ ] Update README with production URLs
- [ ] Document deployment process
- [ ] Create runbook for common issues
- [ ] Document backup/restore procedures
- [ ] Create user guide

## Post-Deployment

### Verification
- [ ] All services are running
- [ ] No errors in logs
- [ ] Users can register and login
- [ ] Image uploads work
- [ ] All features functional
- [ ] Performance is acceptable

### Monitoring
- [ ] Monitor service health
- [ ] Check resource usage
- [ ] Review error logs
- [ ] Monitor user activity
- [ ] Track API usage

### Maintenance
- [ ] Schedule regular updates
- [ ] Monitor for security vulnerabilities
- [ ] Review and rotate secrets regularly
- [ ] Clean up old/unused data
- [ ] Monitor storage usage

## AI Service Integration (Future)

When integrating a real AI model:
- [ ] Choose AI model (VITON, CP-VTON, etc.)
- [ ] Update ai-service/requirements.txt with model dependencies
- [ ] Update ai-service/app.py with model loading and inference
- [ ] Configure GPU support if needed
- [ ] Test model performance
- [ ] Optimize inference speed
- [ ] Set up result caching
- [ ] Monitor GPU usage

## Troubleshooting

If issues occur, refer to:
- [ ] TROUBLESHOOTING.md for common issues
- [ ] Service logs: `docker compose logs [service]`
- [ ] Container status: `docker compose ps`
- [ ] Resource usage: `docker stats`

## Support

For help:
- [ ] Check existing documentation
- [ ] Review TROUBLESHOOTING.md
- [ ] Check GitHub Issues
- [ ] Create new issue if needed

---

**Last Updated**: 2025-11-24
**Version**: 1.0.0
