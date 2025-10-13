import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddPromotionDialog } from "@/components/AddPromotionDialog";
import { EditPromotionDialog } from "@/components/EditPromotionDialog";
import { Edit, Trash2, Copy, Calendar, Tag, Clock, ShoppingBag, Users, Info, Percent } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

// Define the base URL from environment variables
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api') + '/';

const statusColors = {
  Active: "bg-success/15 text-success hover:bg-success/25",
  Scheduled: "bg-primary/15 text-primary hover:bg-primary/25",
  Expired: "bg-muted text-muted-foreground hover:bg-muted/80",
};

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export default function Promotions() {
  const queryClient = useQueryClient();
  const [editingPromotion, setEditingPromotion] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingPromotion, setDeletingPromotion] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch promotions
  const { data: promotions = [], isLoading } = useQuery({
    queryKey: ['promotions'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE_URL}promotions`);
      return response.data.promotions;
    }
  });

  // Delete promotion mutation
  const deletePromotionMutation = useMutation({
    mutationFn: async (id: number) => {
      await axios.delete(`${API_BASE_URL}promotions/${id}`);
    },
    onSuccess: () => {
      toast.success("Promotion deleted successfully!");
      setIsDeleteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['promotions'] });
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message || "Failed to delete promotion");
      } else {
        toast.error("Network error or failed to connect");
      }
    }
  });

  const handleEdit = (promotion: any) => {
    setEditingPromotion(promotion);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (promotion: any) => {
    setDeletingPromotion(promotion);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deletingPromotion) {
      deletePromotionMutation.mutate(deletingPromotion.id);
    }
  };

  const handleCopyPromoCode = (promoCode: string) => {
    navigator.clipboard.writeText(promoCode);
    toast.success("Promo code copied to clipboard!");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promotions & Discounts</h1>
          <p className="text-muted-foreground mt-1">Manage solar product promotions</p>
        </div>
        <AddPromotionDialog />
      </div>

      {isLoading ? (
        <div className="text-center py-8">Loading promotions...</div>
      ) : (
        <div className="grid gap-4">
          {promotions.map((promo: any) => (
            <Card key={promo.id} className="overflow-hidden border-l-4 transition-all hover:shadow-lg" style={{
              borderLeftColor: promo.status === 'Active' ? 'hsl(var(--success))' :
                             promo.status === 'Scheduled' ? 'hsl(var(--primary))' :
                             'hsl(var(--muted))'
            }}>
              <CardHeader className="bg-card/50">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-xl">{promo.name}</CardTitle>
                        <Badge variant="secondary" className={statusColors[promo.status as keyof typeof statusColors]}>
                          {promo.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Tag className="h-4 w-4" />
                        <code className="text-sm font-semibold px-2 py-0.5 bg-muted rounded-md">
                          {promo.promo_code}
                        </code>
                      </div>
                    </div>
                    {promo.description && (
                      <p className="text-sm text-muted-foreground max-w-2xl">{promo.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleCopyPromoCode(promo.promo_code)}
                      title="Copy promo code"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleEdit(promo)}
                      title="Edit promotion"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(promo)}
                      title="Delete promotion"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Discount Details */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Percent className="h-4 w-4 text-primary" />
                      Discount Details
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 bg-primary/5 p-3 rounded-lg">
                        <div className="text-2xl font-bold text-primary">
                          {promo.discount_type === 'percentage' ? (
                            `${promo.discount_value}%`
                          ) : (
                            formatCurrency(Number(promo.discount_value))
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">off</div>
                      </div>
                      {promo.minimum_order_amount > 0 && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <ShoppingBag className="h-4 w-4" />
                          <span>Min. order: {formatCurrency(promo.minimum_order_amount)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Usage Stats */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Usage Statistics
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">
                            {promo.used_count} used
                          </span>
                          <span className="font-medium">
                            {promo.usage_limit ? `${promo.usage_limit} total` : 'Unlimited'}
                          </span>
                        </div>
                        {promo.usage_limit ? (
                          <Progress 
                            value={(promo.used_count / promo.usage_limit) * 100} 
                            className="h-2"
                          />
                        ) : (
                          <div className="h-2 w-full bg-primary/10 rounded-full" />
                        )}
                      </div>
                      <p className="text-sm">
                        {promo.usage_limit ? (
                          <span className="font-medium text-primary">
                            {promo.usage_limit - promo.used_count} uses remaining
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No usage limit</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      Schedule
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="grid grid-cols-[auto,1fr] gap-2 items-center">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Starts: <span className="font-medium">{formatDate(promo.start_date)}</span></span>
                      </div>
                      <div className="grid grid-cols-[auto,1fr] gap-2 items-center">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>Expires: <span className="font-medium">{formatDate(promo.end_date)}</span></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions */}
                {promo.terms_conditions && (
                  <>
                    <Separator className="my-4" />
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <Info className="h-4 w-4 text-primary" />
                        Terms & Conditions
                      </h3>
                      <p className="text-sm text-muted-foreground">{promo.terms_conditions}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <EditPromotionDialog 
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        promotion={editingPromotion}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the promotion "{deletingPromotion?.name}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
