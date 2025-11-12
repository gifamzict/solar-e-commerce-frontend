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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://web-production-d1120.up.railway.app/api/';

interface PromotionFormData {
  name: string;
  promo_code: string;
  discount_type: string;
  discount_value: string;
  start_date: string;
  end_date: string;
  usage_limit: string;
  minimum_order_amount: string;
  description: string;
}

const initialFormData: PromotionFormData = {
  name: "",
  promo_code: "",
  discount_type: "",
  discount_value: "",
  start_date: "",
  end_date: "",
  usage_limit: "",
  minimum_order_amount: "",
  description: "",
};

export function AddPromotionDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState<PromotionFormData>(initialFormData);

  // Create promotion mutation
  const createPromotionMutation = useMutation({
    mutationFn: async (data: PromotionFormData) => {
      const response = await axios.post(`${API_BASE_URL}promotions`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Promotion created successfully!");
      setIsOpen(false);
      // Reset form
      setFormData(initialFormData);
      // Refresh promotions list
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Failed to create promotion");
      } else {
        toast.error("Network error or failed to connect");
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.promo_code || !formData.discount_type || !formData.discount_value || !formData.start_date || !formData.end_date) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate dates
    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      toast.error("End date must be after start date");
      return;
    }

    // Validate discount value
    if (formData.discount_type === "percentage" && Number(formData.discount_value) > 100) {
      toast.error("Percentage discount cannot exceed 100%");
      return;
    }

    createPromotionMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof PromotionFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open= { isOpen } onOpenChange = { setIsOpen } >
      <DialogTrigger asChild >
      <Button className="gap-2" >
        <Plus className="h-4 w-4" />
          Add Promotion
            </Button>
            </DialogTrigger>
            < DialogContent className = "max-w-lg" >
              <DialogHeader>
              <DialogTitle>Create New Promotion </DialogTitle>
                <DialogDescription>
            Set up a discount code or promotion for your solar products
    </DialogDescription>
    </DialogHeader>
    < form className = "space-y-4 mt-4" onSubmit = { handleSubmit } >
      <div className="space-y-2" >
        <Label htmlFor="promo-name" > Promotion Name * </Label>
          < Input
  id = "promo-name"
  placeholder = "e.g., Summer Solar Sale"
  value = { formData.name }
  onChange = {(e) => handleInputChange("name", e.target.value)
}
            />
  </div>

  < div className = "space-y-2" >
    <Label htmlFor="promo-code" > Promo Code * </Label>
      < Input
id = "promo-code"
placeholder = "e.g., SOLAR2025"
value = { formData.promo_code }
onChange = {(e) => handleInputChange("promo_code", e.target.value.toUpperCase())}
            />
  </div>

  < div className = "grid grid-cols-2 gap-4" >
    <div className="space-y-2" >
      <Label htmlFor="promo-type" > Discount Type * </Label>
        < Select value = { formData.discount_type } onValueChange = {(value) => handleInputChange("discount_type", value)}>
          <SelectTrigger>
          <SelectValue placeholder="Select type" />
            </SelectTrigger>
            < SelectContent >
            <SelectItem value="percentage" > Percentage </SelectItem>
              < SelectItem value = "fixed" > Fixed Amount </SelectItem>
                </SelectContent>
                </Select>
                </div>
                < div className = "space-y-2" >
                  <Label htmlFor="promo-value" > Discount Value * </Label>
                    < Input
id = "promo-value"
type = "number"
placeholder = "10"
value = { formData.discount_value }
onChange = {(e) => handleInputChange("discount_value", e.target.value)}
              />
  </div>
  </div>

  < div className = "grid grid-cols-2 gap-4" >
    <div className="space-y-2" >
      <Label htmlFor="promo-start" > Start Date * </Label>
        < Input
id = "promo-start"
type = "date"
value = { formData.start_date }
onChange = {(e) => handleInputChange("start_date", e.target.value)}
              />
  </div>
  < div className = "space-y-2" >
    <Label htmlFor="promo-end" > End Date * </Label>
      < Input
id = "promo-end"
type = "date"
value = { formData.end_date }
onChange = {(e) => handleInputChange("end_date", e.target.value)}
              />
  </div>
  </div>

  < div className = "space-y-2" >
    <Label htmlFor="promo-limit" > Usage Limit </Label>
      < Input
id = "promo-limit"
type = "number"
placeholder = "100"
value = { formData.usage_limit }
onChange = {(e) => handleInputChange("usage_limit", e.target.value)}
            />
  </div>

  < div className = "space-y-2" >
    <Label htmlFor="promo-min" > Minimum Order Amount(₦) </Label>
      < Input
id = "promo-min"
type = "number"
placeholder = "100000"
value = { formData.minimum_order_amount }
onChange = {(e) => handleInputChange("minimum_order_amount", e.target.value)}
            />
  </div>

  < div className = "space-y-2" >
    <Label htmlFor="promo-desc" > Description </Label>
      < Textarea
id = "promo-desc"
placeholder = "Promotion details and terms..."
rows = { 3}
value = { formData.description }
onChange = {(e) => handleInputChange("description", e.target.value)}
            />
  </div>

  < div className = "flex justify-end gap-3 pt-4" >
    <Button type="button" variant = "outline" onClick = {() => setIsOpen(false)}>
      Cancel
      </Button>
      < Button type = "submit" disabled = { createPromotionMutation.isPending } >
        { createPromotionMutation.isPending ? "Creating..." : "Create Promotion" }
        </Button>
        </div>
        </form>
        </DialogContent>
        </Dialog>
  );
}
