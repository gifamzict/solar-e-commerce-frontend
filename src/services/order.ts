import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://web-production-d1120.up.railway.app/api';

export interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  product_price: number;
  total_price: number;
  product: {
    images: string[];
  };
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  formatted_date: string;
  formatted_total: string;
  status: string;
  payment_status: string;
  fulfillment_method: string;
  shipping_address: string | null;
  pickup_location: string | null;
  order_items: OrderItem[];
}

export interface PaginatedOrders {
  orders: {
    id: number;
    order_number: string;
    customer_name: string;
    formatted_date: string;
    formatted_total: string;
    status: string;
    items_count: number;
  }[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export interface OrderStatistics {
  total_revenue: number;
  total_orders: number;
  pending_orders: number;
  shipped_orders: number;
}

/**
 * Fetches a single order by its order number.
 * @param orderNumber - The order number to fetch.
 * @returns The order details.
 */
export const getOrderByNumber = async (orderNumber: string): Promise<Order> => {
  try {
    const response = await axios.get<{ order: Order }>(`${API_BASE_URL}/orders/by-number/${orderNumber}`);
    return response.data.order;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      throw new Error('Order not found');
    }
    throw new Error('Failed to fetch order details');
  }
};

/**
 * Fetches a paginated list of orders.
 * @param page - The page number to fetch.
 * @param status - The order status to filter by.
 * @param search - The search term.
 * @returns A paginated list of orders.
 */
export const getOrders = async (page = 1, status = 'all', search = ''): Promise<PaginatedOrders> => {
  try {
    const response = await axios.get<PaginatedOrders>(`${API_BASE_URL}/orders`, {
      params: {
        page,
        status: status === 'all' ? '' : status,
        search,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch orders');
  }
};

/**
 * Updates the status of an order.
 * @param orderId - The ID of the order to update.
 * @param status - The new status.
 * @returns The updated order.
 */
export const updateOrderStatus = async (orderId: number, status: string): Promise<Order> => {
  try {
    const response = await axios.patch<{ order: Order }>(`${API_BASE_URL}/orders/${orderId}/status`, { status });
    return response.data.order;
  } catch (error) {
    throw new Error('Failed to update order status');
  }
};

/**
 * Fetches order statistics.
 * @returns The order statistics.
 */
export const getOrderStatistics = async (): Promise<OrderStatistics> => {
  try {
    const response = await axios.get<{ statistics: OrderStatistics }>(`${API_BASE_URL}/orders/statistics`);
    return response.data.statistics;
  } catch (error) {
    // Fallback to dashboard route
    try {
      const res = await axios.get(`${API_BASE_URL}/dashboard/order-statistics`);
      const data = (res.data?.data ?? res.data) as OrderStatistics;
      return data as OrderStatistics;
    } catch (_) {
      throw new Error('Failed to fetch order statistics');
    }
  }
};
