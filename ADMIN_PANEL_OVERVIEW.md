# Admin Panel Overview

## Project Information

**Project Name**: Mibo Mental Health - Admin Panel  
**Type**: Single Page Application (SPA)  
**Language**: TypeScript  
**Framework**: React 18  
**Build Tool**: Vite  
**UI Library**: Custom components + Tailwind CSS  
**State Management**: React Context API + Hooks

---

## Architecture

### Component-Based Architecture

```
┌─────────────────────────────────────────┐
│      Admin User Interface               │
│  (React Components + Tailwind CSS)     │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│    Admin Pages & Routes                 │
│  (React Router DOM navigation)          │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│       Services Layer                    │
│  (API calls to backend)                 │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Backend API                     │
│  (REST endpoints with RBAC)             │
└─────────────────────────────────────────┘
```

---

## Project Structure

```
mibo-admin/
├── src/
│   ├── assets/              # Static assets
│   │   ├── images/
│   │   └── icons/
│   │
│   ├── components/          # Reusable components
│   │   ├── ui/             # UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Table.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── MultiSelect.tsx
│   │   │   ├── ProfilePictureUpload.tsx
│   │   │   └── AvailabilityScheduleBuilder.tsx
│   │   ├── layout/         # Layout components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── MainLayout.tsx
│   │   └── common/         # Common components
│   │       ├── ErrorBoundary.tsx
│   │       ├── ProtectedRoute.tsx
│   │       └── RoleGuard.tsx
│   │
│   ├── modules/            # Feature modules
│   │   ├── dashboard/
│   │   │   └── pages/
│   │   │       └── DashboardPage.tsx
│   │   ├── appointments/
│   │   │   └── pages/
│   │   │       ├── AppointmentsPage.tsx
│   │   │       └── AppointmentDetailsPage.tsx
│   │   ├── staff/
│   │   │   └── pages/
│   │   │       ├── StaffPage.tsx
│   │   │       └── CliniciansPage.tsx
│   │   ├── patients/
│   │   │   └── pages/
│   │   │       ├── PatientsPage.tsx
│   │   │       └── PatientDetailsPage.tsx
│   │   ├── centres/
│   │   │   └── pages/
│   │   │       └── CentresPage.tsx
│   │   ├── analytics/
│   │   │   └── pages/
│   │   │       └── AnalyticsPage.tsx
│   │   └── auth/
│   │       └── pages/
│   │           └── LoginPage.tsx
│   │
│   ├── services/           # API service layer
│   │   ├── api.ts         # Axios instance
│   │   ├── authService.ts
│   │   ├── appointmentService.ts
│   │   ├── staffService.ts
│   │   ├── clinicianService.ts
│   │   ├── patientService.ts
│   │   ├── centreService.ts
│   │   ├── analyticsService.ts
│   │   ├── paymentService.ts
│   │   └── frontDeskBookingService.ts
│   │
│   ├── context/            # React Context
│   │   └── AuthContext.tsx
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts
│   │   └── useDebounce.ts
│   │
│   ├── types/              # TypeScript types
│   │   └── index.ts
│   │
│   ├── utils/              # Utility functions
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   │
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
│
├── public/                 # Public assets
│   └── favicon.ico
│
├── index.html              # HTML template
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite config
├── tailwind.config.js      # Tailwind config
├── postcss.config.js       # PostCSS config
└── README.md               # Documentation
```

---

## Core Features

### 1. Staff Authentication

- **Multi-method Login**: Phone + OTP, Phone + Password, Username + Password
- **Role-Based Access**: Different permissions for different roles
- **Session Management**: JWT tokens with auto-refresh
- **Secure Logout**: Token invalidation

### 2. Dashboard & Analytics

- **Overview Metrics**: Total patients, doctors, appointments, revenue
- **Revenue Analytics**: Daily, weekly, monthly revenue charts
- **Top Doctors**: Performance rankings
- **Lead Sources**: Appointment source distribution
- **Real-time Updates**: Live data refresh

### 3. Appointment Management

- **View All Appointments**: Filterable by date, status, clinician, centre
- **Create Appointments**: Book for patients (front desk)
- **Update Appointments**: Reschedule, change status
- **Cancel Appointments**: With cancellation reason
- **Appointment Details**: Full appointment information
- **Status Tracking**: PENDING, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW

### 4. Clinician Management (Dynamic)

