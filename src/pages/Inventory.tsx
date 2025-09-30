import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Package } from "lucide-react";

const inventory = [
  { id: 1, name: "Wireless Headphones", sku: "WH-001", stock: 45, max: 100, reorder: 20, location: "Warehouse A" },
  { id: 2, name: "Smart Watch Pro", sku: "SW-002", stock: 23, max: 50, reorder: 15, location: "Warehouse A" },
  { id: 3, name: "Gaming Mouse", sku: "GM-003", stock: 12, max: 80, reorder: 25, location: "Warehouse B" },
  { id: 4, name: "Mechanical Keyboard", sku: "MK-004", stock: 8, max: 60, reorder: 20, location: "Warehouse B" },
  { id: 5, name: "USB-C Hub", sku: "UH-005", stock: 67, max: 100, reorder: 30, location: "Warehouse A" },
  { id: 6, name: "Laptop Stand", sku: "LS-006", stock: 89, max: 100, reorder: 25, location: "Warehouse C" },
  { id: 7, name: "Wireless Charger", sku: "WC-007", stock: 0, max: 75, reorder: 20, location: "Warehouse C" },
  { id: 8, name: "4K Webcam", sku: "WB-008", stock: 34, max: 50, reorder: 15, location: "Warehouse A" },
];

export default function Inventory() {
  const lowStockItems = inventory.filter(item => item.stock <= item.reorder);
  const outOfStockItems = inventory.filter(item => item.stock === 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground mt-1">Monitor stock levels and warehouse locations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
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
            <div className="text-2xl font-bold text-warning">{lowStockItems.length}</div>
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
            <div className="text-2xl font-bold text-destructive">{outOfStockItems.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stock Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {inventory.map((item) => {
              const stockPercentage = (item.stock / item.max) * 100;
              const isLowStock = item.stock <= item.reorder;
              const isOutOfStock = item.stock === 0;

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
                        SKU: {item.sku} • Location: {item.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{item.stock} / {item.max}</p>
                      <p className="text-xs text-muted-foreground">Reorder at: {item.reorder}</p>
                    </div>
                  </div>
                  <Progress 
                    value={stockPercentage} 
                    className={isOutOfStock ? "[&>div]:bg-destructive" : isLowStock ? "[&>div]:bg-warning" : "[&>div]:bg-success"}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
