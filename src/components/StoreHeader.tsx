import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, User, Menu, X, Sun, Settings, LogOut, ChevronDown, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useStoreAuth } from "@/contexts/StoreAuthContext";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export function StoreHeader() {
  const { cartCount } = useCart();
  const { isAuthenticated, logout } = useStoreAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Define the base URL from environment variables
  const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api') + '/';

  // API function to fetch categories
  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const response = await axios.get<{ categories: any[] }>(`${API_BASE_URL}categories`);
      console.log('Categories API response:', response.data);
      // The API returns an object with a 'categories' property which is an array.
      return response.data.categories || [];
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      throw error;
    }
  };

  const { data: categories, isLoading, isError, error } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 2,
    initialData: undefined, // Use undefined to better handle loading/error states
  });

  // Debug output
  useEffect(() => {
    console.log('Current categories:', categories);
    if (isError) console.error('Categories error:', error);
  }, [categories, isError, error]);

  const navLinks = [
    { name: "Home", path: "/" },
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
                G-Tech
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
            {/* Categories Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium text-foreground/70 hover:text-primary transition-all duration-300 relative group py-2 px-0">
                  Products
                  <ChevronDown className="ml-1 h-4 w-4" />
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-primary-light transition-all duration-300 group-hover:w-full" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                {isLoading ? (
                  <DropdownMenuItem disabled>Loading categories...</DropdownMenuItem>
                ) : isError ? (
                  <DropdownMenuItem disabled>Error loading categories</DropdownMenuItem>
                ) : categories?.length === 0 ? (
                  <DropdownMenuItem disabled>No categories available</DropdownMenuItem>
                ) : (
                  <>
                    {categories?.map((category: any) => (
                      <DropdownMenuItem key={category.id} asChild>
                        <Link to={`/category/${category.slug}`} className="w-full">
                          {category.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/all-products" className="w-full">
                        All Products
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Pre-order link appears after Products dropdown */}
            <Link
              to="/pre-orders"
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-all duration-300 relative group py-2"
            >
              Pre-order
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-primary-light transition-all duration-300 group-hover:w-full" />
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
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
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 transition-colors">
                    <User className="h-5 w-5 text-foreground/80" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/track-order" className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Track Order
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/pre-orders/track" className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Track Pre-order
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="flex items-center gap-2 text-red-600">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button className="hidden md:flex gap-2 bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary text-white shadow-lg hover-lift font-medium">
                  <User className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}

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
                  {/* Mobile Categories */}
                  <div className="border-b border-border/40 pb-3">
                    <p className="text-lg font-medium text-foreground mb-3">Products</p>
                    <div className="flex flex-col gap-2 pl-4">
                      {categories?.map((category: any) => (
                        <Link
                          key={category.id}
                          to={`/category/${category.slug}`}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {category.name}
                        </Link>
                      ))}
                      <Link
                        to="/all-products"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        All Products
                      </Link>
                      {/* Mobile Pre-order link after products */}
                      <Link
                        to="/pre-orders"
                        className="text-sm text-muted-foreground hover:text-primary transition-colors mt-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Pre-order
                      </Link>
                    </div>
                  </div>
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
