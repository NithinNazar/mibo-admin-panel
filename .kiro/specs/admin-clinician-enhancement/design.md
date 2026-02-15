# Design Document

## Overview

This design document outlines the technical approach for enhancing the admin panel's clinician creation and appointment slot management features. The solution addresses critical bugs in the clinician creation flow, modernizes the appointment scheduling UI with calendar-based selection, and adds UX improvements including password visibility, field locking, and enhanced loading states.

The design follows a layered architecture with clear separation between the React frontend (Admin Panel), REST API layer (Backend), and PostgreSQL database. Key focus areas include:

1. **API Contract Verification**: Ensuring Request/Response payload consistency between frontend and backend
2. **Calendar-Based UI**: Replacing dropdown-based date selection with an intuitive calendar interface
3. **Enhanced Form UX**: Adding field locking, password visibility, and loading states
4. **Data Integrity**: Proper validation and error handling throughout the stack

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                      Admin Panel (React)                     │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │ CliniciansPage │  │ CalendarPicker   │  │ TimeSlider  │ │
│  │   Component    │  │   Component      │  │  Component  │ │
│  └────────┬───────┘  └────────┬─────────┘  └──────┬──────┘ │
│           │                   │                    │         │
│           └───────────────────┴────────────────────┘         │
│                              │                               │
│                   ┌──────────▼──────────┐                    │
│                   │ ClinicianService    │                    │
│                   │  (API Client)       │                    │
│                   └──────────┬──────────┘                    │
└──────────────────────────────┼───────────────────────────────┘
                               │ HTTP/REST
┌──────────────────────────────▼───────────────────────────────┐
│                    Backend API (Express)                      │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────┐  │
│  │ StaffController│  │  StaffService    │  │ Validation  │  │
│  │                │──│                  │──│   Layer     │  │
│  └────────────────┘  └──────────────────┘  └─────────────┘  │
│                              │                               │
│                   ┌──────────▼──────────┐                    │
│                   │ StaffRepository     │                    │
│                   │                     │                    │
│                   └──────────┬──────────┘                    │
└──────────────────────────────┼───────────────────────────────┘
                               │ SQL
┌──────────────────────────────▼───────────────────────────────┐
│                   PostgreSQL Database                         │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │   users    │  │  clinicians  │  │ clinician_profiles   │ │
│  └────────────┘  └──────────────┘  └──────────────────────┘ │
│  ┌────────────┐  ┌──────────────┐                           │
│  │user_roles  │  │availability_ │                           │
│  │            │  │    rules     │                           │
│  └────────────┘  └──────────────┘                           │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Clinician Creation Flow**:
   - Admin fills form → Field locking → Validation → API request
   - Backend validates → Creates user → Creates clinician → Creates availability slots
   - Response transforms snake_case to camelCase → UI updates

2. **Calendar Selection Flow**:
   - Admin opens calendar → Selects date → Time slider appears
   - Admin sets start time → End time auto-calculated → Slot added to list
   - Multiple slots can be added → All slots sent with clinician creation

## Components and Interfaces

### Frontend Components

#### 1. CalendarPicker Component

**Purpose**: Replace dropdown-based date selection with visual calendar interface

**Props**:

```typescript
interface CalendarPickerProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  markedDates?: Date[]; // Dates with existing slots
  minDate?: Date;
  maxDate?: Date;
}
```

**State**:

```typescript
interface CalendarState {
  currentMonth: Date;
  selectedDate: Date | null;
  hoveredDate: Date | null;
}
```

**Key Methods**:

- `navigateMonth(direction: 'prev' | 'next')`: Navigate between months
- `selectDate(date: Date)`: Handle date selection
- `isDateMarked(date: Date)`: Check if date has existing slots
- `renderCalendarGrid()`: Render the calendar grid with day names

**Styling**:

- Current date: Highlighted with border
- Selected date: Filled background color
- Marked dates (with slots): Badge or dot indicator
- Hover state: Subtle background change

#### 2. TimeSlider Component

**Purpose**: Provide intuitive time selection with slider and AM/PM toggles

**Props**:

```typescript
interface TimeSliderProps {
  value: string; // HH:MM format
  onChange: (time: string) => void;
  sessionLength: number; // Minutes
  label: string;
}
```

**State**:

```typescript
interface TimeSliderState {
  hour: number; // 1-12
  minute: number; // 0, 15, 30, 45
  period: "AM" | "PM";
}
```

