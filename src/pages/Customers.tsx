import { useEffect, useState } from "react";
import axios from "axios";
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
import { Search, Eye, Mail, MoreHorizontal, UserPlus } from "lucide-react";

const statusColors = {
  Active: "bg-success text-success-foreground",
  VIP: "bg-primary text-primary-foreground",
  New: "bg-accent text-accent-foreground",
  Inactive: "bg-muted text-muted-foreground",
};

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [customersData, setCustomersData] = useState({
    total_customers: 0,
    active_customers: 0,
    vip_customers: 0,
    new_this_month: 0,
    customers: [],
  });

  // Define the base URL from environment variables
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://solar-e-commerce-backend-production.up.railway.app/api') + '/';

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}customers`);
        setCustomersData(response.data);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customersData.customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className= "space-y-6 animate-fade-in" >
    <div>
    <h1 className="text-3xl font-bold tracking-tight" > Customers Management </h1>
      < p className = "text-muted-foreground mt-1" > View and manage customer information </p>
        </div>

        < div className = "grid gap-4 md:grid-cols-4" >
          <Card>
          <CardHeader className="pb-3" >
            <CardTitle className="text-sm font-medium" > Total Customers </CardTitle>
              </CardHeader>
              < CardContent >
              <div className="text-2xl font-bold" > { customersData.total_customers } </div>
                </CardContent>
                </Card>
                < Card >
                <CardHeader className="pb-3" >
                  <CardTitle className="text-sm font-medium" > Active </CardTitle>
                    </CardHeader>
                    < CardContent >
                    <div className="text-2xl font-bold" > { customersData.active_customers } </div>
                      </CardContent>
                      </Card>
                      < Card >
                      <CardHeader className="pb-3" >
                        <CardTitle className="text-sm font-medium" > VIP </CardTitle>
                          </CardHeader>
                          < CardContent >
                          <div className="text-2xl font-bold" > { customersData.vip_customers } </div>
                            </CardContent>
                            </Card>
                            < Card >
                            <CardHeader className="pb-3" >
                              <CardTitle className="text-sm font-medium" > New This Month </CardTitle>
                                </CardHeader>
                                < CardContent >
                                <div className="text-2xl font-bold" > { customersData.new_this_month } </div>
                                  </CardContent>
                                  </Card>
                                  </div>

                                  < div className = "relative" >
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                      <Input
          placeholder="Search customers..."
  className = "pl-10"
  value = { searchQuery }
  onChange = {(e) => setSearchQuery(e.target.value)
}
        />
  </div>

  < Card >
  <CardHeader>
  <CardTitle>All Customers({ filteredCustomers.length }) </CardTitle>
    </CardHeader>
    < CardContent >
    <Table>
    <TableHeader>
    <TableRow>
    <TableHead>Customer </TableHead>
    < TableHead > Email </TableHead>
    < TableHead > Joined </TableHead>
    < TableHead className = "text-right" > Actions </TableHead>
      </TableRow>
      </TableHeader>
      <TableBody>
{
  filteredCustomers.map((customer) => (
    <TableRow key= { customer.id } className = "hover:bg-muted/50 transition-colors" >
    <TableCell>
    <div className="flex items-center gap-3" >
    <Avatar>
    <AvatarFallback>{ customer.name.split(" ").map((n) => n[0]).join("") } </AvatarFallback>
    </Avatar>
  < span className = "font-medium" > { customer.name } </span>
  </div>
  </TableCell>
  < TableCell className = "text-muted-foreground" > { customer.email } </TableCell>
  < TableCell className = "text-muted-foreground" >
  { new Date(customer.created_at).toLocaleDateString() }
  </TableCell>
  < TableCell className = "text-right" >
  <div className="flex justify-end gap-2" >
  <Button variant="ghost" size = "icon" >
  <Eye className="h-4 w-4" />
  </Button>
  < Button variant = "ghost" size = "icon" >
  <Mail className="h-4 w-4" />
  </Button>
  </div>
  </TableCell>
  </TableRow>
  ))
}
</TableBody>
  </Table>
  </CardContent>
  </Card>
  </div>
  );
}
