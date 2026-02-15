# Requirements Document

## Introduction

This document specifies the requirements for enhancing the admin panel's clinician creation and appointment slot management features. The system currently experiences failures during clinician creation from the admin panel, and the appointment slot management UI needs modernization with calendar-based selection. Additional enhancements include password visibility controls, field locking mechanisms, and improved loading states.

## Glossary

- **Admin_Panel**: The React-based administrative interface for managing clinicians, appointments, and system data
- **Backend_API**: The Node.js + Express + TypeScript REST API that handles business logic and database operations
- **Clinician**: A healthcare professional (doctor, therapist, psychologist) who provides consultations
- **Appointment_Slot**: A specific time period when a clinician is available for consultations
- **Field_Locking**: A UI mechanism that prevents modification of a field after its value has been confirmed
- **Loading_State**: Visual feedback indicating that a background operation is in progress
- **Calendar_Interface**: A date picker component that allows users to select dates from a visual calendar
- **Time_Slider**: A UI control for selecting time values by dragging or clicking on a continuous range
- **Session_Length**: The default duration of a consultation appointment (default: 30 minutes)
- **Password_Visibility**: The ability to display password characters as plain text instead of masked dots
- **API_Endpoint**: A specific URL path in the Backend_API that handles a particular operation
- **Request_Payload**: The data structure sent from Admin_Panel to Backend_API
- **Response_Payload**: The data structure returned from Backend_API to Admin_Panel
- **Key_Mapping**: The correspondence between field names in Request_Payload and Response_Payload

## Requirements

### Requirement 1: Debug and Fix Clinician Creation

**User Story:** As an admin user, I want clinician creation to work reliably from the admin panel, so that I can successfully onboard new healthcare professionals without errors.

#### Acceptance Criteria

1. WHEN an admin submits a valid clinician creation form, THE Backend_API SHALL successfully create the clinician record and return a success response
2. WHEN the Backend_API receives a clinician creation request, THE Backend_API SHALL validate all required fields before attempting database operations
3. WHEN there is a key mapping mismatch between Request_Payload and Response_Payload, THE System SHALL log the mismatch and return a descriptive error message
4. WHEN clinician creation fails due to validation errors, THE Admin_Panel SHALL display the specific validation error messages to the user
5. WHEN clinician creation fails due to database constraints, THE Backend_API SHALL return appropriate error messages indicating the constraint violation
6. WHEN an admin creates a clinician with an existing phone number, THE Backend_API SHALL return an error indicating the phone number is already registered
7. WHEN an admin creates a clinician with an existing username, THE Backend_API SHALL return an error indicating the username is already taken
8. WHEN the Admin_Panel sends a clinician creation request, THE Request_Payload SHALL use snake_case field names matching the Backend_API expectations
9. WHEN the Backend_API returns a clinician creation response, THE Response_Payload SHALL use camelCase field names matching the Admin_Panel expectations
10. WHEN clinician creation succeeds, THE Admin_Panel SHALL refresh the clinician list to display the newly created clinician

### Requirement 2: Calendar-Based Appointment Slot Management

**User Story:** As an admin user, I want to select appointment dates using a calendar interface, so that I can intuitively schedule clinician availability without manually entering dates.

#### Acceptance Criteria

1. WHEN an admin opens the appointment slot management interface, THE Calendar_Interface SHALL display the current month with the current date highlighted
2. WHEN an admin clicks on a date in the Calendar_Interface, THE System SHALL select that date and display the time slot addition interface
3. WHEN an admin navigates between months in the Calendar_Interface, THE System SHALL update the displayed dates accordingly
4. WHEN an admin selects a date, THE System SHALL display the selected date in a clear, readable format
5. WHEN an admin adds a time slot for a selected date, THE System SHALL associate the time slot with the correct date
6. WHEN an admin adds multiple time slots for different dates, THE System SHALL maintain all slot associations correctly
7. WHEN the Calendar_Interface is displayed, THE System SHALL show day names (Monday, Tuesday, etc.) for orientation
8. WHEN an admin has already added slots for a date, THE Calendar_Interface SHALL visually indicate that date has existing slots
9. WHEN an admin selects a date with existing slots, THE System SHALL display the existing slots for that date
10. THE Calendar_Interface SHALL replace the current Monday-Friday dropdown fields

### Requirement 3: Time Slider with AM/PM Selection

**User Story:** As an admin user, I want to select appointment times using a slider with AM/PM toggles, so that I can quickly set time slots without typing.

#### Acceptance Criteria