**Key Methods**:

- `handleSliderChange(value: number)`: Convert slider value to time
- `togglePeriod()`: Switch between AM/PM
- `calculateEndTime()`: Compute end time based on session length
- `convertTo24Hour()`: Convert 12-hour to 24-hour format
- `convertTo12Hour()`: Convert 24-hour to 12-hour format

**UI Layout**:

```
┌─────────────────────────────────────────────────┐
│  Start Time                                     │
│  ┌───────────────────────────────────────────┐ │
│  │ ●─────────────────────────────────────────│ │ Slider
│  └───────────────────────────────────────────┘ │
│  09:00                                          │
│  ┌────────┐  ┌────────┐                        │
│  │   AM   │  │   PM   │  Toggle buttons        │
│  └────────┘  └────────┘                        │
│  End Time: 09:30 (auto-calculated)             │
└─────────────────────────────────────────────────┘
```

#### 3. FieldLockInput Component

**Purpose**: Wrap input fields with lock/unlock functionality

**Props**:

```typescript
interface FieldLockInputProps {
  label: string;
  value: string | number;
  onChange: (value: string | number) => void;
  type: "text" | "number" | "email" | "tel";
  required?: boolean;
  locked?: boolean;
  onLockToggle?: () => void;
}
```

**State**:

```typescript
interface FieldLockState {
  isLocked: boolean;
  displayValue: string | number;
}
```

**UI States**:

- **Unlocked**: Normal input field + "Add" button
- **Locked**: Greyed out field with value + "Edit" button
- **Validation Error**: Red border + error message

#### 4. LoadingOverlay Component

**Purpose**: Display loading state during async operations

**Props**:

```typescript
interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  minDisplayTime?: number; // Milliseconds (default: 3000)
}
```

**Implementation**:

```typescript
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isVisible,
  message = 'Creating clinician...',
  minDisplayTime = 3000
}) => {
  const [shouldShow, setShouldShow] = useState(false);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (isVisible) {
      startTimeRef.current = Date.now();
      setShouldShow(true);
    } else if (startTimeRef.current) {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, minDisplayTime - elapsed);

      setTimeout(() => {
        setShouldShow(false);
        startTimeRef.current = null;
      }, remaining);
    }
  }, [isVisible, minDisplayTime]);

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-6 rounded-lg flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-blue-900 border-t-blue-500 rounded-full animate-spin" />
        <p className="text-white mt-4">{message}</p>
      </div>
    </div>
  );
};
```

### Backend Components

#### 1. Validation Layer Enhancement

**File**: `backend/src/validations/staff.validation.ts`

**Key Functions**:

```typescript
export function validateCreateClinician(body: any): CreateClinicianDto {
  // Validate user_id or user creation fields
  if (!body.user_id && (!body.full_name || !body.phone || !body.password)) {
    throw ApiError.badRequest(
      "Either provide user_id or full_name, phone, password",
    );
  }

  // Validate primary_centre_id
  if (!body.primary_centre_id) {
    throw ApiError.badRequest("primary_centre_id is required");
  }

  // Validate specialization (must be non-empty array)
  if (!Array.isArray(body.specialization) || body.specialization.length === 0) {
    throw ApiError.badRequest("specialization must be a non-empty array");
  }

  // Validate qualification (must be non-empty array)
  if (!Array.isArray(body.qualification) || body.qualification.length === 0) {
    throw ApiError.badRequest("qualification must be a non-empty array");
  }

  // Validate languages (must be non-empty array)
  if (!Array.isArray(body.languages) || body.languages.length === 0) {
    throw ApiError.badRequest("languages must be a non-empty array");
  }

  // Validate consultation_fee (must be positive)
  if (!body.consultation_fee || body.consultation_fee <= 0) {
    throw ApiError.badRequest("consultation_fee must be a positive number");
  }

  // Validate consultation_modes (must be array with valid values)
  if (!Array.isArray(body.consultation_modes)) {
    throw ApiError.badRequest("consultation_modes must be an array");
  }

  const validModes = ["IN_PERSON", "ONLINE"];
  const invalidModes = body.consultation_modes.filter(
    (mode: string) => !validModes.includes(mode),
  );
  if (invalidModes.length > 0) {
    throw ApiError.badRequest(
      `Invalid consultation modes: ${invalidModes.join(", ")}`,
    );
  }

  return {
    user_id: body.user_id,
    primary_centre_id: Number(body.primary_centre_id),
    specialization: body.specialization,
    registration_number: body.registration_number,
    years_of_experience: Number(body.years_of_experience) || 0,
    consultation_fee: Number(body.consultation_fee),
    bio: body.bio,
    consultation_modes: body.consultation_modes,
    default_consultation_duration_minutes:
      Number(body.default_consultation_duration_minutes) || 30,
    profile_picture_url: body.profile_picture_url,
    qualification: body.qualification,
    expertise: body.expertise || [],
    languages: body.languages,
  };
}
```

