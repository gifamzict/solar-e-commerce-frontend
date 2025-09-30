import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Eye, Mail } from "lucide-react";

const customers = [
  { id: 1, name: "John Doe", email: "john@example.com", orders: 15, spent: "$2,345", joined: "2023-06-15", status: "Active" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", orders: 23, spent: "$4,567", joined: "2023-05-10", status: "Active" },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", orders: 8, spent: "$1,234", joined: "2023-08-20", status: "Active" },
  { id: 4, name: "Sarah Williams", email: "sarah@example.com", orders: 31, spent: "$6,789", joined: "2023-03-05", status: "VIP" },
  { id: 5, name: "Tom Brown", email: "tom@example.com", orders: 12, spent: "$2,890", joined: "2023-07-12", status: "Active" },
  { id: 6, name: "Emily Davis", email: "emily@example.com", orders: 5, spent: "$890", joined: "2023-11-01", status: "New" },
  { id: 7, name: "Chris Wilson", email: "chris@example.com", orders: 19, spent: "$3,456", joined: "2023-04-18", status: "Active" },
  { id: 8, name: "Anna Martinez", email: "anna@example.com", orders: 0, spent: "$0", joined: "2024-01-15", status: "Inactive" },
];

const statusColors = {
  Active: "bg-success text-success-foreground",
  VIP: "bg-primary text-primary-foreground",
  New: "bg-accent text-accent-foreground",
  Inactive: "bg-muted text-muted-foreground",
};

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers Management</h1>
        <p className="text-muted-foreground mt-1">View and manage customer information</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.filter(c => c.status === "Active").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">VIP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.filter(c => c.status === "VIP").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.filter(c => c.status === "New").length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Customers ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                  <TableCell>{customer.orders}</TableCell>
                  <TableCell className="font-semibold">{customer.spent}</TableCell>
                  <TableCell className="text-muted-foreground">{customer.joined}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[customer.status as keyof typeof statusColors]}>
                      {customer.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Mail className="h-4 w-4" />
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
