import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sun, Zap, Shield, TrendingUp, Users, Award, Check, ShoppingCart, Battery, Lightbulb, Smartphone } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "High Efficiency",
      description: "Our solar panels convert up to 22% of sunlight into clean energy"
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "10-Year Warranty",
      description: "Comprehensive warranty coverage on all products"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Cost Savings",
      description: "Save up to 70% on your electricity bills"
    }
  ];

  const categories = [
    {
      title: "Solar Panels",
      description: "Premium solar panels for homes and businesses",
      image: "/placeholder.svg",
      link: "/store/panels",
      price: "From ₦450,000"
    },
    {
      title: "Street Lights",
      description: "Energy-efficient solar street lighting solutions",
      image: "/placeholder.svg",
      link: "/store/street-lights",
      price: "From ₦85,000"
    },
    {
      title: "Solar Gadgets",
      description: "Portable solar chargers, fans, and more",
      image: "/placeholder.svg",
      link: "/store/gadgets",
      price: "From ₦15,000"
    }
  ];

  const stats = [
    { icon: <Users className="h-10 w-10" />, value: "5,000+", label: "Homes Powered" },
    { icon: <Award className="h-10 w-10" />, value: "98%", label: "Customer Satisfaction" },
    { icon: <TrendingUp className="h-10 w-10" />, value: "10+", label: "Years Experience" },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-secondary/95 to-accent/20 text-white gradient-animate min-h-[600px] flex items-center">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Sun className="h-24 w-24 text-primary solar-pulse" />
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
              </div>
            </div>
            <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
              Power Your Future with <br/>
              <span className="text-primary bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Clean Solar Energy</span>
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-white/90 max-w-3xl mx-auto">
              Nigeria's #1 provider of premium solar panels, street lights, and renewable energy solutions
            </p>
            <p className="text-lg mb-8 text-white/75 max-w-2xl mx-auto">
              Join over 5,000+ Nigerian homes and businesses already saving up to 70% on electricity costs with our cutting-edge solar technology
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link to="/store/panels">
                <Button size="lg" className="text-lg px-12 py-6 solar-glow hover-lift">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Shop Solar Panels
                </Button>
              </Link>
              <Link to="/store/about">
                <Button size="lg" variant="outline" className="text-lg px-12 py-6 bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20">
                  Learn More
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-6 justify-center text-sm">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>10-Year Warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>Free Installation</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-primary" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why SolarGlow Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4">Why Choose Us</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Why <span className="text-primary">SolarGlow Tech</span> Leads Nigeria
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're not just selling solar products—we're powering a sustainable future for Nigeria
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="p-8 hover-lift cursor-pointer border-2 hover:border-primary transition-all duration-300 group">
                <div className="mb-6 p-4 bg-primary/10 rounded-full inline-block group-hover:bg-primary/20 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground text-lg">{feature.description}</p>
              </Card>
            ))}
          </div>
          
          {/* Additional Benefits */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <Battery className="h-8 w-8 mx-auto mb-3 text-primary" />
              <p className="font-semibold">Premium Quality</p>
              <p className="text-sm text-muted-foreground">Tier-1 Products</p>
            </div>
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
              <p className="font-semibold">Expert Team</p>
              <p className="text-sm text-muted-foreground">Certified Engineers</p>
            </div>
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <Award className="h-8 w-8 mx-auto mb-3 text-primary" />
              <p className="font-semibold">Best Prices</p>
              <p className="text-sm text-muted-foreground">Guaranteed Lowest</p>
            </div>
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <Shield className="h-8 w-8 mx-auto mb-3 text-primary" />
              <p className="font-semibold">Secure Payment</p>
              <p className="text-sm text-muted-foreground">Paystack Protected</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4">Our Products</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Complete <span className="text-primary">Solar Solutions</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From residential solar panels to commercial street lights, we have everything you need
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Card key={index} className="overflow-hidden hover-lift cursor-pointer group border-2 hover:border-primary transition-all">
                <div className="relative h-72 overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
                  <img 
                    src={category.image} 
                    alt={category.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                    {category.price}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-2xl font-bold mb-1">{category.title}</h3>
                    <p className="text-sm text-white/90">{category.description}</p>
                  </div>
                </div>
                <div className="p-6 bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>✓ Quality Assured</span>
                      <span>✓ Warranty</span>
                    </div>
                  </div>
                  <Link to={category.link}>
                    <Button className="w-full group-hover:solar-glow transition-all" size="lg">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      View Products
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 bg-gradient-to-r from-secondary to-secondary/90 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Trusted by <span className="text-primary">Thousands</span> Across Nigeria
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4 text-primary">
                  {stat.icon}
                </div>
                <div className="text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Go Solar?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get a free consultation and discover how much you can save with solar energy
          </p>
          <Link to="/store/contact">
            <Button size="lg" className="text-lg px-12 solar-glow hover-lift">
              Get Free Consultation
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
