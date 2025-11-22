import { useEffect, useMemo, useState } from "react";
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

// Simple currency formatter (₦ by default)
const formatCurrency = (value: number, currency = "NGN") => {
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(value || 0);
  } catch {
    return `₦${(value || 0).toLocaleString()}`;
  }
};

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || "https://solar-e-commerce-backend-production.up.railway.app/api").replace(/\/$/, "") + "/reports";

// Color palette aligning with CSS vars fallbacks
const PIE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#3b82f6",
  "#22c55e",
  "#ef4444",
];

export default function Analytics() {
  const [period, setPeriod] = useState<string>("30d");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [salesTrend, setSalesTrend] = useState<Array<{
    period: string;
    total_revenue: number;
    order_revenue: number;
    preorder_revenue: number;
    total_transactions?: number;
    orders?: number;
    pre_orders?: number;
  }>>([]);
  const [categoryData, setCategoryData] = useState<Array<{
    name: string;
    value: number;
    percentage?: number;
    orders_count?: number;
    preorders_count?: number;
  }>>([]);
  const [customerInsights, setCustomerInsights] = useState<Array<{ segment: string; customers: number }>>([]);
  const [topProducts, setTopProducts] = useState<Array<{
    id?: string;
    name: string;
    total_revenue: number;
    orders_count?: number;
    preorders_count?: number;
    units?: number;
    type?: string;
  }>>([]);
  const [overview, setOverview] = useState<any | null>(null);
  const [topProductsError, setTopProductsError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      setTopProductsError(null);
      try {
        const qs = (p: Record<string, string | number | boolean | undefined>) =>
          Object.entries(p)
            .filter(([, v]) => v !== undefined && v !== null && v !== "")
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
            .join("&");

        const urls = {
          trend: `${BASE_URL}/sales-trend?${qs({ period })}`,
          categories: `${BASE_URL}/sales-by-category?${qs({ period })}`,
          segments: `${BASE_URL}/customer-segments?${qs({ period })}`,
          // Top products endpoint does not support 'period' per docs; omit it to avoid 500
          products: `${BASE_URL}/top-products?${qs({ limit: 10, sort_by: "revenue" })}`,
          overview: `${BASE_URL}/analytics-overview?${qs({ period })}`,
        } as const;

        const results = await Promise.allSettled(
          Object.entries(urls).map(([key, url]) =>
            fetch(url, { signal: controller.signal }).then(async (r) => {
              if (!r.ok) throw new Error(`${key}: ${r.status} ${r.statusText}`);
              return { key, json: await r.json() } as const;
            })
          )
        );

        if (isCancelled) return;

        let successCount = 0;

        const getJson = (key: string) => {
          const found = results.find(
            (res) => res.status === "fulfilled" && (res as any).value?.key === key
          ) as PromiseFulfilledResult<{ key: string; json: any }> | undefined;
          if (found) {
            successCount++;
            return found.value.json;
          }
          const failed = results.find(
            (res) => res.status === "rejected" && String((res as PromiseRejectedResult).reason || "").startsWith(`${key}:`)
          ) as PromiseRejectedResult | undefined;
          if (failed && key === "products") {
            setTopProductsError(String(failed.reason));
          }
          return null;
        };

        // Sales Trend
        const trendRes: any = getJson("trend");
        if (trendRes) {
          const trend = Array.isArray(trendRes?.data?.sales_trend) ? trendRes.data.sales_trend : [];
          setSalesTrend(
            trend.map((t: any) => ({
              period: t.period ?? t.date ?? t.label ?? "",
              total_revenue: Number(t.total_revenue) || 0,
              order_revenue: Number(t.order_revenue) || 0,
              preorder_revenue: Number(t.preorder_revenue) || 0,
              total_transactions: Number(t.total_transactions) || undefined,
              orders: Number(t.orders) || undefined,
              pre_orders: Number(t.pre_orders) || undefined,
            }))
          );
        } else {
          setSalesTrend([]);
        }

        // Category Data
        const catRes: any = getJson("categories");
        if (catRes) {
          const categories = Array.isArray(catRes?.data?.categories) ? catRes.data.categories : [];
          setCategoryData(
            categories.map((c: any) => ({
              name: c.category_name ?? c.name ?? "Unknown",
              value: Number(c.total_revenue) || 0,
              percentage: typeof c.percentage === "number" ? c.percentage : undefined,
              orders_count: typeof c.orders_count === "number" ? c.orders_count : undefined,
              preorders_count: typeof c.preorders_count === "number" ? c.preorders_count : undefined,
            }))
          );
        } else {
          setCategoryData([]);
        }

        // Customer Segments
        const segRes: any = getJson("segments");
        if (segRes) {
          const segs = segRes?.data?.segments ?? {};
          const mappedSegs: Array<{ segment: string; customers: number }> = [
            { label: "High value", key: "high_value" },
            { label: "Medium value", key: "medium_value" },
            { label: "Low value", key: "low_value" },
            { label: "Frequent", key: "frequent" },
            { label: "Occasional", key: "occasional" },
            { label: "One-time", key: "one_time" },
          ].map(({ label, key }) => ({ segment: label, customers: Number(segs[key]) || 0 }));
          setCustomerInsights(mappedSegs);
        } else {
          setCustomerInsights([]);
        }

        // Top products
        const prodRes: any = getJson("products");
        if (prodRes) {
          const prods = Array.isArray(prodRes?.data?.products) ? prodRes.data.products : [];
          setTopProducts(
            prods.slice(0, 10).map((p: any) => ({
              id: p.id,
              name: p.name ?? p.title ?? "Product",
              total_revenue: Number(p.total_revenue ?? p.revenue) || 0,
              orders_count: typeof p.orders_count === "number" ? p.orders_count : undefined,
              preorders_count: typeof p.preorders_count === "number" ? p.preorders_count : undefined,
              units: typeof p.total_quantity_sold === "number" ? p.total_quantity_sold : p.units ?? p.quantity ?? undefined,
              type: p.type,
            }))
          );
        } else {
          setTopProducts([]);
        }

        // Overview
        const overviewRes: any = getJson("overview");
        setOverview(overviewRes?.data ?? null);

        if (successCount === 0) {
          setError("Failed to load analytics");
        }
      } catch (e: any) {
        if (!isCancelled) setError(e?.message || "Failed to load analytics");
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }

    load();
    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [period]);

  const categoryWithColors = useMemo(
    () =>
      categoryData.map((c, idx) => ({ ...c, color: PIE_COLORS[idx % PIE_COLORS.length] })),
    [categoryData]
  );

  const exportData = async (type: string, fmt: "csv" | "json" = "csv") => {
    try {
      const url = `${BASE_URL}/export?type=${encodeURIComponent(type)}&period=${encodeURIComponent(period)}&format=${fmt}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Export failed: ${res.status}`);
      if (fmt === "csv") {
        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `analytics_${type}_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
      } else {
        const json = await res.json();
        // For quick inspection; replace with your own handling
        // eslint-disable-next-line no-console
        console.log("export json", json);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  return (
    <div className= "space-y-6 animate-fade-in" >
    <div className="flex items-center justify-between gap-4" >
      <div>
      <h1 className="text-3xl font-bold tracking-tight" > Reports & Analytics </h1>
        < p className = "text-muted-foreground mt-1" > Insights and performance metrics </p>
          </div>
          < div className = "flex items-center gap-2" >
            <label htmlFor="period" className = "text-sm text-muted-foreground" > Period </label>
              < select
  id = "period"
  className = "border rounded-md px-2 py-1 text-sm bg-background"
  value = { period }
  onChange = {(e) => setPeriod(e.target.value)
}
          >
  <option value="7d" > Last 7 days </option>
    < option value = "30d" > Last 30 days </option>
      < option value = "90d" > Last 90 days </option>
        < option value = "1y" > Last Year </option>
          </select>
          </div>
          </div>

{/* KPI Cards (Overview) */ }
{
  overview && (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" >
      <Card>
      <CardHeader>
      <CardTitle className="text-base" > Today's Revenue</CardTitle>
        </CardHeader>
        < CardContent >
        <div className="text-2xl font-bold" >
          { formatCurrency(Number(overview?.today?.revenue || 0))
}
</div>
  </CardContent>
  </Card>

  < Card >
  <CardHeader>
  <CardTitle className="text-base" > Today's Orders</CardTitle>
    </CardHeader>
    < CardContent >
    <div className="text-2xl font-bold" >
      { Number(overview?.today?.orders || 0).toLocaleString()}
</div>
  </CardContent>
  </Card>

  < Card >
  <CardHeader>
  <CardTitle className="text-base" > This Week's Revenue</CardTitle>
    </CardHeader>
    < CardContent >
    <div className="text-2xl font-bold" >
      { formatCurrency(Number(overview?.this_week?.revenue || 0))}
</div>
  </CardContent>
  </Card>
  </div>
      )}

{
  error && (
    <Card className="border-destructive" >
      <CardHeader>
      <CardTitle className="text-destructive" > Failed to load </CardTitle>
        </CardHeader>
        < CardContent >
        <p className="text-sm text-muted-foreground" > { error } </p>
          </CardContent>
          </Card>
      )
}

<div className="grid gap-4 md:grid-cols-2" >
  <Card className="col-span-2" >
    <CardHeader>
    <CardTitle>Sales Trend </CardTitle>
      </CardHeader>
      < CardContent >
      <div className="mb-3 flex flex-wrap gap-2" >
        <button
                className="px-3 py-1 text-xs rounded-md bg-primary text-primary-foreground"
onClick = {() => exportData("sales_trend", "csv")}
              >
  Export CSV
    </button>
    </div>
    < ResponsiveContainer width = "100%" height = { 300} >
      <LineChart data={ salesTrend }>
        <CartesianGrid strokeDasharray="3 3" className = "stroke-muted" />
          <XAxis dataKey="period" />
            <YAxis />
            < Tooltip formatter = {(v: any, n: any) => formatCurrency(Number(v))} />
              < Legend />
              <Line type="monotone" dataKey = "total_revenue" stroke = "hsl(var(--chart-1))" strokeWidth = { 3} name = "Total Revenue" />
                <Line type="monotone" dataKey = "order_revenue" stroke = "hsl(var(--chart-2))" strokeWidth = { 2} name = "Order Revenue" />
                  <Line type="monotone" dataKey = "preorder_revenue" stroke = "hsl(var(--chart-3))" strokeWidth = { 2} name = "Pre-order Revenue" />
                    </LineChart>
                    </ResponsiveContainer>
                    </CardContent>
                    </Card>

                    < Card >
                    <CardHeader>
                    <CardTitle>Sales by Category </CardTitle>
                      </CardHeader>
                      < CardContent >
                      <div className="mb-3 flex flex-wrap gap-2" >
                        <button
                className="px-3 py-1 text-xs rounded-md bg-primary text-primary-foreground"
onClick = {() => exportData("category_sales", "csv")}
              >
  Export CSV
    </button>
    </div>
    < ResponsiveContainer width = "100%" height = { 300} >
      <PieChart>
      <Pie
                  data={ categoryWithColors }
cx = "50%"
cy = "50%"
labelLine = { false}
label = {({ name, percentage, value }: any) => `${name} ${percentage != null ? percentage : ((value / (categoryWithColors.reduce((s, c) => s + (c.value || 0), 0) || 1)) * 100).toFixed(0)}% (${formatCurrency(value)})`}
outerRadius = { 100}
fill = "#8884d8"
dataKey = "value"
  >
{
  categoryWithColors.map((entry, index) => (
    <Cell key= {`cell-${index}`} fill = {(entry as any).color} />
                  ))}
</Pie>
  < Tooltip formatter = {(v: any, _n: any, ctx: any) => {
  const payload = ctx?.payload ?? {};
  const orders = payload?.orders_count != null ? payload.orders_count : 0;
  const preorders = payload?.preorders_count != null ? payload.preorders_count : 0;
  return [`${formatCurrency(Number(v))}`, `Orders: ${orders}, Pre-orders: ${preorders}`];
}} />
  </PieChart>
  </ResponsiveContainer>
  </CardContent>
  </Card>

  < Card >
  <CardHeader>
  <CardTitle>Customer Segments </CardTitle>
    </CardHeader>
    < CardContent >
    <ResponsiveContainer width="100%" height = { 300} >
      <BarChart data={ customerInsights }>
        <CartesianGrid strokeDasharray="3 3" className = "stroke-muted" />
          <XAxis dataKey="segment" />
            <YAxis />
            < Tooltip formatter = {(v: any) => [v, "Customers"]} />
              < Bar dataKey = "customers" fill = "hsl(var(--chart-1))" radius = { [4, 4, 0, 0]} />
                </BarChart>
                </ResponsiveContainer>
                </CardContent>
                </Card>
                </div>

                < Card >
                <CardHeader>
                <div className="flex items-center justify-between w-full" >
                  <CardTitle>Top Products </CardTitle>
                    < div className = "flex gap-2" >
                      <button
                className="px-3 py-1 text-xs rounded-md bg-primary text-primary-foreground"
onClick = {() => exportData("top_products", "csv")}
              >
  Export CSV
    </button>
    </div>
    </div>
    </CardHeader>
    <CardContent>
{
  topProductsError && (
    <p className="text-sm text-destructive mb-2" > { topProductsError } </p>
          )
}
{
  loading ? (
    <p className= "text-sm text-muted-foreground" > Loading...</p>
          ) : (
    <div className= "space-y-4" >
    {
      topProducts.map((product, index) => (
        <div key= {`${product.id ?? product.name}-${index}`} className = "flex items-center justify-between p-3 border rounded-lg" >
          <div className="flex-1" >
            <p className="font-medium flex items-center gap-2" >
              <span>{ product.name } </span>
  {
    product.type && (
      <span className={ `text-xs px-2 py-0.5 rounded-full border ${product.type === 'pre-order' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}` }>
        { product.type }
        </span>
                      )
  }
  </p>
    < p className = "text-sm text-muted-foreground" >
      { product.units != null ? `${product.units} units sold` : "" }
  {
    (product.orders_count != null || product.preorders_count != null) && (
      <>
      { product.units != null ? " • " : "" }
                          { `${product.orders_count ?? 0} orders, ${product.preorders_count ?? 0} pre-orders` }
    </>
                      )
  }
  </p>
    </div>
    < div className = "text-right" >
      <p className="font-semibold" > { formatCurrency(product.total_revenue) } </p>
        </div>
        </div>
              ))
}
{
  topProducts.length === 0 && !topProductsError && (
    <p className="text-sm text-muted-foreground" > No product data available.</p>
              )
}
</div>
          )}
</CardContent>
  </Card>

{
  loading && !error && (
    <p className="text-sm text-muted-foreground" > Loading analytics...</p>
      )
}
</div>
  );
}
