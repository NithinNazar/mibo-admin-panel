# Technical Implementation Details

## Architecture Overview

The session management system follows a three-tier architecture:

1. **Frontend (React)**: User interface and client-side validation
2. **Backend (Node.js/Express)**: Business logic and API endpoints
3. **Database (PostgreSQL)**: Data persistence

## Frontend Implementation

### Component: SessionControlModal.tsx

**Key Features:**

- Time validation before session start
- Status management (IN_PROGRESS → COMPLETED)
- Error handling and user feedback
- Loading states

**Time Validation Logic:**

```typescript
const scheduledTime = new Date(appointment.scheduled_start_at);
const currentTime = new Date();

if (currentTime < scheduledTime) {
  // Show error - too early to start
  setError(
    `Session can only be started at the scheduled time: ${formattedTime}`,
  );
  return;
}
```

**API Calls:**

```typescript
// Start Session
await appointmentService.updateAppointment(appointment.id, {
  status: "IN_PROGRESS",
});

// End Session
await appointmentService.updateAppointment(appointment.id, {
  status: "COMPLETED",
});
```

### Component: ClinicianDashboardEnhanced.tsx

**Key Features:**

- Displays appointments with filtering
- Shows session control buttons based on status
- Handles patient notes and clinician notes modals
- Real-time status updates

**Session Button Logic:**

```typescript
{viewMode === "upcoming" && (
  <button onClick={() => setSelectedAppointmentForSession(appointment)}>
    {appointment.session_started_at && !appointment.session_ended_at ? (
      <>End Session</>
    ) : (
      <>Start Session</>
    )}
  </button>
)}
```

### Component: PatientNotesModal.tsx

**Key Features:**

- Read-only display of patient notes
- Fetches notes from appointment details
- Clean UI with loading states

### Component: ClinicianNotesModal.tsx

**Key Features:**

- Editable text area for current session notes
- Displays previous session notes history
- Character counter
- Expandable previous notes section

**Previous Notes Fetching:**

```typescript
const notesHistory = allAppointments
  .filter(
    (apt) =>
      apt.id !== appointment.id &&
      apt.notes &&
      new Date(apt.scheduled_start_at) <
        new Date(appointment.scheduled_start_at),
  )
  .sort(
    (a, b) =>
      new Date(b.scheduled_start_at).getTime() -
      new Date(a.scheduled_start_at).getTime(),
  );
```

## Backend Implementation

### Controller: appointment.controller.ts

**Updated Method: updateAppointment**

Handles three types of updates:

1. Status updates (session start/end)
2. Notes updates
3. Reschedule updates

```typescript
async updateAppointment(req: AuthRequest, res: Response, next: NextFunction) {
  // Normalize status field (accept both 'status' and 'new_status')
  if (req.body.status && !req.body.new_status) {
    req.body.new_status = req.body.status;
  }

  // Route to appropriate service method
  if (req.body.new_status || req.body.status) {
    return appointmentService.updateStatus(...);
  }
  if (req.body.notes !== undefined) {
    return appointmentService.updateNotes(...);
  }
  return appointmentService.rescheduleAppointment(...);
}
```

### Repository: appointment.repository.ts

**Updated Method: updateStatus**

Automatically sets session timestamps based on status:

```typescript
async updateStatus(
  appointment_id: number,
  new_status: AppointmentStatus,
  changed_by_user_id: number,
  reason?: string,
): Promise<Appointment> {
  let additionalFields = "";

  if (new_status === "IN_PROGRESS") {
    // Set session_started_at only if not already set
    additionalFields =
      ", session_started_at = COALESCE(session_started_at, NOW())";
  } else if (new_status === "COMPLETED") {
    // Set both timestamps (ensure started_at is set even if missed)
    additionalFields =
      ", session_started_at = COALESCE(session_started_at, NOW()), " +
      "session_ended_at = COALESCE(session_ended_at, NOW())";
  }

  const query = `
    UPDATE appointments
    SET status = $1, updated_at = NOW()${additionalFields}
    WHERE id = $2
    RETURNING *;
  `;

  return await db.one<Appointment>(query, [new_status, appointment_id]);
}
```

**Why COALESCE?**

- Prevents overwriting existing timestamps
- Ensures idempotency (safe to call multiple times)
- Handles edge cases where status might be updated multiple times

### Method: updateNotes

Simple update for clinician notes:

