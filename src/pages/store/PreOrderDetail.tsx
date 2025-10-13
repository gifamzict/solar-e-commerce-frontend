import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAvailablePreorder } from "@/services/customer-preorder";
import { getImageUrls } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Check } from "lucide-react";
import { useStoreAuth } from "@/contexts/StoreAuthContext";
import { useLocation } from "react-router-dom";

export default function PreOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { isAuthenticated } = useStoreAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: item, isLoading, isError, error } = useQuery({
    queryKey: ['preorder', id],
    queryFn: () => getAvailablePreorder(String(id)),
    enabled: !!id,
  });

  const images = getImageUrls(item?.images || item?.image_urls);
  const price = Number(item?.preorder_price ?? 0);
  const depositPct = item?.deposit_percentage != null ? Number(item.deposit_percentage) : null;
  const depositAmt = item?.deposit_amount != null ? Number(item.deposit_amount) : (depositPct != null && price ? Math.round((depositPct / 100) * price) : null);
  const expected = item?.expected_availability_date || '-';

  const handlePreorderNow = () => {
    if (!item) return;
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: location.pathname + location.search } });
      return;
    }
    const payAmount = depositAmt ?? price;
    addToCart({
      id: `preorder-${item.id}`,
      name: item.name || item.product_name || 'Pre-order',
      price: payAmount,
      image: images[0] || '/placeholder.svg',
      category: 'Pre-order',
      meta: {
        preOrderId: item.id,
        unitPrice: price,
        depositPerUnit: depositAmt ?? null,
      }
    }, quantity);
    navigate('/checkout');
  };

  if (isLoading) return <div className="flex justify-center items-center h-64">Loading pre-order...</div>;
  if (isError) return <div className="text-center text-red-500">Error loading pre-order: {(error as any)?.message || 'Failed'}</div>;
  if (!item) return <div className="text-center text-red-500">Pre-order not found</div>;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        {/* Images */}
        <div>
          <Card className="mb-4 overflow-hidden">
            <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <img
                src={images[selectedImage]}
                alt={item.name || item.product_name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
              />
            </div>
          </Card>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer overflow-hidden ${selectedImage === index ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10">
                    <img 
                      src={img} 
                      alt={`View ${index + 1}`} 
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <Badge className="mb-2">Pre-order</Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{item.name || item.product_name}</h1>

          <div className="space-y-2 mb-4">
            <div className="text-3xl font-bold text-primary">₦{price.toLocaleString()}</div>
            {depositAmt != null && (
              <div className="text-sm text-muted-foreground">Deposit: ₦{depositAmt.toLocaleString()} {depositPct != null ? `(${depositPct}%)` : ''}</div>
            )}
            <div className="text-sm text-muted-foreground">Expected availability: {expected}</div>
            {item?.category?.name && (
              <div className="text-sm text-muted-foreground">Category: {item.category.name}</div>
            )}
          </div>

          {item?.description && (
            <p className="text-muted-foreground mb-6">{item.description}</p>
          )}

          <div className="space-y-4 mb-8">
            <h3 className="font-semibold text-lg">Key Details</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {item?.power_output && (
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Power Output: {item.power_output}</span>
                </li>
              )}
              {item?.warranty_period && (
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Warranty: {item.warranty_period}</span>
                </li>
              )}
              {item?.specifications && (
                <li className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>Specifications: {String(item.specifications)}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Quantity & CTA */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center border rounded-md">
                <Button variant="ghost" size="icon" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button variant="ghost" size="icon" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button size="lg" className="w-full" onClick={handlePreorderNow}>
              {depositAmt != null ? 'Pre-order Now (Pay Deposit)' : 'Pre-order Now'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}