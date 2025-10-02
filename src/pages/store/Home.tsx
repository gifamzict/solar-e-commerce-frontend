import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Sun, Zap, Shield, TrendingUp, Users, Award, Check, ShoppingCart, 
  Battery, Lightbulb, Smartphone, ArrowRight, Star, PhoneCall, Clock, Truck
} from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: <Zap className="h-10 w-10 text-primary" />,
      title: "High Efficiency Panels",
      description: "22%+ conversion efficiency with Tier-1 monocrystalline cells"
    },
    {
      icon: <Shield className="h-10 w-10 text-primary" />,
      title: "10-Year Warranty",
      description: "Comprehensive product warranty with 25-year performance guarantee"
    },
    {
      icon: <TrendingUp className="h-10 w-10 text-primary" />,
      title: "70% Cost Savings",
      description: "Slash your electricity bills and achieve energy independence"
    }
  ];

  const categories = [
    {
      title: "Solar Panels",
      description: "Premium monocrystalline and polycrystalline panels for residential and commercial use",
      icon: <Sun className="h-12 w-12" />,
      link: "/solar-panels",
      price: "From ₦450,000",
      badge: "Best Seller"
    },
    {
      title: "Street Lights",
      description: "Energy-efficient solar street lighting with auto day/night sensors",
      icon: <Lightbulb className="h-12 w-12" />,
      link: "/street-lights",
      price: "From ₦85,000",
      badge: "Popular"
    },
    {
      title: "Solar Gadgets",
      description: "Portable chargers, fans, radios, and power banks for everyday use",
      icon: <Smartphone className="h-12 w-12" />,
      link: "/gadgets",
      price: "From ₦15,000",
      badge: "New"
    }
  ];

  const stats = [
    { icon: <Users className="h-10 w-10" />, value: "5,000+", label: "Homes Powered" },
    { icon: <Award className="h-10 w-10" />, value: "98%", label: "Satisfaction Rate" },
    { icon: <Battery className="h-10 w-10" />, value: "50MW", label: "Energy Generated" },
    { icon: <TrendingUp className="h-10 w-10" />, value: "10+", label: "Years Experience" },
  ];

  const benefits = [
    { icon: <Check className="h-5 w-5" />, text: "10-Year Product Warranty" },
    { icon: <Check className="h-5 w-5" />, text: "Free Professional Installation" },
    { icon: <Check className="h-5 w-5" />, text: "24/7 Customer Support" },
    { icon: <Check className="h-5 w-5" />, text: "Flexible Payment Plans" }
  ];

  const whyChooseUs = [
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: "Fast Delivery",
      description: "Same-day delivery within Lagos, 2-3 days nationwide"
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Certified Products",
      description: "All products meet international quality standards"
    },
    {
      icon: <PhoneCall className="h-8 w-8 text-primary" />,
      title: "Expert Support",
      description: "Dedicated solar engineers available for consultation"
    },
    {
      icon: <Truck className="h-8 w-8 text-primary" />,
      title: "Free Installation",
      description: "Professional installation included with every purchase"
    }
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden solar-hero-gradient text-white min-h-[700px] flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl float-animation" />
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Logo Animation */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <Sun className="h-28 w-28 text-primary solar-pulse drop-shadow-2xl" />
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-2xl" />
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight tracking-tight">
              Power Your Future with
              <br />
              <span className="text-solar-gradient drop-shadow-lg">
                Clean Solar Energy
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl mb-4 text-white/95 max-w-3xl mx-auto font-medium">
              Nigeria's #1 Provider of Premium Solar Solutions
            </p>
            <p className="text-lg md:text-xl mb-10 text-white/80 max-w-2xl mx-auto">
              Join 5,000+ Nigerian homes and businesses saving up to 70% on electricity costs with our certified solar technology
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/solar-panels">
                <Button size="lg" className="text-lg px-14 py-7 bg-gradient-to-r from-primary via-primary-light to-primary bg-[length:200%_100%] hover:bg-right transition-all duration-500 text-white shadow-2xl hover-lift font-semibold">
                  <ShoppingCart className="mr-3 h-6 w-6" />
                  Shop Solar Panels
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="text-lg px-14 py-7 glass-effect border-2 border-white/30 text-white hover:bg-white/20 backdrop-blur-xl font-semibold">
                  <PhoneCall className="mr-3 h-5 w-5" />
                  Free Consultation
                </Button>
              </Link>
            </div>

            {/* Benefits */}
            <div className="flex flex-wrap gap-8 justify-center">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-white/90">
                  <div className="bg-primary/20 p-1.5 rounded-full">
                    {benefit.icon}
                  </div>
                  <span className="font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 fill-background">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-up" style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl text-primary">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-4xl font-bold text-foreground mb-2">{stat.value}</div>
                <div className="text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose SolarGlow */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm font-semibold">
              WHY CHOOSE US
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Nigeria's Most Trusted Solar Provider
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the SolarGlow difference with premium products and exceptional service
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyChooseUs.map((item, index) => (
              <Card key={index} className="border-border/50 hover:border-primary/50 transition-all duration-300 hover-lift card-glow group">
                <CardContent className="p-8 text-center">
                  <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      {item.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 solar-gradient-radial">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Premium Solar Solutions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Industry-leading technology backed by comprehensive warranties
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="glass-card border-border/30 hover:border-primary/50 transition-all duration-300 overflow-hidden group hover-lift">
                <CardContent className="p-10 text-center relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full" />
                  <div className="mb-6 flex justify-center relative z-10">
                    <div className="p-5 bg-gradient-to-br from-primary/15 to-accent/10 rounded-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm font-semibold">
              OUR PRODUCTS
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Complete Solar Solutions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From residential to commercial - we have the perfect solar solution for you
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Card key={index} className="border-border/50 overflow-hidden group hover:border-primary/50 transition-all duration-500 hover-lift">
                <div className="relative h-64 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 flex items-center justify-center overflow-hidden">
                  {category.badge && (
                    <Badge className="absolute top-4 right-4 bg-primary text-white px-3 py-1 shadow-lg">
                      {category.badge}
                    </Badge>
                  )}
                  <div className="text-primary group-hover:scale-125 transition-transform duration-500 group-hover:rotate-12">
                    {category.icon}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                </div>
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-primary">{category.price}</span>
                    <Link to={category.link}>
                      <Button className="bg-gradient-to-r from-primary to-primary-light hover-glow group/btn">
                        Shop Now
                        <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 solar-hero-gradient" />
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5" />
        
        <div className="container mx-auto px-4 relative z-10 text-center text-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-6">
              Ready to Go Solar?
            </h2>
            <p className="text-xl md:text-2xl mb-10 text-white/90">
              Get a free consultation and discover how much you can save with solar energy
            </p>
            <Link to="/contact">
              <Button size="lg" className="text-lg px-14 py-7 bg-white text-secondary hover:bg-white/90 shadow-2xl hover-lift font-semibold">
                <PhoneCall className="mr-3 h-6 w-6" />
                Get Free Consultation
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </Link>
            
            <div className="mt-12 flex flex-wrap gap-8 justify-center">
              <div className="flex items-center gap-3">
                <Star className="h-6 w-6 text-primary fill-primary" />
                <span className="text-lg">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-lg">10-Year Warranty</span>
              </div>
              <div className="flex items-center gap-3">
                <Truck className="h-6 w-6 text-primary" />
                <span className="text-lg">Free Installation</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
