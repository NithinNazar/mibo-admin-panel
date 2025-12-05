// User Types
export type UserRole =
  | "admin"
  | "manager"
  | "centre_manager"
  | "clinician"
  | "care_coordinator"
  | "front_desk";

export interface User {
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
  lastLogin?: Date;
  isActive: boolean;
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
  | "scheduled"
  | "confirmed"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "no-show";

export interface Appointment {
  id: string;
  patientId: string;
  clinicianId: string;
  centreId: string;
  slotId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  type: "first-visit" | "follow-up";
  notes?: string;
  cancellationReason?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Patient Types
export interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other";
  address?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Clinician Types
export interface Clinician {
  id: string;
  userId: string;
  specialization: string;
  qualification: string;
  experience: number;
  centreId: string;
  consultationFee: number;
  isAvailable: boolean;
  workingHours: WorkingHours[];
}

export interface WorkingHours {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

// TimeSlot Types
export interface TimeSlot {
  id: string;
  clinicianId: string;
  centreId: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number;
  status: "available" | "booked" | "blocked";
  appointmentId?: string;
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
