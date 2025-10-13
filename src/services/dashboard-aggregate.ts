// Aggregated Dashboard API service
// Fetches comprehensive dashboard data from /dashboard/overview

export interface DashboardOverviewResponse {
  overview_metrics?: any;
  payment_dashboard?: any;
  order_statistics?: any;
  revenue_chart?: Array<{ name: string; revenue: number; orders: number }>;
  recent_transactions?: any[];
  payment_methods?: { payment_methods?: any[] } | any[];
  payment_stats?: { stats: { total_transactions: number; successful_payments: number; failed_payments: number; success_rate: number } };
  order_status_distribution?: Array<{ status: string; count: number }>;
  top_selling_products?: any[];
  recent_orders?: any[];
  sales_by_category?: Array<{ category: string; sales: number }>;
  low_stock_alerts?: any[];
  preorder_metrics?: { total: number; deposit: number; remaining: number; totalAmount?: number; pendingCount: number };
  preorder_analytics?: { status_breakdown: Array<{ status: string; count: number }> };
  preorder_timeline?: Array<{ name: string; count: number; amount: number }>;
  recent_preorders?: any[];
}

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/?$/, '');

function pickData(payload: any): DashboardOverviewResponse {
  // Some backends wrap data under { success, data }
  const d = payload?.data ?? payload;
  return d as DashboardOverviewResponse;
}

export async function getDashboardOverview(period: string = 'current_month'): Promise<DashboardOverviewResponse | null> {
  const url = new URL(`${BASE_URL}/dashboard/overview`);
  if (period) url.searchParams.set('period', period);
  const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  if (!res.ok) return null;
  const json = await res.json();
  return pickData(json);
}

export default { getDashboardOverview };