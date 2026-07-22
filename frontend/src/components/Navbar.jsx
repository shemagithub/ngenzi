import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  Home,
  Search,
  Users,
  MessageCircle,
  Sparkles,
  BotMessageSquare,
  Bell,
  Settings,
  UserCircle,
  Heart,
  Zap,
  Crown,
  Map,
  Car,
  Briefcase,
  DollarSign,
  Sun,
  Moon,
} from "lucide-react";
import logo from "../assets/images/logo.JPEG";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";
import { useSettings } from "../context/SettingsContext";
import { useTheme } from "../context/ThemeContext";
import PropTypes from "prop-types";

// Enhanced Animation Variants
const navVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  }
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 25
    }
  }
};

const floatingAnimation = {
  y: [-2, 2, -2],
  transition: {
    duration: 4,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

const glowAnimation = {
  boxShadow: [
    "0 0 20px rgba(59, 130, 246, 0.2)",
    "0 0 40px rgba(59, 130, 246, 0.4)",
    "0 0 20px rgba(59, 130, 246, 0.2)"
  ],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

const sparkleVariants = {
  animate: {
    scale: [1, 1.3, 1],
    rotate: [0, 180, 360],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [imageError, setImageError] = useState(false);
  const dropdownRef = useRef(null);
  const currencyDropdownRef = useRef(null);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const { isLoggedIn, user, logout } = useAuth();
  const { currency, setCurrency, formatPrice, getCurrencySymbol, currencies, currencySymbols } = useCurrency();
  const { settings } = useSettings();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get logo from settings or use default
  const companyLogo = settings?.companyLogo || logo;
  const companyName = settings?.companyName || 'NGENZI REALESTATE';

  // Handle click outside of dropdown
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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen, isCurrencyDropdownOpen]);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Reset image error when user changes
  useEffect(() => {
    setImageError(false);
  }, [user?.image, user?.profileImage]);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

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

  return (
    <motion.nav
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 dark:bg-gray-900/95 shadow-xl backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50"
          : "bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-100/80 dark:border-gray-800/80"
      }`}
    >
      {/* Premium gradient border */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Enhanced Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.div
              variants={logoVariants}
              whileHover={{ 
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              className="relative"
            >
              <img 
                src={companyLogo} 
                alt={companyName} 
                className="h-12 w-auto object-contain"
                onError={(e) => {
                  e.target.src = logo; // Fallback to default logo if settings logo fails
                }}
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4 lg:space-x-8">
            <NavLinks currentPath={location.pathname} />

            {/* Enhanced Auth Section */}
            <div className="flex items-center space-x-4">
              {/* Currency Selector */}
              <div className="relative" ref={currencyDropdownRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                  title="Change Currency"
                >
                  <DollarSign className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{currency}</span>
                  <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isCurrencyDropdownOpen ? 'rotate-180' : ''}`} />
                </motion.button>

                {/* Currency Dropdown */}
                <AnimatePresence>
                  {isCurrencyDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                    >
                      <div className="py-2">
                        {currencies.map((curr) => (
                          <motion.button
                            key={curr}
                            whileHover={{ backgroundColor: "rgb(243 244 246)" }}
                            onClick={() => {
                              setCurrency(curr);
                              setIsCurrencyDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between transition-colors ${
                              currency === curr ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-base">{currencySymbols[curr]}</span>
                              <span>{curr}</span>
                            </div>
                            {currency === curr && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full" />
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Theme Toggle Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                )}
              </motion.button>

              {isLoggedIn ? (
                <div className="flex items-center space-x-3">
                  {/* Notification Bell */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/notifications')}
                    className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5 text-gray-600" />
                    {notificationCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium px-1"
                      >
                        {notificationCount > 99 ? '99+' : notificationCount}
                      </motion.span>
                    )}
                  </motion.button>

                  {/* User Profile Dropdown - Profile Image or Icon */}
                  <div className="relative" ref={dropdownRef}>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={toggleDropdown}
                      className="p-1.5 rounded-xl hover:bg-gray-50 transition-all duration-200 focus:outline-none"
                      aria-label="User menu"
                      aria-expanded={isDropdownOpen}
                    >
                      <div className="relative">
                        {(user?.image || user?.profileImage) && !imageError ? (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="w-10 h-10 rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg"
                          >
                            <img
                              src={user.image || user.profileImage}
                              alt={user?.name || 'Profile'}
                              className="w-full h-full object-cover"
                              onError={() => setImageError(true)}
                            />
                          </motion.div>
                        ) : (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/30"
                          >
                            {getInitials(user?.name)}
                          </motion.div>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-400 border-2 border-white rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute -bottom-1 left-1/2 transform -translate-x-1/2"
                      >
                        <ChevronDown className="w-3 h-3 text-gray-400" />
                      </motion.div>
                    </motion.button>

                    {/* Enhanced Dropdown Menu */}
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
                        >
                          {/* Header */}
                          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
                            <div className="flex items-center space-x-3">
                              {(user?.image || user?.profileImage) && !imageError ? (
                                <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
                                  <img
                                    src={user.image || user.profileImage}
                                    alt={user?.name || 'Profile'}
                                    className="w-full h-full object-cover"
                                    onError={() => setImageError(true)}
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
                                  {getInitials(user?.name)}
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                                <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                              </div>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="py-2">
                            <Link to="/profile">
                              <motion.button
                                whileHover={{ x: 4, backgroundColor: "rgb(243 244 246)" }}
                                onClick={() => setIsDropdownOpen(false)}
                                className="w-full px-6 py-3 text-left text-sm text-gray-700 hover:text-blue-600 flex items-center space-x-3 transition-colors"
                              >
                                <UserCircle className="w-4 h-4" />
                                <span>My Profile</span>
                              </motion.button>
                            </Link>
                            <Link to="/saved-properties">
                              <motion.button
                                whileHover={{ x: 4, backgroundColor: "rgb(243 244 246)" }}
                                onClick={() => setIsDropdownOpen(false)}
                                className="w-full px-6 py-3 text-left text-sm text-gray-700 hover:text-blue-600 flex items-center space-x-3 transition-colors"
                              >
                                <Heart className="w-4 h-4" />
                                <span>Saved Properties</span>
                              </motion.button>
                            </Link>
                            <Link to="/settings">
                              <motion.button
                                whileHover={{ x: 4, backgroundColor: "rgb(243 244 246)" }}
                                onClick={() => setIsDropdownOpen(false)}
                                className="w-full px-6 py-3 text-left text-sm text-gray-700 hover:text-blue-600 flex items-center space-x-3 transition-colors"
                              >
                                <Settings className="w-4 h-4" />
                                <span>Settings</span>
                              </motion.button>
                            </Link>
                            <div className="border-t border-gray-100 my-2" />
                            <motion.button
                              whileHover={{ x: 4, backgroundColor: "rgb(254 242 242)" }}
                              onClick={handleLogout}
                              className="w-full px-6 py-3 text-left text-sm text-red-600 hover:text-red-700 flex items-center space-x-3 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              <span>Sign out</span>
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                  className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 focus:outline-none"
                  aria-label="Login"
                  title="Sign in"
                >
                  <UserCircle className="w-8 h-8 text-gray-600 hover:text-blue-600 transition-colors" />
                </motion.button>
              )}
            </div>
          </div>

          {/* Enhanced Mobile menu button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleMobileMenu}
            className="md:hidden relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <motion.div
              animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </motion.div>
            {isLoggedIn && notificationCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
              >
                {notificationCount > 99 ? '99+' : notificationCount}
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>

      {/* Enhanced Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto overscroll-contain"
          >
            <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-4 sm:pb-6">
              <MobileNavLinks
                setMobileMenuOpen={setIsMobileMenuOpen}
                isLoggedIn={isLoggedIn}
                user={user}
                handleLogout={handleLogout}
                currentPath={location.pathname}
                notifications={notificationCount}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

const NavLinks = ({ currentPath }) => {
  // Enhanced NavLinks with modern styling
  const navLinks = [
    { 
      name: "Home", 
      path: "/", 
      icon: Home, 
      color: "from-blue-500 to-cyan-500",
      description: "Welcome home"
    },
    { 
      name: "Properties", 
      path: "/properties", 
      icon: Search, 
      color: "from-green-500 to-emerald-500",
      description: "Find your dream"
    },
    { 
      name: "Plots", 
      path: "/plots", 
      icon: Map, 
      color: "from-amber-500 to-orange-500",
      description: "Explore plots"
    },
    { 
      name: "Cars", 
      path: "/cars", 
      icon: Car, 
      color: "from-sky-500 to-blue-600",
      description: "Browse cars"
    },
    { 
      name: "Services", 
      path: "/services", 
      icon: Briefcase, 
      color: "from-teal-500 to-cyan-500",
      description: "Our services"
    },
    { 
      name: "About Us", 
      path: "/about", 
      icon: Users, 
      color: "from-purple-500 to-pink-500",
      description: "Our story"
    },
    { 
      name: "Contact", 
      path: "/contact", 
      icon: MessageCircle, 
      color: "from-orange-500 to-red-500",
      description: "Get in touch"
    },
  ];

  // Special animation for sparkles
  const [sparkleKey, setSparkleKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSparkleKey((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const isAIHubActive = currentPath.startsWith("/ai-property-hub");

  return (
    <div className="flex space-x-1 lg:space-x-2 items-center flex-wrap">
      {navLinks.map(({ name, path, icon: Icon, color, description }) => {
        const isActive = path === "/" ? currentPath === path : currentPath.startsWith(path);

        return (
          <motion.div
            key={name}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to={path}
              className={`relative group font-medium transition-all duration-300 flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-4 py-2 lg:py-2.5 rounded-lg lg:rounded-xl
                ${isActive
                  ? `text-white bg-gradient-to-r ${color} shadow-lg shadow-blue-500/30`
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 dark:text-gray-300 dark:hover:text-blue-400 dark:hover:bg-gray-800"
                }
              `}
            >
              <Icon className={`w-3.5 h-3.5 lg:w-4 lg:h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-600 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400'}`} />
              <span className="font-semibold text-sm lg:text-base whitespace-nowrap">{name}</span>
              
              {/* Tooltip */}
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap">
                  {description}
                  <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>

              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-white/10 border border-white/20"
                  initial={false}
                />
              )}
            </Link>
          </motion.div>
        );
      })}

      {/* Enhanced AI Property Hub Link */}
      <motion.div
        whileHover={{ y: -2, scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
      >
        <Link
          to="/ai-property-hub"
          className={`relative group font-semibold transition-all duration-300 flex items-center gap-2.5 px-5 py-2.5 rounded-xl overflow-hidden ${
            isAIHubActive
              ? "text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl shadow-purple-500/40"
              : "text-indigo-700 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 hover:text-white border border-indigo-200 hover:border-transparent"
          }`}
        >
          <div className="relative">
            <BotMessageSquare className={`w-5 h-5 ${isAIHubActive ? "text-white" : "text-indigo-600 group-hover:text-white"}`} />
            {/* Animated sparkles */}
            <motion.div
              key={sparkleKey}
              initial={{ opacity: 0, scale: 0, rotate: 0 }}
              animate={{ 
                opacity: [0, 1, 0], 
                scale: [0, 1.2, 0],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="w-3 h-3 text-yellow-400" />
            </motion.div>
          </div>
          <span>AI</span>
          
          {/* Premium badge */}
          {!isAIHubActive && (
            <motion.span
              animate={{ 
                opacity: [0.8, 1, 0.8],
                scale: [0.95, 1, 0.95]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-2"
            >
              <Zap className="w-2.5 h-2.5" />
              NEW
            </motion.span>
          )}

          {/* Animated background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            animate={isAIHubActive ? { x: [-100, 100] } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />

          {/* Active indicator */}
          {isAIHubActive && (
            <motion.div
              layoutId="aiActiveIndicator"
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/20 to-white/10 border border-white/30"
              initial={false}
            />
          )}

          {/* Tooltip */}
          <div className="absolute -bottom-14 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap">
              AI-powered property recommendations
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
};

const MobileNavLinks = ({
  setMobileMenuOpen,
  isLoggedIn,
  user,
  handleLogout,
  currentPath,
  notifications,
}) => {
  // Access currency context
  const { currency, setCurrency, formatPrice, getCurrencySymbol, currencies, currencySymbols } = useCurrency();
  const { theme, toggleTheme, isDark } = useTheme();
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const navigate = useNavigate();
  
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase();
  };
  
  const notificationCount = notifications || 0;

  // Enhanced navigation links with colors and descriptions
  const navLinks = [
    { 
      name: "Home", 
      path: "/", 
      icon: Home, 
      color: "from-blue-500 to-cyan-500",
      description: "Welcome home"
    },
    { 
      name: "Properties", 
      path: "/properties", 
      icon: Search, 
      color: "from-green-500 to-emerald-500",
      description: "Find your dream"
    },
    { 
      name: "Plots", 
      path: "/plots", 
      icon: Map, 
      color: "from-amber-500 to-orange-500",
      description: "Explore plots"
    },
    { 
      name: "Cars", 
      path: "/cars", 
      icon: Car, 
      color: "from-sky-500 to-blue-600",
      description: "Browse cars"
    },
    { 
      name: "Services", 
      path: "/services", 
      icon: Briefcase, 
      color: "from-teal-500 to-cyan-500",
      description: "Our services"
    },
    { 
      name: "About Us", 
      path: "/about", 
      icon: Users, 
      color: "from-purple-500 to-pink-500",
      description: "Our story"
    },
    { 
      name: "Contact", 
      path: "/contact", 
      icon: MessageCircle, 
      color: "from-orange-500 to-red-500",
      description: "Get in touch"
    },
  ];

  const isAIHubActive = currentPath.startsWith("/ai-property-hub");

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col space-y-2 sm:space-y-3"
    >
      {/* Enhanced AI Property Hub for Mobile */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="px-1 sm:px-2"
      >
        <Link
          to="/ai-property-hub"
          onClick={() => setMobileMenuOpen(false)}
          className={`relative flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl shadow-lg transition-all duration-300 overflow-hidden ${
            isAIHubActive
              ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-purple-500/30"
              : "bg-gradient-to-r from-indigo-50 dark:from-indigo-900/30 via-purple-50 dark:via-purple-900/30 to-pink-50 dark:to-pink-900/30 text-indigo-700 dark:text-indigo-300 border-2 border-indigo-100 dark:border-indigo-800"
          }`}
        >
          <div className="relative flex-shrink-0">
            <motion.div
              animate={floatingAnimation}
              className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl ${isAIHubActive ? 'bg-white/20' : 'bg-indigo-100 dark:bg-indigo-800/50'}`}
            >
              <BotMessageSquare className={`w-5 h-5 sm:w-6 sm:h-6 ${isAIHubActive ? 'text-white' : 'text-indigo-600'}`} />
            </motion.div>
            <motion.div
              animate={{ 
                rotate: [0, 15, -15, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                repeatType: "loop",
              }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
            </motion.div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-base sm:text-lg dark:text-gray-100 truncate">AI Property Hub</div>
            <div className={`text-xs sm:text-sm ${isAIHubActive ? "text-indigo-100" : "text-indigo-500 dark:text-indigo-400"} truncate`}>
              Smart property recommendations
            </div>
          </div>
          {!isAIHubActive && (
            <motion.span 
              animate={{ scale: [0.9, 1.1, 0.9] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 rounded-full text-[10px] sm:text-xs font-bold shadow-lg flex items-center gap-1 flex-shrink-0"
            >
              <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span className="hidden sm:inline">NEW</span>
            </motion.span>
          )}
          
          {/* Animated background */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent opacity-0"
            animate={isAIHubActive ? { x: [-100, 100], opacity: [0, 0.3, 0] } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </Link>
      </motion.div>

      {/* Elegant separator */}
      <div className="flex items-center gap-4 px-2">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">Navigation</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
      </div>

      {/* Enhanced Navigation Links */}
      {navLinks.map(({ name, path, icon: Icon, color, description }, index) => {
        const isActive = path === "/" ? currentPath === path : currentPath.startsWith(path);

        return (
          <motion.div 
            key={name}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 + (index * 0.05) }}
          >
            <Link
              to={path}
              className={`flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl transition-all duration-300 group ${
                isActive
                  ? `bg-gradient-to-r ${color} text-white shadow-lg`
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 active:scale-95"
              }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${isActive ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30'}`}>
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`font-semibold text-sm sm:text-base ${isActive ? 'text-white' : 'text-gray-900 dark:text-gray-100'} truncate`}>
                  {name}
                </div>
                <div className={`text-xs sm:text-sm ${isActive ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'} truncate`}>
                  {description}
                </div>
              </div>
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-2 h-2 bg-white rounded-full flex-shrink-0"
                />
              )}
            </Link>
          </motion.div>
        );
      })}

      {/* Currency Selector - Mobile */}
      <div className="pt-3 sm:pt-4 px-1 sm:px-2">
        <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
          <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-medium">Currency</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
        </div>
        <div className="relative mb-3 sm:mb-4">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCurrencyDropdownOpen(!isCurrencyDropdownOpen)}
            className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{currency} {getCurrencySymbol()}</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 dark:text-gray-500 transition-transform flex-shrink-0 ${isCurrencyDropdownOpen ? 'rotate-180' : ''}`} />
          </motion.button>

          {/* Currency Dropdown - Mobile */}
          <AnimatePresence>
            {isCurrencyDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="py-2">
                  {currencies.map((curr) => (
                    <motion.button
                      key={curr}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setCurrency(curr);
                        setIsCurrencyDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-sm flex items-center justify-between ${
                        currency === curr 
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-base">{currencySymbols[curr]}</span>
                        <span>{curr}</span>
                      </div>
                      {currency === curr && (
                        <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Theme Toggle - Mobile */}
      <div className="pt-2 px-1 sm:px-2 mb-3 sm:mb-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <div className="flex items-center space-x-2">
            {isDark ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300 flex-shrink-0" />
            )}
            <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
              {isDark ? "Light Mode" : "Dark Mode"}
            </span>
          </div>
        </motion.button>
      </div>

      {/* Enhanced Auth Section for Mobile */}
      <div className="pt-3 sm:pt-4 mt-2">
        <div className="flex items-center gap-2 sm:gap-4 px-1 sm:px-2 mb-3 sm:mb-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
          <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-medium">Account</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
        </div>

        {isLoggedIn ? (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-4 px-2"
          >
            {/* Enhanced User Profile Card - Profile Image or Icon */}
            <div className="relative flex justify-center">
              <div className="relative">
                {(user?.image || user?.profileImage) && !imageError ? (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-lg"
                  >
                    <img
                      src={user.image || user.profileImage}
                      alt={user?.name || 'Profile'}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg"
                  >
                    {user?.name ? getInitials(user.name) : "U"}
                  </motion.div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-600 rounded-full" />
                </div>
                {notificationCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                  >
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </motion.div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <Link
                to="/saved-properties"
                onClick={() => setMobileMenuOpen(false)}
              >
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
                >
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">Saved</span>
                </motion.button>
              </Link>
              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
              >
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg sm:rounded-xl hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
                >
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 truncate">Settings</span>
                </motion.button>
              </Link>
            </div>

            {/* Logout Button */}
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg sm:rounded-xl transition-all font-semibold text-sm sm:text-base"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>Sign out</span>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex justify-center px-2"
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                navigate('/login');
                setMobileMenuOpen(false);
              }}
              className="p-3 sm:p-4 rounded-lg sm:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 focus:outline-none"
              aria-label="Login"
            >
              <UserCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

NavLinks.propTypes = {
  currentPath: PropTypes.string.isRequired,
};

MobileNavLinks.propTypes = {
  setMobileMenuOpen: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  user: PropTypes.object,
  handleLogout: PropTypes.func.isRequired,
  currentPath: PropTypes.string.isRequired,
  notifications: PropTypes.number,
};

export default Navbar;
