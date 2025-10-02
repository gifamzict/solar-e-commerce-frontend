import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, Truck, MapPin, Phone, Mail, Calendar } from "lucide-react";

const orderData = {
  "#ORD-2024-001": {
    id: "#ORD-2024-001",
    customer: { name: "John Doe", email: "john@example.com", phone: "+234 801 234 5678" },
    date: "2024-01-15",
    status: "Delivered",
    shippingAddress: "123 Lagos Street, Victoria Island, Lagos State, Nigeria",
    items: [
      { name: "300W Solar Panel", quantity: 4, price: 450000, image: "/placeholder.svg" },
      { name: "Solar Battery 200Ah", quantity: 2, price: 280000, image: "/placeholder.svg" },
    ],
    subtotal: 2360000,
    shipping: 25000,
    total: 2385000,
    paymentMethod: "Paystack - Card",
    trackingNumber: "TRK-2024-001-NG",
  },
  "#ORD-2024-002": {
    id: "#ORD-2024-002",
    customer: { name: "Jane Smith", email: "jane@example.com", phone: "+234 802 345 6789" },
    date: "2024-01-14",
    status: "Processing",
    shippingAddress: "45 Abuja Avenue, Garki, FCT, Nigeria",
    items: [
      { name: "Solar Street Light 100W", quantity: 10, price: 125000, image: "/placeholder.svg" },
    ],
    subtotal: 1250000,
    shipping: 50000,
    total: 1300000,
    paymentMethod: "Paystack - Bank Transfer",
    trackingNumber: "TRK-2024-002-NG",
  },
};

const statusColors = {
  Delivered: "bg-success text-success-foreground",
  Processing: "bg-primary text-primary-foreground",
  Shipped: "bg-accent text-accent-foreground",
  Pending: "bg-warning text-warning-foreground",
  Cancelled: "bg-destructive text-destructive-foreground",
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const order = orderData[id as keyof typeof orderData];

  if (!order) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Button variant="ghost" onClick={() => navigate("/management-portal/orders")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Order not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/management-portal/orders")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
            <p className="text-muted-foreground mt-1">{order.id}</p>
          </div>
        </div>
        <Badge className={statusColors[order.status as keyof typeof statusColors]}>
          {order.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Order Items */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-4 py-4 border-b last:border-0">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-accent/10 rounded-md flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-md" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₦{(item.price * item.quantity).toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">₦{item.price.toLocaleString()} each</p>
                </div>
              </div>
            ))}
            
            <Separator />
            
            <div className="space-y-2 pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₦{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">₦{order.shipping.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-primary">₦{order.total.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium">{order.customer.name}</p>
                  <p className="text-sm text-muted-foreground">{order.customer.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm">{order.customer.phone}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <p className="text-sm">{order.shippingAddress}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Order Date</p>
                  <p className="text-sm font-medium">{order.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Tracking Number</p>
                  <p className="text-sm font-medium">{order.trackingNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Payment Method</p>
                  <p className="text-sm font-medium">{order.paymentMethod}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
