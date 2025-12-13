import api from "./api";
import type { DashboardMetrics } from "../types";

export interface TopDoctor {
  id: string;
  name: string;
  specialty: string;
  avatar?: string;
  patientCount: number;
}

export interface RevenueDataPoint {
  date: string;
  value: number;
}

export interface LeadSource {
  label: string;
  value: number;
  color: string;
}

export type RevenuePeriod = "month" | "week" | "year";

class AnalyticsService {
  // Get dashboard metrics
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const response = await api.get("/analytics/dashboard");
    return response.data.data || response.data;
  }

  // Get top performing doctors
  async getTopDoctors(): Promise<TopDoctor[]> {
    const response = await api.get("/analytics/top-doctors");
    return response.data.data || response.data;
  }

  // Get revenue data over time
  async getRevenueData(
    period: RevenuePeriod = "month"
  ): Promise<RevenueDataPoint[]> {
    const response = await api.get("/analytics/revenue", {
      params: { period },
    });
    return response.data.data || response.data;
  }

  // Get appointment leads by source
  async getLeadsBySource(): Promise<LeadSource[]> {
    const response = await api.get("/analytics/leads-by-source");
    return response.data.data || response.data;
  }
}

export default new AnalyticsService();
