# Quick Start Guide - Front Desk Feature

## 🚀 Quick Setup (5 minutes)

### Step 1: Run Database Migration

```bash
cd c:\Users\nithi\Desktop\backend_mibo\backend

# Connect to your database and run the migration
psql -U your_username -d your_database -f migrations/ensure_front_desk_support.sql
```

### Step 2: Restart Backend Server

```bash
# Stop the current server (Ctrl+C)
# Start it again
npm run dev
```

### Step 3: Test the Feature

#### A. Create Front Desk Staff (as Admin)

1. Login to admin panel as ADMIN
2. Go to: **Staff → Front Desk**
3. Click **"Add Front Desk Staff"**
4. Fill in:
   - Name: Test User
   - Phone: 9876543210
   - Username: testdesk
   - Password: password123
   - Centre: (select any)
5. Click **"Create Staff"**

#### B. Test Login

1. Logout
2. Login with:
   - Username: `testdesk`
   - Password: `password123`
3. ✅ Should see Dashboard with limited navigation

#### C. Test Booking

1. Click **"Book Appointment"**
2. Follow the steps to book an appointment
3. ✅ Should successfully create appointment

---

## ✅ What's New

### For Admins:

- **View Details** button - See all staff info
- **Edit** button - Update name, phone, email, username, password, centre
- Password can be changed (leave blank to keep current)

### For Front Desk Staff:

- Can login with username + password
- See: Dashboard, Patients, Appointments, Book Appointment, **Slot Management**, **Centres**
- Can book appointments for patients
- Can create new patients during booking

---

## 🔧 Troubleshooting

### "Failed to create staff"

- Check if phone/username already exists
- Verify phone is 10 digits starting with 6-9
- Verify password is at least 8 characters

### "Account inactive"

- Admin needs to toggle staff to "Active" in the table

### Can't see Slot Management or Centres

- Verify user role is FRONT_DESK
- Clear browser cache and reload

---

## 📝 Quick Test Checklist

- [ ] Admin can create front desk staff
- [ ] Admin can view staff details
- [ ] Admin can edit staff (including password)
- [ ] Front desk can login
- [ ] Front desk sees Slot Management & Centres in sidebar
- [ ] Front desk can book appointments

---

## 🆘 Need Help?

Check the full documentation: `FRONT_DESK_FEATURE_IMPLEMENTATION.md`

**Common SQL Queries:**

```sql
-- Check if FRONT_DESK role exists
SELECT * FROM roles WHERE id = 6;

-- List all front desk staff
SELECT u.full_name, u.username, u.phone, u.is_active
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
WHERE ur.role_id = 6;

-- Check staff centre assignment
SELECT u.full_name, c.name as centre_name
FROM users u
JOIN centre_staff_assignments csa ON u.id = csa.user_id
JOIN centres c ON csa.centre_id = c.id
WHERE u.username = 'testdesk';
```

---

**Status:** ✅ Ready to Use
**Last Updated:** May 19, 2026
