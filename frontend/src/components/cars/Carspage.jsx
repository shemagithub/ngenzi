import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Grid, List, Car } from "lucide-react";
import SearchBar from "../properties/Searchbar.jsx";
import CarCard from "./Carcard.jsx";
import { Backendurl } from "../../utils/backendUrl";

const CarsPage = () => {
  const [searchParams] = useSearchParams();
  const [viewState, setViewState] = useState({ isGridView: true });
  const [carState, setCarState] = useState({ cars: [], loading: true, error: null });
  const [filters, setFilters] = useState({
    priceRange: [0, Number.MAX_SAFE_INTEGER],
    availability: "",
    searchQuery: searchParams.get("location") || "",
    sortBy: "",
    fuelType: "",
  });

  const fetchCars = async () => {
    try {
      setCarState((prev) => ({ ...prev, loading: true }));
      const response = await axios.get(`${Backendurl}/api/cars/list`);
      if (response.data.success) {
        setCarState({ cars: response.data.cars || [], error: null, loading: false });
      } else {
        throw new Error(response.data.message || "Failed to fetch cars");
      }
    } catch (error) {
      setCarState((prev) => ({
        ...prev,
        error: error.response?.data?.message || error.message || "Failed to fetch cars",
        loading: false,
      }));
    }
  };

  useEffect(() => { fetchCars(); }, []);
  useEffect(() => {
    const location = searchParams.get("location");
    if (location) setFilters(prev => ({ ...prev, searchQuery: location }));
  }, [searchParams]);

  const filteredCars = useMemo(() => {
    return carState.cars
      .filter((car) => {
        const searchMatch = !filters.searchQuery ||
          [car.title, car.brand, car.model, car.description, car.location]
            .some(f => f?.toLowerCase().includes(filters.searchQuery.toLowerCase()));
        const priceMatch = car.price >= filters.priceRange[0] && car.price <= filters.priceRange[1];
        const availabilityMatch = !filters.availability || car.availability?.toLowerCase() === filters.availability.toLowerCase();
        const fuelMatch = !filters.fuelType || car.fuelType === filters.fuelType;
        return searchMatch && priceMatch && availabilityMatch && fuelMatch;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case "price-asc": return a.price - b.price;
          case "price-desc": return b.price - a.price;
          case "newest": return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          case "oldest": return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          case "year-desc": return (b.year || 0) - (a.year || 0);
          case "mileage-asc": return (a.mileage || 0) - (b.mileage || 0);
          default: return 0;
        }
      });
  }, [carState.cars, filters]);

  if (carState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 pt-16">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <motion.div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
            animate={{ rotate: [0, 360] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
            <Car className="w-12 h-12 text-white" />
          </motion.div>
          <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Loading Cars</h3>
        </motion.div>
      </div>
    );
  }

  if (carState.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 pt-16">
        <div className="text-center text-red-600 p-6 rounded-lg bg-red-50 max-w-md">
          <p className="mb-4">{carState.error}</p>
          <button onClick={fetchCars} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-16">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.header initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-3">Find Your Perfect Car</h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Browse our collection of cars for sale and rent with full specifications and details
          </p>
        </motion.header>

        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-4 sm:p-6 rounded-xl shadow-xl mb-6 border border-gray-200 dark:border-gray-700/50">
          <div className="mb-4">
            <SearchBar onSearch={(query) => setFilters(prev => ({ ...prev, searchQuery: query }))} initialValue={filters.searchQuery} />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <select value={filters.availability} onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
              className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm">
              <option value="">All Availability</option>
              <option value="buy">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
            <select value={filters.fuelType} onChange={(e) => setFilters(prev => ({ ...prev, fuelType: e.target.value }))}
              className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm">
              <option value="">All Fuel Types</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
            <select value={filters.sortBy} onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
              className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm">
              <option value="">Sort By</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="year-desc">Year: Newest</option>
              <option value="mileage-asc">Mileage: Low to High</option>
            </select>
            <div className="flex gap-2 ml-auto">
              <button onClick={() => setViewState({ isGridView: true })}
                className={`p-2.5 rounded-lg ${viewState.isGridView ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-600'}`}>
                <Grid className="w-5 h-5" />
              </button>
              <button onClick={() => setViewState({ isGridView: false })}
                className={`p-2.5 rounded-lg ${!viewState.isGridView ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-600'}`}>
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4">{filteredCars.length} car{filteredCars.length !== 1 ? 's' : ''} found</p>

        {filteredCars.length === 0 ? (
          <div className="text-center py-16">
            <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No cars found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <motion.div layout className={viewState.isGridView
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            : "flex flex-col gap-6"}>
            <AnimatePresence>
              {filteredCars.map((car) => (
                <CarCard key={car.id} car={car} viewType={viewState.isGridView ? 'grid' : 'list'} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default CarsPage;
