import api from "./api";
import type { Appointment, AppointmentType, AppointmentStatus } from "../types";

export interface GetAppointmentsParams {
  centreId?: string;
  clinicianId?: string;
  patientId?: string;
  date?: string; // YYYY-MM-DD
  status?: AppointmentStatus;
}

export interface CreateAppointmentRequest {
  patientId: number;
  clinicianId: number;
  centreId: number;
  appointmentType: AppointmentType;
  scheduledStartAt: string; // ISO 8601 format
  durationMinutes: number;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  scheduledStartAt?: string;
  status?: AppointmentStatus;
  notes?: string;
}

export interface CheckAvailabilityParams {
  clinicianId: string;
  centreId: string;
  date: string; // YYYY-MM-DD
}

export interface MyAppointmentsResponse {
  current: Appointment[];
  upcoming: Appointment[];
  past: Appointment[];
  summary: {
    currentCount: number;
    upcomingCount: number;
    pastCount: number;
  };
}

class AppointmentService {
  // Get all appointments (no filters)
  async getAllAppointments(): Promise<Appointment[]> {
    const response = await api.get("/appointments");
    return response.data.data || response.data;
  }

  // Get appointments with filters
  async getAppointments(
    params?: GetAppointmentsParams,
  ): Promise<Appointment[]> {
    const response = await api.get("/appointments", { params });
    return response.data.data || response.data;
  }

  // Get appointment by ID
  async getAppointmentById(id: string): Promise<Appointment> {
    const response = await api.get(`/appointments/${id}`);
    return response.data.data || response.data;
  }

  // Create new appointment
  async createAppointment(
    data: CreateAppointmentRequest,
  ): Promise<Appointment> {
    const response = await api.post("/appointments", data);
    return response.data.data || response.data;
  }

  // Update appointment
  async updateAppointment(
    id: string,
    data: UpdateAppointmentRequest,
  ): Promise<Appointment> {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data.data || response.data;
  }

  // Cancel appointment
  async cancelAppointment(id: string, reason: string): Promise<void> {
    await api.delete(`/appointments/${id}`, {
      data: { reason },
    });
  }

  // Check availability
  async checkAvailability(
    params: CheckAvailabilityParams,
  ): Promise<{ available: boolean; slots: any[] }> {
    const response = await api.get("/appointments/availability", { params });
    return response.data.data || response.data;
  }

  // Get clinician's own appointments (for CLINICIAN role)
  async getMyAppointments(): Promise<MyAppointmentsResponse> {
    const response = await api.get("/appointments/my-appointments");
    return response.data.data || response.data;
  }
}

export default new AppointmentService();
