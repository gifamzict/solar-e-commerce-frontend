// filepath: src/services/customer-address.ts
// Customer Address API client for store frontend
// Uses token from localStorage ("store_token").

export type CustomerAddress = {
  id: string | number;
  label?: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  is_default?: boolean;
  created_at?: string;
  full_name?: string;
  formatted_address?: string;
};

export type CustomerAddressInput = {
  label?: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  is_default?: boolean;
};

const BASE = import.meta.env.VITE_API_BASE_URL || 'https://web-production-d1120.up.railway.app/api';

function authHeaders() {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('store_token') : null;
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function handle<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

const withAuthInit = (init?: RequestInit): RequestInit => {
  const headers = authHeaders();
  return {
    credentials: 'include',
    ...init,
    headers: { ...(init?.headers || {}), ...headers },
  };
};

export async function listCustomerAddresses(): Promise<{ success?: boolean; data: CustomerAddress[] } | CustomerAddress[]> {
  const res = await fetch(`${BASE}/customer/addresses`, withAuthInit());
  const data = await handle<any>(res);
  // Support multiple backend shapes
  if (Array.isArray(data)) return data as CustomerAddress[];
  if (Array.isArray(data?.data)) return { success: true, data: data.data as CustomerAddress[] };
  if (Array.isArray(data?.addresses)) return { success: true, data: data.addresses as CustomerAddress[] };
  if (Array.isArray(data?.data?.addresses)) return { success: true, data: data.data.addresses as CustomerAddress[] };
  if (Array.isArray(data?.payload)) return { success: true, data: data.payload as CustomerAddress[] };
  if (Array.isArray(data?.results)) return { success: true, data: data.results as CustomerAddress[] };
  if (Array.isArray(data?.items)) return { success: true, data: data.items as CustomerAddress[] };
  if (Array.isArray(data?.data?.items)) return { success: true, data: data.data.items as CustomerAddress[] };
  if (Array.isArray(data?.customer_addresses)) return { success: true, data: data.customer_addresses as CustomerAddress[] };
  if (Array.isArray(data?.data?.customer_addresses)) return { success: true, data: data.data.customer_addresses as CustomerAddress[] };
  return { success: true, data: [] };
}

export async function createCustomerAddress(input: CustomerAddressInput): Promise<{ success?: boolean; data: CustomerAddress } | CustomerAddress> {
  const res = await fetch(`${BASE}/customer/addresses`, withAuthInit({ method: 'POST', body: JSON.stringify(input) }));
  const data = await handle<any>(res);
  if (data?.data) return data as { success: boolean; data: CustomerAddress };
  return data as CustomerAddress;
}

export async function getCustomerAddress(id: string | number): Promise<CustomerAddress> {
  const res = await fetch(`${BASE}/customer/addresses/${id}`, withAuthInit());
  return handle<CustomerAddress>(res);
}

export async function updateCustomerAddress(id: string | number, input: Partial<CustomerAddressInput>): Promise<CustomerAddress> {
  const res = await fetch(`${BASE}/customer/addresses/${id}`, withAuthInit({ method: 'PATCH', body: JSON.stringify(input) }));
  return handle<CustomerAddress>(res);
}

export async function deleteCustomerAddress(id: string | number): Promise<{ success?: boolean; message?: string }> {
  const res = await fetch(`${BASE}/customer/addresses/${id}`, withAuthInit({ method: 'DELETE' }));
  return handle(res);
}

export async function setDefaultCustomerAddress(id: string | number): Promise<{ success?: boolean; data?: CustomerAddress; message?: string }> {
  const res = await fetch(`${BASE}/customer/addresses/${id}/set-default`, withAuthInit({ method: 'POST' }));
  return handle(res);
}
