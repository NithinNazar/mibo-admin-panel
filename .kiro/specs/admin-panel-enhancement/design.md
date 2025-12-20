# Design Document

## Overview

The Mibo Care Admin Panel Enhancement project focuses on integrating the existing React frontend with the Express backend API, implementing role-based authentication, and building comprehensive features for managing centres, clinicians, appointments, and patients. The system will provide calendar-based views for clinician availability and appointment booking, ensuring seamless data flow between frontend and backend while maintaining strict adherence to the database schema.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Auth Module  │  │ Appointments │  │  Clinicians  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Centres    │  │   Patients   │  │  Dashboard   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                    HTTP/REST API
                            │
┌─────────────────────────────────────────────────────────────┐
│                   Express Backend API                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Auth Routes  │  │ Appointment  │  │  Clinician   │     │
│  │              │  │   Routes     │  │   Routes     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │Centre Routes │  │Patient Routes│  │Analytics Rts │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                      PostgreSQL
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Database Schema                        │
│  users, roles, user_roles, centres, patient_profiles,      │
│  clinician_profiles, clinician_availability_rules,          │
│  appointments, appointment_status_history, payments         │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**

- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- Axios for API communication
- Context API for state management

**Backend:**

- Express.js with TypeScript
- PostgreSQL database
- JWT for authentication
- bcrypt for password hashing

**Integration:**

- RESTful API communication
- JWT token-based authentication
- Automatic token refresh on expiry

## Components and Interfaces

### Frontend Services

#### API Service (`src/services/api.ts`)

- Axios instance with base URL configuration
- Request interceptor for adding JWT tokens
- Response interceptor for automatic token refresh
- Error handling for 401 unauthorized responses

#### Auth Service (`src/services/authService.ts`)

- `sendOTP(phone: string)`: Send OTP to phone number
- `loginWithPhoneOTP(phone, otp)`: Authenticate with phone and OTP
- `loginWithPhonePassword(phone, password)`: Authenticate with phone and password
- `loginWithUsernamePassword(username, password)`: Authenticate with username and password
- `refreshToken(refreshToken)`: Get new access token
- `logout()`: Clear session and revoke tokens
- `getCurrentUser()`: Fetch current user details

#### Clinician Service (`src/services/clinicianService.ts`)

- `getClinicians(filters)`: Fetch clinicians list with optional filters
- `getClinicianById(id)`: Get clinician details
- `createClinician(data)`: Create new clinician profile
- `updateClinician(id, data)`: Update clinician information
- `deleteClinician(id)`: Soft delete clinician
- `getAvailability(clinicianId, centreId, date)`: Get available slots
- `setAvailability(clinicianId, rules)`: Set availability rules

#### Appointment Service (`src/services/appointmentService.ts`)

- `getAppointments(filters)`: Fetch appointments with filters
- `getAppointmentById(id)`: Get appointment details
- `createAppointment(data)`: Book new appointment
- `updateAppointment(id, data)`: Update appointment
- `cancelAppointment(id, reason)`: Cancel appointment
- `checkAvailability(clinicianId, centreId, date)`: Check slot availability
- `getMyAppointments()`: Get clinician's own appointments (for CLINICIAN role)

#### Centre Service (`src/services/centreService.ts`)

- `getCentres()`: Fetch all centres
- `getCentreById(id)`: Get centre details
- `createCentre(data)`: Create new centre
- `updateCentre(id, data)`: Update centre information
- `deleteCentre(id)`: Soft delete centre

#### Patient Service (`src/services/patientService.ts`)

- `getPatients(search)`: Fetch patients with search
- `getPatientById(id)`: Get patient details
- `createPatient(data)`: Create new patient
- `updatePatient(id, data)`: Update patient information
- `getPatientAppointments(id)`: Get patient's appointment history

#### Analytics Service (`src/services/analyticsService.ts`)

- `getDashboardMetrics()`: Fetch dashboard statistics
- `getTopDoctors()`: Get top performing clinicians
- `getRevenueData(period)`: Get revenue trends
- `getLeadsBySource()`: Get appointment sources

### Frontend Components

#### Calendar Components

**AvailabilityCalendar**

