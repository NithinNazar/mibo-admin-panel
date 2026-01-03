# Mibo Mental Health - Deployment Guide

## Overview

This guide covers deploying the Mibo Mental Health platform for client testing:

- **Frontend** (Patient Portal) - React/Vite application
- **Backend** (API Server) - Node.js/Express/TypeScript
- **Database** - PostgreSQL

**Admin Panel**: Can be deployed later (not required for patient flow)

---

## Quick Deployment Options

### Option 1: Vercel + Render + Supabase (Recommended - Free Tier Available)

- **Frontend**: Vercel (Free)
- **Backend**: Render (Free tier)
- **Database**: Supabase (Free tier with 500MB)

### Option 2: Netlify + Railway + Railway DB

- **Frontend**: Netlify (Free)
- **Backend**: Railway (Free $5 credit)
- **Database**: Railway PostgreSQL (Free $5 credit)

### Option 3: AWS (Production-Ready)

- **Frontend**: AWS Amplify or S3 + CloudFront
- **Backend**: AWS Elastic Beanstalk or EC2
- **Database**: AWS RDS PostgreSQL

---

## Pre-Deployment Checklist

### 1. Environment Variables

Ensure you have:

- ✅ Gallabox API credentials (WhatsApp OTP)
- ✅ Razorpay API keys (Payment)
- ✅ Google Service Account (Optional - for Meet links)
- ✅ Database connection string
- ✅ JWT secrets

### 2. Code Preparation

- ✅ Remove hardcoded localhost URLs
- ✅ Update CORS origins
- ✅ Set production environment variables
- ✅ Build and test locally

---

## Deployment Steps

## 🎨 FRONTEND DEPLOYMENT (Vercel)

### Step 1: Prepare Frontend for Production

1. **Update API Base URL**

Create `mibo_version-2/.env.production`:

```env
VITE_API_URL=https://your-backend-url.onrender.com
```

2. **Update API Client**

File: `mibo_version-2/src/services/api.ts`

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  // ... rest of config
});
```

3. **Build Frontend Locally (Test)**

```bash
cd mibo_version-2
npm run build
```

### Step 2: Deploy to Vercel

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd mibo_version-2
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? mibo-patient-portal
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

**Option B: Using Vercel Dashboard**

1. Go to https://vercel.com
2. Sign up/Login with GitHub
3. Click "Add New Project"
4. Import your Git repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `mibo_version-2`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add Environment Variables:
   - `VITE_API_URL`: (Your backend URL - add after backend deployment)
7. Click "Deploy"

### Step 3: Configure Custom Domain (Optional)

1. In Vercel Dashboard → Settings → Domains
2. Add your domain (e.g., `app.mibo.com`)
3. Update DNS records as instructed

---

## 🔧 BACKEND DEPLOYMENT (Render)

### Step 1: Prepare Backend for Production

1. **Update Environment Variables**

Create `backend/.env.production`:

```env
NODE_ENV=production
PORT=5000

# Database (Will be provided by hosting service)
DATABASE_URL=postgresql://user:password@host:5432/database

# JWT Secrets (Generate new ones for production)
JWT_ACCESS_SECRET=your-production-access-secret-min-32-chars
JWT_REFRESH_SECRET=your-production-refresh-secret-min-32-chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# OTP
OTP_EXPIRY_MINUTES=10

# CORS (Your frontend URL)
CORS_ORIGIN=https://your-frontend-url.vercel.app

# Gallabox (WhatsApp OTP)
GALLABOX_API_KEY=your-gallabox-api-key
GALLABOX_API_SECRET=your-gallabox-api-secret
GALLABOX_PHONE_NUMBER_ID=your-phone-number-id

# Razorpay (Payment)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Google Meet (Optional)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
```

2. **Update CORS Configuration**

File: `backend/src/config/env.ts`

```typescript
CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
```

3. **Add Build Script**

File: `backend/package.json`

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts"
  }
}
```

4. **Test Build Locally**

```bash
cd backend
npm run build
node dist/index.js
```

### Step 2: Deploy to Render

