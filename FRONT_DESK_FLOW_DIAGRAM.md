# Front Desk Staff Feature - Flow Diagrams

## 1. Staff Creation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN CREATES STAFF                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Admin Panel     │
                    │  Staff → Front   │
                    │  Desk Page       │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Click "Add      │
                    │  Front Desk      │
                    │  Staff" Button   │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Fill Form:      │
                    │  • Name          │
                    │  • Phone         │
                    │  • Email         │
                    │  • Username      │
                    │  • Password      │
                    │  • Centre        │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Frontend        │
                    │  Validation      │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  POST /api/      │
                    │  users/          │
                    │  front-desk      │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Backend         │
                    │  Validation      │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Check           │
                    │  Duplicates      │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Hash Password   │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Create User     │
                    │  (users table)   │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Create Profile  │
                    │  (staff_profiles)│
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Assign Role     │
                    │  (user_roles)    │
                    │  Role ID: 6      │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Assign Centre   │
                    │  (centre_staff_  │
                    │  assignments)    │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Success!        │
                    │  Staff Created   │
                    └──────────────────┘
```

---

## 2. Staff Login Flow

```
┌─────────────────────────────────────────────────────────────┐
│                FRONT DESK STAFF LOGIN                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Login Page      │
                    │  Enter:          │
                    │  • Username      │
                    │  • Password      │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  POST /api/auth/ │
                    │  login/username- │
                    │  password        │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Find User by    │
                    │  Username        │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Check User Type │
                    │  = 'STAFF'       │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Check Active    │
                    │  Status          │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Verify Password │
                    │  (bcrypt)        │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Get User Roles  │
                    │  & Centres       │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Generate JWT    │
                    │  Tokens:         │
                    │  • Access Token  │
                    │  • Refresh Token │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Return User     │
                    │  Data + Tokens   │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Store Tokens    │
                    │  in Browser      │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Redirect to     │
                    │  Dashboard       │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Load Sidebar    │
                    │  Based on Role   │
                    │  (FRONT_DESK)    │
                    └──────────────────┘
```

---

## 3. Edit Staff Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ADMIN EDITS STAFF                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Front Desk      │
                    │  Staff Table     │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Click "Edit"    │
                    │  Button          │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  GET /api/users/ │
                    │  :id             │
                    │  (Fetch Details) │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Pre-fill Form   │
                    │  with Current    │
                    │  Data            │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Admin Updates:  │
                    │  • Name          │
                    │  • Phone         │
                    │  • Email         │
                    │  • Username      │
                    │  • Password      │
                    │  • Centre        │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Click "Update   │
                    │  Staff"          │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Frontend        │
                    │  Validation      │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  PUT /api/users/ │
                    │  :id             │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Backend         │
                    │  Validation      │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Check Username  │
                    │  Uniqueness      │
                    │  (if changed)    │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Hash Password   │
                    │  (if provided)   │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Update User     │
                    │  Record          │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Update Centre   │
                    │  Assignment      │
                    │  (if changed)    │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Success!        │
                    │  Staff Updated   │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Refresh Table   │
                    │  Show Updated    │
                    │  Data            │
                    └──────────────────┘
```

---

## 4. Booking Appointment Flow

```
┌─────────────────────────────────────────────────────────────┐
│            FRONT DESK BOOKS APPOINTMENT                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Click "Book     │
                    │  Appointment"    │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  STEP 1:         │
                    │  Select Centre   │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Load Clinicians │
                    │  for Centre      │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  STEP 2:         │
                    │  Select Clinician│
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Load Clinician  │
                    │  Availability    │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  STEP 3:         │
                    │  Select Date     │
                    │  (Calendar)      │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Load Time Slots │
                    │  for Date        │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  STEP 4:         │
                    │  Select Time Slot│
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  STEP 5:         │
                    │  Select Patient  │
                    │  OR Create New   │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  STEP 6:         │
                    │  Add Notes       │
                    │  (Optional)      │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  STEP 7:         │
                    │  Confirm Booking │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  POST /api/      │
                    │  booking/        │
                    │  front-desk      │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Validate Slot   │
                    │  Availability    │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Create/Find     │
                    │  Patient         │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Create          │
                    │  Appointment     │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Generate        │
                    │  Payment Link    │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Success!        │
                    │  Appointment     │
                    │  Created         │
                    └──────────────────┘
```

