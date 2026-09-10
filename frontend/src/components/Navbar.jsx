import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  Bell,
  Settings,
  UserCircle,
  Heart,
  DollarSign,
  Sun,
  Moon,
  BotMessageSquare,
} from "lucide-react";
import logo from "../assets/images/logo.JPEG";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";
import { useSettings } from "../context/SettingsContext";
import { useTheme } from "../context/ThemeContext";

const NAV_LINKS = [
  { name: "Home", path: "/" },
  { name: "Properties", path: "/properties" },
  { name: "Plots", path: "/plots" },
  { name: "Cars", path: "/cars" },
  { name: "Services", path: "/services" },
  { name: "About Us", path: "/about" },
  { name: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notificationCount] = useState(0);
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef(null);
  const currencyDropdownRef = useRef(null);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();
  const { currency, setCurrency, currencies, currencySymbols } = useCurrency();
  const { settings } = useSettings();
  const { toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const companyLogo = settings?.companyLogo || logo;
  const companyName = settings?.companyName || "NGENZI REALESTATE";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (currencyDropdownRef.current && !currencyDropdownRef.current.contains(event.target)) {
        setIsCurrencyDropdownOpen(false);
      }
    };

    if (isDropdownOpen || isCurrencyDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen, isCurrencyDropdownOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    setImageError(false);
  }, [user?.image, user?.profileImage]);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };

  const isAIHubActive = location.pathname.startsWith("/ai-property-hub");

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-cream-100/95 dark:bg-haven-950/95 shadow-soft backdrop-blur-xl border-b border-cream-400/70 dark:border-haven-800"
          : "bg-cream-100/90 dark:bg-haven-950/90 backdrop-blur-md border-b border-cream-300/50 dark:border-haven-800/80"
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[4.5rem]">
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <img
              src={companyLogo}
              alt={companyName}
              className="h-11 w-auto object-contain"
              onError={(e) => {
                e.target.src = logo;
              }}
            />
            <div className="hidden xl:block leading-tight">
              <p className="font-display text-lg text-haven-900 dark:text-cream-100 tracking-wide">
                {companyName.split(" ")[0]}
              </p>
              <p className="text-[9px] uppercase tracking-[0.22em] text-accent-600 font-semibold">
                Real Estate
              </p>
            </div>
          </Link>

          {/* Desktop nav — centered caps links */}
          <div className="hidden lg:flex items-center justify-center flex-1 px-4">
            <div className="flex items-center gap-1 xl:gap-2">
              {NAV_LINKS.map(({ name, path }) => {
                const isActive =
                  path === "/" ? location.pathname === path : location.pathname.startsWith(path);
                return (
                  <Link
                    key={name}
                    to={path}
                    className={`relative px-2.5 xl:px-3 py-2 text-[10px] xl:text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                      isActive
                        ? "text-haven-900 dark:text-accent-300"
                        : "text-haven-700/70 dark:text-cream-200/60 hover:text-haven-900 dark:hover:text-cream-100"
                    }`}
                  >
                    {name}
                    {isActive && (
                      <motion.span
                        layoutId="navUnderline"
                        className="absolute left-2.5 right-2.5 -bottom-0.5 h-px bg-accent-400"
                      />
                    )}
                  </Link>
                );
              })}
              <Link
                to="/ai-property-hub"
                className={`ml-1 inline-flex items-center gap-1.5 px-3 py-2 text-[10px] xl:text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                  isAIHubActive
                    ? "text-accent-600"
                    : "text-haven-700/70 dark:text-cream-200/60 hover:text-accent-600"
                }`}
              >
                <BotMessageSquare className="w-3.5 h-3.5" />
                AI
              </Link>
            </div>
          </div>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3 flex-shrink-0">
            <div className="relative" ref={currencyDropdownRef}>
              <button
                onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-2 text-haven-700 dark:text-cream-200 hover:text-haven-900 dark:hover:text-white transition-colors"
                title="Change Currency"
              >
                <DollarSign className="w-4 h-4" />
                <span className="text-xs font-semibold tracking-wide">{currency}</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform ${isCurrencyDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {isCurrencyDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 mt-2 w-44 bg-cream-100 dark:bg-haven-900 border border-cream-400 dark:border-haven-700 shadow-soft z-50 overflow-hidden"
                  >
                    {currencies.map((curr) => (
                      <button
                        key={curr}
                        onClick={() => {
                          setCurrency(curr);
                          setIsCurrencyDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between ${
                          currency === curr
                            ? "bg-haven-900 text-white"
                            : "text-haven-800 dark:text-cream-100 hover:bg-cream-300 dark:hover:bg-haven-800"
                        }`}
                      >
                        <span>
                          {currencySymbols[curr]} {curr}
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 text-haven-700 dark:text-cream-200 hover:text-haven-900 dark:hover:text-white transition-colors"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-accent-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/notifications")}
                  className="relative p-2 text-haven-700 dark:text-cream-200 hover:text-haven-900 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-accent-500 text-haven-900 text-[10px] rounded-full flex items-center justify-center font-bold px-1">
                      {notificationCount > 99 ? "99+" : notificationCount}
                    </span>
                  )}
                </button>

                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="focus:outline-none"
                    aria-label="User menu"
                    aria-expanded={isDropdownOpen}
                  >
                    {(user?.image || user?.profileImage) && !imageError ? (
                      <img
                        src={user.image || user.profileImage}
                        alt={user?.name || "Profile"}
                        className="w-9 h-9 object-cover border border-cream-400"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <div className="w-9 h-9 bg-haven-900 text-white flex items-center justify-center text-xs font-semibold">
                        {getInitials(user?.name)}
                      </div>
                    )}
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute right-0 mt-3 w-64 bg-cream-100 dark:bg-haven-900 border border-cream-400 dark:border-haven-700 shadow-soft overflow-hidden z-50"
                      >
                        <div className="px-5 py-4 border-b border-cream-400 dark:border-haven-700 bg-haven-900 text-white">
                          <p className="text-sm font-semibold">{user?.name}</p>
                          <p className="text-xs text-cream-200/70 truncate mt-0.5">{user?.email}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            to="/profile"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-3 px-5 py-3 text-sm text-haven-800 dark:text-cream-100 hover:bg-cream-300 dark:hover:bg-haven-800"
                          >
                            <UserCircle className="w-4 h-4 text-accent-500" />
                            My Profile
                          </Link>
                          <Link
                            to="/saved-properties"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-3 px-5 py-3 text-sm text-haven-800 dark:text-cream-100 hover:bg-cream-300 dark:hover:bg-haven-800"
                          >
                            <Heart className="w-4 h-4 text-accent-500" />
                            Saved Properties
                          </Link>
                          <Link
                            to="/settings"
                            onClick={() => setIsDropdownOpen(false)}
                            className="flex items-center gap-3 px-5 py-3 text-sm text-haven-800 dark:text-cream-100 hover:bg-cream-300 dark:hover:bg-haven-800"
                          >
                            <Settings className="w-4 h-4 text-accent-500" />
                            Settings
                          </Link>
                          <div className="border-t border-cream-400 dark:border-haven-700 my-1" />
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-5 py-3 text-sm text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/login")}
                  className="p-2 text-haven-700 dark:text-cream-200 hover:text-haven-900 transition-colors"
                  aria-label="Login"
                  title="Sign in"
                >
                  <UserCircle className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigate("/properties")}
                  className="btn-haven !py-2.5 !px-5"
                >
                  Book Now
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-haven-800 dark:text-cream-100"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-cream-100 dark:bg-haven-950 border-t border-cream-400 dark:border-haven-800 max-h-[calc(100vh-4.5rem)] overflow-y-auto"
          >
            <div className="px-4 py-5 space-y-1">
              <Link
                to="/ai-property-hub"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 mb-3 ${
                  isAIHubActive
                    ? "bg-haven-900 text-white"
                    : "bg-cream-300/60 dark:bg-haven-900 text-haven-900 dark:text-cream-100"
                }`}
              >
                <BotMessageSquare className="w-5 h-5 text-accent-500" />
                <div>
                  <div className="text-sm font-semibold">AI Property Hub</div>
                  <div className="text-xs opacity-70">Smart recommendations</div>
                </div>
              </Link>

              {NAV_LINKS.map(({ name, path }) => {
                const isActive =
                  path === "/" ? location.pathname === path : location.pathname.startsWith(path);
                return (
                  <Link
                    key={name}
                    to={path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] ${
                      isActive
                        ? "bg-haven-900 text-white"
                        : "text-haven-800 dark:text-cream-100 hover:bg-cream-300 dark:hover:bg-haven-900"
                    }`}
                  >
                    {name}
                  </Link>
                );
              })}

              <div className="pt-4 border-t border-cream-400 dark:border-haven-800 mt-3 space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={toggleTheme}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-3 border border-cream-400 dark:border-haven-700 text-sm text-haven-800 dark:text-cream-100"
                  >
                    {isDark ? <Sun className="w-4 h-4 text-accent-400" /> : <Moon className="w-4 h-4" />}
                    {isDark ? "Light" : "Dark"}
                  </button>
                  <div className="relative flex-1">
                    <button
                      onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-3 border border-cream-400 dark:border-haven-700 text-sm text-haven-800 dark:text-cream-100"
                    >
                      <DollarSign className="w-4 h-4" />
                      {currency}
                    </button>
                    {isCurrencyDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-1 bg-cream-100 dark:bg-haven-900 border border-cream-400 dark:border-haven-700 z-50 shadow-soft">
                        {currencies.map((curr) => (
                          <button
                            key={curr}
                            onClick={() => {
                              setCurrency(curr);
                              setIsCurrencyDropdownOpen(false);
                            }}
                            className={`w-full px-3 py-2.5 text-left text-sm ${
                              currency === curr
                                ? "bg-haven-900 text-white"
                                : "text-haven-800 dark:text-cream-100"
                            }`}
                          >
                            {currencySymbols[curr]} {curr}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {isLoggedIn ? (
                  <div className="space-y-2 pt-2">
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 text-sm text-haven-800 dark:text-cream-100 border border-cream-400 dark:border-haven-700"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/saved-properties"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 text-sm text-haven-800 dark:text-cream-100 border border-cream-400 dark:border-haven-700"
                    >
                      Saved Properties
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-3 text-sm text-haven-800 dark:text-cream-100 border border-cream-400 dark:border-haven-700"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 text-sm text-red-700 bg-red-50 dark:bg-red-950/20"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        navigate("/login");
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 border border-cream-400 dark:border-haven-700 text-sm text-haven-800 dark:text-cream-100"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        navigate("/properties");
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full btn-haven"
                    >
                      Book Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
