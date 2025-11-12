import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Sun, Zap, Shield, TrendingUp, Award, Check, ShoppingCart, Battery, Lightbulb, ArrowRight, Star, PhoneCall, Wrench, Building2, Home as HomeIcon, Globe, HeadphonesIcon, Tag, Clock, Percent } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { getImageUrl, getImageUrls } from "@/lib/utils";
import { listPreorders } from "@/services/preorder";

// Import hero images
import heroPanels from "@/assets/hero-solar-panels.jpg";
import heroBattery from "@/assets/hero-battery-storage.jpg";
import heroFarm from "@/assets/hero-solar-farm.jpg";
import heroComponents from "@/assets/hero-components.jpg";

// Import product images
import productPanel from "@/assets/product-solar-panel.jpg";
import productBattery from "@/assets/product-battery.jpg";
import productMounting from "@/assets/product-mounting.jpg";
import productStreetLight from "@/assets/product-street-light.jpg";

// Import default product images for fallback
import defaultPanel from "@/assets/product-solar-panel.jpg";
import defaultBattery from "@/assets/product-battery.jpg";
import defaultMounting from "@/assets/product-mounting.jpg";
import defaultStreetLight from "@/assets/product-street-light.jpg";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://web-production-d1120.up.railway.app/api') + '/';

// Map of default images based on product category or name
const defaultImages: Record<string, string> = {
  'Solar Panel': defaultPanel,
  'Battery': defaultBattery,
  'Mounting': defaultMounting,
  'Street Light': defaultStreetLight,
};

