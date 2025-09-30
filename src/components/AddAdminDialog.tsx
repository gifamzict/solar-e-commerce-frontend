import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export function AddAdminDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Admin User
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Admin User</DialogTitle>
          <DialogDescription>
            Create a new administrator account for your solar business
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="admin-fname">First Name *</Label>
              <Input id="admin-fname" placeholder="John" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-lname">Last Name *</Label>
              <Input id="admin-lname" placeholder="Doe" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-email">Email Address *</Label>
            <Input id="admin-email" type="email" placeholder="john@solarglow.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-phone">Phone Number</Label>
            <Input id="admin-phone" type="tel" placeholder="+234 801 234 5678" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-role">Role *</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="admin-pass">Password *</Label>
              <Input id="admin-pass" type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-confirm">Confirm Password *</Label>
              <Input id="admin-confirm" type="password" placeholder="••••••••" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="space-y-2 border rounded-md p-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Manage Products</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Manage Orders</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">Manage Customers</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm">View Analytics</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Admin User
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
