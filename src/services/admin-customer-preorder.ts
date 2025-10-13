// filepath: /Users/gifamz/Desktop/G-TechSolar/gifamz-admin-dash/src/services/admin-customer-preorder.ts
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '');
// Allow overriding the admin path via env; default to 'admin/customer-pre-orders'
const ADMIN_CPO_PATH = (import.meta.env.VITE_ADMIN_CUSTOMER_PREORDERS_API_PATH || 'admin/customer-pre-orders').replace(/^\/+|\/+$/g, '');

function buildUrl(path: string) {
  return `${API_BASE_URL}/${path.replace(/^\/+/, '')}`;
}

export type CpoStatus = 'pending' | 'deposit_paid' | 'fully_paid' | 'cancelled' | 'ready_for_pickup' | 'completed';

export interface AdminCustomerPreorderItem {
  id: number;
  pre_order_number: string;
  pre_order_id: number;
  customer_email: string;
  customer_phone: string;
  first_name: string;
  last_name: string;
  quantity: number;
  unit_price: number | string;
  deposit_amount: number | string;
  remaining_amount: number | string;
  total_amount: number | string;
  currency: string;
  status: CpoStatus;
  payment_status: 'pending' | 'deposit_paid' | 'fully_paid' | 'failed';
  fulfillment_method: 'pickup' | 'delivery';
  shipping_address?: string | null;
  city?: string | null;
  state?: string | null;
  pickup_location?: string | null;
  created_at?: string;
  updated_at?: string;
  preOrder?: { id: number; product_name: string; category?: { id: number; name: string } };
  // Optional payment timestamps and metadata (backend should provide these)
  first_payment_at?: string | null;
  deposit_paid_at?: string | null;
  balance_paid_at?: string | null;
  fully_paid_at?: string | null;
  paystack_reference?: string | null;
  payment_events?: Array<{
    type: 'deposit' | 'balance' | 'full' | string;
    amount: number | string;
    status: 'success' | 'failed' | 'pending' | string;
    reference?: string;
    method?: string;
    date: string;
  }>;
}

export async function listCustomerPreorders(params?: {
  page?: number;
  per_page?: number;
  search?: string;
  status?: CpoStatus | '';
  payment_status?: 'pending' | 'deposit_paid' | 'fully_paid' | 'failed' | '';
}) {
  const res = await axios.get(buildUrl(`${ADMIN_CPO_PATH}`), { params });
  const payload = res.data?.data ?? res.data;
  if (payload && Array.isArray(payload.data)) return payload; // return full pagination payload
  if (Array.isArray(payload)) return { data: payload, current_page: 1, last_page: 1, total: payload.length };
  return payload;
}

export async function updateCustomerPreorderStatus(id: number | string, status: CpoStatus) {
  const res = await axios.put(buildUrl(`${ADMIN_CPO_PATH}/${id}/status`), { status });
  return res.data;
}

export default { listCustomerPreorders, updateCustomerPreorderStatus };