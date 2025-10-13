import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  getUnreadCount,
  getRecentNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type AdminNotification,
} from '@/services/admin-notifications';

function resolveAdminUrl(actionUrl?: string, n?: AdminNotification): string | undefined {
  const normalize = (u: string) => {
    // Normalize pre-orders hyphenated path to camel variant used in FE routes
    if (u.startsWith('/management-portal/pre-orders')) return u.replace('/management-portal/pre-orders', '/management-portal/preorders');
    if (u.startsWith('/admin/pre-orders')) return u.replace('/admin/pre-orders', '/admin/preorders');
    return u;
  };

  if (actionUrl) {
    let u = normalize(actionUrl);

    // If coming from backend /admin/... map to FE routes
    if (u.startsWith('/admin/')) {
      const path = u.replace('/admin', '');
      // customers detail -> list page (no detail route exists yet)
      const mCust = path.match(/^\/customers\/(\d+)(?:\/.*)?/);
      if (mCust) return '/management-portal/customers';
      // orders detail -> orders detail
      const mOrder = path.match(/^\/orders\/(\d+)(?:\/.*)?/);
      if (mOrder) return `/management-portal/orders/${mOrder[1]}`;
      // preorders (any) -> preorders list
      if (path.startsWith('/preorders') || path.startsWith('/pre-orders')) return '/management-portal/preorders';
      // Fallback to dashboard
      return '/management-portal';
    }

    // If already a management-portal URL, ensure compatibility
    if (u.startsWith('/management-portal/pre-orders')) return '/management-portal/preorders';
    return u;
  }
  // Fallbacks based on type/data when no action_url provided
  const d = n?.data as Record<string, any> | undefined;
  switch (n?.type) {
    case 'new_order':
    case 'order_payment':
    case 'order_status_change':
      if (d?.order_id) return `/management-portal/orders/${d.order_id}`;
      return '/management-portal/orders';
    case 'new_preorder':
    case 'preorder_deposit':
    case 'preorder_full_payment':
      return '/management-portal/preorders';
    case 'user_registration':
    case 'email_verification':
      return '/management-portal/customers';
    default:
      return '/management-portal';
  }
}

export default function NotificationBell() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: unread, isLoading: unreadLoading } = useQuery({
    queryKey: ['adminNotifications', 'unreadCount'],
    queryFn: getUnreadCount,
    refetchInterval: 30000,
  });

  const { data: recent = [], isLoading: recentLoading } = useQuery({
    queryKey: ['adminNotifications', 'recent'],
    queryFn: () => getRecentNotifications(7),
    enabled: open, // fetch when menu opens
  });

  const markOne = useMutation({
    mutationFn: (id: number) => markNotificationAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminNotifications', 'unreadCount'] });
      qc.invalidateQueries({ queryKey: ['adminNotifications', 'recent'] });
      qc.invalidateQueries({ queryKey: ['adminNotifications', 'list'] });
    },
  });

  const markAll = useMutation({
    mutationFn: () => markAllNotificationsAsRead(),
    onSuccess: () => {
      toast.success('All notifications marked as read');
      qc.invalidateQueries({ queryKey: ['adminNotifications', 'unreadCount'] });
      qc.invalidateQueries({ queryKey: ['adminNotifications', 'recent'] });
      qc.invalidateQueries({ queryKey: ['adminNotifications', 'list'] });
    },
    onError: () => toast.error('Failed to mark all as read'),
  });

  const handleClick = async (n: AdminNotification) => {
    const url = resolveAdminUrl(n.action_url, n);
    try {
      if (!n.is_read) await markOne.mutateAsync(n.id);
      if (url) navigate(url);
    } catch {
      if (url) navigate(url);
    }
  };

  const unreadCount = unread?.count ?? 0;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadLoading ? (
            <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-muted text-[10px] text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
            </span>
          ) : unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] leading-none text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between px-4 py-2">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          <Button variant="ghost" size="sm" onClick={() => markAll.mutate()} disabled={markAll.isPending || unreadCount === 0}>
            {markAll.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCheck className="mr-2 h-4 w-4" />}
            Mark all read
          </Button>
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="max-h-96">
          <div className="py-1">
            {recentLoading ? (
              <div className="p-4 text-sm text-muted-foreground">Loading...</div>
            ) : recent.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">No notifications</div>
            ) : (
              recent.map((n) => (
                <DropdownMenuItem key={n.id} className="px-4 py-3 focus:bg-accent/50" onClick={() => handleClick(n)}>
                  <div className="flex w-full items-start gap-3">
                    <div className="mt-0.5 text-xl" aria-hidden>
                      {n.icon ?? '🔔'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium leading-tight">{n.title}</p>
                        {!n.is_read && <Badge variant="secondary" className="h-5">New</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{n.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))
            )}
          </div>
        </ScrollArea>
        <DropdownMenuSeparator />
        <div className="flex items-center justify-center p-2">
          <Button variant="ghost" size="sm" onClick={() => navigate('/management-portal/notifications')}>
            View all
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
