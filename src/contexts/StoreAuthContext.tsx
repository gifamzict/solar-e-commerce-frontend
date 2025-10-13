import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface StoreAuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const StoreAuthContext = createContext<StoreAuthContextType | undefined>(undefined);

export function StoreAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check token on mount
    const token = localStorage.getItem("store_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem("store_token", token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("store_token");
    setIsAuthenticated(false);
  };

  return (
    <StoreAuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </StoreAuthContext.Provider>
  );
}

export function useStoreAuth() {
  const context = useContext(StoreAuthContext);
  if (!context) {
    throw new Error("useStoreAuth must be used within StoreAuthProvider");
  }
  return context;
}
