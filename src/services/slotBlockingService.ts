// Admin Panel - Slot Blocking Service
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface BlockSlotRequest {
  clinician_id: number;
  centre_id: number;
  date: string;
  start_time: string;
  end_time: string;
  reason?: string;
}

export interface AffectedPatient {
  patient_id: number;
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  appointment_id: number;
  appointment_time: string;
  clinician_name: string;
  payment_status: string | null;
  refund_eligible: boolean;
}

export interface BlockedSlot {
  id: number;
  clinician_id: number;
  centre_id: number;
  blocked_date: string;
  start_time: string;
  end_time: string;
  reason: string;
  blocked_by_admin_id: number;
  blocked_at: string;
  is_blocked: boolean;
  clinician_name?: string;
  centre_name?: string;
  blocked_by_admin_name?: string;
}

class SlotBlockingService {
  private getAuthHeader() {
    const token = localStorage.getItem("adminToken");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async blockSlot(data: BlockSlotRequest) {
    const response = await axios.post(
      `${API_BASE_URL}/admin/slots/block`,
      data,
      this.getAuthHeader(),
    );
    return response.data;
  }

  async blockMultipleSlots(slots: BlockSlotRequest[], reason?: string) {
    const response = await axios.post(
      `${API_BASE_URL}/admin/slots/block-multiple`,
      { slots, reason },
      this.getAuthHeader(),
    );
    return response.data;
  }

  async blockClinicianDay(
    clinician_id: number,
    centre_id: number,
    date: string,
    reason?: string,
  ) {
    const response = await axios.post(
      `${API_BASE_URL}/admin/slots/block-day`,
      { clinician_id, centre_id, date, reason },
      this.getAuthHeader(),
    );
    return response.data;
  }

  async unblockSlot(slotId: number) {
    const response = await axios.post(
      `${API_BASE_URL}/admin/slots/unblock/${slotId}`,
      {},
      this.getAuthHeader(),
    );
    return response.data;
  }

  async getBlockedSlots(filters?: {
    clinician_id?: number;
    centre_id?: number;
    date_from?: string;
    date_to?: string;
    is_blocked?: boolean;
  }) {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }

    const response = await axios.get(
      `${API_BASE_URL}/admin/slots/blocked?${params.toString()}`,
      this.getAuthHeader(),
    );
    return response.data;
  }

  async getAffectedPatients(slots: BlockSlotRequest[]) {
    const response = await axios.post(
      `${API_BASE_URL}/admin/slots/affected-patients`,
      { slots },
      this.getAuthHeader(),
    );
    return response.data;
  }
}

export const slotBlockingService = new SlotBlockingService();
