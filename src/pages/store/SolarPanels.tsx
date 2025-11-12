import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ShoppingCart, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getImageUrl, getImageUrls } from "@/lib/utils";

// Define filter interfaces
interface PowerFilter {
  range: string;
  min: number;
  max: number;
}

interface PanelTypeFilter {
  id: string;
  label: string;
}

const powerFilters: PowerFilter[] = [
  { range: "150W - 200W", min: 150, max: 200 },
  { range: "300W - 400W", min: 300, max: 400 },
  { range: "500W+", min: 500, max: Infinity },
];

const panelTypes: PanelTypeFilter[] = [
  { id: "mono", label: "Monocrystalline" },
  { id: "poly", label: "Polycrystalline" },
  { id: "bifacial", label: "Bifacial" },
];

export default function SolarPanels() {
  const { slug } = useParams<{ slug: string }>();
  const [priceRange, setPriceRange] = useState([0, 2000000]);
  const [selectedPowerRanges, setSelectedPowerRanges] = useState<string[]>([]);
  const [selectedPanelTypes, setSelectedPanelTypes] = useState<string[]>([]);

  // Define the base URL from environment variables
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://web-production-d1120.up.railway.app/api/';

  // API function to fetch products
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}products`);
      const data = response.data.products || response.data.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Failed to fetch products:", error);
      return [];
    }
  };

  // API function to fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}categories`);
      const data = response.data.categories || response.data.data || response.data;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      return [];
    }
  };

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data: allProducts, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  // Filter products based on all criteria
  const filteredProducts = allProducts?.filter((product: any) => {
    // Category filter
    const categoryMatch = !slug || product.category?.slug === slug;

    // Price range filter
    const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];

    // Power output filter
    const powerMatch = selectedPowerRanges.length === 0 || selectedPowerRanges.some(range => {
      const filter = powerFilters.find(f => f.range === range);
      if (!filter) return false;
      const power = parseInt(product.power) || 0;
      return power >= filter.min && power <= filter.max;
    });

    // Panel type filter
    const typeMatch = selectedPanelTypes.length === 0 ||
      selectedPanelTypes.some(type =>
        product.panel_type?.toLowerCase().includes(type.toLowerCase())
      );

    return categoryMatch && priceMatch && powerMatch && typeMatch;
  }) || [];

  // Reset all filters
  const resetFilters = () => {
    setPriceRange([0, 2000000]);
    setSelectedPowerRanges([]);
    setSelectedPanelTypes([]);
  };

  // Get category name for title
  const categoryName = categories?.find((cat: any) => cat.slug === slug)?.name || 'Products';

  // Toggle power range selection
  const togglePowerRange = (range: string) => {
    setSelectedPowerRanges(prev =>
      prev.includes(range)
        ? prev.filter(r => r !== range)
        : [...prev, range]
    );
  };

  // Toggle panel type selection
  const togglePanelType = (type: string) => {
    setSelectedPanelTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <div className= "container mx-auto px-4 py-8 animate-fade-in" >
    <div className="mb-8" >
      <h1 className="text-4xl font-bold mb-2" > { categoryName } </h1>
        < p className = "text-muted-foreground" >
          { slug? `Explore our ${categoryName.toLowerCase()} collection` : 'Browse all our solar products'
}
</p>
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
max = { 2000000}
step = { 50000}
className = "mb-2"
  />
  <div className="flex justify-between text-sm text-muted-foreground" >
    <span>₦{ priceRange[0].toLocaleString() } </span>
      <span>₦{ priceRange[1].toLocaleString() } </span>
        </div>
        </div>

{/* Power Output */ }
<div className="mb-6" >
  <Label className="mb-3 block" > Power Output </Label>
    < div className = "space-y-2" >
    {
      powerFilters.map(({ range }) => (
        <div key= { range } className = "flex items-center" >
        <Checkbox 
                        id={`power-${range}`}
checked = { selectedPowerRanges.includes(range) }
onCheckedChange = {() => togglePowerRange(range)}
                      />
  < label
htmlFor = {`power-${range}`}
className = "ml-2 text-sm cursor-pointer"
  >
  { range }
  </label>
  </div>
                  ))}
</div>
  </div>

{/* Panel Type */ }
<div className="mb-6" >
  <Label className="mb-3 block" > Panel Type </Label>
    < div className = "space-y-2" >
      {
        panelTypes.map(({ id, label }) => (
          <div key= { id } className = "flex items-center" >
          <Checkbox 
                        id={ id }
                        checked = { selectedPanelTypes.includes(id) }
                        onCheckedChange = {() => togglePanelType(id)}
      />
      <label 
                        htmlFor={ id }
className = "ml-2 text-sm cursor-pointer"
  >
  { label }
  </label>
  </div>
                  ))}
</div>
  </div>

  < Button
variant = "outline"
className = "w-full"
onClick = { resetFilters }
  >
  Reset Filters
    </Button>
    </CardContent>
    </Card>
    </aside>

{/* Products Grid */ }
<div className="lg:col-span-3" >
  <div className="flex justify-between items-center mb-6" >
    <p className="text-muted-foreground" > { filteredProducts.length } products found </p>
      < select className = "border rounded-md px-3 py-2 text-sm" >
        <option>Sort by: Featured </option>
          < option > Price: Low to High </option>
            < option > Price: High to Low </option>
              < option > Highest Rated </option>
                </select>
                </div>

                < div className = "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" >
                {
                  filteredProducts.map((product) => (
                    <Card key= { product.id } className = "overflow-hidden hover-lift cursor-pointer group" >
                    <div className="relative h-64 bg-gradient-to-br from-primary/10 to-accent/10" >
                  <img 
                    src={ getImageUrls(product.images || product.image)[0]
                }
alt = { product.name }
className = "w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
onError = {(e) => {
  const target = e.target as HTMLImageElement;
  target.src = '/placeholder.svg';
}}
                  />
{
  !product.inStock && (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center" >
      <span className="text-white font-semibold" > Out of Stock </span>
        </div>
                  )
}
<div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold" >
  { product.power }
  </div>
  </div>
  < CardContent className = "p-4" >
    <Link to={ `/product/${product.id}` }>
      <h3 className="font-semibold mb-2 hover:text-primary transition-colors" >
        { product.name }
        </h3>
        </Link>
        < div className = "flex items-center gap-1 mb-2" >
          <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm font-medium" > { product.rating } </span>
              < span className = "text-sm text-muted-foreground" > ({ product.reviews }) </span>
                </div>
                < div className = "grid grid-cols-2 gap-2 text-xs mb-3" >
                  <div>
                  <span className="text-muted-foreground" > Efficiency: </span>
                    < span className = "ml-1 font-medium" > { product.efficiency } </span>
                      </div>
                      < div >
                      <span className="text-muted-foreground" > Warranty: </span>
                        < span className = "ml-1 font-medium" > { product.warranty } </span>
                          </div>
                          </div>
                          < div className = "flex items-center justify-between" >
                            <span className="text-2xl font-bold text-primary" >
                      ₦{ product.price.toLocaleString() }
</span>
  < Button
size = "sm"
disabled = {!product.inStock}
className = "gap-1"
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
