import api from "./api";
import type { Clinician, AvailabilityRule, TimeSlot } from "../types";

export interface CreateClinicianRequest {
  userId: number;
  primaryCentreId: number;
  specialization: string;
  registrationNumber: string;
  yearsOfExperience: number;
  consultationFee: number;
  bio?: string;
  consultationModes: string[];
  defaultDurationMinutes?: number;
  profilePictureUrl?: string;
}

export interface UpdateClinicianRequest {
  primaryCentreId?: number;
  specialization?: string;
  registrationNumber?: string;
  yearsOfExperience?: number;
  consultationFee?: number;
  bio?: string;
  consultationModes?: string[];
  defaultDurationMinutes?: number;
  profilePictureUrl?: string;
}

export interface GetCliniciansParams {
  centreId?: string;
  specialization?: string;
}

export interface GetAvailabilityParams {
  clinicianId: string;
  centreId?: string;
  date?: string; // YYYY-MM-DD
}

class ClinicianService {
  // Get all clinicians with optional filters
  async getClinicians(params?: GetCliniciansParams): Promise<Clinician[]> {
    const response = await api.get("/clinicians", { params });
    return response.data.data || response.data;
  }

  // Get clinician by ID
  async getClinicianById(id: string): Promise<Clinician> {
    const response = await api.get(`/clinicians/${id}`);
    return response.data.data || response.data;
  }

  // Create new clinician
  async createClinician(data: CreateClinicianRequest): Promise<Clinician> {
    const response = await api.post("/clinicians", data);
    return response.data.data || response.data;
  }

  // Update clinician
  async updateClinician(
    id: string,
    data: UpdateClinicianRequest,
  ): Promise<Clinician> {
    const response = await api.put(`/clinicians/${id}`, data);
    return response.data.data || response.data;
  }

  // Delete clinician (soft delete)
  async deleteClinician(id: string): Promise<void> {
    await api.delete(`/clinicians/${id}`);
  }

  // Toggle clinician active status
  async toggleActive(id: string, isActive: boolean): Promise<Clinician> {
    const response = await api.patch(`/clinicians/${id}/toggle-active`, {
      isActive,
    });
    return response.data.data || response.data;
  }

  // Get clinician availability
  async getAvailability(clinicianId: string): Promise<AvailabilityRule[]> {
    const response = await api.get(`/clinicians/${clinicianId}/availability`);
    return response.data.data || response.data;
  }

  // Update clinician availability (bulk update all rules)
  async updateAvailability(
    clinicianId: string,
    rules: Omit<AvailabilityRule, "id" | "clinicianId">[],
  ): Promise<AvailabilityRule[]> {
    const response = await api.put(`/clinicians/${clinicianId}/availability`, {
      availability_rules: rules,
    });
    return response.data.data || response.data;
  }
}

export default new ClinicianService();
