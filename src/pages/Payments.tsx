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
import { CreditCard, DollarSign, TrendingUp, Clock } from "lucide-react";

const payments = [
  { id: 1, orderId: "#ORD-2024-001", customer: "John Doe", amount: "$245.50", method: "Credit Card", status: "Completed", date: "2024-01-15" },
  { id: 2, orderId: "#ORD-2024-002", customer: "Jane Smith", amount: "$189.99", method: "PayPal", status: "Completed", date: "2024-01-14" },
  { id: 3, orderId: "#ORD-2024-003", customer: "Mike Johnson", amount: "$567.80", method: "Credit Card", status: "Pending", date: "2024-01-14" },
  { id: 4, orderId: "#ORD-2024-004", customer: "Sarah Williams", amount: "$99.99", method: "Debit Card", status: "Completed", date: "2024-01-13" },
  { id: 5, orderId: "#ORD-2024-005", customer: "Tom Brown", amount: "$324.50", method: "Credit Card", status: "Failed", date: "2024-01-13" },
  { id: 6, orderId: "#ORD-2024-006", customer: "Emily Davis", amount: "$456.00", method: "PayPal", status: "Refunded", date: "2024-01-12" },
];

const statusColors = {
  Completed: "bg-success text-success-foreground",
  Pending: "bg-warning text-warning-foreground",
  Failed: "bg-destructive text-destructive-foreground",
  Refunded: "bg-muted text-muted-foreground",
};

export default function Payments() {
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
            <div className="text-2xl font-bold">$45,231</div>
            <p className="text-xs text-success mt-1">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">Successful payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground mt-1">Processing payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$312.50</div>
            <p className="text-xs text-success mt-1">+5.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
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
              {payments.map((payment) => (
                <TableRow key={payment.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{payment.orderId}</TableCell>
                  <TableCell>{payment.customer}</TableCell>
                  <TableCell className="font-semibold">{payment.amount}</TableCell>
                  <TableCell className="text-muted-foreground">{payment.method}</TableCell>
                  <TableCell className="text-muted-foreground">{payment.date}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[payment.status as keyof typeof statusColors]}>
                      {payment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
