import { Card } from "@/components/ui/card";
import { Sun, Target, Eye, Users, Award, Zap } from "lucide-react";

export default function About() {
  const team = [
    { name: "John Adebayo", role: "CEO & Founder", image: "/placeholder.svg" },
    { name: "Sarah Okonkwo", role: "Chief Technology Officer", image: "/placeholder.svg" },
    { name: "Michael Chen", role: "Head of Operations", image: "/placeholder.svg" },
    { name: "Amina Ibrahim", role: "Customer Relations Manager", image: "/placeholder.svg" },
  ];

  const values = [
    {
      icon: <Zap className="h-10 w-10 text-primary" />,
      title: "Innovation",
      description: "Constantly pushing the boundaries of solar technology"
    },
    {
      icon: <Award className="h-10 w-10 text-primary" />,
      title: "Quality",
      description: "Only the best products with proven performance"
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Customer First",
      description: "Your satisfaction is our top priority"
    },
  ];

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-secondary to-secondary/90 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <Sun className="h-16 w-16 text-primary mx-auto mb-6 solar-pulse" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About SolarGlow Tech</h1>
          <p className="text-xl max-w-3xl mx-auto text-white/90">
            Nigeria's leading provider of solar energy solutions, committed to powering a sustainable future
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <Card className="p-8 hover-lift">
            <Target className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              To make clean, renewable solar energy accessible and affordable to every Nigerian home and business. 
              We're committed to reducing carbon footprints while providing reliable, cost-effective energy solutions 
              that empower communities and drive economic growth.
            </p>
          </Card>

          <Card className="p-8 hover-lift">
            <Eye className="h-12 w-12 text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              To become Africa's most trusted solar energy company, powering millions of homes and businesses with 
              sustainable energy solutions. We envision a future where clean energy is the norm, not the exception, 
              contributing to a healthier planet for generations to come.
            </p>
          </Card>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Our <span className="text-primary">Core Values</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="p-6 text-center hover-lift">
                <div className="flex justify-center mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8">
            Our <span className="text-primary">Story</span>
          </h2>
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-4">
            <p>
              Founded in 2023, G-Tech began with a simple vision: to bring reliable, affordable solar energy 
              to Nigerian homes and businesses. What started as a small operation with just three employees has grown 
              into one of Nigeria's leading solar energy providers.
            </p>
            <p>
              Over the past decade, we've installed solar solutions in over 5,000 homes and businesses across Nigeria, 
              from Lagos to Abuja, Port Harcourt to Kano. Our commitment to quality, innovation, and customer service 
              has earned us the trust of thousands of satisfied customers.
            </p>
            <p>
              Today, we offer a comprehensive range of solar products including high-efficiency solar panels, solar 
              street lights, and portable solar gadgets. Our team of certified solar engineers and technicians ensures 
              every installation meets the highest standards of quality and safety.
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      {/* <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Meet Our <span className="text-primary">Team</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="overflow-hidden hover-lift cursor-pointer group">
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-accent/10">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-lg">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* Sustainability */}
      <section className="py-20 container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Sun className="h-16 w-16 text-primary mx-auto mb-6 solar-pulse" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Our Commitment to <span className="text-primary">Sustainability</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-6">
            At SolarGlow Tech, environmental responsibility isn't just a buzzword—it's at the core of everything we do. 
            Every solar panel we install represents a step toward a cleaner, more sustainable future for Nigeria and 
            the planet.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-muted-foreground">Tons of CO₂ Reduced</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50MW</div>
              <div className="text-muted-foreground">Clean Energy Generated</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">5,000+</div>
              <div className="text-muted-foreground">Happy Customers</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