#### 2. Service Layer Enhancement

**File**: `backend/src/services/staff.service.ts`

**Enhanced createClinician Method**:

```typescript
async createClinician(body: any) {
  let userId: number;

  // Mode 1: Create new user + clinician
  if (body.full_name && body.phone && body.password && body.role_ids) {
    // Validate user data
    const userDto = validateCreateStaffUser({
      full_name: body.full_name,
      phone: body.phone,
      email: body.email,
      username: body.username,
      password: body.password,
      designation: body.designation || body.specialization[0],
      role_ids: body.role_ids,
      centre_ids: body.centre_ids || [body.primary_centre_id],
    });

    // Check for existing phone
    const existingStaff = await staffRepository.findStaffUsers();
    const phoneExists = existingStaff.some((s: any) => s.phone === userDto.phone);
    if (phoneExists) {
      throw ApiError.conflict("Phone number already registered");
    }

    // Check for existing username
    if (userDto.username) {
      const usernameExists = existingStaff.some(
        (s: any) => s.username === userDto.username
      );
      if (usernameExists) {
        throw ApiError.conflict("Username already taken");
      }
    }

    // Create user
    const newUser = await staffRepository.createStaffUser(
      userDto,
      userDto.role_ids,
      userDto.centre_ids || []
    );
    userId = newUser.user.id;
  }
  // Mode 2: Link existing user
  else if (body.user_id) {
    userId = body.user_id;
    const staff = await staffRepository.findStaffById(userId);
    if (!staff) {
      throw ApiError.badRequest("User must be a staff member");
    }
  } else {
    throw ApiError.badRequest(
      "Provide either user_id or user creation fields"
    );
  }

  // Check if already a clinician
  const existingClinicians = await staffRepository.findClinicians();
  const isAlreadyClinician = existingClinicians.some(
    (c: any) => c.user_id === userId
  );
  if (isAlreadyClinician) {
    throw ApiError.conflict("User already registered as clinician");
  }

  // Validate clinician data
  const clinicianDto = validateCreateClinician({
    user_id: userId,
    primary_centre_id: body.primary_centre_id,
    specialization: body.specialization,
    registration_number: body.registration_number,
    years_of_experience: body.years_of_experience,
    consultation_fee: body.consultation_fee,
    bio: body.bio,
    consultation_modes: body.consultation_modes,
    default_consultation_duration_minutes:
      body.default_consultation_duration_minutes,
    profile_picture_url: body.profile_picture_url,
    qualification: body.qualification,
    expertise: body.expertise,
    languages: body.languages,
  });

  // Create clinician with availability slots
  const clinician = await staffRepository.createClinician(clinicianDto);

  // If availability slots provided, create them
  if (body.availability_slots && Array.isArray(body.availability_slots)) {
    await staffRepository.updateClinicianAvailability(
      clinician.id,
      body.availability_slots
    );
  }

  return clinician;
}
```

#### 3. Response Transformation

**File**: `backend/src/utils/caseTransform.ts`

**Enhanced transformClinicianResponse**:

```typescript
export function transformClinicianResponse(clinician: any) {
  return {
    id: clinician.id,
    userId: clinician.user_id,
    name: clinician.full_name,
    fullName: clinician.full_name,
    primaryCentreId: clinician.primary_centre_id,
    primaryCentreName: clinician.primary_centre_name,
    specialization: clinician.specialization, // Already array
    registrationNumber: clinician.registration_number,
    yearsOfExperience: clinician.years_of_experience,
    consultationFee: clinician.consultation_fee,
    bio: clinician.bio,
    consultationModes: clinician.consultation_modes, // Already array
    defaultDurationMinutes: clinician.default_consultation_duration_minutes,
    profilePictureUrl: clinician.profile_picture_url,
    designation: clinician.designation,
    qualification: clinician.qualification, // Already array
    expertise: clinician.expertise || [], // Already array
    languages: clinician.languages || [], // Already array
    isActive: clinician.is_active,
    createdAt: clinician.created_at,
    updatedAt: clinician.updated_at,
    availabilityRules: clinician.availability_rules || [],
  };
}
```

