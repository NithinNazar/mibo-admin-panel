import api from "./api";
import type { Clinician, AvailabilityRule } from "../types";

export interface CreateClinicianRequest {
  userId: number;
  primaryCentreId: number;
  specialization: string[];
  registrationNumber: string;
  yearsOfExperience: number;
  consultationFee: number;
  bio?: string;
  consultationModes: string[];
  defaultDurationMinutes?: number;
  profilePictureUrl?: string;
  qualification?: string[];
  expertise?: string[];
  languages?: string[];
}

export interface UpdateClinicianRequest {
  primaryCentreId?: number;
  specialization?: string[];
  registrationNumber?: string;
  yearsOfExperience?: number;
  consultationFee?: number;
  bio?: string;
  consultationModes?: string[];
  defaultDurationMinutes?: number;
  profilePictureUrl?: string;
  qualification?: string[];
  expertise?: string[];
  languages?: string[];
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
  // Helper method to extract error message from API response
  private extractErrorMessage(error: any): string {
    // Check for axios error response
    if (error.response) {
      const { data, status } = error.response;

      // Handle different status codes
      if (status === 400) {
        // Bad request - validation errors
        if (data.message) {
          return data.message;
        }
        if (data.errors && Array.isArray(data.errors)) {
          return data.errors.join(", ");
        }
        return "Invalid request. Please check your input.";
      }

      if (status === 409) {
        // Conflict - duplicate entries
        if (data.message) {
          return data.message;
        }
        return "A record with this information already exists.";
      }

      if (status === 404) {
        // Not found
        return data.message || "Resource not found.";
      }

      if (status === 500) {
        // Server error
        return (
          data.message ||
          "An unexpected server error occurred. Please try again later."
        );
      }

      // Generic error with message
      if (data.message) {
        return data.message;
      }

      // Generic error with error field
      if (data.error) {
        return data.error;
      }
    }

    // Network error or no response
    if (error.request) {
      return "Unable to connect to the server. Please check your internet connection.";
    }

    // Other errors
    return error.message || "An unexpected error occurred.";
  }

  // Get all clinicians with optional filters
  async getClinicians(params?: GetCliniciansParams): Promise<Clinician[]> {
    try {
      const response = await api.get("/users/clinicians", { params });
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  // Get clinician by ID
  async getClinicianById(id: string): Promise<Clinician> {
    try {
      const response = await api.get(`/users/clinicians/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  // Create new clinician
  async createClinician(data: CreateClinicianRequest): Promise<Clinician> {
    try {
      const response = await api.post("/users/clinicians", data);
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  // Update clinician
  async updateClinician(
    id: string,
    data: UpdateClinicianRequest,
  ): Promise<Clinician> {
    try {
      const response = await api.put(`/users/clinicians/${id}`, data);
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  // Delete clinician (soft delete)
  async deleteClinician(id: string): Promise<void> {
    try {
      await api.delete(`/users/clinicians/${id}`);
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  // Toggle clinician active status
  async toggleActive(id: string, isActive: boolean): Promise<Clinician> {
    try {
      const response = await api.patch(
        `/users/clinicians/${id}/toggle-active`,
        {
          isActive,
        },
      );
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  // Get clinician availability
  async getAvailability(
    params: GetAvailabilityParams,
  ): Promise<AvailabilityRule[]> {
    try {
      const response = await api.get(
        `/users/clinicians/${params.clinicianId}/availability`,
        {
          params: {
            centreId: params.centreId,
            date: params.date,
          },
        },
      );
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  // Update clinician availability (bulk update all rules)
  async updateAvailability(
    clinicianId: string,
    rules: Omit<AvailabilityRule, "id" | "clinicianId">[],
  ): Promise<AvailabilityRule[]> {
    try {
      const response = await api.put(
        `/users/clinicians/${clinicianId}/availability`,
        {
          availability_rules: rules,
        },
      );
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }

  // Get clinician time slots for a specific date
  async getSlots(params: {
    clinicianId: string;
    date: string; // YYYY-MM-DD
    centreId?: string;
  }): Promise<any[]> {
    try {
      const response = await api.get(
        `/users/clinicians/${params.clinicianId}/slots`,
        {
          params: {
            date: params.date,
            centreId: params.centreId,
          },
        },
      );
      return response.data.data || response.data;
    } catch (error) {
      throw new Error(this.extractErrorMessage(error));
    }
  }
}

export default new ClinicianService();
