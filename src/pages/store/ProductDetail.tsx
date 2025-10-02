import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/contexts/CartContext";
import { ShoppingCart, Heart, Share2, Star, Minus, Plus, Check } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  const handleAddToCart = () => {
    addToCart({
      id: id || '1',
      name: product.name,
      price: product.price,
      image: product.images[0],
      category: 'Solar Panels'
    }, quantity);
  };

  const handleBuyNow = () => {
    addToCart({
      id: id || '1',
      name: product.name,
      price: product.price,
      image: product.images[0],
      category: 'Solar Panels'
    }, quantity);
    navigate('/checkout');
  };

  const product = {
    name: "300W Monocrystalline Solar Panel",
    price: 450000,
    rating: 4.8,
    reviews: 124,
    inStock: true,
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    description: "High-efficiency monocrystalline solar panel designed for residential and commercial applications. Features advanced cell technology for maximum power output and durability.",
    features: [
      "Peak Power: 300W",
      "Cell Type: Monocrystalline",
      "Efficiency: 21.5%",
      "Dimensions: 1640 x 992 x 35mm",
      "Weight: 18.5kg",
      "Frame: Anodized Aluminum Alloy",
      "Junction Box: IP67 Rated",
      "Connectors: MC4 Compatible"
    ],
    specifications: [
      { label: "Maximum Power (Pmax)", value: "300W" },
      { label: "Voltage at Pmax (Vmp)", value: "32.5V" },
      { label: "Current at Pmax (Imp)", value: "9.23A" },
      { label: "Open Circuit Voltage (Voc)", value: "39.4V" },
      { label: "Short Circuit Current (Isc)", value: "9.86A" },
      { label: "Module Efficiency", value: "21.5%" },
      { label: "Operating Temperature", value: "-40°C to +85°C" },
      { label: "Max System Voltage", value: "1000V DC" },
    ],
    warranty: {
      product: "10 years product warranty",
      performance: "25 years linear power output warranty",
      coverage: "Manufacturing defects and performance guarantee"
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
        {/* Images */}
        <div>
          <Card className="mb-4 overflow-hidden">
            <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <img 
                src={product.images[selectedImage]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </Card>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((img, index) => (
              <Card 
                key={index}
                className={`cursor-pointer overflow-hidden ${selectedImage === index ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedImage(index)}
              >
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10">
                  <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div>
          <Badge className="mb-2">{product.inStock ? "In Stock" : "Out of Stock"}</Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
          
          <div className="flex items-center gap-2 mb-6">
            <div className="flex">
              {[1,2,3,4,5].map((star) => (
                <Star 
                  key={star} 
                  className={`h-5 w-5 ${star <= Math.floor(product.rating) ? 'fill-primary text-primary' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="font-medium">{product.rating}</span>
            <span className="text-muted-foreground">({product.reviews} reviews)</span>
          </div>

          <div className="text-4xl font-bold text-primary mb-6">
            ₦{product.price.toLocaleString()}
          </div>

          <p className="text-muted-foreground mb-6">{product.description}</p>

          <div className="space-y-4 mb-8">
            <h3 className="font-semibold text-lg">Key Features:</h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {product.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quantity & Actions */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center border rounded-md">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button size="lg" className="flex-1 solar-glow hover-lift" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button size="lg" variant="outline">
                <Heart className="h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            <Button size="lg" variant="secondary" className="w-full" onClick={handleBuyNow}>
              Buy Now
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="specifications" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="warranty">Warranty</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({product.reviews})</TabsTrigger>
        </TabsList>

        <TabsContent value="specifications" className="mt-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Technical Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.specifications.map((spec, index) => (
                <div key={index} className="flex justify-between py-2 border-b">
                  <span className="font-medium">{spec.label}</span>
                  <span className="text-muted-foreground">{spec.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="warranty" className="mt-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Warranty Information</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Product Warranty</h4>
                <p className="text-muted-foreground">{product.warranty.product}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Performance Warranty</h4>
                <p className="text-muted-foreground">{product.warranty.performance}</p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Coverage</h4>
                <p className="text-muted-foreground">{product.warranty.coverage}</p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
            <p className="text-muted-foreground">Reviews coming soon...</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