## Data Models

### Frontend Data Models

```typescript
// Clinician Form Data
interface ClinicianFormData {
  // User fields (for new clinician creation)
  full_name: string;
  phone: string;
  email?: string;
  username?: string;
  password: string;

  // Clinician fields
  userId?: number;
  primaryCentreId: number;
  specialization: string[];
  registrationNumber?: string;
  yearsOfExperience: number;
  consultationFee: number;
  bio?: string;
  consultationModes: string[];
  defaultDurationMinutes: number;
  profilePictureUrl?: string;
  designation?: string;
  qualification: string[];
  expertise: string[];
  languages: string[];
  availabilitySlots: AvailabilitySlot[];
}

// Availability Slot (Calendar-based)
interface AvailabilitySlot {
  id: string; // Temporary ID for UI
  date: Date; // Selected date from calendar
  startTime: string; // HH:MM format
  endTime: string; // Auto-calculated from startTime + sessionLength
  consultationMode: "IN_PERSON" | "ONLINE" | "BOTH";
}

// Field Lock State
interface FieldLockState {
  [fieldName: string]: {
    isLocked: boolean;
    value: any;
  };
}

// Calendar State
interface CalendarState {
  currentMonth: Date;
  selectedDate: Date | null;
  slotsMap: Map<string, AvailabilitySlot[]>; // date string -> slots
}
```

### Backend Data Models

```typescript
// Create Clinician DTO
interface CreateClinicianDto {
  user_id: number;
  primary_centre_id: number;
  specialization: string[];
  registration_number?: string;
  years_of_experience: number;
  consultation_fee: number;
  bio?: string;
  consultation_modes: string[];
  default_consultation_duration_minutes: number;
  profile_picture_url?: string;
  qualification: string[];
  expertise: string[];
  languages: string[];
}

// Availability Rule (Database)
interface AvailabilityRule {
  id: number;
  clinician_id: number;
  centre_id: number;
  day_of_week: number; // 0-6 (Sunday-Saturday)
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  slot_duration_minutes: number;
  mode: "IN_PERSON" | "ONLINE";
  created_at: Date;
  updated_at: Date;
}
```

### Database Schema

