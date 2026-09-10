import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, Shield, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { backendurl } from "../config/constants";

const api = axios.create({
  baseURL: backendurl,
  headers: { "Content-Type": "application/json" },
});

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!email || !password) {
        toast.error("Please enter both email and password");
        setLoading(false);
        return;
      }

      const response = await api.post("/api/users/admin", {
        email: email.trim(),
        password: password.trim(),
      });

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("isAdmin", "true");
        toast.success("Welcome back, Admin!");
        navigate("/dashboard");
      } else {
        toast.error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      const msg =
        error.response?.data?.message ||
        (error.code === "ERR_NETWORK"
          ? "Cannot reach API. Check backend URL."
          : "Invalid email or password");
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-haven-950">
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 20%, rgba(196,165,116,0.25), transparent 55%), radial-gradient(ellipse 70% 50% at 90% 10%, rgba(61,122,95,0.35), transparent 50%), linear-gradient(160deg, #0a1612 0%, #1b3a2f 45%, #122620 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative z-10 flex min-h-screen flex-col lg:flex-row">
        {/* Brand panel */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:flex lg:w-[46%] flex-col justify-between p-12 xl:p-16"
        >
          <div>
            <div className="inline-flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-400 text-haven-950 shadow-lg">
                <span className="font-display text-2xl font-bold">N</span>
              </div>
              <div>
                <p className="font-display text-2xl font-semibold tracking-wide text-white">
                  NGENZI
                </p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-accent-300">
                  Real Estate Admin
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-md">
            <h1 className="font-display text-4xl xl:text-5xl font-semibold leading-tight text-white">
              Manage listings with clarity and speed.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-cream-300/75">
              Properties, plots, cars, content, and appointments — one calm control center for NGENZI REALESTATE.
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm text-cream-300/55">
            <Shield className="h-4 w-4 text-accent-400" />
            Secure admin access · ngenzirealestate.com
          </div>
        </motion.div>

        {/* Form panel */}
        <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="w-full max-w-md"
          >
            <div className="mb-8 text-center lg:hidden">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-400 text-haven-950">
                <span className="font-display text-2xl font-bold">N</span>
              </div>
              <h1 className="font-display text-2xl font-semibold text-white">NGENZI Admin</h1>
              <p className="mt-1 text-sm text-cream-300/70">Sign in to continue</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/95 p-7 sm:p-8 shadow-panel backdrop-blur">
              <div className="mb-7 hidden lg:block">
                <h2 className="font-display text-2xl font-semibold text-haven-900">Welcome back</h2>
                <p className="mt-1 text-sm text-haven-700/70">
                  Sign in with your administrator credentials
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="admin-label">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${
                        focusedField === "email" ? "text-haven-700" : "text-haven-700/40"
                      }`}
                    />
                    <input
                      type="email"
                      id="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField(null)}
                      className="admin-input pl-10"
                      placeholder="admin@ngenzirealestate.com"
                      autoComplete="username"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="admin-label">
                    Password
                  </label>
                  <div className="relative">
                    <Lock
                      className={`pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 ${
                        focusedField === "password" ? "text-haven-700" : "text-haven-700/40"
                      }`}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      className="admin-input pl-10 pr-11"
                      placeholder="Your password"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-haven-700/50 hover:text-haven-800"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="admin-btn w-full !py-3">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <p className="mt-6 text-center text-xs text-cream-300/50">
              NGENZI REALESTATE · Admin Panel
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
