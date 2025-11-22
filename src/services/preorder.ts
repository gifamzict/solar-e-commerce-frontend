import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://solar-e-commerce-backend-production.up.railway.app/api').replace(/\/$/, '');
const PREORDERS_API_PATH = (import.meta.env.VITE_PREORDERS_API_PATH || 'pre-orders').replace(/^\/+|\/+$/g, '');
const PRODUCTS_API_PATH = (import.meta.env.VITE_PRODUCTS_API_PATH || 'products').replace(/^\/+|\/+$/g, '');

function buildUrl(path: string) {
  return `${API_BASE_URL}/${path.replace(/^\/+/, '')}`;
}

function isRouteMissing(err: unknown): boolean {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const msg = (err.response?.data as any)?.message || err.message || '';
    return status === 404 || /could not be found|not found|route .* not defined/i.test(String(msg));
  }
  return false;
}

function extractValidationDetails(err: unknown): { message: string; errors?: Record<string, string[] | string> } | null {
  if (axios.isAxiosError(err) && err.response?.status === 422) {
    const data: any = err.response.data || {};
    const errors = (data.errors || data.error) as Record<string, string[] | string> | undefined;
    let message: string | null = data.message || null;
    if (!message && errors && typeof errors === 'object') {
      try {
        const msgs = Object.values(errors).flat().filter(Boolean) as string[];
        if (msgs.length) message = msgs.join(' ');
      } catch { }
    }
    return { message: message || 'Validation failed (422). Please check your input.', errors };
  }
  return null;
}

// Attempt to normalize array payloads from various API shapes
function normalizeListPayload(resData: any) {
  const preorders = (resData || {}).preorders ?? (resData || {}).pre_orders;
  if (preorders && Array.isArray(preorders)) return preorders;
  if (preorders && Array.isArray(preorders.data)) return preorders.data;

  const data = (resData || {}).data;
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.data)) return data.data;

  if (Array.isArray(resData)) return resData;
  return [];
}

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

export async function listPreorders() {
  try {
    const res = await axios.get(buildUrl(`${PREORDERS_API_PATH}`));
    return normalizeListPayload(res.data).map(normalizePreorderItem);
  } catch (err) {
    if (isRouteMissing(err)) {
      // Fallback to products?is_preorder=1
      const res = await axios.get(buildUrl(`${PRODUCTS_API_PATH}`), { params: { is_preorder: 1 } });
      return normalizeListPayload(res.data).map(normalizePreorderItem);
    }
    throw err;
  }
}

export async function getPreorder(id: number | string) {
  try {
    const res = await axios.get(buildUrl(`${PREORDERS_API_PATH}/${id}`));
    const data = res.data?.data ?? res.data;
    return normalizePreorderItem(data);
  } catch (err) {
    if (isRouteMissing(err)) {
      const res = await axios.get(buildUrl(`${PRODUCTS_API_PATH}/${id}`), { params: { is_preorder: 1 } });
      const data = res.data?.data ?? res.data;
      return normalizePreorderItem(data);
    }
    throw err;
  }
}

export async function createPreorder(formData: FormData) {
  try {
    const res = await axios.post(buildUrl(`${PREORDERS_API_PATH}`), formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
  } catch (err) {
    const details = extractValidationDetails(err);
    if (details) {
      const e: any = new Error(details.message);
      e.validationErrors = details.errors;
      e.status = 422;
      throw e;
    }
    if (isRouteMissing(err)) {
      // Append marker for backend to recognize
      formData.set('is_preorder', '1');
      const res = await axios.post(buildUrl(`${PRODUCTS_API_PATH}`), formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return res.data;
    }
    throw err;
  }
}

export async function updatePreorder(id: number, formData: FormData) {
  try {
    const res = await axios.post(buildUrl(`${PREORDERS_API_PATH}/${id}?_method=PUT`), formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
  } catch (err) {
    const details = extractValidationDetails(err);
    if (details) {
      const e: any = new Error(details.message);
      e.validationErrors = details.errors;
      e.status = 422;
      throw e;
    }
    if (isRouteMissing(err)) {
      formData.set('is_preorder', '1');
      const res = await axios.post(buildUrl(`${PRODUCTS_API_PATH}/${id}?_method=PUT`), formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return res.data;
    }
    throw err;
  }
}

export async function deletePreorder(id: number) {
  try {
    const res = await axios.delete(buildUrl(`${PREORDERS_API_PATH}/${id}`));
    return res.data;
  } catch (err) {
    if (isRouteMissing(err)) {
      const res = await axios.delete(buildUrl(`${PRODUCTS_API_PATH}/${id}`));
      return res.data;
    }
    throw err;
  }
}

export async function updatePreorderStatus(id: number, status: string) {
  try {
    const res = await axios.put(buildUrl(`${PREORDERS_API_PATH}/${id}`), { status });
    return res.data;
  } catch (err) {
    if (isRouteMissing(err)) {
      const res = await axios.put(buildUrl(`${PRODUCTS_API_PATH}/${id}`), { status, is_preorder: 1 });
      return res.data;
    }
    throw err;
  }
}

// Additional helper endpoints based on provided API
export async function getPreorderCategories() {
  try {
    const res = await axios.get(buildUrl(`${PREORDERS_API_PATH}/categories/list`));
    return normalizeListPayload(res.data);
  } catch (err) {
    throw err;
  }
}

export async function searchPreorders(query: string) {
  try {
    const res = await axios.get(buildUrl(`${PREORDERS_API_PATH}/search/query`), { params: { query } });
    return normalizeListPayload(res.data).map(normalizePreorderItem);
  } catch (err) {
    throw err;
  }
}

export async function listPreordersByCategory(categoryId: number | string) {
  try {
    const res = await axios.get(buildUrl(`${PREORDERS_API_PATH}/category/${categoryId}`));
    return normalizeListPayload(res.data).map(normalizePreorderItem);
  } catch (err) {
    throw err;
  }
}
