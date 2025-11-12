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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";

// Define the base URL from environment variables
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://web-production-d1120.up.railway.app/api').replace(/\/$/, '');

// API function to create category
const createCategory = async (categoryData: { name: string; slug: string; description: string }) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/categories`, categoryData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || error.response.statusText);
    }
    throw new Error("Network error or failed to connect.");
  }
};

export function AddCategoryDialog() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  // Mutation for creating category
  const createCategoryMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: (data) => {
      toast.success("Category created successfully!");
      setIsOpen(false);
      // Clear form
      setName("");
      setSlug("");
      setDescription("");
      // Invalidate categories query to refresh list
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create category.");
    },
  });

  return (
    <Dialog open= { isOpen } onOpenChange = { setIsOpen } >
      <DialogTrigger asChild >
      <Button className="gap-2" >
        <Plus className="h-4 w-4" />
          Add Category
            </Button>
            </DialogTrigger>
            < DialogContent className = "max-w-lg" >
              <DialogHeader>
              <DialogTitle>Add New Category </DialogTitle>
                <DialogDescription>
            Create a new product category for your solar products
    </DialogDescription>
    </DialogHeader>
    < form
          className = "space-y-4 mt-4"
  onSubmit = {(e) => {
    e.preventDefault();
    if (!name || !slug) {
      toast.error("Please fill in all required fields.");
      return;
    }
    createCategoryMutation.mutate({ name, slug, description });
  }
}
        >
  <div className="space-y-2" >
    <Label htmlFor="cat-name" > Category Name * </Label>
      < Input
id = "cat-name"
placeholder = "e.g., Solar Panels"
value = { name }
onChange = {(e) => setName(e.target.value)}
            />
  </div>

  < div className = "space-y-2" >
    <Label htmlFor="cat-slug" > URL Slug * </Label>
      < Input
id = "cat-slug"
placeholder = "e.g., solar-panels"
value = { slug }
onChange = {(e) => setSlug(e.target.value)}
            />
  </div>

  < div className = "space-y-2" >
    <Label htmlFor="cat-desc" > Description </Label>
      < Textarea
id = "cat-desc"
placeholder = "Brief description of this category..."
rows = { 3}
value = { description }
onChange = {(e) => setDescription(e.target.value)}
            />
  </div>

  < div className = "flex justify-end gap-3 pt-4" >
    <Button type="button" variant = "outline" onClick = {() => setIsOpen(false)}>
      Cancel
      </Button>
      < Button type = "submit" disabled = { createCategoryMutation.isPending } >
        { createCategoryMutation.isPending ? "Creating..." : "Create Category" }
        </Button>
        </div>
        </form>
        </DialogContent>
        </Dialog>
  );
}
