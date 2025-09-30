import { Link } from "react-router-dom";
import { Sun, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";

export function StoreFooter() {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sun className="h-8 w-8 text-primary solar-pulse" />
              <span className="text-xl font-bold text-white">SolarGlow Tech</span>
            </div>
            <p className="text-secondary-foreground/80 text-sm mb-4">
              Leading provider of solar solutions in Nigeria. Powering homes and businesses with clean, renewable energy.
            </p>
            <div className="flex gap-3">
              <a href="#" className="hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/store" className="text-sm hover:text-primary transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/store/panels" className="text-sm hover:text-primary transition-colors">Solar Panels</Link>
              </li>
              <li>
                <Link to="/store/street-lights" className="text-sm hover:text-primary transition-colors">Street Lights</Link>
              </li>
              <li>
                <Link to="/store/gadgets" className="text-sm hover:text-primary transition-colors">Gadgets</Link>
              </li>
              <li>
                <Link to="/store/about" className="text-sm hover:text-primary transition-colors">About Us</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold text-white mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/store/contact" className="text-sm hover:text-primary transition-colors">Contact Us</Link>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-primary transition-colors">Shipping Policy</a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-primary transition-colors">Return Policy</a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-primary transition-colors">Warranty</a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-primary transition-colors">FAQs</a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                <span>123 Solar Avenue, Ikeja, Lagos, Nigeria</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 flex-shrink-0 text-primary" />
                <span>+234 800 123 4567</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 flex-shrink-0 text-primary" />
                <span>info@solarglowtech.ng</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} SolarGlow Tech. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