1. WHEN an admin selects a date, THE Time_Slider SHALL display for selecting the starting time
2. WHEN an admin drags the Time_Slider, THE System SHALL update the displayed time value in real-time
3. WHEN an admin clicks the AM toggle button, THE System SHALL set the time period to AM
4. WHEN an admin clicks the PM toggle button, THE System SHALL set the time period to PM
5. WHEN an admin selects a starting time, THE System SHALL automatically calculate the end time based on the Session_Length
6. WHEN the Session_Length is 30 minutes, THE System SHALL set the end time to 30 minutes after the start time
7. WHEN an admin changes the starting time, THE System SHALL recalculate the end time automatically
8. THE Time_Slider SHALL support time selection in 15-minute increments
9. THE Time_Slider SHALL display hours from 1 to 12 for both AM and PM periods
10. WHEN an admin adds a time slot, THE System SHALL store only the starting time and calculate end time from Session_Length

### Requirement 4: Password Visibility for Admin Users

**User Story:** As an admin user, I want to see passwords as plain text instead of dots, so that I can verify the password I'm entering for new clinicians.

#### Acceptance Criteria

1. WHEN an admin views a password field in the Admin_Panel, THE System SHALL display the password characters as plain text
2. WHEN an admin types into a password field, THE System SHALL show each character as it is typed
3. THE System SHALL apply password visibility to all password fields in the clinician creation form
4. THE System SHALL apply password visibility to all password fields in the staff creation forms
5. THE System SHALL apply password visibility to all password fields throughout the Admin_Panel
6. WHEN a password is displayed as plain text, THE System SHALL maintain the same styling as other text input fields
7. THE System SHALL NOT provide a toggle button for password visibility (always visible for admin users)

### Requirement 5: Field Locking Mechanism

**User Story:** As an admin user, I want to lock fields after entering data, so that I can review all entered information before final submission and prevent accidental changes.

#### Acceptance Criteria

1. WHEN an admin views an input field in the clinician creation form, THE System SHALL display an "Add" button next to the field
2. WHEN an admin clicks the "Add" button next to a field, THE System SHALL lock that field and grey it out
3. WHEN a field is locked, THE System SHALL display the entered data in the locked field
4. WHEN a field is locked, THE System SHALL prevent further editing of that field
5. WHEN an admin wants to modify a locked field, THE System SHALL provide an "Edit" or "Unlock" button to unlock the field
6. WHEN an admin unlocks a field, THE System SHALL restore the field to its editable state
7. THE System SHALL apply the field locking mechanism to all text input fields in the clinician creation form
8. THE System SHALL apply the field locking mechanism to all number input fields in the clinician creation form
9. THE System SHALL apply the field locking mechanism to all dropdown/select fields in the clinician creation form
10. WHEN all required fields are locked, THE System SHALL enable the final "Create Clinician" button
11. WHEN any required field is not locked, THE System SHALL disable the final "Create Clinician" button

### Requirement 6: Enhanced Loading States

**User Story:** As an admin user, I want to see a clear loading indicator when creating a clinician, so that I know the system is processing my request and I should wait.

#### Acceptance Criteria

