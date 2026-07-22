import { useState, useEffect } from "react";
import { 
  Trash2, 
  Edit3, 
  Search, 
  Plus, 
  Map,
  MapPin,
  Maximize,
  RefreshCw,
  Youtube,
  Eye,
  Phone,
  Hash,
  FileText,
  Compass,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { backendurl } from "../config/constants";
import { useCurrency } from "../contexts/CurrencyContext";

/** MySQL / JSON may return 0/1 for booleans */
const isTruthyFlag = (v) => v === true || v === 1 || v === "1";

const PlotListings = () => {
  const { formatPrice } = useCurrency();
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAvailability, setFilterAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [refreshing, setRefreshing] = useState(false);

  const fetchPlots = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendurl}/api/plots/list`);
      if (response.data.success) {
        setPlots(response.data.plots || []);
      } else {
        toast.error(response.data.error || 'Failed to fetch plots');
      }
    } catch (error) {
      console.error('Error fetching plots:', error);
      toast.error('Failed to load plots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlots();
  }, []);

  const parseAmenities = (amenities) => {
    if (!amenities) return [];
    if (Array.isArray(amenities)) return amenities;
    if (typeof amenities === 'string') {
      try {
        const parsed = JSON.parse(amenities);
        return Array.isArray(parsed) ? parsed : [amenities];
      } catch {
        return [amenities];
      }
    }
    return [];
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this plot?')) {
      return;
    }

    try {
      const response = await axios.post(`${backendurl}/api/plots/remove`, { id });
      if (response.data.success) {
        toast.success('Plot deleted successfully');
        fetchPlots();
      } else {
        toast.error(response.data.message || 'Failed to delete plot');
      }
    } catch (error) {
      console.error('Error deleting plot:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message || 
                          'Failed to delete plot. Please try again.';
      toast.error(errorMessage);
      
      // If it's a 500 error, provide more context
      if (error.response?.status === 500) {
        console.error('Server error details:', error.response.data);
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPlots();
    setTimeout(() => setRefreshing(false), 500);
  };

  const filteredPlots = plots
    .filter(plot => {
      const q = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm ||
        plot.title?.toLowerCase().includes(q) ||
        plot.location?.toLowerCase().includes(q) ||
        plot.description?.toLowerCase().includes(q) ||
        String(plot.plotNumber || "").toLowerCase().includes(q) ||
        String(plot.surveyNumber || "").toLowerCase().includes(q) ||
        String(plot.phone || "").toLowerCase().includes(q) ||
        String(plot.facing || "").toLowerCase().includes(q);
      
      const matchesAvailability = filterAvailability === 'all' || 
        plot.availability?.toLowerCase() === filterAvailability.toLowerCase();
      
      return matchesSearch && matchesAvailability;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return (a.price || 0) - (b.price || 0);
        case "price-desc":
          return (b.price || 0) - (a.price || 0);
        case "newest":
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case "oldest":
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        default:
          return 0;
      }
    });

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
      y: 0
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading plots...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen pt-20 bg-gradient-to-br from-gray-50 via-white to-gray-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <motion.div 
          variants={itemVariants}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Map className="w-6 h-6 text-amber-600" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Plot Management
                </h1>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 ml-14">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{filteredPlots.length} Plots Listed</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </motion.button>
              
              <Link to="/add-plots">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Plot</span>
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search plots by title, location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="all">All Availability</option>
                <option value="rent">For Rent</option>
                <option value="buy">For Sale</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Plots Grid */}
        {filteredPlots.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="text-center py-16 bg-white rounded-xl shadow-sm"
          >
            <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No plots found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterAvailability !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first plot'}
            </p>
            {!searchTerm && filterAvailability === 'all' && (
              <Link to="/add-plots">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add Plot
                </motion.button>
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredPlots.map((plot, index) => {
                const amenities = parseAmenities(plot.amenities);
                let images = [];
                if (Array.isArray(plot.image)) {
                  images = plot.image;
                } else if (typeof plot.image === 'string') {
                  try {
                    images = plot.image.startsWith('[') ? JSON.parse(plot.image) : [plot.image];
                  } catch {
                    images = [plot.image];
                  }
                }
                const mainImage = plot.frontImage || (images.length > 0 ? images[0] : null);
                // Ensure unique key - use id, _id, or index as fallback
                const uniqueKey = plot.id || plot._id || `plot-${index}`;
                
                return (
                  <motion.div
                    key={uniqueKey}
                    variants={itemVariants}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all"
                  >
                    {/* Image */}
                    <div className="relative h-48 bg-gray-200">
                      {mainImage ? (
                        <img
                          src={mainImage.startsWith('http') ? mainImage : `${backendurl}${mainImage}`}
                          alt={plot.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QbG90IEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <Map className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[85%]">
                        <span className="px-3 py-1 bg-amber-600 text-white text-xs font-semibold rounded-full">
                          Plot
                        </span>
                        {isTruthyFlag(plot.cornerPlot) && (
                          <span className="px-2 py-1 bg-violet-600 text-white text-xs font-medium rounded-full">
                            Corner
                          </span>
                        )}
                        {isTruthyFlag(plot.approvedLayout) && (
                          <span className="px-2 py-1 bg-emerald-600 text-white text-xs font-medium rounded-full">
                            Approved layout
                          </span>
                        )}
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 text-white text-xs font-semibold rounded-full ${
                          plot.availability === 'rent' ? 'bg-green-600' : 'bg-blue-600'
                        }`}>
                          {plot.availability?.toUpperCase() || 'BUY'}
                        </span>
                      </div>
                      {plot.youtubeUrl && (
                        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-black/65 text-white text-xs font-medium backdrop-blur-sm">
                          <Youtube className="w-3.5 h-3.5 shrink-0" aria-hidden />
                          Video
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <Link
                        to={`/view-plot/${plot.id ?? plot._id}`}
                        className="group/title block"
                      >
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1 group-hover/title:text-amber-700 transition-colors">
                          {plot.title}
                        </h3>
                      </Link>
                      
                      <div className="flex items-center text-gray-600 text-sm mb-2">
                        <MapPin className="w-4 h-4 mr-1 shrink-0" />
                        <span className="line-clamp-1">{plot.location}</span>
                      </div>

                      {plot.phone && plot.phone !== "N/A" && (
                        <div className="flex items-center text-gray-600 text-sm mb-2">
                          <Phone className="w-4 h-4 mr-1 shrink-0" aria-hidden />
                          <span className="line-clamp-1">{plot.phone}</span>
                        </div>
                      )}

                      {(plot.plotNumber || plot.surveyNumber || plot.facing) && (
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mb-3">
                          {plot.plotNumber && (
                            <span className="inline-flex items-center gap-1" title="Plot number">
                              <Hash className="w-3.5 h-3.5 shrink-0" aria-hidden />
                              {plot.plotNumber}
                            </span>
                          )}
                          {plot.surveyNumber && (
                            <span className="inline-flex items-center gap-1" title="Survey number">
                              <FileText className="w-3.5 h-3.5 shrink-0" aria-hidden />
                              {plot.surveyNumber}
                            </span>
                          )}
                          {plot.facing && (
                            <span className="inline-flex items-center gap-1" title="Facing">
                              <Compass className="w-3.5 h-3.5 shrink-0" aria-hidden />
                              {plot.facing}
                            </span>
                          )}
                        </div>
                      )}

                      {plot.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{plot.description}</p>
                      )}

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-2xl font-bold text-amber-600">
                            {formatPrice(plot.price || 0)}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <Maximize className="w-4 h-4" />
                            <span>{Number(plot.area || plot.sqft || 0).toLocaleString('en-IN')} {plot.areaUnit || 'sq.ft.'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Amenities */}
                      {amenities.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-1">
                            {amenities.slice(0, 3).map((amenity, idx) => (
                              <span
                                key={`${uniqueKey}-amenity-${idx}`}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                              >
                                {amenity}
                              </span>
                            ))}
                            {amenities.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                +{amenities.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-200">
                        <Link
                          to={`/view-plot/${plot.id ?? plot._id}`}
                          className="flex items-center justify-center gap-1.5 px-2 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        >
                          <Eye className="w-4 h-4 shrink-0" />
                          <span className="hidden sm:inline">View</span>
                        </Link>
                        <Link
                          to={`/update-plot/${plot.id ?? plot._id}`}
                          className="flex items-center justify-center gap-1.5 px-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          <Edit3 className="w-4 h-4 shrink-0" />
                          <span className="hidden sm:inline">Edit</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(plot.id || plot._id)}
                          className="flex items-center justify-center gap-1.5 px-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                          aria-label="Delete plot"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default PlotListings;

