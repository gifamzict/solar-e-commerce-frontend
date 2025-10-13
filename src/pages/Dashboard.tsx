import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Package, TrendingUp, Wallet, CreditCard, Clock, PieChart as PieChartIcon, ArrowUpRight, ArrowDownRight, Activity, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import { getSalesByCategory, getLowStockAlerts, type CategorySalesItem, type LowStockAlert } from "@/services/dashboard";
import { getOrders, getOrderStatistics, type PaginatedOrders, type OrderStatistics } from "@/services/order";
import { paymentService, type PaymentDashboard, type PaymentTransaction, type PaymentMethodBreakdownItem, type PaymentStatsResponse } from "@/services/payment";
import { listCustomerPreorders, type AdminCustomerPreorderItem } from "@/services/admin-customer-preorder";
import { formatNaira } from "@/lib/utils";
import { getDashboardOverview } from "@/services/dashboard-aggregate";

const statusColors = {
  Delivered: "bg-success text-success-foreground",
  Processing: "bg-primary text-primary-foreground",
  Shipped: "bg-accent text-accent-foreground",
  Pending: "bg-warning text-warning-foreground",
};

function getStatusBadgeClass(status: string) {
  const s = status?.toLowerCase?.() || "";
  if (s.includes("deliver") || s === "completed" || s === "paid") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
  if (s.includes("process") || s === "processing") return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800";
  if (s.includes("ship") || s === "shipped") return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800";
  if (s.includes("pend") || s === "pending") return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800";
  if (s.includes("fail") || s === "failed") return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800";
  return "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400";
}

function parseAmountToNumber(amount: string | number | undefined): number {
  if (typeof amount === "number") return amount;
  if (!amount) return 0;
  const normalized = String(amount).replace(/[^0-9.,-]/g, "").replace(/,/g, "");
  const n = parseFloat(normalized);
  return isNaN(n) ? 0 : n;
}

function chartColor(idx: number): string {
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];
  return colors[idx % colors.length];
}

