import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Star } from "lucide-react";

export default function SolarPanels() {
  const [priceRange, setPriceRange] = useState([0, 2000000]);

  const products = [
    {
      id: 1,
      name: "300W Monocrystalline Solar Panel",
      price: 450000,
      power: "300W",
      efficiency: "21%",
      warranty: "25 years",
      rating: 4.8,
      reviews: 124,
      image: "/placeholder.svg",
      inStock: true
    },
    {
      id: 2,
      name: "500W Bifacial Solar Panel",
      price: 680000,
      power: "500W",
      efficiency: "22%",
      warranty: "25 years",
      rating: 4.9,
      reviews: 89,
      image: "/placeholder.svg",
      inStock: true
    },
    {
      id: 3,
      name: "150W Portable Solar Panel",
      price: 185000,
      power: "150W",
      efficiency: "19%",
      warranty: "10 years",
      rating: 4.6,
      reviews: 56,
      image: "/placeholder.svg",
      inStock: true
    },
    {
      id: 4,
      name: "400W Polycrystalline Panel",
      price: 520000,
      power: "400W",
      efficiency: "20%",
      warranty: "20 years",
      rating: 4.7,
      reviews: 98,
      image: "/placeholder.svg",
      inStock: false
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Solar Panels</h1>
        <p className="text-muted-foreground">High-efficiency solar panels for residential and commercial use</p>
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
                  max={2000000}
                  step={50000}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>₦{priceRange[0].toLocaleString()}</span>
                  <span>₦{priceRange[1].toLocaleString()}</span>
                </div>
              </div>

              {/* Power Output */}
              <div className="mb-6">
                <Label className="mb-3 block">Power Output</Label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox id="power-150" />
                    <label htmlFor="power-150" className="ml-2 text-sm cursor-pointer">
                      150W - 200W
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="power-300" />
                    <label htmlFor="power-300" className="ml-2 text-sm cursor-pointer">
                      300W - 400W
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="power-500" />
                    <label htmlFor="power-500" className="ml-2 text-sm cursor-pointer">
                      500W+
                    </label>
                  </div>
                </div>
              </div>

              {/* Panel Type */}
              <div className="mb-6">
                <Label className="mb-3 block">Panel Type</Label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Checkbox id="mono" />
                    <label htmlFor="mono" className="ml-2 text-sm cursor-pointer">
                      Monocrystalline
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="poly" />
                    <label htmlFor="poly" className="ml-2 text-sm cursor-pointer">
                      Polycrystalline
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Checkbox id="bifacial" />
                    <label htmlFor="bifacial" className="ml-2 text-sm cursor-pointer">
                      Bifacial
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
              <option>Highest Rated</option>
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
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    {product.power}
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
                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div>
                      <span className="text-muted-foreground">Efficiency:</span>
                      <span className="ml-1 font-medium">{product.efficiency}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Warranty:</span>
                      <span className="ml-1 font-medium">{product.warranty}</span>
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
