# Requirements Document

## Introduction

This document outlines the requirements for a comprehensive admin panel for a mental hospital chain. The admin panel will provide role-based access control, appointment management, analytics dashboards, and multi-center operations management. The system will support multiple user roles (Admin, Manager, Centre Manager, Clinician, Care Coordinator, Front Desk) with specific permissions and capabilities for each role.

## Glossary

- **Admin Panel**: The web-based administrative interface for managing hospital operations
- **System**: The complete admin panel application
- **User**: Any authenticated person using the admin panel (Admin, Manager, Centre Manager, Clinician, Care Coordinator, or Front Desk staff)
- **Centre**: A physical hospital location (Bangalore, Kochi, or Mumbai)
- **Clinician**: A doctor or medical professional providing patient care
- **Appointment**: A scheduled patient visit with a clinician
- **Follow-up**: A subsequent appointment for continued patient care
- **Booking**: The act of scheduling an appointment
- **Care Coordinator**: Staff member who manages patient flow outside clinician rooms
- **Slot**: An available time period for appointments
- **OTP**: One-Time Password for authentication
- **Dashboard**: The main analytics and overview screen
- **Role**: A set of permissions assigned to a user type

## Requirements

### Requirement 1: User Authentication

**User Story:** As a user, I want to log in to the admin panel using multiple authentication methods, so that I can securely access the system based on my credentials.

#### Acceptance Criteria

1. WHEN a user enters a valid phone number and requests OTP, THE System SHALL send a one-time password to the provided phone number
2. WHEN a user enters a valid phone number and password combination, THE System SHALL authenticate the user and grant access
3. WHEN a user enters a valid username and password combination, THE System SHALL authenticate the user and grant access
4. IF authentication fails after three consecutive attempts, THEN THE System SHALL temporarily lock the account for 15 minutes
5. WHEN a user successfully authenticates, THE System SHALL create a session token valid for 24 hours

### Requirement 2: Dashboard Analytics Display

**User Story:** As an admin or manager, I want to view comprehensive analytics on the dashboard, so that I can quickly assess hospital operations and performance.

#### Acceptance Criteria

1. WHEN the dashboard loads, THE System SHALL display total patient count with percentage change from previous month
2. WHEN the dashboard loads, THE System SHALL display active doctor count with percentage change from previous month
3. WHEN the dashboard loads, THE System SHALL display follow-up bookings count with percentage change from previous month
4. WHEN the dashboard loads, THE System SHALL display total revenue with percentage change from previous month
5. WHEN the dashboard loads, THE System SHALL render a donut chart showing leads by source with at least four categories
6. WHEN the dashboard loads, THE System SHALL render an area chart showing revenue analytics over time
7. WHEN the dashboard loads, THE System SHALL display a list of top performing doctors with patient counts

### Requirement 3: Role-Based Access Control

**User Story:** As an admin, I want to assign specific roles to users, so that each user has appropriate access permissions for their responsibilities.

#### Acceptance Criteria

1. WHEN an admin creates a new user account, THE System SHALL require assignment of exactly one role from the available role types
2. WHERE a user has Admin role, THE System SHALL grant access to all features including centre management, clinician management, and role creation
3. WHERE a user has Manager role, THE System SHALL grant access to view bookings across all centres
4. WHERE a user has Centre Manager role, THE System SHALL grant access to view and manage bookings, doctors, and slots for assigned centres only
5. WHERE a user has Clinician role, THE System SHALL grant access to view appointments assigned to that clinician only
6. WHERE a user has Care Coordinator role, THE System SHALL grant access to view, reschedule, and cancel bookings
7. WHERE a user has Front Desk role, THE System SHALL grant access to view availability, book slots, and cancel bookings only

### Requirement 4: Centre Management

**User Story:** As an admin, I want to manage hospital centres, so that I can add new locations or update existing centre information.

#### Acceptance Criteria

1. WHEN an admin creates a new centre, THE System SHALL require centre name, location, and contact information
2. WHEN an admin edits a centre, THE System SHALL update the centre information and reflect changes across all related bookings
3. WHEN an admin deletes a centre, THE System SHALL prevent deletion if active appointments exist for that centre
4. THE System SHALL display centres for Bangalore, Kochi, and Mumbai in the navigation sidebar
5. WHEN a centre manager accesses the system, THE System SHALL display only the centres assigned to that manager

### Requirement 5: Clinician Management

**User Story:** As an admin or centre manager, I want to manage clinicians, so that I can maintain an accurate roster of medical professionals.

#### Acceptance Criteria

1. WHEN an admin or centre manager adds a clinician, THE System SHALL require name, specialization, phone number, and assigned centre
2. WHEN an admin or centre manager edits a clinician, THE System SHALL update the clinician information across all related appointments
3. WHEN an admin or centre manager deletes a clinician, THE System SHALL prevent deletion if future appointments exist for that clinician
4. THE System SHALL assign each clinician to exactly one centre
5. WHEN a clinician is created, THE System SHALL generate login credentials for that clinician

### Requirement 6: Appointment Booking

**User Story:** As a front desk staff member, I want to book appointments for patients, so that patients can schedule visits with clinicians.

#### Acceptance Criteria

