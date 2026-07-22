import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "react-error-boundary";
import { motion, AnimatePresence } from "framer-motion";





// Context
import { AuthProvider } from "./contexts/AuthContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";

// Components
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorFallback from "./components/ErrorFallback";
import DynamicHead from "./components/DynamicHead";

// Pages
import Login from "./components/login";
import Dashboard from "./pages/Dashboard";
import PropertyListings from "./pages/List";
import Add from "./pages/Add";
import Update from "./pages/Update";
import Appointments from "./pages/Appointments";
import PlotListings from "./pages/ListPlots";
import CarListings from "./pages/ListCars";
import AddPlots from "./pages/AddPlots";
import AddCars from "./pages/AddCars";
import UpdatePlots from "./pages/UpdatePlots";
import UpdateCars from "./pages/UpdateCars";
import ViewProperty from "./pages/ViewProperty";
import ViewPlot from "./pages/ViewPlot";
import ViewCar from "./pages/ViewCar";
import SettingsPage from "./pages/Settings";
import ServicesManagement from "./pages/ServicesManagement";
import BlogsManagement from "./pages/BlogsManagement";
import TeamManagement from "./pages/TeamManagement";
import TestimonialsManagement from "./pages/TestimonialsManagement";
import UsersManagement from "./pages/UsersManagement";

// Config
import { APP_CONSTANTS } from "./config/constants";

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

// App Layout component
const AppLayout = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-gray-50">
      {!isLoginPage && <Navbar />}
      
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={pageVariants}
          transition={{ duration: 0.3 }}
          className={!isLoginPage ? "pt-16" : ""}
        >
          <Routes location={location}>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/list" element={<PropertyListings />} />
              <Route path="/view-property/:id" element={<ViewProperty />} />
              <Route path="/add" element={<Add />} />
              <Route path="/list-plots" element={<PlotListings />} />
              <Route path="/list-cars" element={<CarListings />} />
              <Route path="/view-plot/:id" element={<ViewPlot />} />
              <Route path="/view-car/:id" element={<ViewCar />} />
              <Route path="/add-plots" element={<AddPlots />} />
              <Route path="/add-cars" element={<AddCars />} />
              <Route path="/update-plot/:id" element={<UpdatePlots />} />
              <Route path="/update-car/:id" element={<UpdateCars />} />
              <Route path="/services" element={<ServicesManagement />} />
              <Route path="/blogs" element={<BlogsManagement />} />
              <Route path="/team" element={<TeamManagement />} />
              <Route path="/testimonials" element={<TestimonialsManagement />} />
              <Route path="/users" element={<UsersManagement />} />
              <Route path="/update/:id" element={<Update />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const App = () => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      <AuthProvider>
        <CurrencyProvider>
          <DynamicHead />
          <AppLayout />
        </CurrencyProvider>
        
        {/* Toast Notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: APP_CONSTANTS.DEFAULT_TOAST_DURATION,
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;