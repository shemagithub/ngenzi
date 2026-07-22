import { useState, useEffect } from "react";
import {
  Trash2,
  Edit3,
  Search,
  Plus,
  Car,
  MapPin,
  RefreshCw,
  Youtube,
  Eye,
  Phone,
  Calendar,
  Gauge,
  Fuel,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { backendurl } from "../config/constants";
import { useCurrency } from "../contexts/CurrencyContext";

const CarListings = () => {
  const { formatPrice } = useCurrency();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAvailability, setFilterAvailability] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [refreshing, setRefreshing] = useState(false);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${backendurl}/api/cars/list`);
      if (response.data.success) {
        setCars(response.data.cars || []);
      } else {
        toast.error(response.data.error || "Failed to fetch cars");
      }
    } catch (error) {
      console.error("Error fetching cars:", error);
      toast.error("Failed to load cars");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this car?")) return;
    try {
      const response = await axios.post(`${backendurl}/api/cars/remove`, { id });
      if (response.data.success) {
        toast.success("Car deleted successfully");
        fetchCars();
      } else {
        toast.error(response.data.message || "Failed to delete car");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete car");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCars();
    setTimeout(() => setRefreshing(false), 500);
  };

  const filteredCars = cars
    .filter((car) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        !search ||
        [car.title, car.brand, car.model, car.location, car.description]
          .some((f) => f?.toLowerCase().includes(search));
      const matchesAvailability =
        filterAvailability === "all" || car.availability === filterAvailability;
      return matchesSearch && matchesAvailability;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "price-low") return parseFloat(a.price) - parseFloat(b.price);
      if (sortBy === "price-high") return parseFloat(b.price) - parseFloat(a.price);
      return 0;
    });

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <p className="text-gray-600">Loading cars...</p>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="min-h-screen pt-20 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Car className="w-6 h-6 text-blue-600" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Car Management
                </h1>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 ml-14">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{filteredCars.length} Cars Listed</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <motion.button whileHover={{ scale: 1.05 }} onClick={handleRefresh} disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors">
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </motion.button>
              <Link to="/add-cars" className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-500/25">
                <Plus className="w-5 h-5" />
                Add Car
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input type="text" placeholder="Search by brand, model, location..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <select value={filterAvailability} onChange={(e) => setFilterAvailability(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500">
            <option value="all">All Availability</option>
            <option value="buy">For Sale</option>
            <option value="rent">For Rent</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </motion.div>

        {filteredCars.length === 0 ? (
          <motion.div variants={itemVariants} className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No cars found</h3>
            <p className="text-gray-500 mb-6">Add your first car listing to get started.</p>
            <Link to="/add-cars" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
              <Plus className="w-5 h-5" /> Add Car
            </Link>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
            <AnimatePresence>
              {filteredCars.map((car) => (
                <motion.div key={car.id} variants={itemVariants} layout
                  className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative h-48 bg-gray-100">
                    {car.frontImage ? (
                      <img src={car.frontImage} alt={car.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Car className="w-12 h-12 text-gray-300" /></div>
                    )}
                    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold ${car.availability === "buy" ? "bg-green-500 text-white" : "bg-blue-500 text-white"}`}>
                      {car.availability === "buy" ? "For Sale" : "For Rent"}
                    </span>
                    {car.youtubeUrl && (
                      <span className="absolute top-3 right-3 p-1.5 bg-red-600 text-white rounded-full"><Youtube className="w-4 h-4" /></span>
                    )}
                  </div>
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{car.title}</h3>
                      <p className="text-sm text-gray-500">{car.brand} {car.model} · {car.year}</p>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{formatPrice(car.price)}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1"><Gauge className="w-3.5 h-3.5" />{car.mileage?.toLocaleString()} {car.mileageUnit || "km"}</span>
                      <span className="flex items-center gap-1"><Fuel className="w-3.5 h-3.5" />{car.fuelType}</span>
                      <span className="flex items-center gap-1 col-span-2"><MapPin className="w-3.5 h-3.5" />{car.location}</span>
                      {car.phone && car.phone !== "N/A" && (
                        <span className="flex items-center gap-1 col-span-2"><Phone className="w-3.5 h-3.5" />{car.phone}</span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-200">
                      <Link to={`/view-car/${car.id}`} className="flex items-center justify-center gap-1.5 px-2 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 text-sm font-medium">
                        <Eye className="w-4 h-4" /><span className="hidden sm:inline">View</span>
                      </Link>
                      <Link to={`/update-car/${car.id}`} className="flex items-center justify-center gap-1.5 px-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                        <Edit3 className="w-4 h-4" /><span className="hidden sm:inline">Edit</span>
                      </Link>
                      <button type="button" onClick={() => handleDelete(car.id)} className="flex items-center justify-center gap-1.5 px-2 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default CarListings;
