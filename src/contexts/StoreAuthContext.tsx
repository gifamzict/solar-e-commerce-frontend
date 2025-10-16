import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface StoreAuthContextType {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const StoreAuthContext = createContext<StoreAuthContextType | undefined>(undefined);

export function StoreAuthProvider({ children }: { children: ReactNode }) {
  // Initialize synchronously from localStorage to avoid redirect flicker on refresh
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem("store_token");
    } catch {
      return false;
    }
  });

  // Sync auth state across tabs/windows
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "store_token") {
        setIsAuthenticated(!!e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
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
