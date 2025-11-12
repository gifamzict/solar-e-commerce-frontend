import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Package, User, Truck, MapPin, CreditCard, XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://web-production-d1120.up.railway.app/api').replace(/\/$/, "");

interface OrderItem {
  id: number;
  product_name: string;
  quantity: number;
  product_price: number;
  total_price: number;
  product: {
    images: string[];
  };
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  date: string;
  formatted_date: string;
  items_count: number;
  total_amount: number;
  formatted_total: string;
  status: string;
  payment_status: string;
  fulfillment_method: string;
  shipping_address: string;
  city: string;
  state: string;
  pickup_location: string;
  order_items: OrderItem[];
}

const fetchOrder = async (orderId: string): Promise<Order> => {
  try {
    const response = await axios.get<{ order: Order }>(`${API_BASE_URL}/orders/${orderId}`);
    return response.data.order;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      toast.error(error.response.data.message || "Failed to fetch order details.");
    } else {
      toast.error("Network error or failed to connect.");
    }
    throw new Error("Failed to fetch order details");
  }
};

const updateOrderStatus = async ({ orderId, status }: { orderId: string; status: string }) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || "Failed to update status.");
    }
    throw new Error("Network error or failed to connect.");
  }
};

const cancelOrder = async (orderId: string) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/orders/${orderId}/cancel`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || "Failed to cancel order.");
    }
    throw new Error("Network error or failed to connect.");
  }
};

const statusColors: { [key: string]: string } = {
  delivered: "bg-success text-success-foreground",
  processing: "bg-primary text-primary-foreground",
  shipped: "bg-accent text-accent-foreground",
  pending: "bg-warning text-warning-foreground",
  cancelled: "bg-destructive text-destructive-foreground",
  paid: "bg-blue-500 text-white",
};

const paymentStatusColors: { [key: string]: string } = {
  paid: "bg-success text-success-foreground",
  pending: "bg-warning text-warning-foreground",
  failed: "bg-destructive text-destructive-foreground",
};

const getNextStatuses = (currentStatus: string): string[] => {
  const transitions: { [key: string]: string[] } = {
    pending: ['paid', 'cancelled'],
    paid: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
  };
  return transitions[currentStatus] || [];
};

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  if (!orderId) {
    navigate("/management-portal/orders");
    return null;
  }

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrder(orderId),
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      toast.success("Order status updated successfully!");
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update status.");
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      toast.success("Order cancelled successfully!");
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to cancel order.");
    },
  });

  const handleStatusChange = (newStatus: string) => {
    if (order && newStatus !== order.status) {
      updateStatusMutation.mutate({ orderId, status: newStatus });
    }
  };

  const handleCancelOrder = () => {
    cancelOrderMutation.mutate(orderId);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64" > Loading order details...</div>;
  }

  if (error || !order) {
    return (
      <div className= "text-center text-red-500" >
      <p>Error loading order details.</p>
        < Button onClick = {() => navigate(-1)
  } variant = "link" > Go back </Button>
    </div>
    );
}

const nextStatuses = getNextStatuses(order.status);

return (
  <div className= "space-y-6 animate-fade-in" >
  <div className="flex items-center gap-4" >
    <Button variant="outline" size = "icon" onClick = {() => navigate(-1)}>
      <ArrowLeft className="h-4 w-4" />
        </Button>
        < div >
        <h1 className="text-2xl font-bold tracking-tight" > Order #{ order.order_number } </h1>
          < p className = "text-muted-foreground" > { order.formatted_date } </p>
            </div>
            </div>

            < div className = "grid md:grid-cols-3 gap-6" >
              <div className="md:col-span-2 space-y-6" >
                <Card>
                <CardHeader>
                <CardTitle className="flex items-center gap-2" >
                  <Package className="h-5 w-5" />
                    Order Items({ order.items_count })
                      </CardTitle>
                      </CardHeader>
                      < CardContent >
                      <div className="space-y-4" >
                      {
                        order.order_items.map(item => (
                          <div key= { item.id } className = "flex items-center gap-4" >
                          <img
                      src={ item.product.images[0] ? `${(import.meta.env.VITE_API_BASE_URL || '').replace('/api', '')}/storage/${item.product.images[0]}` : '/placeholder.svg' }
                      alt = { item.product_name }
                      className = "w-16 h-16 rounded-md object-cover"
                          />
                          <div className="flex-1" >
                        <p className="font-medium" > { item.product_name } </p>
                        < p className = "text-sm text-muted-foreground" >
                        { item.quantity } x ₦{ item.product_price.toLocaleString() }
                        </p>
                        </div>
                        < p className = "font-semibold" >₦{ item.total_price.toLocaleString() } </p>
                        </div>
                        ))
                      }
                        </div>
                        < div className = "mt-6 pt-4 border-t" >
                          <div className="flex justify-end font-bold text-lg" >
                            <span>Total: </span>
                              < span className = "ml-4" > { order.formatted_total } </span>
                                </div>
                                </div>
                                </CardContent>
                                </Card>
                                </div>

                                < div className = "space-y-6" >
                                  <Card>
                                  <CardHeader>
                                  <CardTitle className="flex items-center gap-2" >
                                    <User className="h-5 w-5" />
                                      Customer Details
                                        </CardTitle>
                                        </CardHeader>
                                        < CardContent className = "space-y-2 text-sm" >
                                          <p className="font-medium" > { order.customer_name } </p>
                                            < p className = "text-muted-foreground" > { order.customer_email } </p>
                                              < p className = "text-muted-foreground" > { order.customer_phone } </p>
                                                </CardContent>
                                                </Card>

                                                < Card >
                                                <CardHeader>
                                                <CardTitle className="flex items-center gap-2" >
                                                  { order.fulfillment_method === 'delivery' ? <Truck className="h-5 w-5" /> : <MapPin className="h-5 w-5" / >}
Fulfillment
  </CardTitle>
  </CardHeader>
  < CardContent className = "space-y-2 text-sm" >
    <p>
    <strong>Method: </strong>{" "}
      < span className = "capitalize" > { order.fulfillment_method } </span>
        </p>
{
  order.fulfillment_method === 'delivery' ? (
    <p>
    <strong>Address: </strong> {order.shipping_address}, {order.city}, {order.state}
  </p>
              ) : (
    <p>
    <strong>Pickup Location: </strong> {order.pickup_location}
      </p>
              )
}
</CardContent>
  </Card>

  < Card >
  <CardHeader>
  <CardTitle className="flex items-center gap-2" >
    <CreditCard className="h-5 w-5" />
      Status & Actions
      </CardTitle>
      </CardHeader>
      < CardContent className = "space-y-4" >
        <div className="flex items-center justify-between" >
          <span className="text-sm font-medium" > Order Status: </span>
            < Badge className = { statusColors[order.status]} >
              { order.status.charAt(0).toUpperCase() + order.status.slice(1) }
              </Badge>
              </div>
              < div className = "flex items-center justify-between" >
                <span className="text-sm font-medium" > Payment Status: </span>
                  < Badge className = { paymentStatusColors[order.payment_status]} >
                    { order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1) }
                    </Badge>
                    </div>

{
  nextStatuses.length > 0 && (
    <div>
    <label className="text-sm font-medium mb-2 block" > Update Status </label>
      < Select onValueChange = { handleStatusChange } defaultValue = { order.status } >
        <SelectTrigger>
        <SelectValue placeholder="Change status..." />
          </SelectTrigger>
          < SelectContent >
          <SelectItem value={ order.status } disabled >
            { order.status.charAt(0).toUpperCase() + order.status.slice(1) }
            </SelectItem>
  {
    nextStatuses.map(status => (
      <SelectItem key= { status } value = { status } >
      { status.charAt(0).toUpperCase() + status.slice(1) }
      </SelectItem>
    ))
  }
  </SelectContent>
    </Select>
    </div>
                )
}

{
  order.status !== 'cancelled' && order.status !== 'delivered' && (
    <AlertDialog>
    <AlertDialogTrigger asChild >
    <Button variant="destructive" className = "w-full gap-2" >
      <XCircle className="h-4 w-4" />
        Cancel Order
          </Button>
          </AlertDialogTrigger>
          < AlertDialogContent >
          <AlertDialogHeader>
          <AlertDialogTitle>Are you sure you want to cancel this order ? </AlertDialogTitle>
            <AlertDialogDescription>
                                This action cannot be undone.If the order is already paid, you may need to process a refund manually.
                            </AlertDialogDescription>
    </AlertDialogHeader>
    < AlertDialogFooter >
    <AlertDialogCancel>Back </AlertDialogCancel>
    < AlertDialogAction onClick = { handleCancelOrder } className = "bg-destructive text-destructive-foreground hover:bg-destructive/90" >
      Yes, Cancel Order
        </AlertDialogAction>
        </AlertDialogFooter>
        </AlertDialogContent>
        </AlertDialog>
                )
}
</CardContent>
  </Card>
  </div>
  </div>
  </div>
  );
}