- **Create Clinicians**: Full profile creation form
- **Edit Clinicians**: Update all profile fields
- **View Clinicians**: List with search and filters
- **Delete Clinicians**: Soft delete functionality
- **Toggle Active Status**: Enable/disable clinicians
- **Profile Picture**: URL or file upload
- **Specializations**: Multi-select dropdown (Clinical Psychologist, Therapist, etc.)
- **Qualifications**: Multi-select dropdown (PhD, M.Phil, etc.)
- **Languages**: Multi-select (English, Hindi, Kannada, etc.)
- **Availability Schedule**: Day-wise time slot builder
- **Consultation Fee**: Configurable pricing
- **Experience**: Years of experience

### 5. Staff Management

- **Create Staff**: Add managers, care coordinators, front desk
- **View Staff**: List all staff members
- **Update Staff**: Edit staff details
- **Delete Staff**: Soft delete
- **Role Assignment**: Assign roles (ADMIN, MANAGER, etc.)
- **Centre Assignment**: Assign to specific centres

### 6. Patient Management

- **View Patients**: Search by name, phone
- **Patient Details**: Full profile with medical history
- **Appointment History**: View patient's past appointments
- **Add Medical Notes**: Clinician notes
- **Update Profile**: Edit patient information
- **Emergency Contacts**: Manage emergency contact details

### 7. Centre Management

- **Create Centres**: Add new clinic locations
- **View Centres**: List all centres
- **Update Centres**: Edit centre details
- **Delete Centres**: Remove centres
- **Toggle Active Status**: Enable/disable centres
- **Centre Details**: Address, phone, email, city

### 8. Front Desk Booking

- **Quick Booking**: Fast appointment creation
- **Patient Search**: Find existing patients
- **New Patient**: Create patient on-the-fly
- **Payment Link**: Generate and send via WhatsApp
- **Slot Availability**: Real-time slot checking
- **Confirmation**: Instant booking confirmation

### 9. Payment Management

- **View Payments**: All payment transactions
- **Payment Details**: Transaction information
- **Payment Links**: Create and send payment links
- **Payment Status**: Track payment status
- **Refunds**: Process refunds (future)

### 10. Notifications

- **Appointment Confirmations**: Send via WhatsApp
- **Appointment Reminders**: Scheduled reminders
- **Payment Links**: Send payment links
- **Notification History**: Track all notifications
- **Notification Stats**: Success/failure rates

---

## User Roles & Permissions

### 1. ADMIN (Role ID: 1)

**Full System Access**

- ✅ All staff management
- ✅ All clinician management
- ✅ All centre management
- ✅ All appointment management
- ✅ All patient management
- ✅ All analytics
- ✅ All payment management
- ✅ All notification management

### 2. MANAGER (Role ID: 2)

**Management Access**

- ✅ View staff
- ✅ Create/edit clinicians
- ✅ Create/edit centres
- ✅ All appointment management
- ✅ All patient management
- ✅ Analytics
- ✅ Payment management
- ✅ Notifications

### 3. CLINICIAN (Role ID: 3)

**Clinical Access**

- ✅ View own appointments
- ✅ View patient details
- ✅ Add medical notes
- ❌ Create appointments
- ❌ Staff management
- ❌ Analytics

### 4. CENTRE_MANAGER (Role ID: 4)

**Centre-Specific Access**

- ✅ View/edit own centre
- ✅ Create/edit clinicians (own centre)
- ✅ Appointment management (own centre)
- ✅ Patient management (own centre)
- ✅ Analytics (own centre)
- ❌ Other centres
- ❌ Staff management

### 5. CARE_COORDINATOR (Role ID: 5)

**Appointment Coordination**

- ✅ Create appointments
- ✅ Update appointments
- ✅ Cancel appointments
- ✅ View patients
- ✅ Payment links
- ❌ Staff management
- ❌ Analytics

### 6. FRONT_DESK (Role ID: 6)

**Front Desk Operations**

- ✅ Create appointments
- ✅ View appointments
- ✅ Cancel appointments
- ✅ Search patients
- ✅ Payment links
- ❌ Edit clinicians
- ❌ Analytics

---

## Key Pages

### 1. Dashboard (`/dashboard`)

- Overview cards (patients, doctors, appointments, revenue)
- Revenue chart
- Top doctors table
- Lead sources pie chart
- Recent appointments list

### 2. Appointments (`/appointments`)

- Appointments table with filters
- Create appointment button
- Status badges
- Action buttons (view, edit, cancel)
- Search and filter options

### 3. Clinicians (`/clinicians`)

- Clinicians table
- Create clinician button
- Edit/view clinician modal
- Delete confirmation
- Toggle active status
- Profile pictures
- Specialization badges

### 4. Staff (`/staff`)