```sql
-- Clinicians table (existing)
CREATE TABLE clinicians (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  primary_centre_id INTEGER NOT NULL REFERENCES centres(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clinician Profiles table (existing)
CREATE TABLE clinician_profiles (
  id SERIAL PRIMARY KEY,
  clinician_id INTEGER NOT NULL REFERENCES clinicians(id) ON DELETE CASCADE,
  specialization TEXT[] NOT NULL, -- Array field
  registration_number VARCHAR(100),
  years_of_experience INTEGER DEFAULT 0,
  consultation_fee DECIMAL(10, 2) NOT NULL,
  bio TEXT,
  consultation_modes TEXT[] DEFAULT ARRAY['IN_PERSON'], -- Array field
  default_consultation_duration_minutes INTEGER DEFAULT 30,
  profile_picture_url TEXT,
  qualification TEXT[], -- Array field
  expertise TEXT[], -- Array field
  languages TEXT[], -- Array field
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Availability Rules table (existing)
CREATE TABLE availability_rules (
  id SERIAL PRIMARY KEY,
  clinician_id INTEGER NOT NULL REFERENCES clinicians(id) ON DELETE CASCADE,
  centre_id INTEGER NOT NULL REFERENCES centres(id),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER DEFAULT 30,
  mode VARCHAR(20) DEFAULT 'IN_PERSON',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
);

-- Indexes for performance
CREATE INDEX idx_clinicians_user_id ON clinicians(user_id);
CREATE INDEX idx_clinicians_primary_centre ON clinicians(primary_centre_id);
CREATE INDEX idx_clinician_profiles_clinician_id ON clinician_profiles(clinician_id);
CREATE INDEX idx_availability_rules_clinician_id ON availability_rules(clinician_id);
CREATE INDEX idx_availability_rules_day ON availability_rules(day_of_week);
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property Reflection

After analyzing all acceptance criteria, I've identified the following redundancies and consolidations:

**Redundant Properties to Remove:**

- 1.6, 1.7 are edge cases of 1.5 (database constraint errors)
- 3.6, 3.7 are edge cases of 3.5 (end time calculation)
- 4.2 is the same as 4.1 (password visibility)
- 5.11 is the inverse of 5.10 (button enablement)
- 7.7 is a specific case of 7.5 (array handling)
- 7.11 is a specific case of 7.4 (field mapping)

**Properties to Combine:**

- 4.3, 4.4, 4.5 can be combined into one property about password visibility across all forms
- 5.7, 5.8, 5.9 can be combined into one property about field locking for all input types
- 7.8, 7.9, 7.10 can be combined into one property about array field validation
- 3.3 and 3.4 can be combined into one property about AM/PM toggle behavior

**Final Property Count:** After consolidation, we have approximately 60 unique, non-redundant properties.

### Correctness Properties

Property 1: Clinician Creation Round Trip
_For any_ valid clinician data (including user fields, professional fields, and availability slots), creating a clinician through the API should return a response containing all the submitted data with correct field transformations (snake_case to camelCase).
**Validates: Requirements 1.1, 1.8, 1.9, 7.1, 7.3**

Property 2: Required Field Validation
_For any_ clinician creation request missing required fields (full_name, phone, password, specialization, qualification, languages, primary_centre_id, consultation_fee), the Backend_API should return a validation error before attempting database operations.
**Validates: Requirements 1.2, 7.2, 9.1**

Property 3: Validation Error Display
_For any_ validation error returned by the Backend_API, the Admin_Panel should display the error message in a user-friendly format to the user.
**Validates: Requirements 1.4, 9.12**

Property 4: Database Constraint Error Handling
_For any_ clinician creation request that violates database constraints (duplicate phone, duplicate username, invalid foreign keys), the Backend_API should return an appropriate error message indicating the specific constraint violation.
**Validates: Requirements 1.5, 8.2, 8.7**

Property 5: Clinician List Refresh
_For any_ successful clinician creation, the Admin_Panel should refresh the clinician list and the newly created clinician should appear in the list.
**Validates: Requirements 1.10**

Property 6: Calendar Date Selection
_For any_ date clicked in the Calendar_Interface, the System should update the selected date state and display the time slot addition interface.
**Validates: Requirements 2.2**

Property 7: Calendar Month Navigation
_For any_ month navigation action (previous or next), the Calendar_Interface should update the displayed dates to show the correct month.
**Validates: Requirements 2.3**

Property 8: Date Formatting
_For any_ selected date, the System should display the date in a clear, readable format (e.g., "Monday, January 15, 2024").
**Validates: Requirements 2.4**

Property 9: Time Slot Date Association
_For any_ time slot added for a selected date, the slot should be correctly associated with that date in the system state.
**Validates: Requirements 2.5**

Property 10: Multiple Slot Associations
_For any_ set of time slots added for different dates, all slot-to-date associations should be maintained correctly without loss or corruption.
**Validates: Requirements 2.6**

Property 11: Date Slot Indicators
_For any_ date that has existing time slots, the Calendar_Interface should display a visual indicator (badge, dot, or highlight) on that date.
**Validates: Requirements 2.8**

Property 12: Existing Slot Display
_For any_ date with existing slots that is selected, the System should display all existing slots for that date.
**Validates: Requirements 2.9**

Property 13: Time Slider Visibility
_For any_ date selection in the calendar, the Time_Slider component should become visible for time selection.
**Validates: Requirements 3.1**

Property 14: Real-Time Time Update
_For any_ slider drag action, the displayed time value should update in real-time to reflect the slider position.
**Validates: Requirements 3.2**

Property 15: AM/PM Toggle Behavior
_For any_ AM or PM toggle button click, the System should set the time period to the clicked value and update the displayed time accordingly.
**Validates: Requirements 3.3, 3.4**

Property 16: End Time Calculation
_For any_ start time selected, the System should automatically calculate the end time by adding the Session_Length (default 30 minutes) to the start time.
**Validates: Requirements 3.5**

Property 17: Time Increment Granularity
_For any_ time selection using the slider, the time should be constrained to 15-minute increments (00, 15, 30, 45).
**Validates: Requirements 3.8**

Property 18: Hour Range Support
_For any_ time selection, the slider should support hours from 1 to 12 for both AM and PM periods.
**Validates: Requirements 3.9**

Property 19: Slot Storage Format
_For any_ time slot added, the System should store only the start time and session length, with end time calculated on demand.
**Validates: Requirements 3.10**

Property 20: Password Field Visibility
_For any_ password field in the Admin_Panel (clinician creation, staff creation, or any other form), the field should display characters as plain text (type="text") instead of masked (type="password").
**Validates: Requirements 4.1, 4.3, 4.4, 4.5**

Property 21: Password Field Styling Consistency
_For any_ password field displayed as plain text, the styling should match other text input fields in the form.
**Validates: Requirements 4.6**

Property 22: No Password Toggle Button
_For any_ password field in the Admin_Panel, there should be no visibility toggle button (password is always visible).
**Validates: Requirements 4.7**

Property 23: Field Lock Button Presence
_For any_ input field (text, number, select) in the clinician creation form, an "Add" button should be displayed next to the field when it is unlocked.
**Validates: Requirements 5.1, 5.7, 5.8, 5.9**

Property 24: Field Locking Action
_For any_ "Add" button click next to a field, the field should become locked (disabled/readonly) and visually greyed out.
**Validates: Requirements 5.2**

Property 25: Locked Field Value Display
_For any_ locked field, the entered data should remain visible in the field.
**Validates: Requirements 5.3**

Property 26: Locked Field Edit Prevention
_For any_ locked field, further editing should be prevented (field is disabled or readonly).
**Validates: Requirements 5.4**

Property 27: Field Unlock Button Presence
_For any_ locked field, an "Edit" or "Unlock" button should be displayed to allow unlocking.
**Validates: Requirements 5.5**

Property 28: Field Unlocking Action
_For any_ "Edit" or "Unlock" button click, the field should return to its editable state (enabled, not greyed out).
**Validates: Requirements 5.6**

Property 29: Submit Button Enablement
_For any_ clinician creation form state, the "Create Clinician" button should be enabled if and only if all required fields are locked.
**Validates: Requirements 5.10**

Property 30: Loading Indicator Display
_For any_ "Create Clinician" button click, a dark blue loading circle should be displayed immediately.
**Validates: Requirements 6.1**

Property 31: Minimum Loading Duration
_For any_ clinician creation operation, the loading circle should be displayed for a minimum of 3 seconds, even if the API responds faster.
**Validates: Requirements 6.2, 6.3**

Property 32: Loading Indicator Dismissal
_For any_ clinician creation operation, the loading circle should be hidden only after both the operation completes AND the minimum 3 seconds have elapsed.
**Validates: Requirements 6.4**

Property 33: Submit Button Disablement During Loading
_For any_ active loading state, the "Create Clinician" button should be disabled to prevent duplicate submissions.
**Validates: Requirements 6.5**

Property 34: Loading Indicator Positioning
_For any_ loading indicator display, it should be centered on the screen or within the modal.
**Validates: Requirements 6.6**

Property 35: Loading State for All Role Creation
_For any_ role creation operation (Clinician, Manager, Centre Manager, Care Coordinator, Front Desk), the loading state enhancement should be applied.
**Validates: Requirements 6.7**

Property 36: Loading Dismissal on Error
_For any_ role creation operation that fails, the loading circle should be hidden and the error message should be displayed.
**Validates: Requirements 6.8**

Property 37: Loading Dismissal on Success
_For any_ role creation operation that succeeds, the loading circle should be hidden and the success message should be displayed.
**Validates: Requirements 6.9**

Property 38: API Endpoint Request Structure
_For any_ POST request to /api/clinicians, the Backend_API should accept requests with the expected Request_Payload structure (snake_case field names).
**Validates: Requirements 7.1, 7.4**

Property 39: Array Field Parsing and Storage
_For any_ clinician creation request with array fields (specialization, qualification, expertise, languages, consultation_modes), the Backend_API should correctly parse and store them as PostgreSQL arrays.
**Validates: Requirements 7.5, 8.3**

Property 40: Array Field Response Format
_For any_ clinician record returned by the Backend_API, array fields should be returned as arrays (not strings or other types).
**Validates: Requirements 7.6**

Property 41: Non-Empty Array Validation
_For any_ clinician creation request, the Backend_API should validate that specialization, qualification, and languages are non-empty arrays and return validation errors if they are empty.
**Validates: Requirements 7.8, 7.9, 7.10**

Property 42: Response Case Transformation
_For any_ clinician record returned by the Backend_API, all field names should be transformed from snake_case to camelCase.
**Validates: Requirements 7.12**

Property 43: Database Record Insertion
_For any_ valid clinician creation request, the Backend_API should successfully insert a record into the PostgreSQL database.
**Validates: Requirements 8.1**

Property 44: Database Record Retrieval
_For any_ clinician record queried from the database, all fields including array fields should be retrieved correctly.
**Validates: Requirements 8.4**

Property 45: Database Record Update
_For any_ clinician update request, the Backend_API should update the database record and return the updated data.
**Validates: Requirements 8.5**

Property 46: Active Status Toggle
_For any_ clinician active/inactive toggle request, the Database should update the is_active field correctly.
**Validates: Requirements 8.6**

Property 47: Duplicate Prevention
_For any_ set of clinician creation requests, the Database should prevent duplicate records based on phone number and username constraints.
**Validates: Requirements 8.8**

Property 48: Phone Number Validation
_For any_ phone number entered in an invalid format, the System should display an error message indicating the correct format.
**Validates: Requirements 9.2**

Property 49: Email Format Validation
_For any_ email entered in an invalid format, the System should display an error message indicating the correct format.
**Validates: Requirements 9.3**

Property 50: Positive Fee Validation
_For any_ consultation fee entered as zero or negative, the System should display an error message requiring a positive value.
**Validates: Requirements 9.4**

Property 51: Non-Negative Experience Validation
_For any_ years of experience entered as negative, the System should display an error message requiring a non-negative value.
**Validates: Requirements 9.5**

Property 52: Required Array Field Validation
_For any_ clinician creation form submission with empty specialization, qualification, languages, or consultation_modes, the System should display error messages for each empty required array field.
**Validates: Requirements 9.6, 9.7, 9.8, 9.9**

Property 53: Simultaneous Error Display
_For any_ form submission with multiple validation errors, the System should display all error messages simultaneously (not one at a time).
**Validates: Requirements 9.10**

Property 54: Error Message Clearing
_For any_ field with a validation error that is corrected, the System should remove the error message for that field.
**Validates: Requirements 9.11**

Property 55: Availability Slots in Request
_For any_ clinician creation with availability slots, the Request_Payload should include all slots with their date, start_time, end_time, and consultation_mode.
**Validates: Requirements 10.1**

Property 56: Availability Slot Storage
_For any_ clinician creation request with availability slots, the Backend_API should store each slot in the availability_rules table with the correct clinician_id association.
**Validates: Requirements 10.2, 10.3**

Property 57: Availability Slot Data Completeness
_For any_ availability slot stored, the Database should store day_of_week, start_time, end_time, and consultation_mode fields.
**Validates: Requirements 10.4**

Property 58: Availability Slots in Response
_For any_ clinician creation with availability slots, the Response_Payload should include all created slots.
**Validates: Requirements 10.5**

Property 59: Availability Slot Display
_For any_ clinician details view, the System should display all associated availability slots.
**Validates: Requirements 10.6**

Property 60: Availability Slot Update
_For any_ clinician availability edit, the System should update the slots in the database correctly.
**Validates: Requirements 10.7**

Property 61: Availability Slot Deletion
_For any_ availability slot removal, the System should delete the slot from the database.
**Validates: Requirements 10.8**

Property 62: Availability Slot Ordering
_For any_ availability slots query, the Backend_API should return slots sorted by day_of_week (ascending) and then start_time (ascending).
**Validates: Requirements 10.9**

Property 63: Availability Slot Overlap Validation
_For any_ set of availability slots for the same clinician and day, the System should detect overlapping time ranges and either prevent the overlap or warn the user.
**Validates: Requirements 10.10**

## Error Handling

### Frontend Error Handling

1. **API Request Errors**:
   - Network errors: Display "Unable to connect to server" message
   - Timeout errors: Display "Request timed out, please try again"
   - 400 Bad Request: Display validation error messages from response
   - 409 Conflict: Display conflict error (duplicate phone/username)
   - 500 Server Error: Display "Server error, please contact support"

2. **Form Validation Errors**:
   - Display errors inline below each field
   - Highlight invalid fields with red border
   - Show summary of all errors at top of form
   - Clear errors when field is corrected

3. **Calendar/Time Selection Errors**:
   - Invalid time range: "End time must be after start time"
   - Overlapping slots: "This time slot overlaps with an existing slot"
   - Past date selection: "Cannot select dates in the past"

### Backend Error Handling

1. **Validation Errors**:
   - Return 400 status with descriptive error messages
   - Include field name in error message
   - Return all validation errors in a single response

2. **Database Errors**:
   - Foreign key violations: "Invalid centre or user ID"
   - Unique constraint violations: "Phone number/username already exists"
   - Connection errors: Log error, return 500 with generic message

3. **Business Logic Errors**:
   - User already a clinician: Return 409 with specific message
   - Invalid role assignment: Return 400 with explanation
   - Missing required relationships: Return 400 with details

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string; // e.g., "VALIDATION_ERROR", "DUPLICATE_PHONE"
    message: string; // User-friendly message
    details?: {
      field: string;
      message: string;
    }[]; // Field-specific errors
  };
}
```

