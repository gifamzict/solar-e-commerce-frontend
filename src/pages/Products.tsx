import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Edit, Trash2, Upload } from "lucide-react";

const products = [
  { id: 1, name: "300W Monocrystalline Solar Panel", category: "Solar Panels", price: "₦450,000", stock: 45, status: "Active", sales: 234 },
  { id: 2, name: "Solar Battery 200Ah", category: "Solar Batteries", price: "₦280,000", stock: 23, status: "Active", sales: 187 },
  { id: 3, name: "Solar Street Light 100W", category: "Street Lights", price: "₦125,000", stock: 12, status: "Low Stock", sales: 156 },
  { id: 4, name: "5KVA Solar Inverter", category: "Solar Inverters", price: "₦650,000", stock: 8, status: "Low Stock", sales: 143 },
  { id: 5, name: "Solar Charge Controller 60A", category: "Accessories", price: "₦85,000", stock: 67, status: "Active", sales: 132 },
  { id: 6, name: "Portable Solar Charger", category: "Gadgets", price: "₦45,000", stock: 89, status: "Active", sales: 121 },
  { id: 7, name: "Solar Water Pump", category: "Solar Pumps", price: "₦320,000", stock: 0, status: "Out of Stock", sales: 98 },
  { id: 8, name: "Solar Security Light", category: "Security", price: "₦75,000", stock: 34, status: "Active", sales: 87 },
];

const statusColors = {
  Active: "bg-success text-success-foreground",
  "Low Stock": "bg-warning text-warning-foreground",
  "Out of Stock": "bg-destructive text-destructive-foreground",
};

export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products Management</h1>
          <p className="text-muted-foreground mt-1">Manage your solar product catalog</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Solar Product</DialogTitle>
              <DialogDescription>
                Fill in the product details to add it to your catalog
              </DialogDescription>
            </DialogHeader>
            <form className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input id="name" placeholder="e.g., 300W Solar Panel" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="panels">Solar Panels</SelectItem>
                      <SelectItem value="batteries">Solar Batteries</SelectItem>
                      <SelectItem value="inverters">Solar Inverters</SelectItem>
                      <SelectItem value="lights">Street Lights</SelectItem>
                      <SelectItem value="gadgets">Gadgets</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₦) *</Label>
                  <Input id="price" type="number" placeholder="450000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity *</Label>
                  <Input id="stock" type="number" placeholder="50" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea 
                  id="description" 
                  placeholder="Detailed product description..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="power">Power Output</Label>
                  <Input id="power" placeholder="e.g., 300W" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="warranty">Warranty Period</Label>
                  <Input id="warranty" placeholder="e.g., 10 years" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specs">Specifications</Label>
                <Textarea 
                  id="specs" 
                  placeholder="Key specifications (one per line)"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="images">Product Images</Label>
                <div className="border-2 border-dashed rounded-md p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG up to 5MB (Max 5 images)
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Add Product
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
