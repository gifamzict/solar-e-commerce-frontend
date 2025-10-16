import { useEffect, useState } from "react";
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
} from "@/components/ui/dialog";
import { MapPin } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PickupLocation, updatePickupLocation } from "@/services/pickup-location";

interface Props {
  location: PickupLocation | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPickupLocationDialog({ location, isOpen, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
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

  useEffect(() => {
    if (location) {
      setForm({
        name: location.name || "",
        address_line1: location.address_line1 || "",
        address_line2: location.address_line2 || "",
        city: location.city || "",
        state: location.state || "",
        postal_code: location.postal_code || "",
        country: location.country || "",
        contact_person: location.contact_person || "",
        phone: location.phone || "",
        notes: location.notes || "",
        is_default: !!location.is_default,
        active: !!location.active,
      });
    }
  }, [location]);

  const mutation = useMutation({
    mutationFn: (payload: any) => updatePickupLocation(location!.id, payload),
    onSuccess: () => {
      toast.success("Pickup location updated");
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["pickup-locations"] });
    },
    onError: (e: any) => {
      toast.error(e?.message || "Failed to update pickup location");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) return;
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
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Edit Pickup Location</DialogTitle>
          <DialogDescription>Update the pickup location information.</DialogDescription>
        </DialogHeader>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4" onSubmit={handleSubmit}>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="addr1">Address Line 1 *</Label>
            <Input id="addr1" value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="addr2">Address Line 2</Label>
            <Input id="addr2" value={form.address_line2 || ""} onChange={(e) => setForm({ ...form, address_line2: e.target.value })} />
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
            <Input id="country" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save Changes"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
