import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AddPickupLocationDialog } from "@/components/AddPickupLocationDialog";
import { EditPickupLocationDialog } from "@/components/EditPickupLocationDialog";
import { PickupLocation, deletePickupLocation, fetchPickupLocationsWithQuery, setDefaultPickupLocation, toggleActivePickupLocation } from "@/services/pickup-location";
import { Edit, Trash2, MapPin, Star, Power } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function PickupLocationsPage() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["pickup-locations", { search, activeFilter }],
    queryFn: () =>
      fetchPickupLocationsWithQuery({
        search: search || undefined,
        active: activeFilter === "all" ? undefined : activeFilter === "active",
      }),
  });

  const [editing, setEditing] = useState<PickupLocation | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const delMutation = useMutation({
    mutationFn: deletePickupLocation,
    onSuccess: () => {
      toast.success("Pickup location deleted");
      queryClient.invalidateQueries({ queryKey: ["pickup-locations"] });
    },
    onError: (e: any) => toast.error(e?.message || "Failed to delete location"),
  });

  const setDefaultMutation = useMutation({
    mutationFn: setDefaultPickupLocation,
    onSuccess: () => {
      toast.success("Default location updated");
      queryClient.invalidateQueries({ queryKey: ["pickup-locations"] });
    },
    onError: (e: any) => toast.error(e?.message || "Failed to set default"),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: toggleActivePickupLocation,
    onSuccess: () => {
      toast.success("Location status updated");
      queryClient.invalidateQueries({ queryKey: ["pickup-locations"] });
    },
    onError: (e: any) => toast.error(e?.message || "Failed to update status"),
  });

  const handleEdit = (loc: PickupLocation) => {
    setEditing(loc);
    setEditOpen(true);
  };

  const handleDelete = (id: number) => delMutation.mutate(id);
  const handleSetDefault = (id: number) => setDefaultMutation.mutate(id);
  const handleToggleActive = (id: number) => toggleActiveMutation.mutate(id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pickup Locations</h1>
          <p className="text-muted-foreground mt-1">Manage store pickup points customers can select during checkout</p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search by name, city, address, contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-[260px]"
          />
          <Select value={activeFilter} onValueChange={(v: any) => setActiveFilter(v)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <AddPickupLocationDialog />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Locations</CardTitle>
          <CardDescription>Active locations are available for orders. Mark one as default for convenience.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-32 grid place-items-center">Loading locations...</div>
          ) : error ? (
            <div className="text-red-500">{(error as any)?.message || "Failed to load locations"}</div>
          ) : (data?.length ?? 0) === 0 ? (
            <div className="h-32 grid place-items-center text-muted-foreground">No pickup locations yet. Add one to get started.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data!.map((loc) => (
                    <TableRow key={loc.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        {loc.name}
                        {loc.is_default ? (
                          <Badge variant="outline" className="flex items-center gap-1"><Star className="h-3 w-3" /> Default</Badge>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{loc.address_line1}</div>
                          {loc.address_line2 ? <div className="text-muted-foreground">{loc.address_line2}</div> : null}
                          <div className="text-muted-foreground">{loc.postal_code ? `${loc.postal_code}, ` : ""}{loc.state}</div>
                        </div>
                      </TableCell>
                      <TableCell>{loc.city}</TableCell>
                      <TableCell>{loc.country}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={loc.active ? "default" : "secondary"}>{loc.active ? "Active" : "Inactive"}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{loc.contact_person || "-"}</div>
                          <div className="text-muted-foreground">{loc.phone || ""}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {!loc.is_default && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefault(loc.id)}
                              disabled={setDefaultMutation.isPending}
                            >
                              <Star className="h-3 w-3 mr-1" /> Set Default
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleActive(loc.id)}
                            disabled={loc.is_default || toggleActiveMutation.isPending}
                          >
                            <Power className={`h-3 w-3 mr-1 ${loc.active ? "text-green-600" : "text-muted-foreground"}`} />
                            {loc.active ? "Deactivate" : "Activate"}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleEdit(loc)}>
                            <Edit className="h-3 w-3 mr-1" /> Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" disabled={loc.is_default || delMutation.isPending}>
                                <Trash2 className="h-3 w-3 mr-1" /> Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete location?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently remove "{loc.name}". You can't undo this action.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDelete(loc.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <EditPickupLocationDialog location={editing} isOpen={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}
