import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function AddPromotionDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Promotion
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Promotion</DialogTitle>
          <DialogDescription>
            Set up a discount code or promotion for your solar products
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="promo-name">Promotion Name *</Label>
            <Input id="promo-name" placeholder="e.g., Summer Solar Sale" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="promo-code">Promo Code *</Label>
            <Input id="promo-code" placeholder="e.g., SOLAR2025" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="promo-type">Discount Type *</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-value">Discount Value *</Label>
              <Input id="promo-value" type="number" placeholder="10" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="promo-start">Start Date *</Label>
              <Input id="promo-start" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="promo-end">End Date *</Label>
              <Input id="promo-end" type="date" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="promo-limit">Usage Limit</Label>
            <Input id="promo-limit" type="number" placeholder="100" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="promo-min">Minimum Order Amount (₦)</Label>
            <Input id="promo-min" type="number" placeholder="100000" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="promo-desc">Description</Label>
            <Textarea 
              id="promo-desc" 
              placeholder="Promotion details and terms..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Promotion
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
