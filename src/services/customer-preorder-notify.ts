import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://solar-e-commerce-backend-production.up.railway.app/api').replace(/\/$/, '');

export type NotifyMode = 'ready' | 'balance';

export interface CustomerPreorderNotifyPayload {
  customer_preorder_id: number | string;
  mode: NotifyMode; // 'ready' | 'balance'
  channels: Array<'email' | 'sms' | 'in_app' | string>;
  subject: string;
  message: string;
  // Balance-specific
  payment_deadline?: string; // YYYY-MM-DD
  reason?: string;
  include_payment_link?: boolean;
  // Ready-specific
  ready_date?: string; // YYYY-MM-DD
  fulfillment_method?: 'pickup' | 'delivery';
  pickup_location?: string;
  shipping_address?: string | null;
  city?: string | null;
  state?: string | null;
}

export async function sendCustomerPreorderNotification(payload: CustomerPreorderNotifyPayload) {
  const url = `${API_BASE_URL}/admin/customer-pre-orders/${payload.customer_preorder_id}/notify`;
  const res = await axios.post(url, payload);
  return res.data?.data ?? res.data ?? { success: true };
}

export default { sendCustomerPreorderNotification };
