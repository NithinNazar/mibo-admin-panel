import api from "./api";

export interface SendPaymentLinkRequest {
  appointmentId: number;
  patientPhone: string;
  patientName: string;
}

export interface SendPaymentLinkResponse {
  paymentLink: string;
  whatsappSent: boolean;
  amount: number;
  expiresAt: Date;
}

class PaymentService {
  /**
   * Send payment link to patient via WhatsApp
   */
  async sendPaymentLink(
    data: SendPaymentLinkRequest
  ): Promise<SendPaymentLinkResponse> {
    const response = await api.post("/payment/send-link", data);
    return response.data.data || response.data;
  }
}

export default new PaymentService();
