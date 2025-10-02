import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ShoppingCart, User, Menu, X, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export function StoreHeader() {
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Solar Panels", path: "/solar-panels" },
    { name: "Street Lights", path: "/street-lights" },
    { name: "Gadgets", path: "/gadgets" },
    { name: "About Us", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Sun className="h-10 w-10 text-primary solar-pulse drop-shadow-lg" />
              <div className="absolute inset-0 h-10 w-10 bg-primary/20 blur-xl rounded-full" />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-solar-gradient leading-none">
                SolarGlow Tech
              </span>
              <span className="text-xs text-muted-foreground font-medium">Power Your Future</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-medium text-foreground/70 hover:text-primary transition-all duration-300 relative group py-2"
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-primary-light transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:flex items-center relative group">
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search solar products..."
                className="pl-10 w-72 border-border/60 focus:border-primary/50 focus:ring-primary/20 transition-all"
              />
            </div>

            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 transition-colors">
                <ShoppingCart className="h-5 w-5 text-foreground/80" />
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-[11px] font-bold text-white shadow-lg animate-scale-in">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Account */}
            <Link to="/auth">
              <Button className="hidden md:flex gap-2 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white shadow-lg hover-lift font-medium">
                <User className="h-4 w-4" />
                Sign In
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] sm:w-[400px] bg-background/98 backdrop-blur-xl">
                <nav className="flex flex-col gap-6 mt-12">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className="text-lg font-medium text-foreground hover:text-primary transition-all duration-300 border-b border-border/40 pb-3 hover:border-primary/50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  ))}
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full mt-6 bg-gradient-to-r from-primary to-primary-light text-white shadow-lg hover-lift font-medium h-12">
                      <User className="h-5 w-5 mr-2" />
                      Sign In / Sign Up
                    </Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
