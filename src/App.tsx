import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import { StoreLayout } from "./components/StoreLayout";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Categories from "./pages/Categories";
import Inventory from "./pages/Inventory";
import Promotions from "./pages/Promotions";
import Analytics from "./pages/Analytics";
import AdminUsers from "./pages/AdminUsers";
import Payments from "./pages/Payments";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import StoreHome from "./pages/store/Home";
import SolarPanels from "./pages/store/SolarPanels";
import StreetLights from "./pages/store/StreetLights";
import Gadgets from "./pages/store/Gadgets";
import ProductDetail from "./pages/store/ProductDetail";
import About from "./pages/store/About";
import Contact from "./pages/store/Contact";
import Cart from "./pages/store/Cart";
import Checkout from "./pages/store/Checkout";
import Auth from "./pages/store/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Admin Routes */}
          <Route path="/" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/orders" element={<DashboardLayout><Orders /></DashboardLayout>} />
          <Route path="/products" element={<DashboardLayout><Products /></DashboardLayout>} />
          <Route path="/customers" element={<DashboardLayout><Customers /></DashboardLayout>} />
          <Route path="/categories" element={<DashboardLayout><Categories /></DashboardLayout>} />
          <Route path="/inventory" element={<DashboardLayout><Inventory /></DashboardLayout>} />
          <Route path="/promotions" element={<DashboardLayout><Promotions /></DashboardLayout>} />
          <Route path="/analytics" element={<DashboardLayout><Analytics /></DashboardLayout>} />
          <Route path="/admin-users" element={<DashboardLayout><AdminUsers /></DashboardLayout>} />
          <Route path="/payments" element={<DashboardLayout><Payments /></DashboardLayout>} />
          <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
          
          {/* Store Routes */}
          <Route path="/store" element={<StoreLayout><StoreHome /></StoreLayout>} />
          <Route path="/store/panels" element={<StoreLayout><SolarPanels /></StoreLayout>} />
          <Route path="/store/street-lights" element={<StoreLayout><StreetLights /></StoreLayout>} />
          <Route path="/store/gadgets" element={<StoreLayout><Gadgets /></StoreLayout>} />
          <Route path="/store/product/:id" element={<StoreLayout><ProductDetail /></StoreLayout>} />
          <Route path="/store/about" element={<StoreLayout><About /></StoreLayout>} />
          <Route path="/store/contact" element={<StoreLayout><Contact /></StoreLayout>} />
          <Route path="/store/cart" element={<StoreLayout><Cart /></StoreLayout>} />
          <Route path="/store/checkout" element={<StoreLayout><Checkout /></StoreLayout>} />
          <Route path="/store/auth" element={<StoreLayout><Auth /></StoreLayout>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
