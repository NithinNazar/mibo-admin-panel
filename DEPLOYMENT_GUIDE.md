# Mibo Care Admin Panel - Deployment Guide

## 🎯 Overview

Your Mibo Care system has **3 main components**:

1. **Admin Panel UI** (this project) - React frontend
2. **Backend API** - Express + TypeScript
3. **PostgreSQL Database** - Cloud database

## 📦 What You Need to Deploy

### 1. Database (PostgreSQL)

- Cloud PostgreSQL instance
- Initial schema and tables
- **Seed data with first admin user**

### 2. Backend API (Express)

- Node.js server
- Connects to database
- Provides REST API endpoints

### 3. Admin Panel UI (React)

- Static files (HTML, CSS, JS)
- Hosted on CDN/Static hosting
- Connects to Backend API

---

## 🚀 Deployment Steps

### Step 1: Set Up Cloud Database

#### Option A: AWS RDS PostgreSQL

```bash
# Create RDS instance
- Engine: PostgreSQL 15+
- Instance: db.t3.micro (free tier) or larger
- Storage: 20GB minimum
- Public access: Yes (for initial setup)
- Security group: Allow port 5432 from your IP
```

#### Option B: Supabase (Recommended for Quick Start)

```bash
1. Go to supabase.com
2. Create new project
3. Get connection string
4. Use built-in SQL editor
```

#### Option C: Railway/Render

```bash
# Both offer free PostgreSQL hosting
1. Create account
2. Create PostgreSQL database
3. Get connection string
```

**Connection String Format:**

```
postgresql://username:password@host:5432/database_name
```

---

### Step 2: Initialize Database Schema

#### A. Create Tables (Run these SQL scripts)

**1. Create Roles Table First:**

```sql
CREATE TABLE roles (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
('ADMIN', 'Full system access'),
('MANAGER', 'Multi-centre manager'),
('CENTRE_MANAGER', 'Single centre manager'),
('CLINICIAN', 'Doctor/Therapist'),
('CARE_COORDINATOR', 'Patient flow coordinator'),
('FRONT_DESK', 'Reception staff');
```

**2. Create Users Table:**

```sql
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  phone VARCHAR(20),
  email VARCHAR(255),
  username VARCHAR(50) UNIQUE,
  password_hash TEXT,
  full_name VARCHAR(150) NOT NULL,
  user_type VARCHAR(20) CHECK (user_type IN ('PATIENT', 'STAFF')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_type ON users(user_type);
```

**3. Create User Roles Junction Table:**

```sql
CREATE TABLE user_roles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  role_id BIGINT REFERENCES roles(id) ON DELETE CASCADE,
  centre_id BIGINT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);
```

**4. Create Centres Table:**

