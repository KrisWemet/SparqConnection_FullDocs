# Deployment Guide

## Overview
This guide details the deployment process for Sparq Connection's 12-couple testing phase. The application uses a unified `.env` file for all environment variables and supports both local testing with ngrok and production deployment to Vercel/Render.

## Environment Configuration

### 1. Environment Variables Setup
1. Copy `.env.template` to `.env` in the project root:
```bash
cp .env.template .env
```

2. Fill in all required variables in `.env`:
- Firebase configuration
- Frontend variables
- Backend credentials
- Testing configuration
- Local development settings

### 2. Variable Synchronization
The root `.env` file serves as the single source of truth. Variables are automatically mapped based on environment:
- Production: Uses `REACT_APP_` prefixed variables for frontend
- Development: Uses `DEV_` prefixed variables for local testing

## Local Development Setup

### 1. SSL Certificate Generation
```bash
# Install mkcert
brew install mkcert
mkcert -install

# Generate certificates
mkdir certs
cd certs
mkcert localhost
```

### 2. Ngrok Configuration
1. Install ngrok:
```bash
npm install -g ngrok
```

2. Set up authentication:
```bash
# Add your authtoken
ngrok authtoken your-token-here
```

3. Create ngrok.yml:
```yaml
version: "2"
authtoken: your-token-here
tunnels:
  app:
    addr: 8080
    proto: http
    hostname: your-subdomain.ngrok.io
```

### 3. Local Development Start
1. Start the backend:
```bash
# Terminal 1
npm run dev:server
```

2. Start the frontend:
```bash
# Terminal 2
npm run dev:client
```

3. Start ngrok tunnel:
```bash
# Terminal 3
ngrok start --config=./ngrok.yml app
```

4. Update `.env`:
```bash
# Copy the ngrok URL and update DEV_API_URL
DEV_API_URL=https://your-ngrok-url.ngrok.io
```

## Frontend Deployment (Vercel)

### 1. Initial Setup
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login
```

### 2. Environment Variables
```bash
# Sync environment variables to Vercel
vercel env pull .env.production
vercel env add REACT_APP_FIREBASE_API_KEY
vercel env add REACT_APP_FIREBASE_AUTH_DOMAIN
# ... repeat for all REACT_APP_ variables
```

### 3. Deployment Configuration
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "REACT_APP_INVITE_ONLY": "true"
  }
}
```

### 4. Deploy
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Backend Deployment (Render)

### 1. Initial Setup
```bash
# Install Render CLI
npm install -g @render/cli

# Login to Render
render login
```

### 2. Environment Variables
1. Navigate to Render Dashboard
2. Select your service
3. Add environment variables from `.env`:
   - FIREBASE_API_KEY
   - SENDGRID_API_KEY
   - DATABASE_URL
   - etc.

### 3. Deploy
```bash
# Deploy to preview
render deploy

# Deploy to production
render deploy --prod
```

## Testing Configuration

### 1. Test Group Setup
```typescript
// Maximum number of test couples: 12
// Test duration: 30 days
const TEST_CONFIG = {
  maxCouples: process.env.MAX_TEST_COUPLES || 12,
  duration: process.env.TEST_DURATION_DAYS || 30,
  inviteOnly: true
};
```

### 2. Local Testing
1. **Environment Check**:
```bash
# Verify environment variables
npm run verify:env

# Test database connection
npm run test:db

# Test Redis connection
npm run test:redis
```

2. **API Testing**:
```bash
# Test endpoints through ngrok
curl -k https://your-ngrok-url.ngrok.io/health

# Run API tests
npm run test:api
```

3. **Frontend Testing**:
```bash
# Run end-to-end tests
npm run test:e2e

# Test PWA features
npm run test:pwa
```

### 3. Deployment Testing
Run the deployment test script:
```bash
npm run test:deployment
```

This script verifies:
- Environment variables
- Frontend deployment
- Backend deployment
- Database connection
- Redis connection
- Firebase configuration

## Monitoring & Maintenance

### 1. Health Checks
- Frontend status: https://sparq-connection.vercel.app/health
- Backend status: https://api.sparqconnection.com/health
- Database connection
- Redis status

### 2. Test Group Monitoring
```typescript
// Monitor test group progress
const monitorTestGroup = async () => {
  const stats = await getTestGroupStats();
  console.log(`
    Active Couples: ${stats.activeCouples}
    Average Engagement: ${stats.avgEngagement}%
    Completion Rate: ${stats.completionRate}%
  `);
};
```

### 3. Performance Metrics
- Response times
- Error rates
- User engagement
- Sync success rate

## Security Measures

### 1. Access Control
- Invite-only access
- Rate limiting
- CORS configuration
- JWT authentication

### 2. Data Protection
- Environment variable encryption
- Secure data transmission
- Regular security audits

## Rollback Procedures

### 1. Frontend Rollback
```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback
```

### 2. Backend Rollback
```bash
# List deployments
render rollback list

# Rollback to specific deployment
render rollback [deployment-id]
```

## Troubleshooting

### Common Issues
1. **Environment Variables**
   - Check variable presence in `.env`
   - Verify Vercel environment variables
   - Validate Render environment variables

2. **Local Development**
   - Check SSL certificate validity
   - Verify ngrok tunnel status
   - Confirm environment variable mapping
   - Test CORS configuration

3. **Deployment Failures**
   - Check build logs
   - Verify dependencies
   - Check environment configuration

4. **Testing Group Issues**
   - Monitor couple count
   - Check invitation system
   - Verify data synchronization

## Best Practices

1. **Environment Management**
   - Keep `.env.template` updated
   - Document all variables
   - Use secure values
   - Regular rotation of secrets

2. **Local Development**
   - Use HTTPS for local testing
   - Keep ngrok configuration updated
   - Monitor API rate limits
   - Test with production-like data

3. **Deployment Process**
   - Test in staging first
   - Verify all environment variables
   - Check security configurations
   - Monitor deployment metrics

4. **Testing Group Management**
   - Regular progress monitoring
   - Feedback collection
   - Performance optimization
   - Security audits 