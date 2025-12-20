# Implementation Plan

- [x] 1. Set up service layer and API integration

  - Create service files for all API endpoints
  - Configure API base URL and error handling
  - Set up TypeScript interfaces matching backend responses
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 3.1, 5.1, 6.1, 7.1_

- [x] 1.1 Create clinician service

  - Implement getClinicians, getClinicianById, createClinician, updateClinician, deleteClinician
  - Implement getAvailability and setAvailability methods
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 1.2 Create appointment service

  - Implement getAppointments, getAppointmentById, createAppointment, updateAppointment, cancelAppointment
  - Implement checkAvailability and getMyAppointments methods
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

- [x] 1.3 Create centre service

  - Implement getCentres, getCentreById, createCentre, updateCentre, deleteCentre
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 1.4 Create patient service

  - Implement getPatients, getPatientById, createPatient, updatePatient, getPatientAppointments
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [x] 1.5 Create analytics service

  - Implement getDashboardMetrics, getTopDoctors, getRevenueData, getLeadsBySource
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [x] 2. Update type definitions to match backend schema

  - Update User, Clinician, Appointment, Centre, Patient interfaces
  - Add AvailabilityRule and TimeSlot interfaces
  - Ensure enum values match database constraints (appointment types, statuses, user types)
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [x] 3. Implement authentication flow

  - Update LoginPage to support all three authentication methods
  - Implement OTP request and verification UI
  - Add form validation for phone, username, password fields
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 3.1 Test authentication with backend

  - Verify phone + OTP login works end-to-end
  - Verify phone + password login works
  - Verify username + password login works
  - Verify tokens are stored correctly in localStorage
  - _Requirements: 1.5, 1.6_

- [x] 3.2 Implement token refresh mechanism

  - Update API interceptor to handle 401 responses
  - Implement automatic token refresh logic
  - Add redirect to login on refresh failure
  - _Requirements: 1.7, 1.8_

- [x] 4. Implement centre management features

  - Create CentreForm component for create/edit
  - Update CentresPage to display centres list
  - Add city validation (bangalore, kochi, mumbai)
  - Implement create, update, delete operations
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 5. Implement clinician management features

  - Create ClinicianForm component for create/edit
  - Update CliniciansPage to display clinicians list
  - Add fields for specialization, registration number, experience, fee
  - _Requirements: 3.1, 3.5, 3.7_

- [x] 5.1 Implement availability management UI

  - Create AvailabilityManager component
  - Add day of week selector
  - Add time range pickers (start time, end time)
  - Add slot duration input
  - Add session mode selector (IN_PERSON/ONLINE)
  - Add centre selector for multi-centre availability
  - _Requirements: 3.2, 3.3_

- [x] 5.2 Implement slot generation logic

  - Create utility function to generate slots from availability rules
  - Calculate number of slots based on time range and duration
  - Generate slot start and end times
  - _Requirements: 3.4_

- [x] 6. Implement calendar components

  - Create AvailabilityCalendar component with monthly view
  - Create SlotGrid component for daily slot display
  - Create WeekView component for week-long schedule
  - _Requirements: 4.1_

- [x] 6.1 Implement slot status visualization

  - Add CSS classes for available, booked, blocked slots
  - Display patient information for booked slots
  - Make available slots clickable
  - Disable blocked slots
  - _Requirements: 4.2, 4.3, 4.4_

- [x] 6.2 Implement calendar filtering

  - Add date selector to filter slots by date
  - Add centre filter to show slots for specific centre
  - Update slot display when filters change
  - _Requirements: 4.5, 4.6_

- [x] 6.3 Display slot information

  - Show slot duration for each slot
  - Show session type (IN_PERSON/ONLINE) for each slot
  - _Requirements: 4.7_

- [x] 7. Implement appointment booking flow

  - Create AppointmentBookingForm with multi-step wizard
  - Step 1: Centre selection
  - Step 2: Clinician selection (filtered by centre)
  - Step 3: Date and time slot selection
  - Step 4: Session type selection
  - Step 5: Patient selection or creation
  - Step 6: Notes and confirmation
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 7.1 Implement booking validation

  - Validate session type is supported by clinician
  - Check for slot conflicts before booking
  - Display error messages for validation failures
  - _Requirements: 5.6, 5.8_

- [x] 7.2 Implement booking confirmation

  - Update slot status to booked after successful booking
  - Display confirmation message with appointment details
  - _Requirements: 5.7_

- [x] 8. Implement patient management features

  - Update PatientsListPage to display patient list
  - Add search functionality for name and phone
  - Create PatientForm component for create/edit
  - Add required field validation (name, phone)
  - Add optional fields (email, DOB, gender, emergency contact)
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 8.1 Ensure patient user type is set correctly

  - Verify created patients have user_type = 'PATIENT'
  - _Requirements: 6.5_

- [x] 8.2 Implement patient details view

  - Update PatientDetailsPage to show complete patient information
  - Display appointment history
  - Display medical notes
  - _Requirements: 6.6, 6.7_

- [x] 9. Implement appointment management features

  - Update CentreAppointmentsPage to display appointments list
  - Add filters for centre, clinician, date, status
  - Display all required fields in appointment list
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 9.1 Implement appointment details and actions

  - Create AppointmentDetails component
  - Display complete appointment information
  - Add cancel appointment functionality
  - Update slot status when appointment is cancelled
  - _Requirements: 7.6, 7.7_

- [x] 10. Implement clinician dashboard

  - Create ClinicianDashboardPage component
  - Fetch appointments using getMyAppointments endpoint
  - Display three sections: current, upcoming, past
  - Filter current appointments to today's date
  - Filter upcoming appointments to future dates
  - Filter past appointments to past dates
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 10.1 Display clinician appointment information

  - Show patient name and phone for each appointment
  - Show centre name and address
  - Show date, time, and session type
  - _Requirements: 8.5, 8.6_

- [x] 10.2 Implement reactive updates

  - Update appointment categorization when status changes
  - _Requirements: 8.7_

- [x] 11. Implement analytics dashboard

  - Update DashboardPage to fetch analytics data
  - Display total patients metric with percentage change
  - Display active doctors metric with percentage change
  - Display follow-ups booked metric with percentage change
  - Display total revenue metric with percentage change
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 11.1 Implement top doctors display

  - Fetch and display top performing doctors
  - Sort by patient count in descending order
  - _Requirements: 9.5_

- [x] 11.2 Implement revenue and leads charts

  - Display revenue trends over time
  - Display appointment sources distribution
  - _Requirements: 9.6, 9.7_

- [x] 12. Implement role-based access control

  - Update router to check user roles
  - Hide/show navigation items based on role
  - Restrict access to pages based on role
  - Display appropriate error messages for unauthorized access
  - _Requirements: All requirements (role-based access applies to all features)_

- [x] 13. Add error handling and loading states

  - Implement error boundaries for component crashes
  - Add loading spinners for async operations
  - Display toast notifications for transient errors
  - Show inline validation errors in forms
  - Display modal dialogs for critical errors
  - _Requirements: All requirements (error handling applies to all features)_

- [x] 14. Final integration testing and bug fixes

  - Test complete authentication flow with all three methods
  - Test centre creation and management
  - Test clinician creation with availability rules
  - Test calendar views and slot display
  - Test appointment booking end-to-end
  - Test patient management
  - Test appointment filtering and cancellation
  - Test clinician dashboard
  - Test analytics dashboard
  - Test role-based access control
  - Verify database schema compliance
  - Fix any bugs discovered during testing
  - _Requirements: All requirements_
