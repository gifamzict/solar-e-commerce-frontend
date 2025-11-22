interface CartItem {
  product_id: number;
  quantity: number;
}

interface CheckoutData {
  customer_email: string;
  customer_phone: string;
  first_name: string;
  last_name: string;
  fulfillment_method: 'delivery' | 'pickup';
  shipping_address?: string;
  city?: string;
  state?: string;
  pickup_location?: string;
  payment_method: string;
  promo_code?: string;
  cart_items: CartItem[];
}

interface PaymentInitResponse {
  success: boolean;
  data: {
    order: any;
    paystack: {
      access_code: string;
      authorization_url: string;
      reference: string;
    };
  };
  error?: string;
}

interface PaymentVerifyResponse {
  success: boolean;
  message: string;
  data?: {
    order: any;
    payment_data: any;
  };
}

export interface PaymentSessionInitResponse {
  success: boolean;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
    amount: number;
    customer_name?: string;
    items_count?: number;
  };
  message?: string;
  error?: string;
}

// Admin Payments types
export type PaymentStatus = 'Completed' | 'Pending' | 'Failed' | 'Refunded';

export interface PaymentDashboard {
  total_revenue: {
    amount: number;
    formatted: string;
    change_percentage: number;
    change_text: string;
  };
  completed_payments: {
    count: number;
    change_percentage?: number;
    change_text: string;
  };
  pending_payments: {
    count: number;
    change_text: string;
  };
  average_transaction: {
    amount: number;
    formatted: string;
    change_percentage: number;
    change_text: string;
  };
}

export interface PaymentTransaction {
  order_id: string;
  customer: string;
  customer_email?: string;
  amount: string;
  amount_raw?: number;
  method: string;
  date: string;
  formatted_date?: string;
  status: PaymentStatus;
  status_color?: string;
}

