// filepath: /Users/gifamz/Desktop/G-TechSolar/gifamz-admin-dash/src/services/inventory.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface InventoryOverview {
  total_items: number;
  low_stock: number;
  out_of_stock: number;
  in_stock: number;
  total_inventory_value: number;
  formatted_inventory_value?: string;
}

export interface InventoryItemCategory {
  id: number;
  name: string;
}

export interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  stock: number;
  price?: number;
  formatted_price?: string;
  total_value?: number;
  formatted_total_value?: string;
  stock_status: 'Out of Stock' | 'Critical' | 'Low Stock' | 'Limited' | 'In Stock' | string;
  stock_level: number; // percentage 0-100
  category?: InventoryItemCategory | null;
  last_updated?: string;
  formatted_last_updated?: string;
  warehouse_location?: string;
  reorder_point?: number;
}

export interface PaginatedStockLevels {
  stock_levels: InventoryItem[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number;
    to?: number;
  };
}

export async function getInventoryOverview(): Promise<InventoryOverview> {
  const res = await axios.get(`${API_BASE_URL}/inventory/overview`);
  const data = res.data?.overview ?? res.data;
  return data as InventoryOverview;
}

export async function getStockLevels(params?: {
  status?: 'low' | 'out' | 'in_stock';
  category_id?: number | string;
  search?: string;
  sort_by?: 'name' | 'stock' | 'price' | 'created_at';
  sort_order?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}): Promise<PaginatedStockLevels> {
  const res = await axios.get(`${API_BASE_URL}/inventory/stock-levels`, { params });
  return res.data as PaginatedStockLevels;
}

export async function getLowStockAlerts(threshold?: number) {
  const res = await axios.get(`${API_BASE_URL}/inventory/low-stock-alerts`, {
    params: { threshold },
  });
  return res.data as { low_stock_alerts: InventoryItem[]; threshold: number; count: number };
}

export async function getOutOfStockItems() {
  const res = await axios.get(`${API_BASE_URL}/inventory/out-of-stock`);
  return res.data as { out_of_stock_items: InventoryItem[]; count: number };
}

export async function updateProductStock(
  productId: number,
  payload: { stock: number; adjustment_type: 'set' | 'add' | 'subtract'; reason?: string }
) {
  const res = await axios.patch(`${API_BASE_URL}/inventory/products/${productId}/stock`, payload);
  return res.data as {
    message: string;
    product: InventoryItem;
    old_stock: number;
    new_stock: number;
    difference: number;
  };
}

export async function bulkUpdateStock(payload: {
  updates: { product_id: number; stock: number; adjustment_type: 'set' | 'add' | 'subtract' }[];
  reason?: string;
}) {
  const res = await axios.post(`${API_BASE_URL}/inventory/bulk-update-stock`, payload);
  return res.data as {
    message: string;
    updated_products: Array<{ product_id: number; product_name: string; old_stock: number; new_stock: number; difference: number }>;
    errors: Array<{ product_id: number; error: string }>;
    success_count: number;
    error_count: number;
  };
}

export async function getInventoryStatsByCategory() {
  const res = await axios.get(`${API_BASE_URL}/inventory/stats-by-category`);
  return res.data as {
    category_stats: Array<{
      category_id: number;
      category_name: string;
      total_items: number;
      total_stock: number;
      total_value: number;
      formatted_total_value: string;
      low_stock_items: number;
      out_of_stock_items: number;
      in_stock_items: number;
      average_stock_per_item: number;
    }>;
  };
}

export async function generateInventoryReport(params?: {
  start_date?: string;
  end_date?: string;
  category_id?: number | string;
}) {
  const res = await axios.get(`${API_BASE_URL}/inventory/report`, { params });
  return res.data as { inventory_report: any };
}