- Staff table
- Create staff button
- Role badges
- Centre assignment
- Edit/delete actions

### 5. Patients (`/patients`)

- Patients table
- Search by name/phone
- Patient details modal
- Appointment history
- Medical notes

### 6. Centres (`/centres`)

- Centres table
- Create centre button
- Edit/delete actions
- Active status toggle
- City filter

### 7. Analytics (`/analytics`)

- Dashboard metrics
- Revenue charts
- Top doctors
- Lead sources
- Date range filters

### 8. Login (`/login`)

- Phone/username input
- Password input
- OTP option
- Remember me
- Forgot password

---

## API Integration

### Authentication APIs

```typescript
// Login with Phone + Password
POST /api/auth/login/phone-password
Body: { phone: string, password: string }

// Login with Username + Password
POST /api/auth/login/username-password
Body: { username: string, password: string }

// Login with Phone + OTP
POST /api/auth/send-otp
Body: { phone: string }

POST /api/auth/login/phone-otp
Body: { phone: string, otp: string }

// Get Current User
GET /api/auth/me
Headers: { Authorization: Bearer <token> }
```

### Appointment APIs

```typescript
// Get Appointments
GET /api/appointments?centreId=1&clinicianId=5&status=CONFIRMED
Headers: { Authorization: Bearer <token> }

// Create Appointment
POST /api/appointments
Body: {
  patientId: number,
  clinicianId: number,
  centreId: number,
  appointmentDate: string,
  appointmentTime: string,
  sessionType: 'ONLINE' | 'IN_PERSON',
  consultationFee: number
}

// Update Appointment
PUT /api/appointments/:id
Body: {
  appointmentDate?: string,
  appointmentTime?: string,
  status?: string
}

// Cancel Appointment
DELETE /api/appointments/:id
Body: { reason: string }
```

### Clinician APIs

```typescript
// Get Clinicians
GET /api/clinicians?centreId=1&specialization=Clinical%20Psychologist
Headers: { Authorization: Bearer <token> }

// Create Clinician
POST /api/clinicians
Body: {
  fullName: string,
  phone: string,
  email: string,
  password: string,
  primaryCentreId: number,
  specialization: string[],
  qualification: string[],
  yearsOfExperience: number,
  consultationFee: number,
  languages: string[],
  profilePictureUrl?: string,
  defaultConsultationDurationMinutes: number
}

// Update Clinician
PUT /api/clinicians/:id
Body: { /* any clinician fields */ }

// Delete Clinician
DELETE /api/clinicians/:id

// Update Availability
PUT /api/clinicians/:id/availability
Body: {
  availabilityRules: [
    {
      dayOfWeek: 'MONDAY',
      startTime: '09:00:00',
      endTime: '17:00:00',
      isAvailable: true
    }
  ]
}
```

### Staff APIs

```typescript
// Get Staff
GET /api/users?roleId=2&centreId=1
Headers: { Authorization: Bearer <token> }

// Create Staff
POST /api/users
Body: {
  fullName: string,
  phone: string,
  email: string,
  password: string,
  roleId: number,
  centreId?: number
}

// Update Staff
PUT /api/users/:id
Body: { /* any staff fields */ }

// Delete Staff
DELETE /api/users/:id
```

### Patient APIs

```typescript
// Get Patients
GET /api/patients?search=Jane&phone=9876543210
Headers: { Authorization: Bearer <token> }

// Get Patient Details
GET /api/patients/:id
Headers: { Authorization: Bearer <token> }

// Get Patient Appointments
GET /api/patients/:id/appointments
Headers: { Authorization: Bearer <token> }

// Add Medical Note
POST /api/patients/:id/notes
Body: { note: string, appointmentId: number }
```

### Centre APIs

```typescript
// Get Centres
GET /api/centres?city=bangalore
Headers: { Authorization: Bearer <token> }

// Create Centre
POST /api/centres
Body: {
  name: string,
  city: string,
  address: string,
  phone: string,
  email: string
}

// Update Centre
PUT /api/centres/:id
Body: { /* any centre fields */ }

// Delete Centre
DELETE /api/centres/:id
```

### Analytics APIs

```typescript
// Get Dashboard Metrics
GET /api/analytics/dashboard?centreId=1
Headers: { Authorization: Bearer <token> }

// Get Top Doctors
GET /api/analytics/top-doctors?limit=10&centreId=1
Headers: { Authorization: Bearer <token> }

// Get Revenue Data
GET /api/analytics/revenue?period=month&centreId=1
Headers: { Authorization: Bearer <token> }

// Get Leads by Source
GET /api/analytics/leads-by-source?centreId=1
Headers: { Authorization: Bearer <token> }
```

