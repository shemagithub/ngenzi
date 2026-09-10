import { useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
  Loader,
  ArrowLeft,
  Shield,
  CheckCircle,
  Key,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import { Backendurl } from "../utils/backendUrl";
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

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-accent-400";
      case 3:
        return "bg-haven-500";
      case 4:
      case 5:
        return "bg-haven-700 dark:bg-haven-500";
      default:
        return "bg-cream-400";
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
      case 5:
        return "Strong";
      default:
        return "";
    }
  };

  const getPasswordStrengthTextColor = () => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "text-red-600";
      case 2:
        return "text-accent-700";
      case 3:
        return "text-haven-600 dark:text-haven-400";
      case 4:
      case 5:
        return "text-haven-700 dark:text-haven-400";
      default:
        return "text-haven-600";
    }
  };

  const passwordsMatch =
    password && confirmPassword && password === confirmPassword;
  const isFormValid =
    password && confirmPassword && passwordsMatch && passwordStrength >= 3;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error(
        "Please ensure passwords match and meet strength requirements."
      );
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${Backendurl}/api/users/reset/${token}`,
        { password }
      );
      if (response.data.success) {
        setIsSuccess(true);
        toast.success("Password reset successful!");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-cream-200 dark:bg-haven-950 flex items-center justify-center px-4 py-12 transition-colors duration-200">
      <SEOHead title="Reset Password" description="Choose a new password for your NGENZI REALESTATE account." noindex />
      <div className="absolute inset-0 bg-gradient-to-br from-cream-200 via-cream-100 to-cream-300 dark:from-haven-950 dark:via-haven-900 dark:to-haven-950" />
      <div className="absolute inset-0 bg-gradient-to-t from-haven-950/5 via-transparent to-transparent dark:from-haven-950/40" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white dark:bg-haven-900 border border-cream-400 dark:border-haven-700 rounded-haven shadow-soft p-8 relative overflow-hidden">
          {/* Success State */}
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-white/95 dark:bg-haven-900/95 rounded-haven flex items-center justify-center z-20"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-haven-900 dark:bg-haven-700 rounded-haven flex items-center justify-center mx-auto mb-4 shadow-haven">
                  <CheckCircle className="w-8 h-8 text-cream-100" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-haven-900 dark:text-cream-100 mb-2">
                  Password Reset!
                </h3>
                <p className="text-haven-600 dark:text-cream-300">
                  Redirecting to login...
                </p>
              </div>
            </motion.div>
          )}

          {/* Logo & Title */}
          <div className="text-center mb-8 relative">
            <Link to="/" className="inline-block mb-6">
              <img
                src={logo}
                alt="NGENZI REAL ESTATE"
                className="h-16 w-auto object-contain mx-auto"
              />
            </Link>

            <div className="w-16 h-16 bg-haven-900 dark:bg-haven-700 rounded-haven flex items-center justify-center mx-auto mb-4 shadow-haven">
              <Key className="w-8 h-8 text-cream-100" />
            </div>

            <h2 className="font-display text-2xl font-semibold text-haven-900 dark:text-cream-100 mb-2">
              Reset Password
            </h2>
            <p className="text-haven-600 dark:text-cream-300 text-sm">
              Create a new secure password for your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-haven-800 dark:text-cream-200 mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <div
                  className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 transition-colors duration-200 ${
                    passwordFocused
                      ? "text-accent-500"
                      : "text-haven-400 dark:text-haven-500"
                  }`}
                >
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className={`${authStyles.input} pl-11 pr-12 dark:bg-haven-800 dark:border-haven-600 dark:text-cream-100 dark:placeholder-cream-400`}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-haven-400 dark:text-haven-500 hover:text-haven-700 dark:hover:text-cream-200 transition-colors z-10"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {password && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-haven-600 dark:text-cream-400">
                      Password Strength
                    </span>
                    <span
                      className={`text-xs font-semibold ${getPasswordStrengthTextColor()}`}
                    >
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className="w-full bg-cream-300 dark:bg-haven-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(passwordStrength / 5) * 100}%`,
                      }}
                      className={`h-2 rounded-full transition-all duration-500 ${getPasswordStrengthColor()}`}
                    />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-haven-800 dark:text-cream-200 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div
                  className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 transition-colors duration-200 ${
                    confirmPasswordFocused
                      ? "text-accent-500"
                      : "text-haven-400 dark:text-haven-500"
                  }`}
                >
                  <Shield className="h-5 w-5" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  id="confirmPassword"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                  className={`${authStyles.input} pl-11 pr-12 dark:bg-haven-800 dark:border-haven-600 dark:text-cream-100 dark:placeholder-cream-400`}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-haven-400 dark:text-haven-500 hover:text-haven-700 dark:hover:text-cream-200 transition-colors z-10"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>

              {confirmPassword && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-center space-x-2"
                >
                  {passwordsMatch ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-haven-600 dark:text-haven-400" />
                      <span className="text-xs text-haven-700 dark:text-haven-400 font-medium">
                        Passwords match
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                        Passwords don&apos;t match
                      </span>
                    </>
                  )}
                </motion.div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !isFormValid}
              className={`${authStyles.button} !py-4 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Resetting...</span>
                </>
              ) : (
                <>
                  <Key className="w-5 h-5" />
                  <span>Reset Password</span>
                </>
              )}
            </button>

            <div className="text-center">
              <Link
                to="/login"
                className={`inline-flex items-center justify-center text-sm ${authStyles.link} group`}
              >
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform duration-200" />
                <span>Back to login</span>
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
