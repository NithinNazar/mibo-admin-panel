import api from "./api";
import type { User } from "../types";

export interface LoginWithPhoneOTPRequest {
  phone: string;
  otp: string;
}

export interface LoginWithPhonePasswordRequest {
  phone: string;
  password: string;
}

export interface LoginWithUsernamePasswordRequest {
  username: string;
  password: string;
}

export interface SendOTPRequest {
  phone: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  // Send OTP to phone number
  async sendOTP(data: SendOTPRequest): Promise<{ message: string }> {
    const response = await api.post("/auth/send-otp", data);
    return response.data;
  }

  // Login with phone + OTP
  async loginWithPhoneOTP(
    data: LoginWithPhoneOTPRequest
  ): Promise<AuthResponse> {
    const response = await api.post("/auth/login/phone-otp", data);
    // Backend returns { success: true, data: { user, accessToken, refreshToken } }
    const authData = response.data.data || response.data;
    this.setAuthData(authData);
    return authData;
  }

  // Login with phone + password
  async loginWithPhonePassword(
    data: LoginWithPhonePasswordRequest
  ): Promise<AuthResponse> {
    const response = await api.post("/auth/login/phone-password", data);
    // Backend returns { success: true, data: { user, accessToken, refreshToken } }
    const authData = response.data.data || response.data;
    this.setAuthData(authData);
    return authData;
  }

  // Login with username + password
  async loginWithUsernamePassword(
    data: LoginWithUsernamePasswordRequest
  ): Promise<AuthResponse> {
    const response = await api.post("/auth/login/username-password", data);
    // Backend returns { success: true, data: { user, accessToken, refreshToken } }
    const authData = response.data.data || response.data;
    this.setAuthData(authData);
    return authData;
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await api.post("/auth/refresh", { refreshToken });
    localStorage.setItem("accessToken", response.data.accessToken);
    return response.data;
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearAuthData();
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User> {
    const response = await api.get("/auth/me");
    return response.data;
  }

  // Helper: Set auth data in localStorage
  private setAuthData(data: AuthResponse): void {
    console.log("=== Setting Auth Data ===");
    console.log("Data received:", data);
    console.log("Access Token:", data.accessToken?.substring(0, 20) + "...");
    console.log("User:", data.user);

    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));

    console.log("Auth data saved to localStorage");
    console.log("isAuthenticated:", this.isAuthenticated());
  }

  // Helper: Clear auth data from localStorage
  private clearAuthData(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  }

  // Helper: Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem("accessToken");
  }

  // Helper: Get stored user
  getStoredUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export default new AuthService();
