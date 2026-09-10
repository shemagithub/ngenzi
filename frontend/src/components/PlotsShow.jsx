import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";
import { 
  MapPin, 
  Maximize, 
  Heart,
  Eye,
  ArrowRight,
  Map,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Backendurl } from '../utils/backendUrl';
import { useCurrency } from '../context/CurrencyContext';
import PlotCard from './plots/Plotcard';

// Sample featured plots for fallback
const samplePlots = [
  {
    _id: "sample1",
    title: "Premium Residential Plot",
    location: "Kigali, Rwanda",
    price: 5000000,
    area: 500,
    areaUnit: "sqft",
    type: "Plot",
    availability: "buy",
    frontImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  },
  {
    _id: "sample2",
    title: "Commercial Plot for Development",
    location: "Musanze, Rwanda",
    price: 8000000,
    area: 1000,
    areaUnit: "sqft",
    type: "Plot",
    availability: "buy",
    frontImage: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  },
  {
    _id: "sample3",
    title: "Luxury Plot with Mountain View",
    location: "Rubavu, Rwanda",
    price: 6500000,
    area: 750,
    areaUnit: "sqft",
    type: "Plot",
    availability: "rent",
    frontImage: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
  }
];

const PlotsShow = () => {
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const navigate = useNavigate();

  const categories = [
    { id: 'all', label: 'All Plots' },
    { id: 'buy', label: 'For Sale' },
    { id: 'rent', label: 'For Rent' },
    { id: 'available', label: 'Available' }
  ];
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  useEffect(() => {
    const fetchPlots = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${Backendurl}/api/plots/list`);
        
        if (response.data.success) {
          // Take only the first 6 plots for featured section
          const featuredPlots = (response.data.plots || []).slice(0, 6);
          setPlots(featuredPlots);
        } else {
          setError('Failed to fetch plots');
          // Fallback to sample data in case of API error
          setPlots(samplePlots);
        }
      } catch (err) {
        console.error('Error fetching plots:', err);
        setError('Failed to load plots. Using sample data instead.');
        // Fallback to sample data
        setPlots(samplePlots);
      } finally {
        setLoading(false);
      }
    };

    fetchPlots();
  }, []);

  const filteredPlots = activeCategory === 'all' 
    ? plots 
    : plots.filter(plot => {
        if (activeCategory === 'buy') {
          return plot.availability?.toLowerCase() === 'buy' || plot.availability?.toLowerCase() === 'sale';
        }
        if (activeCategory === 'rent') {
          return plot.availability?.toLowerCase() === 'rent';
        }
        if (activeCategory === 'available') {
          return plot.availability?.toLowerCase() === 'available';
        }
        return true;
      });

  const viewAllPlots = () => {
    navigate('/plots');
  };

  if (loading) {
    return (
      <div className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-[1600px] mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mx-auto mb-16"></div>
            
            <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg w-full max-w-md mx-auto mb-8 flex justify-center gap-4">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-8 bg-gray-200 dark:bg-gray-700 rounded-full w-24"></div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white dark:bg-gray-800 rounded-xl shadow h-96">
                  <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-t-xl"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-24 bg-cream-200 dark:bg-haven-900/40 transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="section-eyebrow">Explore Plots</p>
          <h2 className="section-title mt-3 mb-2">Featured Land</h2>
          <div className="section-divider" />
          <p className="text-haven-700/70 dark:text-cream-200/60 max-w-2xl mx-auto leading-relaxed">
            Discover our handpicked selection of premium plots perfect for your dream project
          </p>
        </motion.div>

        <motion.div 
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-all duration-200
                ${activeCategory === category.id 
                  ? 'bg-haven-900 text-white' 
                  : 'bg-white dark:bg-haven-900 text-haven-800 dark:text-cream-200 border border-cream-400 dark:border-haven-700 hover:border-haven-900'}`}
            >
              {category.label}
            </button>
          ))}
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800 mb-8 max-w-md mx-auto text-center"
          >
            <p className="font-medium mb-1">Note: {error}</p>
            <p className="text-sm">Showing sample plots for demonstration.</p>
          </motion.div>
        )}

        {plots.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredPlots.map((plot) => (
              <motion.div key={plot.id || plot._id} variants={itemVariants}>
                <PlotCard plot={plot} viewType="grid" />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-200 mb-2">No plots available</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">No plots found in this category.</p>
            <button 
              onClick={() => setActiveCategory('all')} 
              className="btn-haven mt-4"
            >
              View All Plots
            </button>
          </div>
        )}

        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <button
            onClick={viewAllPlots}
            className="inline-flex items-center px-8 py-3 border border-haven-900 dark:border-cream-200 text-haven-900 dark:text-cream-100 text-xs font-semibold uppercase tracking-[0.16em] hover:bg-haven-900 hover:text-white dark:hover:bg-cream-100 dark:hover:text-haven-900 transition-all"
          >
            Browse All Plots
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default PlotsShow;


