import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Mail, Phone, User, Package, Wallet, Truck, MapPin, CalendarClock, CreditCard, Hash, ClipboardCopy, Clock, CheckCircle2, Circle } from 'lucide-react';
import type { AdminCustomerPreorderItem, CpoStatus } from '@/services/admin-customer-preorder';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { getPreorder } from '@/services/preorder';
import { useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import NotifyCustomerDialog from "./NotifyCustomerDialog";

function formatCurrency(value: number | string, currency = 'NGN') {
  const num = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.-]/g, ''));
  if (Number.isNaN(num)) return '0.00';
  try {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(num);
  } catch {
    return `${currency} ${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
}

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: 'bg-amber-50 dark:bg-amber-950/50', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
  deposit_paid: { bg: 'bg-blue-50 dark:bg-blue-950/50', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  fully_paid: { bg: 'bg-purple-50 dark:bg-purple-950/50', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
  ready_for_pickup: { bg: 'bg-indigo-50 dark:bg-indigo-950/50', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' },
  completed: { bg: 'bg-green-50 dark:bg-green-950/50', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
  cancelled: { bg: 'bg-red-50 dark:bg-red-950/50', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: AdminCustomerPreorderItem | null;
  onUpdateStatus?: (status: CpoStatus) => void;
}

export default function CustomerPreorderDetailDialog({ open, onOpenChange, item, onUpdateStatus }: Props) {
  if (!item) return null;

  const printableRef = useRef<HTMLDivElement | null>(null);

  // New: notify customer dialog state
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);

  const { data: pre } = useQuery({
    queryKey: ['preorder', item.pre_order_id],
    queryFn: () => getPreorder(item.pre_order_id),
    enabled: !!item?.pre_order_id && !item?.preOrder?.product_name,
  });

  const productName = item.preOrder?.product_name || (pre as any)?.product_name || (pre as any)?.name || '-';
  const categoryName = item.preOrder?.category?.name || (pre as any)?.category?.name || (pre as any)?.category || undefined;

  const copy = async (text?: string | null, label?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(String(text));
      toast.success(`${label || 'Value'} copied`);
    } catch {}
  };

  const fullName = `${item.first_name} ${item.last_name}`.trim();
  const createdAt = item.created_at ? new Date(item.created_at).toLocaleString() : '-';
  const updatedAt = item.updated_at ? new Date(item.updated_at).toLocaleString() : '-';

  const asDateTime = (v?: string | null) => (v ? new Date(v).toLocaleString() : '-');
  const toNumber = (v: any) => (typeof v === 'number' ? v : Number(String(v || '').replace(/[^0-9.-]/g, '')) || 0);
  const usedDepositOption = toNumber(item.deposit_amount) > 0 && toNumber(item.deposit_amount) < toNumber(item.total_amount);

  const firstPaymentAt = item.first_payment_at || item.deposit_paid_at || item.fully_paid_at || null;
  const balancePaymentAt = item.balance_paid_at || (usedDepositOption && item.fully_paid_at ? item.fully_paid_at : null);

  const timeline = Array.isArray(item.payment_events) ? [...item.payment_events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) : [];

  const statusStyle = statusStyles[item.status] || { bg: 'bg-gray-50 dark:bg-gray-900/50', text: 'text-gray-700 dark:text-gray-300', border: 'border-gray-200 dark:border-gray-700' };

  const handleDownloadPdf = async () => {
    try {
      const el = printableRef.current;
      if (!el) return;
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff', scrollY: -window.scrollY });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight - pageHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      while (heightLeft > 0) {
        pdf.addPage();
        position = -(imgHeight - heightLeft);
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `preorder_${item.pre_order_number || item.id}_${dateStr}.pdf`;
      pdf.save(filename);
      toast.success('PDF downloaded');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate PDF');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Hash className="h-5 w-5 text-primary" />
                </div>
                <span>{item.pre_order_number}</span>
              </DialogTitle>
              <DialogDescription className="text-base">Complete pre-order information and timeline</DialogDescription>
            </div>
            <div className="flex flex-col gap-2">
              <Badge className={`${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} border-2 px-4 py-1.5 font-semibold capitalize`}>
                {item.status.replace(/_/g, ' ')}
              </Badge>
              <Badge variant="outline" className="capitalize font-semibold border-2">
                {item.payment_status.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="flex justify-end mb-3">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadPdf}>
              Download PDF
            </Button>
            <Button size="sm" onClick={() => setIsNotifyOpen(true)}>
              Notify customer
            </Button>
          </div>
        </div>

        <div ref={printableRef} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <div className="rounded-xl border-2 p-5 bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-base">Customer Information</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium">{fullName || '-'}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="break-all text-sm">{item.customer_email}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-lg">
                  <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">{item.customer_phone}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border-2 p-5 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/20 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="font-bold text-base">Product Details</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg">
                  <div className="font-semibold text-base mb-1">{productName}</div>
                  {categoryName && (
                    <div className="text-xs text-muted-foreground">Category: {categoryName}</div>
                  )}
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Quantity</span>
                    <Badge variant="secondary" className="font-bold text-base">{item.quantity}</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border-2 p-5 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/20 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-bold text-base">Payment Breakdown</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg">
                  <span className="text-sm font-medium">Total Amount</span>
                  <span className="font-bold text-base">{formatCurrency(item.total_amount, item.currency)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg">
                  <span className="text-sm text-muted-foreground">Deposit Paid</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(item.deposit_amount, item.currency)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg">
                  <span className="text-sm text-muted-foreground">Remaining</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400">{formatCurrency(item.remaining_amount, item.currency)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border-2 p-5 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/20 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <Truck className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <h3 className="font-bold text-base">Fulfillment Details</h3>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg">
                  <div className="text-xs text-muted-foreground mb-1">Method</div>
                  <div className="font-semibold capitalize">{item.fulfillment_method}</div>
                </div>
                {item.fulfillment_method === 'delivery' ? (
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="text-sm break-words">{item.shipping_address || '-'}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.city || '-'} • {item.state || '-'}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-lg">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="text-sm">{item.pickup_location || '-'}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg border-2 p-4 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Payment Status</span>
              </div>
              <div className="font-semibold capitalize">{item.payment_status.replace(/_/g, ' ')}</div>
            </div>
            <div className="rounded-lg border-2 p-4 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 mb-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Created</span>
              </div>
              <div className="font-medium text-sm">{createdAt}</div>
            </div>
            <div className="rounded-lg border-2 p-4 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2 mb-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Updated</span>
              </div>
              <div className="font-medium text-sm">{updatedAt}</div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border-2 p-5 bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-900/20 dark:to-indigo-800/20">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="font-bold text-base">Payment Timeline</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
              <div className="rounded-lg border-2 p-4 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">First Payment</span>
                </div>
                <div className="font-medium">{asDateTime(firstPaymentAt)}</div>
              </div>
              <div className="rounded-lg border-2 p-4 bg-white dark:bg-slate-900">
                <div className="flex items-center gap-2 mb-2">
                  {balancePaymentAt ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-xs uppercase tracking-wide font-semibold text-muted-foreground">Balance Payment</span>
                </div>
                <div className="font-medium">{usedDepositOption ? asDateTime(balancePaymentAt) : '-'}</div>
              </div>
            </div>

            {timeline.length > 0 && (
              <div>
                <div className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Payment Events</div>
                <div className="space-y-3">
                  {timeline.map((ev, idx) => (
                    <div key={idx} className="flex items-start justify-between rounded-lg border-2 p-4 bg-white dark:bg-slate-900">
                      <div className="space-y-1">
                        <div className="font-semibold capitalize flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                          {ev.type.replace(/_/g, ' ')}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <CalendarClock className="h-3 w-3" />
                          {new Date(ev.date).toLocaleString()}
                        </div>
                        {ev.reference && (
                          <div className="text-xs">
                            <span className="text-muted-foreground">Ref:</span>{' '}
                            <span className="font-mono font-semibold">{ev.reference}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right space-y-1">
                        <div className="font-bold text-lg">{formatCurrency(ev.amount, item.currency)}</div>
                        <Badge variant={ev.status === 'success' ? 'default' : 'secondary'} className="capitalize text-xs">
                          {ev.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {item?.pre_order_number && (
            <div className="mt-6 p-4 rounded-lg border">
              <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Order Reference</div>
              <div className="font-mono font-semibold">{item.pre_order_number}</div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t-2 space-y-4">
          {item?.pre_order_number && (
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg">
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Order Reference</div>
                <div className="font-mono font-semibold">{item.pre_order_number}</div>
              </div>
              <Button variant="outline" size="sm" onClick={() => copy(item.pre_order_number, 'Pre-order number')} className="shadow-sm">
                <ClipboardCopy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          )}

          {onUpdateStatus && (
            <div className="flex flex-wrap gap-3">
              <Button 
                size="default" 
                variant="outline" 
                onClick={() => onUpdateStatus('ready_for_pickup')} 
                disabled={item.status === 'ready_for_pickup' || item.status === 'completed'}
                className="shadow-sm font-semibold"
              >
                <Package className="h-4 w-4 mr-2" />
                Mark Ready for Pickup
              </Button>
              <Button 
                size="default" 
                onClick={() => onUpdateStatus('completed')} 
                disabled={item.status === 'completed'}
                className="shadow-sm font-semibold"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark as Completed
              </Button>
            </div>
          )}
        </div>

        {/* New: per-customer notification dialog */}
        <NotifyCustomerDialog open={isNotifyOpen} onOpenChange={setIsNotifyOpen} item={item} />
      </DialogContent>
    </Dialog>
  );
}