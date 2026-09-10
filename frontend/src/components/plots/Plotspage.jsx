import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Grid, List, SlidersHorizontal, MapPin, Map } from "lucide-react";
import SearchBar from "../properties/Searchbar.jsx";
import PlotCard from "./Plotcard.jsx";
import PageHero from "../PageHero";
import { Backendurl } from "../../utils/backendUrl";

const PlotsPage = () => {
  const [searchParams] = useSearchParams();
  const [viewState, setViewState] = useState({
    isGridView: true,
    showFilters: false,
    showMap: false,
  });

  const [plotState, setPlotState] = useState({
    plots: [],
    loading: true,
    error: null,
  });

  const [filters, setFilters] = useState({
    priceRange: [0, Number.MAX_SAFE_INTEGER],
    availability: "",
    searchQuery: searchParams.get("location") || "",
    sortBy: "",
  });

  const fetchPlots = async () => {
    try {
      setPlotState((prev) => ({ ...prev, loading: true }));
      const response = await axios.get(`${Backendurl}/api/plots/list`);
      if (response.data.success) {
        setPlotState((prev) => ({
          ...prev,
          plots: response.data.plots || [],
          error: null,
          loading: false,
        }));
      } else {
        throw new Error(response.data.message || "Failed to fetch plots");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to fetch plots. Please try again later.";
      setPlotState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      console.error("Error fetching plots:", error);
    }
  };

  useEffect(() => {
    fetchPlots();
  }, []);

  // Update filters when URL params change
  useEffect(() => {
    const location = searchParams.get("location");
    
    if (location) {
      setFilters(prev => ({
        ...prev,
        searchQuery: location
      }));
    }
  }, [searchParams]);

  const filteredPlots = useMemo(() => {
    return plotState.plots
      .filter((plot) => {
        const searchMatch = !filters.searchQuery || 
          [plot.title, plot.description, plot.location]
            .some(field => field?.toLowerCase().includes(filters.searchQuery.toLowerCase()));

        const priceMatch = plot.price >= filters.priceRange[0] && 
          plot.price <= filters.priceRange[1];

        const availabilityMatch = !filters.availability || 
          plot.availability?.toLowerCase() === filters.availability.toLowerCase();

        return searchMatch && priceMatch && availabilityMatch;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case "price-asc":
            return a.price - b.price;
          case "price-desc":
            return b.price - a.price;
          case "newest":
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          case "oldest":
            return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          case "area-asc":
            return (a.area || 0) - (b.area || 0);
          case "area-desc":
            return (b.area || 0) - (a.area || 0);
          default:
            return 0;
        }
      });
  }, [plotState.plots, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  if (plotState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-200 dark:bg-haven-950 transition-colors duration-200">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center flex flex-col items-center"
        >
          <div className="relative mb-6">
            <motion.div
              className="w-24 h-24 bg-haven-900 rounded-haven flex items-center justify-center relative shadow-haven"
              animate={{ 
                rotate: [0, 0, 360, 360, 0],
                scale: [1, 0.9, 0.9, 1, 1],
                borderRadius: ["16%", "50%", "50%", "16%", "16%"]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Map className="w-12 h-12 text-white" />
            </motion.div>
          </div>
          
          <h3 className="font-display text-2xl text-haven-900 dark:text-cream-100 mb-3">
            Loading Plots
          </h3>
          
          <p className="text-haven-700/70 dark:text-cream-200/60 mb-5 max-w-xs text-center">
            We're finding the perfect plots that match your preferences...
          </p>
          
          <div className="w-64 h-1 bg-cream-400 dark:bg-haven-800 overflow-hidden relative">
            <motion.div
              className="h-full bg-accent-500 absolute top-0 left-0 w-1/3"
              animate={{ x: ["-100%", "300%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </motion.div>
      </div>
    );
  }

  if (plotState.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-200 dark:bg-haven-950 transition-colors duration-200">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-red-600 dark:text-red-400 p-6 rounded-haven bg-red-50 dark:bg-red-900/20 max-w-md border border-red-200 dark:border-red-800"
        >
          <p className="font-medium mb-4">{plotState.error}</p>
          <button
            onClick={fetchPlots}
            className="btn-haven"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-cream-200 dark:bg-haven-950 transition-colors duration-200"
    >
      <PageHero
        compact
        title="Find Your Perfect Plot"
        subtitle="Discover a curated collection of premium plots for your dream project"
      />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-4">
            {/* Modern Dark-Themed Filter Section */}
            <div className="bg-white dark:bg-haven-900 backdrop-blur-xl p-4 sm:p-6 rounded-haven shadow-soft mb-6 border border-cream-400/80 dark:border-haven-800">
              {/* Search Bar Section */}
              <div className="mb-4 sm:mb-6">
                <SearchBar
                  onSearch={(query) => setFilters(prev => ({ ...prev, searchQuery: query }))}
                  className="flex-1"
                  initialValue={filters.searchQuery}
                />
              </div>

              {/* Filters and View Controls Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                {/* Availability Filter */}
                <div className="relative flex-1 sm:flex-initial sm:min-w-[180px]">
                  <select
                    value={filters.availability}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      availability: e.target.value
                    }))}
                    className="w-full px-4 py-2.5 sm:py-3 bg-cream-100 dark:bg-haven-900 border border-cream-400 dark:border-haven-700 rounded-haven text-xs font-semibold uppercase tracking-[0.1em] text-haven-900 dark:text-cream-100 
                      focus:outline-none focus:ring-2 focus:ring-accent-400/30 focus:border-accent-500 
                      transition-all appearance-none cursor-pointer hover:border-haven-900 dark:hover:border-accent-400"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      paddingRight: '40px'
                    }}
                  >
                    <option value="">All Availability</option>
                    <option value="buy">For Sale</option>
                    <option value="rent">For Rent</option>
                    <option value="available">Available</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>

                {/* Sort By Filter */}
                <div className="relative flex-1 sm:flex-initial sm:min-w-[180px]">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      sortBy: e.target.value
                    }))}
                    className="w-full px-4 py-2.5 sm:py-3 bg-cream-100 dark:bg-haven-900 border border-cream-400 dark:border-haven-700 rounded-haven text-xs font-semibold uppercase tracking-[0.1em] text-haven-900 dark:text-cream-100 
                      focus:outline-none focus:ring-2 focus:ring-accent-400/30 focus:border-accent-500 
                      transition-all appearance-none cursor-pointer hover:border-haven-900 dark:hover:border-accent-400"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      paddingRight: '40px'
                    }}
                  >
                    <option value="">Sort By</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="area-asc">Area: Small to Large</option>
                    <option value="area-desc">Area: Large to Small</option>
                  </select>
                </div>

                {/* View Toggle Buttons */}
                <div className="flex items-center gap-2 sm:gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewState(prev => ({ ...prev, isGridView: true }))}
                    className={`p-2.5 sm:p-3 rounded-haven transition-all duration-200 ${
                      viewState.isGridView 
                        ? "bg-haven-900 text-white shadow-haven" 
                        : "bg-cream-200 dark:bg-haven-800 text-haven-800 dark:text-cream-200 hover:border-haven-900 border border-cream-400 dark:border-haven-700"
                    }`}
                    title="Grid View"
                    aria-label="Switch to grid view"
                  >
                    <Grid className="w-5 h-5 sm:w-6 sm:h-6" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewState(prev => ({ ...prev, isGridView: false }))}
                    className={`p-2.5 sm:p-3 rounded-haven transition-all duration-200 ${
                      !viewState.isGridView 
                        ? "bg-haven-900 text-white shadow-haven" 
                        : "bg-cream-200 dark:bg-haven-800 text-haven-800 dark:text-cream-200 hover:border-haven-900 border border-cream-400 dark:border-haven-700"
                    }`}
                    title="List View"
                    aria-label="Switch to list view"
                  >
                    <List className="w-5 h-5 sm:w-6 sm:h-6" />
                  </motion.button>
                </div>
              </div>
            </div>

            <motion.div
              layout
              className={`grid gap-6 ${
                viewState.isGridView ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
              }`}
            >
              <AnimatePresence>
                {filteredPlots.length > 0 ? (
                  filteredPlots.map((plot) => (
                    <PlotCard
                      key={plot.id || plot._id}
                      plot={plot}
                      viewType={viewState.isGridView ? "grid" : "list"}
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="col-span-full text-center py-12 bg-white dark:bg-haven-900 backdrop-blur-sm rounded-haven shadow-soft border border-cream-400/80 dark:border-haven-800"
                  >
                    <MapPin className="w-12 h-12 text-haven-700/40 dark:text-cream-200/40 mx-auto mb-4" />
                    <h3 className="font-display text-lg text-haven-900 dark:text-cream-100 mb-2">
                      No plots found
                    </h3>
                    <p className="text-haven-700/70 dark:text-cream-200/60">
                      Try adjusting your filters or search criteria
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlotsPage;

