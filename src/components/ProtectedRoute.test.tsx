import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter, MemoryRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { AuthProvider } from "../contexts/AuthContext";

// Mock the useAuth hook
vi.mock("../contexts/AuthContext", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useAuth: vi.fn(),
}));

const { useAuth } = await import("../contexts/AuthContext");

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading state while checking authentication", () => {
    // Mock loading state
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: true,
      login: vi.fn(),
      logout: vi.fn(),
      sendOTP: vi.fn(),
      isClinician: false,
      isAdmin: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("should redirect to /login when not authenticated", () => {
    // Mock unauthenticated state
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      sendOTP: vi.fn(),
      isClinician: false,
      isAdmin: false,
    });

    const { container } = render(
      <MemoryRouter initialEntries={["/protected"]}>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    // Should not render protected content
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });

  it("should render children when authenticated with no role restrictions", () => {
    // Mock authenticated state
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: {
        id: "1",
        name: "Test User",
        phone: "1234567890",
        role: "ADMIN",
        centreIds: ["1"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      sendOTP: vi.fn(),
      isClinician: false,
      isAdmin: true,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should render children when authenticated with correct role", () => {
    // Mock authenticated clinician
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: {
        id: "1",
        name: "Dr. Test",
        phone: "1234567890",
        role: "CLINICIAN",
        centreIds: ["1"],
        clinicianId: 123,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      sendOTP: vi.fn(),
      isClinician: true,
      isAdmin: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={["CLINICIAN", "ADMIN"]}>
          <div>Protected Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });

  it("should redirect to /unauthorized when role not allowed", () => {
    // Mock authenticated clinician trying to access admin-only route
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: {
        id: "1",
        name: "Dr. Test",
        phone: "1234567890",
        role: "CLINICIAN",
        centreIds: ["1"],
        clinicianId: 123,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      sendOTP: vi.fn(),
      isClinician: true,
      isAdmin: false,
    });

    render(
      <MemoryRouter initialEntries={["/admin-only"]}>
        <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
          <div>Admin Only Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    // Should not render protected content
    expect(screen.queryByText("Admin Only Content")).not.toBeInTheDocument();
  });

  it("should allow admin to access admin-only routes", () => {
    // Mock authenticated admin
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: {
        id: "1",
        name: "Admin User",
        phone: "1234567890",
        role: "ADMIN",
        centreIds: ["1"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      sendOTP: vi.fn(),
      isClinician: false,
      isAdmin: true,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
          <div>Admin Only Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText("Admin Only Content")).toBeInTheDocument();
  });

  it("should allow manager to access admin-only routes", () => {
    // Mock authenticated manager
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: {
        id: "1",
        name: "Manager User",
        phone: "1234567890",
        role: "MANAGER",
        centreIds: ["1"],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      sendOTP: vi.fn(),
      isClinician: false,
      isAdmin: true,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute allowedRoles={["ADMIN", "MANAGER"]}>
          <div>Admin Only Content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText("Admin Only Content")).toBeInTheDocument();
  });
});
