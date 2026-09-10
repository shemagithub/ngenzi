import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, Loader, Shield, CheckCircle, Key } from "lucide-react";
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

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${Backendurl}/api/users/forgot`, {
        email,
      });
      if (response.data.success) {
        setIsSuccess(true);
        toast.success("Reset link sent to your email!");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error sending reset email:", error);
      toast.error("Failed to send reset link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-cream-200 dark:bg-haven-950 flex items-center justify-center px-4 py-12 transition-colors duration-200">
      <SEOHead title="Forgot Password" description="Reset your NGENZI REALESTATE password." noindex canonicalPath="/forgot-password" />
      <div className="absolute inset-0 bg-gradient-to-br from-cream-200 via-cream-100 to-cream-300 dark:from-haven-950 dark:via-haven-900 dark:to-haven-950" />
      <div className="absolute inset-0 bg-gradient-to-t from-haven-950/5 via-transparent to-transparent dark:from-haven-950/40" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white dark:bg-haven-900 border border-cream-400 dark:border-haven-700 rounded-haven shadow-soft p-8">
          {/* Success State */}
          <AnimatePresence>
            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="text-center mb-8"
              >
                <div className="w-20 h-20 bg-haven-900 dark:bg-haven-700 rounded-haven flex items-center justify-center mx-auto mb-4 shadow-haven">
                  <CheckCircle className="w-10 h-10 text-cream-100" />
                </div>
                <h3 className="font-display text-xl font-semibold text-haven-900 dark:text-cream-100 mb-2">
                  Email Sent!
                </h3>
                <p className="text-haven-600 dark:text-cream-300 text-sm">
                  Check your inbox for reset instructions.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Logo & Title */}
          {!isSuccess && (
            <div className="text-center mb-8">
              <Link to="/" className="inline-block mb-6">
                <img
                  src={logo}
                  alt="NGENZI REAL ESTATE"
                  className="h-16 w-auto object-contain mx-auto"
                />
              </Link>

              <div className="flex items-center justify-center gap-2 mb-3">
                <Key className="w-5 h-5 text-accent-500" />
                <h2 className="font-display text-2xl font-semibold text-haven-900 dark:text-cream-100">
                  Forgot Password?
                </h2>
              </div>
              <p className="text-haven-600 dark:text-cream-300 text-sm leading-relaxed">
                No worries, we&apos;ll send you reset instructions to get you
                back on track.
              </p>
            </div>
          )}

          {/* Form */}
          {!isSuccess && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-haven-800 dark:text-cream-200 mb-2"
                >
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-200 ${
                      emailFocused
                        ? "text-accent-500"
                        : "text-haven-400 dark:text-haven-500"
                    }`}
                  />
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    className={`${authStyles.input} pl-12 dark:bg-haven-800 dark:border-haven-600 dark:text-cream-100 dark:placeholder-cream-400`}
                    placeholder="Enter your email address"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`${authStyles.button} !py-4 disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className={`inline-flex items-center text-sm ${authStyles.link} group`}
                >
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-0.5 transition-transform duration-200" />
                  Back to login
                </Link>
              </div>
            </form>
          )}

          {/* Success Actions */}
          {isSuccess && (
            <div className="space-y-4">
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setEmail("");
                }}
                className={`${authStyles.socialButton} dark:border-haven-600 dark:text-cream-200 dark:hover:bg-haven-800`}
              >
                <Mail className="w-4 h-4" />
                <span>Send Another Email</span>
              </button>

              <Link
                to="/login"
                className={`block w-full text-center py-3 ${authStyles.link}`}
              >
                Return to Login
              </Link>
            </div>
          )}

          {/* Security Badge */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-haven-500 dark:text-cream-400">
            <Shield className="w-4 h-4 text-haven-600 dark:text-haven-400" />
            <span className="font-medium">
              Secured by 256-bit SSL encryption
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
