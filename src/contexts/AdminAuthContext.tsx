import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

interface Admin {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  role: string;
  permissions: string[];
  status: string;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

interface AdminAuthContextType {
  isAuthenticated: boolean;
  admin: Admin | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_BASE_URL || "https://web-production-d1120.up.railway.app/api";

const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return context;
};

const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem("adminToken");
  });
  const [admin, setAdmin] = useState<Admin | null>(() => {
    const savedAdmin = localStorage.getItem("adminData");
    return savedAdmin ? JSON.parse(savedAdmin) : null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_URL}/admins/login`, {
        email,
        password,
      });

      const { token, admin: adminData } = response.data;

      // Store token and admin data
      localStorage.setItem("adminToken", token);
      localStorage.setItem("adminData", JSON.stringify(adminData));

      // Update state
      setIsAuthenticated(true);
      setAdmin(adminData);

      // Configure axios defaults for future requests
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    setIsAuthenticated(false);
    setAdmin(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  // Set up axios interceptor for token
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  return (
    <AdminAuthContext.Provider value= {{ isAuthenticated, admin, login, logout }
}>
  { children }
  </AdminAuthContext.Provider>
  );
};

export { AdminAuthProvider, useAdminAuth };
