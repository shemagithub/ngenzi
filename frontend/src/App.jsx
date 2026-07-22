import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Properties from './pages/Properties'
import PropertyDetails from './components/properties/propertydetail';
import PlotDetails from './components/plots/PlotDetails';
import CarDetails from './components/cars/CarDetails';
import Aboutus from './pages/About'
import Contact from './pages/Contact'
import Login from './components/login';
import Signup from './components/signup';
import ForgotPassword from './components/forgetpassword';
import ResetPassword from './components/resetpassword';
import Footer from './components/footer';
import NotFoundPage from './components/Notfound';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { SettingsProvider } from './context/SettingsContext';
import { ThemeProvider } from './context/ThemeContext';
import AIPropertyHub from './pages/Aiagent'
import MyProfile from './pages/MyProfile';
import SavedProperties from './pages/SavedProperties';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Plots from './pages/Plots';
import Cars from './pages/Cars';
import Services from './pages/Services';
import BlogDetail from './pages/BlogDetail';
import MapSearch from './pages/MapSearch';
import ProtectedRoute from './components/ProtectedRoute';
import StructuredData from './components/SEO/StructuredData';
import DynamicHead from './components/DynamicHead';
import 'react-toastify/dist/ReactToastify.css';


// Import Backendurl from a separate config file to avoid circular dependencies
import { BACKEND_URL } from './utils/backendUrl';

// Export Backendurl for backward compatibility
export const Backendurl = BACKEND_URL;

// Debug: Log the backend URL to verify it's correct
console.log('🔗 Backend URL configured:', Backendurl);
console.log('🔗 Environment VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);

// Verify it's not the old URL
if (Backendurl.includes('ngenzi.guzekustomz.com')) {
  console.error('❌ ERROR: Backend URL is still using old URL!', Backendurl);
} else {
  console.log('✅ Backend URL is correct:', Backendurl);
}

const App = () => {
  return (
    <HelmetProvider>
    <ThemeProvider>
    <AuthProvider>
    <SettingsProvider>
    <CurrencyProvider>
    <Router>
      <ScrollToTop />
      <DynamicHead />
      {/* Base website structured data */}
      <StructuredData type="website" />
      <StructuredData type="organization" />
      
      <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Navbar />
      <main className="pt-16">
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset/:token" element={<ResetPassword />} />
        <Route path="/" element={<Home />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/plots" element={<Plots />} />
        <Route path="/plots/:id" element={<PlotDetails />} />
        <Route path="/cars" element={<Cars />} />
        <Route path="/cars/:id" element={<CarDetails />} />
        <Route path="/services" element={<Services />} />
        <Route path="/blogs/:slug" element={<BlogDetail />} />
        <Route path="/map" element={<MapSearch />} />
        <Route path="/properties/single/:id" element={<PropertyDetails />} />
        <Route path="/about" element={<Aboutus />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/ai-property-hub" element={<AIPropertyHub />} />
        <Route path="/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
        <Route path="/saved-properties" element={<ProtectedRoute><SavedProperties /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </main>
      <Footer />
      <ToastContainer />
      </div>
    </Router>
    </CurrencyProvider>
    </SettingsProvider>
    </AuthProvider>
    </ThemeProvider>
    </HelmetProvider>
  )
}

export default App