import { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

interface EditCategoryDialogProps {
  category: Category | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Define the base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://web-production-d1120.up.railway.app/api/';

// API function to update category
const updateCategory = async ({ id, categoryData }: { id: number; categoryData: { name: string; slug: string; description: string } }) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/categories/${id}`, categoryData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || error.response.statusText);
    }
    throw new Error("Network error or failed to connect.");
  }
};

export function EditCategoryDialog({ category, isOpen, onOpenChange }: EditCategoryDialogProps) {
  const queryClient = useQueryClient();

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  // Update form when category changes
  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description || "");
    }
  }, [category]);

  // Mutation for updating category
  const updateCategoryMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: (data) => {
      toast.success("Category updated successfully!");
      onOpenChange(false);
      // Invalidate categories query to refresh list
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update category.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !category) {
      toast.error("Please fill in all required fields.");
      return;
    }
    updateCategoryMutation.mutate({ id: category.id, categoryData: { name, slug, description } });
  };

  return (
    <Dialog open= { isOpen } onOpenChange = { onOpenChange } >
      <DialogContent className="max-w-lg" >
        <DialogHeader>
        <DialogTitle>Edit Category </DialogTitle>
          <DialogDescription>
            Update the category details
    </DialogDescription>
    </DialogHeader>
    < form className = "space-y-4 mt-4" onSubmit = { handleSubmit } >
      <div className="space-y-2" >
        <Label htmlFor="edit-cat-name" > Category Name * </Label>
          < Input
  id = "edit-cat-name"
  placeholder = "e.g., Solar Panels"
  value = { name }
  onChange = {(e) => setName(e.target.value)
}
            />
  </div>

  < div className = "space-y-2" >
    <Label htmlFor="edit-cat-slug" > URL Slug * </Label>
      < Input
id = "edit-cat-slug"
placeholder = "e.g., solar-panels"
value = { slug }
onChange = {(e) => setSlug(e.target.value)}
            />
  </div>

  < div className = "space-y-2" >
    <Label htmlFor="edit-cat-desc" > Description </Label>
      < Textarea
id = "edit-cat-desc"
placeholder = "Brief description of this category..."
rows = { 3}
value = { description }
onChange = {(e) => setDescription(e.target.value)}
            />
  </div>

  < div className = "flex justify-end gap-3 pt-4" >
    <Button type="button" variant = "outline" onClick = {() => onOpenChange(false)}>
      Cancel
      </Button>
      < Button type = "submit" disabled = { updateCategoryMutation.isPending } >
        { updateCategoryMutation.isPending ? "Updating..." : "Update Category" }
        </Button>
        </div>
        </form>
        </DialogContent>
        </Dialog>
  );
}