1. **Go to https://render.com**
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your Git repository
5. Configure:

   - **Name**: `mibo-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (for testing) or Starter ($7/month)

6. **Add Environment Variables** (Click "Advanced" → "Add Environment Variable"):

   - Copy all variables from `.env.production`
   - DATABASE_URL will be added after database setup

7. Click "Create Web Service"

### Step 3: Note Your Backend URL

After deployment, Render will provide a URL like:
`https://mibo-backend.onrender.com`

---

## 🗄️ DATABASE DEPLOYMENT (Supabase)

### Option A: Supabase (Recommended for Free Tier)

1. **Go to https://supabase.com**
2. Sign up/Login
3. Click "New Project"
4. Configure:

   - **Name**: `mibo-production`
   - **Database Password**: (Generate strong password)
   - **Region**: Choose closest to your backend
   - **Pricing Plan**: Free (500MB, 2GB bandwidth)

5. **Get Connection String**

   - Go to Project Settings → Database
   - Copy "Connection string" (URI format)
   - Replace `[YOUR-PASSWORD]` with your database password

6. **Run Database Migrations**

```bash
# Install PostgreSQL client locally
# Connect to Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Or use Supabase SQL Editor in dashboard
```

7. **Execute Schema**

Copy and paste the contents of these files in order:

- `backend/POPULATE_DATABASE.sql` (Creates tables and sample data)
- `backend/CREATE_ADMIN.sql` (Creates admin user)

Or run from command line:

```bash
psql "your-connection-string" < backend/POPULATE_DATABASE.sql
psql "your-connection-string" < backend/CREATE_ADMIN.sql
```

8. **Update Backend Environment Variable**
   - Go to Render Dashboard → Your Service → Environment
   - Update `DATABASE_URL` with Supabase connection string
   - Click "Save Changes" (This will redeploy)

### Option B: Render PostgreSQL

1. In Render Dashboard, click "New +" → "PostgreSQL"
2. Configure:

   - **Name**: `mibo-database`
   - **Database**: `mibo_production`
   - **User**: `mibo_user`
   - **Region**: Same as backend
   - **Plan**: Free (1GB storage)

3. Click "Create Database"
4. Copy "Internal Database URL"
5. Update backend environment variable `DATABASE_URL`
6. Run migrations (same as Supabase steps above)

---

## 🔗 CONNECT FRONTEND TO BACKEND

### Step 1: Update Frontend Environment Variable

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add/Update:

   - **Key**: `VITE_API_URL`
   - **Value**: `https://mibo-backend.onrender.com` (your backend URL)
   - **Environment**: Production

3. Redeploy:
   - Go to Deployments tab
   - Click "..." on latest deployment → "Redeploy"

### Step 2: Update Backend CORS

1. Go to Render Dashboard → Your Service → Environment
2. Update:
   - **Key**: `CORS_ORIGIN`
   - **Value**: `https://your-frontend-url.vercel.app`
3. Save (auto-redeploys)

---

## 🧪 TESTING DEPLOYMENT

### 1. Test Frontend

Visit your Vercel URL: `https://your-app.vercel.app`

- ✅ Homepage loads
- ✅ Navigation works
- ✅ Images load correctly

### 2. Test Backend

Visit your Render URL: `https://your-backend.onrender.com/api/health`

- ✅ Should return: `{"status": "ok", "timestamp": "..."}`

### 3. Test Database Connection

```bash
curl https://your-backend.onrender.com/api/health
# Should show database: connected
```

### 4. Test Complete Flow

1. ✅ Sign in with phone number
2. ✅ Receive OTP via WhatsApp
3. ✅ Verify OTP and login
4. ✅ Browse experts
5. ✅ Book appointment
6. ✅ Make payment (test mode)
7. ✅ View dashboard

---

## 📱 PRODUCTION CHECKLIST

### Security

- [ ] Use HTTPS for all connections
- [ ] Set strong JWT secrets (min 32 characters)
- [ ] Enable rate limiting
- [ ] Set secure CORS origins
- [ ] Use environment variables (never commit secrets)
- [ ] Enable database SSL connection

### Performance

- [ ] Enable CDN for frontend assets
- [ ] Set up database connection pooling
- [ ] Add Redis for session management (optional)
- [ ] Enable gzip compression
- [ ] Set up monitoring (Sentry, LogRocket)

### Monitoring

- [ ] Set up error tracking (Sentry)
- [ ] Enable application logs
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Configure alerts for errors

### Backup

