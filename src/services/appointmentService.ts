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
  patient_id: number;
  clinician_id: number;
  centre_id: number;
  appointment_type: AppointmentType;
  scheduled_start_at: string; // ISO 8601 format
  duration_minutes: number;
  notes?: string;
  patient_notes?: string; // Patient notes entered during booking
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

  // Reschedule appointment
  async rescheduleAppointment(
    id: string,
    newDateTime: string,
  ): Promise<Appointment> {
    const response = await api.put(`/appointments/${id}`, {
      scheduledStartAt: newDateTime,
    });
    return response.data.data || response.data;
  }

  // ==========================================
  // CLINICIAN DASHBOARD APIs
  // ==========================================

  // Get clinician dashboard statistics
  async getClinicianDashboardStats(
    startDate: string,
    endDate: string,
  ): Promise<any> {
    const response = await api.get("/appointments/dashboard/stats", {
      params: { startDate, endDate },
    });
    return response.data.data || response.data;
  }

  // Get clinician's appointments for dashboard
  async getClinicianDashboardAppointments(
    startDate: string,
    endDate: string,
    status?: string,
  ): Promise<any[]> {
    const response = await api.get("/appointments/dashboard/appointments", {
      params: { startDate, endDate, status },
    });
    return response.data.data || response.data;
  }

  // Confirm direct payment (CASH/CARD/UPI) at front desk
  async confirmDirectPayment(
    appointmentId: number,
    paymentMethod: "CASH" | "CARD" | "UPI",
  ): Promise<any> {
    const response = await api.post(
      `/appointments/${appointmentId}/confirm-direct-payment`,
      { paymentMethod },
    );
    return response.data.data || response.data;
  }

  // Start a session
  async startSession(appointmentId: number): Promise<Appointment> {
    const response = await api.post(
      `/appointments/${appointmentId}/start-session`,
    );
    return response.data.data || response.data;
  }

  // End a session
  async endSession(appointmentId: number): Promise<Appointment> {
    const response = await api.post(
      `/appointments/${appointmentId}/end-session`,
    );
    return response.data.data || response.data;
  }

  // Save clinician notes
  async saveClinicianNotes(
    appointmentId: number,
    sessionNotes: string,
  ): Promise<any> {
    const response = await api.post(
      `/appointments/${appointmentId}/clinician-notes`,
      { session_notes: sessionNotes },
    );
    return response.data.data || response.data;
  }

  // Get previous session notes
  async getPreviousSessionNotes(
    appointmentId: number,
    patientId: number,
  ): Promise<any[]> {
    const response = await api.get(
      `/appointments/${appointmentId}/previous-notes`,
      {
        params: { patientId },
      },
    );
    return response.data.data || response.data;
  }

  // Schedule follow-up
  async scheduleFollowUp(
    appointmentId: number,
    followUpDate: string,
    followUpNotes: string,
  ): Promise<any> {
    const response = await api.post(
      `/appointments/${appointmentId}/schedule-followup`,
      {
        follow_up_date: followUpDate,
        follow_up_notes: followUpNotes,
      },
    );
    return response.data.data || response.data;
  }
}

export default new AppointmentService();
