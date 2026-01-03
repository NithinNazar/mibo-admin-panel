# Feature Implementation Status Report

## Overview

This document analyzes the current implementation status of role-based features in the Mibo Care Admin Panel.

---

## ✅ Feature 1: JWT Token Implementation for Admin Panel Roles

### Status: **IMPLEMENTED**

### Evidence:

1. **JWT Token Handling** (`src/services/api.ts`):

   ```typescript
   // Request interceptor adds JWT token to all requests
   api.interceptors.request.use((config) => {
     const token = localStorage.getItem("accessToken");
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });
   ```

2. **Token Refresh Mechanism** (`src/services/api.ts`):

   ```typescript
   // Automatic token refresh on 401 errors
   if (error.response?.status === 401 && !originalRequest._retry) {
     const refreshToken = localStorage.getItem("refreshToken");
     const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
       refreshToken,
     });
     localStorage.setItem("accessToken", response.data.accessToken);
     // Retry original request with new token
   }
   ```

3. **Authentication Service** (`src/services/authService.ts`):

   - Supports 3 login methods (phone+OTP, phone+password, username+password)
   - Stores accessToken and refreshToken in localStorage
   - User object includes role information

4. **Auth Context** (`src/contexts/AuthContext.tsx`):
   - Manages authentication state
   - Provides user object with role information
   - Handles login/logout operations

### ⚠️ Current Limitation:

- **Authentication is currently DISABLED** in the router (`src/router/index.tsx`):
  ```typescript
  const isAuthenticated = true; // Hardcoded to true
  ```

### ✅ What Works:

- JWT token infrastructure is fully implemented
- Token refresh mechanism works
- User role is stored in the user object

### 🔧 What Needs to be Done:

1. Enable authentication by uncommenting in `src/router/index.tsx`:

   ```typescript
   // Change from:
   const isAuthenticated = true;

   // To:
   const { isAuthenticated, isLoading, user } = useAuth();
   ```

2. Uncomment AuthProvider in `src/App.tsx`:

   ```typescript
   // Change from:
   {
     /* <AuthProvider> */
   }
   <AppRouter />;
   {
     /* </AuthProvider> */
   }

   // To:
   <AuthProvider>
     <AppRouter />
   </AuthProvider>;
   ```

---

## ⚠️ Feature 2: Admin Role - Full Access to All Features

### Status: **PARTIALLY IMPLEMENTED**

### What's Implemented:

1. **All Admin Features Exist**:

   - Dashboard with analytics ✅
   - Centre management ✅
   - Clinician management ✅
   - Patient management ✅
   - Appointment booking ✅
   - Appointment management ✅
   - Staff management pages ✅

2. **Sidebar Navigation** (`src/layouts/AdminLayout/Sidebar.tsx`):
   - Shows all navigation items
   - No role-based filtering currently

### ❌ What's Missing:

1. **Role-Based Access Control (RBAC)**:
   - Sidebar doesn't filter items based on user role
   - Routes don't check user role before rendering
   - No role-based permission checks

### 🔧 What Needs to be Done:

#### 1. Add Role-Based Sidebar Filtering

**File**: `src/layouts/AdminLayout/Sidebar.tsx`

```typescript
import { useAuth } from "../../contexts/AuthContext";

const Sidebar: React.FC = () => {
  const { user } = useAuth();

  // Filter sections based on user role
  const filteredSections = sections.map(section => ({
    ...section,
    items: section.items.filter(item => {
      // Admin sees everything
      if (user?.role === "ADMIN") return true;

      // Manager sees most things except some staff management
      if (user?.role === "MANAGER") {
        return !item.path?.includes("/staff/managers");
      }

      // Clinician only sees their appointments and patients
      if (user?.role === "CLINICIAN") {
        return ["/dashboard", "/patients", `/clinicians/${user.id}/appointments`]
          .includes(item.path || "");
      }

      // Front desk sees booking and appointments
      if (user?.role === "FRONT_DESK") {
        return ["/dashboard", "/patients", "/book-appointment", "/centres"]
          .some(path => item.path?.startsWith(path));
      }

      return false;
    })
  })).filter(section => section.items.length > 0);

  return (
    // ... render filteredSections
  );
};
```

