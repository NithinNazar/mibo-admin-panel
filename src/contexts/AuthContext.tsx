import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "../types";
import authService from "../services/authService";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  sendOTP: (phone: string) => Promise<void>;
}

export type LoginCredentials =
  | { method: "phone-otp"; phone: string; otp: string }
  | { method: "phone-password"; phone: string; password: string }
  | { method: "username-password"; username: string; password: string };

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Validate token by fetching current user
          try {
            const currentUser = await authService.getCurrentUser();
            setUser(currentUser);
          } catch (error) {
            // Token is invalid or expired, clear auth data
            console.error("Token validation failed:", error);
            authService.logout();
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        authService.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const sendOTP = async (phone: string) => {
    try {
      await authService.sendOTP({ phone });
    } catch (error) {
      console.error("Send OTP failed:", error);
      throw error;
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      let response;

      switch (credentials.method) {
        case "phone-otp":
          response = await authService.loginWithPhoneOTP({
            phone: credentials.phone,
            otp: credentials.otp,
          });
          break;
        case "phone-password":
          response = await authService.loginWithPhonePassword({
            phone: credentials.phone,
            password: credentials.password,
          });
          break;
        case "username-password":
          response = await authService.loginWithUsernamePassword({
            username: credentials.username,
            password: credentials.password,
          });
          break;
      }

      // Update user state immediately after successful login
      setUser(response.user);

      // Log for debugging
      console.log("Login successful, user set:", response.user);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      // Don't use window.location.href - let React Router handle navigation
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout API fails, clear local state
      setUser(null);
      authService.logout(); // This will clear localStorage
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        sendOTP,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
