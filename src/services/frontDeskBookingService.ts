import api from "./api";
import type { AppointmentType } from "../types";

export interface FrontDeskBookingRequest {
  clinicianId: number;
  centreId: number;
  patientPhone: string;
  patientName: string;
  patientEmail?: string;
  appointmentType: AppointmentType;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  notes?: string;
}

export interface FrontDeskBookingResponse {
  appointment: {
    id: string;
    appointmentType: string;
    scheduledStartAt: Date;
    scheduledEndAt: Date;
    durationMinutes: number;
    status: string;
    notes?: string;
  };
  patient: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  clinician: {
    id: string;
    name: string;
    specialization: string;
    consultationFee: number;
  };
  centre: {
    id: string;
    name: string;
    address: string;
    city: string;
  };
  paymentRequired: boolean;
  amount: number;
}

class FrontDeskBookingService {
  /**
   * Book appointment for patient (Front Desk)
   */
  async bookForPatient(
    data: FrontDeskBookingRequest
  ): Promise<FrontDeskBookingResponse> {
    const response = await api.post("/booking/front-desk", data);
    return response.data.data || response.data;
  }
}

export default new FrontDeskBookingService();
