import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Edit, Trash2 } from "lucide-react";

const products = [
  { id: 1, name: "Wireless Headphones", category: "Audio", price: "$79.99", stock: 45, status: "Active", sales: 1234 },
  { id: 2, name: "Smart Watch Pro", category: "Wearables", price: "$299.99", stock: 23, status: "Active", sales: 987 },
  { id: 3, name: "Gaming Mouse", category: "Gaming", price: "$49.99", stock: 12, status: "Low Stock", sales: 756 },
  { id: 4, name: "Mechanical Keyboard", category: "Computing", price: "$129.99", stock: 8, status: "Low Stock", sales: 543 },
  { id: 5, name: "USB-C Hub", category: "Accessories", price: "$34.99", stock: 67, status: "Active", sales: 432 },
  { id: 6, name: "Laptop Stand", category: "Accessories", price: "$45.00", stock: 89, status: "Active", sales: 321 },
  { id: 7, name: "Wireless Charger", category: "Accessories", price: "$29.99", stock: 0, status: "Out of Stock", sales: 298 },
  { id: 8, name: "4K Webcam", category: "Computing", price: "$149.99", stock: 34, status: "Active", sales: 267 },
];

const statusColors = {
  Active: "bg-success text-success-foreground",
  "Low Stock": "bg-warning text-warning-foreground",
  "Out of Stock": "bg-destructive text-destructive-foreground",
};

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products Management</h1>
          <p className="text-muted-foreground mt-1">Manage your product catalog</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Sales</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="text-muted-foreground">{product.category}</TableCell>
                  <TableCell className="font-semibold">{product.price}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell className="text-muted-foreground">{product.sales}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[product.status as keyof typeof statusColors]}>
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
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
