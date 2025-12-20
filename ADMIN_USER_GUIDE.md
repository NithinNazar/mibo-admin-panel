# Admin User Management Guide

## How to Check if Admin User Exists

### Step 1: Connect to Your Database

You need to connect to your PostgreSQL database. Choose one of these methods:

#### Option A: Using psql Command Line

```bash
# Replace with your actual connection details
psql "postgresql://username:password@host:5432/database_name"

# Or if you have environment variables set
psql $DATABASE_URL
```

#### Option B: Using Supabase SQL Editor

1. Go to your Supabase project
2. Click on "SQL Editor" in the left sidebar
3. Create a new query
4. Paste the SQL queries below

#### Option C: Using Railway Dashboard

1. Go to your Railway project
2. Click on your PostgreSQL database
3. Click "Query" tab
4. Run the SQL queries below

#### Option D: Using pgAdmin or DBeaver

1. Open your database client
2. Connect to your database
3. Open a new SQL query window
4. Run the queries below

---

## Step 2: Run These SQL Queries

### Query 1: Check if Admin Users Exist

```sql
-- This will show all admin users with their credentials
SELECT
  u.id,
  u.username,
  u.phone,
  u.email,
  u.full_name,
  u.user_type,
  u.is_active,
  r.name as role_name,
  u.created_at
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.user_type = 'STAFF'
  AND r.name = 'ADMIN'
  AND u.is_active = true
ORDER BY u.created_at;
```

**What you'll see:**

- If admin exists: You'll see rows with username, phone, email, and full name
- If no admin exists: Empty result (0 rows)

**Example Output:**

```
 id |  username  |    phone     |        email        |      full_name       | user_type | is_active | role_name |      created_at
----+------------+--------------+---------------------+----------------------+-----------+-----------+-----------+---------------------
  1 | admin      | 1234567890   | admin@test.com      | Test Admin           | STAFF     | t         | ADMIN     | 2024-01-15 10:30:00
```

### Query 2: Check All Staff Users

```sql
-- This shows all staff users with their roles
SELECT
  u.id,
  u.username,
  u.phone,
  u.email,
  u.full_name,
  r.name as role_name,
  u.is_active
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.user_type = 'STAFF'
ORDER BY r.name, u.full_name;
```

### Query 3: Check if Roles Table is Populated

```sql
-- This verifies that roles exist in the database
SELECT * FROM roles ORDER BY name;
```

**Expected Output:**

```
 id |      name       |           description
----+-----------------+----------------------------------
  1 | ADMIN           | Full system access
  5 | CARE_COORDINATOR| Patient flow coordinator
  4 | CENTRE_MANAGER  | Single centre manager
  3 | CLINICIAN       | Doctor/Therapist
  6 | FRONT_DESK      | Reception staff
  2 | MANAGER         | Multi-centre manager
```

---

## Step 3: Understanding the Results

### If Admin User Exists

You'll see output like this:

```
username: admin
phone: 1234567890
email: admin@test.com
```

**To login, you can use:**

- Username: `admin` + Password: (whatever was set)
- Phone: `1234567890` + Password: (whatever was set)

⚠️ **Important**: The password is hashed in the database, so you **cannot see the actual password**. You can only:

1. Use the password you remember
2. Reset the password (see below)

### If No Admin User Exists

You need to create one! See the "Creating Admin User" section below.

---

## Creating Admin User (If None Exists)

### Method 1: Quick Test Admin (Development)

```sql
-- Create test admin with username: admin, password: admin123
INSERT INTO users (phone, email, username, password_hash, full_name, user_type, is_active)
VALUES (
  '1234567890',
  'admin@test.com',
  'admin',
  '$2b$10$rBV2kHf7Gg3rO7oDdDdDdOqKqKqKqKqKqKqKqKqKqKqKqKqKqKq',
  'Test Admin',
  'STAFF',
  true
) RETURNING id;

-- Assign ADMIN role (use the id returned from above)
INSERT INTO user_roles (user_id, role_id, is_active)
VALUES (
  (SELECT id FROM users WHERE username = 'admin'),
  (SELECT id FROM roles WHERE name = 'ADMIN'),
  true
);
```

**Login Credentials:**

- Username: `admin`
- Password: `admin123`
- Phone: `1234567890`

### Method 2: Secure Production Admin

First, generate a bcrypt hash for your password:

