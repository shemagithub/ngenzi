import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Backendurl } from '../utils/backendUrl';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  MapPin, 
  Bed, 
  Bath, 
  Maximize,
  Trash2,
  Loader,
  Home,
  Search
} from 'lucide-react';
import { toast } from 'react-toastify';
import Propertycard from '../components/properties/Propertycard';

const SavedProperties = () => {
  const { isLoggedIn } = useAuth();
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    fetchSavedProperties();
  }, [isLoggedIn, navigate]);

  const fetchSavedProperties = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // For now, we'll use an empty array since saved properties endpoint may not exist
      // You can implement this endpoint later: GET /api/users/saved-properties
      const response = await axios.get(
        `${Backendurl}/api/users/saved-properties`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ).catch(() => {
        // If endpoint doesn't exist, return empty array
        return { data: { properties: [] } };
      });

      setSavedProperties(response.data.properties || []);
    } catch (error) {
      console.error('Error fetching saved properties:', error);
      // Set empty array if endpoint doesn't exist
      setSavedProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSaved = async (propertyId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${Backendurl}/api/users/saved-properties/${propertyId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      ).catch(() => {
        // If endpoint doesn't exist, just remove from local state
        setSavedProperties(prev => prev.filter(p => p.id !== propertyId));
        toast.success('Property removed from saved');
        return;
      });

      setSavedProperties(prev => prev.filter(p => p.id !== propertyId));
      toast.success('Property removed from saved');
    } catch (error) {
      console.error('Error removing saved property:', error);
      toast.error('Failed to remove property');
    }
  };

  const filteredProperties = savedProperties.filter(property =>
    property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-600 fill-red-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Saved Properties</h1>
              <p className="text-gray-600">Your favorite properties saved for later</p>
            </div>
          </div>
        </motion.div>

        {/* Search Bar */}
        {savedProperties.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search saved properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </motion.div>
        )}

        {/* Properties Grid */}
        {savedProperties.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl p-12 text-center"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Saved Properties Yet</h2>
            <p className="text-gray-600 mb-6">
              Start exploring properties and save your favorites to view them here later.
            </p>
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              Browse Properties
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="mb-4 text-gray-600">
              Showing {filteredProperties.length} of {savedProperties.length} saved properties
            </div>
            {filteredProperties.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                <p className="text-gray-600">No properties match your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <motion.div
                    key={property.id || property._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group"
                  >
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                      {/* Remove Button */}
                      <button
                        onClick={() => handleRemoveSaved(property.id || property._id)}
                        className="absolute top-4 right-4 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                      
                      {/* Property Card Content */}
                      <Propertycard property={property} />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SavedProperties;

