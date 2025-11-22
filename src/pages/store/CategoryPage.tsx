import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getImageUrls, ensureNairaSymbol } from "@/lib/utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://solar-e-commerce-backend-production.up.railway.app/api/';

// --- Type Definitions ---
interface Product {
  id: number;
  name: string;
  formatted_price: string;
  images: string[];
  in_stock: boolean;
  power?: string;
  warranty?: string;
  stock_status: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

// --- API Functions ---
const normalizeProductsResponse = (slug: string, data: any) => {
  if (!data) return { products: [], category: { name: slug, slug } };
  if (data.products && Array.isArray(data.products)) return { products: data.products, category: data.category ?? { name: slug, slug } };
  if (data.data && Array.isArray(data.data)) return { products: data.data, category: data.category ?? { name: slug, slug } };
  if (Array.isArray(data)) return { products: data, category: { name: slug, slug } };
  if (data.result && Array.isArray(data.result)) return { products: data.result, category: data.category ?? { name: slug, slug } };
  return data;
};

const fetchProductsByCategory = async (slug: string) => {
  if (!slug) return { products: [], category: null };

  const endpoints = [
    `${API_BASE_URL}/products/category/by-slug/${slug}`,
    `${API_BASE_URL}/categories/${slug}/products`,
    `${API_BASE_URL}/products/by-category/${slug}`,
    `${API_BASE_URL}/products?category_slug=${encodeURIComponent(slug)}`,
    `${API_BASE_URL}/products?category=${encodeURIComponent(slug)}`,
  ];

  let lastError: unknown = null;

  for (const url of endpoints) {
    try {
      const resp = await axios.get(url);
      const normalized = normalizeProductsResponse(slug, resp.data);
      if (normalized && Array.isArray(normalized.products)) {
        return normalized;
      }
    } catch (err: any) {
      lastError = err;
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        continue;
      }
      continue;
    }
  }

  if (axios.isAxiosError(lastError) && lastError?.response?.status === 404) {
    return { products: [], category: null };
  }

  console.error('Failed to fetch products by category. Last error:', lastError);
  throw lastError || new Error('Failed to fetch products by category');
};

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();

  // Fetch products for the current category slug
  const { data: productsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['productsByCategory', slug],
    queryFn: () => fetchProductsByCategory(slug!),
    enabled: !!slug, // Only run this query if slug is present
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const products = productsData?.products || [];
  const currentCategoryName = productsData?.category?.name || slug;

  if (isError) {
    return (
      <div className= "container mx-auto px-4 py-8" >
      <Alert variant="destructive" className = "mb-4" >
        <AlertTitle>Error </AlertTitle>
        <AlertDescription>
            Could not load products for this category.Please try again later.
          </AlertDescription>
      </Alert>
      < Button onClick = {() => refetch()}> Retry </Button>
        </div>
    );
  }

if (!isLoading && !productsData?.category) {
  return (
    <div className= "container mx-auto px-4 py-8 text-center" >
    <h1 className="text-3xl font-bold mb-2" > Category Not Found </h1>
      < p className = "text-muted-foreground mb-6" >
        We couldn't find a category with the slug "{slug}".
          </p>
          < Button asChild >
            <Link to="/all-products" > View All Products </Link>
              </Button>
              </div>
    );
}

return (
  <div className= "container mx-auto px-4 py-8 animate-fade-in" >
  <div className="mb-8" >
    <h1 className="text-4xl font-bold mb-2" >
      { isLoading?<Skeleton className = "h-12 w-1/3" /> : currentCategoryName}
</h1>
  < p className = "text-muted-foreground" >
    { isLoading?<Skeleton className = "h-6 w-1/2" /> : `Browsing products in the ${currentCategoryName} category.`}
</p>
  </div>

{
  isLoading ? (
    <div className= "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" >
    {
      Array.from({ length: 8 }).map((_, i) => (
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
      ) : products.length === 0 ? (
    <div className= "text-center col-span-full py-16" >
    <h2 className="text-2xl font-semibold mb-2" > No Products Found </h2>
      < p className = "text-muted-foreground" >
        There are currently no products available in this category.
          </p>
          </div>
      ) : (
    <div className= "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" >
    {
      products.map((product: Product) => (
        <Card key= { product.id } className = "overflow-hidden hover-lift cursor-pointer group" >
        <div className="relative h-64 bg-gradient-to-br from-primary/10 to-accent/10" >
      <Link to={`/product/${product.id}`} >
    <img 
                    src={ getImageUrls(product.images)[0] }
  alt = { product.name }
  className = "w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
  onError = {(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }
}
                  />
  </Link>
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
      <h3 className="font-semibold mb-2 hover:text-primary transition-colors truncate" >
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
      )}
</div>
  );
};

export default CategoryPage;