import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sun, Zap, Shield, TrendingUp, Users, Award } from "lucide-react";

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
      <section className="relative overflow-hidden bg-gradient-to-br from-secondary via-secondary/95 to-accent/20 text-white gradient-animate">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <Sun className="h-20 w-20 text-primary solar-pulse" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Power Your Future with <span className="text-primary">Clean Energy</span>
            </h1>
            <p className="text-xl mb-8 text-white/90">
              Nigeria's leading provider of solar panels, street lights, and renewable energy solutions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8 solar-glow hover-lift">
                Shop Solar Panels
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why SolarGlow Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Why Choose <span className="text-primary">SolarGlow Tech</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover-lift cursor-pointer border-2 hover:border-primary transition-colors">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Our <span className="text-primary">Solar Solutions</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories.map((category, index) => (
              <Card key={index} className="overflow-hidden hover-lift cursor-pointer group">
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10">
                  <img 
                    src={category.image} 
                    alt={category.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    {category.price}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{category.title}</h3>
                  <p className="text-muted-foreground mb-4">{category.description}</p>
                  <Link to={category.link}>
                    <Button className="w-full" variant="default">
                      Explore Products
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
