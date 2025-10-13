import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Bell, Trash2, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  getNotifications,
  getNotificationStats,
  markNotificationAsRead,
  deleteNotification,
} from '@/services/admin-notifications';
import type { PaginatedNotifications } from '@/services/admin-notifications';

const types = [
  { value: 'all', label: 'All types' },
  { value: 'user_registration', label: 'User registration' },
  { value: 'email_verification', label: 'Email verification' },
  { value: 'new_order', label: 'New order' },
  { value: 'new_preorder', label: 'New pre-order' },
  { value: 'order_payment', label: 'Order payment' },
  { value: 'preorder_deposit', label: 'Pre-order deposit' },
  { value: 'preorder_full_payment', label: 'Pre-order full payment' },
  { value: 'order_status_change', label: 'Order status change' },
];

export default function NotificationsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [type, setType] = useState('all');
  const [read, setRead] = useState<'all' | 'read' | 'unread'>('all');
  const [search, setSearch] = useState('');

  const { data: stats } = useQuery({
    queryKey: ['adminNotifications', 'stats'],
    queryFn: getNotificationStats,
    refetchInterval: 60000,
  });

  const { data, isLoading, isFetching } = useQuery<PaginatedNotifications>({
    queryKey: ['adminNotifications', 'list', { page, type, read, search }],
    queryFn: () =>
      getNotifications({
        page,
        type: type === 'all' ? undefined : type || undefined,
        is_read: read === 'all' ? undefined : read === 'read',
        search: search || undefined,
      }),
    placeholderData: (prev) => prev as PaginatedNotifications | undefined,
  });

  const markOne = useMutation({
    mutationFn: (id: number) => markNotificationAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminNotifications'] });
    },
  });

  const delOne = useMutation({
    mutationFn: (id: number) => deleteNotification(id),
    onSuccess: () => {
      toast.success('Notification deleted');
      qc.invalidateQueries({ queryKey: ['adminNotifications'] });
    },
    onError: () => toast.error('Failed to delete notification'),
  });

  const list: PaginatedNotifications['data'] = Array.isArray(data?.data) ? (data as PaginatedNotifications).data : [];
  const pagination = data?.pagination;

  const isFirst = (pagination?.current_page ?? 1) <= 1;
  const isLast = (pagination?.current_page ?? 1) >= (pagination?.last_page ?? 1);

  const total = stats?.total ?? 0;
  const unread = stats?.unread ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">System events and customer activities</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Badge variant="secondary" className="gap-1"><Bell className="h-3.5 w-3.5" /> Total {total}</Badge>
          <Badge className="gap-1">Unread {unread}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <Input
                placeholder="Search title or message..."
                value={search}
                onChange={(e) => {
                  setPage(1);
                  setSearch(e.target.value);
                }}
              />
            </div>
            <Select value={type} onValueChange={(v) => { setPage(1); setType(v); }}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                {types.map(t => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={read} onValueChange={(v: 'all' | 'read' | 'unread') => { setPage(1); setRead(v); }}>
              <SelectTrigger>
                <SelectValue placeholder="Read status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8 text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</div>
          ) : list.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">No notifications found</div>
          ) : (
            <div className="divide-y">
              {list.map((n) => (
                <div key={n.id} className="flex items-start gap-4 p-4">
                  <div className="text-2xl" aria-hidden>{n.icon ?? '🔔'}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{n.title}</p>
                      {!n.is_read && <Badge variant="secondary" className="h-5">New</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!n.is_read && (
                      <Button size="sm" variant="outline" onClick={() => markOne.mutate(n.id)} disabled={markOne.isPending}>
                        {markOne.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                        Mark read
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" onClick={() => delOne.mutate(n.id)} disabled={delOne.isPending}>
                      {delOne.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between border-t p-3 text-sm">
            <div className="text-muted-foreground">
              Page {pagination?.current_page ?? 1} of {pagination?.last_page ?? 1}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={isFirst || isFetching}>
                Previous
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => p + 1)} disabled={isLast || isFetching}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
