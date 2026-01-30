// User Types
export type UserRole =
  | "ADMIN"
  | "MANAGER"
  | "CENTRE_MANAGER"
  | "CLINICIAN"
  | "CARE_COORDINATOR"
  | "FRONT_DESK";

export type UserType = "PATIENT" | "STAFF";

export interface User {
  id: string;
  name: string;
  full_name?: string; // Backend returns full_name
  email?: string;
  phone: string;
  username?: string;
  role: UserRole;
  roles?: Array<{ id: number; name: string }>; // Backend also includes roles array
  avatar?: string;
  centreIds: string[];
  assignedCentreId?: string; // Primary centre for FRONT_DESK and CENTRE_MANAGER
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  isActive: boolean;
  userType?: UserType;
}

// Centre Types
export interface Centre {
  id: string;
  name: string;
  location: string;
  city: "bangalore" | "kochi" | "mumbai";
  address: string;
  phone: string;
  email: string;
  managerId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Appointment Types
export type AppointmentStatus =
  | "BOOKED"
  | "CONFIRMED"
  | "RESCHEDULED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type AppointmentType =
  | "IN_PERSON"
  | "ONLINE"
  | "INPATIENT_ASSESSMENT"
  | "FOLLOW_UP";

export type AppointmentSource =
  | "WEB_PATIENT"
  | "ADMIN_FRONT_DESK"
  | "ADMIN_CARE_COORDINATOR"
  | "ADMIN_MANAGER";

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  clinicianId: string;
  clinicianName: string;
  centreId: string;
  centreName: string;
  centreAddress: string;
  appointmentType: AppointmentType;
  scheduledStartAt: Date;
  scheduledEndAt: Date;
  durationMinutes: number;
  status: AppointmentStatus;
  notes?: string;
  bookedByUserId: string;
  bookedByUserName: string;
  source: AppointmentSource;
  createdAt: Date;
  updatedAt: Date;
}

// Patient Types
export interface Patient {
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

// Clinician Types
export type ConsultationMode = "IN_PERSON" | "ONLINE";

export interface Clinician {
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
  consultationModes: ConsultationMode[];
  defaultDurationMinutes: number;
  profilePictureUrl?: string;
  designation?: string;
  qualification?: string;
  expertise?: string[];
  languages?: string[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AvailabilityRule {
  id?: string;
  clinicianId: string;
  centreId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  slotDurationMinutes: number;
  mode: ConsultationMode;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// TimeSlot Types
export interface TimeSlot {
  id?: string;
  clinicianId: string;
  centreId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: "available" | "booked" | "blocked";
  appointmentId?: string;
  mode: ConsultationMode;
}

// Analytics Types
export interface DashboardMetrics {
  totalPatients: number;
  totalPatientsChange: number;
  activeDoctors: number;
  activeDoctorsChange: number;
  followUpsBooked: number;
  followUpsBookedChange: number;
  totalRevenue: number;
  totalRevenueChange: number;
}
