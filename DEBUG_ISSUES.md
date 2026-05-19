# Debug Front Desk Issues

## Issue 1: Cannot Edit Front Desk Staff

## Issue 2: Cannot Login as Front Desk Staff

---

## Step 1: Run Database Diagnostics

### In pgAdmin, run this SQL:

```sql
-- 1. Check if front desk staff was created correctly
SELECT
  u.id,
  u.full_name,
  u.phone,
  u.email,
  u.username,
  u.password_hash IS NOT NULL as has_password,
  u.user_type,
  u.is_active,
  u.created_at
FROM users u
WHERE u.phone LIKE '987654%' OR u.username LIKE 'test%'
ORDER BY u.created_at DESC
LIMIT 5;
```

**Expected Result:**

- `has_password` should be `true`
- `user_type` should be `'STAFF'`
- `is_active` should be `true`
- `username` should have a value

**If username or password_hash is NULL:**

- The creation failed partially
- Need to check backend logs

---

### 2. Check Role Assignment

```sql
SELECT
  ur.id,
  ur.user_id,
  ur.role_id,
  r.name as role_name,
  ur.centre_id,
  ur.is_active as role_active
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE ur.role_id = 6
ORDER BY ur.created_at DESC
LIMIT 5;
```

**Expected Result:**

- `role_id` should be `6`
- `role_name` should be `'FRONT_DESK'`
- `role_active` should be `true`
- `centre_id` should have a value

**If no rows returned:**

- Role assignment failed
- Need to manually assign role

---

### 3. Check Centre Assignment

```sql
SELECT
  csa.id,
  csa.user_id,
  csa.centre_id,
  c.name as centre_name,
  csa.role_id,
  csa.is_active
FROM centre_staff_assignments csa
JOIN centres c ON csa.centre_id = c.id
WHERE csa.user_id IN (
  SELECT user_id FROM user_roles WHERE role_id = 6
)
ORDER BY csa.created_at DESC
LIMIT 5;
```

**Expected Result:**

- Should have at least one row
- `is_active` should be `true`
- `centre_name` should match selected centre

---

## Step 2: Check Backend Logs

### When trying to login, check backend console for:

```
❌ "Invalid credentials" - Username or password wrong
❌ "Account inactive" - User is_active = false
❌ "User not found" - Username doesn't exist
❌ SQL errors - Database query failed
```

### When trying to edit, check for:

```
❌ 404 Not Found - Route not mounted
❌ 403 Forbidden - Permission denied
❌ 400 Bad Request - Validation failed
❌ 500 Internal Server Error - Server error
```

---

## Step 3: Check Browser Console

### Open DevTools (F12) → Network Tab

When clicking "Edit":

1. Look for `PUT /api/users/{id}` request
2. Check the status code:
   - 200 = Success
   - 400 = Validation error
   - 403 = Permission denied
   - 404 = Route not found
   - 500 = Server error

3. Click on the request → Response tab
4. Check the error message

---

## Step 4: Manual Fixes

### Fix 1: If Username is NULL

```sql
-- Update username for the staff member
UPDATE users
SET username = 'testdesk'  -- Change this
WHERE id = <user_id>;  -- Replace with actual user ID
```

### Fix 2: If Password Hash is NULL

```sql
-- You need to hash the password first
-- Use this Node.js script:
```

```javascript
const bcrypt = require("bcryptjs");
const password = "password123";
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
```

Then update:

```sql
UPDATE users
SET password_hash = '$2a$10$...'  -- Paste the hash here
WHERE id = <user_id>;
```

### Fix 3: If Role Not Assigned

```sql
-- Assign FRONT_DESK role
INSERT INTO user_roles (user_id, role_id, centre_id, is_active)
VALUES (<user_id>, 6, <centre_id>, TRUE);
```

### Fix 4: If Centre Not Assigned

```sql
-- Assign to centre
INSERT INTO centre_staff_assignments (centre_id, user_id, role_id, is_active)
VALUES (<centre_id>, <user_id>, 6, TRUE);
```

### Fix 5: If User Type is Wrong

```sql
UPDATE users
SET user_type = 'STAFF'
WHERE id = <user_id>;
```

---

## Step 5: Test API Endpoints Directly

### Test Login Endpoint

Using Postman or curl:

```bash
curl -X POST http://localhost:3000/api/auth/login/username-password \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testdesk",
    "password": "password123"
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

**Error Responses:**

- `"Invalid credentials"` - Wrong username/password
- `"Account inactive"` - User is_active = false
- `"User not found"` - Username doesn't exist

---

### Test Edit Endpoint

First, login as ADMIN and get the access token, then:

```bash
curl -X PUT http://localhost:3000/api/users/<user_id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <admin_access_token>" \
  -d '{
    "full_name": "Updated Name",
    "phone": "9876543210",
    "email": "updated@test.com",
    "username": "testdesk",
    "centre_ids": [1]
  }'
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Staff user updated successfully",
  "data": { ... }
}
```

---

## Step 6: Check if Backend Was Restarted

**IMPORTANT:** After making code changes, you MUST restart the backend server!

```bash
cd c:\Users\nithi\Desktop\backend_mibo\backend

# Stop the server (Ctrl+C)

# Start it again
npm run dev
```

Check the console output for:

```
✅ Server running on port 3000
✅ Database connected
✅ No TypeScript errors
```

---

## Step 7: Common Issues & Solutions

### Issue: "Cannot PUT /api/users/:id"

**Cause:** Route not found

**Solution:**

1. Check if backend was restarted
2. Verify route exists in `staff.routes.ts`
3. Check if route is mounted in `routes/index.ts`

---

### Issue: "Invalid credentials" when logging in

**Cause:** Username or password incorrect

**Solution:**

1. Run diagnostic SQL to check if username exists
2. Check if password_hash exists
3. Try creating a new staff member
4. Check backend logs for exact error

---

### Issue: Edit modal opens but update fails

**Cause:** Validation error or permission issue

**Solution:**

1. Check browser console for error message
2. Check network tab for API response
3. Verify you're logged in as ADMIN
4. Check if all required fields are filled

---

### Issue: "Account inactive"

**Cause:** User is_active = false

**Solution:**

```sql
UPDATE users
SET is_active = TRUE
WHERE id = <user_id>;

UPDATE staff_profiles
SET is_active = TRUE
WHERE user_id = <user_id>;
```

---

## Step 8: Complete Verification Checklist

Run these checks in order:

- [ ] Database migration completed successfully
- [ ] FRONT_DESK role exists (ID = 6)
- [ ] Backend server restarted after code changes
- [ ] User created with username and password_hash
- [ ] User has user_type = 'STAFF'
- [ ] User has is_active = TRUE
- [ ] Role assigned (user_roles table)
- [ ] Centre assigned (centre_staff_assignments table)
- [ ] Staff profile created (staff_profiles table)
- [ ] Can see staff in Front Desk table
- [ ] Edit button appears next to staff
- [ ] Edit modal opens when clicked
- [ ] Can update staff details
- [ ] Can login with username + password

---

## Need More Help?

If issues persist after running these diagnostics:

1. **Share the results** of the diagnostic SQL queries
2. **Share backend console logs** when trying to login
3. **Share browser console errors** when trying to edit
4. **Share API response** from Network tab

This will help identify the exact issue!
