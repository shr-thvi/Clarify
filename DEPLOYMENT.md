# Clarify - Deployment Guide

## Overview

Clarify is a production-ready educational platform that uses AI to clarify student doubts and provide detailed explanations with answers.

## Prerequisites

- **Node.js**: v18+ (v20 recommended)
- **npm** or **yarn**
- **Groq API Key**: From [console.groq.com](https://console.groq.com)
- **Docker**: (Optional, for containerized deployment)

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd clarify
npm install
```

### 2. Configure Environment Variables

```bash
# Copy the example configuration
cp .env.example .env

# Edit .env with your configuration
# IMPORTANT: Add your Groq API key
GROQ_API_KEY=your_api_key_here
APP_URL=http://localhost:3000
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Production Deployment

### Option 1: Direct Node.js Deployment

#### Build for Production

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Verify build
ls -la dist/
```

#### Run Production Server

```bash
# Set production environment
export NODE_ENV=production

# Run the server
npm start
```

Or with environment variables:

```bash
NODE_ENV=production GROQ_API_KEY=your_key APP_URL=https://yourdomain.com npm start
```

### Option 2: Docker Deployment

#### Build Docker Image

```bash
docker build -t clarify:latest .
```

#### Run Docker Container

```bash
docker run -d \
  --name clarify \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e GROQ_API_KEY=your_api_key_here \
  -e APP_URL=https://yourdomain.com \
  clarify:latest
```

#### Docker Compose Deployment

```bash
docker-compose up -d
```

Update `docker-compose.yml` with your environment variables before running.

### Option 3: Cloud Platforms

#### AWS Elastic Beanstalk

```bash
# Initialize EB application
eb init clarify --platform node.js

# Create environment
eb create clarify-env

# Deploy
eb deploy

# Set environment variables
eb setenv GROQ_API_KEY=your_key APP_URL=https://your-domain.elasticbeanstalk.com

# Open in browser
eb open
```

#### Google Cloud Run

```bash
# Build and push image
gcloud builds submit --tag gcr.io/PROJECT_ID/clarify

# Deploy
gcloud run deploy clarify \
  --image gcr.io/PROJECT_ID/clarify \
  --platform managed \
  --region us-central1 \
  --set-env-vars GROQ_API_KEY=your_key,APP_URL=https://your-cloud-run-url.run.app
```

#### Vercel / Railway / Heroku

These platforms support Node.js applications directly:

1. Connect your repository
2. Set environment variables in the platform's dashboard
3. Enable auto-deploy from main branch

## Environment Variables

### Required

- `GROQ_API_KEY`: Your Groq API key for AI models

### Optional

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)
- `APP_URL`: Application URL for self-referential links
- `CORS_ORIGIN`: CORS origin configuration

### Optional (Future Features)

- `LIBRE_TRANSLATE_URL`: LibreTranslate server URL
- `LIBRE_TRANSLATE_KEY`: LibreTranslate API key

## Database & Data Persistence

Currently, Clarify stores data in JSON files:

- `data/users.json`: User accounts
- `data/sessions.json`: Active sessions
- `data/analytics.json`: Usage analytics

For production, consider migrating to:

- **PostgreSQL**: For relational data
- **MongoDB**: For flexible data modeling
- **Redis**: For session management

## Health Checks

### Kubernetes / Docker Orchestration

The application exposes health check endpoints:

- `GET /health` - General health status
- `GET /api/health` - API health status

Example response:

```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0"
}
```

## Security Best Practices

### 1. Environment Variables

- **Never commit `.env` to version control**
- Use `.env.example` as a template
- Store secrets in your deployment platform's secret manager

### 2. CORS Configuration

Update `CORS_ORIGIN` to match your domain:

```env
CORS_ORIGIN=https://yourdomain.com
```

### 3. HTTPS/TLS

- Always use HTTPS in production
- Use reverse proxies like nginx for SSL termination

### 4. Rate Limiting

The API includes rate limiting middleware:

```
100 requests per 15 minutes per IP
```

### 5. Helmet Security Headers

Security headers are automatically configured via Helmet middleware.

## Performance Optimization

### 1. Caching

- Enable browser caching for static assets
- Consider Redis for session caching

### 2. Content Delivery

- Use a CDN (CloudFront, Cloudflare) for static assets
- Deploy to regional data centers

### 3. Database

- Add database indexes for frequently queried fields
- Use connection pooling

## Monitoring & Logging

### Application Logs

Logs are output to stdout/stderr:

```bash
# View logs in Docker
docker logs clarify -f

# View logs in production
tail -f /var/log/clarify.log
```

### Monitoring Tools

Recommended:

- **New Relic**: Application performance monitoring
- **DataDog**: Infrastructure monitoring
- **Sentry**: Error tracking
- **LogRocket**: Frontend monitoring

## Backup & Disaster Recovery

### Data Backups

```bash
# Backup data directory
tar -czf clarify-backup-$(date +%Y%m%d).tar.gz data/

# Restore from backup
tar -xzf clarify-backup-20240115.tar.gz
```

### Automated Backups

Configure daily automated backups to cloud storage (S3, GCS, etc.)

## Scaling Considerations

### Horizontal Scaling

For high traffic:

1. Deploy multiple instances
2. Use load balancer (AWS ELB, nginx)
3. Share session storage (Redis)
4. Use database instead of JSON files

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize Node.js application

## Troubleshooting

### Common Issues

#### 1. "GROQ_API_KEY not found"

```bash
# Verify environment variable is set
echo $GROQ_API_KEY

# Or check in .env file
cat .env
```

#### 2. Port already in use

```bash
# Change port
PORT=3001 npm start

# Or kill existing process
lsof -ti:3000 | xargs kill -9
```

#### 3. Build fails

```bash
# Clean build
npm run clean
npm install
npm run build
```

#### 4. API errors

Check error logs:

```bash
# In development
npm run dev  # Will show console logs

# In production
docker logs clarify  # If using Docker
```

## Updates & Maintenance

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update all dependencies
npm update

# Run tests
npm run lint
```

### Zero-Downtime Deployment

1. Deploy new version to separate server
2. Run health checks
3. Switch traffic using load balancer
4. Keep old version as fallback

## Support & Resources

- **Groq Docs**: https://console.groq.com/docs
- **Node.js Docs**: https://nodejs.org/docs
- **Express Docs**: https://expressjs.com
- **React Docs**: https://react.dev

## License

See LICENSE file for details.

---

**Last Updated**: January 2024
**Clarify Version**: 1.0.0
