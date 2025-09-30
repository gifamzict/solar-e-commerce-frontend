import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Upload } from "lucide-react";

export function AddCategoryDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>
            Create a new product category for your solar products
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Category Name *</Label>
            <Input id="cat-name" placeholder="e.g., Solar Panels" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cat-slug">URL Slug *</Label>
            <Input id="cat-slug" placeholder="e.g., solar-panels" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cat-desc">Description</Label>
            <Textarea 
              id="cat-desc" 
              placeholder="Brief description of this category..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cat-image">Category Image</Label>
            <div className="border-2 border-dashed rounded-md p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Click to upload category image
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG up to 2MB
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Create Category
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
