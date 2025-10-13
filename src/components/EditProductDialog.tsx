import { useState, useEffect } from "react";
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
} from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  name: string;
  category_id: number;
  price: number;
  stock: number;
  description: string;
  power?: string;
  warranty?: string;
  specifications?: string[];
  images?: string[];
  category?: Category;
}

interface EditProductDialogProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Define the base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/';

// API functions
const fetchCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}categories`);
    const data = response.data.categories || response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || error.response.statusText);
    }
    throw new Error("Network error or failed to connect.");
  }
};

const updateProduct = async ({ id, formData }: { id: number; formData: FormData }) => {
  try {
    const response = await axios.put(`${API_BASE_URL}products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || error.response.statusText);
    }
    throw new Error("Network error or failed to connect.");
  }
};

export function EditProductDialog({ product, isOpen, onOpenChange }: EditProductDialogProps) {
  const queryClient = useQueryClient();

  // Form state
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [power, setPower] = useState("");
  const [warranty, setWarranty] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [images, setImages] = useState<FileList | null>(null);

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Update form when product changes
  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategoryId(product.category_id.toString());
      setPrice(product.price.toString());
      setStock(product.stock.toString());
      setDescription(product.description);
      setPower(product.power || "");
      setWarranty(product.warranty || "");
      setSpecifications(product.specifications ? product.specifications.join('\n') : "");
      setImages(null); // Reset images for new upload
    }
  }, [product]);

  // Mutation for updating product
  const updateProductMutation = useMutation({
    mutationFn: updateProduct,
    onSuccess: (data) => {
      toast.success("Product updated successfully!");
      onOpenChange(false);
      // Clear form
      setName("");
      setCategoryId("");
      setPrice("");
      setStock("");
      setDescription("");
      setPower("");
      setWarranty("");
      setSpecifications("");
      setImages(null);
      // Invalidate products query to refresh list
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update product.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId || !price || !stock || !description || !product) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category_id', categoryId);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('description', description);
    if (power) formData.append('power', power);
    if (warranty) formData.append('warranty', warranty);
    if (specifications) {
      const specsArray = specifications.split('\n').filter(s => s.trim());
      specsArray.forEach(spec => formData.append('specifications[]', spec));
    }
    if (images) {
      Array.from(images).forEach(file => formData.append('images[]', file));
    }

    updateProductMutation.mutate({ id: product.id, formData });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update the product details
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Product Name *</Label>
              <Input
                id="edit-name"
                placeholder="e.g., 300W Solar Panel"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((category: Category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price (₦) *</Label>
              <Input
                id="edit-price"
                type="number"
                placeholder="450000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-stock">Stock Quantity *</Label>
              <Input
                id="edit-stock"
                type="number"
                placeholder="50"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description *</Label>
            <Textarea
              id="edit-description"
              placeholder="Detailed product description..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-power">Power Output</Label>
              <Input
                id="edit-power"
                placeholder="e.g., 300W"
                value={power}
                onChange={(e) => setPower(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-warranty">Warranty Period</Label>
              <Input
                id="edit-warranty"
                placeholder="e.g., 10 years"
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-specs">Specifications</Label>
            <Textarea
              id="edit-specs"
              placeholder="Key specifications (one per line)"
              rows={4}
              value={specifications}
              onChange={(e) => setSpecifications(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-images">Product Images</Label>
            <div className="border-2 border-dashed rounded-md p-6 text-center hover:border-primary transition-colors">
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/jpg"
                onChange={(e) => setImages(e.target.files)}
                className="hidden"
                id="edit-file-upload"
              />
              <label htmlFor="edit-file-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 5MB (Max 5 images)
                </p>
              </label>
              {images && (
                <p className="text-xs text-primary mt-2">
                  {images.length} file(s) selected
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateProductMutation.isPending}>
              {updateProductMutation.isPending ? "Updating..." : "Update Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
