import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const salesTrend = [
  { month: "Jan", sales: 4000, revenue: 24000, orders: 240 },
  { month: "Feb", sales: 3000, revenue: 18000, orders: 198 },
  { month: "Mar", sales: 5000, revenue: 30000, orders: 310 },
  { month: "Apr", sales: 7800, revenue: 46800, orders: 408 },
  { month: "May", sales: 5900, revenue: 35400, orders: 380 },
  { month: "Jun", sales: 8900, revenue: 53400, orders: 520 },
];

const categoryData = [
  { name: "Electronics", value: 4800, color: "hsl(var(--chart-1))" },
  { name: "Accessories", value: 3200, color: "hsl(var(--chart-2))" },
  { name: "Gaming", value: 2800, color: "hsl(var(--chart-3))" },
  { name: "Audio", value: 2400, color: "hsl(var(--chart-4))" },
  { name: "Computing", value: 1900, color: "hsl(var(--chart-5))" },
];

const customerInsights = [
  { segment: "New", customers: 145, percentage: 23 },
  { segment: "Returning", customers: 412, percentage: 65 },
  { segment: "VIP", customers: 78, percentage: 12 },
];

export default function Analytics() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-1">Insights and performance metrics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Revenue ($)" />
                <Line type="monotone" dataKey="orders" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={customerInsights}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="segment" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="customers" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Wireless Headphones", sales: 1234, revenue: "$49,360", growth: "+23%" },
              { name: "Smart Watch Pro", sales: 987, revenue: "$39,480", growth: "+18%" },
              { name: "Gaming Mouse", sales: 756, revenue: "$22,680", growth: "+12%" },
              { name: "Mechanical Keyboard", sales: 543, revenue: "$54,300", growth: "+8%" },
            ].map((product, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">{product.sales} units sold</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{product.revenue}</p>
                  <p className="text-sm text-success">{product.growth}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
