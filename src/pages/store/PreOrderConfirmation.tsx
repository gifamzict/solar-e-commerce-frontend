import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCustomerPreorderByNumber, type CustomerPreOrder, initializeCustomerPreorderPayment, verifyCustomerPreorderPayment, exchangePreorderPaymentToken } from '@/services/customer-preorder';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, ArrowLeft, Clock, Mail, Phone, User, Package, CreditCard, Wallet, ShoppingBag } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import { toast } from 'sonner';
import { useEffect, useMemo, useState } from 'react';

// Currency formatter helper
function formatCurrency(value: number | string, currency = 'NGN') {
  const num = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.-]/g, ''));
  if (Number.isNaN(num)) return '0.00';
  try {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(num);
  } catch {
    return `${currency} ${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  }
}
// Helper to coerce money-like values to number
function toNumber(val: number | string | undefined | null) {
  if (val == null) return 0;
  return typeof val === 'number' ? val : Number(String(val).replace(/[^0-9.-]/g, '')) || 0;
}

const statusMap: Record<string, { bg: string; text: string; icon: string }> = {
  pending: { bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300', icon: '⏳' },
  deposit_paid: { bg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', icon: '💳' },
  fully_paid: { bg: 'bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-800', text: 'text-purple-700 dark:text-purple-300', icon: '✅' },
  ready_for_pickup: { bg: 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800', text: 'text-indigo-700 dark:text-indigo-300', icon: '📦' },
  completed: { bg: 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-300', icon: '🎉' },
  cancelled: { bg: 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800', text: 'text-red-700 dark:text-red-300', icon: '❌' },
};

export default function PreOrderConfirmation() {
  const { preOrderNumber } = useParams<{ preOrderNumber: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || undefined;
  const [isPaying, setIsPaying] = useState(false);

  // Normalize incoming order number to reduce Not Found due to case/spacing
  const normalizedPreOrderNumber = useMemo(() => {
    return (preOrderNumber || '').trim().toUpperCase().replace(/\s+/g, '');
  }, [preOrderNumber]);

  const { data, isLoading, isError, refetch } = useQuery<{ success: boolean; data: CustomerPreOrder } | CustomerPreOrder>({
    queryKey: ['customer-preorder', normalizedPreOrderNumber],
    queryFn: async () => {
      const res = await getCustomerPreorderByNumber(normalizedPreOrderNumber);
      return res;
    },
    enabled: !!normalizedPreOrderNumber,
  });

  const preorder: CustomerPreOrder | undefined = (data as any)?.data ?? (data as any);

  const canPayRemaining = useMemo(() => {
    if (!preorder) return false;
    // Allow payment completion whenever a deposit exists and there is a positive remaining balance
    return preorder.payment_status === 'deposit_paid' && toNumber(preorder.remaining_amount) > 0;
  }, [preorder]);

  // Validate deep-link token if present
  const { data: tokenInfo, isLoading: isTokenLoading, isError: isTokenError } = useQuery({
    queryKey: ['cpo-pay-token', token],
    queryFn: async () => {
      if (!token) return null as any;
      try {
        return await exchangePreorderPaymentToken(token);
      } catch (e: any) {
        toast.error(e?.message || 'Invalid or expired payment link');
        throw e;
      }
    },
    enabled: !!token,
    staleTime: 0,
  });

  // Determine if payment can proceed (either state-based or token-based)
  const canPayRemainingEffective = useMemo(() => {
    const stateOkay = canPayRemaining;
    const tokenOkay = !!tokenInfo?.success && ((tokenInfo as any)?.data?.amount_due ?? 0) > 0;
    return stateOkay || tokenOkay;
  }, [canPayRemaining, tokenInfo]);

  const handlePayRemaining = async () => {
    if (!preorder) return;
    setIsPaying(true);
    try {
      const init = await initializeCustomerPreorderPayment({
        customer_pre_order_id: preorder.id,
        payment_type: 'full',
      });
      if (!init?.success) {
        toast.error(init?.message || 'Failed to initialize payment');
        setIsPaying(false);
        return;
      }

      const config = {
        reference: init.data.reference,
        email: preorder.customer_email,
        amount: Math.round(Number(init.data.amount) * 100),
        publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY!,
        text: `Pay ${formatCurrency(init.data.amount, preorder.currency || 'NGN')}`,
        currency: preorder.currency || 'NGN',
        onSuccess: async (ref: any) => {
          try {
            const verify = await verifyCustomerPreorderPayment(ref.reference);
            if ((verify as any)?.success) {
              toast.success('Remaining balance paid successfully.');
              await refetch();
            } else {
              toast.error('Payment verification failed.');
            }
          } catch (e) {
            console.error('Verification error:', e);
            toast.error('Payment verification failed.');
          } finally {
            setIsPaying(false);
          }
        },
        onClose: () => setIsPaying(false),
      } as const;
      const initializePaystackPayment = usePaystackPayment(config);
      initializePaystackPayment(config);
    } catch (e) {
      console.error(e);
      toast.error('Failed to start payment');
      setIsPaying(false);
    }
  };

  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'pay-remaining' && canPayRemainingEffective && !isPaying) {
      handlePayRemaining();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, canPayRemainingEffective]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-primary/30 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-t-primary border-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="text-lg font-medium text-muted-foreground">Loading your pre-order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !preorder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-md mx-auto text-center">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Pre-order Not Found</h1>
            <p className="text-muted-foreground mb-8 text-lg">We couldn't find a pre-order with that number. Please check your order number and try again.</p>
            <Button asChild size="lg" className="shadow-lg">
              <Link to="/pre-orders">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Browse Pre-orders
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const statusStyle = statusMap[preorder.status] || { bg: 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700', text: 'text-gray-700 dark:text-gray-300', icon: '📋' };
  const isFullyPaid = preorder.payment_status === 'fully_paid';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-4 shadow-lg shadow-green-500/30">
              <CheckCircle className="h-10 w-10 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Pre-order Confirmed!
            </h1>
            <p className="text-lg text-muted-foreground">
              Order #{normalizedPreOrderNumber}
            </p>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center mb-8">
            <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 ${statusStyle.bg} ${statusStyle.text} font-semibold text-sm shadow-md`}>
              <span className="text-lg">{statusStyle.icon}</span>
              <span className="capitalize">{preorder.status.replace(/_/g, ' ')}</span>
            </div>
          </div>

          {/* Main Content Cards */}
          <div className="grid gap-6 mb-8">
            {/* Customer & Product Info Card */}
            <Card className="border-2 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 px-6 py-4 border-b">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Order Details
                </h2>
              </div>
              <CardContent className="p-6 space-y-6">
                {/* Customer Info */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border">
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-4">Customer Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-base">{preorder.first_name} {preorder.last_name}</p>
                        <p className="text-sm text-muted-foreground">Customer Name</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-base break-all">{preorder.customer_email}</p>
                        <p className="text-sm text-muted-foreground">Email Address</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-base">{preorder.customer_phone}</p>
                        <p className="text-sm text-muted-foreground">Phone Number</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-5 border">
                  <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-4">Product Details</h3>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-lg mb-1">{preorder.preOrder?.product_name}</p>
                      <div className="inline-flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Quantity:</span>
                        <Badge variant="secondary" className="font-semibold">{preorder.quantity}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary Card */}
            <Card className="border-2 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500/5 via-emerald-500/10 to-emerald-500/5 dark:from-emerald-500/10 dark:via-emerald-500/20 dark:to-emerald-500/10 px-6 py-4 border-b">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  Payment Summary
                </h2>
              </div>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Payment Status */}
                  <div className="flex items-center justify-between pb-4 border-b">
                    <span className="text-muted-foreground font-medium">Payment Status</span>
                    <Badge variant="outline" className="capitalize font-semibold px-3 py-1">
                      {preorder.payment_status.replace(/_/g, ' ')}
                    </Badge>
                  </div>

                  {/* Amounts */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Total Amount</span>
                      <span className="font-semibold text-lg">{formatCurrency(preorder.total_amount, preorder.currency || 'NGN')}</span>
                    </div>
                    {/* Show deposit and remaining only when not fully paid */}
                    {!isFullyPaid ? (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Deposit Paid</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(preorder.deposit_amount, preorder.currency || 'NGN')}</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between pt-2">
                          <span className="font-semibold text-base">Remaining Balance</span>
                          <span className="font-bold text-xl text-primary">{formatCurrency(preorder.remaining_amount, preorder.currency || 'NGN')}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Separator />
                        <div className="flex items-center justify-between pt-2">
                          <span className="font-semibold text-base">Amount Paid</span>
                          <span className="font-bold text-xl text-emerald-600 dark:text-emerald-400">{formatCurrency(preorder.total_amount, preorder.currency || 'NGN')}</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Payment Action */}
                  {canPayRemainingEffective && (
                    <div className="pt-6 space-y-3">
                      <Button 
                        onClick={handlePayRemaining} 
                        disabled={isPaying || isTokenLoading}
                        size="lg"
                        className="w-full text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                      >
                        <Wallet className="h-5 w-5 mr-2" />
                        {isPaying ? 'Processing Payment...' : 'Pay Remaining Balance'}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                        <span className="inline-block w-1 h-1 bg-green-500 rounded-full"></span>
                        Secure payment powered by Paystack
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto shadow-md">
              <Link to="/pre-orders">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Browse More Pre-orders
              </Link>
            </Button>
            <Button asChild size="lg" className="w-full sm:w-auto shadow-md">
              <Link to="/pre-orders/track">
                <Package className="h-4 w-4 mr-2" />
                Track Another Order
              </Link>
            </Button>
          </div>

          {/* Footer Link */}
          <div className="text-center">
            <Button asChild variant="ghost" size="lg" className="group">
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}