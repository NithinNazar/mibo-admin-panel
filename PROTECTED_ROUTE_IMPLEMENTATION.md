# ProtectedRoute Component Implementation

## Overview

Implemented the `ProtectedRoute` component for the mibo-admin panel as part of Task 9.1 of the Clinician Admin Sign-In feature. This component provides role-based access control for routes, ensuring only authorized users can access protected pages.

## Files Created

### 1. `src/components/ProtectedRoute.tsx`

The main component that wraps routes requiring authentication and role-based access control.

**Features:**

- ✅ Checks authentication status
- ✅ Verifies user role against allowed roles
- ✅ Redirects to `/login` if not authenticated
- ✅ Redirects to `/unauthorized` if role not allowed
- ✅ Shows loading state while checking authentication
- ✅ Validates Requirements 3.3 and 3.4

**Props:**

- `children: React.ReactNode` - The component to render if access is granted
- `allowedRoles?: string[]` - Optional array of roles that can access this route

### 2. `src/modules/auth/pages/UnauthorizedPage.tsx`

A user-friendly page displayed when a user tries to access a route they don't have permission for.

**Features:**

- Clear "Access Denied" message
- Shows current user role
- Provides navigation options:
  - Go Back (to previous page)
  - Go to Dashboard
  - Logout
- Responsive design with Tailwind CSS

### 3. `src/components/ProtectedRoute.test.tsx`

Comprehensive unit tests for the ProtectedRoute component.

**Test Coverage:**

- ✅ Shows loading state while checking authentication
- ✅ Redirects to /login when not authenticated
- ✅ Renders children when authenticated with no role restrictions
- ✅ Renders children when authenticated with correct role
- ✅ Redirects to /unauthorized when role not allowed
- ✅ Allows admin to access admin-only routes
- ✅ Allows manager to access admin-only routes

### 4. `src/components/ProtectedRoute.example.tsx`

Example usage documentation showing various ways to use the ProtectedRoute component.

**Examples Include:**

- Basic authentication protection
- Role-based access control
- Multiple protected routes
- Nested routes
- Behavior summary

### 5. `src/router/index.tsx` (Updated)

Added the `/unauthorized` route to the router configuration.

## Usage Examples

### Example 1: Protect any authenticated route

```tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

### Example 2: Admin-only route

```tsx
<Route
  path="/staff/managers"
  element={
    <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
      <ManagersPage />
    </ProtectedRoute>
  }
/>
```

### Example 3: Clinician-only route

```tsx
<Route
  path="/my-appointments"
  element={
    <ProtectedRoute allowedRoles={["CLINICIAN"]}>
      <MyAppointmentsPage />
    </ProtectedRoute>
  }
/>
```

## Component Behavior

### Authentication Flow

1. **Loading State**: Shows loading spinner while `isLoading = true`
2. **Not Authenticated**: Redirects to `/login` if `isAuthenticated = false`
3. **Role Check**: If `allowedRoles` is specified, verifies user role
4. **Unauthorized**: Redirects to `/unauthorized` if role not in `allowedRoles`
5. **Success**: Renders children if all checks pass

### Integration with Auth Context

The component uses the `useAuth()` hook to access:

- `isAuthenticated`: Boolean indicating if user is logged in
- `user`: User object containing role information
- `isLoading`: Boolean indicating if auth check is in progress

## Requirements Validation

### Requirement 3.3: Role-Based Access Control

✅ **Implemented**: The component verifies user roles and restricts access based on `allowedRoles` prop.

### Requirement 3.4: Access Denial Handling

✅ **Implemented**:

- Redirects to `/login` for unauthenticated users
- Redirects to `/unauthorized` for users without required roles
- Provides user-friendly error page with navigation options

## Next Steps (Task 9.2)

The next task is to apply the ProtectedRoute component to admin-only pages in the router:

1. Wrap admin-only routes with `<ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>`
2. Keep appointments and profile pages accessible to all authenticated users
3. Ensure clinicians can only access their designated pages

## Testing

### Running Tests

Once testing infrastructure is set up (vitest + @testing-library/react):

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
npm test src/components/ProtectedRoute.test.tsx
```

### Manual Testing Checklist

- [ ] Unauthenticated user is redirected to /login
- [ ] Authenticated user can access unrestricted protected routes
- [ ] Admin can access admin-only routes
- [ ] Clinician cannot access admin-only routes
- [ ] Unauthorized page displays correctly
- [ ] Loading state shows while auth is checking
- [ ] Navigation from unauthorized page works

## Dependencies

The component relies on:

- `react-router-dom`: For navigation and redirects
- `AuthContext`: For authentication state and user information
- Tailwind CSS: For styling (UnauthorizedPage)

## Notes

- The component is fully typed with TypeScript
- No external dependencies beyond existing project setup
- Backward compatible with existing authentication flow
- Ready for integration with role-based routing (Task 9.2)