## Testing Strategy

### Dual Testing Approach

This feature requires both unit tests and property-based tests for comprehensive coverage:

**Unit Tests**: Focus on specific examples, edge cases, and integration points

- Specific validation scenarios (empty phone, invalid email format)
- UI component rendering and interactions
- API endpoint integration
- Database constraint violations
- Error message formatting

**Property-Based Tests**: Verify universal properties across all inputs

- Clinician creation with random valid data
- Field validation with random invalid inputs
- Calendar date selection with random dates
- Time slot calculations with random times
- Array field handling with random array sizes

### Property-Based Testing Configuration

**Library**: Use `fast-check` for TypeScript/JavaScript property-based testing

**Configuration**:

- Minimum 100 iterations per property test
- Each test must reference its design document property
- Tag format: `Feature: admin-clinician-enhancement, Property {number}: {property_text}`

**Example Property Test**:

```typescript
import * as fc from "fast-check";

describe("Feature: admin-clinician-enhancement", () => {
  it("Property 1: Clinician Creation Round Trip", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          full_name: fc.string({ minLength: 1, maxLength: 100 }),
          phone: fc.string({ minLength: 10, maxLength: 15 }),
          password: fc.string({ minLength: 8 }),
          specialization: fc.array(fc.string(), { minLength: 1 }),
          qualification: fc.array(fc.string(), { minLength: 1 }),
          languages: fc.array(fc.string(), { minLength: 1 }),
          primary_centre_id: fc.integer({ min: 1 }),
          consultation_fee: fc.float({ min: 0.01, max: 10000 }),
        }),
        async (clinicianData) => {
          const response = await createClinician(clinicianData);

          // Verify all fields are present and correct
          expect(response.fullName).toBe(clinicianData.full_name);
          expect(response.phone).toBe(clinicianData.phone);
          expect(response.specialization).toEqual(clinicianData.specialization);
          expect(response.qualification).toEqual(clinicianData.qualification);
          expect(response.languages).toEqual(clinicianData.languages);
          expect(response.primaryCentreId).toBe(
            clinicianData.primary_centre_id,
          );
          expect(response.consultationFee).toBe(clinicianData.consultation_fee);
        },
      ),
      { numRuns: 100 },
    );
  });
});
```

### Unit Test Coverage

**Frontend Unit Tests**:

- CalendarPicker component rendering
- TimeSlider component interactions
- FieldLockInput component state management
- LoadingOverlay timing logic
- Form validation error display
- API service method calls

**Backend Unit Tests**:

- Validation function edge cases
- Service layer error handling
- Repository database queries
- Response transformation
- Constraint violation handling

### Integration Tests

- End-to-end clinician creation flow
- Calendar date selection to slot creation
- Field locking to form submission
- Loading state timing
- Error propagation from backend to frontend

### Manual Testing Checklist

- [ ] Create clinician with all fields
- [ ] Create clinician with minimal required fields
- [ ] Test duplicate phone number error
- [ ] Test duplicate username error
- [ ] Test calendar month navigation
- [ ] Test time slider with AM/PM toggle
- [ ] Test field locking and unlocking
- [ ] Test loading state minimum duration
- [ ] Test password visibility in all forms
- [ ] Test availability slot overlap detection
- [ ] Test array field storage and retrieval
- [ ] Test response case transformation
- [ ] Verify against live PostgreSQL database
