import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CreditCard, DollarSign, TrendingUp, Clock } from "lucide-react";
import {
  paymentService,
  type PaymentDashboard,
  type PaymentTransaction,
  type PaymentTransactionsResponse,
} from "@/services/payment";
import { ensureNairaSymbol } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const statusColors = {
  Completed: "bg-success text-success-foreground",
  Pending: "bg-warning text-warning-foreground",
  Failed: "bg-destructive text-destructive-foreground",
  Refunded: "bg-muted text-muted-foreground",
} as const;

export default function Payments() {
  const [dashboard, setDashboard] = useState<PaymentDashboard | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [pagination, setPagination] = useState<PaymentTransactionsResponse["pagination"] | null>(
    null
  );
  const [page, setPage] = useState(1);
  const perPage = 10;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | "orders" | "pre-orders">("all");

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [dash, tx] = await Promise.all([
          paymentService.getPaymentDashboard(),
          paymentService.getRecentTransactions(page, perPage, { type: typeFilter }),
        ]);
        if (!isMounted) return;
        setDashboard(dash);
        setTransactions(tx.transactions);
        setPagination(tx.pagination);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message || "Failed to load payments data");
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [page, typeFilter]);

  const revenueUp = (dashboard?.total_revenue.change_percentage ?? 0) >= 0;
  const avgUp = (dashboard?.average_transaction.change_percentage ?? 0) >= 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment Management</h1>
        <p className="text-muted-foreground mt-1">Track and manage payment transactions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard ? ensureNairaSymbol(dashboard.total_revenue.formatted) : "—"}</div>
            {dashboard && (
              <p className={`text-xs mt-1 ${revenueUp ? "text-success" : "text-destructive"}`}>
                {dashboard.total_revenue.change_text}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.completed_payments.count ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Successful payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard?.pending_payments.count ?? 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Processing payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboard ? ensureNairaSymbol(dashboard.average_transaction.formatted) : "—"}</div>
            {dashboard && (
              <p className={`text-xs mt-1 ${avgUp ? "text-success" : "text-destructive"}`}>
                {dashboard.average_transaction.change_text}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-end mb-3 gap-2">
            <div className="text-sm text-muted-foreground">Show:</div>
            <Select
              value={typeFilter}
              onValueChange={(v) => {
                setPage(1);
                setTypeFilter(v as any);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="orders">Orders</SelectItem>
                <SelectItem value="pre-orders">Pre-orders</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="text-sm text-destructive mb-3">{error}</div>
          )}
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((payment) => (
                    <TableRow key={payment.order_id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{payment.order_id}</TableCell>
                      <TableCell>{payment.customer}</TableCell>
                      <TableCell className="font-semibold">{ensureNairaSymbol(payment.amount)}</TableCell>
                      <TableCell className="text-muted-foreground">{payment.method}</TableCell>
                      <TableCell className="text-muted-foreground">{payment.date}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[payment.status as keyof typeof statusColors]}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {transactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  {pagination ? (
                    <>Page {pagination.current_page} of {pagination.last_page}</>
                  ) : (
                    <>Page {page}</>
                  )}
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!pagination || pagination.current_page <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => (pagination ? Math.min(pagination.last_page, p + 1) : p + 1))}
                    disabled={!pagination || pagination.current_page >= pagination.last_page}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
