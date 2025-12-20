# Requirements Document

## Introduction

This document outlines the requirements for enhancing the Mibo Care Admin Panel, a comprehensive management system for a mental hospital chain. The system enables staff members (Admin, Manager, Centre Manager, Clinician, Care Coordinator, and Front Desk) to manage patients, appointments, doctors, centres, and related operations. The backend API is already built with Express + TypeScript + PostgreSQL, and the frontend uses React + TypeScript + Tailwind CSS.

## Glossary

- **Admin Panel**: Web application for hospital staff to manage operations
- **Staff User**: Any user with role ADMIN, MANAGER, CENTRE_MANAGER, CLINICIAN, CARE_COORDINATOR, or FRONT_DESK
- **Clinician**: Doctor or therapist providing mental health services
- **Centre**: Physical hospital/clinic location (Bangalore, Kochi, or Mumbai)
- **Patient**: Individual receiving mental health services
- **Appointment**: Scheduled consultation between patient and clinician
- **Slot**: Time block in a clinician's schedule (available, booked, or blocked)
- **Availability Rule**: Recurring schedule defining when a clinician works at a centre
- **Session Type**: Mode of consultation (IN_PERSON or ONLINE)
- **Backend API**: Express server running on http://localhost:5000/api
- **Calendar View**: Visual representation of appointments and availability by date and time

## Requirements

### Requirement 1

**User Story:** As a staff member, I want to log in to the admin panel using multiple authentication methods, so that I can access the system securely based on my credentials.

#### Acceptance Criteria

1. WHEN a staff member enters their phone number and requests OTP, THEN the system SHALL send a 6-digit OTP to the phone number
2. WHEN a staff member enters phone number and OTP within 10 minutes, THEN the system SHALL authenticate the user and provide access tokens
3. WHEN a staff member enters phone number and password, THEN the system SHALL verify credentials and authenticate the user
4. WHEN a staff member enters username and password, THEN the system SHALL verify credentials and authenticate the user
5. WHEN authentication succeeds, THEN the system SHALL store access token, refresh token, and user data in local storage
6. WHEN authentication succeeds, THEN the system SHALL redirect the user to the dashboard page
7. WHEN access token expires, THEN the system SHALL automatically refresh the token using the refresh token
8. WHEN refresh token is invalid or expired, THEN the system SHALL redirect the user to the login page

### Requirement 2

**User Story:** As an admin or manager, I want to create and manage centres, so that I can organize hospital locations across different cities.

#### Acceptance Criteria

1. WHEN an admin or manager views the centres page, THEN the system SHALL display all centres with name, city, address, and contact information
2. WHEN an admin or manager creates a centre, THEN the system SHALL validate that city is one of bangalore, kochi, or mumbai
3. WHEN an admin or manager creates a centre, THEN the system SHALL require name, city, address line 1, pincode, and contact phone
4. WHEN a centre is created successfully, THEN the system SHALL display the new centre in the centres list
5. WHEN an admin or manager updates a centre, THEN the system SHALL save the changes and reflect them immediately
6. WHEN an admin attempts to delete a centre, THEN the system SHALL mark the centre as inactive

### Requirement 3

**User Story:** As an admin, manager, or centre manager, I want to create and manage clinicians with their availability schedules, so that patients can book appointments with available doctors.

#### Acceptance Criteria

1. WHEN creating a clinician, THEN the system SHALL require name, specialization, registration number, years of experience, primary centre, and consultation fee
2. WHEN creating a clinician, THEN the system SHALL allow setting availability rules for each centre where the clinician works
3. WHEN setting availability rules, THEN the system SHALL require day of week, start time, end time, slot duration, and session mode
4. WHEN availability rules are saved, THEN the system SHALL generate time slots based on the rules
5. WHEN a clinician is created, THEN the system SHALL display the clinician in the clinicians list with their details
6. WHEN updating a clinician, THEN the system SHALL allow modifying profile information and availability rules
7. WHEN viewing clinicians list, THEN the system SHALL display name, specialization, experience, primary centre, and consultation fee

### Requirement 4

**User Story:** As a staff member, I want to view clinician availability in a calendar format, so that I can see available and booked slots at a glance.

#### Acceptance Criteria

1. WHEN viewing a clinician's schedule, THEN the system SHALL display a calendar view with dates and time slots
2. WHEN a time slot is available, THEN the system SHALL display it with a visual indicator showing it is free
3. WHEN a time slot is booked, THEN the system SHALL display it with patient name and appointment details
4. WHEN a time slot is blocked, THEN the system SHALL display it as unavailable
5. WHEN selecting a date in the calendar, THEN the system SHALL show all slots for that clinician on that date
6. WHEN filtering by centre, THEN the system SHALL show only slots for the selected centre
7. WHEN viewing the calendar, THEN the system SHALL display slot duration and session type for each slot

### Requirement 5

**User Story:** As an admin, manager, or front desk staff, I want to book appointments for patients, so that I can schedule consultations with clinicians.

