import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getImageUrls, ensureNairaSymbol } from "@/lib/utils";
import { CalendarDays, Coins, Package2 } from "lucide-react";
import { updatePreorderStatus as updatePreorderStatusService } from "@/services/preorder";

interface PreorderItem {
  id: number;
  name: string;
  category?: { id: number; name: string } | string;
  preorder_price: number | string;
  deposit_amount?: number | string | null;
  max_preorders?: number | null;
  total_preorders?: number | null;
  expected_availability_date?: string | null;
  description: string;
  images?: string[] | string | null;
  status?: string;
  // New optional fields
  power_output?: string | null;
  warranty_period?: string | null;
  specifications?: string | null;
}

interface Props {
  preorder: PreorderItem | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRequestEdit?: (item: PreorderItem) => void;
}

export function PreorderDetailDialog({ preorder, isOpen, onOpenChange, onRequestEdit }: Props) {
  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => updatePreorderStatusService(id, status),
    onSuccess: () => {
      toast.success('Status updated');
      queryClient.invalidateQueries({ queryKey: ['preorders'] });
    },
    onError: (e: any) => toast.error(e.message || 'Failed to update status'),
  });

  if (!preorder) return null;

  const categoryName = typeof preorder.category === 'object' ? preorder.category?.name : preorder.category || '-';
  const price = typeof preorder.preorder_price === 'number' ? `₦${preorder.preorder_price.toLocaleString()}` : ensureNairaSymbol(preorder.preorder_price);

  // Compute deposit percentage from amount and price if available
  const priceNum = Number(preorder.preorder_price);
  const depositAmtNum = Number(preorder.deposit_amount);
  const depositPercent = priceNum > 0 && depositAmtNum > 0 ? Math.round((depositAmtNum / priceNum) * 100) : null;
  const depositAmountDisplay = preorder.deposit_amount ? (typeof preorder.deposit_amount === 'number' ? `₦${preorder.deposit_amount.toLocaleString()}` : ensureNairaSymbol(preorder.deposit_amount)) : '-';
  const depositDisplay = depositAmountDisplay !== '-' && depositPercent !== null ? `${depositAmountDisplay} (${depositPercent}%)` : depositAmountDisplay;

  // Expected availability: show string as-is unless it's a date string
  let expected = '-';
  if (preorder.expected_availability_date) {
    const raw = String(preorder.expected_availability_date);
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
      expected = new Date(raw).toLocaleDateString();
    } else {
      expected = raw;
    }
  }

  const max = preorder.max_preorders ?? '-';
  const booked = preorder.total_preorders ?? '-';
  const closed = max !== '-' && booked !== '-' && Number(booked) >= Number(max);
  const status = closed ? 'Closed' : (preorder.status || 'Upcoming');
  const images = getImageUrls(preorder.images as any);

  const toggleStatus = () => {
    const next = status === 'Closed' ? 'Active' : 'Closed';
    statusMutation.mutate({ id: preorder.id, status: next });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{preorder.name}</span>
            <Badge className={status === 'Closed' ? 'bg-gray-500 text-white' : status === 'Active' ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}>
              {status}
            </Badge>
          </DialogTitle>
          <DialogDescription>Pre-order details overview</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-2">
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-md border bg-muted/30">
                <div className="text-xs text-muted-foreground flex items-center gap-2"><Coins className="h-3.5 w-3.5" /> Pre-order Price</div>
                <div className="text-base font-semibold">{price}</div>
              </div>
              <div className="p-3 rounded-md border bg-muted/30">
                <div className="text-xs text-muted-foreground flex items-center gap-2"><Coins className="h-3.5 w-3.5" /> Deposit</div>
                <div className="text-base font-semibold">{depositDisplay}</div>
              </div>
              <div className="p-3 rounded-md border bg-muted/30">
                <div className="text-xs text-muted-foreground flex items-center gap-2"><Package2 className="h-3.5 w-3.5" /> Max Pre-orders</div>
                <div className="text-base">{max}</div>
              </div>
              <div className="p-3 rounded-md border bg-muted/30">
                <div className="text-xs text-muted-foreground flex items-center gap-2"><Package2 className="h-3.5 w-3.5" /> Booked</div>
                <div className="text-base">{booked}</div>
              </div>
              <div className="p-3 rounded-md border bg-muted/30 col-span-2">
                <div className="text-xs text-muted-foreground flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5" /> Expected Availability</div>
                <div className="text-base">{expected}</div>
              </div>
            </div>

            <Separator />

            {/* Additional product details */}
            {(preorder.power_output || preorder.warranty_period || preorder.specifications) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {preorder.power_output && (
                  <div className="p-3 rounded-md border bg-muted/30">
                    <div className="text-xs text-muted-foreground">Power Output</div>
                    <div className="text-sm font-medium">{preorder.power_output}</div>
                  </div>
                )}
                {preorder.warranty_period && (
                  <div className="p-3 rounded-md border bg-muted/30">
                    <div className="text-xs text-muted-foreground">Warranty Period</div>
                    <div className="text-sm font-medium">{preorder.warranty_period}</div>
                  </div>
                )}
                {preorder.specifications && (
                  <div className="md:col-span-2 p-3 rounded-md border bg-muted/30">
                    <div className="text-xs text-muted-foreground">Specifications</div>
                    <div className="text-sm text-muted-foreground whitespace-pre-line">{preorder.specifications}</div>
                  </div>
                )}
              </div>
            )}

            <div>
              <div className="text-sm font-medium mb-2">Description</div>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{preorder.description}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium">Category</div>
            <div className="text-sm text-muted-foreground">{categoryName}</div>

            <div className="text-sm font-medium mt-4">Images</div>
            <div className="grid grid-cols-3 gap-2">
              {images.map((src, idx) => (
                <div key={idx} className="aspect-square overflow-hidden rounded-md border bg-muted/20">
                  <img src={src} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={toggleStatus} disabled={statusMutation.isPending}>
                {status === 'Closed' ? 'Reopen Pre-order' : 'Close Pre-order'}
              </Button>
              {onRequestEdit && (
                <Button onClick={() => onRequestEdit(preorder)}>Edit</Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