1. WHEN a user books an appointment, THE System SHALL require patient name, phone number, clinician selection, and time slot selection
2. WHEN a user selects a clinician, THE System SHALL display only available time slots for that clinician
3. WHEN a user confirms a booking, THE System SHALL mark the selected slot as unavailable
4. IF a selected slot becomes unavailable before confirmation, THEN THE System SHALL notify the user and prevent double booking
5. WHEN an appointment is booked, THE System SHALL send confirmation notification to the patient phone number

### Requirement 7: Appointment Management by Care Coordinators

**User Story:** As a care coordinator, I want to manage patient appointments in real-time, so that I can optimize clinician schedules based on patient attendance.

#### Acceptance Criteria

1. WHEN a care coordinator views appointments, THE System SHALL display current, upcoming, and past appointments for the assigned centre
2. WHEN a booked patient does not arrive, THE System SHALL allow the care coordinator to mark the appointment as no-show
3. WHEN a care coordinator reschedules an appointment, THE System SHALL display available alternative slots
4. WHEN a care coordinator cancels an appointment, THE System SHALL mark the slot as available and send cancellation notification
5. WHEN a walk-in patient arrives, THE System SHALL allow the care coordinator to assign the next available slot

### Requirement 8: Slot Management

**User Story:** As a centre manager, I want to manage appointment slots, so that I can control clinician availability and scheduling.

#### Acceptance Criteria

1. WHEN a centre manager creates slots, THE System SHALL require clinician selection, date, start time, end time, and slot duration
2. WHEN a centre manager creates slots, THE System SHALL generate individual bookable slots based on the specified duration
3. WHEN a centre manager deletes a slot, THE System SHALL prevent deletion if the slot has a confirmed booking
4. THE System SHALL display slot availability status as available, booked, or blocked
5. WHEN a centre manager blocks a slot, THE System SHALL mark the slot as unavailable for booking

### Requirement 9: Reports and Analytics

**User Story:** As a manager, I want to view detailed reports, so that I can analyze appointment trends and operational metrics.

#### Acceptance Criteria

1. WHEN a user accesses the reports section, THE System SHALL display tabular data for appointments with filters for date range and centre
2. WHEN a user accesses the reports section, THE System SHALL display tabular data for follow-ups with filters for date range and status
3. WHEN a user exports a report, THE System SHALL generate a downloadable file in CSV format
4. THE System SHALL calculate and display appointment completion rate as a percentage
5. THE System SHALL calculate and display average wait time in minutes for each centre

### Requirement 10: User Interface Design

**User Story:** As a user, I want a modern and intuitive interface, so that I can efficiently navigate and use the admin panel.

#### Acceptance Criteria

1. THE System SHALL use #293346 as the primary background color for the interface
2. THE System SHALL use teal greenish-blue and deep blue as accent colors throughout the interface
3. WHEN the admin panel loads, THE System SHALL display a header with logo on the top left
4. WHEN the admin panel loads, THE System SHALL display current user profile picture, settings icon, and logout button on the top right
5. THE System SHALL display a sidebar with navigation organized under Main, Staff, and Settings sections
6. WHEN a user hovers over a sidebar item, THE System SHALL highlight the item with a visual indicator
7. THE System SHALL render all charts and graphs with smooth animations on load
8. THE System SHALL maintain responsive design for screen widths between 1024px and 1920px

### Requirement 11: Follow-up Tracking

**User Story:** As a clinician, I want to track patient follow-ups, so that I can ensure continuity of care.

#### Acceptance Criteria

1. WHEN a clinician completes an appointment, THE System SHALL allow marking the appointment as requiring follow-up
2. WHEN a follow-up is created, THE System SHALL require follow-up date and notes
3. WHEN a follow-up date approaches within 3 days, THE System SHALL display a notification on the dashboard
4. THE System SHALL display follow-up status as pending, completed, or cancelled
5. WHEN a follow-up is completed, THE System SHALL allow the clinician to add completion notes

### Requirement 12: Multi-Centre Operations

**User Story:** As a manager, I want to view operations across multiple centres, so that I can oversee the entire hospital chain.

#### Acceptance Criteria

1. WHEN a manager accesses the dashboard, THE System SHALL display aggregated metrics from all centres
2. WHEN a manager selects a specific centre, THE System SHALL filter all data to show only that centre's information
3. THE System SHALL display centre-specific performance metrics including appointment volume and revenue
4. WHEN comparing centres, THE System SHALL display side-by-side metrics for selected centres
5. THE System SHALL calculate and display the highest performing centre based on appointment volume

### Requirement 13: Settings Management

**User Story:** As a user, I want to manage my account settings, so that I can customize my profile and preferences.

#### Acceptance Criteria

1. WHEN a user accesses settings, THE System SHALL display current profile information including name, phone, and email
2. WHEN a user updates profile information, THE System SHALL validate the new information before saving
3. WHEN a user changes password, THE System SHALL require current password verification
4. THE System SHALL allow users to upload a profile picture in JPG or PNG format with maximum size of 2MB
5. WHEN a user updates settings, THE System SHALL display a confirmation message upon successful save

### Requirement 14: Support Access

**User Story:** As a user, I want to access support resources, so that I can get help when encountering issues.

#### Acceptance Criteria

1. WHEN a user accesses the support section, THE System SHALL display contact information for technical support
2. WHEN a user submits a support ticket, THE System SHALL require subject, description, and priority level
3. WHEN a support ticket is submitted, THE System SHALL send confirmation email to the user
4. THE System SHALL display a list of frequently asked questions with expandable answers
5. THE System SHALL provide a search function to find relevant support articles
