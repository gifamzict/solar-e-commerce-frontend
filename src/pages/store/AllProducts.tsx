import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Star, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getImageUrls, ensureNairaSymbol } from "@/lib/utils";

// --- Helpers to normalize and fetch products robustly ---
const normalizeAllProductsResponse = (data: any) => {
  // Accept a wide range of backend response shapes
  if (!data) return [] as any[];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.items)) return data.items;
  // Handle nested pagination shapes e.g. { data: { data: [...] } }
  if (Array.isArray(data?.data?.data)) return data.data.data;
  return [] as any[];
};

const fetchAllProducts = async (API_BASE_URL: string) => {
  const base = (API_BASE_URL || '').replace(/\/+$/, '');
  const endpoints = [
    `${base}/products`,
    `${base}/products/all`,
    `${base}/store/products`,
    `${base}/products?limit=1000`,
  ];

  let lastError: unknown = null;

  for (const url of endpoints) {
    try {
      const resp = await axios.get(url);
      const products = normalizeAllProductsResponse(resp.data);
      if (Array.isArray(products)) {
        return { products };
      }
    } catch (err: any) {
      lastError = err;
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        continue;
      }
      continue;
    }
  }

  if (lastError) {
    // As a final attempt, return empty array instead of throwing so UI can show friendly state
    return { products: [] };
  }

  return { products: [] };
};

// Helper: extract a numeric price from various shapes
const getNumericPrice = (product: any): number | null => {
  const raw = typeof product?.price === 'number'
    ? product.price
    : product?.price
      ? Number(String(product.price).replace(/[^\d.]/g, ''))
      : product?.formatted_price
        ? Number(String(product.formatted_price).replace(/[^\d.]/g, ''))
        : null;
  if (raw == null || Number.isNaN(raw)) return null;
  return Math.round(Number(raw));
};