export default function Dashboard() {
  const [categorySales, setCategorySales] = useState<CategorySalesItem[] | null>(null);
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockAlert[] | null>(null);

  const [ordersPage, setOrdersPage] = useState<PaginatedOrders | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStatistics | null>(null);

  const [paymentDash, setPaymentDash] = useState<PaymentDashboard | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodBreakdownItem[] | null>(null);
  const [paymentStats, setPaymentStats] = useState<PaymentStatsResponse | null>(null);
  const [paymentPeriod, setPaymentPeriod] = useState<'week' | 'month' | 'year'>('month');

  const [preorders, setPreorders] = useState<AdminCustomerPreorderItem[]>([]);

  const [loadingCards, setLoadingCards] = useState({ category: true, stock: true, stats: true, orders: true, payments: true, methods: true, preorders: true });

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        // Try aggregated endpoint first
        const aggregate = await getDashboardOverview('current_month').catch(() => null);
        if (aggregate) {
          if (!isMounted) return;
          setCategorySales((aggregate.sales_by_category as any) || []);
          setLowStockAlerts((aggregate.low_stock_alerts as any) || []);
          if (aggregate.order_statistics) setOrderStats(aggregate.order_statistics as OrderStatistics);
          if (aggregate.payment_dashboard) setPaymentDash(aggregate.payment_dashboard as PaymentDashboard);
          if (aggregate.recent_transactions) setTransactions(aggregate.recent_transactions as PaymentTransaction[]);
          const pm = Array.isArray(aggregate.payment_methods)
            ? aggregate.payment_methods
            : (aggregate.payment_methods as any)?.payment_methods;
          if (pm) setPaymentMethods(pm as PaymentMethodBreakdownItem[]);
          if (aggregate.preorder_metrics || aggregate.recent_preorders) {
            const cpo = aggregate.recent_preorders || [];
            setPreorders(cpo as AdminCustomerPreorderItem[]);
          } else {
            const cpo = await listCustomerPreorders({ page: 1, per_page: 30 }).catch(() => null);
            if (cpo) {
              const items = (cpo as any).data ?? (Array.isArray(cpo) ? cpo : (cpo as any).data?.data) ?? (cpo as any).preorders ?? [];
              setPreorders(items as AdminCustomerPreorderItem[]);
            }
          }
          // Still load orders list for table
          const ordersRes = await getOrders(1, 'all', '').catch(() => null);
          if (ordersRes) setOrdersPage(ordersRes as PaginatedOrders);
        } else {
          const [categories, lowStock, ordersRes, orderStatistics, payDash, recentTx, methods, cpo] = await Promise.all([
            getSalesByCategory('current_month').catch(() => []),
            getLowStockAlerts().catch(() => []),
            getOrders(1, 'all', '').catch(() => null),
            getOrderStatistics().catch(() => null),
            paymentService.getPaymentDashboard().catch(() => null),
            paymentService.getRecentTransactions(1, 60).catch(() => null),
            paymentService.getPaymentMethodBreakdown().catch(() => null),
            listCustomerPreorders({ page: 1, per_page: 30 }).catch(() => null),
          ]);
          if (!isMounted) return;
          setCategorySales(categories as CategorySalesItem[]);
          setLowStockAlerts(lowStock as LowStockAlert[]);
          if (ordersRes) setOrdersPage(ordersRes as PaginatedOrders);
          if (orderStatistics) setOrderStats(orderStatistics as OrderStatistics);
          if (payDash) setPaymentDash(payDash as PaymentDashboard);
          if (recentTx && 'transactions' in (recentTx as any)) setTransactions((recentTx as any).transactions as PaymentTransaction[]);
          if (methods && 'payment_methods' in (methods as any)) setPaymentMethods((methods as any).payment_methods as PaymentMethodBreakdownItem[]);
          if (cpo) {
            const items = (cpo as any).data ?? (Array.isArray(cpo) ? cpo : (cpo as any).data?.data) ?? (cpo as any).preorders ?? [];
            setPreorders(items as AdminCustomerPreorderItem[]);
          }
        }
      } finally {
        if (isMounted) setLoadingCards({ category: false, stock: false, stats: false, orders: false, payments: false, methods: false, preorders: false });
      }
    })();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const stats = await paymentService.getPaymentStats(paymentPeriod).catch(() => null);
        if (isMounted && stats) setPaymentStats(stats);
      } finally {}
    })();
    return () => { isMounted = false; };
  }, [paymentPeriod]);

  const revenueChartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [] as { name: string; revenue: number; orders: number }[];
    const map = new Map<string, { revenue: number; orders: number }>();
    for (const tx of transactions) {
      const dateKey = (tx.formatted_date || tx.date || '').toString();
      if (!dateKey) continue;
      const current = map.get(dateKey) || { revenue: 0, orders: 0 };
      const amt = tx.amount_raw !== undefined ? tx.amount_raw : parseAmountToNumber(tx.amount);
      current.revenue += amt || 0;
      current.orders += 1;
      map.set(dateKey, current);
    }
    const arr = Array.from(map.entries()).map(([name, v]) => ({ name, ...v }));
    arr.sort((a, b) => {
      const ad = new Date(a.name).getTime();
      const bd = new Date(b.name).getTime();
      if (!isNaN(ad) && !isNaN(bd)) return ad - bd;
      return a.name.localeCompare(b.name);
    });
    return arr;
  }, [transactions]);

  const categoryChartData = (categorySales && categorySales.length > 0)
    ? categorySales.map(c => ({ category: c.category, sales: c.sales }))
    : [] as { category: string; sales: number }[];

  const paymentMethodPie = (paymentMethods && paymentMethods.length > 0)
    ? paymentMethods.map((m) => ({ name: m.method, value: m.transaction_count, amount: m.total_amount }))
    : [] as { name: string; value: number; amount: number }[];

  const orderStatusData = useMemo(() => {
    const counts = new Map<string, number>();
    const list = ordersPage?.orders || [];
    for (const o of list) {
      const key = o.status || 'Unknown';
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return Array.from(counts.entries()).map(([status, count]) => ({ status, count }));
  }, [ordersPage]);

  const preorderKPIs = useMemo(() => {
    const items = preorders || [];
    const total = items.length;
    let deposit = 0, remaining = 0, totalAmount = 0, pendingCount = 0;
    for (const it of items) {
      deposit += parseAmountToNumber((it as any).deposit_amount);
      remaining += parseAmountToNumber((it as any).remaining_amount);
      totalAmount += parseAmountToNumber((it as any).total_amount);
      const st = (it.status || '').toString().toLowerCase();
      if (st.includes('pending')) pendingCount += 1;
    }
    return { total, deposit, remaining, totalAmount, pendingCount };
  }, [preorders]);

  const preorderStatusData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const it of preorders || []) {
      const key = (it.status || 'unknown').toString();
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    return Array.from(counts.entries()).map(([status, count]) => ({ status, count }));
  }, [preorders]);

  const preorderTimeline = useMemo(() => {
    const map = new Map<string, { count: number; amount: number }>();
    for (const it of preorders || []) {
      const name = (it.created_at || '').toString().slice(0, 10);
      if (!name) continue;
      const cur = map.get(name) || { count: 0, amount: 0 };
      cur.count += 1;
      cur.amount += parseAmountToNumber((it as any).total_amount);
      map.set(name, cur);
    }
    const arr = Array.from(map.entries()).map(([name, v]) => ({ name, ...v }));
    arr.sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
    return arr;
  }, [preorders]);

  return (
    <div className="space-y-8 pb-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
        <div>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground mt-2 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Real-time insights from your store
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground font-medium">Payment Period:</span>
          <select
            value={paymentPeriod}
            onChange={(e) => setPaymentPeriod(e.target.value as 'week' | 'month' | 'year')}
            className="border-2 rounded-lg px-4 py-2 bg-background font-semibold shadow-sm hover:border-primary transition-colors"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Core KPIs with gradient cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Total Revenue</p>
                <h3 className="text-3xl font-bold mt-2 text-blue-900 dark:text-blue-100">
                  {paymentDash ? formatNaira(paymentDash.total_revenue.amount ?? paymentDash.total_revenue.formatted) : '—'}
                </h3>
                {paymentDash?.total_revenue?.change_text && (
                  <p className={`text-sm mt-2 flex items-center gap-1 font-medium ${(paymentDash?.total_revenue?.change_percentage || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {(paymentDash?.total_revenue?.change_percentage || 0) >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {paymentDash.total_revenue.change_text}
                  </p>
                )}
              </div>
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/30 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Total Orders</p>
                <h3 className="text-3xl font-bold mt-2 text-emerald-900 dark:text-emerald-100">
                  {orderStats ? String(orderStats.total_orders) : '—'}
                </h3>
              </div>
              <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <ShoppingCart className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200 dark:border-purple-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">Completed Payments</p>
                <h3 className="text-3xl font-bold mt-2 text-purple-900 dark:text-purple-100">
                  {paymentDash ? String(paymentDash.completed_payments.count) : '—'}
                </h3>
                {paymentDash?.completed_payments?.change_text && (
                  <p className={`text-sm mt-2 flex items-center gap-1 font-medium ${(paymentDash?.completed_payments?.change_percentage || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {(paymentDash?.completed_payments?.change_percentage || 0) >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {paymentDash.completed_payments.change_text}
                  </p>
                )}
              </div>
              <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Package className="h-7 w-7 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30 border-orange-200 dark:border-orange-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide">Avg. Transaction</p>
                <h3 className="text-3xl font-bold mt-2 text-orange-900 dark:text-orange-100">
                  {paymentDash ? formatNaira(paymentDash.average_transaction.amount ?? paymentDash.average_transaction.formatted) : '—'}
                </h3>
                {paymentDash?.average_transaction?.change_text && (
                  <p className={`text-sm mt-2 flex items-center gap-1 font-medium ${(paymentDash?.average_transaction?.change_percentage || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {(paymentDash?.average_transaction?.change_percentage || 0) >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    {paymentDash.average_transaction.change_text}
                  </p>
                )}
              </div>
              <div className="w-14 h-14 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pre-order KPIs */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Clock className="h-6 w-6 text-primary" />
          Pre-order Metrics
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-2 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Pre-orders</p>
                  <h3 className="text-3xl font-bold mt-2">{String(preorderKPIs.total || 0)}</h3>
                </div>
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/30 dark:to-green-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">Deposits</p>
                  <h3 className="text-2xl font-bold mt-2">{formatNaira(preorderKPIs.deposit || 0)}</h3>
                </div>
                <div className="w-12 h-12 bg-green-200 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/30 dark:to-amber-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Outstanding</p>
                  <h3 className="text-2xl font-bold mt-2">{formatNaira(preorderKPIs.remaining || 0)}</h3>
                </div>
                <div className="w-12 h-12 bg-amber-200 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/30 dark:to-red-800/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide">Pending</p>
                  <h3 className="text-3xl font-bold mt-2">{String(preorderKPIs.pendingCount || 0)}</h3>
                </div>
                <div className="w-12 h-12 bg-red-200 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
                  <PieChartIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Revenue Chart + Recent Transactions */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-2 shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={revenueChartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
                  <XAxis dataKey="name" className="text-xs" stroke="#64748b" />
                  <YAxis className="text-xs" stroke="#64748b" />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} name="Revenue" fill="url(#colorRevenue)" />
                  <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={3} name="Orders" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[320px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No recent transactions to display</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-2 shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {transactions && transactions.length > 0 ? (
                transactions.slice(0, 5).map((tx, index) => (
                  <div key={`${tx.order_id}-${index}`} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{tx.customer || tx.customer_email || 'Customer'}</p>
                      <p className="text-xs text-muted-foreground">{tx.method} • {tx.formatted_date || tx.date}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-bold">{formatNaira((tx as any).amount_raw ?? tx.amount)}</p>
                      <Badge className={`${getStatusBadgeClass(tx.status)} text-xs font-semibold border`}>{tx.status}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No transactions found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods & Order Status */}
      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-3 border-2 shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {paymentMethodPie.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Legend />
                    <Pie data={paymentMethodPie} dataKey="value" nameKey="name" outerRadius={90} label>
                      {paymentMethodPie.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={chartColor(i)} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {paymentStats && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wide">Total</p>
                      <p className="text-2xl font-bold mt-1">{paymentStats?.stats?.total_transactions ?? '—'}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wide">Success Rate</p>
                      <p className="text-2xl font-bold mt-1">{paymentStats?.stats?.success_rate ?? '—'}%</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/30 dark:to-green-900/20 border-2 border-green-200 dark:border-green-800">
                      <p className="text-xs text-green-600 dark:text-green-400 font-semibold uppercase tracking-wide">Successful</p>
                      <p className="text-2xl font-bold mt-1">{paymentStats?.stats?.successful_payments ?? '—'}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 border-2 border-red-200 dark:border-red-800">
                      <p className="text-xs text-red-600 dark:text-red-400 font-semibold uppercase tracking-wide">Failed</p>
                      <p className="text-2xl font-bold mt-1">{paymentStats?.stats?.failed_payments ?? '—'}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="h-[240px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No payment method data</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-2 shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Order Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {orderStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={orderStatusData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
                  <XAxis dataKey="status" className="text-xs" stroke="#64748b" />
                  <YAxis className="text-xs" stroke="#64748b" />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No order status data</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders Table */}
      <Card className="border-2 shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-900/50">
                <TableHead className="font-bold">Order No</TableHead>
                <TableHead className="font-bold">Customer</TableHead>
                <TableHead className="font-bold">Amount</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold">Date</TableHead>
                <TableHead className="font-bold">Items</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersPage && ordersPage.orders && ordersPage.orders.length > 0 ? (
                ordersPage.orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                    <TableCell className="font-semibold">{order.order_number}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell className="font-bold">{formatNaira(order.formatted_total)}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusBadgeClass(order.status)} font-semibold border`}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{order.formatted_date}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-semibold">{order.items_count}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
                    <p className="text-muted-foreground">No recent orders found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Category Sales & Low Stock */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-2 shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50">
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              Sales by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
                  <XAxis dataKey="category" className="text-xs" stroke="#64748b" />
                  <YAxis className="text-xs" stroke="#64748b" />
                  <Tooltip formatter={(v) => formatNaira(v as any)} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="sales" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <PieChartIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No category sales data</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-red-600" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3 max-h-[280px] overflow-y-auto">
              {lowStockAlerts && lowStockAlerts.length > 0 ? (
                lowStockAlerts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border-2 border-red-200 dark:border-red-800 rounded-lg bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 hover:shadow-md transition-shadow">
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{product.name}</p>
                      <p className="text-xs text-red-600 dark:text-red-400 font-medium">{product.stock_message || `Only ${product.stock} units left`}</p>
                    </div>
                    <Badge className="bg-red-600 text-white border-0 font-bold">Low Stock</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-50 text-emerald-600" />
                  <p className="font-medium">All products are well stocked! 🎉</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pre-order Analytics */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          Pre-order Analytics
        </h2>
        <div className="grid gap-6 lg:grid-cols-7">
          <Card className="lg:col-span-3 border-2 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50">
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                Pre-order Status
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {preorderStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Legend />
                    <Pie data={preorderStatusData} dataKey="count" nameKey="status" outerRadius={90} label>
                      {preorderStatusData.map((_, i) => (
                        <Cell key={`cpo-${i}`} fill={chartColor(i)} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No pre-order data</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-4 border-2 shadow-lg">
            <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50">
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Deposits vs Remaining
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={[{ name: 'Pre-orders', deposit: preorderKPIs.deposit || 0, remaining: preorderKPIs.remaining || 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
                  <XAxis dataKey="name" className="text-xs" stroke="#64748b" />
                  <YAxis className="text-xs" stroke="#64748b" />
                  <Tooltip formatter={(v) => formatNaira(v as any)} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                  <Legend />
                  <Bar dataKey="deposit" name="Deposits" fill="#10b981" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="remaining" name="Remaining" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Pre-order Timeline & Recent */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-2 shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Pre-order Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {preorderTimeline.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={preorderTimeline}>
                  <defs>
                    <linearGradient id="colorCpo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" opacity={0.3} />
                  <XAxis dataKey="name" className="text-xs" stroke="#64748b" />
                  <YAxis className="text-xs" stroke="#64748b" />
                  <Tooltip formatter={(val: any, key: any) => key === 'amount' ? [formatNaira(val), 'Amount'] : [val, 'Count']} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  <Legend />
                  <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorCpo)" name="Count" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No timeline data</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 shadow-lg">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Recent Pre-orders
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3 max-h-[280px] overflow-y-auto">
              {preorders && preorders.length > 0 ? (
                preorders.slice(0, 6).map((po) => (
                  <div key={po.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors border">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{po.pre_order_number || `#${po.id}`}</p>
                      <p className="text-xs text-muted-foreground truncate">{po.first_name} {po.last_name} • {po.customer_email}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-bold">{formatNaira((po as any).total_amount || 0)}</p>
                      <Badge className={`${getStatusBadgeClass(String(po.status))} text-xs font-semibold border`}>{String(po.status)}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No pre-orders found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}