export interface PaymentTransactionsResponse {
  transactions: PaymentTransaction[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

export interface PaymentStatsResponse {
  period: 'week' | 'month' | 'year' | string;
  start_date: string;
  end_date: string;
  stats: {
    total_transactions: number;
    total_revenue: number;
    successful_payments: number;
    pending_payments: number;
    failed_payments: number;
    avg_transaction_amount: number;
    success_rate: number;
  };
}

export interface PaymentMethodBreakdownItem {
  method: string;
  transaction_count: number;
  total_amount: number;
  formatted_total: string;
  avg_amount: number;
  formatted_avg: string;
}

export interface PaymentMethodBreakdownResponse {
  payment_methods: PaymentMethodBreakdownItem[];
}

class PaymentService {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_BASE_URL || 'https://solar-e-commerce-backend-production.up.railway.app/api';
  }

  async initializePayment(checkoutData: CheckoutData): Promise<PaymentInitResponse> {
    try {
      const response = await fetch(`${this.baseURL}/orders/initialize-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(checkoutData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      return data;
    } catch (error) {
      console.error('Payment initialization error:', error);
      throw error;
    }
  }

  async verifyPayment(reference: string): Promise<PaymentVerifyResponse> {
    try {
      const response = await fetch(`${this.baseURL}/orders/verify-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ reference }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment verification failed');
      }

      return data;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  }

  async getCustomerOrders(email: string) {
    try {
      const response = await fetch(`${this.baseURL}/orders/customer-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      return data;
    } catch (error) {
      console.error('Get orders error:', error);
      throw error;
    }
  }

  // Admin Payment Management APIs
  async getPaymentDashboard(): Promise<PaymentDashboard> {
    const res = await fetch(`${this.baseURL}/payments/dashboard`, {
      headers: { 'Accept': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Failed to fetch payment dashboard');
    return data as PaymentDashboard;
  }

  async getRecentTransactions(page = 1, perPage = 10, opts?: { type?: 'all' | 'orders' | 'pre-orders' }): Promise<PaymentTransactionsResponse> {
    const url = new URL(`${this.baseURL}/payments/transactions`);
    url.searchParams.set('page', String(page));
    url.searchParams.set('per_page', String(perPage));
    if (opts?.type) url.searchParams.set('type', opts.type);
    const res = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Failed to fetch transactions');

    // Normalize backend response to UI shape
    const normalizeStatus = (s: string | undefined): PaymentStatus => {
      const v = (s || '').toLowerCase();
      if (v.includes('fully') || v === 'paid' || v === 'completed') return 'Completed';
      if (v.includes('deposit')) return 'Pending';
      if (v === 'pending' || v === 'processing') return 'Pending';
      if (v === 'failed') return 'Failed';
      if (v === 'refunded') return 'Refunded';
      return 'Pending';
    };

    const tx = Array.isArray(data?.transactions) ? data.transactions.map((t: any) => ({
      order_id: String(t.transaction_id ?? t.order_id ?? t.id ?? ''),
      customer: t.customer ?? t.customer_name ?? t.customer_email ?? '',
      customer_email: t.customer_email,
      amount: t.amount ?? (typeof t.amount_raw === 'number' ? `₦${t.amount_raw.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₦0.00'),
      amount_raw: t.amount_raw,
      method: t.method ?? t.payment_method ?? '',
      date: t.formatted_date ?? t.date ?? '',
      formatted_date: t.formatted_date,
      status: normalizeStatus(t.status),
      status_color: t.status_color,
    })) : [];

    return {
      transactions: tx,
      pagination: data?.pagination ?? {
        current_page: Number(url.searchParams.get('page') || 1),
        last_page: 1,
        per_page: Number(url.searchParams.get('per_page') || 10),
        total: tx.length,
        from: tx.length ? 1 : 0,
        to: tx.length,
      },
    } as PaymentTransactionsResponse;
  }

  async getPaymentStats(period: 'week' | 'month' | 'year' = 'month'): Promise<PaymentStatsResponse> {
    const url = new URL(`${this.baseURL}/payments/stats`);
    url.searchParams.set('period', period);
    const res = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } });
    const raw = await res.json();
    if (!res.ok) throw new Error(raw?.message || 'Failed to fetch payment stats');

    // Normalize to ensure `stats` object exists even if backend shape differs
    const pick = (obj: any, key: string, def = 0) => (obj && obj[key] != null ? Number(obj[key]) : def);
    const base: any = raw?.data?.stats ? raw.data : raw; // support { data: { stats } } or { stats }

    const stats = base?.stats ?? {
      total_transactions: pick(base, 'total_transactions'),
      total_revenue: pick(base, 'total_revenue'),
      successful_payments: pick(base, 'successful_payments'),
      pending_payments: pick(base, 'pending_payments'),
      failed_payments: pick(base, 'failed_payments'),
      avg_transaction_amount: pick(base, 'avg_transaction_amount'),
      success_rate: pick(base, 'success_rate'),
    };

    const payload: PaymentStatsResponse = {
      period: String(raw?.period || period),
      start_date: String(raw?.start_date || raw?.data?.start_date || ''),
      end_date: String(raw?.end_date || raw?.data?.end_date || ''),
      stats,
    };

    return payload;
  }

  async getPaymentMethodBreakdown(): Promise<PaymentMethodBreakdownResponse> {
    const res = await fetch(`${this.baseURL}/payments/methods`, { headers: { 'Accept': 'application/json' } });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Failed to fetch payment methods breakdown');
    return data as PaymentMethodBreakdownResponse;
  }

  async searchTransactions(params: {
    query?: string;
    status?: string;
    method?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<{ transactions: PaymentTransaction[] }> {
    const url = new URL(`${this.baseURL}/payments/search`);
    Object.entries(params || {}).forEach(([k, v]) => {
      if (v !== undefined && v !== null && String(v).length > 0) url.searchParams.set(k, String(v));
    });
    const res = await fetch(url.toString(), { headers: { 'Accept': 'application/json' } });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || 'Failed to search transactions');
    return data as { transactions: PaymentTransaction[] };
  }

  async initializePaymentSession(checkoutData: CheckoutData): Promise<PaymentSessionInitResponse> {
    const response = await fetch(`${this.baseURL}/orders/initialize-payment-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(checkoutData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Failed to initialize payment session');
    }
    return data as PaymentSessionInitResponse;
  }

  async verifyPaymentAndCreate(reference: string): Promise<PaymentVerifyResponse> {
    const response = await fetch(`${this.baseURL}/orders/verify-payment-and-create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ reference }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.message || 'Payment verification failed');
    }
    return data as PaymentVerifyResponse;
  }
}

export const paymentService = new PaymentService();
export type { CheckoutData, CartItem, PaymentInitResponse, PaymentVerifyResponse };