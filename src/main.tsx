import { createRoot } from "react-dom/client";
import { CartProvider } from "./contexts/CartContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <AdminAuthProvider>
    <CartProvider>
      <App />
    </CartProvider>
  </AdminAuthProvider>
);
