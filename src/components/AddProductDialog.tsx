import { useState, useEffect, ChangeEvent } from "react";
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
import { apiUrl, extractYouTubeId, getYouTubeEmbedUrl } from "@/lib/utils";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface AddProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

// Define the base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/';

// API functions
const fetchCategories = async () => {
  try {
    const response = await axios.get(apiUrl('categories'));
    const data = response.data.categories || response.data.data || response.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || error.response.statusText);
    }
    throw new Error("Network error or failed to connect.");
  }
};

const createProduct = async (formData: FormData) => {
  try {
    const response = await axios.post(apiUrl('products'), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });
    return response.data;
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response) {
      const data: any = error.response.data;
      const rawText = typeof data === 'string' ? data : '';
      const srvMsg = typeof data === 'object' ? (data?.message || data?.error) : undefined;
      const msg = srvMsg || error.response.statusText || 'Request failed';
      const e: any = new Error(msg);
      e.status = error.response.status;
      e.raw = data;
      e.bodySnippet = rawText ? rawText.slice(0, 500) : undefined;
      throw e;
    }
    throw new Error("Network error or failed to connect.");
  }
};

export function AddProductDialog({ isOpen, onOpenChange }: AddProductDialogProps) {
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
  const [videoUrl, setVideoUrl] = useState("");

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  // Mutation for creating product
  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: (data) => {
      toast.success("Product created successfully!");
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
      setVideoUrl("");
      // Invalidate products query to refresh list
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      const status = error?.status || error?.response?.status;
      const snippet = error?.bodySnippet || (typeof error?.raw === 'string' ? String(error.raw).slice(0, 300) : '');
      const baseMsg = error?.message || "Failed to create product.";
      const composed = `Add product failed${status ? ` (${status})` : ''}: ${baseMsg}` + (snippet ? `\n${snippet}` : '');
      toast.error(composed);
      console.error('Add product error:', error);
    },
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Validate number of files
    if (files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

    // Validate file sizes
    const maxSize = 5 * 1024 * 1024; // 5MB
    const invalidFiles = Array.from(files).filter(file => file.size > maxSize);
    
    if (invalidFiles.length > 0) {
      toast.error("Some files are larger than 5MB. Please select smaller files.");
      return;
    }

    setImages(files);
    toast.success(`${files.length} file(s) selected successfully`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId || !price || !stock || !description) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (videoUrl.trim()) {
      const vid = extractYouTubeId(videoUrl.trim());
      if (!vid) {
        toast.error('Please enter a valid YouTube URL');
        return;
      }
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
    if (videoUrl.trim()) {
      const normalized = getYouTubeEmbedUrl(videoUrl.trim()) || videoUrl.trim();
      formData.append('video_url', normalized);
    }
    if (images) {
      Array.from(images).forEach(file => formData.append('images[]', file));
    }

    createProductMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle></DialogTitle>
          <DialogDescription>
            Fill in the product details to add it to your catalog
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                placeholder="e.g., 300W Solar Panel"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
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
              <Label htmlFor="price">Price (₦) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="450000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity *</Label>
              <Input
                id="stock"
                type="number"
                placeholder="50"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Detailed product description..."
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="power">Power Output</Label>
              <Input
                id="power"
                placeholder="e.g., 300W"
                value={power}
                onChange={(e) => setPower(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warranty">Warranty Period</Label>
              <Input
                id="warranty"
                placeholder="e.g., 10 years"
                value={warranty}
                onChange={(e) => setWarranty(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specs">Specifications</Label>
            <Textarea
              id="specs"
              placeholder="Key specifications (one per line)"
              rows={4}
              value={specifications}
              onChange={(e) => setSpecifications(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video_url">YouTube Video URL (optional)</Label>
            <Input
              id="video_url"
              placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">If provided, the video will show first on the product page.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Product Images</Label>
            <div className="border-2 border-dashed rounded-md p-6 text-center hover:border-primary transition-colors">
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/jpg"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG up to 5MB each (Max 5 images)
                </p>
              </label>
              {images && (
                <div className="mt-2">
                  <p className="text-xs text-primary">
                    {images.length} file(s) selected
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Array.from(images).map((file, index) => (
                      <div key={index} className="text-xs text-muted-foreground">
                        {file.name} ({(file.size / (1024 * 1024)).toFixed(2)}MB)
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createProductMutation.isPending}>
              {createProductMutation.isPending ? "Adding..." : "Add Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}







