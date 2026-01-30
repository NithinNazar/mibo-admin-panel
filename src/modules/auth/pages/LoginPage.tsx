import React, { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import { Phone, Lock, User, KeyRound } from "lucide-react";
import toast from "react-hot-toast";
import logo from "../../../assets/logo1.png";

type AuthMethod = "phone-otp" | "phone-password" | "username-password";

const LoginPage: React.FC = () => {
  const { login, sendOTP } = useAuth();
  const [authMethod, setAuthMethod] = useState<AuthMethod>("phone-password");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  // Form states
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const handleSendOTP = async () => {
    if (!phone) {
      toast.error("Please enter phone number");
      return;
    }

    setLoading(true);
    try {
      // Remove country code if present (91 for India)
      const cleanPhone = phone.replace(/^(\+91|91)/, "").trim();

      await sendOTP(cleanPhone);
      setOtpSent(true);
      toast.success("OTP sent successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean phone number (remove country code if present)
      const cleanPhone = phone.replace(/^(\+91|91)/, "").trim();

      console.log("=== Login Attempt ===");
      console.log("Auth Method:", authMethod);

      if (authMethod === "phone-otp") {
        if (!phone || !otp) {
          toast.error("Please enter phone number and OTP");
          setLoading(false);
          return;
        }
        console.log("Logging in with phone OTP:", cleanPhone);
        await login({ method: "phone-otp", phone: cleanPhone, otp });
      } else if (authMethod === "phone-password") {
        if (!phone || !password) {
          toast.error("Please enter phone number and password");
          setLoading(false);
          return;
        }
        console.log("Logging in with phone password:", cleanPhone);
        await login({ method: "phone-password", phone: cleanPhone, password });
      } else {
        if (!username || !password) {
          toast.error("Please enter username and password");
          setLoading(false);
          return;
        }
        console.log("Logging in with username:", username);
        await login({ method: "username-password", username, password });
      }

      console.log("Login successful, showing toast");
      toast.success("Login successful!");

      console.log("Attempting navigation to dashboard...");
      console.log("Current path:", window.location.pathname);

      // Force immediate navigation with page reload
      console.log("Redirecting to /dashboard");
      window.location.href = "/dashboard";

      console.log("After redirect call");
    } catch (error: any) {
      console.error("=== Login Error ===");
      console.error("Error:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response?.data);

      toast.error(
        error.response?.data?.message || error.message || "Login failed",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4a5a73] to-[#3d4d63] flex items-center justify-center p-4">
      <Card className="w-full max-w-md" padding="lg">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-xl p-2 flex items-center justify-center shadow-lg">
            <img
              src={logo}
              alt="Mibo Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-white">Mibo Care Admin</h1>
          <p className="text-slate-400 text-sm mt-2">Sign in to your account</p>
        </div>

        {/* Auth Method Tabs */}
        <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-lg">
          <button
            onClick={() => {
              setAuthMethod("phone-password");
              setOtpSent(false);
            }}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
              authMethod === "phone-password"
                ? "bg-miboTeal text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Phone + Password
          </button>
          <button
            onClick={() => {
              setAuthMethod("phone-otp");
              setOtpSent(false);
            }}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
              authMethod === "phone-otp"
                ? "bg-miboTeal text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Phone + OTP
          </button>
          <button
            onClick={() => {
              setAuthMethod("username-password");
              setOtpSent(false);
            }}
            className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-all ${
              authMethod === "username-password"
                ? "bg-miboTeal text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Username
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Phone + OTP Method */}
          {authMethod === "phone-otp" && (
            <>
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                icon={<Phone size={18} />}
                disabled={otpSent}
              />
              {!otpSent ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={handleSendOTP}
                  loading={loading}
                >
                  Send OTP
                </Button>
              ) : (
                <>
                  <Input
                    label="OTP"
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    icon={<KeyRound size={18} />}
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    size="lg"
                    loading={loading}
                  >
                    Sign In
                  </Button>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-sm text-miboTeal hover:underline w-full text-center"
                  >
                    Change phone number
                  </button>
                </>
              )}
            </>
          )}

          {/* Phone + Password Method */}
          {authMethod === "phone-password" && (
            <>
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                icon={<Phone size={18} />}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={18} />}
              />
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                size="lg"
                loading={loading}
              >
                Sign In
              </Button>
            </>
          )}

          {/* Username + Password Method */}
          {authMethod === "username-password" && (
            <>
              <Input
                label="Username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                icon={<User size={18} />}
              />
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={18} />}
              />
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                size="lg"
                loading={loading}
              >
                Sign In
              </Button>
            </>
          )}
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Protected by JWT authentication
        </p>
      </Card>
    </div>
  );
};

export default LoginPage;
