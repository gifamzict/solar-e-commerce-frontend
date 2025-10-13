import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Plus, Trash2, Edit, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { listPreorders, deletePreorder as deletePreorderApi } from "@/services/preorder";
import { AddPreorderDialog } from "@/components/AddPreorderDialog";
import { EditPreorderDialog } from "@/components/EditPreorderDialog";
import { ensureNairaSymbol } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PreorderDetailDialog } from "@/components/PreorderDetailDialog";

const statusColors: Record<string, string> = {
  Active: "bg-green-500 text-white",
  Upcoming: "bg-blue-500 text-white",
  Closed: "bg-gray-500 text-white",
};

export default function Preorders() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPreorder, setEditingPreorder] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedPreorder, setSelectedPreorder] = useState<any>(null);

  const { data: preorders = [], isLoading, error } = useQuery({
    queryKey: ['preorders'],
    queryFn: listPreorders,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePreorderApi,
    onSuccess: () => {
      toast.success("Pre-order deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ['preorders'] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete pre-order.");
    },
  });

  const filtered = preorders.filter((p: any) => {
    const name = String(p.name || '').toLowerCase();
    const categoryName = typeof p.category === 'object' ? (p.category?.name || '') : (p.category || '');
    const status = (p.status || 'Upcoming');
    const matchesSearch = name.includes(searchQuery.toLowerCase()) || categoryName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' ? true : status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleEdit = (item: any) => {
    setEditingPreorder(item);
    setIsEditDialogOpen(true);
  };

  const handleView = (item: any) => {
    setSelectedPreorder(item);
    setIsDetailOpen(true);
  };

  if (isLoading) return <div className="flex justify-center items-center h-64">Loading pre-orders...</div>;
  if (error) return <div className="text-center text-red-500">Error loading pre-orders: {(error as any).message}</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pre-orders</h1>
          <p className="text-muted-foreground mt-1">Manage products available for pre-order</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Pre-order
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search pre-orders..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="w-full sm:w-56">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All</SelectItem>
              <SelectItem value="Upcoming">Upcoming</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Pre-orders ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Pre-order Price</TableHead>
                <TableHead>Deposit</TableHead>
                <TableHead>Max</TableHead>
                <TableHead>Booked</TableHead>
                <TableHead>Expected Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item: any) => {
                const categoryName = typeof item.category === 'object' ? item.category?.name : item.category;
                const price = typeof item.preorder_price === 'number' ? `₦${item.preorder_price.toLocaleString()}` : ensureNairaSymbol(item.preorder_price);

                // Deposit amount + percentage if computable
                const priceNum = Number(item.preorder_price);
                const depositAmtNum = Number(item.deposit_amount);
                const depPct = priceNum > 0 && depositAmtNum > 0 ? Math.round((depositAmtNum / priceNum) * 100) : null;
                const depositAmountDisplay = item.deposit_amount ? (typeof item.deposit_amount === 'number' ? `₦${item.deposit_amount.toLocaleString()}` : ensureNairaSymbol(item.deposit_amount)) : '-';
                const deposit = depositAmountDisplay !== '-' && depPct !== null ? `${depositAmountDisplay} (${depPct}%)` : depositAmountDisplay;

                const max = item.max_preorders ?? '-';
                const booked = item.total_preorders ?? item.booked ?? '-';

                // Expected availability can be a date (YYYY-MM-DD) or a human-readable string
                let expected = '-';
                if (item.expected_availability_date) {
                  const raw = String(item.expected_availability_date);
                  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
                    expected = new Date(raw).toLocaleDateString();
                  } else {
                    expected = raw;
                  }
                }

                const closed = max !== '-' && booked !== '-' && Number(booked) >= Number(max);
                const status = closed ? 'Closed' : (item.status || 'Upcoming');
                return (
                  <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-muted-foreground">{categoryName || '-'}</TableCell>
                    <TableCell className="font-semibold">{price}</TableCell>
                    <TableCell>{deposit}</TableCell>
                    <TableCell>{max}</TableCell>
                    <TableCell className="text-muted-foreground">{booked}</TableCell>
                    <TableCell className="text-muted-foreground">{expected}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[status] || "bg-blue-500 text-white"}>{status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleView(item)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddPreorderDialog isOpen={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      <EditPreorderDialog preorder={editingPreorder} isOpen={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} />
      <PreorderDetailDialog preorder={selectedPreorder} isOpen={isDetailOpen} onOpenChange={setIsDetailOpen} onRequestEdit={(item) => handleEdit(item)} />
    </div>
  );
}
