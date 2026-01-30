import api from "./api";
import type { Centre } from "../types";

export interface CreateCentreRequest {
  name: string;
  city: "bangalore" | "kochi" | "mumbai";
  addressLine1: string;
  addressLine2?: string;
  pincode: string;
  contactPhone: string;
}

export interface UpdateCentreRequest {
  name?: string;
  city?: "bangalore" | "kochi" | "mumbai";
  addressLine1?: string;
  addressLine2?: string;
  pincode?: string;
  contactPhone?: string;
}

class CentreService {
  // Get all centres
  async getCentres(): Promise<Centre[]> {
    const response = await api.get("/centres");
    return response.data.data || response.data;
  }

  // Get centre by ID
  async getCentreById(id: string): Promise<Centre> {
    const response = await api.get(`/centres/${id}`);
    return response.data.data || response.data;
  }

  // Create new centre
  async createCentre(data: CreateCentreRequest): Promise<Centre> {
    const response = await api.post("/centres", data);
    return response.data.data || response.data;
  }

  // Update centre
  async updateCentre(id: string, data: UpdateCentreRequest): Promise<Centre> {
    const response = await api.put(`/centres/${id}`, data);
    return response.data.data || response.data;
  }

  // Delete centre (soft delete)
  async deleteCentre(id: string): Promise<void> {
    await api.delete(`/centres/${id}`);
  }

  // Toggle centre active status
  async toggleActive(id: string, isActive: boolean): Promise<Centre> {
    const response = await api.patch(`/centres/${id}/toggle-active`, {
      isActive,
    });
    return response.data.data || response.data;
  }
}

export default new CentreService();
