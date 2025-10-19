# Production Deployment Guide
## Synchronicity Engine - Complete Production Setup

---

## 🚀 Quick Start Deployment

### Option 1: Deploy to Railway (Recommended)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create new project
railway init

# Add services
railway add --database postgres
railway add --database redis

# Set environment variables
railway variables set SUBSTACK_URL=https://yoursubstack.substack.com
railway variables set WEBHOOK_SECRET=$(openssl rand -hex 32)
railway variables set NODE_ENV=production

# Deploy backend
cd backend
railway up

# Deploy frontend
cd ../frontend
railway up

# Your app is live! 🎉
```

### Option 2: Deploy to Heroku

```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login
heroku login

# Create app
heroku create syncengine-api

# Add addons
heroku addons:create heroku-postgresql:mini
heroku addons:create heroku-redis:mini

# Set config
heroku config:set SUBSTACK_URL=https://yoursubstack.substack.com
heroku config:set NODE_ENV=production
heroku config:set WEBHOOK_SECRET=$(openssl rand -hex 32)

# Deploy
git push heroku main

# Scale workers
heroku ps:scale web=1 worker=1
```

### Option 3: Deploy to AWS (Advanced)

See detailed AWS deployment script below.

---

## 📦 Complete Deployment Package

### Backend Package Structure

```
backend/
├── src/
│   ├── server.js              # Main server file
│   ├── SubstackSyncEngine.js  # RSS parser
│   ├── config/
│   │   ├── database.js        # DB configuration
│   │   └── redis.js           # Redis configuration
│   ├── models/
│   │   ├── Article.js         # Article model
│   │   └── Analytics.js       # Analytics model
│   ├── routes/
│   │   ├── articles.js        # Article routes
│   │   ├── analytics.js       # Analytics routes
│   │   └── webhooks.js        # Webhook routes
│   ├── middleware/
│   │   ├── auth.js            # Authentication
│   │   ├── cache.js           # Caching middleware
│   │   └── errorHandler.js    # Error handling
│   └── utils/
│       ├── imageOptimizer.js  # Image optimization
│       └── scheduler.js       # Cron jobs
├── tests/
│   ├── articles.test.js
│   └── sync.test.js
├── package.json
├── Dockerfile
└── .env.example
```

### package.json for Backend

```json
{
  "name": "synchronicity-engine-api",
  "version": "1.0.0",
  "description": "Substack RSS sync engine with hashtag categorization",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest",
    "migrate": "sequelize-cli db:migrate",
    "seed": "sequelize-cli db:seed:all",
    "lint": "eslint src/",
    "format": "prettier --write 'src/**/*.js'"
  },
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.6.0",
    "rss-parser": "^3.13.0",
    "cheerio": "^1.0.0-rc.12",
    "node-cron": "^3.0.3",
    "sequelize": "^6.35.0",
    "pg": "^8.11.0",
    "pg-hstore": "^2.3.4",
    "redis": "^4.6.0",
    "sharp": "^0.33.0",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "compression": "^1.7.4",
    "dotenv": "^16.3.1",
    "joi": "^17.11.0",
    "winston": "^3.11.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "eslint": "^8.54.0",
    "prettier": "^3.1.0"
  }
}
```

---

## 🔐 Security Configuration

### 1. Environment Variables (Production)

```bash
# Create production .env file
cat > .env.production << EOF
# Core Configuration
NODE_ENV=production
PORT=3000

# Database (use connection pooling)
DATABASE_URL=postgresql://user:pass@host:5432/db?ssl=true&max=20&idle_timeout=30000

# Redis
REDIS_URL=rediss://default:password@host:6379?tls=true

# Substack
SUBSTACK_URL=https://yoursubstack.substack.com

# Security
WEBHOOK_SECRET=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -hex 32)
SESSION_SECRET=$(openssl rand -hex 32)

# CORS
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100

# Image Optimization
CLOUDINARY_URL=cloudinary://key:secret@cloud
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_PRESET=your_preset

# Monitoring
SENTRY_DSN=https://your-sentry-dsn
LOG_LEVEL=info

# Sync Configuration
SYNC_SCHEDULE=0 * * * *
MAX_ARTICLES_PER_SYNC=50
EOF
```

### 2. Security Middleware

```javascript
// src/middleware/security.js
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX),
  message: 'Too many requests from this IP'
});

// Security headers
const securityMiddleware = [
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"]
      }
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }),
  limiter
];

module.exports = securityMiddleware;
```

---

## 📊 Monitoring & Logging

### 1. Winston Logger Configuration

```javascript
// src/utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format