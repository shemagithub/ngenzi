import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";
import {
  Loader,
  Mail,
  Lock,
  Shield,
  ArrowRight,
  CheckCircle,
  User,
  Key,
} from "lucide-react";
import { Backendurl } from "../utils/backendUrl";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { authStyles } from "../styles/auth";
import logo from "../assets/images/logo.JPEG";
import SEOHead from "./SEO/SEOHead";

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${Backendurl}/api/users/login`,
        formData
      );
      if (response.data.success) {
        await login(response.data.token, response.data.user);
        toast.success("Login successful!");
        navigate("/");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      const apiMessage = error.response?.data?.message;
      console.error("Error logging in:", apiMessage || error.message);
      toast.error(apiMessage || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-cream-200 dark:bg-haven-950 transition-colors duration-200">
      <SEOHead title="Sign In" description="Sign in to your NGENZI REALESTATE account." noindex canonicalPath="/login" />
      {/* Soft haven gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cream-200 via-cream-100 to-cream-300 dark:from-haven-950 dark:via-haven-900 dark:to-haven-950" />
      <div className="absolute inset-0 bg-gradient-to-t from-haven-950/5 via-transparent to-transparent dark:from-haven-950/40" />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-haven-900 border border-cream-400 dark:border-haven-700 rounded-haven shadow-soft overflow-hidden">
            <div className="p-8 pt-10">
              {/* Logo & Title */}
              <div className="text-center mb-10">
                <Link to="/" className="inline-block">
                  <img
                    src={logo}
                    alt="NGENZI REAL ESTATE"
                    className="h-16 w-auto object-contain mx-auto mb-6"
                  />
                </Link>

                <h2 className="font-display text-2xl font-semibold text-haven-900 dark:text-cream-100 mb-2">
                  Welcome back
                </h2>
                <p className="text-haven-600 dark:text-cream-300 flex items-center justify-center gap-2 text-sm">
                  <Shield className="w-4 h-4 text-accent-400" />
                  Sign in to your secure account
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="flex items-center gap-2 text-sm font-medium text-haven-800 dark:text-cream-200"
                  >
                    <Mail className="w-4 h-4 text-accent-500" />
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                      className={`${authStyles.input} pl-11 dark:bg-haven-800 dark:border-haven-600 dark:text-cream-100 dark:placeholder-cream-400`}
                      placeholder="name@company.com"
                    />
                    <div
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                        emailFocused
                          ? "text-accent-500"
                          : "text-haven-400 dark:text-haven-500"
                      }`}
                    >
                      <User className="w-5 h-5" />
                    </div>
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="flex items-center gap-2 text-sm font-medium text-haven-800 dark:text-cream-200"
                  >
                    <Lock className="w-4 h-4 text-accent-500" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                      className={`${authStyles.input} pl-11 pr-12 dark:bg-haven-800 dark:border-haven-600 dark:text-cream-100 dark:placeholder-cream-400`}
                      placeholder="••••••••"
                    />
                    <div
                      className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                        passwordFocused
                          ? "text-accent-500"
                          : "text-haven-400 dark:text-haven-500"
                      }`}
                    >
                      <Key className="w-5 h-5" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-haven-400 dark:text-haven-500 hover:text-haven-700 dark:hover:text-cream-200 transition-colors p-1"
                    >
                      {showPassword ? (
                        <FaEyeSlash size={18} />
                      ) : (
                        <FaEye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="flex items-center justify-end">
                  <Link to="/forgot-password" className={`text-sm ${authStyles.link}`}>
                    Forgot password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`${authStyles.button} !py-4 disabled:opacity-60 disabled:cursor-not-allowed`}
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Sign in</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-cream-400 dark:border-haven-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-haven-900 text-haven-500 dark:text-cream-400 font-medium">
                      Don&apos;t have an account?
                    </span>
                  </div>
                </div>

                {/* Sign Up Link */}
                <Link
                  to="/signup"
                  className={`${authStyles.socialButton} dark:border-haven-600 dark:text-cream-200 dark:hover:bg-haven-800 group`}
                >
                  <User className="w-5 h-5 text-haven-500 dark:text-cream-400 group-hover:text-accent-600 transition-colors duration-200" />
                  Create an account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                </Link>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
