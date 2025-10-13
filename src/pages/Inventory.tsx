import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { getInventoryOverview, getStockLevels, type InventoryItem, type InventoryOverview } from "@/services/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { updateProductStock } from "@/services/inventory";

export default function Inventory() {
  const [overview, setOverview] = useState<InventoryOverview | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<'all' | 'in_stock' | 'low' | 'out'>('all');
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<InventoryItem | null>(null);
  const [adjType, setAdjType] = useState<'set' | 'add' | 'subtract'>('set');
  const [adjQty, setAdjQty] = useState<number>(0);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [ov, list] = await Promise.all([
        getInventoryOverview(),
        getStockLevels({ per_page: 50, status: status === 'all' ? undefined : status, search: search || undefined }),
      ]);
      setOverview(ov);
      setItems(list?.stock_levels ?? []);
    } catch (_) {
      setError("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [ov, list] = await Promise.all([
          getInventoryOverview(),
          getStockLevels({ per_page: 50 }),
        ]);
        if (!mounted) return;
        setOverview(ov);
        setItems(list?.stock_levels ?? []);
      } catch (e) {
        if (!mounted) return;
        setError("Failed to load inventory data");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const openUpdateDialog = (item: InventoryItem) => {
    setActiveItem(item);
    setAdjType('set');
    setAdjQty(item.stock ?? 0);
    setReason("");
    setDialogOpen(true);
  };

  const submitUpdate = async () => {
    if (!activeItem) return;
    try {
      setSubmitting(true);
      await updateProductStock(activeItem.id, { stock: Number(adjQty) || 0, adjustment_type: adjType, reason: reason || undefined });
      toast({ title: "Stock updated", description: `${activeItem.name} updated successfully` });
      setDialogOpen(false);
      await loadData();
    } catch (e: any) {
      toast({ title: "Update failed", description: e?.message || "Unable to update stock", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const totalItems = overview?.total_items ?? items.length;
  const lowStockCount = overview?.low_stock ?? items.filter(i => i.stock_status === 'Low Stock' || i.stock_status === 'Critical' || i.stock <= (i.reorder_point ?? 0)).length;
  const outOfStockCount = overview?.out_of_stock ?? items.filter(i => i.stock <= 0 || i.stock_status === 'Out of Stock').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground mt-1">Monitor stock levels and warehouse locations</p>
      </div>

      {error && (
        <div className="text-sm text-destructive">{error}</div>
      )}

      <form onSubmit={onSearch} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Select value={status} onValueChange={(v) => setStatus(v as any)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="out">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" onClick={() => { setStatus('all'); setSearch(""); loadData(); }}>Reset</Button>
        </div>
        <div className="flex items-center gap-2">
          <Input placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
          <Button type="submit">Search</Button>
          <Button type="button" variant="ghost" onClick={loadData} disabled={loading}>Refresh</Button>
        </div>
      </form>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '—' : totalItems}</div>
          </CardContent>
        </Card>
        <Card className="border-warning">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-warning" />
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{loading ? '—' : lowStockCount}</div>
          </CardContent>
        </Card>
        <Card className="border-destructive">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-destructive" />
              Out of Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{loading ? '—' : outOfStockCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {items.map((item) => {
              const stockPercentage = item.stock_level ?? 0;
              const isOutOfStock = item.stock_status === 'Out of Stock' || item.stock === 0;
              const isLowStock = !isOutOfStock && (item.stock_status === 'Low Stock' || item.stock_status === 'Critical');

              return (
                <div key={item.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{item.name}</p>
                        {isOutOfStock && (
                          <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                        )}
                        {isLowStock && !isOutOfStock && (
                          <Badge className="bg-warning text-warning-foreground text-xs">Low Stock</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        SKU: {item.sku} • Location: {item.warehouse_location ?? '—'}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="text-sm font-semibold">{item.stock}</p>
                        {typeof item.reorder_point === 'number' && (
                          <p className="text-xs text-muted-foreground">Reorder at: {item.reorder_point}</p>
                        )}
                      </div>
                      <Dialog open={dialogOpen && activeItem?.id === item.id} onOpenChange={(o) => { if (!o) setDialogOpen(false); }}>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => openUpdateDialog(item)}>Update Stock</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Update Stock - {activeItem?.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-3 pt-2">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                              <div className="md:col-span-1 text-sm text-muted-foreground">Adjustment</div>
                              <div className="md:col-span-2">
                                <Select value={adjType} onValueChange={(v) => setAdjType(v as any)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="set">Set</SelectItem>
                                    <SelectItem value="add">Add</SelectItem>
                                    <SelectItem value="subtract">Subtract</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                              <div className="md:col-span-1 text-sm text-muted-foreground">Quantity</div>
                              <div className="md:col-span-2">
                                <Input type="number" min={0} value={adjQty} onChange={(e) => setAdjQty(parseInt(e.target.value || '0', 10))} />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                              <div className="md:col-span-1 text-sm text-muted-foreground">Reason (optional)</div>
                              <div className="md:col-span-2">
                                <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. New shipment received" />
                              </div>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="ghost" type="button" onClick={() => setDialogOpen(false)}>Cancel</Button>
                            <Button type="button" onClick={submitUpdate} disabled={submitting}>
                              {submitting ? 'Updating...' : 'Update'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                  <Progress 
                    value={stockPercentage} 
                    className={isOutOfStock ? "[&>div]:bg-destructive" : isLowStock ? "[&>div]:bg-warning" : "[&>div]:bg-success"}
                  />
                </div>
              );
            })}
            {(!loading && items.length === 0) && (
              <p className="text-sm text-muted-foreground">No inventory items found.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