export default function Home() {
  const autoplayPlugin = useRef(Autoplay({
    delay: 6000,
    stopOnInteraction: true
  }));
  const heroSlides = [{
    title: "Power Your Home, Day and Night",
    subtitle: "Premium Residential Solar Panel Solutions",
    description: "High-efficiency monocrystalline panels with 25-year performance guarantee",
    cta: "Explore Solar Panels",
    link: "/solar-panels",
    image: heroPanels
  }, {
    title: "Store Energy, Save More",
    subtitle: "Advanced Battery Storage Systems",
    description: "Reliable backup power with cutting-edge energy storage technology",
    cta: "View Storage Solutions",
    link: "/gadgets",
    image: heroBattery
  }, {
    title: "Large-Scale Solar Infrastructure",
    subtitle: "Commercial & Utility Solar Solutions",
    description: "Scalable systems for businesses and industrial applications",
    cta: "Commercial Solutions",
    link: "/solar-panels",
    image: heroFarm
  }, {
    title: "Precision Engineering Components",
    subtitle: "Quality Mounting & Electrical Systems",
    description: "Professional-grade hardware for reliable solar installations",
    cta: "Browse Components",
    link: "/gadgets",
    image: heroComponents
  }];
  const solutionMatrix = [{
    title: "Solar Panels",
    description: "High-efficiency Tier-1 monocrystalline and polycrystalline panels for residential and commercial applications",
    icon: <Sun className="h-10 w-10" />,
    image: productPanel,
    link: "/solar-panels",
    features: ["22%+ Efficiency", "25-Year Warranty", "Tier-1 Quality"]
  }, {
    title: "Energy Storage",
    description: "Advanced battery systems for reliable backup power and energy independence",
    icon: <Battery className="h-10 w-10" />,
    image: productBattery,
    link: "/gadgets",
    features: ["10kWh - 20kWh", "10-Year Warranty", "Smart Management"]
  }, {
    title: "Mounting Solutions",
    description: "Professional-grade mounting hardware and racking systems for all installation types",
    icon: <Wrench className="h-10 w-10" />,
    image: productMounting,
    link: "/gadgets",
    features: ["Wind Rated", "Corrosion Resistant", "Easy Installation"]
  }, {
    title: "Lighting & Accessories",
    description: "Solar street lights, LED systems, and complete solar accessories",
    icon: <Lightbulb className="h-10 w-10" />,
    image: productStreetLight,
    link: "/street-lights",
    features: ["Auto Sensors", "Long-Lasting LED", "Weather Resistant"]
  }];
  const valuePropositions = [{
    icon: <Globe className="h-8 w-8 text-primary" />,
    title: "Global Certifications",
    description: "IEC, CE, TÜV certified products meeting international quality standards"
  }, {
    icon: <Shield className="h-8 w-8 text-primary" />,
    title: "Extended Warranties",
    description: "10-year product warranty with 25-year performance guarantee"
  }, {
    icon: <Award className="h-8 w-8 text-primary" />,
    title: "Expert Engineering",
    description: "Professional installation and technical support from certified engineers"
  }, {
    icon: <HeadphonesIcon className="h-8 w-8 text-primary" />,
    title: "24/7 Support",
    description: "Dedicated customer service and technical assistance anytime"
  }];

  // Fetch active promotions
  const { data: activePromotions = [] } = useQuery({
    queryKey: ['promotions'],
    queryFn: async () => {
      try {
        console.log('Fetching promotions...');
        const response = await axios.get(`${API_BASE_URL}promotions`);
        console.log('API Response:', response.data);
        const allPromotions = response.data.promotions || [];
        const now = new Date();

        return allPromotions
          .filter((promo: any) => {
            const startDate = new Date(promo.start_date);
            const endDate = new Date(promo.end_date);
            // Include promotions that are active and either:
            // 1. Currently running (now is between start and end date)
            // 2. Upcoming (start date is in the future)
            return promo.is_active && now <= endDate;
          })
          .map((promo: any) => {
            const startDate = new Date(promo.start_date);
            const now = new Date();
            const isUpcoming = startDate > now;

            return {
              id: promo.id,
              code: promo.promo_code,
              type: promo.discount_type,
              isUpcoming,
              startsIn: isUpcoming ? formatTimeUntil(startDate) : null,
              discount: promo.discount_type === 'percentage' ? `${promo.discount_value}%` :
                `₦${Number(promo.discount_value).toLocaleString()}`,
              description: promo.description || `Get ${promo.discount_type === 'percentage' ? promo.discount_value + '% off' : '₦' + Number(promo.discount_value).toLocaleString() + ' off'} your purchase`,
              validUntil: new Date(promo.end_date).toLocaleDateString('en-NG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            };
          });
      } catch (error) {
        console.error('Error fetching promotions:', error);
        return [];
      }
    }
  });

  // Fetch featured products
  const { data: featuredProducts = [], isLoading: isLoadingFeaturedProducts, isError: isErrorFeaturedProducts } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}products`);
        console.log('Featured products response:', response.data);
        const allProducts = response.data.products || [];
        const normalized = allProducts.map((product: any) => {
          // Determine default image based on product name
          const defaultImage = Object.entries(defaultImages).find(([key]) =>
            product.name?.toLowerCase?.().includes(key.toLowerCase())
          )?.[1] || defaultPanel;

          // Use image_urls from backend if available (already contains full URLs)
          // Otherwise fall back to processing images/image field
          let dbImage;
          if (product?.image_urls && Array.isArray(product.image_urls) && product.image_urls.length > 0) {
            dbImage = product.image_urls[0]; // Backend already provides full URL
          } else {
            dbImage = getImageUrls(product?.images || product?.image)[0];
          }

          // Derive a timestamp for sorting (prefer created_at/updated_at, fallback to id)
          const ts = new Date(product?.created_at || product?.updated_at || 0).getTime() || Number(product?.id) || 0;

          return {
            id: product.id,
            name: product.name,
            specs: Array.isArray(product.specifications) && product.specifications.length > 0
              ? product.specifications.join(', ')
              : '',
            price: `₦${Number(product.price).toLocaleString()}`,
            badge: product.stock < 5 ? "Limited Stock" :
              Number(product.price) >= 100000 ? "Premium" :
                "Featured",
            image: dbImage || defaultImage,
            inStock: product.stock > 0,
            _ts: ts,
          };
        });
        // Sort newest first and take latest 8
        return normalized
          .sort((a: any, b: any) => (b._ts ?? 0) - (a._ts ?? 0))
          .slice(0, 8)
          .map(({ _ts, ...rest }) => rest);
      } catch (error) {
        console.error('Error fetching featured products:', error);
        return [];
      }
    }
  });

  // Fetch pre-orders for store home
  const { data: storePreorders = [] } = useQuery({
    queryKey: ['store-preorders'],
    queryFn: listPreorders,
  });

  // Helper function to format time until a date
  const formatTimeUntil = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(date.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Starts tomorrow';
    if (diffDays < 7) return `Starts in ${diffDays} days`;
    if (diffDays < 30) return `Starts in ${Math.ceil(diffDays / 7)} weeks`;
    return `Starts in ${Math.ceil(diffDays / 30)} months`;
  };

  // Track expanded product descriptions in Featured Products
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());
  const toggleExpand = (id: number) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  // Preorders: sort newest first and limit to 8 on Home
  const preordersSorted = Array.isArray(storePreorders)
    ? [...storePreorders].sort((a: any, b: any) => {
      const aTime = new Date(a?.created_at ?? a?.updated_at ?? 0).getTime();
      const bTime = new Date(b?.created_at ?? b?.updated_at ?? 0).getTime();
      if (aTime === bTime) return (b?.id ?? 0) - (a?.id ?? 0);
      return bTime - aTime;
    })
    : [];
  const preordersToShow = preordersSorted.slice(0, 8);

  return <div className="animate-fade-in" >
    {/* Professional Hero Carousel */ }
    < section className = "relative bg-secondary-dark overflow-hidden" >
      <Carousel opts={
    {
      align: "start",
        loop: true,
          duration: 50
    }
  } plugins = { [autoplayPlugin.current]} className = "w-full" onMouseEnter = {() => autoplayPlugin.current?.stop()
} onMouseLeave = {() => autoplayPlugin.current?.play()}>
  <CarouselContent className="transition-all duration-1000 ease-out" >
  {
    heroSlides.map((slide, index) => <CarouselItem key={ index } className = "carousel-item-enter" >
      <div className="relative h-[600px] md:h-[700px] overflow-hidden" >
      {/* Background Image with Overlay - with parallax effect */ }
    < div className = "absolute inset-0 bg-cover bg-center scale-110 animate-[scale-in_10s_ease-out]" style = {{
      backgroundImage: `url(${slide.image})`
    }} >
    <div className="absolute inset-0 bg-gradient-to-r from-secondary-dark/96 via-secondary-dark/88 to-secondary-dark/75" />
      <div className="absolute inset-0 bg-gradient-to-t from-secondary-dark/60 to-transparent" />
        </div>

{/* Content */ }
<div className="container mx-auto px-6 md:px-12 h-full relative z-10" >
  <div className="flex items-center h-full max-w-3xl" >
    <div className="text-white" >
      <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 px-4 py-2 text-sm backdrop-blur-sm carousel-content-enter stagger-1" >
        Professional Solar Solutions
          </Badge>

          < h1 className = "text-4xl md:text-6xl lg:text-7xl font-bold mb-4 leading-tight carousel-content-enter stagger-2" >
            { slide.title }
            </h1>

            < p className = "text-xl md:text-2xl mb-3 text-white/90 font-semibold carousel-content-enter stagger-3" >
              { slide.subtitle }
              </p>

              < p className = "text-base md:text-lg mb-8 text-white/75 max-w-2xl carousel-content-enter stagger-3" >
                { slide.description }
                </p>

                < div className = "flex flex-col sm:flex-row gap-4 carousel-content-enter stagger-4" >
                  <Link to={ slide.link }>
                    <Button size="lg" className = "text-base px-8 py-6 bg-primary hover:bg-primary-dark text-primary-foreground font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl" >
                      { slide.cta }
                      < ArrowRight className = "ml-2 h-5 w-5" />
                        </Button>
                        </Link>
                        < Link to = "/contact" >
                          <Button size="lg" variant = "outline" className = "text-base px-8 py-6 border-2 border-white text-white transition-all duration-300 hover:scale-105 font-semibold bg-white/5 backdrop-blur-sm hover:bg-white/10" >
                            <PhoneCall className="mr-2 h-5 w-5" />
                              Get Custom Quote
                                </Button>
                                </Link>
                                </div>
                                </div>
                                </div>
                                </div>
                                </div>
                                </CarouselItem>)}
</CarouselContent>
  < CarouselPrevious className = "left-4 md:left-8 bg-white/20 border-white/30 text-white hover:bg-white/30 hover:scale-110 transition-all h-12 w-12" />
    <CarouselNext className="right-4 md:right-8 bg-white/20 border-white/30 text-white hover:bg-white/30 hover:scale-110 transition-all h-12 w-12" />
      </Carousel>
      </section>

{/* Active Promotions Section */ }
{
  activePromotions.length > 0 && (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden" >
      <div className="absolute inset-0 opacity-20" >
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-pulse" style = {{ animationDelay: '1s' }
} />
  </div>

  < div className = "container mx-auto px-6 md:px-12 relative z-10" >
    <div className="text-center mb-16 reveal-on-scroll" >
      <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-5 py-2 rounded-full mb-6 hover:scale-105 transition-transform duration-300" >
        <Tag className="h-5 w-5" />
          <span className="text-sm font-bold tracking-wide" > LIMITED TIME OFFERS </span>
            </div>
            < h2 className = "text-3xl md:text-5xl font-bold mb-4 text-foreground" >
              Exclusive Promotions
                </h2>
                < p className = "text-lg text-muted-foreground max-w-2xl mx-auto" >
                  Save big on premium solar solutions with our special discount codes
                    </p>
                    </div>

                    < div className = "grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto" >
                    {
                      activePromotions.map((promo, index) => (
                        <div
                  key= { promo.id }
                  className = {`group relative bg-card border-2 border-primary/20 rounded-3xl p-8 hover:border-primary hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-3 reveal-on-scroll overflow-hidden stagger-${index + 1}`}
                      >
                      {/* Decorative background gradient */ }
                      < div className = "absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        {/* Floating tag icon */ }
                        < div className = "absolute -top-4 -right-4 bg-primary text-primary-foreground rounded-full p-4 shadow-xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-500" >
                          { promo.type === 'percentage' ? <Percent className="h-6 w-6" /> : <Tag className="h-6 w-6" / >}
                          </div>

                          < div className = "relative z-10 space-y-6" >
                            {/* Promo code */ }
                            < div className = "inline-block bg-primary/10 px-5 py-3 rounded-xl group-hover:bg-primary/15 transition-colors duration-300" >
                              <code className="text-2xl font-bold text-primary tracking-wider" > { promo.code } </code>
                                </div>

{/* Discount amount */ }
<div className="space-y-2" >
  <div className="text-5xl font-extrabold text-foreground group-hover:text-primary transition-colors duration-300" >
    { promo.discount }
    </div>
    < p className = "text-lg text-muted-foreground font-medium" > { promo.description } </p>
      </div>

{/* Validity */ }
<div className="flex items-center gap-2 text-sm text-muted-foreground pt-4 border-t border-border" >
  <Clock className="h-4 w-4" />
    <span>{ promo.isUpcoming ? promo.startsIn : `Valid until ${promo.validUntil}` } </span>
    </div>

{/* CTA Button */ }
<Button className="w-full group-hover:scale-105 transition-all duration-300 text-base py-6 font-semibold shadow-lg hover:shadow-xl" >
  <ShoppingCart className="mr-2 h-5 w-5" />
    Shop Now & Save
      </Button>
      </div>
      </div>
              ))}
</div>
  </div>
  </section>
      )}

{/* Who We Are - Brief Introduction */ }
<section className="py-20 bg-gradient-to-b from-muted/30 via-background to-background relative overflow-hidden" >
  <div className="absolute inset-0 opacity-30" >
    <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        < div className = "container mx-auto px-6 md:px-12 max-w-6xl text-center relative z-10" >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground" >
            Nigeria's Leading Solar Component Supplier
              </h2>
              < p className = "text-lg md:text-xl text-muted-foreground leading-relaxed max-w-4xl mx-auto mb-12" >
                With over a decade of expertise in renewable energy solutions, we provide premium solar panels,
                  energy storage systems, and professional - grade components to homes and businesses across Nigeria. 
            Our mission is to deliver reliable, certified products backed by industry - leading warranties and expert technical support.
          </p>

  < div className = "flex justify-center gap-12 flex-wrap" >
    <div className="text-center group" >
      <div className="text-5xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform" > 10 + </div>
        < div className = "text-sm text-muted-foreground font-medium" > Years Experience </div>
          </div>
          < div className = "text-center group" >
            <div className="text-5xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform" > 5000 + </div>
              < div className = "text-sm text-muted-foreground font-medium" > Projects Completed </div>
                </div>
                < div className = "text-center group" >
                  <div className="text-5xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform" > 98 % </div>
                    < div className = "text-sm text-muted-foreground font-medium" > Client Satisfaction </div>
                      </div>
                      </div>
                      </div>
                      </section>


{/* Featured Products */ }
<section className="py-20 bg-muted/30" >
  <div className="container mx-auto px-6 md:px-12" >
    <div className="text-center mb-16" >
      <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm font-semibold" >
        FEATURED PRODUCTS
          </Badge>
          < h2 className = "text-3xl md:text-5xl font-bold mb-4 text-foreground" >
            Top - Rated Solar Solutions
              </h2>
              < p className = "text-lg text-muted-foreground max-w-3xl mx-auto" >
                Industry - leading products trusted by thousands of customers
                  </p>
                  </div>

{
  isLoadingFeaturedProducts ? (
    <div className= "text-center text-muted-foreground" >
    <p>Loading featured products...</p>
      </div>
          ) : isErrorFeaturedProducts ? (
    <div className= "text-center text-muted-foreground" >
    <p>Failed to load featured products.Please try again later.</p>
      </div>
          ) : featuredProducts.length === 0 ? (
    <div className= "text-center text-muted-foreground" >
    <p className="mb-4" > No products available at the moment.</p>
      < p > Please check back later or contact us for custom orders.</p>
        </div>
          ) : (
      <>
      <div className= "grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto" >
      {
        featuredProducts.map((product, index) => {
          const isExpanded = expandedProducts.has(product.id);
          return (
            <Card key= { product.id } className = "border-border hover:border-primary/50 transition-all duration-500 hover-lift group overflow-hidden bg-card hover:shadow-2xl" >
              <CardContent className="p-6" >
                <div className="mb-6 flex justify-center" >
                  <div className="w-48 h-48 rounded-2xl overflow-hidden bg-muted shadow-lg group-hover:shadow-2xl transition-all duration-500" >
                    <img 
                              src={ product.image }
          alt = { product.name }
          className = "w-full h-full object-cover group-hover:scale-125 group-hover:rotate-3 transition-transform duration-700"
          onError = {(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }
        }
                            />
          </div>
          </div>
          < h3 className = "text-lg font-bold mb-2 text-center text-foreground group-hover:text-primary transition-colors duration-300" >
          { product.name }
          </h3>
          < p className = {`text-sm text-muted-foreground text-center mb-2 ${isExpanded ? '' : 'line-clamp-3'}`} >
      { product.specs || 'High quality solar product.' }
      </p>
      < div className = "flex justify-center mb-4" >
        <Button variant="link" className = "px-0 text-primary" onClick = {() => toggleExpand(product.id)
}>
  { isExpanded? 'Show less': 'Read more' }
  </Button>
  </div>
  < p className = "text-2xl font-bold text-primary text-center mb-4 group-hover:scale-110 transition-transform duration-300" >
    { product.price }
    </p>
    < Link to = {`/product/${product.id}`}>
      <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all hover:shadow-lg duration-300" >
        View Details
          < ArrowRight className = "ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            </Link>
            </CardContent>
            </Card>
                  );
                })}
</div>
{/* Browse all products CTA */ }
<div className="mt-10 flex justify-center" >
  <Link to="/all-products" >
    <Button variant="outline" className = "inline-flex items-center gap-2 px-6 py-6 text-base rounded-xl hover:shadow-lg" >
      Browse all products
        < ArrowRight className = "h-4 w-4" />
          </Button>
          </Link>
          </div>
          </>
          )}
</div>
  </section>

{/* Product/Solution Matrix - Primary Navigation */ }
{
  Array.isArray(storePreorders) && storePreorders.length > 0 && (
    <section className="py-20 bg-muted/30" >
      <div className="container mx-auto px-6 md:px-12" >
        <div className="text-center mb-16" >
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm font-semibold" >
            Pre - order
            </Badge>
            < h2 className = "text-3xl md:text-5xl font-bold mb-4 text-foreground" >
              Complete Solar Energy Systems
                </h2>
                < p className = "text-lg text-muted-foreground max-w-3xl mx-auto" >
                  Professional - grade components and systems for every solar application
                    </p>
                    </div>

                    < div className = "grid md:grid-cols-2 lg:grid-cols-4 gap-6" >
                    {
                      preordersToShow.map((item: any) => {
                        // Use image_urls from backend if available (already contains full URLs)
                        let image;
                        if (item?.image_urls && Array.isArray(item.image_urls) && item.image_urls.length > 0) {
                          image = item.image_urls[0]; // Backend already provides full URL
                        } else {
                          image = getImageUrls(item?.images)?.[0] || defaultPanel;
                        }
                        const price = `₦${Number(item?.preorder_price ?? 0).toLocaleString()}`;
                        const expected = item?.expected_availability_date || '-';
                        return (
                          <Link key= { item.id } to = {`/pre-orders/${item.id}`
                      }>
                      <Card className="h-full border-border hover:border-primary/50 transition-all duration-500 hover-lift group bg-card overflow-hidden hover:shadow-2xl" >
                      <CardContent className="p-0" >
                      {/* Product Image */ }
                      < div className = "relative h-48 overflow-hidden bg-muted" >
                      <img src={ image } alt = { item?.name || item?.product_name || 'Pre-order'} className = "w-full h-full object-cover group-hover:scale-125 transition-transform duration-700" onError = {(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }
} />
  < div className = "absolute inset-0 bg-gradient-to-t from-secondary-dark/70 to-transparent group-hover:from-secondary-dark/50 transition-all duration-500" />
    {/* Floating Badge */ }
    < div className = "absolute top-4 right-4 px-3 py-1 bg-primary/90 backdrop-blur-sm rounded-xl text-primary-foreground text-xs shadow-lg" >
      Pre - order
      </div>
      </div>

{/* Content */ }
<div className="p-6" >
  <h3 className="text-xl font-bold mb-2 text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2" >
    { item?.name || item?.product_name}
</h3>
  < p className = "text-sm text-muted-foreground mb-1" > Expected: { expected } </p>
    < p className = "text-2xl font-bold text-primary mb-4" > { price } </p>
      < div className = "text-sm text-muted-foreground" >
        { item?.category?.name?<span className = "inline-block">{ item.category.name }</span> : null}
</div>
  </div>
  </CardContent>
  </Card>
  </Link>
                );
              })}
</div>

  < div className = "mt-8 flex justify-center" >
    <Link to="/pre-orders" >
      <Button variant="outline" className = "inline-flex items-center gap-2" >
        Browse all
          < ArrowRight className = "h-4 w-4" />
            </Button>
            </Link>
            </div>
            </div>
            </section>
      )}

{/* Why Partner With Us - Value Propositions */ }
<section className="py-20 bg-background" >
  <div className="container mx-auto px-6 md:px-12" >
    <div className="text-center mb-16" >
      <Badge className="mb-4 bg-accent/10 text-accent border-accent/20 px-4 py-1.5 text-sm font-semibold" >
        WHY CHOOSE US
          </Badge>
          < h2 className = "text-3xl md:text-5xl font-bold mb-4 text-foreground" >
            Partner With Industry Leaders
              </h2>
              < p className = "text-lg text-muted-foreground max-w-3xl mx-auto" >
                Certified quality, expert support, and reliable performance guaranteed
                  </p>
                  </div>

                  < div className = "grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto" >
                  {
                    valuePropositions.map((value, index) => <div key={ index } className = "text-center group cursor-pointer hover:-translate-y-2 transition-all duration-500" >
                      <div className="mb-6 flex justify-center" >
                    <div className="p-5 bg-primary/10 rounded-2xl inline-flex group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-xl" >
                    { value.icon }
                    </div>
                    </div>
                    < h3 className = "text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors duration-300" > { value.title } </h3>
                    < p className = "text-muted-foreground leading-relaxed" > { value.description } </p>
                    </div>)
                  }
                    </div>
                    </div>
                    </section>


{/* CTA Section */ }
<section className="py-20 bg-secondary-dark text-white relative overflow-hidden" >
  <div className="absolute inset-0 opacity-10" >
    <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/30 rounded-full blur-3xl" />
          </div>

          < div className = "container mx-auto px-6 md:px-12 relative z-10 text-center" >
            <div className="max-w-4xl mx-auto" >
              <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 px-4 py-2 text-sm backdrop-blur-sm inline-block" >
                GET STARTED TODAY
                  </Badge>

                  < h2 className = "text-3xl md:text-5xl font-bold mb-6 leading-tight text-slate-950" >
                    Ready to Power Your Future with Clean, Reliable Energy ?
                      </h2>
                      < p className = "text-lg md:text-xl mb-10 leading-relaxed text-slate-950" >
                        Our experts are here to help you design the perfect solar system tailored to your needs. 
              Get a custom solution with free consultation and comprehensive site assessment included. 
              Join thousands of satisfied customers who have made the switch to sustainable energy.
            </p>
  < div className = "flex flex-col sm:flex-row gap-4 justify-center mb-12" >
    <Link to="/contact" >
      <Button size="lg" className = "text-base px-10 py-6 bg-primary hover:bg-primary-dark text-primary-foreground font-semibold transition-all duration-300 hover:scale-105" >
        <PhoneCall className="mr-2 h-5 w-5" />
          Request Free Consultation
            </Button>
            </Link>
            < Link to = "/solar-panels" >
              <Button size="lg" variant = "outline" className = "text-base px-10 py-6 border-2 border-white hover:bg-white/10 font-semibold transition-all duration-300 hover:scale-105 text-slate-950" >
                <ShoppingCart className="mr-2 h-5 w-5" />
                  Browse Products
                    </Button>
                    </Link>
                    </div>

                    < div className = "mt-12 pt-8 border-t border-white/20 flex flex-wrap gap-8 justify-center text-sm text-black" >
                      <div className="flex items-center gap-2" >
                        <Star className="h-5 w-5 text-primary fill-primary" />
                          <span>4.9 / 5 Rating(2,000 + Reviews) </span>
                            </div>
                            < div className = "flex items-center gap-2" >
                              <Shield className="h-5 w-5 text-primary" />
                                <span>25 - Year Warranty </span>
                                  </div>
                                  < div className = "flex items-center gap-2" >
                                    <Award className="h-5 w-5 text-primary" />
                                      <span>Certified Installation </span>
                                        </div>
                                        </div>
                                        </div>
                                        </div>
                                        </section>
                                        </div>;
}