```typescript
async updateNotes(
  appointmentId: number,
  notes: string,
): Promise<Appointment> {
  const query = `
    UPDATE appointments
    SET notes = $1, updated_at = NOW()
    WHERE id = $2 AND is_active = TRUE
    RETURNING *
  `;
  return await db.one<Appointment>(query, [notes, appointmentId]);
}
```

## Database Schema

### Appointments Table

**Relevant Columns:**

```sql
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL,
  clinician_id INTEGER NOT NULL,
  centre_id INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL,
  scheduled_start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scheduled_end_at TIMESTAMP WITH TIME ZONE NOT NULL,
  session_started_at TIMESTAMP WITH TIME ZONE,
  session_ended_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  patient_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);
```

**Indexes:**

```sql
CREATE INDEX idx_appointments_session_started_at
  ON appointments(session_started_at)
  WHERE session_started_at IS NOT NULL;

CREATE INDEX idx_appointments_session_ended_at
  ON appointments(session_ended_at)
  WHERE session_ended_at IS NOT NULL;
```

## Type System

### Backend Types (appointment.types.ts)

```typescript
export type AppointmentStatus =
  | "BOOKED"
  | "CONFIRMED"
  | "IN_PROGRESS" // Added for session tracking
  | "RESCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "CANCELLED_BY_ADMIN"
  | "NO_SHOW";
```

### Frontend Types (types/index.ts)

```typescript
export type AppointmentStatus =
  | "BOOKED"
  | "CONFIRMED"
  | "IN_PROGRESS" // Added for session tracking
  | "RESCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";
```

## Validation

### Backend Validation (appointment.validations.ts)

```typescript
const allowedStatuses: AppointmentStatus[] = [
  "BOOKED",
  "CONFIRMED",
  "IN_PROGRESS", // Added
  "RESCHEDULED",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

export function validateUpdateStatus(body: any, params: any): UpdateStatusDto {
  const new_status = body.new_status as AppointmentStatus;
  if (!allowedStatuses.includes(new_status)) {
    throw ApiError.badRequest("Invalid status");
  }
  // ... rest of validation
}
```

## API Endpoints

### PUT /api/appointments/:id

**Purpose**: Update appointment (status, notes, or reschedule)

**Authentication**: Required (JWT token)

**Authorization**:

- CLINICIAN: Can update own appointments
- ADMIN/MANAGER: Can update any appointment

**Request Body Options:**

1. **Start Session:**

```json
{
  "status": "IN_PROGRESS"
}
```

2. **End Session:**

```json
{
  "status": "COMPLETED"
}
```

3. **Update Notes:**

```json
{
  "notes": "Patient showed improvement..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Appointment status updated",
  "data": {
    "id": 123,
    "status": "IN_PROGRESS",
    "session_started_at": "2026-05-20T10:00:00.000Z",
    "session_ended_at": null,
    ...
  }
}
```

## Error Handling

### Frontend Error Handling

```typescript
try {
  await appointmentService.updateAppointment(appointment.id, {
    status: "IN_PROGRESS",
  });
  onUpdate(); // Refresh data
} catch (error: any) {
  console.error("Failed to start session:", error);
  setError(error.response?.data?.message || "Failed to start session");
  setLoading(false);
}
```

### Backend Error Handling

```typescript
try {
  const updated = await appointmentRepository.updateStatus(...);
  return ok(res, updated, "Appointment status updated");
} catch (err) {
  next(err); // Pass to error middleware
}
```

## Security Considerations

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Clinicians can only access their own appointments
3. **Input Validation**: All inputs are validated before processing
4. **SQL Injection Prevention**: Using parameterized queries
5. **XSS Prevention**: React automatically escapes output

## Performance Optimizations

1. **Database Indexes**: Indexes on session timestamp columns
2. **Conditional Queries**: Only fetch necessary data
3. **Lazy Loading**: Previous notes loaded only when expanded
4. **Optimistic Updates**: UI updates before API response (with rollback on error)

## Future Enhancements

1. **Real-time Updates**: WebSocket for live session status updates
2. **Session Duration Tracking**: Calculate actual session duration
3. **Session Reminders**: Notify clinician before scheduled time
4. **Session Analytics**: Track average session duration, completion rates
5. **Audit Trail**: Detailed logging of all session actions
6. **Timezone Support**: Better handling of different timezones
7. **Session Recording**: Integration with video call recording
8. **Auto-end Sessions**: Automatically end sessions after certain duration
