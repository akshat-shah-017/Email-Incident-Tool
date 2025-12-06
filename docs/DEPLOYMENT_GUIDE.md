# Deployment Guide

Complete guide for deploying the Email Incident Tool to various platforms.

## Table of Contents

1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Render Deployment](#render)
4. [Railway Deployment](#railway)
5. [Vercel Deployment](#vercel)
6. [Manual VPS Deployment](#manual-vps)

---

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/email-incident-tool.git
   cd email-incident-tool
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your credentials:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/email_incidents"
   OPENROUTER_API_KEY="your-key"
   GEMINI_API_KEY="your-key"
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Set up database**
   ```bash
   npx prisma migrate dev
   npx prisma db seed  # Optional: adds sample data
   ```

5. **Start backend server**
   ```bash
   npm run dev
   ```

6. **Install frontend dependencies (new terminal)**
   ```bash
   cd frontend
   npm install
   ```

7. **Start frontend server**
   ```bash
   npm run dev
   ```

8. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

---

## Docker Deployment

### Using Docker Compose

1. **Build and start all services**
   ```bash
   # Copy environment file
   cp .env.example .env
   
   # Edit .env with your API keys
   
   # Start all services
   docker-compose up -d
   ```

2. **Run database migrations**
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000
   - Adminer (DB UI): http://localhost:8080

### Building Individual Images

```bash
# Backend
cd backend
docker build -t email-incident-backend .

# Frontend
cd frontend
docker build -t email-incident-frontend --build-arg VITE_API_URL=http://api.example.com .
```

---

## Render

### Backend Deployment

1. **Create a new Web Service** on Render Dashboard

2. **Connect your GitHub repository**

3. **Configure the service:**
   - **Name**: `email-incident-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`

4. **Add environment variables:**
   ```
   DATABASE_URL=<your-neon-or-render-postgres-url>
   OPENROUTER_API_KEY=<your-key>
   GEMINI_API_KEY=<your-key>
   NODE_ENV=production
   CORS_ORIGIN=https://your-frontend.onrender.com
   ```

5. **Create PostgreSQL database** on Render (or use Neon/Supabase)

6. **Deploy and run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

### Frontend Deployment

1. **Create a new Static Site** on Render

2. **Configure:**
   - **Name**: `email-incident-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. **Add environment variable:**
   ```
   VITE_API_URL=https://email-incident-backend.onrender.com/api
   ```

---

## Railway

### One-Click Deploy

1. **Click "New Project" in Railway**

2. **Deploy from GitHub repo**

3. **Add PostgreSQL service**

4. **Configure backend service:**
   - **Root Directory**: `backend`
   - **Start Command**: `npm run start`
   
5. **Add variables:**
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   OPENROUTER_API_KEY=<your-key>
   PORT=5000
   ```

6. **Configure frontend service:**
   - **Root Directory**: `frontend`
   
7. **Add variable:**
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```

### Railway CLI Deployment

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy backend
cd backend
railway up

# Deploy frontend
cd ../frontend
railway up
```

---

## Vercel

### Frontend Deployment (Recommended)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy frontend**
   ```bash
   cd frontend
   vercel
   ```

3. **Configure environment:**
   ```bash
   vercel env add VITE_API_URL
   # Enter: https://your-backend-url.com/api
   ```

### Backend on Vercel (Serverless)

> ⚠️ Note: Vercel is optimized for serverless. For full Express support, use Render or Railway.

1. **Create `vercel.json` in backend:**
   ```json
   {
     "builds": [
       {
         "src": "dist/server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "dist/server.js"
       }
     ]
   }
   ```

2. **Deploy:**
   ```bash
   cd backend
   npm run build
   vercel
   ```

---

## Manual VPS Deployment

### Prerequisites

- Ubuntu 22.04 LTS
- SSH access
- Domain name (optional)

### Setup Steps

1. **Connect to your server**
   ```bash
   ssh user@your-server-ip
   ```

2. **Install dependencies**
   ```bash
   # Update packages
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PostgreSQL
   sudo apt install -y postgresql postgresql-contrib
   
   # Install Nginx
   sudo apt install -y nginx
   
   # Install PM2
   sudo npm install -g pm2
   ```

3. **Configure PostgreSQL**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE email_incidents;
   CREATE USER appuser WITH PASSWORD 'your-password';
   GRANT ALL PRIVILEGES ON DATABASE email_incidents TO appuser;
   \q
   ```

4. **Clone and setup application**
   ```bash
   git clone https://github.com/yourusername/email-incident-tool.git
   cd email-incident-tool
   
   # Setup backend
   cd backend
   npm install
   cp ../.env.example .env
   # Edit .env with your credentials
   npx prisma migrate deploy
   npm run build
   
   # Setup frontend
   cd ../frontend
   npm install
   npm run build
   ```

5. **Configure PM2 for backend**
   ```bash
   cd backend
   pm2 start dist/server.js --name "email-incident-backend"
   pm2 save
   pm2 startup
   ```

6. **Configure Nginx**
   ```nginx
   # /etc/nginx/sites-available/email-incident
   
   server {
       listen 80;
       server_name your-domain.com;
   
       # Frontend
       location / {
           root /path/to/email-incident-tool/frontend/dist;
           try_files $uri $uri/ /index.html;
       }
   
       # Backend API
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **Enable site and restart Nginx**
   ```bash
   sudo ln -s /etc/nginx/sites-available/email-incident /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

8. **Setup SSL with Certbot (optional)**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `OPENROUTER_API_KEY` | No | OpenRouter API key for AI | `sk-or-...` |
| `GEMINI_API_KEY` | No | Google Gemini API key | `AIza...` |
| `PORT` | No | Backend port (default: 5000) | `5000` |
| `NODE_ENV` | No | Environment mode | `production` |
| `CORS_ORIGIN` | No | Allowed CORS origin | `https://your-frontend.com` |
| `VITE_API_URL` | Yes (frontend) | Backend API URL | `https://api.example.com` |

---

## Health Checks

After deployment, verify everything is working:

```bash
# Backend health
curl https://your-backend-url.com/api/health

# Expected response:
# {"status":"success","data":{"status":"healthy",...}}
```

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check if PostgreSQL is running
- Ensure network/firewall allows connection

### AI Summarization Not Working
- Verify API keys are set correctly
- Check API key quotas/limits
- Review backend logs for errors

### CORS Errors
- Ensure `CORS_ORIGIN` matches frontend URL exactly
- Include protocol (https://)

### File Upload Failures
- Check `uploads/` directory permissions
- Verify file size limits
