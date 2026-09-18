import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useLocale } from "../hooks/useLocale";

/** Redirect unauthenticated users to the admin login page. */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { localizePath } = useLocale();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={localizePath("/admin/login")}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return children;
}