1. WHEN an admin clicks the "Create Clinician" button, THE System SHALL display a dark blue loading circle
2. WHEN the loading circle is displayed, THE System SHALL show it for a minimum of 3 seconds
3. WHEN the Backend_API completes the clinician creation operation, THE System SHALL continue showing the loading circle until the minimum 3 seconds have elapsed
4. WHEN the minimum 3 seconds have elapsed and the operation is complete, THE System SHALL hide the loading circle
5. WHEN the loading circle is displayed, THE System SHALL disable the "Create Clinician" button to prevent duplicate submissions
6. WHEN the loading circle is displayed, THE System SHALL center it on the screen or within the modal
7. THE System SHALL apply the loading state enhancement to all role creation operations (Manager, Centre Manager, Care Coordinator, Front Desk)
8. WHEN a role creation operation fails, THE System SHALL hide the loading circle and display the error message
9. WHEN a role creation operation succeeds, THE System SHALL hide the loading circle and display the success message
10. THE loading circle SHALL use the dark blue color (#1e40af or similar) consistent with the application theme

### Requirement 7: API Endpoint Verification

**User Story:** As a system administrator, I want all API endpoints for role creation to be thoroughly verified, so that the frontend and backend communicate correctly without key mapping errors.

#### Acceptance Criteria

1. WHEN the Admin_Panel sends a POST request to /api/clinicians, THE Backend_API SHALL accept the request with the correct Request_Payload structure
2. WHEN the Backend_API processes a clinician creation request, THE Backend_API SHALL validate that all required fields are present in the Request_Payload
3. WHEN the Backend_API returns a clinician creation response, THE Response_Payload SHALL include all fields expected by the Admin_Panel
4. WHEN there is a mismatch between Request_Payload field names and database column names, THE Backend_API SHALL correctly map the fields
5. WHEN the Admin_Panel sends array fields (specialization, qualification, expertise, languages), THE Backend_API SHALL correctly parse and store them as arrays
6. WHEN the Backend_API returns array fields, THE Response_Payload SHALL return them as arrays (not strings)
7. WHEN the Admin_Panel sends consultation_modes as an array, THE Backend_API SHALL store it correctly in the database
8. WHEN the Backend_API validates a clinician creation request, THE Backend_API SHALL check that specialization is a non-empty array
9. WHEN the Backend_API validates a clinician creation request, THE Backend_API SHALL check that qualification is a non-empty array
10. WHEN the Backend_API validates a clinician creation request, THE Backend_API SHALL check that languages is a non-empty array
11. WHEN the Admin_Panel sends primary_centre_id, THE Backend_API SHALL correctly map it to the primaryCentreId database field
12. WHEN the Backend_API returns a clinician record, THE Response_Payload SHALL transform snake_case database fields to camelCase for the Admin_Panel

### Requirement 8: Database Integration Testing

**User Story:** As a developer, I want to test clinician creation against the live PostgreSQL database, so that I can verify the entire data flow from frontend to database and back.

#### Acceptance Criteria

1. WHEN a clinician creation request is processed, THE Backend_API SHALL successfully insert the record into the PostgreSQL database
2. WHEN a clinician record is inserted, THE Database SHALL enforce all foreign key constraints (user_id, primary_centre_id)
3. WHEN a clinician record is inserted with array fields, THE Database SHALL store the arrays correctly using PostgreSQL array types
4. WHEN a clinician record is queried, THE Backend_API SHALL retrieve all fields including array fields correctly
5. WHEN a clinician record is updated, THE Backend_API SHALL update the database record and return the updated data
6. WHEN a clinician is toggled active/inactive, THE Database SHALL update the is_active field correctly
7. WHEN a clinician creation fails due to a database constraint, THE Backend_API SHALL catch the error and return a meaningful error message
8. WHEN multiple clinicians are created, THE Database SHALL maintain data integrity and prevent duplicate records
9. WHEN a clinician is created with availability slots, THE System SHALL store the slots in the appropriate database table
10. WHEN a clinician's availability is queried, THE Backend_API SHALL retrieve all associated availability slots correctly

### Requirement 9: Form Validation and Error Handling

**User Story:** As an admin user, I want clear validation messages when I make mistakes in the clinician creation form, so that I can correct errors quickly.

#### Acceptance Criteria

1. WHEN an admin submits the form without a required field, THE System SHALL display an error message indicating which field is missing
2. WHEN an admin enters an invalid phone number format, THE System SHALL display an error message indicating the correct format
3. WHEN an admin enters an invalid email format, THE System SHALL display an error message indicating the correct format
4. WHEN an admin enters a consultation fee of zero or negative, THE System SHALL display an error message requiring a positive fee
5. WHEN an admin enters years of experience as a negative number, THE System SHALL display an error message requiring a non-negative value
6. WHEN an admin selects no specialization, THE System SHALL display an error message requiring at least one specialization
7. WHEN an admin selects no qualification, THE System SHALL display an error message requiring at least one qualification
8. WHEN an admin selects no languages, THE System SHALL display an error message requiring at least one language
9. WHEN an admin selects no consultation modes, THE System SHALL display an error message requiring at least one mode
10. WHEN validation errors occur, THE System SHALL display all errors simultaneously (not one at a time)
11. WHEN an admin corrects a validation error, THE System SHALL remove the error message for that field
12. WHEN the Backend_API returns a validation error, THE Admin_Panel SHALL display the error message in a user-friendly format

### Requirement 10: Availability Slot Data Persistence

**User Story:** As an admin user, I want appointment slots to be saved correctly when I create a clinician, so that the clinician's availability is immediately reflected in the system.

#### Acceptance Criteria

1. WHEN an admin adds availability slots during clinician creation, THE System SHALL include the slots in the clinician creation Request_Payload
2. WHEN the Backend_API receives availability slots in the clinician creation request, THE Backend_API SHALL store each slot in the database
3. WHEN availability slots are stored, THE Database SHALL associate each slot with the correct clinician_id
4. WHEN availability slots are stored, THE Database SHALL store the day_of_week, start_time, end_time, and consultation_mode for each slot
5. WHEN a clinician is created with availability slots, THE Backend_API SHALL return the created slots in the Response_Payload
6. WHEN an admin views a clinician's details, THE System SHALL display all associated availability slots
7. WHEN an admin edits a clinician's availability, THE System SHALL update the slots in the database
8. WHEN an admin removes an availability slot, THE System SHALL delete the slot from the database
9. WHEN availability slots are queried, THE Backend_API SHALL return them sorted by day_of_week and start_time
10. WHEN availability slots overlap for the same clinician and day, THE System SHALL validate and prevent the overlap or warn the user