#### 2. Add Route Protection

**File**: `src/router/index.tsx`

```typescript
// Create a ProtectedRoute component
const ProtectedRoute = ({
  element,
  allowedRoles,
}: {
  element: React.ReactElement;
  allowedRoles: UserRole[];
}) => {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return element;
};

// Use in routes
<Route
  path="centres"
  element={
    <ProtectedRoute
      element={<CentresPage />}
      allowedRoles={["ADMIN", "MANAGER"]}
    />
  }
/>;
```

---

## ⚠️ Feature 3: Doctor/Clinician Role - View Appointments in Calendar

### Status: **PARTIALLY IMPLEMENTED**

### What's Implemented:

1. **Clinician Appointments Page** (`src/modules/appointments/pages/ClinicianAppointmentsPage.tsx`):

   - Fetches clinician's appointments using `getMyAppointments()` ✅
   - Shows three categories: Current, Upcoming, Past ✅
   - Displays patient info, date/time, location ✅

2. **Calendar Components Exist**:
   - `AvailabilityCalendar.tsx` - Monthly view ✅
   - `SlotGrid.tsx` - Daily slot view ✅
   - `WeekView.tsx` - Weekly overview ✅

### ❌ What's Missing:

1. **Calendar View Integration**:

   - ClinicianAppointmentsPage shows LIST view, not CALENDAR view
   - Calendar components exist but aren't used in clinician dashboard

2. **Cancel/Postpone Functionality**:
   - No cancel button in ClinicianAppointmentsPage
   - No reschedule/postpone functionality

### 🔧 What Needs to be Done:

#### 1. Add Calendar View to Clinician Dashboard

**File**: `src/modules/appointments/pages/ClinicianAppointmentsPage.tsx`

```typescript
// Add view toggle
const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

// Add calendar view
{viewMode === "calendar" ? (
  <AvailabilityCalendar
    clinicianId={user.id}
    appointments={appointments}
    onDateSelect={(date) => setSelectedDate(date)}
  />
) : (
  // Existing list view
)}
```

#### 2. Add Cancel/Postpone Actions

```typescript
const handleCancelAppointment = async (id: string) => {
  if (!confirm("Cancel this appointment?")) return;

  try {
    await appointmentService.cancelAppointment(id, "Cancelled by clinician");
    toast.success("Appointment cancelled");
    fetchAppointments();
  } catch (error) {
    toast.error("Failed to cancel");
  }
};

const handleRescheduleAppointment = async (id: string) => {
  // Open modal to select new date/time
  setReschedulingAppointment(id);
  setIsRescheduleModalOpen(true);
};
```

---

## ⚠️ Feature 4: Front Desk Role - Centre-Specific Booking Management

### Status: **PARTIALLY IMPLEMENTED**

### What's Implemented:

1. **Booking Flow** (`src/modules/appointments/pages/BookAppointmentPage.tsx`):

   - Multi-step wizard for booking ✅
   - Centre selection ✅
   - Clinician selection ✅
   - Date/time selection with calendar ✅
   - Patient selection/creation ✅

2. **Appointment Management** (`src/modules/appointments/pages/CentreAppointmentsPage.tsx`):
   - View all appointments ✅
   - Filter by centre, clinician, date, status ✅
   - Cancel appointments ✅

### ❌ What's Missing:

1. **Centre Assignment**:

   - No way to assign front desk staff to specific centre
   - No filtering based on assigned centre

2. **Reschedule/Postpone**:
   - Can cancel but cannot reschedule
   - No postpone functionality

### 🔧 What Needs to be Done:

#### 1. Add Centre Assignment to User Model

**File**: `src/types/index.ts`

```typescript
interface User {
  // ... existing fields
  assignedCentreId?: string; // For FRONT_DESK and CENTRE_MANAGER roles
}
```

