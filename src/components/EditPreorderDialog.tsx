import { useEffect, useState } from "react";
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
import { updatePreorder as updatePreorderService, getPreorderCategories } from "@/services/preorder";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface PreorderItem {
  id: number;
  name: string;
  category_id: number;
  preorder_price: number | string;
  deposit_amount?: number | string | null;
  max_preorders?: number | null;
  expected_availability_date?: string | null;
  description: string;
  images?: string[];
  category?: Category;
  status?: string;
  // New optional fields if present from backend
  power_output?: string | null;
  warranty_period?: string | null;
  specifications?: string | null;
  video_url?: string | null;
}

interface EditPreorderDialogProps {
  preorder: PreorderItem | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPreorderDialog({ preorder, isOpen, onOpenChange }: EditPreorderDialogProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [preorderPrice, setPreorderPrice] = useState("");
  // Use percentage for deposit in the edit form
  const [depositPercent, setDepositPercent] = useState("");
  const [maxPreorders, setMaxPreorders] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  // New fields
  const [powerOutput, setPowerOutput] = useState("");
  const [warrantyPeriod, setWarrantyPeriod] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const { data: categories } = useQuery({
    queryKey: ['preorder-categories'],
    queryFn: getPreorderCategories,
  });

  useEffect(() => {
    if (preorder) {
      const price = Number(preorder.preorder_price ?? 0);
      const depAmt = Number(preorder.deposit_amount ?? 0);
      const depPct = price > 0 && depAmt > 0 ? String(Math.round((depAmt / price) * 100)) : "";

      setName(preorder.name || "");
      setCategoryId(String(preorder.category_id || ""));
      setPreorderPrice(String(preorder.preorder_price ?? ""));
      setDepositPercent(depPct);
      setMaxPreorders(preorder.max_preorders != null ? String(preorder.max_preorders) : "");
      setExpectedDate(preorder.expected_availability_date || "");
      setDescription(preorder.description || "");
      setImages(null);
      setPowerOutput(preorder.power_output || "");
      setWarrantyPeriod(preorder.warranty_period || "");
      setSpecifications(preorder.specifications || "");
      setVideoUrl(preorder.video_url || "");
    }
  }, [preorder]);

  const mutation = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) => updatePreorderService(id, formData),
    onSuccess: () => {
      toast.success("Pre-order updated successfully!");
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['preorders'] });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update pre-order.");
    },
  });

  const computedDepositNaira = (() => {
    const priceNum = Number(preorderPrice);
    const percentNum = Number(depositPercent);
    if (!preorderPrice || !depositPercent || isNaN(priceNum) || isNaN(percentNum)) return null;
    return Math.round((priceNum * percentNum) / 100);
  })();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preorder) return;

    const missing: string[] = [];
    if (!name.trim()) missing.push('Product Name');
    if (!categoryId) missing.push('Category');
    if (!preorderPrice) missing.push('Pre-order Price');
    if (!description.trim()) missing.push('Description');

    if (missing.length > 0) {
      toast.error(`Please fill the following field(s): ${missing.join(', ')}`);
      return;
    }

    if (depositPercent) {
      const dp = Number(depositPercent);
      if (isNaN(dp) || dp < 0 || dp > 100) {
        toast.error("Deposit percentage must be between 0 and 100.");
        return;
      }
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('category_id', categoryId);
    formData.append('preorder_price', preorderPrice);

    if (depositPercent) {
      const priceNum = Number(preorderPrice);
      const percentNum = Number(depositPercent);
      const depositAmount = isNaN(priceNum) || isNaN(percentNum) ? 0 : (priceNum * percentNum) / 100;
      formData.append('deposit_amount', String(Math.round(depositAmount)));
      formData.append('deposit_percentage', depositPercent);
    }

    if (maxPreorders) formData.append('max_preorders', maxPreorders);
    if (expectedDate) formData.append('expected_availability_date', expectedDate);
    formData.append('description', description);

    // New fields
    if (powerOutput) formData.append('power_output', powerOutput);
    if (warrantyPeriod) formData.append('warranty_period', warrantyPeriod);
    if (specifications) formData.append('specifications', specifications);
    if (videoUrl.trim()) formData.append('video_url', videoUrl.trim());

    if (images) Array.from(images).forEach(f => formData.append('images[]', f));

    mutation.mutate({ id: preorder.id, formData });
  };

  // Validate images: up to 5 files, each <= 5MB
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    if (files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    const invalidFiles = Array.from(files).filter(f => f.size > maxSize);
    if (invalidFiles.length) {
      toast.error("Some files are larger than 5MB. Please select smaller files.");
      return;
    }
    setImages(files);
    toast.success(`${files.length} file(s) selected successfully`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Pre-order</DialogTitle>
          <DialogDescription>Update the pre-order details</DialogDescription>
        </DialogHeader>
        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-po-name">Product Name *</Label>
              <Input id="edit-po-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., 300W Solar Panel" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-po-category">Category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((c: Category) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-po-price">Pre-order Price (₦) *</Label>
              <Input id="edit-po-price" type="number" value={preorderPrice} onChange={(e) => setPreorderPrice(e.target.value)} placeholder="350000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-po-deposit">Deposit (%)</Label>
              <Input id="edit-po-deposit" type="number" value={depositPercent} onChange={(e) => setDepositPercent(e.target.value)} placeholder="20" />
              {computedDepositNaira !== null && (
                <p className="text-xs text-muted-foreground">≈ ₦{computedDepositNaira.toLocaleString()} upfront</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-po-max">Max Pre-orders</Label>
              <Input id="edit-po-max" type="number" value={maxPreorders} onChange={(e) => setMaxPreorders(e.target.value)} placeholder="100" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-po-date">Expected Availability</Label>
            <Select value={expectedDate} onValueChange={setExpectedDate}>
              <SelectTrigger id="edit-po-date">
                <SelectValue placeholder="Select timeline" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2 weeks after payment">2 weeks after payment</SelectItem>
                <SelectItem value="6 weeks after payment">6 weeks after payment</SelectItem>
                <SelectItem value="1 month after payment">1 month after payment</SelectItem>
                <SelectItem value="2 month after payment">2 month after payment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-po-description">Description *</Label>
            <Textarea id="edit-po-description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter a concise product description" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-po-power">Power Output</Label>
              <Input id="edit-po-power" value={powerOutput} onChange={(e) => setPowerOutput(e.target.value)} placeholder="e.g., 300W, 3kW system" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-po-warranty">Warranty Period</Label>
              <Input id="edit-po-warranty" value={warrantyPeriod} onChange={(e) => setWarrantyPeriod(e.target.value)} placeholder="e.g., 24 months, 5 years" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-po-specs">Specifications</Label>
            <Textarea id="edit-po-specs" rows={4} value={specifications} onChange={(e) => setSpecifications(e.target.value)} placeholder="List key specs, materials, certifications, dimensions, etc." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-po-video-url">YouTube Video URL (optional)</Label>
            <Input
              id="edit-po-video-url"
              placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">If provided, the video will show first on the pre-order page.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-po-images">Images</Label>
            <div className="border-2 border-dashed rounded-md p-6 text-center hover:border-primary transition-colors">
              <input id="edit-po-images" className="hidden" type="file" accept="image/png,image/jpeg,image/jpg" multiple onChange={handleFileChange} />
              <label htmlFor="edit-po-images" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB (Max 5 images)</p>
              </label>
              {images && (
                <p className="text-xs text-primary mt-2">{images.length} file(s) selected</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Updating...' : 'Update Pre-order'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
