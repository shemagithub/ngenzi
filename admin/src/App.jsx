import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { ErrorBoundary } from "react-error-boundary";
import { motion, AnimatePresence } from "framer-motion";

import { AuthProvider } from "./contexts/AuthContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";

import AdminShell from "./components/AdminShell";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorFallback from "./components/ErrorFallback";
import DynamicHead from "./components/DynamicHead";

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

import { APP_CONSTANTS } from "./config/constants";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const AppLayout = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  const routes = (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        transition={{ duration: 0.22 }}
      >
        <Routes location={location}>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

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

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );

  if (isLoginPage) {
    return routes;
  }

  return <AdminShell>{routes}</AdminShell>;
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

        <Toaster
          position="top-right"
          toastOptions={{
            duration: APP_CONSTANTS.DEFAULT_TOAST_DURATION,
            style: {
              background: "#122620",
              color: "#f7f5f0",
              borderRadius: "12px",
              fontSize: "14px",
              border: "1px solid rgba(196,165,116,0.35)",
            },
            success: {
              iconTheme: {
                primary: "#c4a574",
                secondary: "#122620",
              },
            },
            error: {
              iconTheme: {
                primary: "#f87171",
                secondary: "#fff",
              },
            },
          }}
        />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
