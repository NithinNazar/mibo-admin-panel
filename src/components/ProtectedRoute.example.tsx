/**
 * Example usage of ProtectedRoute component
 *
 * This file demonstrates how to use the ProtectedRoute component
 * to protect routes based on authentication and role-based access control.
 */

import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// Example components
const DashboardPage = () => <div>Dashboard</div>;
const AdminOnlyPage = () => <div>Admin Only</div>;
const ClinicianPage = () => <div>Clinician Page</div>;
const ProfilePage = () => <div>Profile</div>;

/**
 * Example 1: Protect a route that requires authentication only
 * Any authenticated user can access this route
 */
function Example1() {
  return (
    <Routes>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

/**
 * Example 2: Protect a route that requires specific roles
 * Only ADMIN and MANAGER roles can access this route
 */
function Example2() {
  return (
    <Routes>
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
            <AdminOnlyPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

/**
 * Example 3: Protect a route for clinicians only
 * Only CLINICIAN role can access this route
 */
function Example3() {
  return (
    <Routes>
      <Route
        path="/my-appointments"
        element={
          <ProtectedRoute allowedRoles={["CLINICIAN"]}>
            <ClinicianPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

/**
 * Example 4: Multiple protected routes with different access levels
 */
function Example4() {
  return (
    <Routes>
      {/* Public route - no protection */}
      <Route path="/login" element={<div>Login</div>} />

      {/* Protected route - any authenticated user */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Protected route - admin only */}
      <Route
        path="/staff/managers"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
            <div>Managers Page</div>
          </ProtectedRoute>
        }
      />

      {/* Protected route - clinician only */}
      <Route
        path="/my-schedule"
        element={
          <ProtectedRoute allowedRoles={["CLINICIAN"]}>
            <div>My Schedule</div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

/**
 * Example 5: Using ProtectedRoute with nested routes
 */
function Example5() {
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
            <Routes>
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="settings" element={<div>Settings</div>} />
              <Route path="users" element={<div>Users</div>} />
            </Routes>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

/**
 * Behavior Summary:
 *
 * 1. If user is not authenticated (isLoading = false, isAuthenticated = false):
 *    - Redirects to /login
 *
 * 2. If user is authenticated but doesn't have required role:
 *    - Redirects to /unauthorized
 *
 * 3. If authentication is still loading (isLoading = true):
 *    - Shows loading spinner
 *
 * 4. If user is authenticated and has required role (or no role restriction):
 *    - Renders the protected content (children)
 */

export { Example1, Example2, Example3, Example4, Example5 };
