import api from "./api";

export interface CreateManagerRequest {
  full_name: string;
  phone: string;
  email?: string;
  username: string;
  password: string;
}

export interface CreateCentreManagerRequest {
  full_name: string;
  phone: string;
  email?: string;
  username: string;
  password: string;
  centreId: number;
}

export interface CreateCareCoordinatorRequest {
  full_name: string;
  phone: string;
  email?: string;
  username: string;
  password: string;
  centreId: number;
}

export interface CreateFrontDeskStaffRequest {
  full_name: string;
  phone: string;
  email?: string;
  username: string;
  password: string;
  centreId: number;
}

export interface StaffResponse {
  user: {
    id: string;
    full_name: string;
    phone: string;
    email?: string;
    username: string;
    role: string;
    centreId?: string;
    isActive: boolean;
    createdAt: Date;
  };
}

class StaffService {
  /**
   * Create Manager
   */
  async createManager(data: CreateManagerRequest): Promise<StaffResponse> {
    const response = await api.post("/users/managers", data);
    return response.data.data || response.data;
  }

  /**
   * Create Centre Manager
   */
  async createCentreManager(
    data: CreateCentreManagerRequest,
  ): Promise<StaffResponse> {
    const response = await api.post("/users/centre-managers", data);
    return response.data.data || response.data;
  }

  /**
   * Create Care Coordinator
   */
  async createCareCoordinator(
    data: CreateCareCoordinatorRequest,
  ): Promise<StaffResponse> {
    const response = await api.post("/users/care-coordinators", data);
    return response.data.data || response.data;
  }

  /**
   * Create front desk staff
   */
  async createFrontDeskStaff(
    data: CreateFrontDeskStaffRequest,
  ): Promise<StaffResponse> {
    const response = await api.post("/users/front-desk", data);
    return response.data.data || response.data;
  }

  /**
   * Get all front desk staff
   */
  async getFrontDeskStaff(): Promise<any[]> {
    const response = await api.get("/users", {
      params: { roleId: 6 }, // FRONT_DESK role ID
    });
    return response.data.data || response.data;
  }

  /**
   * Get staff by ID
   */
  async getStaffById(id: string): Promise<any> {
    const response = await api.get(`/users/${id}`);
    return response.data.data || response.data;
  }

  /**
   * Update staff
   */
  async updateStaff(id: string, data: any): Promise<any> {
    const response = await api.put(`/users/${id}`, data);
    return response.data.data || response.data;
  }

  /**
   * Delete staff
   */
  async deleteStaff(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  }

  /**
   * Toggle staff active status
   */
  async toggleActive(id: string, isActive: boolean): Promise<any> {
    const response = await api.patch(`/users/${id}/toggle-active`, {
      isActive,
    });
    return response.data.data || response.data;
  }

  /**
   * Get staff by role ID
   */
  async getStaffByRole(roleId: number): Promise<any[]> {
    const response = await api.get("/users", {
      params: { roleId },
    });
    return response.data.data || response.data;
  }
}

export default new StaffService();