#### 2. Filter by Assigned Centre

**File**: `src/modules/appointments/pages/CentreAppointmentsPage.tsx`

```typescript
const { user } = useAuth();

useEffect(() => {
  const fetchData = async () => {
    // If front desk, only show their centre's appointments
    if (user?.role === "FRONT_DESK" && user.assignedCentreId) {
      setSelectedCentre(user.assignedCentreId);
      // Disable centre filter for front desk
    }
  };
}, [user]);
```

#### 3. Add Reschedule Functionality

**File**: `src/modules/appointments/pages/CentreAppointmentsPage.tsx`

```typescript
const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);

const handleReschedule = async (appointmentId: string, newDateTime: Date) => {
  try {
    await appointmentService.updateAppointment(appointmentId, {
      scheduledStartAt: newDateTime,
      scheduledEndAt: new Date(newDateTime.getTime() + 60 * 60 * 1000), // +1 hour
      status: "RESCHEDULED"
    });
    toast.success("Appointment rescheduled");
    fetchData();
  } catch (error) {
    toast.error("Failed to reschedule");
  }
};

// Add reschedule button to table actions
{
  key: "actions",
  header: "Actions",
  render: (apt: Appointment) => (
    <div className="flex gap-2">
      {(apt.status === "BOOKED" || apt.status === "CONFIRMED") && (
        <>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setReschedulingAppointment(apt)}
          >
            Reschedule
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleCancelAppointment(apt.id)}
          >
            Cancel
          </Button>
        </>
      )}
    </div>
  )
}
```

---

## Summary Table

| Feature                       | Status         | Implementation % | Missing Components                    |
| ----------------------------- | -------------- | ---------------- | ------------------------------------- |
| 1. JWT Token for Roles        | ✅ Implemented | 100%             | Just needs to be enabled              |
| 2. Admin Full Access          | ⚠️ Partial     | 60%              | RBAC, Route protection                |
| 3. Doctor Calendar View       | ⚠️ Partial     | 70%              | Calendar integration, Cancel/Postpone |
| 4. Front Desk Centre-Specific | ⚠️ Partial     | 65%              | Centre assignment, Reschedule         |

---

## Priority Action Items

### High Priority (Required for MVP)

1. ✅ Enable authentication in router and App.tsx
2. ✅ Add role-based sidebar filtering
3. ✅ Add route protection based on roles
4. ✅ Add cancel/reschedule to clinician dashboard
5. ✅ Add centre assignment to front desk users

### Medium Priority (Nice to Have)

6. Add calendar view toggle to clinician dashboard
7. Add reschedule modal component
8. Add centre-based filtering for front desk
9. Add role-based dashboard customization

### Low Priority (Future Enhancement)

10. Add notification system for appointment changes
11. Add bulk operations for appointments
12. Add appointment history/audit log
13. Add advanced filtering and search

---

## Backend Requirements

To fully implement these features, the backend must support:

1. ✅ JWT authentication with role information in token
2. ✅ Role-based API endpoint access control
3. ✅ `GET /appointments/my-appointments` for clinicians
4. ✅ `POST /appointments/:id/cancel` endpoint
5. ⚠️ `PUT /appointments/:id/reschedule` endpoint (may need to be added)
6. ⚠️ User model with `assignedCentreId` field (may need to be added)
7. ✅ Appointment update endpoint for rescheduling

---

## Next Steps

1. **Enable Authentication** (5 minutes)

   - Uncomment AuthProvider in App.tsx
   - Uncomment useAuth in router

2. **Implement RBAC** (2-3 hours)

   - Add role-based sidebar filtering
   - Add route protection
   - Test with different roles

3. **Enhance Clinician Dashboard** (3-4 hours)

   - Add calendar view option
   - Add cancel/reschedule buttons
   - Test appointment management

4. **Enhance Front Desk Features** (2-3 hours)
   - Add centre assignment logic
   - Filter appointments by assigned centre
   - Add reschedule functionality

**Total Estimated Time**: 8-11 hours of development work