```sql
CREATE TABLE centres (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  city VARCHAR(100) CHECK (city IN ('bangalore', 'kochi', 'mumbai')),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  pincode VARCHAR(20),
  contact_phone VARCHAR(20),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**5. Create Other Tables:**

```sql
-- Patient profiles
CREATE TABLE patient_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE REFERENCES users(id),
  date_of_birth DATE,
  gender VARCHAR(20),
  blood_group VARCHAR(10),
  emergency_contact_name VARCHAR(150),
  emergency_contact_phone VARCHAR(20),
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clinician profiles
CREATE TABLE clinician_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT UNIQUE REFERENCES users(id),
  primary_centre_id BIGINT REFERENCES centres(id),
  specialization VARCHAR(150),
  registration_number VARCHAR(100),
  years_of_experience INTEGER,
  consultation_fee NUMERIC(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments
CREATE TABLE appointments (
  id BIGSERIAL PRIMARY KEY,
  patient_id BIGINT REFERENCES patient_profiles(id),
  clinician_id BIGINT REFERENCES clinician_profiles(id),
  centre_id BIGINT REFERENCES centres(id),
  appointment_type VARCHAR(30) CHECK (appointment_type IN ('IN_PERSON', 'ONLINE', 'INPATIENT_ASSESSMENT', 'FOLLOW_UP')),
  scheduled_start_at TIMESTAMPTZ NOT NULL,
  scheduled_end_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) CHECK (status IN ('BOOKED', 'CONFIRMED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Step 3: Create Initial Admin User

**IMPORTANT: You MUST create at least one admin user to access the system!**

#### Method 1: Using bcrypt hash (Recommended)

**Generate password hash:**

```javascript
// Run this in Node.js
const bcrypt = require("bcrypt");
const password = "YourSecurePassword123!";
bcrypt.hash(password, 10, (err, hash) => {
  console.log(hash);
});
```

**Insert admin user:**

```sql
-- 1. Create admin user
INSERT INTO users (
  phone,
  email,
  username,
  password_hash,
  full_name,
  user_type,
  is_active
) VALUES (
  '9876543210',                    -- Admin phone
  'admin@mibocare.com',            -- Admin email
  'admin',                         -- Admin username
  '$2b$10$...',                    -- Replace with bcrypt hash from above
  'System Administrator',          -- Admin name
  'STAFF',                         -- Must be STAFF
  true
) RETURNING id;

-- 2. Assign ADMIN role (use the id from above)
INSERT INTO user_roles (user_id, role_id, is_active)
VALUES (
  1,  -- Replace with user id from above
  (SELECT id FROM roles WHERE name = 'ADMIN'),
  true
);
```

#### Method 2: Quick Test Admin (Less Secure)

```sql
-- Create test admin with simple password
-- Password: admin123
INSERT INTO users (phone, email, username, password_hash, full_name, user_type, is_active)
VALUES (
  '1234567890',
  'admin@test.com',
  'admin',
  '$2b$10$rBV2kHf7Gg3rO7oDdDdDdOqKqKqKqKqKqKqKqKqKqKqKqKqKqKq',  -- admin123
  'Test Admin',
  'STAFF',
  true
) RETURNING id;

-- Assign admin role
INSERT INTO user_roles (user_id, role_id, is_active)
VALUES (
  (SELECT id FROM users WHERE username = 'admin'),
  (SELECT id FROM roles WHERE name = 'ADMIN'),
  true
);
```

**Your first admin credentials will be:**

```
Username: admin
Password: admin123 (or whatever you set)

OR

Phone: 1234567890
Password: admin123
```

---

### Step 4: Deploy Backend API

#### Option A: Railway

```bash
1. Push backend code to GitHub
2. Go to railway.app
3. Create new project from GitHub repo
4. Add PostgreSQL database (or connect existing)
5. Set environment variables:
   - DATABASE_URL=postgresql://...
   - JWT_ACCESS_SECRET=your-secret-key
   - JWT_REFRESH_SECRET=your-refresh-key
   - PORT=5000
6. Deploy
7. Get API URL: https://your-app.railway.app
```

#### Option B: Render

```bash
1. Push backend to GitHub
2. Go to render.com
3. Create new Web Service
4. Connect GitHub repo
5. Set environment variables
6. Deploy
7. Get API URL: https://your-app.onrender.com
```

#### Option C: AWS EC2

```bash
1. Launch EC2 instance (Ubuntu)
2. Install Node.js
3. Clone backend repo
4. Install dependencies: npm install
5. Set environment variables
6. Use PM2 to run: pm2 start server.js
7. Configure nginx as reverse proxy
8. Get API URL: http://your-ec2-ip:5000
```

**Backend Environment Variables:**

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_ACCESS_SECRET=your-very-long-random-secret-key-here
JWT_REFRESH_SECRET=another-very-long-random-secret-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://admin.mibocare.com
```

---

### Step 5: Deploy Admin Panel UI

#### Build the Frontend

```bash
# In this project directory
npm run build

# This creates a 'dist' folder with static files
```

#### Option A: Vercel (Recommended - Easiest)

```bash
1. Push this project to GitHub
2. Go to vercel.com
3. Import GitHub repository
4. Framework: Vite
5. Build command: npm run build
6. Output directory: dist
7. Add environment variable:
   VITE_API_BASE_URL=https://your-backend-api.com/api
8. Deploy
9. Get URL: https://your-app.vercel.app
```

#### Option B: Netlify

```bash
1. Push to GitHub
2. Go to netlify.com
3. New site from Git
4. Build command: npm run build
5. Publish directory: dist
6. Environment variables:
   VITE_API_BASE_URL=https://your-backend-api.com/api
7. Deploy
8. Get URL: https://your-app.netlify.app
```

#### Option C: AWS S3 + CloudFront

```bash
1. Build: npm run build
2. Create S3 bucket
3. Enable static website hosting
4. Upload dist/ contents to S3
5. Create CloudFront distribution
6. Point to S3 bucket
7. Get URL: https://d123456.cloudfront.net
```

---

## 🔧 Configuration

### Frontend Environment Variables

Create `.env.production`:

```env
VITE_API_BASE_URL=https://your-backend-api.com/api
```

### Update API URL in Code

If not using environment variables, update `src/services/api.ts`:

```typescript
const API_BASE_URL = "https://your-backend-api.com/api";
```

---

## ✅ Post-Deployment Checklist

### 1. Test Database Connection

```bash
# Connect to your cloud database
psql "postgresql://user:pass@host:5432/db"

# Check tables exist
\dt

# Check admin user exists
SELECT * FROM users WHERE user_type = 'STAFF';
```

### 2. Test Backend API

```bash
# Test health endpoint
curl https://your-backend-api.com/health

# Test login
curl -X POST https://your-backend-api.com/api/auth/login/username-password \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### 3. Test Frontend

```bash
1. Open https://your-admin-panel.com
2. Should redirect to /login
3. Login with admin credentials
4. Should see dashboard
```

---

## 🔐 Security Best Practices

### 1. Change Default Admin Password

```sql
-- After first login, update password
UPDATE users
SET password_hash = '$2b$10$NewHashHere'
WHERE username = 'admin';
```

### 2. Use Strong Secrets

```bash
# Generate strong JWT secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Enable HTTPS

- Use SSL certificates (Let's Encrypt)
- Force HTTPS redirects
- Set secure cookie flags

### 4. Database Security

- Use strong passwords
- Enable SSL connections
- Restrict IP access
- Regular backups

### 5. Environment Variables

- Never commit secrets to Git
- Use platform secret management
- Rotate secrets regularly

---

## 📊 Complete Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USERS                                 │
│              (Admins, Doctors, Staff)                    │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│           ADMIN PANEL UI (React)                         │
│         https://admin.mibocare.com                       │
│                                                          │
│  Hosted on: Vercel / Netlify / S3+CloudFront           │
│  Built from: This project (npm run build)               │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTPS API Calls
                     ↓
┌─────────────────────────────────────────────────────────┐
│         BACKEND API (Express + TypeScript)               │
│         https://api.mibocare.com                         │
│                                                          │
│  Hosted on: Railway / Render / AWS EC2                  │
│  Endpoints: /api/auth, /api/users, /api/appointments    │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ PostgreSQL Connection
                     ↓
┌─────────────────────────────────────────────────────────┐
│         POSTGRESQL DATABASE                              │
│         postgresql://host:5432/mibo_db                   │
│                                                          │
│  Hosted on: AWS RDS / Supabase / Railway                │
│  Contains: Users, Roles, Centres, Appointments, etc.    │
│  Initial Admin: Created via SQL script                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Quick Start Summary

**YES, you need an admin account from the start!**

### Minimum Steps to Deploy:

1. **Create Cloud Database** (Supabase/Railway - 5 min)
2. **Run SQL Scripts** to create tables (5 min)
3. **Insert Admin User** via SQL (2 min)
4. **Deploy Backend** to Railway/Render (10 min)
5. **Deploy Frontend** to Vercel/Netlify (5 min)
6. **Login** with admin credentials ✅

**Total Time: ~30 minutes**

---

## 🆘 Troubleshooting

### Can't Login

- Check backend is running
- Check database connection
- Verify admin user exists in database
- Check password hash is correct
- Check CORS settings allow frontend domain

### White Screen

- Check browser console for errors
- Verify API_BASE_URL is correct
- Check backend API is accessible
- Verify authentication is enabled

### Database Connection Failed

- Check connection string format
- Verify database is running
- Check firewall/security group rules
- Test connection with psql

---

## 📝 Sample Seed Script

Create `seed-admin.sql`:

```sql
-- Seed script for initial admin user
-- Run this ONCE after creating tables

-- Insert admin user
INSERT INTO users (phone, email, username, password_hash, full_name, user_type, is_active)
VALUES (
  '9876543210',
  'admin@mibocare.com',
  'admin',
  '$2b$10$rBV2kHf7Gg3rO7oDdDdDdOqKqKqKqKqKqKqKqKqKqKqKqKqKqKq',
  'System Administrator',
  'STAFF',
  true
);

-- Assign ADMIN role
INSERT INTO user_roles (user_id, role_id, is_active)
SELECT
  u.id,
  r.id,
  true
FROM users u
CROSS JOIN roles r
WHERE u.username = 'admin'
  AND r.name = 'ADMIN';

-- Verify
SELECT
  u.username,
  u.full_name,
  r.name as role
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.username = 'admin';
```

Run it:

```bash
psql "your-connection-string" -f seed-admin.sql
```

---

## ✨ You're Ready!

After following these steps, you'll have:

- ✅ Cloud PostgreSQL database with tables
- ✅ Initial admin user created
- ✅ Backend API deployed and running
- ✅ Admin Panel UI deployed and accessible
- ✅ Ability to login and manage your hospital system

**First Login:**

```
URL: https://your-admin-panel.com/login
Username: admin
Password: admin123 (or whatever you set)
```

**Remember to change the default password after first login!**
