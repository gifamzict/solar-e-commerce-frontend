import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import { StoreLayout } from "./components/StoreLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
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
import AdminAuth from "./pages/management-portal/AdminAuth";

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
          
          {/* Admin Auth */}
          <Route path="/management-portal/auth" element={<AdminAuth />} />
          
          {/* Admin Routes - Management Portal (Protected) */}
          <Route path="/management-portal" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/management-portal/orders" element={<ProtectedRoute><DashboardLayout><Orders /></DashboardLayout></ProtectedRoute>} />
          <Route path="/management-portal/orders/:id" element={<ProtectedRoute><DashboardLayout><OrderDetail /></DashboardLayout></ProtectedRoute>} />
          <Route path="/management-portal/products" element={<ProtectedRoute><DashboardLayout><Products /></DashboardLayout></ProtectedRoute>} />
          <Route path="/management-portal/customers" element={<ProtectedRoute><DashboardLayout><Customers /></DashboardLayout></ProtectedRoute>} />
          <Route path="/management-portal/categories" element={<ProtectedRoute><DashboardLayout><Categories /></DashboardLayout></ProtectedRoute>} />
          <Route path="/management-portal/inventory" element={<ProtectedRoute><DashboardLayout><Inventory /></DashboardLayout></ProtectedRoute>} />
          <Route path="/management-portal/promotions" element={<ProtectedRoute><DashboardLayout><Promotions /></DashboardLayout></ProtectedRoute>} />
          <Route path="/management-portal/analytics" element={<ProtectedRoute><DashboardLayout><Analytics /></DashboardLayout></ProtectedRoute>} />
          <Route path="/management-portal/admin-users" element={<ProtectedRoute><DashboardLayout><AdminUsers /></DashboardLayout></ProtectedRoute>} />
          <Route path="/management-portal/payments" element={<ProtectedRoute><DashboardLayout><Payments /></DashboardLayout></ProtectedRoute>} />
          <Route path="/management-portal/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
