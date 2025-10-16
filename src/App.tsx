import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/DashboardLayout";
import { StoreLayout } from "./components/StoreLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { StoreProtectedRoute } from "./components/StoreProtectedRoute";
import { StoreAuthProvider } from "./contexts/StoreAuthContext";
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
import OrderConfirmation from "./pages/store/OrderConfirmation";
import AllProducts from "./pages/store/AllProducts";
import TrackOrder from "./pages/store/TrackOrder";
import ProfilePage from "./pages/store/Profile";
import OrderHistory from "./pages/store/OrderHistory";
import OrderDetailPage from "./pages/store/OrderDetail";
import CategoryPage from "./pages/store/CategoryPage"; // Import the new component
import Preorders from "./pages/Preorders";
import StorePreOrders from "./pages/store/PreOrders";
import PreOrderDetail from "./pages/store/PreOrderDetail";
import PreOrderTrack from "./pages/store/PreOrderTrack";
import PreOrderConfirmation from "./pages/store/PreOrderConfirmation";
import CustomerPreordersAdminPage from "./pages/CustomerPreorders";
import NotificationsPage from "./pages/Notifications";
import PickupLocationsPage from "./pages/PickupLocations";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <StoreAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          {/* Store Routes - Root Level */}
          <Route path="/" element={<StoreLayout><StoreHome /></StoreLayout>} />
          <Route path="/pre-orders" element={<StoreLayout><StorePreOrders /></StoreLayout>} />
          <Route path="/pre-orders/:id" element={<StoreLayout><PreOrderDetail /></StoreLayout>} />
          <Route path="/pre-orders/track" element={<StoreLayout><PreOrderTrack /></StoreLayout>} />
          <Route path="/pre-orders/confirmation/:preOrderNumber" element={<StoreLayout><PreOrderConfirmation /></StoreLayout>} />
          <Route path="/solar-panels" element={<StoreLayout><SolarPanels /></StoreLayout>} />
          <Route path="/street-lights" element={<StoreLayout><StreetLights /></StoreLayout>} />
          <Route path="/gadgets" element={<StoreLayout><Gadgets /></StoreLayout>} />
          <Route path="/product/:id" element={<StoreLayout><ProductDetail /></StoreLayout>} />
          <Route path="/about" element={<StoreLayout><About /></StoreLayout>} />
          <Route path="/contact" element={<StoreLayout><Contact /></StoreLayout>} />
          <Route path="/cart" element={<StoreLayout><Cart /></StoreLayout>} />
          <Route path="/checkout" element={<StoreProtectedRoute><StoreLayout><Checkout /></StoreLayout></StoreProtectedRoute>} />
          <Route path="/order-confirmation/:orderNumber" element={<StoreLayout><OrderConfirmation /></StoreLayout>} />
          <Route path="/track-order" element={<StoreLayout><TrackOrder /></StoreLayout>} />
          <Route path="/auth" element={<StoreLayout><Auth /></StoreLayout>} />
          <Route path="/all-products" element={<StoreLayout><AllProducts /></StoreLayout>} />
          <Route path="/category/:slug" element={<StoreLayout><CategoryPage /></StoreLayout>} /> {/* Add category route */}
          <Route path="/profile" element={<StoreProtectedRoute><StoreLayout><ProfilePage /></StoreLayout></StoreProtectedRoute>} />
          <Route path="/order-history" element={<StoreProtectedRoute><StoreLayout><OrderHistory /></StoreLayout></StoreProtectedRoute>} />
          <Route path="/orders/:orderNumber" element={<StoreProtectedRoute><StoreLayout><OrderDetailPage /></StoreLayout></StoreProtectedRoute>} />
          
          {/* Admin Auth */}
          <Route path="/management-portal/auth" element={<AdminAuth />} />
          
          {/* Admin Routes - Management Portal (Protected) */}
          <Route path="/management-portal" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
          <Route path="/management-portal/orders" element={<ProtectedRoute><DashboardLayout><Orders /></DashboardLayout></ProtectedRoute>} />
          <Route path="/management-portal/orders/:orderId" element={<ProtectedRoute><DashboardLayout><OrderDetail /></DashboardLayout></ProtectedRoute>} />
          <Route path="/management-portal/products" element={<ProtectedRoute><DashboardLayout><Products /></DashboardLayout></ProtectedRoute>} />
          <Route path="/management-portal/customers" element={<ProtectedRoute><DashboardLayout><Customers /></DashboardLayout></ProtectedRoute>} />
          <Route path="/management-portal/categories" element={<ProtectedRoute><DashboardLayout><Categories /></DashboardLayout></ProtectedRoute>} />
          <Route path="/management-portal/inventory" element={<ProtectedRoute><DashboardLayout><Inventory /></DashboardLayout></ProtectedRoute>} />
          <Route path="/management-portal/promotions" element={<ProtectedRoute><DashboardLayout><Promotions /></DashboardLayout></ProtectedRoute>} />
          <Route path="/management-portal/analytics" element={<ProtectedRoute><DashboardLayout><Analytics /></DashboardLayout></ProtectedRoute>} />
          <Route path="/management-portal/admin-users" element={<ProtectedRoute><DashboardLayout><AdminUsers /></DashboardLayout></ProtectedRoute>} />
          <Route path="/management-portal/payments" element={<ProtectedRoute><DashboardLayout><Payments /></DashboardLayout></ProtectedRoute>} />
          <Route path="/management-portal/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />
          <Route path="/management-portal/preorders" element={<ProtectedRoute><DashboardLayout><Preorders /></DashboardLayout></ProtectedRoute>} />
          <Route path="/management-portal/customer-preorders" element={<ProtectedRoute><DashboardLayout><CustomerPreordersAdminPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/management-portal/notifications" element={<ProtectedRoute><DashboardLayout><NotificationsPage /></DashboardLayout></ProtectedRoute>} />
          <Route path="/management-portal/pickup-locations" element={<ProtectedRoute><DashboardLayout><PickupLocationsPage /></DashboardLayout></ProtectedRoute>} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </StoreAuthProvider>
  </QueryClientProvider>
);

export default App;
