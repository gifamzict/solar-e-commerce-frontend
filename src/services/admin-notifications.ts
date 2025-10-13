import axios from 'axios';
import { apiUrl } from '@/lib/utils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export type AdminNotificationType =
  | 'user_registration'
  | 'email_verification'
  | 'new_order'
  | 'new_preorder'
  | 'order_payment'
  | 'preorder_deposit'
  | 'preorder_full_payment'
  | 'order_status_change';

export interface AdminNotification {
  id: number;
  type: AdminNotificationType | string;
  title: string;
  message: string;
  icon?: string;
  priority?: 'low' | 'medium' | 'high';
  action_url?: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
}

export interface PaginatedNotifications {
  data: AdminNotification[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

function normalizeListPayload(resData: any): AdminNotification[] {
  if (!resData) return [];
  // Common shapes
  // { data: AdminNotification[] }
  if (Array.isArray(resData.data)) return resData.data as AdminNotification[];
  // { data: { data: AdminNotification[] } }
  if (resData.data && Array.isArray(resData.data.data)) return resData.data.data as AdminNotification[];
  // { notifications: { data: [] } }
  if (resData.notifications && Array.isArray(resData.notifications.data)) return resData.notifications.data as AdminNotification[];
  // { notifications: [] }
  if (Array.isArray(resData.notifications)) return resData.notifications as AdminNotification[];
  // Direct array
  if (Array.isArray(resData)) return resData as AdminNotification[];
  return [];
}

function normalizePagination(resData: any): PaginatedNotifications['pagination'] {
  // Try common spots for pagination meta
  const p = resData?.pagination || resData?.meta || resData?.data?.pagination || resData?.data?.meta || resData?.notifications?.pagination || {};
  const total = Number(p.total ?? 0);
  const per_page = Number(p.per_page ?? p.perPage ?? 10);
  const current_page = Number(p.current_page ?? p.currentPage ?? 1);
  const last_page = Number(p.last_page ?? p.lastPage ?? Math.max(1, Math.ceil((total || 0) / (per_page || 10))));
  return { total, per_page, current_page, last_page };
}

export const getUnreadCount = async (): Promise<{ count: number }> => {
  const url = apiUrl('/admin/notifications/unread-count');
  const res = await axios.get(url);
  const data = res.data;
  const count = data?.data?.count ?? data?.count ?? 0;
  return { count: Number(count) || 0 };
};

export const getRecentNotifications = async (limit = 5): Promise<AdminNotification[]> => {
  const url = apiUrl('/admin/notifications/recent');
  const res = await axios.get(url, { params: { limit } });
  return normalizeListPayload(res.data);
};

export const getNotificationStats = async (): Promise<NotificationStats> => {
  const url = apiUrl('/admin/notifications/stats');
  const res = await axios.get(url);
  const data = res.data?.data ?? res.data;
  return {
    total: Number(data?.total ?? 0),
    unread: Number(data?.unread ?? 0),
  };
};

export const getNotifications = async (params?: {
  page?: number;
  type?: string;
  is_read?: boolean | string;
  search?: string;
}): Promise<PaginatedNotifications> => {
  const url = apiUrl('/admin/notifications');
  // Build params without empty strings so the backend doesn't over-filter
  const query: Record<string, any> = {
    page: params?.page ?? 1,
  };
  if (params?.type) query.type = params.type; // only include when defined/non-empty
  if (params?.is_read !== undefined) query.is_read = params.is_read;
  if (params?.search) query.search = params.search;

  const res = await axios.get(url, { params: query });
  const data = res.data;
  const list = normalizeListPayload(data);
  const pagination = normalizePagination(data);
  return { data: list, pagination };
};

export const getNotificationById = async (id: number): Promise<AdminNotification> => {
  const url = apiUrl(`/admin/notifications/${id}`);
  const res = await axios.get(url);
  const data = res.data?.data ?? res.data;
  // If backend returns an array for some reason, take first
  if (Array.isArray(data)) return (data[0] || {}) as AdminNotification;
  return data as AdminNotification;
};

export const markNotificationAsRead = async (id: number): Promise<void> => {
  const url = apiUrl(`/admin/notifications/${id}/mark-read`);
  await axios.patch(url);
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  const url = apiUrl('/admin/notifications/mark-all-read');
  await axios.patch(url);
};

export const deleteNotification = async (id: number): Promise<void> => {
  const url = apiUrl(`/admin/notifications/${id}`);
  await axios.delete(url);
};