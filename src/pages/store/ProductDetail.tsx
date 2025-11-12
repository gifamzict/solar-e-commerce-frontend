import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { ShoppingCart, Heart, Share2, Star, Minus, Plus, Check } from "lucide-react";
import { getImageUrl, getImageUrls, formatNaira, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from "@/lib/utils";
import { useStoreAuth } from "@/contexts/StoreAuthContext";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToCart } = useCart();
  const { isAuthenticated } = useStoreAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Define the base URL from environment variables
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://web-production-d1120.up.railway.app/api') + '/';

  // API function to fetch product details
  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}products/${id}`);
      return response.data.product || response.data.data || response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || error.response.statusText);
      }
      throw new Error("Network error or failed to connect.");
    }
  };

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: fetchProduct,
    enabled: !!id,
  });

  // Get properly formatted image URLs
  const productImages = getImageUrls(product?.images || product?.image);
  const videoEmbed = getYouTubeEmbedUrl(product?.video_url);

  type GalleryItem = { type: 'video'; src: string } | { type: 'image'; src: string };
  const gallery: GalleryItem[] = [
    ...(videoEmbed ? [{ type: 'video', src: videoEmbed }] as GalleryItem[] : []),
    ...productImages.map((src) => ({ type: 'image', src }) as GalleryItem),
  ];

  const current = gallery[selectedImage];
  const cartImage = productImages[0] || '/placeholder.svg';

  const handleAddToCart = () => {
    if (!product) return;
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: location.pathname + location.search } });
      return;
    }
    addToCart({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      image: cartImage,
      category: product.category?.name || 'Product'
    }, quantity);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: location.pathname + location.search } });
      return;
    }
    addToCart({
      id: product.id.toString(),
      name: product.name,
      price: product.price,
      image: cartImage,
      category: product.category?.name || 'Product'
    }, quantity);
    navigate('/checkout');
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64" > Loading product...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500" > Error loading product: { error.message } </div>;
  }

  if (!product) {
    return <div className="text-center text-red-500" > Product not found </div>;
  }

  return (
    <div className= "container mx-auto px-4 py-8 animate-fade-in" >
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12" >
      {/* Media */ }
      < div >
      <Card className="mb-4 overflow-hidden" >
        <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center" >
          { current?.type === 'video' ? (
            <iframe
                  className= "w-full h-full"
                  src = {`${current.src}?rel=0`
}
title = { product.name }
allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
allowFullScreen
  />
              ) : (
  <img
                  src= { current?.src }
alt = { product.name }
className = "w-full h-full object-cover"
onError = {(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                />
              )}
</div>
  </Card>
{
  gallery.length > 1 && (
    <div className="grid grid-cols-4 gap-2" >
    {
      gallery.map((g, index) => (
        <Card
                  key= { index }
                  className = {`cursor-pointer overflow-hidden ${selectedImage === index ? 'ring-2 ring-primary' : ''}`}
  onClick = {() => setSelectedImage(index)
}
                >
  <div className="aspect-square relative bg-gradient-to-br from-primary/10 to-accent/10" >
  {
    g.type === 'video' ? (
      <img
                        src= { getYouTubeThumbnailUrl(product?.video_url, 'hq') }
                        alt={`Video`
  }
className = "w-full h-full object-cover"
onError = {(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                      />
                    ) : (
  <img 
                        src= { g.src }
alt = {`View ${index + 1}`}
className = "w-full h-full object-cover"
onError = {(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }}
                      />
                    )}
{
  g.type === 'video' && (
    <div className="absolute inset-0 flex items-center justify-center bg-black/20" >
      <div className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center" >
        <svg viewBox="0 0 24 24" className = "w-4 h-4 text-black fill-current" > <path d="M8 5v14l11-7z" /> </svg>
          </div>
          </div>
                    )
}
</div>
  </Card>
              ))}
</div>
          )}
</div>

{/* Product Info */ }
<div>
  <Badge className="mb-2" > { product.stock > 0 ? "In Stock" : "Out of Stock" } </Badge>
    < h1 className = "text-3xl md:text-4xl font-bold mb-4" > { product.name } </h1>

      < div className = "text-4xl font-bold text-primary mb-6" >
        { formatNaira(product.price) }
        </div>

        < p className = "text-muted-foreground mb-6" > { product.description } </p>

          < div className = "space-y-4 mb-8" >
            <h3 className="font-semibold text-lg" > Key Features: </h3>
              < ul className = "grid grid-cols-1 md:grid-cols-2 gap-2" >
              {
                product.power && (
                  <li className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      < span > Power: { product.power } </span>
                        </li>
              )}
{
  product.warranty && (
    <li className="flex items-start gap-2 text-sm" >
      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
        <span>Warranty: { product.warranty } </span>
          </li>
              )
}
{
  product.specifications && Array.isArray(product.specifications) && product.specifications.slice(0, 4).map((spec, index) => (
    <li key= { index } className = "flex items-start gap-2 text-sm" >
    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
    <span>{ spec } </span>
  </li>
  ))
}
</ul>
  </div>

{/* Quantity & Actions */ }
<div className="space-y-4" >
  <div className="flex items-center gap-4" >
    <span className="font-medium" > Quantity: </span>
      < div className = "flex items-center border rounded-md" >
        <Button 
                  variant="ghost"
size = "icon"
onClick = {() => setQuantity(Math.max(1, quantity - 1))}
                >
  <Minus className="h-4 w-4" />
    </Button>
    < span className = "w-12 text-center font-medium" > { quantity } </span>
      < Button
variant = "ghost"
size = "icon"
onClick = {() => setQuantity(quantity + 1)}
                >
  <Plus className="h-4 w-4" />
    </Button>
    </div>
    </div>

    < div className = "flex gap-3" >
      <Button size="lg" className = "flex-1 solar-glow hover-lift" onClick = { handleAddToCart } >
        <ShoppingCart className="mr-2 h-5 w-5" />
          Add to Cart
            </Button>

            </div>

            < Button size = "lg" variant = "secondary" className = "w-full" onClick = { handleBuyNow } >
              Buy Now
                </Button>
                </div>
                </div>
                </div>

{/* Tabs */ }
<Tabs defaultValue="specifications" className = "w-full" >
  <TabsList className="w-full justify-start" >
    <TabsTrigger value="specifications" > Specifications </TabsTrigger>
      < TabsTrigger value = "warranty" > Warranty </TabsTrigger>
        < TabsTrigger value = "reviews" > Reviews </TabsTrigger>
          </TabsList>

          < TabsContent value = "specifications" className = "mt-6" >
            <Card className="p-6" >
              <h3 className="text-xl font-semibold mb-4" > Technical Specifications </h3>
{
  product.specifications && Array.isArray(product.specifications) && product.specifications.length > 0 ? (
    <div className= "grid grid-cols-1 md:grid-cols-2 gap-4" >
    {
      product.specifications.map((spec, index) => (
        <div key= { index } className = "flex justify-between py-2 border-b" >
        <span className="font-medium" > { spec } </span>
      </div>
      ))
    }
    </div>
            ) : (
    <p className= "text-muted-foreground" > No specifications available.</p>
            )
}
</Card>
  </TabsContent>

  < TabsContent value = "warranty" className = "mt-6" >
    <Card className="p-6" >
      <h3 className="text-xl font-semibold mb-4" > Warranty Information </h3>
{
  product.warranty ? (
    <div className= "space-y-4" >
    <div>
    <h4 className="font-medium mb-2" > Warranty </h4>
      < p className = "text-muted-foreground" > { product.warranty } </p>
        </div>
        </div>
            ) : (
    <p className= "text-muted-foreground" > No warranty information available.</p>
            )
}
</Card>
  </TabsContent>

  < TabsContent value = "reviews" className = "mt-6" >
    <Card className="p-6" >
      <h3 className="text-xl font-semibold mb-4" > Customer Reviews </h3>
        </Card>
        </TabsContent>
        </Tabs>
        </div>
  );
}