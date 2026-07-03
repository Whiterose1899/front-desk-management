import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute() {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Show loading while verifying JWT
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-100">
        <h2 className="text-xl font-semibold text-slate-600">
          Loading...
        </h2>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}
        replace
      />
    );
  }

  // Role-based protection
  const adminOnlyPages = ["/dashboard", "/analytics"];

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  if (
    adminOnlyPages.includes(location.pathname) &&
    !isAdmin
  ) {
    return <Navigate to="/rooms" replace />;
  }

  // Allow access
  return <Outlet />;
}

export default ProtectedRoute;