### Payment APIs

```typescript
// Create Payment Link
POST /api/payments/create-link
Body: {
  appointmentId: number,
  amount: number,
  customerName: string,
  customerPhone: string,
  customerEmail?: string
}

// Verify Payment Link
GET /api/payments/verify/:paymentLinkId
Headers: { Authorization: Bearer <token> }
```

---

## State Management

### Auth Context

```typescript
interface AuthContextType {
  user: StaffUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  hasRole: (roles: string[]) => boolean;
}
```

---

## Routing

### Public Routes

- `/login` - Login page

### Protected Routes (Require Authentication)

- `/dashboard` - Dashboard
- `/appointments` - Appointments management
- `/clinicians` - Clinician management
- `/staff` - Staff management
- `/patients` - Patient management
- `/centres` - Centre management
- `/analytics` - Analytics

### Role-Protected Routes

```typescript
<Route
  path="/staff"
  element={
    <RoleGuard allowedRoles={['ADMIN']}>
      <StaffPage />
    </RoleGuard>
  }
/>
```

---

## Environment Variables

```env
# API Base URL
VITE_API_BASE_URL=http://localhost:5000/api

# Environment
VITE_NODE_ENV=development
```

---

## Build & Deployment

### Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:5174)
```

### Production Build

```bash
npm run build        # Build for production
npm run preview      # Preview production build
```

### Deployment (Vercel)

- Platform: Vercel
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables: Set in Vercel dashboard

---

## Custom Components

### 1. MultiSelect

Multi-select dropdown for specializations, qualifications, languages

```tsx
<MultiSelect
  options={["Clinical Psychologist", "Therapist", "Psychiatrist"]}
  value={selectedSpecializations}
  onChange={setSelectedSpecializations}
  placeholder="Select specializations"
/>
```

### 2. ProfilePictureUpload

Upload profile picture via URL or file

```tsx
<ProfilePictureUpload
  value={profilePictureUrl}
  onChange={setProfilePictureUrl}
/>
```

### 3. AvailabilityScheduleBuilder

Build clinician availability schedule

```tsx
<AvailabilityScheduleBuilder
  value={availabilityRules}
  onChange={setAvailabilityRules}
/>
```

---

## Security Features

### Authentication

- JWT token storage in localStorage
- Automatic token refresh
- Secure token transmission (HTTPS)
- Role-based access control

### Authorization

- Route-level protection
- Component-level protection
- API-level protection (backend)

### Input Validation

- Client-side validation
- Server-side validation (backend)
- XSS prevention

---

## Performance Optimization

### Code Splitting

- Lazy loading for routes
- Dynamic imports for heavy components

### Caching

- Local storage for auth tokens
- Session storage for form data

### Bundle Size

- Tree shaking (Vite)
- Minification (production build)
- Gzip compression

---

## Styling Guidelines

### Tailwind CSS Classes

- **Colors**: Primary (blue), Secondary (gray), Success (green), Error (red), Warning (yellow)
- **Spacing**: Consistent padding and margins
- **Typography**: Font sizes and weights
- **Responsive**: Mobile-first breakpoints

### Component Styling

```tsx
// Table Example
<table className="min-w-full divide-y divide-gray-200">
  <thead className="bg-gray-50">
    <tr>
      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
        Name
      </th>
    </tr>
  </thead>
</table>

// Badge Example
<span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
  Active
</span>
```

---

## Testing

### Unit Tests (Future)

- Jest + React Testing Library
- Component testing
- Hook testing

### E2E Tests (Future)

- Cypress or Playwright
- Admin flow testing
- RBAC testing

---

## Accessibility

### WCAG 2.1 Compliance

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Future Enhancements

1. **Advanced Analytics**: More detailed reports and charts
2. **Bulk Operations**: Bulk import/export of data
3. **Audit Logs**: Track all system changes
4. **Email Notifications**: Email alerts for important events
5. **SMS Notifications**: SMS alerts via Twilio
6. **Advanced Filters**: More filtering options
7. **Export Reports**: PDF/Excel export
8. **Calendar View**: Calendar-based appointment view
9. **Dark Mode**: Theme switching
10. **Mobile App**: Native mobile app for admin

---

## Support & Documentation

- **API Documentation**: See `backend/API_DOCUMENTATION.md`
- **Backend Overview**: See `backend/BACKEND_OVERVIEW.md`
- **Deployment Guide**: `DEPLOY_NOW.md`

---

**Last Updated**: March 15, 2024  
**Version**: 1.0.0
