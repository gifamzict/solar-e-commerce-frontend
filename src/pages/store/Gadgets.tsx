import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Star } from "lucide-react";

export default function Gadgets() {
  const [priceRange, setPriceRange] = useState([0, 200000]);

  const products = [
    {
      id: 21,
      name: "50W Portable Solar Generator",
      price: 145000,
      capacity: "50,000mAh",
      outputs: "USB, AC, DC",
      rating: 4.8,
      reviews: 156,
      image: "/placeholder.svg",
      inStock: true
    },
    {
      id: 22,
      name: "Solar Power Bank 20,000mAh",
      price: 18500,
      capacity: "20,000mAh",
      outputs: "USB-A, USB-C",
      rating: 4.5,
      reviews: 234,
      image: "/placeholder.svg",
      inStock: true
    },
    {
      id: 23,
      name: "12\" Solar Rechargeable Fan",
      price: 32000,
      capacity: "12,000mAh",
      outputs: "LED Light Included",
      rating: 4.6,
      reviews: 178,
      image: "/placeholder.svg",
      inStock: true
    },
    {
      id: 24,
      name: "Solar LED Camping Lantern",
      price: 15000,
      capacity: "5,000mAh",
      outputs: "USB Charging Port",
      rating: 4.7,
      reviews: 289,
      image: "/placeholder.svg",
      inStock: true
    },
    {
      id: 25,
      name: "Solar Water Pump Kit",
      price: 95000,
      capacity: "N/A",
      outputs: "1000L/hr flow",
      rating: 4.4,
      reviews: 67,
      image: "/placeholder.svg",
      inStock: true
    },
    {
      id: 26,
      name: "Foldable Solar Charger 100W",
      price: 125000,
      capacity: "100W Output",
      outputs: "Multiple ports",
      rating: 4.9,
      reviews: 92,
      image: "/placeholder.svg",
      inStock: false
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Solar Gadgets</h1>
        <p className="text-muted-foreground">Portable solar-powered devices for everyday use</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1">
          <Card className="sticky top-20">
            <CardContent className="p-6">
              <h3 className="font-semibold text-lg mb-4">Filters</h3>

              {/* Price Range */}
              <div className="mb-6">
                <Label className="mb-3 block">Price Range</Label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={200000}
                  step={10000}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>₦{priceRange[0].toLocaleString()}</span>
                  <span>₦{priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              {/* Category */}
              <div className="mb-6">
                <Label className="mb-3 block">Category</Label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox id="power-banks" />
                    <label htmlFor="power-banks" className="ml-2 text-sm cursor-pointer">
                      Power Banks
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="generators" />
                    <label htmlFor="generators" className="ml-2 text-sm cursor-pointer">
                      Generators
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="fans" />
                    <label htmlFor="fans" className="ml-2 text-sm cursor-pointer">
                      Fans & Cooling
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="lighting" />
                    <label htmlFor="lighting" className="ml-2 text-sm cursor-pointer">
                      Lighting
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="other" />
                    <label htmlFor="other" className="ml-2 text-sm cursor-pointer">
                      Other Gadgets
                    </label>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full">Reset Filters</Button>
            </CardContent>
          </Card>
        </aside>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <p className="text-muted-foreground">{products.length} products found</p>
            <select className="border rounded-md px-3 py-2 text-sm">
              <option>Sort by: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest First</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden hover-lift cursor-pointer group">
                <div className="relative h-64 bg-gradient-to-br from-primary/10 to-accent/10">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {!product.inStock && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-semibold">Out of Stock</span>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-semibold mb-2 hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <span className="text-sm font-medium">{product.rating}</span>
                    <span className="text-sm text-muted-foreground">({product.reviews})</span>
                  </div>
                  <div className="space-y-1 text-xs mb-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Capacity:</span>
                      <span className="font-medium">{product.capacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Outputs:</span>
                      <span className="font-medium">{product.outputs}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      ₦{product.price.toLocaleString()}
                    </span>
                    <Button 
                      size="sm" 
                      disabled={!product.inStock}
                      className="gap-1"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