- Props: `clinicianId`, `centreId`, `onSlotSelect`
- Displays monthly calendar view
- Shows available, booked, and blocked slots
- Color-coded slot status indicators
- Click to select available slot

**SlotGrid**

- Props: `date`, `slots`, `onSlotClick`
- Displays time slots for a specific date
- Grid layout with time labels
- Visual distinction for slot status
- Shows appointment details for booked slots

**WeekView**

- Props: `clinicianId`, `centreId`, `startDate`
- Displays week-long schedule
- Column per day, rows for time slots
- Compact view for quick overview

#### Appointment Components

**AppointmentBookingForm**

- Multi-step form for booking appointments
- Step 1: Select centre
- Step 2: Select clinician
- Step 3: Select date and time slot
- Step 4: Select session type (IN_PERSON/ONLINE)
- Step 5: Select or create patient
- Step 6: Add notes and confirm

**AppointmentList**

- Filterable list of appointments
- Filters: centre, clinician, date, status
- Sortable columns
- Quick actions: view, cancel, reschedule

**AppointmentDetails**

- Complete appointment information
- Patient contact details
- Clinician information
- Centre location
- Status history
- Action buttons based on role

#### Clinician Components

**ClinicianList**

- Searchable and filterable list
- Display cards with photo, name, specialization
- Quick view of availability status
- Actions: view, edit, manage availability

**ClinicianForm**

- Create/edit clinician profile
- Fields: name, specialization, registration number, experience, fee
- Primary centre selection
- Profile picture upload

**AvailabilityManager**

- Manage availability rules per centre
- Add/edit/delete rules
- Day of week selector
- Time range picker
- Slot duration input
- Session mode selector (IN_PERSON/ONLINE)

### Backend API Endpoints

#### Authentication Endpoints

**POST /api/auth/send-otp**

- Request: `{ phone: string }`
- Response: `{ message: string }`
- Generates 6-digit OTP, stores hash in database
- Sets expiry to 10 minutes

**POST /api/auth/login/phone-otp**

- Request: `{ phone: string, otp: string }`
- Response: `{ user: User, accessToken: string, refreshToken: string }`
- Verifies OTP, marks as used
- Generates JWT tokens
- Returns user with roles and centres

**POST /api/auth/login/phone-password**

- Request: `{ phone: string, password: string }`
- Response: `{ user: User, accessToken: string, refreshToken: string }`
- Verifies password hash
- Filters for user_type = 'STAFF'

**POST /api/auth/login/username-password**

- Request: `{ username: string, password: string }`
- Response: `{ user: User, accessToken: string, refreshToken: string }`
- Verifies username and password
- Filters for user_type = 'STAFF'

**POST /api/auth/refresh**

- Request: `{ refreshToken: string }`
- Response: `{ accessToken: string }`
- Validates refresh token
- Generates new access token

**POST /api/auth/logout**

- Headers: `Authorization: Bearer {token}`
- Response: `{ message: string }`
- Revokes refresh token

**GET /api/auth/me**

- Headers: `Authorization: Bearer {token}`
- Response: `User` object
- Returns current user with roles

#### Clinician Endpoints

**GET /api/clinicians**

- Query params: `?centreId=123&specialization=therapy`
- Response: Array of clinician objects
- Includes user details, primary centre, consultation fee

**POST /api/clinicians**

- Permissions: ADMIN, MANAGER, CENTRE_MANAGER
- Request: Clinician profile data
- Response: Created clinician object

**PUT /api/clinicians/:id**

- Permissions: ADMIN, MANAGER, CENTRE_MANAGER
- Request: Partial clinician data
- Response: Updated clinician object

**DELETE /api/clinicians/:id**

- Permissions: ADMIN, MANAGER, CENTRE_MANAGER
- Response: Success message
- Soft delete (sets is_active = false)

**GET /api/clinicians/:id/availability**

- Query params: `?centreId=123&date=2024-01-15`
- Response: Array of time slots with status
- Calculates slots from availability rules

**POST /api/clinicians/:id/availability**

- Permissions: ADMIN, MANAGER, CENTRE_MANAGER
- Request: Array of availability rules
- Response: Created rules
- Each rule: day_of_week, start_time, end_time, slot_duration_minutes, mode, centre_id