- [ ] Enable automatic database backups
- [ ] Export environment variables
- [ ] Document deployment process
- [ ] Keep local backup of database

---

## 🚨 TROUBLESHOOTING

### Frontend Issues

**Problem**: API calls failing

- Check `VITE_API_URL` environment variable
- Verify backend is running
- Check browser console for CORS errors

**Problem**: Build fails

- Run `npm run build` locally first
- Check for TypeScript errors
- Verify all dependencies are in `package.json`

### Backend Issues

**Problem**: Database connection fails

- Verify `DATABASE_URL` is correct
- Check database is running
- Ensure IP whitelist includes Render IPs (if using IP restrictions)

**Problem**: OTP not sending

- Verify Gallabox credentials
- Check Gallabox API logs
- Ensure phone number format is correct (91XXXXXXXXXX)

**Problem**: Payment fails

- Verify Razorpay keys (test vs live)
- Check Razorpay dashboard for errors
- Ensure webhook URL is configured

### Database Issues

**Problem**: Tables not created

- Run SQL scripts manually
- Check for syntax errors
- Verify user has CREATE permissions

**Problem**: Connection timeout

- Check database is running
- Verify connection string
- Ensure SSL is enabled if required

---

## 💰 COST ESTIMATE

### Free Tier (Testing)

- **Frontend** (Vercel): Free
- **Backend** (Render): Free (sleeps after 15 min inactivity)
- **Database** (Supabase): Free (500MB)
- **Total**: $0/month

**Limitations**:

- Backend sleeps after inactivity (30s cold start)
- 500MB database storage
- Limited bandwidth

### Starter Tier (Production)

- **Frontend** (Vercel): Free
- **Backend** (Render Starter): $7/month
- **Database** (Supabase Pro): $25/month OR Render PostgreSQL: $7/month
- **Total**: $14-32/month

**Benefits**:

- No cold starts
- 8GB database storage
- Better performance
- More bandwidth

### Recommended for Launch

- **Frontend** (Vercel Pro): $20/month
- **Backend** (Render Standard): $25/month
- **Database** (Supabase Pro): $25/month
- **Total**: $70/month

---

## 📞 SUPPORT CONTACTS

### Hosting Platforms

- **Vercel**: https://vercel.com/support
- **Render**: https://render.com/docs
- **Supabase**: https://supabase.com/docs

### Services

- **Gallabox**: https://gallabox.com/support
- **Razorpay**: https://razorpay.com/support
- **Google Cloud**: https://cloud.google.com/support

---

## 🎯 QUICK START COMMANDS

### Deploy Everything (After setup)

```bash
# 1. Deploy Frontend
cd mibo_version-2
vercel --prod

# 2. Deploy Backend (auto-deploys on git push)
git add .
git commit -m "Production deployment"
git push origin main

# 3. Database is already running on Supabase
```

### Update Environment Variables

```bash
# Frontend (Vercel)
vercel env add VITE_API_URL production

# Backend (Render)
# Use Render Dashboard → Environment tab
```

---

## 📝 POST-DEPLOYMENT

### 1. Share with Clients

- Frontend URL: `https://your-app.vercel.app`
- Test credentials: Phone `9048810697`
- Test payment: Use Razorpay test cards

### 2. Monitor

- Check Vercel Analytics
- Monitor Render logs
- Review Supabase metrics

### 3. Collect Feedback

- Set up feedback form
- Monitor error logs
- Track user behavior

---

## 🔄 UPDATES & MAINTENANCE

### Deploy Updates

**Frontend**:

```bash
git push origin main
# Vercel auto-deploys
```

**Backend**:

```bash
git push origin main
# Render auto-deploys
```

### Database Migrations

```bash
# Connect to production database
psql "your-production-connection-string"

# Run migration
\i path/to/migration.sql
```

---

## ✅ DEPLOYMENT COMPLETE!

Your Mibo Mental Health platform is now live and ready for client testing!

**URLs**:

- Patient Portal: `https://your-app.vercel.app`
- Backend API: `https://your-backend.onrender.com`
- Database: Managed by Supabase/Render

**Next Steps**:

1. Test complete booking flow
2. Share with clients
3. Collect feedback
4. Deploy admin panel (when ready)
5. Scale as needed

---

**Need Help?** Check troubleshooting section or contact support.
