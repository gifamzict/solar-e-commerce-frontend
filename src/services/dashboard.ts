// filepath: /Users/gifamz/Desktop/G-TechSolar/gifamz-admin-dash/src/services/dashboard.ts
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';

export interface CategorySalesItem {
  category: string;
  sales: number;
  units_sold?: number;
  formatted_sales?: string;
}

export interface LowStockAlert {
  id: number;
  name: string;
  stock: number;
  stock_message: string;
  status?: string;
  category?: string;
}

export async function getSalesByCategory(period: string = 'current_month'): Promise<CategorySalesItem[]> {
  const url = new URL(`${BASE_URL}/dashboard/sales-by-category`);
  if (period) url.searchParams.set('period', period);
  const res = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error('Failed to fetch sales by category');
  }
  const data = await res.json();
  const payload = (data && (data.data ?? data)) as any;
  return (Array.isArray(payload) ? payload : payload?.sales_by_category || []) as CategorySalesItem[];
}

export async function getLowStockAlerts(): Promise<LowStockAlert[]> {
  const res = await fetch(`${BASE_URL}/dashboard/low-stock-alerts`, { headers: { Accept: 'application/json' } });
  if (!res.ok) {
    throw new Error('Failed to fetch low stock alerts');
  }
  const data = await res.json();
  const payload = (data && (data.data ?? data)) as any;
  return (Array.isArray(payload) ? payload : payload?.low_stock_alerts || []) as LowStockAlert[];
}
