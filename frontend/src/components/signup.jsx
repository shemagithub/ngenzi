import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader,
  UserPlus,
  Mail,
  CheckCircle,
  AlertCircle,
  Shield,
  Star,
  ArrowRight,
  User,
  Key,
} from "lucide-react";
import { Backendurl } from "../utils/backendUrl";
import { toast } from "react-toastify";
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

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldFocus, setFieldFocus] = useState({
    name: false,
    email: false,
    password: false,
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

  const validateField = (name, value) => {
    const errors = {};

    switch (name) {
      case "name":
        if (!value.trim()) errors.name = "Name is required";
        else if (value.trim().length < 2)
          errors.name = "Name must be at least 2 characters";
        break;
      case "email": {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) errors.email = "Email is required";
        else if (!emailRegex.test(value))
          errors.email = "Please enter a valid email";
        break;
      }
      case "password":
        if (!value) errors.password = "Password is required";
        else if (value.length < 6)
          errors.password = "Password must be at least 6 characters";
        break;
    }

    setValidationErrors((prev) => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    validateField(name, value);
  };

  const handleFocus = (fieldName) => {
    setFieldFocus((prev) => ({ ...prev, [fieldName]: true }));
  };

  const handleBlur = (fieldName) => {
    setFieldFocus((prev) => ({ ...prev, [fieldName]: false }));
    validateField(fieldName, formData[fieldName]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameOk = validateField("name", formData.name);
    const emailOk = validateField("email", formData.email);
    const passwordOk = validateField("password", formData.password);
    if (!nameOk || !emailOk || !passwordOk) {
      toast.error("Please fix the form errors before continuing");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      const response = await axios.post(
        `${Backendurl}/api/users/register`,
        payload
      );

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        toast.success("Account created successfully!");
        navigate("/");
        return;
      }

      toast.error(response.data.message || "Could not create account");
    } catch (error) {
      const apiMessage = error.response?.data?.message;
      const status = error.response?.status;

      if (status === 400 && apiMessage) {
        toast.error(apiMessage);
        // Duplicate account → send them to login
        if (/already registered|already exists|sign in/i.test(apiMessage)) {
          setTimeout(() => navigate("/login"), 1200);
        }
      } else if (error.code === "ERR_NETWORK") {
        toast.error("Cannot reach the server. Check your connection.");
      } else {
        toast.error(apiMessage || "An error occurred. Please try again.");
      }
      console.error("Error signing up:", apiMessage || error.message);
    } finally {
      setLoading(false);
    }
  };

  const getInputClasses = (fieldName, hasError) => {
    const base = `${authStyles.input} pl-10 pr-10 dark:bg-haven-800 dark:border-haven-600 dark:text-cream-100 dark:placeholder-cream-400`;
    if (hasError) {
      return `${base} border-red-400 focus:border-red-500 focus:ring-red-400/30`;
    }
    if (fieldFocus[fieldName]) {
      return `${base} border-accent-400 ring-2 ring-accent-400/20`;
    }
    return base;
  };

  const hasValidationErrors = Object.keys(validationErrors).some(
    (key) => validationErrors[key]
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-cream-200 dark:bg-haven-950 transition-colors duration-200">
      <SEOHead title="Create Account" description="Create your NGENZI REALESTATE account." noindex canonicalPath="/signup" />
      <div className="absolute inset-0 bg-gradient-to-br from-cream-200 via-cream-100 to-cream-300 dark:from-haven-950 dark:via-haven-900 dark:to-haven-950" />
      <div className="absolute inset-0 bg-gradient-to-t from-haven-950/5 via-transparent to-transparent dark:from-haven-950/40" />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="w-full max-w-md"
        >
          <div className="bg-white dark:bg-haven-900 border border-cream-400 dark:border-haven-700 rounded-haven shadow-soft p-8">
            {/* Logo & Title */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-block mb-6">
                <img
                  src={logo}
                  alt="NGENZI REAL ESTATE"
                  className="h-16 w-auto object-contain mx-auto"
                />
              </Link>

              <div className="space-y-2">
                <h2 className="font-display text-2xl font-semibold text-haven-900 dark:text-cream-100">
                  Create Your Account
                </h2>
                <p className="text-haven-600 dark:text-cream-300 text-sm">
                  Join thousands of property enthusiasts
                </p>

                <div className="flex items-center justify-center space-x-6 mt-4 text-sm text-haven-500 dark:text-cream-400">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-accent-400 fill-current" />
                    <span>4.9 Rating</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Shield className="w-4 h-4 text-haven-600 dark:text-haven-400" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4 text-accent-500" />
                    <span>50K+ Users</span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-haven-800 dark:text-cream-200 mb-2"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div
                    className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                      fieldFocus.name
                        ? "text-accent-500"
                        : "text-haven-400 dark:text-haven-500"
                    }`}
                  >
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => handleFocus("name")}
                    onBlur={() => handleBlur("name")}
                    className={getInputClasses("name", validationErrors.name)}
                    placeholder="Enter your full name"
                  />
                  {validationErrors.name && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                  {formData.name && !validationErrors.name && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <CheckCircle className="h-5 w-5 text-haven-600 dark:text-haven-400" />
                    </div>
                  )}
                </div>
                <AnimatePresence>
                  {validationErrors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-1 text-sm text-red-600 dark:text-red-400"
                    >
                      {validationErrors.name}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-haven-800 dark:text-cream-200 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div
                    className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                      fieldFocus.email
                        ? "text-accent-500"
                        : "text-haven-400 dark:text-haven-500"
                    }`}
                  >
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus("email")}
                    onBlur={() => handleBlur("email")}
                    className={getInputClasses("email", validationErrors.email)}
                    placeholder="name@company.com"
                  />
                  {validationErrors.email && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    </div>
                  )}
                  {formData.email && !validationErrors.email && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <CheckCircle className="h-5 w-5 text-haven-600 dark:text-haven-400" />
                    </div>
                  )}
                </div>
                <AnimatePresence>
                  {validationErrors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-1 text-sm text-red-600 dark:text-red-400"
                    >
                      {validationErrors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-haven-800 dark:text-cream-200 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <div
                    className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                      fieldFocus.password
                        ? "text-accent-500"
                        : "text-haven-400 dark:text-haven-500"
                    }`}
                  >
                    <Key className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    id="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => handleFocus("password")}
                    onBlur={() => handleBlur("password")}
                    className={`${getInputClasses("password", validationErrors.password)} pr-12`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-haven-400 dark:text-haven-500 hover:text-haven-700 dark:hover:text-cream-200 transition-colors p-1"
                  >
                    {showPassword ? (
                      <FaEyeSlash size={18} />
                    ) : (
                      <FaEye size={18} />
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {formData.password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm text-haven-600 dark:text-cream-400">
                          Password strength:
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            passwordStrength < 50
                              ? "text-red-500"
                              : passwordStrength < 75
                              ? "text-accent-600"
                              : "text-haven-600 dark:text-haven-400"
                          }`}
                        >
                          {passwordStrength < 50
                            ? "Weak"
                            : passwordStrength < 75
                            ? "Medium"
                            : "Strong"}
                        </span>
                      </div>
                      <div className="w-full bg-cream-300 dark:bg-haven-700 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${passwordStrength}%` }}
                          transition={{ duration: 0.3 }}
                          className={`h-2 rounded-full transition-colors duration-300 ${
                            passwordStrength < 50
                              ? "bg-red-500"
                              : passwordStrength < 75
                              ? "bg-accent-400"
                              : "bg-haven-600"
                          }`}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {validationErrors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-1 text-sm text-red-600 dark:text-red-400"
                    >
                      {validationErrors.password}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || hasValidationErrors}
                className={`${authStyles.button} !py-4 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    <span>Create Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Features */}
              <div className="grid grid-cols-3 gap-4 py-4">
                <div className="text-center">
                  <div className="w-8 h-8 bg-cream-200 dark:bg-haven-800 rounded-haven flex items-center justify-center mx-auto mb-2">
                    <Shield className="w-4 h-4 text-haven-700 dark:text-haven-400" />
                  </div>
                  <p className="text-xs text-haven-600 dark:text-cream-400">
                    Secure
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-cream-200 dark:bg-haven-800 rounded-haven flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-4 h-4 text-haven-700 dark:text-haven-400" />
                  </div>
                  <p className="text-xs text-haven-600 dark:text-cream-400">
                    Verified
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-cream-200 dark:bg-haven-800 rounded-haven flex items-center justify-center mx-auto mb-2">
                    <Star className="w-4 h-4 text-accent-500 fill-current" />
                  </div>
                  <p className="text-xs text-haven-600 dark:text-cream-400">
                    Premium
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-cream-400 dark:border-haven-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-haven-900 text-haven-500 dark:text-cream-400">
                    Already have an account?
                  </span>
                </div>
              </div>

              {/* Sign In Link */}
              <Link
                to="/login"
                className={`${authStyles.socialButton} dark:border-haven-600 dark:text-cream-200 dark:hover:bg-haven-800 group`}
              >
                <span className="group-hover:mr-1 transition-all duration-200">
                  Sign in to your account
                </span>
                <ArrowRight className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-all duration-200" />
              </Link>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
