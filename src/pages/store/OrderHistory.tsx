import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Shield, MapPin, ShoppingBag, Heart, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { ensureNairaSymbol } from "@/lib/utils";


const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api') + '/';

// --- Type Definitions ---
interface Order {
    id: number;
    order_number: string;
    date: string;
    relative_date: string;
    formatted_total: string;
    status: string;
    items_count: number;
}

interface OrdersResponse {
    orders: Order[];
    // Add pagination info if your API provides it
}


// --- API Functions ---
const fetchUserOrders = async (): Promise<OrdersResponse> => {
    const token = localStorage.getItem("store_token");
    if (!token) throw new Error("Not authenticated");
    const response = await axios.get(`${API_BASE_URL}user/orders/history`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};


export default function OrderHistoryPage() {

    const { data: ordersData, isLoading, isError } = useQuery<OrdersResponse, Error>({
        queryKey: ['userOrders'],
        queryFn: fetchUserOrders,
    });

    const getStatusVariant = (status: string) => {
        switch (status.toLowerCase()) {
            case 'delivered':
                return 'success';
            case 'shipped':
                return 'default';
            case 'pending':
                return 'secondary';
            case 'cancelled':
                return 'destructive';
            default:
                return 'outline';
        }
    };


    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid md:grid-cols-12 gap-8">

                {/* Sidebar Navigation */}
                <div className="md:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Account</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button variant="ghost" asChild className="w-full justify-start">
                                <Link to="/profile">
                                    <User className="mr-2 h-4 w-4" /> Profile
                                </Link>
                            </Button>
                            <Button variant="ghost" asChild className="w-full justify-start text-primary bg-primary/10">
                                <Link to="/order-history">
                                    <ShoppingBag className="mr-2 h-4 w-4" /> Order History
                                </Link>
                            </Button>
                          
                            <Separator className="my-2" />
                            <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-600">
                                <LogOut className="mr-2 h-4 w-4" /> Logout
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content */}
                <div className="md:col-span-9">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {isLoading ? (
                                <div className="space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="flex items-center space-x-4 p-2">
                                            <Skeleton className="h-12 w-full rounded-md" />
                                        </div>
                                    ))}
                                </div>
                            ) : isError ? (
                                <p className="text-red-500 text-center py-8">Could not load your order history.</p>
                            ) : ordersData && ordersData.orders.length > 0 ? (
                                <>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Order</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Items</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                                <TableHead></TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {ordersData.orders.map((order) => (
                                                <TableRow key={order.id}>
                                                    <TableCell className="font-medium">
                                                        <Link to={`/orders/${order.order_number}`} className="text-primary hover:underline">
                                                            #{order.order_number}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>{order.date}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={getStatusVariant(order.status) as any} className="capitalize">
                                                            {order.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{order.items_count}</TableCell>
                                                    <TableCell className="text-right">{ensureNairaSymbol(order.formatted_total)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link to={`/orders/${order.order_number}`}>View Order</Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <Pagination className="mt-6">
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious href="#" />
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationLink href="#">1</PaginationLink>
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationLink href="#" isActive>
                                                    2
                                                </PaginationLink>
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationLink href="#">3</PaginationLink>
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationNext href="#" />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </>
                            ) : (
                                <div className="text-center py-16">
                                    <ShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
                                    <p className="mt-1 text-sm text-gray-500">You haven't placed any orders yet.</p>
                                    <div className="mt-6">
                                        <Button asChild>
                                            <Link to="/">Start Shopping</Link>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
