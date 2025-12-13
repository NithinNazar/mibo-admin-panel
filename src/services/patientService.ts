import api from "./api";
import type { Patient, Appointment } from "../types";

export interface GetPatientsParams {
  search?: string; // Search by name or phone
}

export interface CreatePatientRequest {
  fullName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  gender?: "male" | "female" | "other";
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
}

export interface UpdatePatientRequest {
  fullName?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
}

export interface PatientDetailsResponse extends Patient {
  appointments: Appointment[];
  medicalNotes: Array<{
    id: string;
    noteText: string;
    authorName: string;
    createdAt: Date;
  }>;
}

class PatientService {
  // Get patients with optional search
  async getPatients(params?: GetPatientsParams): Promise<Patient[]> {
    const response = await api.get("/patients", { params });
    return response.data.data || response.data;
  }

  // Get patient by ID with full details
  async getPatientById(id: string): Promise<PatientDetailsResponse> {
    const response = await api.get(`/patients/${id}`);
    return response.data.data || response.data;
  }

  // Create new patient
  async createPatient(data: CreatePatientRequest): Promise<Patient> {
    const response = await api.post("/patients", data);
    return response.data.data || response.data;
  }

  // Update patient
  async updatePatient(
    id: string,
    data: UpdatePatientRequest
  ): Promise<Patient> {
    const response = await api.put(`/patients/${id}`, data);
    return response.data.data || response.data;
  }

  // Get patient appointments
  async getPatientAppointments(id: string): Promise<Appointment[]> {
    const response = await api.get(`/patients/${id}/appointments`);
    return response.data.data || response.data;
  }

  // Add medical note to patient
  async addMedicalNote(
    patientId: string,
    noteText: string
  ): Promise<{ id: string; noteText: string; createdAt: Date }> {
    const response = await api.post(`/patients/${patientId}/notes`, {
      noteText,
    });
    return response.data.data || response.data;
  }
}

export default new PatientService();
