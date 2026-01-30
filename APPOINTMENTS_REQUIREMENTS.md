# Appointments Feature Requirements - Implementation Plan

## ✅ COMPLETED:

1. Logo added to Sidebar
2. Logo added to Login page

## 🔧 TO IMPLEMENT:

### 1. Sidebar Navigation Updates

**Current Issue:** "Appointments" tab shows black page

**Required Changes:**

- **Admin/Manager:** Show "Appointments" tab (all appointments across all centres)
- **Front Desk:** Show "Appointments" tab (for booking purposes)
- **Clinicians:** Show "My Appointments" tab ONLY (their own appointments)
- **Care Coordinators:** Show "Appointments" tab

### 2. All Appointments Page Enhancements

**File:** `mibo-admin/src/modules/appointments/pages/AllAppointmentsPage.tsx`

**Add Features:**

#### A. Centre Filter

```typescript
const [centreFilter, setCentreFilter] = useState<string>("ALL");

// In filters section, add:
<Select
  value={centreFilter}
  onChange={(e) => setCentreFilter(e.target.value)}
  options={[
    { value: "ALL", label: "All Centres" },
    ...centres.map(c => ({ value: c.id, label: c.name }))
  ]}
/>
```

#### B. Time-based Filters

```typescript
const [timeFilter, setTimeFilter] = useState<string>("ALL");

// Options:
- ALL: All appointments
- CURRENT: Today's appointments
- PAST: Past appointments (before today)
- UPCOMING: Future appointments (after today)
```

#### C. Cancel Appointment Button

```typescript
const handleCancelAppointment = async (appointmentId: string) => {
  if (!confirm("Are you sure you want to cancel this appointment?")) return;

  try {
    await appointmentService.cancelAppointment(appointmentId);
    toast.success("Appointment cancelled");
    fetchAppointments();
  } catch (error) {
    toast.error("Failed to cancel appointment");
  }
};

// Add to table actions column:
<Button
  variant="danger"
  size="sm"
  onClick={() => handleCancelAppointment(apt.id)}
  disabled={apt.status === 'CANCELLED' || apt.status === 'COMPLETED'}
>
  Cancel
</Button>
```

#### D. Book New Appointment Button

```typescript
// Add to page header:
<Button
  variant="primary"
  onClick={() => navigate('/book-appointment')}
>
  <Plus size={20} />
  Book New Appointment
</Button>
```

### 3. Backend API Endpoint Needed

**File:** `backend/src/controllers/appointment.controller.ts`

Add cancel endpoint:

```typescript
router.put("/:id/cancel", appointmentController.cancelAppointment);
```

**File:** `backend/src/services/appointment.service.ts`

```typescript
async cancelAppointment(appointmentId: number) {
  // Update status to CANCELLED
  // Send notification to patient
  // Update clinician availability
}
```

### 4. Sidebar Role-based Visibility

**File:** `mibo-admin/src/layouts/AdminLayout/Sidebar.tsx`

Update `getFilteredSections()`:

```typescript
// Admin & Manager - Show "Appointments"
if (role === "ADMIN" || role === "MANAGER") {
  return [
    {
      title: "Main",
      items: [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { label: "Patients", path: "/patients", icon: Users },
        { label: "Appointments", path: "/appointments", icon: Calendar }, // ALL appointments
        {
          label: "Book Appointment",
          path: "/book-appointment",
          icon: CalendarPlus,
        },
        { label: "Centres", path: "/centres", icon: Building2 },
      ],
    },
    // ... staff section
  ];
}

// Clinician - Show "My Appointments" ONLY
if (role === "CLINICIAN") {
  return [
    {
      title: "Main",
      items: [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { label: "Patients", path: "/patients", icon: Users },
      ],
    },
    {
      title: "Appointments",
      items: [
        {
          label: "My Appointments",
          path: `/clinicians/${user.id}/appointments`,
          icon: Calendar,
        },
      ],
    },
  ];
}

// Front Desk - Show "Appointments" for booking
if (role === "FRONT_DESK") {
  return [
    {
      title: "Main",
      items: [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { label: "Patients", path: "/patients", icon: Users },
        { label: "Appointments", path: "/appointments", icon: Calendar }, // For viewing/booking
        {
          label: "Book Appointment",
          path: "/book-appointment",
          icon: CalendarPlus,
        },
      ],
    },
  ];
}
```

### 5. Implementation Steps

1. **Step 1:** Update Sidebar role-based navigation ✅ (partially done)
2. **Step 2:** Add centre filter to AllAppointmentsPage
3. **Step 3:** Add time-based filters (current/past/upcoming)
4. **Step 4:** Add cancel appointment functionality
5. **Step 5:** Add "Book New Appointment" button
6. **Step 6:** Test with different user roles

### 6. Testing Checklist

- [ ] Login as Admin → See "Appointments" tab → See all appointments
- [ ] Login as Manager → See "Appointments" tab → See all appointments
- [ ] Login as Clinician → See "My Appointments" tab ONLY → See only their appointments
- [ ] Login as Front Desk → See "Appointments" tab → Can book appointments
- [ ] Filter by centre works
- [ ] Filter by time (current/past/upcoming) works
- [ ] Cancel appointment works
- [ ] Book new appointment button navigates correctly

---

## Quick Implementation

Due to complexity, this requires:

- 1 file update: Sidebar.tsx (role-based navigation)
- 1 file update: AllAppointmentsPage.tsx (filters + cancel + book button)
- 1 backend endpoint: Cancel appointment API
- 1 service method: appointmentService.cancelAppointment()

**Estimated Time:** 30-45 minutes

Would you like me to implement all of these changes now?