```javascript
// Run this in Node.js (in your backend project)
const bcrypt = require("bcrypt");
const password = "YourSecurePassword123!";
bcrypt.hash(password, 10, (err, hash) => {
  console.log("Your password hash:", hash);
});
```

Then use that hash in SQL:

```sql
-- Replace the password_hash with your generated hash
INSERT INTO users (phone, email, username, password_hash, full_name, user_type, is_active)
VALUES (
  '9876543210',
  'admin@mibocare.com',
  'admin',
  '$2b$10$YOUR_GENERATED_HASH_HERE',  -- Replace this
  'System Administrator',
  'STAFF',
  true
) RETURNING id;

-- Assign ADMIN role
INSERT INTO user_roles (user_id, role_id, is_active)
VALUES (
  (SELECT id FROM users WHERE username = 'admin'),
  (SELECT id FROM roles WHERE name = 'ADMIN'),
  true
);
```

---

## Resetting Admin Password

If you forgot the admin password, you can reset it:

### Step 1: Generate New Password Hash

```javascript
// Run in Node.js
const bcrypt = require("bcrypt");
const newPassword = "NewSecurePassword123!";
bcrypt.hash(newPassword, 10, (err, hash) => {
  console.log("New password hash:", hash);
});
```

### Step 2: Update Password in Database

```sql
-- Update password for admin user
UPDATE users
SET password_hash = '$2b$10$YOUR_NEW_HASH_HERE',  -- Replace with new hash
    updated_at = NOW()
WHERE username = 'admin';
```

### Step 3: Verify Update

```sql
-- Check that password was updated
SELECT username, full_name, updated_at
FROM users
WHERE username = 'admin';
```

---

## Troubleshooting

### Problem: "No admin user found"

**Solution**: Create an admin user using Method 1 or Method 2 above.

### Problem: "Roles table is empty"

**Solution**: Insert default roles first:

```sql
INSERT INTO roles (name, description) VALUES
('ADMIN', 'Full system access'),
('MANAGER', 'Multi-centre manager'),
('CENTRE_MANAGER', 'Single centre manager'),
('CLINICIAN', 'Doctor/Therapist'),
('CARE_COORDINATOR', 'Patient flow coordinator'),
('FRONT_DESK', 'Reception staff');
```

### Problem: "Can't login with admin credentials"

**Checklist:**

1. ✅ Backend server is running (`http://localhost:5000`)
2. ✅ Database connection is working
3. ✅ Admin user exists in database (run Query 1)
4. ✅ Admin user has ADMIN role assigned
5. ✅ Admin user `is_active = true`
6. ✅ Password hash matches the password you're trying

### Problem: "Password doesn't work"

**Solutions:**

1. Reset the password using the "Resetting Admin Password" section
2. Or create a new admin user with a known password

---

## Quick Reference Commands

### Connect to Database

```bash
# Local
psql -U postgres -d mibo_care

# Remote
psql "postgresql://user:pass@host:5432/dbname"
```

### Check Admin Exists

```sql
SELECT username, phone, email, full_name
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE r.name = 'ADMIN' AND u.is_active = true;
```

### Create Quick Test Admin

```sql
-- Username: admin, Password: admin123
INSERT INTO users (phone, email, username, password_hash, full_name, user_type, is_active)
VALUES ('1234567890', 'admin@test.com', 'admin',
        '$2b$10$rBV2kHf7Gg3rO7oDdDdDdOqKqKqKqKqKqKqKqKqKqKqKqKqKqKq',
        'Test Admin', 'STAFF', true);

INSERT INTO user_roles (user_id, role_id, is_active)
VALUES ((SELECT id FROM users WHERE username = 'admin'),
        (SELECT id FROM roles WHERE name = 'ADMIN'), true);
```

---

## Security Best Practices

1. **Never use default passwords in production**

   - Change `admin123` immediately after first login

2. **Use strong passwords**

   - Minimum 12 characters
   - Mix of uppercase, lowercase, numbers, symbols

3. **Rotate passwords regularly**

   - Change admin password every 90 days

4. **Limit admin accounts**

   - Only create admin accounts for trusted personnel
   - Use lower-privilege roles when possible

5. **Monitor admin activity**
   - Keep logs of admin logins and actions

---

## Need Help?

If you're still having issues:

1. Check that your backend is running: `http://localhost:5000/health`
2. Check database connection in backend logs
3. Verify all tables exist: `\dt` in psql
4. Check the `DEPLOYMENT_GUIDE.md` for complete setup instructions
