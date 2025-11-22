import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, Package, CheckCircle, Clock, XCircle, FileText, MapPin, User, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { ensureNairaSymbol } from "@/lib/utils";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://solar-e-commerce-backend-production.up.railway.app/api') + '/';

// --- Type Definitions ---
interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    price: string;
    total: string;
    image_url: string;
}

interface Address {
    street: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
}

interface OrderTracking {
    status: string;
    date: string;
    description: string;
}

interface OrderDetails {
    id: number;
    order_number: string;
    date: string;
    status: string;
    formatted_total: string;
    subtotal: string;
    shipping_cost: string;
    tax: string;
    payment_method: string;
    payment_status: string;
    shipping_address: Address;
    billing_address: Address;
    items: OrderItem[];
    tracking_history: OrderTracking[];
}

// --- API Function ---
const fetchOrderDetails = async (orderNumber: string): Promise<OrderDetails> => {
    const token = localStorage.getItem("store_token");
    if (!token) throw new Error("Not authenticated");
    const response = await axios.get(`${API_BASE_URL}user/orders/${orderNumber}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.order;
};

// --- Helper Components ---
const StatusIcon = ({ status }: { status: string }) => {
    switch (status.toLowerCase()) {
        case 'delivered':
            return <CheckCircle className="h-5 w-5 text-green-500" />;
        case 'shipped':
            return <Truck className="h-5 w-5 text-blue-500" />;
        case 'processing':
            return <Package className="h-5 w-5 text-yellow-500" />;
        case 'pending':
            return <Clock className="h-5 w-5 text-gray-500" />;
        case 'cancelled':
            return <XCircle className="h-5 w-5 text-red-500" />;
        default:
            return <FileText className="h-5 w-5 text-gray-500" />;
    }
};

const OrderTimeline = ({ history }: { history: OrderTracking[] }) => (
    <div className= "space-y-6" >
    {
        history.map((event, index) => (
            <div key= { index } className = "flex items-start" >
            <div className="flex flex-col items-center mr-4" >
        <StatusIcon status={ event.status } />
        { index<history.length - 1 && <div className="w-px h-12 bg-gray-200 dark:bg-gray-700" /> }
        </div>
        < div >
        <p className="font-semibold capitalize" > { event.status } </p>
        < p className = "text-sm text-muted-foreground" > { event.description } </p>
        < p className = "text-xs text-muted-foreground mt-1" > { event.date } </p>
        </div>
        </div>
        ))
    }
    </div>
);


export default function OrderDetailPage() {
    const { orderNumber } = useParams<{ orderNumber: string }>();

    const { data: order, isLoading, isError, error } = useQuery<OrderDetails, Error>({
        queryKey: ['orderDetails', orderNumber],
        queryFn: () => fetchOrderDetails(orderNumber!),
        enabled: !!orderNumber,
    });

    if (isLoading) {
        return (
            <div className= "container mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8" >
            <Skeleton className="h-16 w-1/2" />
                <div className="grid md:grid-cols-3 gap-8" >
                    <div className="md:col-span-2 space-y-8" >
                        <Skeleton className="h-64 w-full" />
                            <Skeleton className="h-48 w-full" />
                                </div>
                                < div className = "space-y-8" >
                                    <Skeleton className="h-48 w-full" />
                                        <Skeleton className="h-32 w-full" />
                                            </div>
                                            </div>
                                            </div>
        );
    }

    if (isError) {
        return (
            <div className= "container mx-auto px-4 sm:px-6 lg:px-8 py-10" >
            <Alert variant="destructive" >
                <AlertTitle>Error </AlertTitle>
                <AlertDescription>
                        Could not load order details. { error?.message }
        </AlertDescription>
            </Alert>
            </div>
        );
    }

    if (!order) {
        return null;
    }

    return (
        <div className= "container mx-auto px-4 sm:px-6 lg:px-8 py-10" >
        <div className="flex justify-between items-center mb-6" >
            <div>
            <h1 className="text-3xl font-bold tracking-tight" > Order #{ order.order_number } </h1>
                < p className = "text-sm text-muted-foreground" >
                    Placed on { order.date }
    </p>
        </div>
        < div className = "flex items-center gap-2" >
            <Badge variant={ order.status.toLowerCase() === 'delivered' ? 'secondary' : 'default' } className = "capitalize text-sm" >
                { order.status }
                </Badge>
                < Badge variant = { order.payment_status.toLowerCase() === 'paid' ? 'default' : 'secondary' } className = "capitalize text-sm" >
                    { order.payment_status }
                    </Badge>
                    </div>
                    </div>

                    < div className = "grid md:grid-cols-3 gap-8" >
                        <div className="md:col-span-2 space-y-8" >
                            {/* Order Items */ }
                            < Card >
                            <CardHeader>
                            <CardTitle>Order Items({ order.items?.length || 0 }) </CardTitle>
                                </CardHeader>
                                < CardContent >
                                <Table>
                                <TableHeader>
                                <TableRow>
                                <TableHead>Product </TableHead>
                                < TableHead > Price </TableHead>
                                < TableHead className = "text-center" > Quantity </TableHead>
                                    < TableHead className = "text-right" > Total </TableHead>
                                        </TableRow>
                                        </TableHeader>
                                        <TableBody>
    {
        order.items?.map(item => (
            <TableRow key= { item.id } >
            <TableCell>
            <div className="flex items-center gap-4" >
        <img src={ item.image_url || '/placeholder.svg' } alt = { item.product_name } className = "w-16 h-16 object-cover rounded-md" />
        <div>
        <p className="font-medium" > { item.product_name } </p>
                            {/* Could add product link here */ }
            </div>
            </div>
            </TableCell>
            < TableCell > { ensureNairaSymbol(item.price)
    } </TableCell>
        < TableCell className = "text-center" > { item.quantity } </TableCell>
            < TableCell className = "text-right" > { ensureNairaSymbol(item.total) } </TableCell>
                </TableRow>
        ))
}
</TableBody>
    </Table>
    </CardContent>
    < CardFooter className = "flex justify-end bg-gray-50 dark:bg-gray-800/50 p-4" >
        <div className="w-full max-w-xs space-y-2 text-sm" >
            <div className="flex justify-between" > <span>Subtotal < /span><span>{ensureNairaSymbol(order.subtotal)}</span > </div>
                < div className = "flex justify-between" > <span>Shipping < /span><span>{ensureNairaSymbol(order.shipping_cost)}</span > </div>
                    < div className = "flex justify-between" > <span>Tax < /span><span>{ensureNairaSymbol(order.tax)}</span > </div>
                        < Separator />
                        <div className="flex justify-between font-bold text-base" > <span>Total < /span><span>{ensureNairaSymbol(order.formatted_total)}</span > </div>
                            </div>
                            </CardFooter>
                            </Card>

{/* Order Tracking */ }
<Card>
    <CardHeader>
    <CardTitle>Order Tracking </CardTitle>
        </CardHeader>
        < CardContent >
        <OrderTimeline history={ order.tracking_history || [] } />
            </CardContent>
            </Card>
            </div>

            < div className = "space-y-8" >
                {/* Shipping & Billing */ }
                < Card >
                <CardHeader>
                <CardTitle>Shipping & Billing </CardTitle>
                </CardHeader>
                < CardContent className = "space-y-4" >
                    <div>
                    <h3 className="font-semibold flex items-center gap-2" > <MapPin className="h-4 w-4" /> Shipping Address </h3>
                        < address className = "not-italic text-muted-foreground text-sm mt-2" >
                            { order.shipping_address.street } < br />
                            { order.shipping_address.city }, { order.shipping_address.state } { order.shipping_address.zip_code } <br />
{ order.shipping_address.country }
</address>
    </div>
    < Separator />
    <div>
    <h3 className="font-semibold flex items-center gap-2" > <CreditCard className="h-4 w-4" /> Payment Method </h3>
        < p className = "text-muted-foreground text-sm mt-2" > { order.payment_method } </p>
            </div>
            </CardContent>
            </Card>

            < Button asChild className = "w-full" >
                <Link to="/order-history" >
                    <FileText className="mr-2 h-4 w-4" /> Back to Order History
                        </Link>
                        </Button>
                        </div>
                        </div>
                        </div>
    );
}
