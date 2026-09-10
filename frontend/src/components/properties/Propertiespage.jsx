import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Grid, List, SlidersHorizontal, MapPin, Home } from "lucide-react";
import SearchBar from "./Searchbar.jsx";
import FilterSection from "./Filtersection.jsx";
import PropertyCard from "./Propertycard.jsx";
import PageHero from "../PageHero";
import { Backendurl } from "../../utils/backendUrl";

const PropertiesPage = ({ defaultFilterType = "" }) => {
  const [searchParams] = useSearchParams();
  const [viewState, setViewState] = useState({
    isGridView: true,
    showFilters: false,
    showMap: false,
  });

  const [propertyState, setPropertyState] = useState({
    properties: [],
    loading: true,
    error: null,
    selectedProperty: null,
  });

  const [filters, setFilters] = useState({
    propertyType: defaultFilterType || searchParams.get("type") || "",
    priceRange: [0, Number.MAX_SAFE_INTEGER],
    bedrooms: "0",
    bathrooms: "0",
    availability: "",
    searchQuery: searchParams.get("location") || "",
    sortBy: "",
  });

  const fetchProperties = async () => {
    try {
      setPropertyState((prev) => ({ ...prev, loading: true }));
      const response = await axios.get(`${Backendurl}/api/products/list`);
      if (response.data.success) {
        setPropertyState((prev) => ({
          ...prev,
          properties: response.data.property,
          error: null,
          loading: false,
        }));
      } else {
        throw new Error(response.data.message || "Failed to fetch properties");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch properties. Please try again later.";
      setPropertyState((prev) => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
      console.error("Error fetching properties:", err);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // Update filters when URL params change
  useEffect(() => {
    const location = searchParams.get("location");
    const type = searchParams.get("type");
    
    if (location) {
      setFilters(prev => ({
        ...prev,
        searchQuery: location,
        propertyType: type || prev.propertyType
      }));
    }
  }, [searchParams]);

  const filteredProperties = useMemo(() => {
    return propertyState.properties
      .filter((property) => {
        const searchMatch = !filters.searchQuery || 
          [property.title, property.description, property.location]
            .some(field => field?.toLowerCase().includes(filters.searchQuery.toLowerCase()));

        const typeMatch = !filters.propertyType || 
          property.type?.toLowerCase() === filters.propertyType.toLowerCase();

        const priceMatch = property.price >= filters.priceRange[0] && 
          property.price <= filters.priceRange[1];

        const bedroomsMatch = !filters.bedrooms || filters.bedrooms === "0" || 
          property.beds >= parseInt(filters.bedrooms);

        const bathroomsMatch = !filters.bathrooms || filters.bathrooms === "0" || 
          property.baths >= parseInt(filters.bathrooms);

        const availabilityMatch = !filters.availability || 
          property.availability?.toLowerCase() === filters.availability.toLowerCase();

        return searchMatch && typeMatch && priceMatch && 
          bedroomsMatch && bathroomsMatch && availabilityMatch;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case "price-asc":
            return a.price - b.price;
          case "price-desc":
            return b.price - a.price;
          case "newest":
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          default:
            return 0;
        }
      });
  }, [propertyState.properties, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  if (propertyState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-200 dark:bg-haven-950 transition-colors duration-200">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center flex flex-col items-center"
        >
          <div className="relative mb-6">
            {/* Main loader animation */}
            <motion.div
              className="w-24 h-24 bg-haven-900 rounded-haven flex items-center justify-center relative shadow-haven"
              animate={{ 
                rotate: [0, 0, 360, 360, 0],
                scale: [1, 0.9, 0.9, 1, 1],
                borderRadius: ["16%", "50%", "50%", "16%", "16%"]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Home className="w-12 h-12 text-white" />
            </motion.div>
            
            {/* Moving dots around the icon */}
            <motion.div 
              className="absolute w-3 h-3 bg-accent-400 rounded-full right-4 bottom-10"
              animate={{
                x: [0, 30, 0, -30, 0],
                y: [-30, 0, 30, 0, -30],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
            
            <motion.div 
              className="absolute w-2 h-2 bg-accent-500 rounded-full"
              animate={{
                x: [0, -30, 0, 30, 0],
                y: [30, 0, -30, 0, 30],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            />
  
            {/* Background pulse effect */}
            <div className="absolute inset-0 bg-accent-500/10 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
          </div>
          
          <h3 className="font-display text-2xl text-haven-900 dark:text-cream-100 mb-3">
            Loading Properties
          </h3>
          
          <p className="text-haven-700/70 dark:text-cream-200/60 mb-5 max-w-xs text-center">
            {`We're finding the perfect homes that match your preferences...`}
          </p>
          
          {/* Progress bar with animated gradient */}
          <div className="w-64 h-1 bg-cream-400 dark:bg-haven-800 overflow-hidden relative">
            <motion.div
              className="h-full bg-accent-500 absolute top-0 left-0 right-0"
              animate={{ 
                x: ["-100%", "100%"]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </div>
          
          <div className="flex items-center mt-4 text-xs text-accent-600">
            <motion.div 
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-accent-500 rounded-full mr-2"
            />
            <span>Please wait while we curate properties for you</span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (propertyState.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-200 dark:bg-haven-950 transition-colors duration-200">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-red-600 dark:text-red-400 p-6 rounded-haven bg-red-50 dark:bg-red-900/20 max-w-md border border-red-200 dark:border-red-800"
        >
          <p className="font-medium mb-4">{propertyState.error}</p>
          <button
            onClick={fetchProperties}
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
        title={defaultFilterType ? `Find Your Perfect ${defaultFilterType}` : "Find Your Perfect Property"}
        subtitle={defaultFilterType
          ? `Discover a curated collection of premium ${defaultFilterType.toLowerCase()}s`
          : "Discover a curated collection of premium properties"}
      />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <AnimatePresence mode="wait">
            {viewState.showFilters && (
              <motion.aside
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="lg:col-span-1"
              >
                <FilterSection
                  filters={filters}
                  setFilters={setFilters}
                  onApplyFilters={handleFilterChange}
                />
              </motion.aside>
            )}
          </AnimatePresence>

          <div className={`${viewState.showFilters ? "lg:col-span-3" : "lg:col-span-4"}`}>
            <div className="bg-white dark:bg-haven-900 p-4 rounded-haven shadow-soft mb-6 border border-cream-400/80 dark:border-haven-800">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <SearchBar
                  onSearch={(query) => setFilters(prev => ({ ...prev, searchQuery: query }))}
                  className="flex-1"
                  initialValue={filters.searchQuery}
                />

                <div className="flex items-center gap-4">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      sortBy: e.target.value
                    }))}
                    className="px-3 py-2 border border-cream-400 dark:border-haven-700 rounded-haven text-xs font-semibold uppercase tracking-[0.1em] bg-cream-100 dark:bg-haven-900 text-haven-900 dark:text-cream-100 focus:outline-none focus:ring-2 focus:ring-accent-400/30"
                  >
                    <option value="">Sort By</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                  </select>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewState(prev => ({
                        ...prev,
                        showFilters: !prev.showFilters
                      }))}
                      className="p-2 rounded-haven hover:bg-cream-300 dark:hover:bg-haven-800 text-haven-700 dark:text-cream-200"
                      title="Toggle Filters"
                    >
                      <SlidersHorizontal className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewState(prev => ({ ...prev, isGridView: true }))}
                      className={`p-2 rounded-haven transition-colors ${
                        viewState.isGridView ? "bg-haven-900 text-white shadow-haven" : "hover:bg-cream-300 dark:hover:bg-haven-800 text-haven-700 dark:text-cream-200"
                      }`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewState(prev => ({ ...prev, isGridView: false }))}
                      className={`p-2 rounded-haven transition-colors ${
                        !viewState.isGridView ? "bg-haven-900 text-white shadow-haven" : "hover:bg-cream-300 dark:hover:bg-haven-800 text-haven-700 dark:text-cream-200"
                      }`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              layout
              className={`grid gap-6 ${
                viewState.isGridView ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
              }`}
            >
              <AnimatePresence>
                {filteredProperties.length > 0 ? (
                  filteredProperties.map((property) => (
                    <PropertyCard
                      key={property.id || property._id}
                      property={property}
                      viewType={viewState.isGridView ? "grid" : "list"}
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="col-span-full text-center py-12 bg-white dark:bg-haven-900 rounded-haven shadow-soft border border-cream-400/80 dark:border-haven-800"
                  >
                    <MapPin className="w-12 h-12 text-haven-700/40 dark:text-cream-200/40 mx-auto mb-4" />
                    <h3 className="font-display text-lg text-haven-900 dark:text-cream-100 mb-2">
                      No properties found
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

export default PropertiesPage;