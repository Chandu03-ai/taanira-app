import BaseService from './baseService';
import { ApiResponse } from '../types/api';

interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status: string;
}

interface PaymentStatus {
  orderId: string;
  paymentId?: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  amount: number;
  currency: string;
}

class PaymentService extends BaseService {
  async createPaymentOrder(orderData: {
    amount: number;
    currency: string;
    receipt?: string;
    notes?: Record<string, string>;
  }): Promise<ApiResponse<PaymentOrder>> {
    return this.post<PaymentOrder>('/payment/create-order', orderData, true);
  }

  async verifyPayment(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }): Promise<ApiResponse<{ status: string }>> {
    return this.post<{ status: string }>('/payments/payment/verify', paymentData, true);
  }

  async getPaymentStatus(orderId: string): Promise<ApiResponse<PaymentStatus>> {
    return this.get<PaymentStatus>(`/payment/status/${orderId}`, true);
  }
}

export const paymentService = new PaymentService();