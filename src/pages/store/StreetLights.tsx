import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Star } from "lucide-react";

export default function StreetLights() {
  const [priceRange, setPriceRange] = useState([0, 500000]);

  const products = [
    {
      id: 11,
      name: "100W All-in-One Solar Street Light",
      price: 125000,
      lumens: "10,000 lm",
      batteryCapacity: "50,000mAh",
      workingTime: "12-14 hours",
      rating: 4.7,
      reviews: 67,
      image: "/placeholder.svg",
      inStock: true
    },
    {
      id: 12,
      name: "200W Industrial Solar Street Light",
      price: 285000,
      lumens: "20,000 lm",
      batteryCapacity: "100,000mAh",
      workingTime: "14-16 hours",
      rating: 4.9,
      reviews: 43,
      image: "/placeholder.svg",
      inStock: true
    },
    {
      id: 13,
      name: "60W Residential Solar Street Light",
      price: 85000,
      lumens: "6,000 lm",
      batteryCapacity: "30,000mAh",
      workingTime: "10-12 hours",
      rating: 4.6,
      reviews: 89,
      image: "/placeholder.svg",
      inStock: true
    },
    {
      id: 14,
      name: "150W Commercial Solar Street Light",
      price: 195000,
      lumens: "15,000 lm",
      batteryCapacity: "75,000mAh",
      workingTime: "12-14 hours",
      rating: 4.8,
      reviews: 52,
      image: "/placeholder.svg",
      inStock: true
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Solar Street Lights</h1>
        <p className="text-muted-foreground">Energy-efficient solar street lighting for roads, parks, and compounds</p>
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
                  max={500000}
                  step={25000}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>₦{priceRange[0].toLocaleString()}</span>
                  <span>₦{priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              {/* Lumen Output */}
              <div className="mb-6">
                <Label className="mb-3 block">Lumen Output</Label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox id="lumen-low" />
                    <label htmlFor="lumen-low" className="ml-2 text-sm cursor-pointer">
                      Below 8,000 lm
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="lumen-mid" />
                    <label htmlFor="lumen-mid" className="ml-2 text-sm cursor-pointer">
                      8,000 - 15,000 lm
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="lumen-high" />
                    <label htmlFor="lumen-high" className="ml-2 text-sm cursor-pointer">
                      Above 15,000 lm
                    </label>
                  </div>
                </div>
              </div>

              {/* Application */}
              <div className="mb-6">
                <Label className="mb-3 block">Application</Label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox id="residential" />
                    <label htmlFor="residential" className="ml-2 text-sm cursor-pointer">
                      Residential
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="commercial" />
                    <label htmlFor="commercial" className="ml-2 text-sm cursor-pointer">
                      Commercial
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="industrial" />
                    <label htmlFor="industrial" className="ml-2 text-sm cursor-pointer">
                      Industrial
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
              <option>Brightness: High to Low</option>
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
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    {product.lumens}
                  </div>
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
                      <span className="text-muted-foreground">Battery:</span>
                      <span className="font-medium">{product.batteryCapacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Working Time:</span>
                      <span className="font-medium">{product.workingTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">
                      ₦{product.price.toLocaleString()}
                    </span>
                    <Button size="sm" className="gap-1">
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
