import { Link } from "react-router-dom";
import { Sun, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function StoreFooter() {
  // Define the base URL from environment variables
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/';

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

  return (
    <footer className="bg-[hsl(var(--secondary-dark))] text-secondary-foreground border-t border-[hsl(var(--secondary-light))]">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <Sun className="h-10 w-10 text-primary solar-pulse drop-shadow-lg" />
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-white">G-Tech</span>
                <span className="text-xs text-primary font-medium">Power Your Future</span>
              </div>
            </div>
            <p className="text-secondary-foreground/80 text-sm mb-6 leading-relaxed">
              Nigeria's leading provider of premium solar solutions. Powering homes and businesses with clean, renewable energy since 2023.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-all duration-300 hover:scale-110 hover:-translate-y-1">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-white mb-6 text-lg">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-sm hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block">
                  Home
                </Link>
              </li>
              {categories?.slice(0, 3).map((category: any) => (
                <li key={category.id}>
                  <Link to={`/category/${category.slug}`} className="text-sm hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block">
                    {category.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/products" className="text-sm hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-bold text-white mb-6 text-lg">Customer Service</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/contact" className="text-sm hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block">
                  Shipping Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block">
                  Return Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block">
                  Warranty Information
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-primary transition-colors duration-300 hover:translate-x-1 inline-block">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-bold text-white mb-6 text-lg">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm group">
                <MapPin className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary group-hover:scale-110 transition-transform" />
                <span className="leading-relaxed">123 Solar Avenue, Ikeja,<br />Lagos, Nigeria</span>
              </li>
              <li className="flex items-center gap-3 text-sm group">
                <Phone className="h-5 w-5 flex-shrink-0 text-primary group-hover:scale-110 transition-transform" />
                <a href="tel:+2348001234567" className="hover:text-primary transition-colors">
                  +234 800 123 4567
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm group">
                <Mail className="h-5 w-5 flex-shrink-0 text-primary group-hover:scale-110 transition-transform" />
                <a href="mailto:info@store.gifamz.com" className="hover:text-primary transition-colors">
                info@store.gifamz.com
                </a>
              </li>
            </ul>

            <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-xs text-primary font-semibold mb-1">Business Hours</p>
              <p className="text-xs text-secondary-foreground/80">Mon - Sat: 8:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary-light mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-secondary-foreground/70">
            &copy; {new Date().getFullYear()} G-Tech. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-secondary-foreground/70">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