#### Appointment Endpoints

**GET /api/appointments**

- Query params: `?centreId=123&clinicianId=456&date=2024-01-15&status=BOOKED`
- Response: Array of appointments
- Includes patient, clinician, and centre details

**POST /api/appointments**

- Permissions: ADMIN, MANAGER, CARE_COORDINATOR, FRONT_DESK
- Request: Appointment data
- Response: Created appointment
- Validates slot availability
- Checks for conflicts

**PUT /api/appointments/:id**

- Permissions: ADMIN, MANAGER, CARE_COORDINATOR
- Request: Partial appointment data
- Response: Updated appointment
- Logs status changes in history table

**DELETE /api/appointments/:id**

- Permissions: ADMIN, MANAGER, CARE_COORDINATOR, FRONT_DESK
- Request: `{ reason: string }`
- Response: Success message
- Sets status to CANCELLED

**GET /api/appointments/my-appointments**

- Permissions: CLINICIAN
- Response: `{ current: [], upcoming: [], past: [], summary: {} }`
- Filters appointments for logged-in clinician
- Categorizes by date

#### Centre Endpoints

**GET /api/centres**

- Response: Array of centre objects
- All authenticated users can access

**POST /api/centres**

- Permissions: ADMIN, MANAGER
- Request: Centre data
- Response: Created centre
- Validates city is bangalore, kochi, or mumbai

**PUT /api/centres/:id**

- Permissions: ADMIN, MANAGER, CENTRE_MANAGER
- Request: Partial centre data
- Response: Updated centre

**DELETE /api/centres/:id**

- Permissions: ADMIN
- Response: Success message
- Soft delete

#### Patient Endpoints

**GET /api/patients**

- Query params: `?search=name`
- Response: Array of patient objects
- Searches by name or phone

**POST /api/patients**

- Permissions: ADMIN, MANAGER, CARE_COORDINATOR, FRONT_DESK
- Request: Patient data
- Response: Created patient
- Creates user with user_type = 'PATIENT'

**GET /api/patients/:id**

- Response: Patient details with appointments and notes

**PUT /api/patients/:id**

- Request: Partial patient data
- Response: Updated patient

#### Analytics Endpoints

**GET /api/analytics/dashboard**

- Permissions: ADMIN, MANAGER, CENTRE_MANAGER
- Response: Dashboard metrics object
- Includes counts and percentage changes

**GET /api/analytics/top-doctors**

- Permissions: ADMIN, MANAGER, CENTRE_MANAGER
- Response: Array of top clinicians by patient count

**GET /api/analytics/revenue**

- Query params: `?period=month`
- Permissions: ADMIN, MANAGER, CENTRE_MANAGER
- Response: Array of date-value pairs

**GET /api/analytics/leads-by-source**

- Permissions: ADMIN, MANAGER, CENTRE_MANAGER
- Response: Array of source-count pairs

## Data Models

### User Model (Frontend)

```typescript
interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  username?: string;
  role: UserRole;
  avatar?: string;
  centreIds: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

type UserRole =
  | "admin"
  | "manager"
  | "centre_manager"
  | "clinician"
  | "care_coordinator"
  | "front_desk";
```

### Clinician Model (Frontend)

```typescript
interface Clinician {
  id: string;
  userId: string;
  name: string;
  specialization: string;
  registrationNumber: string;
  yearsOfExperience: number;
  primaryCentreId: string;
  primaryCentreName: string;
  consultationFee: number;
  bio?: string;
  consultationModes: ("IN_PERSON" | "ONLINE")[];
  defaultDuration: number;
  profilePictureUrl?: string;
  isActive: boolean;
}

interface AvailabilityRule {
  id: string;
  clinicianId: string;
  centreId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  slotDurationMinutes: number;
  mode: "IN_PERSON" | "ONLINE";
  isActive: boolean;
}

interface TimeSlot {
  id: string;
  clinicianId: string;
  centreId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: "available" | "booked" | "blocked";
  appointmentId?: string;
  mode: "IN_PERSON" | "ONLINE";
}
```

### Appointment Model (Frontend)

