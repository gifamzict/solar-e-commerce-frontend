import { useQuery } from "@tanstack/react-query";
import { listAvailablePreorders } from "@/services/customer-preorder";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getImageUrls } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function StorePreOrders() {
  const { data: preorders = [], isLoading, isError } = useQuery({
    queryKey: ['store-preorders-page'],
    queryFn: () => listAvailablePreorders(),
  });

  if (isLoading) return <div className="container mx-auto px-6 md:px-12 py-20 text-center text-muted-foreground">Loading pre-orders...</div>;
  if (isError) return <div className="container mx-auto px-6 md:px-12 py-20 text-center text-destructive">Failed to load pre-orders.</div>;

  if (!Array.isArray(preorders) || preorders.length === 0) {
    // Nothing to show when there are no pre-orders
    return <div className="container mx-auto px-6 md:px-12 py-24 text-center text-muted-foreground">No pre-orders available.</div>;
  }

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6 md:px-12">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm font-semibold">
            Pre-order
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">Available for Pre-order</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">Secure upcoming products with an upfront deposit.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {preorders.map((item: any) => {
            const image = getImageUrls(item?.images || item?.image_urls)?.[0] || '/placeholder.svg';
            const price = Number(item?.preorder_price ?? item?.pre_order_price ?? 0);
            const depositPct = item?.deposit_percentage ? Number(item.deposit_percentage) : (item?.deposit_amount && price ? Math.round((Number(item.deposit_amount) / price) * 100) : null);
            const expected = item?.expected_availability_date || item?.expected_availability || '-';

            return (
              <Link key={item.id} to={`/pre-orders/${item.id}`}>
                <Card className="h-full border-border hover:border-primary/50 transition-all duration-500 hover-lift group bg-card overflow-hidden hover:shadow-2xl">
                  <CardContent className="p-0">
                    <div className="relative h-48 overflow-hidden bg-muted">
                      <img src={image} alt={item?.name || item?.product_name || 'Pre-order'} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-secondary-dark/70 to-transparent group-hover:from-secondary-dark/50 transition-all duration-500" />
                      <div className="absolute top-4 right-4 px-3 py-1 bg-primary/90 backdrop-blur-sm rounded-xl text-primary-foreground text-xs shadow-lg">
                        Pre-order
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                        {item?.name || item?.product_name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-1">Expected: {expected}</p>
                      <p className="text-2xl font-bold text-primary mb-1">₦{price.toLocaleString()}</p>
                      {depositPct != null && (
                        <p className="text-xs text-muted-foreground">Deposit: {depositPct}%</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}