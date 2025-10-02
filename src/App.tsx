import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import { StoreLayout } from "./components/StoreLayout";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
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
          {/* Store Routes - Root Level */}
          <Route path="/" element={<StoreLayout><StoreHome /></StoreLayout>} />
          <Route path="/solar-panels" element={<StoreLayout><SolarPanels /></StoreLayout>} />
          <Route path="/street-lights" element={<StoreLayout><StreetLights /></StoreLayout>} />
          <Route path="/gadgets" element={<StoreLayout><Gadgets /></StoreLayout>} />
          <Route path="/product/:id" element={<StoreLayout><ProductDetail /></StoreLayout>} />
          <Route path="/about" element={<StoreLayout><About /></StoreLayout>} />
          <Route path="/contact" element={<StoreLayout><Contact /></StoreLayout>} />
          <Route path="/cart" element={<StoreLayout><Cart /></StoreLayout>} />
          <Route path="/checkout" element={<StoreLayout><Checkout /></StoreLayout>} />
          <Route path="/auth" element={<StoreLayout><Auth /></StoreLayout>} />
          
          {/* Admin Routes - Management Portal */}
          <Route path="/management-portal" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/management-portal/orders" element={<DashboardLayout><Orders /></DashboardLayout>} />
          <Route path="/management-portal/orders/:id" element={<DashboardLayout><OrderDetail /></DashboardLayout>} />
          <Route path="/management-portal/products" element={<DashboardLayout><Products /></DashboardLayout>} />
          <Route path="/management-portal/customers" element={<DashboardLayout><Customers /></DashboardLayout>} />
          <Route path="/management-portal/categories" element={<DashboardLayout><Categories /></DashboardLayout>} />
          <Route path="/management-portal/inventory" element={<DashboardLayout><Inventory /></DashboardLayout>} />
          <Route path="/management-portal/promotions" element={<DashboardLayout><Promotions /></DashboardLayout>} />
          <Route path="/management-portal/analytics" element={<DashboardLayout><Analytics /></DashboardLayout>} />
          <Route path="/management-portal/admin-users" element={<DashboardLayout><AdminUsers /></DashboardLayout>} />
          <Route path="/management-portal/payments" element={<DashboardLayout><Payments /></DashboardLayout>} />
          <Route path="/management-portal/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
