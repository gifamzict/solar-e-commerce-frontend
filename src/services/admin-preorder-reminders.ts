import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://web-production-d1120.up.railway.app/api').replace(/\/$/, '');

export interface SendReminderPayload {
  preorder_id: number | string;
  recipients_type: 'all' | 'specific';
  recipients?: string[];
  channels: Array<'email' | 'sms' | 'in_app' | string>;
  subject: string;
  message: string;
  expected_date?: string;
  payment_deadline?: string;
  reason?: string;
  include_payment_link?: boolean;
}

export async function sendBalanceReminder(payload: SendReminderPayload): Promise<any> {
  const url = `${API_BASE_URL}/admin/pre-orders/${payload.preorder_id}/balance-reminders`;
  const res = await axios.post(url, payload);
  return res.data?.data ?? res.data ?? { success: true };
}

export default { sendBalanceReminder };
