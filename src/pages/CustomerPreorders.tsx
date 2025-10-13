import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listCustomerPreorders, updateCustomerPreorderStatus, type AdminCustomerPreorderItem, type CpoStatus } from '@/services/admin-customer-preorder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, RefreshCw, Search, PackageCheck, CheckCircle2, Eye } from 'lucide-react';
import CustomerPreorderDetailDialog from '@/components/CustomerPreorderDetailDialog';

const statusColors: Record<CpoStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  deposit_paid: 'bg-blue-100 text-blue-800',
  fully_paid: 'bg-purple-100 text-purple-800',
  cancelled: 'bg-red-100 text-red-800',
  ready_for_pickup: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
};

// Helper for currency-aware formatting
function formatCurrency(value: number | string, currency = 'NGN') {
  const num = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.-]/g, ''));
  if (Number.isNaN(num)) return '0.00';
  try {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(num);
  } catch {
    return `${currency} ${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
}

export default function CustomerPreordersAdminPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CpoStatus | ''>('');
  type PaymentStatus = AdminCustomerPreorderItem['payment_status'];
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | ''>('');

  // Detail dialog state
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<AdminCustomerPreorderItem | null>(null);

  const query = useQuery({
    queryKey: ['admin-cpo', { search, status: statusFilter, payment_status: paymentStatusFilter }],
    queryFn: async () =>
      listCustomerPreorders({
        search: search || undefined,
        status: statusFilter || undefined,
        payment_status: paymentStatusFilter || undefined,
      }),
  });

  const items: AdminCustomerPreorderItem[] = useMemo(() => {
    const payload: any = query.data;
    if (!payload) return [];
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload)) return payload as AdminCustomerPreorderItem[];
    return [];
  }, [query.data]);

  const { mutate: mutateStatus, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: CpoStatus }) => updateCustomerPreorderStatus(id, status),
    onSuccess: (_res, vars) => {
      toast.success(`Status updated to ${vars.status.replace(/_/g, ' ')}`);
      qc.invalidateQueries({ queryKey: ['admin-cpo'] });
      // Keep dialog item in sync
      setSelected((prev) => (prev && prev.id === (vars as any).id ? { ...prev, status: vars.status } as AdminCustomerPreorderItem : prev));
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || 'Failed to update status';
      toast.error(msg);
    },
  });

  const openDetail = (it: AdminCustomerPreorderItem) => {
    setSelected(it);
    setDetailOpen(true);
  };

  return (
    <div className="p-4 md:p-6">
      {/* Detail Dialog */}
      <CustomerPreorderDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        item={selected}
        onUpdateStatus={(status) => {
          if (!selected) return;
          mutateStatus({ id: selected.id, status });
        }}
      />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Customer Pre-orders</h1>
        <Button variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ['admin-cpo'] })}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      <Card className="mb-4">
        <CardContent className="p-4 grid gap-3 md:grid-cols-4">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by customer/product" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div>
            <select className="w-full border rounded-md px-3 py-2" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as CpoStatus | '')}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="deposit_paid">Deposit Paid</option>
              <option value="fully_paid">Fully Paid</option>
              <option value="ready_for_pickup">Ready for Pickup</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <select
              className="w-full border rounded-md px-3 py-2"
              value={paymentStatusFilter}
              onChange={(e) => setPaymentStatusFilter(e.target.value as PaymentStatus | '')}
            >
              <option value="">All Payment Status</option>
              <option value="pending">Pending</option>
              <option value="deposit_paid">Deposit Paid</option>
              <option value="fully_paid">Fully Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => query.refetch()} disabled={query.isFetching} className="w-full md:w-auto">
              {query.isFetching ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Apply
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pre-order Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3">Pre-order #</th>
                  <th className="text-left p-3">Product</th>
                  <th className="text-left p-3">Customer</th>
                  <th className="text-left p-3">Qty</th>
                  <th className="text-left p-3">Amounts</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Payment</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {query.isLoading && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-muted-foreground">
                      <Loader2 className="h-4 w-4 mr-2 inline-block animate-spin" /> Loading pre-orders...
                    </td>
                  </tr>
                )}
                {items.length === 0 && !query.isLoading && (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-muted-foreground">No customer pre-orders found.</td>
                  </tr>
                )}
                {items.map((it) => (
                  <tr key={it.id} className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium">{it.pre_order_number}</td>
                    <td className="p-3">
                      <div className="font-medium">{it.preOrder?.product_name || '-'}</div>
                      {it.preOrder?.category?.name && (
                        <div className="text-xs text-muted-foreground">{it.preOrder.category.name}</div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{it.first_name} {it.last_name}</div>
                      <div className="text-xs text-muted-foreground">{it.customer_email}</div>
                      <div className="text-xs text-muted-foreground">{it.customer_phone}</div>
                    </td>
                    <td className="p-3">{it.quantity}</td>
                    <td className="p-3">
                      <div>Totals: {formatCurrency(it.total_amount, it.currency)}</div>
                      <div className="text-xs text-muted-foreground">Deposit: {formatCurrency(it.deposit_amount, it.currency)}</div>
                      <div className="text-xs text-muted-foreground">Remain: {formatCurrency(it.remaining_amount, it.currency)}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded ${statusColors[it.status] || 'bg-gray-100 text-gray-800'}`}>{it.status.replace(/_/g, ' ')}</span>
                    </td>
                    <td className="p-3 capitalize">{it.payment_status.replace(/_/g, ' ')}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => openDetail(it)}>
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => mutateStatus({ id: it.id, status: 'ready_for_pickup' })}
                          disabled={isUpdating || it.status === 'ready_for_pickup' || it.status === 'completed'}
                        >
                          <PackageCheck className="h-4 w-4 mr-1" /> Mark Ready
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => mutateStatus({ id: it.id, status: 'completed' })}
                          disabled={isUpdating || it.status === 'completed'}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Complete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
