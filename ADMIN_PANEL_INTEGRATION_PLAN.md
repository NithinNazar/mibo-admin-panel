# Admin Panel Integration Plan

## Current Status

✅ Login working with username+password and phone+OTP
✅ Backend has 23 doctors, 3 centres populated
✅ Admin can access dashboard

## Goal

Replace all hardcoded dummy data in admin panel with real data from backend API.

---

## Data to Sync

### 1. Dashboard Statistics

**Current**: Hardcoded numbers
**Target**: Real-time stats from database

- Total Patients
- Total Appointments (Today, This Week, This Month)
- Total Doctors/Clinicians
- Total Centres
- Revenue statistics

### 2. Doctors/Clinicians List

**Current**: Dummy data
**Target**: 23 real doctors from database

- Dr. Jini K. Gopinath (Bangalore)
- Dr. Muhammed Sadik T.M (Bangalore)
- ... (all 23 doctors)

### 3. Centres List

**Current**: Dummy data
**Target**: 3 real centres

- Mibo Bangalore
- Mibo Kochi
- Mibo Mumbai

### 4. Appointments

**Current**: Dummy appointments
**Target**: Real appointments from database

- Patient details
- Doctor details
- Date/Time
- Status
- Payment status

### 5. Patients List

**Current**: Dummy patients
**Target**: Real patients from database

- Patient details
- Appointment history
- Payment history

---

## Backend API Endpoints Needed

### Already Available:

- ✅ `GET /api/auth/me` - Current user
- ✅ `GET /api/centres` - List centres
- ✅ `GET /api/appointments` - List appointments
- ✅ `GET /api/patients` - List patients

### Need to Check/Create:

- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/clinicians` or `GET /api/users?type=STAFF&role=CLINICIAN` - List doctors
- `GET /api/analytics/revenue` - Revenue statistics

---

## Implementation Steps

### Phase 1: API Services (Frontend)

1. Create/update API service files
2. Add methods for fetching real data
3. Handle loading states
4. Handle errors

### Phase 2: Dashboard

1. Fetch real statistics
2. Update charts with real data
3. Show loading states

### Phase 3: Clinicians/Doctors

1. Fetch 23 doctors from database
2. Display with real data
3. Add filters (by centre, specialization)
4. Add search functionality

### Phase 4: Centres

1. Fetch 3 centres
2. Display with real data
3. Show appointments per centre

### Phase 5: Appointments

1. Fetch real appointments
2. Display with filters
3. Add status updates
4. Add booking functionality

### Phase 6: Patients

1. Fetch real patients
2. Display patient details
3. Show appointment history
4. Show payment history

---

## Priority Order

1. **High Priority** (Do First):

   - Dashboard statistics
   - Clinicians list
   - Centres list

2. **Medium Priority**:

   - Appointments list
   - Patients list

3. **Low Priority** (Can do later):
   - Advanced analytics
   - Reports
   - Settings

---

## Technical Approach

### 1. Create API Service Layer

```typescript
// services/cliniciansService.ts
export const getClinicians = async () => {
  const response = await api.get("/users?type=STAFF");
  return response.data;
};

// services/centresService.ts
export const getCentres = async () => {
  const response = await api.get("/centres");
  return response.data;
};

// services/analyticsService.ts
export const getDashboardStats = async () => {
  const response = await api.get("/analytics/dashboard");
  return response.data;
};
```

### 2. Update Components

```typescript
// Use React hooks for data fetching
const [clinicians, setClinicians] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchClinicians();
}, []);

const fetchClinicians = async () => {
  try {
    const data = await getClinicians();
    setClinicians(data);
  } catch (error) {
    toast.error("Failed to load clinicians");
  } finally {
    setLoading(false);
  }
};
```

### 3. Handle Loading States

```typescript
if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage />;
return <DataDisplay data={data} />;
```

---

## Backend Endpoints to Create

### 1. Dashboard Analytics

```typescript
GET /api/analytics/dashboard
Response: {
  totalPatients: 150,
  totalAppointments: 45,
  todayAppointments: 12,
  thisWeekAppointments: 45,
  thisMonthAppointments: 180,
  totalClinicians: 23,
  totalCentres: 3,
  revenue: {
    today: 19200,
    thisWeek: 72000,
    thisMonth: 288000
  }
}
```

### 2. Clinicians List

```typescript
GET /api/users?type=STAFF&role=CLINICIAN
// or
GET /api/clinicians

Response: {
  success: true,
  data: [
    {
      id: 3,
      fullName: "Dr. Jini K. Gopinath",
      email: "jini.gopinath@mibo.com",
      phone: "9876501001",
      specialization: "Clinical Hypnotherapist, Senior Clinical Psychologist",
      centre: "Mibo Bangalore",
      consultationFee: 1600,
      isActive: true
    },
    // ... 22 more doctors
  ]
}
```

---

## Files to Modify

### Frontend (mibo-admin):

1. `src/services/cliniciansService.ts` - Create
2. `src/services/centresService.ts` - Create
3. `src/services/analyticsService.ts` - Create
4. `src/modules/dashboard/pages/DashboardPage.tsx` - Update
5. `src/modules/staff/pages/CliniciansPage.tsx` - Update
6. `src/modules/centres/pages/CentresPage.tsx` - Update

### Backend:

1. `src/routes/analytics.routes.ts` - Add dashboard endpoint
2. `src/controllers/analytics.controller.ts` - Add dashboard method
3. `src/services/analytics.service.ts` - Add dashboard logic
4. `src/routes/staff.routes.ts` - Ensure clinicians endpoint exists

---

## Testing Plan

1. Test dashboard loads with real data
2. Test clinicians list shows all 23 doctors
3. Test centres list shows all 3 centres
4. Test filters and search work
5. Test loading states
6. Test error handling

---

## Next Steps

1. ✅ Login working
2. 🔄 Create backend analytics endpoint
3. 🔄 Create frontend API services
4. 🔄 Update dashboard with real data
5. 🔄 Update clinicians list
6. 🔄 Update centres list
7. ⏳ Update appointments
8. ⏳ Update patients

---

**Status**: Ready to implement

**Estimated Time**: 2-3 hours for high priority items

**Last Updated**: January 3, 2026
