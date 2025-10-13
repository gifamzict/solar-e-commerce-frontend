import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ensureNairaSymbol } from "@/lib/utils";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, "");

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  date: string;
  formatted_date: string;
  items_count: number;
  total_amount: number;
  formatted_total: string;
  status: string;
}

interface OrdersApiResponse {
  orders: Order[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

const fetchOrders = async (page: number, searchQuery: string, statusFilter: string): Promise<OrdersApiResponse> => {
  try {
    const response = await axios.get<OrdersApiResponse>(`${API_BASE_URL}/orders`, {
      params: {
        page,
        search: searchQuery,
        status: statusFilter,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      toast.error(error.response.data.message || "Failed to fetch orders.");
    } else {
      toast.error("Network error or failed to connect.");
    }
    throw new Error("Failed to fetch orders");
  }
};

const statusColors: { [key: string]: string } = {
  Delivered: "bg-success text-success-foreground",
  Processing: "bg-primary text-primary-foreground",
  Shipped: "bg-accent text-accent-foreground",
  Pending: "bg-warning text-warning-foreground",
  Cancelled: "bg-destructive text-destructive-foreground",
  paid: "bg-blue-500 text-white", // Added for 'paid' status from backend
};

export default function Orders() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading, error } = useQuery<OrdersApiResponse>({
    queryKey: ['orders', currentPage, searchQuery, statusFilter],
    queryFn: () => fetchOrders(currentPage, searchQuery, statusFilter),
    staleTime: 5000, // Keeps data fresh for 5 seconds
  });

  const orders = data?.orders || [];
  const pagination = data?.pagination;

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= (pagination?.last_page || 1)) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    if (!pagination || pagination.last_page <= 1) return null;

    const pageItems = [];
    const totalPages = pagination.last_page;
    const currentPage = pagination.current_page;

    // Previous button
    pageItems.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(currentPage - 1);
          }}
          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    );

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (i === currentPage) {
        pageItems.push(
          <PaginationItem key={i}>
            <PaginationLink href="#" isActive>
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      } else if (i <= 2 || i >= totalPages - 1 || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pageItems.push(
          <PaginationItem key={i}>
            <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(i); }}>
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pageItems.push(<PaginationEllipsis key={`ellipsis-${i}`} />);
      }
    }

    // Next button
    pageItems.push(
      <PaginationItem key="next">
        <PaginationNext
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handlePageChange(currentPage + 1);
          }}
          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
        />
      </PaginationItem>
    );

    return <Pagination><PaginationContent>{pageItems}</PaginationContent></Pagination>;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders Management</h1>
        <p className="text-muted-foreground mt-1">Track and manage all customer orders</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by order ID or customer name..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders ({pagination?.total || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">Loading orders...</TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-red-500 h-24">Error loading orders.</TableCell>
                </TableRow>
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell className="text-muted-foreground">{order.formatted_date}</TableCell>
                    <TableCell>{order.items_count}</TableCell>
                    <TableCell className="font-semibold">{ensureNairaSymbol(order.formatted_total)}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[order.status] || 'bg-gray-400'}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/management-portal/orders/${order.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">No orders found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {renderPagination()}
    </div>
  );
}
