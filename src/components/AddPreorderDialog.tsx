import { useState, ChangeEvent } from "react";
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
import { createPreorder as createPreorderService, getPreorderCategories } from "@/services/preorder";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface AddPreorderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPreorderDialog({ isOpen, onOpenChange }: AddPreorderDialogProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [preorderPrice, setPreorderPrice] = useState("");
  const [depositPercent, setDepositPercent] = useState("");
  const [maxPreorders, setMaxPreorders] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<FileList | null>(null);
  const [powerOutput, setPowerOutput] = useState("");
  const [warrantyPeriod, setWarrantyPeriod] = useState("");
  const [specifications, setSpecifications] = useState("");

  const { data: categories } = useQuery({
    queryKey: ['preorder-categories'],
    queryFn: getPreorderCategories,
  });

  const createPreorderMutation = useMutation({
    mutationFn: createPreorderService,
    onSuccess: () => {
      toast.success("Pre-order created successfully!");
      onOpenChange(false);
      setName("");
      setCategoryId("");
      setPreorderPrice("");
      setDepositPercent("");
      setMaxPreorders("");
      setExpectedDate("");
      setDescription("");
      setImages(null);
      setPowerOutput("");
      setWarrantyPeriod("");
      setSpecifications("");
      queryClient.invalidateQueries({ queryKey: ['preorders'] });
    },
    onError: (error: any) => {
      if (error?.status === 422 && error?.validationErrors) {
        const errs = error.validationErrors as Record<string, string[] | string>;
        const lines: string[] = [];
        const files = images ? Array.from(images) : [];
        Object.entries(errs).forEach(([field, val]) => {
          const msg = Array.isArray(val) ? val.join(' ') : String(val);
          const m = field.match(/^images(?:\.|\[)(\d+)\]?/);
          if (m) {
            const idx = Number(m[1]);
            const name = files[idx]?.name ? ` (${files[idx].name})` : '';
            lines.push(`Image ${idx + 1}${name}: ${msg}`);
          } else {
            lines.push(`${field}: ${msg}`);
          }
        });
        toast.error(lines.join('\n'));
        return;
      }
      toast.error(error?.message || "Failed to create pre-order.");
    },
  });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    if (files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
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
    const missing: string[] = [];
    if (!name.trim()) missing.push('Product Name');
    if (!categoryId) missing.push('Category');
    if (!preorderPrice) missing.push('Pre-order Price');
    if (!expectedDate) missing.push('Expected Availability');
    // Description optional

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
    // Send both possible keys expected by backend
    formData.append('name', name);
    formData.append('product_name', name);
    formData.append('category_id', categoryId);
    formData.append('preorder_price', preorderPrice);
    formData.append('pre_order_price', preorderPrice);

    if (depositPercent) {
      const priceNum = Number(preorderPrice);
      const percentNum = Number(depositPercent);
      const depositAmount = isNaN(priceNum) || isNaN(percentNum) ? 0 : (priceNum * percentNum) / 100;
      formData.append('deposit_amount', String(Math.round(depositAmount)));
      formData.append('deposit_percentage', depositPercent);
    }

    if (maxPreorders) formData.append('max_preorders', maxPreorders);
    if (expectedDate) {
      formData.append('expected_availability_date', expectedDate);
      formData.append('expected_availability', expectedDate);
    }
    if (description) formData.append('description', description);

    if (powerOutput) formData.append('power_output', powerOutput);
    if (warrantyPeriod) formData.append('warranty_period', warrantyPeriod);
    if (specifications) formData.append('specifications', specifications);

    if (images) {
      Array.from(images).forEach((file, i) => formData.append(`images[${i}]`, file));
    }
    createPreorderMutation.mutate(formData);
  };

  const computedDepositNaira = (() => {
    const priceNum = Number(preorderPrice);
    const percentNum = Number(depositPercent);
    if (!preorderPrice || !depositPercent || isNaN(priceNum) || isNaN(percentNum)) return null;
    const amt = (priceNum * percentNum) / 100;
    return Math.round(amt);
  })();

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Pre-order Product</DialogTitle>
          <DialogDescription>
            Fill in the details to list a product for pre-order
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input id="name" placeholder="e.g., 300W Solar Panel" value={name} onChange={(e) => setName(e.target.value)} />
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

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preorder_price">Pre-order Price (₦) *</Label>
              <Input id="preorder_price" type="number" placeholder="350000" value={preorderPrice} onChange={(e) => setPreorderPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deposit_percent">Deposit (%)</Label>
              <Input id="deposit_percent" type="number" placeholder="20" value={depositPercent} onChange={(e) => setDepositPercent(e.target.value)} />
              {computedDepositNaira !== null && (
                <p className="text-xs text-muted-foreground">≈ ₦{computedDepositNaira.toLocaleString()} upfront</p>
              )}
            </div>
          
          </div>

          <div className="space-y-2">
            <Label htmlFor="expected_date">Expected Availability *</Label>
            <Select value={expectedDate} onValueChange={setExpectedDate}>
              <SelectTrigger id="expected_date">
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="power_output">Power Output</Label>
              <Input id="power_output" placeholder="e.g., 300W, 3kW system" value={powerOutput} onChange={(e) => setPowerOutput(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="warranty_period">Warranty Period</Label>
              <Input id="warranty_period" placeholder="e.g., 24 months, 5 years" value={warrantyPeriod} onChange={(e) => setWarrantyPeriod(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Enter a concise product description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specifications">Specifications</Label>
            <Textarea id="specifications" placeholder="List key specs, materials, certifications, dimensions, etc." rows={3} value={specifications} onChange={(e) => setSpecifications(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="images">Images</Label>
            <div className="border-2 border-dashed rounded-md p-6 text-center hover:border-primary transition-colors">
              <input type="file" multiple accept="image/png,image/jpeg,image/jpg" onChange={handleFileChange} className="hidden" id="preorder-file-upload" />
              <label htmlFor="preorder-file-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB each (Max 5 images)</p>
              </label>
              {images && (
                <div className="mt-2">
                  <p className="text-xs text-primary">{images.length} file(s) selected</p>
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
            <Button type="submit" disabled={createPreorderMutation.isPending}>
              {createPreorderMutation.isPending ? "Adding..." : "Add Pre-order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
