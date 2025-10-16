import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, MapPin } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createPickupLocation, CreatePickupLocationInput } from "@/services/pickup-location";

export function AddPickupLocationDialog() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const [form, setForm] = useState<CreatePickupLocationInput>({
    name: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
    contact_person: "",
    phone: "",
    notes: "",
    is_default: false,
    active: true,
  });

  const mutation = useMutation({
    mutationFn: createPickupLocation,
    onSuccess: () => {
      toast.success("Pickup location created");
      setIsOpen(false);
      setForm({
        name: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
        contact_person: "",
        phone: "",
        notes: "",
        is_default: false,
        active: true,
      });
      queryClient.invalidateQueries({ queryKey: ["pickup-locations"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || "Failed to create pickup location");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.address_line1 || !form.city || !form.country) {
      toast.error("Please fill required fields (name, address, city, country)");
      return;
    }
    mutation.mutate({
      ...form,
      address_line2: form.address_line2 || undefined,
      state: form.state || undefined,
      postal_code: form.postal_code || undefined,
      contact_person: form.contact_person || undefined,
      phone: form.phone || undefined,
      notes: form.notes || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Pickup Location
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> New Pickup Location</DialogTitle>
          <DialogDescription>Define a store or hub where customers can pick up orders.</DialogDescription>
        </DialogHeader>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pb-4" onSubmit={handleSubmit}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" placeholder="e.g., Main Warehouse" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="addr1">Address Line 1 *</Label>
            <Input id="addr1" placeholder="Street address" value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="addr2">Address Line 2</Label>
            <Input id="addr2" placeholder="Apartment, suite, etc." value={form.address_line2 || ""} onChange={(e) => setForm({ ...form, address_line2: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State/Region</Label>
            <Input id="state" value={form.state || ""} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postal">Postal Code</Label>
            <Input id="postal" value={form.postal_code || ""} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Input id="country" placeholder="e.g., Nigeria" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact">Contact Person</Label>
            <Input id="contact" value={form.contact_person || ""} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" rows={3} value={form.notes || ""} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center justify-between border rounded-md p-3">
              <div>
                <Label className="mb-1 block">Active</Label>
                <p className="text-sm text-muted-foreground">Make this location available for selection</p>
              </div>
              <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            </div>
            <div className="flex items-center justify-between border rounded-md p-3">
              <div>
                <Label className="mb-1 block">Default Location</Label>
                <p className="text-sm text-muted-foreground">Use as default pickup location</p>
              </div>
              <Switch checked={form.is_default} onCheckedChange={(v) => setForm({ ...form, is_default: v })} />
            </div>
          </div>
          <div className="md:col-span-2 flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Creating..." : "Create Location"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