export default function AllProducts() {
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://solar-e-commerce-backend-production.up.railway.app/api/';

  // Fetch all products (robust to various API shapes)
  const { data: productsResponse, isLoading } = useQuery({
    queryKey: ['all-products'],
    queryFn: async () => fetchAllProducts(API_BASE_URL),
  });

  // Extract products array from the normalized response
  const products = productsResponse?.products || [];

  // Compute dynamic max from product prices
  const numericPrices = useMemo(() => (
    Array.isArray(products)
      ? products
        .map(getNumericPrice)
        .filter((n): n is number => typeof n === 'number' && !Number.isNaN(n))
      : []
  ), [products]);

  const dynamicMax = useMemo(() => {
    if (!numericPrices.length) return 500000; // fallback default
    return Math.max(...numericPrices);
  }, [numericPrices]);

  // Initialize/clamp price range when products change
  const DEFAULT_UPPER = 500000;
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!products.length) return;
    setPriceRange(prev => {
      const wasDefault = prev[0] === 0 && prev[1] === DEFAULT_UPPER;
      if (!initializedRef.current || wasDefault) {
        initializedRef.current = true;
        return [0, dynamicMax];
      }
      const upper = Math.min(prev[1], dynamicMax);
      const lower = Math.min(prev[0], upper);
      return [lower, upper];
    });
  }, [products.length, dynamicMax]);

  const isDefaultRange = priceRange[0] === 0 && priceRange[1] === dynamicMax;

  // Apply price filtering
  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    return products.filter((p: any) => {
      const price = getNumericPrice(p);
      if (!isDefaultRange && (price == null || Number.isNaN(price))) return false;
      if (price == null) return true; // include unknown-priced when range is default
      return price >= priceRange[0] && price <= priceRange[1];
    });
  }, [products, priceRange, isDefaultRange]);

  // Fetch categories for filtering
  const { data: categoriesResponse } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const response = await axios.get(`${API_BASE_URL.replace(/\/+$/, '')}/categories`);
        return response.data;
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        return { data: [] }; // Return a default structure on error
      }
    }
  });

  const categories = categoriesResponse?.data || [];

  return (
    <div className= "container mx-auto px-4 py-8 animate-fade-in" >
    <div className="mb-8" >
      <h1 className="text-4xl font-bold mb-2" > All Products </h1>
        < p className = "text-muted-foreground" > Browse our complete collection of solar products </p>
          </div>

          < div className = "grid grid-cols-1 lg:grid-cols-4 gap-8" >
            {/* Filters Sidebar */ }
            < aside className = "lg:col-span-1" >
              <Card className="sticky top-20" >
                <CardContent className="p-6" >
                  <h3 className="font-semibold text-lg mb-4" > Filters </h3>

  {/* Price Range */ }
  <div className="mb-6" >
    <Label className="mb-3 block" > Price Range </Label>
      < Slider
  value = { priceRange }
  onValueChange = { setPriceRange }
  max = { dynamicMax }
  step = { Math.max(1000, Math.round(dynamicMax / 40)) }
  className = "mb-2"
    />
    <div className="flex justify-between text-sm text-muted-foreground" >
      <span>₦{ priceRange[0].toLocaleString() } </span>
        <span>₦{ priceRange[1].toLocaleString() } </span>
          </div>
          </div>

  {/* Categories */ }
  <div className="mb-6" >
    <Label className="mb-3 block" > Categories </Label>
      < div className = "space-y-2" >
        {
          categories.map((category: any) => (
            <div key= { category.id } className = "flex items-center" >
            <Checkbox id={`category-${category.id}`} />
        <label
                        htmlFor={ `category-${category.id}` }
  className = "ml-2 text-sm cursor-pointer"
    >
    { category.name }
    </label>
    </div>
                  ))
}
</div>
  </div>

  < Button variant = "outline" className = "w-full" onClick = {() => setPriceRange([0, dynamicMax])}> Reset Filters </Button>
    </CardContent>
    </Card>
    </aside>

{/* Products Grid */ }
<div className="lg:col-span-3" >
{
  isLoading?(
            <div className = "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" >
    {
      Array.from({ length: 6 }).map((_, i) => (
        <Card key= { i } >
        <Skeleton className="h-64 w-full" />
      <CardContent className="p-4" >
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-4" />
      <div className="flex justify-between items-center" >
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-10 w-1/4" />
      </div>
      </CardContent>
      </Card>
      ))
}
  </div>
          ) : filteredProducts.length === 0 ? (
  <div className= "text-center col-span-full py-16" >
  <h2 className="text-2xl font-semibold mb-2" > No Products Found </h2>
    < p className = "text-muted-foreground" >
      We couldn't find any products matching your criteria.
        </p>
        </div>
          ) : (
  <>
  <div className= "flex justify-between items-center mb-6" >
  <p className="text-muted-foreground" > { filteredProducts.length } products found </p>
    < select className = "border rounded-md px-3 py-2 text-sm" >
      <option>Sort by: Featured </option>
        < option > Price: Low to High </option>
          < option > Price: High to Low </option>
            < option > Newest First </option>
              </select>
              </div>

              < div className = "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" >
              {
                filteredProducts.map((product: any) => (
                  <Card key= { product.id } className = "overflow-hidden hover-lift cursor-pointer group" >
                  <div className="relative h-64 bg-gradient-to-br from-primary/10 to-accent/10" >
                <img 
                        src={ getImageUrls(product.images || product.image)[0]
              }
alt = { product.name }
className = "w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
onError = {(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                      />
{
  product.stock_status === 'Out of Stock' && (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center" >
      <span className="text-white font-semibold" > Out of Stock </span>
        </div>
                      )
}
{
  product.power && (
    <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold" >
      { product.power }
      </div>
                      )
}
</div>
  < CardContent className = "p-4" >
    <Link to={ `/product/${product.id}` }>
      <h3 className="font-semibold mb-2 hover:text-primary transition-colors" >
        { product.name }
        </h3>
        </Link>
{
  product.warranty && (
    <p className="text-sm text-muted-foreground mb-2" >
      Warranty: { product.warranty }
  </p>
                      )
}
<div className="flex items-center justify-between" >
  <span className="text-2xl font-bold text-primary" >
    { ensureNairaSymbol(product.formatted_price) }
    </span>
    < Link to = {`/product/${product.id}`}>
      <Button size="sm" className = "gap-1" >
        View Details
          < ArrowRight className = "h-4 w-4" />
            </Button>
            </Link>
            </div>
            </CardContent>
            </Card>
                ))}
</div>
  </>
          )}
</div>
  </div>
  </div>
  );
}