#### Acceptance Criteria

1. WHEN booking an appointment, THEN the system SHALL require selecting a centre first
2. WHEN a centre is selected, THEN the system SHALL display clinicians available at that centre
3. WHEN a clinician is selected, THEN the system SHALL display available dates and time slots
4. WHEN a date is selected, THEN the system SHALL show all available slots for that clinician on that date
5. WHEN booking an appointment, THEN the system SHALL require selecting patient, session type, and time slot
6. WHEN session type is ONLINE or IN_PERSON, THEN the system SHALL validate the clinician supports that mode
7. WHEN an appointment is booked successfully, THEN the system SHALL mark the slot as booked and display confirmation
8. WHEN booking conflicts with existing appointment, THEN the system SHALL prevent the booking and show error message

### Requirement 6

**User Story:** As a staff member, I want to view and manage patient information, so that I can maintain accurate patient records.

#### Acceptance Criteria

1. WHEN viewing patients list, THEN the system SHALL display patient name, phone, email, date of birth, and gender
2. WHEN searching for patients, THEN the system SHALL filter results by name or phone number
3. WHEN creating a patient, THEN the system SHALL require full name and phone number
4. WHEN creating a patient, THEN the system SHALL allow optional fields for email, date of birth, gender, and emergency contact
5. WHEN a patient is created, THEN the system SHALL add the patient to the database with user_type set to PATIENT
6. WHEN viewing patient details, THEN the system SHALL display appointment history and medical notes
7. WHEN updating patient information, THEN the system SHALL save changes and reflect them immediately

### Requirement 7

**User Story:** As a staff member, I want to view appointments filtered by various criteria, so that I can manage the appointment schedule effectively.

#### Acceptance Criteria

1. WHEN viewing appointments, THEN the system SHALL display patient name, clinician name, centre name, date, time, status, and type
2. WHEN filtering by centre, THEN the system SHALL show only appointments for the selected centre
3. WHEN filtering by clinician, THEN the system SHALL show only appointments for the selected clinician
4. WHEN filtering by date, THEN the system SHALL show only appointments on the selected date
5. WHEN filtering by status, THEN the system SHALL show only appointments with the selected status
6. WHEN viewing appointment details, THEN the system SHALL display complete information including notes and patient contact
7. WHEN cancelling an appointment, THEN the system SHALL update status to CANCELLED and free the time slot

### Requirement 8

**User Story:** As a clinician, I want to view my own appointments categorized by time period, so that I can manage my schedule efficiently.

#### Acceptance Criteria

1. WHEN a clinician logs in, THEN the system SHALL display a dashboard with current, upcoming, and past appointments
2. WHEN viewing current appointments, THEN the system SHALL show appointments scheduled for today
3. WHEN viewing upcoming appointments, THEN the system SHALL show appointments scheduled for future dates
4. WHEN viewing past appointments, THEN the system SHALL show completed or past appointments
5. WHEN viewing appointments, THEN the system SHALL display patient name, phone, centre name, date, time, and session type
6. WHEN a clinician views appointments, THEN the system SHALL show only appointments assigned to that clinician
7. WHEN appointment status changes, THEN the system SHALL update the categorization automatically

### Requirement 9

**User Story:** As an admin or manager, I want to view dashboard analytics, so that I can monitor system performance and make informed decisions.

#### Acceptance Criteria

1. WHEN viewing the dashboard, THEN the system SHALL display total patients count with percentage change
2. WHEN viewing the dashboard, THEN the system SHALL display active doctors count with percentage change
3. WHEN viewing the dashboard, THEN the system SHALL display follow-ups booked count with percentage change
4. WHEN viewing the dashboard, THEN the system SHALL display total revenue with percentage change
5. WHEN viewing the dashboard, THEN the system SHALL display top performing doctors by patient count
6. WHEN viewing the dashboard, THEN the system SHALL display revenue trends over time
7. WHEN viewing the dashboard, THEN the system SHALL display appointment sources distribution

### Requirement 10

**User Story:** As a staff member, I want the system to match database schema exactly, so that data integrity is maintained and conflicts are avoided.

#### Acceptance Criteria

1. WHEN creating or updating clinician profiles, THEN the system SHALL use column name years_of_experience not experience_years
2. WHEN creating or updating availability rules, THEN the system SHALL use column name mode not consultation_mode
3. WHEN creating or updating availability rules, THEN the system SHALL require centre_id as a non-null value
4. WHEN storing consultation modes, THEN the system SHALL use JSONB format in the database
5. WHEN referencing appointment types, THEN the system SHALL use values IN_PERSON, ONLINE, INPATIENT_ASSESSMENT, or FOLLOW_UP
6. WHEN referencing appointment status, THEN the system SHALL use values BOOKED, CONFIRMED, RESCHEDULED, COMPLETED, CANCELLED, or NO_SHOW
7. WHEN storing user types, THEN the system SHALL use PATIENT or STAFF as defined in the database schema
