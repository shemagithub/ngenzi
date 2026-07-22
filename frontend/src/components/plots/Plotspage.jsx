import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Grid, List, SlidersHorizontal, MapPin, Map } from "lucide-react";
import SearchBar from "../properties/Searchbar.jsx";
import PlotCard from "./Plotcard.jsx";
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center flex flex-col items-center"
        >
          <div className="relative mb-6">
            <motion.div
              className="w-24 h-24 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center relative shadow-lg shadow-amber-500/30"
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
          
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-3 bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
            Loading Plots
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-5 max-w-xs text-center">
            We're finding the perfect plots that match your preferences...
          </p>
        </motion.div>
      </div>
    );
  }

  if (plotState.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-red-600 dark:text-red-400 p-6 rounded-lg bg-red-50 dark:bg-red-900/20 max-w-md border border-red-200 dark:border-red-800"
        >
          <p className="font-medium mb-4">{plotState.error}</p>
          <button
            onClick={fetchPlots}
            className="px-6 py-2 bg-amber-600 dark:bg-amber-500 text-white rounded-lg hover:bg-amber-700 dark:hover:bg-amber-600 transition-colors 
              transition-colors duration-200"
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
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-16 transition-colors duration-200"
    >
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
            Find Your Perfect Plot
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover a curated collection of premium plots for your dream project
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-4">
            {/* Modern Dark-Themed Filter Section */}
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-xl mb-6 border border-gray-200 dark:border-gray-700/50">
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
                    className="w-full px-4 py-2.5 sm:py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-900 dark:text-gray-100 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 
                      transition-all appearance-none cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
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
                    className="w-full px-4 py-2.5 sm:py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg sm:rounded-xl text-sm sm:text-base text-gray-900 dark:text-gray-100 
                      focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 
                      transition-all appearance-none cursor-pointer hover:border-gray-400 dark:hover:border-gray-500"
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
                    className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-200 ${
                      viewState.isGridView 
                        ? "bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-500/30" 
                        : "bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 border border-gray-200 dark:border-gray-500"
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
                    className={`p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-200 ${
                      !viewState.isGridView 
                        ? "bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-500/30" 
                        : "bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-500 border border-gray-200 dark:border-gray-500"
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
                    className="col-span-full text-center py-12 bg-white/80 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-gray-700/50"
                  >
                    <MapPin className="w-12 h-12 text-gray-500 dark:text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200 mb-2">
                      No plots found
                    </h3>
                    <p className="text-gray-400 dark:text-gray-400">
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