```typescript
interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  clinicianId: string;
  clinicianName: string;
  centreId: string;
  centreName: string;
  centreAddress: string;
  appointmentType:
    | "IN_PERSON"
    | "ONLINE"
    | "INPATIENT_ASSESSMENT"
    | "FOLLOW_UP";
  scheduledStartAt: Date;
  scheduledEndAt: Date;
  durationMinutes: number;
  status:
    | "BOOKED"
    | "CONFIRMED"
    | "RESCHEDULED"
    | "COMPLETED"
    | "CANCELLED"
    | "NO_SHOW";
  notes?: string;
  bookedByUserId: string;
  bookedByUserName: string;
  source:
    | "WEB_PATIENT"
    | "ADMIN_FRONT_DESK"
    | "ADMIN_CARE_COORDINATOR"
    | "ADMIN_MANAGER";
  createdAt: Date;
  updatedAt: Date;
}
```

### Centre Model (Frontend)

```typescript
interface Centre {
  id: string;
  name: string;
  city: "bangalore" | "kochi" | "mumbai";
  addressLine1: string;
  addressLine2?: string;
  pincode: string;
  contactPhone: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Patient Model (Frontend)

```typescript
interface Patient {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  email?: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other";
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Database Schema Mapping

**Critical Column Names (must match exactly):**

- `clinician_profiles.years_of_experience` (NOT experience_years)
- `clinician_availability_rules.mode` (NOT consultation_mode)
- `clinician_availability_rules.centre_id` (REQUIRED, NOT NULL)
- `users.user_type` (PATIENT or STAFF)
- `appointments.appointment_type` (IN_PERSON, ONLINE, INPATIENT_ASSESSMENT, FOLLOW_UP)
- `appointments.status` (BOOKED, CONFIRMED, RESCHEDULED, COMPLETED, CANCELLED, NO_SHOW)

## Error Handling

### Frontend Error Handling

**API Error Response Format:**

```typescript
interface ApiError {
  success: false;
  message: string;
  errors?: string[];
}
```

**Error Handling Strategy:**

1. Network errors: Display "Connection failed" message
2. 400 Bad Request: Show validation errors from response
3. 401 Unauthorized: Attempt token refresh, redirect to login if fails
4. 403 Forbidden: Show "Access denied" message
5. 404 Not Found: Show "Resource not found" message
6. 409 Conflict: Show specific conflict message (e.g., "Slot already booked")
7. 500 Server Error: Show "Server error, please try again" message

**Error Display:**

- Toast notifications for transient errors
- Inline form validation errors
- Modal dialogs for critical errors
- Error boundaries for component crashes

### Backend Error Handling

**Validation Errors:**

- Use express-validator for input validation
- Return 400 with detailed error messages
- Include field-specific errors in response

**Authentication Errors:**

- Return 401 for invalid/expired tokens
- Return 403 for insufficient permissions
- Clear error messages without exposing security details

**Business Logic Errors:**

- Return 409 for scheduling conflicts
- Return 404 for non-existent resources
- Include actionable error messages

**Database Errors:**

- Catch and log database errors
- Return 500 with generic message to client
- Log detailed error for debugging

## Testing Strategy

### Unit Testing

**Frontend Unit Tests:**

- Service functions (API calls, data transformation)
- Utility functions (date formatting, validation)
- Component logic (form validation, state management)
- Use Vitest as testing framework
- Mock API responses with MSW (Mock Service Worker)

**Backend Unit Tests:**

- Route handlers
- Middleware functions
- Database query functions
- Validation logic
- Use Jest as testing framework
- Mock database with pg-mock

**Test Coverage Goals:**

- Services: 80% coverage
- Utilities: 90% coverage
- Critical paths: 100% coverage

### Integration Testing

**API Integration Tests:**

- Test complete request-response cycles
- Verify authentication flow
- Test role-based access control
- Validate data persistence
- Use supertest for HTTP assertions

**Database Integration Tests:**

- Test database queries with test database
- Verify foreign key constraints
- Test transaction rollbacks
- Validate data integrity

### End-to-End Testing

**User Workflows:**

- Complete authentication flow (all 3 methods)
- Book appointment workflow
- Create clinician with availability
- View calendar and select slots
- Cancel and reschedule appointments
- Use Playwright or Cypress
- Run against staging environment

**Test Scenarios:**

- Admin creates centre and clinician
- Front desk books appointment for patient
- Clinician views their appointments
- Manager views analytics dashboard
- User session expires and refreshes token

### Manual Testing Checklist

**Authentication:**

- [ ] Login with phone + OTP
- [ ] Login with phone + password
- [ ] Login with username + password
- [ ] Token refresh on expiry
- [ ] Logout clears session
- [ ] Unauthorized access redirects to login

**Clinician Management:**

- [ ] Create clinician with all required fields
- [ ] Set availability rules for multiple centres
- [ ] View clinician list with filters
- [ ] Update clinician profile
- [ ] Delete clinician (soft delete)

**Appointment Booking:**

- [ ] Select centre, then clinician
- [ ] View calendar with available slots
- [ ] Book IN_PERSON appointment
- [ ] Book ONLINE appointment
- [ ] Prevent double-booking
- [ ] Cancel appointment

**Calendar Views:**

- [ ] Monthly calendar shows correct slots
- [ ] Available slots are clickable
- [ ] Booked slots show patient info
- [ ] Blocked slots are not selectable
- [ ] Filter by centre updates slots

**Role-Based Access:**

- [ ] Admin can access all features
- [ ] Manager can create centres and clinicians
- [ ] Centre Manager can manage their centre
- [ ] Clinician can only view own appointments
- [ ] Front Desk can book appointments
- [ ] Unauthorized actions show error

**Data Integrity:**

- [ ] Database column names match exactly
- [ ] Appointment types use correct enum values
- [ ] Status values match database constraints
- [ ] User types are PATIENT or STAFF
- [ ] Centre cities are bangalore, kochi, or mumbai

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Authentication Properties

**Property 1: OTP generation and storage**
_For any_ valid phone number, when requesting an OTP, the system should generate a 6-digit code, store its hash in the database, and set expiry to 10 minutes from creation time.
**Validates: Requirements 1.1**

**Property 2: OTP authentication within time window**
_For any_ valid phone number and matching OTP within 10 minutes of generation, authentication should succeed and return access token, refresh token, and user data.
**Validates: Requirements 1.2**

**Property 3: Phone-password authentication**
_For any_ valid phone-password combination where user_type is STAFF, authentication should succeed and return tokens and user data.
**Validates: Requirements 1.3**

**Property 4: Username-password authentication**
_For any_ valid username-password combination where user_type is STAFF, authentication should succeed and return tokens and user data.
**Validates: Requirements 1.4**

**Property 5: Token storage on successful authentication**
_For any_ successful authentication (regardless of method), the system should store accessToken, refreshToken, and user data in localStorage.
**Validates: Requirements 1.5**

**Property 6: Automatic token refresh**
_For any_ API request that receives 401 Unauthorized, the system should attempt to refresh the access token using the stored refresh token and retry the original request.
**Validates: Requirements 1.7**

**Property 7: Redirect on refresh failure**
_For any_ failed token refresh attempt, the system should clear localStorage and redirect to the login page.
**Validates: Requirements 1.8**

### Centre Management Properties

**Property 8: Centre list displays required fields**
_For any_ set of centres retrieved from the API, the rendered list should display name, city, address, and contact information for each centre.
**Validates: Requirements 2.1**

**Property 9: City validation**
_For any_ centre creation or update request, if the city value is not one of bangalore, kochi, or mumbai, the system should reject the request with a validation error.
**Validates: Requirements 2.2**

**Property 10: Required fields validation for centres**
_For any_ centre creation request missing name, city, addressLine1, pincode, or contactPhone, the system should reject the request with a validation error.
**Validates: Requirements 2.3**

**Property 11: Centre creation persistence**
_For any_ successfully created centre, querying the centres list immediately after should include the newly created centre.
**Validates: Requirements 2.4**

**Property 12: Centre update persistence**
_For any_ centre update, querying the centre by ID immediately after should return the updated values.
**Validates: Requirements 2.5**

**Property 13: Soft delete for centres**
_For any_ centre deletion request, the system should set is_active to false rather than removing the database record.
**Validates: Requirements 2.6**

### Clinician Management Properties

**Property 14: Required fields validation for clinicians**
_For any_ clinician creation request missing name, specialization, registrationNumber, yearsOfExperience, primaryCentreId, or consultationFee, the system should reject the request with a validation error.
**Validates: Requirements 3.1**

**Property 15: Availability rules association**
_For any_ clinician creation with availability rules, the system should store all provided rules associated with the clinician ID.
**Validates: Requirements 3.2**

**Property 16: Required fields validation for availability rules**
_For any_ availability rule missing dayOfWeek, startTime, endTime, slotDurationMinutes, mode, or centreId, the system should reject the request with a validation error.
**Validates: Requirements 3.3**

**Property 17: Slot generation from availability rules**
_For any_ valid availability rule, the system should generate time slots where the number of slots equals (endTime - startTime) / slotDurationMinutes, and each slot's start time is correctly calculated.
**Validates: Requirements 3.4**

**Property 18: Clinician list displays required fields**
_For any_ set of clinicians retrieved from the API, the rendered list should display name, specialization, yearsOfExperience, primaryCentreName, and consultationFee for each clinician.
**Validates: Requirements 3.7**

### Calendar and Slot Properties

**Property 19: Available slot visual indicator**
_For any_ time slot with status 'available', the rendered slot should have a CSS class or attribute indicating it is free and clickable.
**Validates: Requirements 4.2**

**Property 20: Booked slot displays patient information**
_For any_ time slot with status 'booked', the rendered slot should display the associated patient name and appointment details.
**Validates: Requirements 4.3**

**Property 21: Blocked slot visual indicator**
_For any_ time slot with status 'blocked', the rendered slot should have a CSS class or attribute indicating it is unavailable and not clickable.
**Validates: Requirements 4.4**

**Property 22: Date filtering for slots**
_For any_ selected date in the calendar, the displayed slots should only include slots where the slot date matches the selected date.
**Validates: Requirements 4.5**

**Property 23: Centre filtering for slots**
_For any_ selected centre filter, the displayed slots should only include slots where the slot centreId matches the selected centre.
**Validates: Requirements 4.6**

**Property 24: Slot information completeness**
_For any_ displayed time slot, the rendered output should include slot duration and session mode (IN_PERSON or ONLINE).
**Validates: Requirements 4.7**

### Appointment Booking Properties

**Property 25: Cascading clinician selection**
_For any_ selected centre, the displayed clinicians list should only include clinicians where the centre is in their assigned centres.
**Validates: Requirements 5.2**

**Property 26: Cascading slot selection**
_For any_ selected clinician, the system should load and display available time slots for that clinician.
**Validates: Requirements 5.3**

**Property 27: Date filtering for appointment slots**
_For any_ selected date in the booking flow, the displayed slots should only include slots for that clinician on that specific date.
**Validates: Requirements 5.4**

**Property 28: Required fields validation for appointments**
_For any_ appointment booking request missing patientId, sessionType, or timeSlot, the system should reject the request with a validation error.
**Validates: Requirements 5.5**

**Property 29: Session mode validation**
_For any_ appointment booking request, if the selected sessionType is not in the clinician's supported consultation modes, the system should reject the request with a validation error.
**Validates: Requirements 5.6**

**Property 30: Slot status update on booking**
_For any_ successfully booked appointment, querying the time slot immediately after should show status 'booked' and include the appointment ID.
**Validates: Requirements 5.7**

**Property 31: Conflict prevention**
_For any_ appointment booking request for a slot that is already booked, the system should reject the request with a conflict error.
**Validates: Requirements 5.8**

### Patient Management Properties

**Property 32: Patient list displays required fields**
_For any_ set of patients retrieved from the API, the rendered list should display fullName, phone, email, dateOfBirth, and gender for each patient.
**Validates: Requirements 6.1**

**Property 33: Patient search filtering**
_For any_ search query, the returned patients should only include those where fullName contains the query or phone contains the query.
**Validates: Requirements 6.2**

**Property 34: Required fields validation for patients**
_For any_ patient creation request missing fullName or phone, the system should reject the request with a validation error.
**Validates: Requirements 6.3**

**Property 35: Optional fields acceptance**
_For any_ patient creation request with only required fields (fullName and phone), the system should successfully create the patient.
**Validates: Requirements 6.4**

**Property 36: Patient user type enforcement**
_For any_ created patient, querying the associated user record should show user_type = 'PATIENT'.
**Validates: Requirements 6.5**

**Property 37: Patient details completeness**
_For any_ patient details view, the displayed information should include appointment history and medical notes.
**Validates: Requirements 6.6**

### Appointment Management Properties

**Property 38: Appointment list displays required fields**
_For any_ set of appointments retrieved from the API, the rendered list should display patientName, clinicianName, centreName, date, time, status, and appointmentType for each appointment.
**Validates: Requirements 7.1**

**Property 39: Centre filtering for appointments**
_For any_ selected centre filter, the displayed appointments should only include appointments where centreId matches the selected centre.
**Validates: Requirements 7.2**

**Property 40: Clinician filtering for appointments**
_For any_ selected clinician filter, the displayed appointments should only include appointments where clinicianId matches the selected clinician.
**Validates: Requirements 7.3**

**Property 41: Date filtering for appointments**
_For any_ selected date filter, the displayed appointments should only include appointments where the appointment date matches the selected date.
**Validates: Requirements 7.4**

**Property 42: Status filtering for appointments**
_For any_ selected status filter, the displayed appointments should only include appointments where status matches the selected status.
**Validates: Requirements 7.5**

**Property 43: Appointment cancellation updates**
_For any_ appointment cancellation, the system should update the appointment status to 'CANCELLED' and set the associated time slot status to 'available'.
**Validates: Requirements 7.7**

### Clinician Dashboard Properties

**Property 44: Current appointments filtering**
_For any_ clinician viewing current appointments, the displayed appointments should only include appointments where the scheduled date is today and clinicianId matches the logged-in clinician.
**Validates: Requirements 8.2, 8.6**

**Property 45: Upcoming appointments filtering**
_For any_ clinician viewing upcoming appointments, the displayed appointments should only include appointments where the scheduled date is in the future and clinicianId matches the logged-in clinician.
**Validates: Requirements 8.3, 8.6**

**Property 46: Past appointments filtering**
_For any_ clinician viewing past appointments, the displayed appointments should only include appointments where the scheduled date is in the past and clinicianId matches the logged-in clinician.
**Validates: Requirements 8.4, 8.6**

**Property 47: Clinician appointment information completeness**
_For any_ appointment displayed in the clinician dashboard, the rendered output should include patientName, patientPhone, centreName, date, time, and sessionType.
**Validates: Requirements 8.5**

### Analytics Properties

**Property 48: Top doctors sorting**
_For any_ set of clinicians in the top doctors list, they should be sorted in descending order by patient count.
**Validates: Requirements 9.5**

### Database Schema Compliance Properties

**Property 49: Clinician column name compliance**
_For any_ database query creating or updating clinician profiles, the query should use column name 'years_of_experience' not 'experience_years'.
**Validates: Requirements 10.1**

**Property 50: Availability rule column name compliance**
_For any_ database query creating or updating availability rules, the query should use column name 'mode' not 'consultation_mode'.
**Validates: Requirements 10.2**

**Property 51: Availability rule centre_id requirement**
_For any_ availability rule creation or update, the system should reject requests where centre_id is null or missing.
**Validates: Requirements 10.3**

**Property 52: Consultation modes data type compliance**
_For any_ clinician profile storing consultation modes, the database column should use JSONB data type.
**Validates: Requirements 10.4**

**Property 53: Appointment type enum compliance**
_For any_ appointment creation or update, if appointmentType is not one of IN_PERSON, ONLINE, INPATIENT_ASSESSMENT, or FOLLOW_UP, the system should reject the request.
**Validates: Requirements 10.5**

**Property 54: Appointment status enum compliance**
_For any_ appointment status update, if status is not one of BOOKED, CONFIRMED, RESCHEDULED, COMPLETED, CANCELLED, or NO_SHOW, the system should reject the request.
**Validates: Requirements 10.6**

**Property 55: User type enum compliance**
_For any_ user creation, if user_type is not PATIENT or STAFF, the system should reject the request.
**Validates: Requirements 10.7**
