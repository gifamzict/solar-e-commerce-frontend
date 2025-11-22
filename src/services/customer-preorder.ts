import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://solar-e-commerce-backend-production.up.railway.app/api').replace(/\/$/, '');
const CUSTOMER_PREORDERS_PATH = 'customer-pre-orders';

function buildUrl(path: string) {
  return `${API_BASE_URL}/${path.replace(/^\/+/, '')}`;
}

export type FulfillmentMethod = 'pickup' | 'delivery';
export type PaymentType = 'deposit' | 'full';

// Normalize a single preorder item into a consistent shape expected by the UI
function normalizePreorderItem(raw: any) {
  if (!raw || typeof raw !== 'object') return raw;
  const priceStr = raw.preorder_price ?? raw.pre_order_price ?? raw.price;
  const priceNum = priceStr != null && !isNaN(Number(priceStr)) ? Number(priceStr) : undefined;

  return {
    ...raw,
    name: raw.name ?? raw.product_name ?? raw.title ?? '',
    preorder_price: priceNum ?? raw.preorder_price ?? raw.pre_order_price ?? 0,
    expected_availability_date: raw.expected_availability_date ?? raw.expected_availability ?? raw.available_at ?? null,
    deposit_amount: raw.deposit_amount ?? (raw.deposit_percentage && priceNum ? Math.round((Number(raw.deposit_percentage) / 100) * priceNum) : raw.deposit_amount),
    category: raw.category ?? raw.category_data ?? raw.category_info ?? raw.category,
  };
}

export interface PlaceCustomerPreorderPayload {
  pre_order_id: number | string;
  customer_email: string;
  customer_phone: string;
  first_name: string;
  last_name: string;
  quantity: number;
  fulfillment_method: FulfillmentMethod;
  shipping_address?: string;
  city?: string;
  state?: string;
  pickup_location?: string;
  notes?: string;
}

export interface CustomerPreOrder {
  id: number;
  pre_order_id: number;
  pre_order_number: string;
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
  status: string;
  payment_status: string;
  fulfillment_method: FulfillmentMethod;
  shipping_address?: string | null;
  city?: string | null;
  state?: string | null;
  pickup_location?: string | null;
  payment_method?: string | null;
  paystack_reference?: string | null;
  paystack_access_code?: string | null;
  paystack_response?: any;
  notes?: string | null;
  preOrder?: any;
}

export async function listAvailablePreorders(params?: {
  search?: string;
  category_id?: number | string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}) {
  const res = await axios.get(buildUrl(`${CUSTOMER_PREORDERS_PATH}/available`), { params });
  const payload = res.data?.data ?? res.data;
  // If paginated, Laravel returns { data: [items], current_page, ... }
  if (payload && Array.isArray(payload.data)) return payload.data.map(normalizePreorderItem);
  if (Array.isArray(payload)) return payload.map(normalizePreorderItem);
  return [];
}

export async function getAvailablePreorder(preOrderId: number | string) {
  const res = await axios.get(buildUrl(`${CUSTOMER_PREORDERS_PATH}/available/${preOrderId}`));
  const data = res.data?.data ?? res.data;
  return normalizePreorderItem(data);
}

export async function placeCustomerPreorder(payload: PlaceCustomerPreorderPayload): Promise<{ success: boolean; data: CustomerPreOrder; message?: string; }> {
  const res = await axios.post(buildUrl(`${CUSTOMER_PREORDERS_PATH}/place`), payload);
  return res.data;
}

export async function initializeCustomerPreorderPayment(args: { customer_pre_order_id: number | string; payment_type: PaymentType; callback_url?: string; }): Promise<{ success: boolean; data: { authorization_url: string; access_code: string; reference: string; amount: number; payment_type: PaymentType; }; message?: string; }> {
  try {
    const res = await axios.post(buildUrl(`${CUSTOMER_PREORDERS_PATH}/initialize-payment`), args);
    return res.data;
  } catch (err: any) {
    const resp = err?.response?.data;
    const message = resp?.message || resp?.error?.message || resp?.error || err?.message || 'Failed to initialize payment';
    const e: any = new Error(message);
    e.payload = resp;
    throw e;
  }
}

export async function verifyCustomerPreorderPayment(reference: string): Promise<{ success: boolean; data: CustomerPreOrder; message?: string; }> {
  try {
    const res = await axios.post(buildUrl(`${CUSTOMER_PREORDERS_PATH}/verify-payment`), { reference });
    return res.data;
  } catch (err: any) {
    const resp = err?.response?.data;
    const message = resp?.message || resp?.error?.message || resp?.error || err?.message || 'Payment verification failed';
    const e: any = new Error(message);
    e.payload = resp;
    throw e;
  }
}

export interface InitCustomerPreorderSessionArgs extends PlaceCustomerPreorderPayload {
  payment_type: PaymentType;
  callback_url?: string;
}

export async function initializeCustomerPreorderPaymentSession(args: InitCustomerPreorderSessionArgs): Promise<{ success: boolean; data: { authorization_url: string; access_code: string; reference: string; amount: number; payment_type: PaymentType; product_name?: string; customer_name?: string; }; message?: string; }> {
  const res = await axios.post(buildUrl(`${CUSTOMER_PREORDERS_PATH}/initialize-payment-session`), args);
  return res.data;
}

export async function verifyCustomerPreorderPaymentAndCreate(reference: string): Promise<{ success: boolean; data: CustomerPreOrder; message?: string; }> {
  const res = await axios.post(buildUrl(`${CUSTOMER_PREORDERS_PATH}/verify-payment-and-create`), { reference });
  return res.data;
}

export async function getCustomerPreordersByEmail(customer_email: string) {
  const res = await axios.post(buildUrl(`${CUSTOMER_PREORDERS_PATH}/customer-orders`), { customer_email });
  return res.data?.data ?? res.data;
}

export async function getCustomerPreorderByNumber(preOrderNumber: string) {
  const res = await axios.get(buildUrl(`${CUSTOMER_PREORDERS_PATH}/${preOrderNumber}`));
  return res.data?.data ?? res.data;
}

export async function exchangePreorderPaymentToken(token: string): Promise<{ success: boolean; data: { pre_order_id: number; pre_order_number: string; allowed_payment_type: 'full' | 'deposit'; amount_due: number; customer_name: string; }; message?: string; }> {
  const res = await axios.get(buildUrl(`${CUSTOMER_PREORDERS_PATH}/pay-ticket/${token}`));
  return res.data;
}

export default {
  listAvailablePreorders,
  getAvailablePreorder,
  placeCustomerPreorder,
  initializeCustomerPreorderPayment,
  verifyCustomerPreorderPayment,
  initializeCustomerPreorderPaymentSession,
  verifyCustomerPreorderPaymentAndCreate,
  getCustomerPreordersByEmail,
  getCustomerPreorderByNumber,
  exchangePreorderPaymentToken,
};