---

## 5. Database Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA                           │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐
│     users        │
│──────────────────│
│ id (PK)          │◄─────────┐
│ full_name        │          │
│ phone (UNIQUE)   │          │
│ email            │          │
│ username (UNIQUE)│          │
│ password_hash    │          │
│ user_type        │          │
│ is_active        │          │
└──────────────────┘          │
         │                    │
         │                    │
         ▼                    │
┌──────────────────┐          │
│ staff_profiles   │          │
│──────────────────│          │
│ id (PK)          │          │
│ user_id (FK) ────┼──────────┘
│ designation      │
│ profile_pic_url  │
│ is_active        │
└──────────────────┘
         │
         │
         ▼
┌──────────────────┐          ┌──────────────────┐
│   user_roles     │          │      roles       │
│──────────────────│          │──────────────────│
│ id (PK)          │          │ id (PK)          │
│ user_id (FK) ────┼──────────┤ 6 = FRONT_DESK   │
│ role_id (FK) ────┼─────────►│ name             │
│ centre_id (FK)   │          │ description      │
│ is_active        │          │ is_active        │
└──────────────────┘          └──────────────────┘
         │
         │
         ▼
┌──────────────────┐          ┌──────────────────┐
│ centre_staff_    │          │     centres      │
│ assignments      │          │──────────────────│
│──────────────────│          │ id (PK)          │
│ id (PK)          │          │ name             │
│ centre_id (FK) ──┼─────────►│ city             │
│ user_id (FK)     │          │ address          │
│ role_id (FK)     │          │ is_active        │
│ is_active        │          └──────────────────┘
└──────────────────┘
```

---

## 6. Role-Based Navigation

```
┌─────────────────────────────────────────────────────────────┐
│                  SIDEBAR NAVIGATION                          │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                         ADMIN                                 │
├──────────────────────────────────────────────────────────────┤
│ Main:                                                         │
│  ✓ Dashboard                                                  │
│  ✓ Patients                                                   │
│  ✓ Appointments                                               │
│  ✓ Book Appointment                                           │
│  ✓ Slot Management                                            │
│  ✓ Centres                                                    │
│                                                               │
│ Staff:                                                        │
│  ✓ Managers                                                   │
│  ✓ Centre Managers                                            │
│  ✓ Clinicians                                                 │
│  ✓ Care Coordinators                                          │
│  ✓ Front Desk                                                 │
│                                                               │
│ Settings:                                                     │
│  ✓ Settings                                                   │
│  ✓ Support                                                    │
│                                                               │
│ Account:                                                      │
│  ✓ Profile                                                    │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                      FRONT_DESK                               │
├──────────────────────────────────────────────────────────────┤
│ Main:                                                         │
│  ✓ Dashboard                                                  │
│  ✓ Patients                                                   │
│  ✓ Appointments                                               │
│  ✓ Book Appointment                                           │
│  ✓ Slot Management        ◄── NEW                             │
│  ✓ Centres                ◄── NEW                             │
│                                                               │
│ Account:                                                      │
│  ✓ Profile                                                    │
│  ✓ Support                                                    │
│                                                               │
│ ❌ NO ACCESS TO:                                              │
│  ✗ Staff Management                                           │
│  ✗ Settings                                                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 7. Security Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
└─────────────────────────────────────────────────────────────┘

REQUEST
   │
   ▼
┌──────────────────┐
│ Authentication   │  ◄── JWT Token Validation
│ Middleware       │
└──────────────────┘
   │
   ▼
┌──────────────────┐
│ Role Check       │  ◄── Verify User Role
│ Middleware       │      (FRONT_DESK, ADMIN, etc.)
└──────────────────┘
   │
   ▼
┌──────────────────┐
│ Active Status    │  ◄── Check is_active = TRUE
│ Check            │
└──────────────────┘
   │
   ▼
┌──────────────────┐
│ Permission       │  ◄── Verify Endpoint Access
│ Check            │
└──────────────────┘
   │
   ▼
┌──────────────────┐
│ Input            │  ◄── Validate Request Data
│ Validation       │
└──────────────────┘
   │
   ▼
┌──────────────────┐
│ Business Logic   │  ◄── Execute Operation
└──────────────────┘
   │
   ▼
RESPONSE
```

---

**Visual Guide Version:** 1.0.0
**Last Updated:** May 19, 2026
