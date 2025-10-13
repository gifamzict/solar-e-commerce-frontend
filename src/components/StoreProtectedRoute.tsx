import { Navigate } from "react-router-dom";
import { useStoreAuth } from "@/contexts/StoreAuthContext";

export function StoreProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useStoreAuth();

  if (!isAuthenticated) {
    // Redirect them to the auth page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
