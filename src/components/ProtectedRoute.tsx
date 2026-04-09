import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

/**
 * ProtectedRoute component that wraps routes requiring authentication and role-based access.
 *
 * Features:
 * - Checks authentication status
 * - Verifies user role against allowed roles
 * - Redirects to /login if not authenticated
 * - Redirects to /unauthorized if role not allowed
 * - Shows loading state while checking authentication
 *
 * @param children - The component to render if access is granted
 * @param allowedRoles - Optional array of roles that can access this route
 *
 * Requirements: 3.3, 3.4
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-miboBg flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access if allowedRoles is specified
  if (allowedRoles && user) {
    const hasAllowedRole = allowedRoles.includes(user.role);

    if (!hasAllowedRole) {
      // Redirect to unauthorized page if role not allowed
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Render children if all checks pass
  return <>{children}</>;
};

export default ProtectedRoute;
