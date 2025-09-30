import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Package, TrendingUp } from "lucide-react";
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
} from "recharts";

const revenueData = [
  { name: "Jan", revenue: 4000, orders: 240 },
  { name: "Feb", revenue: 3000, orders: 198 },
  { name: "Mar", revenue: 5000, orders: 310 },
  { name: "Apr", revenue: 7800, orders: 408 },
  { name: "May", revenue: 5900, orders: 380 },
  { name: "Jun", revenue: 8900, orders: 520 },
  { name: "Jul", revenue: 9500, orders: 580 },
];

const topProducts = [
  { name: "Wireless Headphones", sales: 1234, revenue: "$49,360", stock: 45 },
  { name: "Smart Watch Pro", sales: 987, revenue: "$39,480", stock: 23 },
  { name: "Gaming Mouse", sales: 756, revenue: "$22,680", stock: 12 },
  { name: "Mechanical Keyboard", sales: 543, revenue: "$54,300", stock: 8 },
  { name: "USB-C Hub", sales: 432, revenue: "$12,960", stock: 67 },
];

const recentOrders = [
  { id: "#ORD-2024-001", customer: "John Doe", product: "Wireless Headphones", amount: "$120.00", status: "Delivered" },
  { id: "#ORD-2024-002", customer: "Jane Smith", product: "Smart Watch Pro", amount: "$89.99", status: "Processing" },
  { id: "#ORD-2024-003", customer: "Mike Johnson", product: "Gaming Mouse", amount: "$45.50", status: "Shipped" },
  { id: "#ORD-2024-004", customer: "Sarah Williams", product: "Mechanical Keyboard", amount: "$159.99", status: "Pending" },
  { id: "#ORD-2024-005", customer: "Tom Brown", product: "USB-C Hub", amount: "$34.99", status: "Delivered" },
];

const statusColors = {
  Delivered: "bg-success text-success-foreground",
  Processing: "bg-primary text-primary-foreground",
  Shipped: "bg-accent text-accent-foreground",
  Pending: "bg-warning text-warning-foreground",
};

export default function Dashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening with your store.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value="$45,231"
          change="+20.1% from last month"
          changeType="positive"
          icon={DollarSign}
        />
        <StatCard
          title="Orders"
          value="2,345"
          change="+12.5% from last month"
          changeType="positive"
          icon={ShoppingCart}
        />
        <StatCard
          title="Products Sold"
          value="12,234"
          change="+8.2% from last month"
          changeType="positive"
          icon={Package}
        />
        <StatCard
          title="Conversion Rate"
          value="3.24%"
          change="-0.4% from last month"
          changeType="negative"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  name="Revenue ($)"
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={2}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.slice(0, 5).map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{product.revenue}</p>
                    <p className={`text-xs ${product.stock < 20 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      Stock: {product.stock}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>{order.product}</TableCell>
                  <TableCell>{order.amount}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={[
                { category: "Electronics", sales: 4800 },
                { category: "Accessories", sales: 3200 },
                { category: "Gaming", sales: 2800 },
                { category: "Audio", sales: 2400 },
                { category: "Computing", sales: 1900 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="category" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="sales" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.filter(p => p.stock < 20).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-destructive/20 rounded-lg bg-destructive/5">
                  <div>
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-xs text-muted-foreground">Only {product.stock} units left</p>
                  </div>
                  <Badge variant="destructive">Low Stock</Badge>
                </div>
              ))}
              {topProducts.filter(p => p.stock < 20).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">All products are well stocked</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
