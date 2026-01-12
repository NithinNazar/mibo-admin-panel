import api from "./api";

export interface CreateFrontDeskStaffRequest {
  full_name: string;
  phone: string;
  email?: string;
  centreId: number;
}

export interface FrontDeskStaffResponse {
  user: {
    id: string;
    full_name: string;
    phone: string;
    email?: string;
    username: string;
    role: string;
    centreId: string;
    isActive: boolean;
    createdAt: Date;
  };
  credentials: {
    username: string;
    password: string;
  };
}

class StaffService {
  /**
   * Create front desk staff with auto-generated credentials
   */
  async createFrontDeskStaff(
    data: CreateFrontDeskStaffRequest
  ): Promise<FrontDeskStaffResponse> {
    const response = await api.post("/staff/front-desk", data);
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
}

export default new StaffService();
