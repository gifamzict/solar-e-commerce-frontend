import { useParams, Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Added CardDescription
import { Separator } from "@/components/ui/separator"; // Added Separator
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Package, User, Truck, MapPin, ArrowLeft, Calendar, DollarSign, Clock } from "lucide-react"; // Added Calendar, DollarSign, Clock
import { getOrderByNumber, Order } from "@/services/order";

// Define an interface for status colors with a tailwind-friendly approach
const statusColors: { [key: string]: { bg: string, text: string } } = {
    delivered: { bg: "bg-green-100 dark:bg-green-900", text: "text-green-800 dark:text-green-200" },
    processing: { bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-800 dark:text-blue-200" },
    shipped: { bg: "bg-indigo-100 dark:bg-indigo-900", text: "text-indigo-800 dark:text-indigo-200" },
    pending: { bg: "bg-yellow-100 dark:bg-yellow-900", text: "text-yellow-800 dark:text-yellow-200" },
    cancelled: { bg: "bg-red-100 dark:bg-red-900", text: "text-red-800 dark:text-red-200" },
    paid: { bg: "bg-purple-100 dark:bg-purple-900", text: "text-purple-800 dark:text-purple-200" },
};

const OrderNotFound = () => (
    <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-xl shadow-lg m-4">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Order Not Found 😔</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm mx-auto">It seems we couldn't locate the order associated with that number. Please verify it and try again.</p>
      <Button asChild className="bg-primary hover:bg-primary/90">
        <Link to="/">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back to Store
        </Link>
      </Button>
    </div>
);

// Helper to format date (assuming a basic date string is available or can be constructed)
// NOTE: You'll need to pass an actual date field from your `Order` object for this to work.
const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateString; // Fallback
    }
};

export default function OrderConfirmation() {
  const { orderNumber } = useParams<{ orderNumber: string }>();

  // Normalize and detect pre-order numbers
  const normalized = (orderNumber || '').trim();
  const isPreOrderNumber = normalized.toUpperCase().startsWith('PRE-');

  // If it's a pre-order ID, redirect to the pre-order confirmation route
  if (isPreOrderNumber) {
    return <Navigate to={`/pre-orders/confirmation/${encodeURIComponent(normalized)}`} replace />;
  }

  // Fetching logic remains the same
  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ['order', orderNumber],
    queryFn: () => getOrderByNumber(orderNumber!),
    enabled: !!orderNumber && !isPreOrderNumber,
  });

  if (isLoading) {
    // Improved loading state with a spinner-like effect
    return (
        <div className="flex justify-center items-center py-20 min-h-screen">
            <div className="w-12 h-12 border-4 border-t-4 border-t-primary border-gray-200 rounded-full animate-spin mr-3"></div>
            <p className="text-lg text-gray-600 dark:text-gray-400">Loading order details...</p>
        </div>
    );
  }

  if (error || !order) {
    return <OrderNotFound />;
  }

  // Determine status style
  const statusStyle = statusColors[order.status.toLowerCase()] || { bg: "bg-gray-200 dark:bg-gray-700", text: "text-gray-800 dark:text-gray-200" };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        
        {/* Header - More prominent confirmation */}
        <Card className="shadow-2xl border-primary/20 mb-8 p-6 md:p-8">
            <div className="text-center">
                <CheckCircle className="h-14 w-14 text-green-500 mx-auto mb-4 animate-bounce-in" />
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
                    Order Confirmed! 🎉
                </h1>
                <p className="mt-2 text-xl text-gray-600 dark:text-gray-400">
                    Thank you, {order.customer_name}. Your order has been placed successfully.
                </p>
                
                <Separator className="my-4" />

                <div className="flex justify-center items-center gap-6 flex-wrap">
                    <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                        <DollarSign className="h-4 w-4 mr-1.5 text-blue-500" />
                        <span className="font-semibold">Total:</span> <span className="ml-1">{order.formatted_total}</span>
                    </div>
                    <div className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                        <Calendar className="h-4 w-4 mr-1.5 text-blue-500" />
                        <span className="font-semibold">Date:</span> <span className="ml-1">{/* Replace with your actual date field */}N/A</span> 
                    </div>
                    <Badge className={`${statusStyle.bg} ${statusStyle.text} text-sm font-semibold px-3 py-1`}>
                        <Clock className="h-3 w-3 mr-1" />
                        Status: {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                </div>
                
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    Order Number: <span className="font-mono font-bold text-lg text-primary">{order.order_number}</span>
                </p>
            </div>
        </Card>

        {/* Main Content: Split into two columns for better flow */}
        <div className="grid lg:grid-cols-3 gap-6">
            
            {/* Column 1: Order Summary (Takes 2/3 space on large screens) */}
            <div className="lg:col-span-2 space-y-6">
                <Card className="h-full">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <Package className="h-5 w-5 text-primary" />
                            Items Ordered
                        </CardTitle>
                        <CardDescription>A list of all products included in this order.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2"> {/* Added max-height for long lists */}
                            {order.order_items.map(item => (
                                <div key={item.id} className="flex items-center gap-4 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                    <img
                                        src={item.product.images && item.product.images.length > 0 ? `${(import.meta.env.VITE_API_BASE_URL || '').replace('/api', '')}/storage/${item.product.images[0]}`: '/placeholder.svg'}
                                        alt={item.product_name}
                                        className="w-14 h-14 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900 dark:text-white truncate">{item.product_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Qty: {item.quantity} &times; ₦{item.product_price.toLocaleString()}
                                        </p>
                                    </div>
                                    <p className="font-bold text-base text-right">₦{item.total_price.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                        
                        <Separator className="mt-6" />

                    
                    </CardContent>
                </Card>
            </div>

            {/* Column 2: Details (Customer, Fulfillment) (Takes 1/3 space on large screens) */}
            <div className="lg:col-span-1 space-y-6">
                
                {/* Customer Details Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            <User className="h-5 w-5 text-primary" />
                            Customer
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <p className="font-semibold">{order.customer_name}</p>
                        <p className="text-muted-foreground">{order.customer_email}</p>
                        <p className="text-muted-foreground">{order.customer_phone}</p>
                    </CardContent>
                </Card>

                {/* Fulfillment Card */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-xl">
                            {order.fulfillment_method === 'delivery' ? <Truck className="h-5 w-5 text-primary" /> : <MapPin className="h-5 w-5 text-primary" />}
                            Fulfillment
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <p>
                            <strong className="text-gray-700 dark:text-gray-300">Method:</strong>{" "}
                            <span className="capitalize font-medium">{order.fulfillment_method}</span>
                        </p>
                        <Separator />
                        {order.fulfillment_method === 'delivery' ? (
                            <p className="whitespace-pre-wrap">
                                <strong className="text-gray-700 dark:text-gray-300">Shipping Address:</strong> <br/>
                                {order.shipping_address}
                            </p>
                        ) : (
                            <p className="whitespace-pre-wrap">
                                <strong className="text-gray-700 dark:text-gray-300">Pickup Location:</strong> <br/>
                                {order.pickup_location}
                            </p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>

        {/* Footer Action Button */}
        <div className="text-center mt-12">
            <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow bg-primary text-white hover:bg-primary/90">
                <Link to="/">
                    <ArrowLeft className="h-5 w-5 mr-2" /> Continue Shopping
                </Link>
            </Button>
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">Need help? Contact support with your order number.</p>
        </div>

      </div>
    </div>
  );
}