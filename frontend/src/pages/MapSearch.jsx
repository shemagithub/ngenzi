import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  MapPin, 
  Home, 
  X, 
  Search, 
  Filter,
  ChevronLeft,
  Loader,
  Info
} from 'lucide-react';
import { Backendurl } from '../utils/backendUrl';

// Rwanda default center (Kigali)
const DEFAULT_CENTER = { lat: -1.9441, lng: 30.0619 };
const DEFAULT_ZOOM = 10;

const MapSearch = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const category = searchParams.get('category') || 'properties';
  
  const [properties, setProperties] = useState([]);
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationItems, setLocationItems] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_ZOOM);

  // Fetch properties and plots
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [propertiesRes, plotsRes] = await Promise.all([
          axios.get(`${Backendurl}/api/products/list`),
          axios.get(`${Backendurl}/api/plots/list`)
        ]);

        if (propertiesRes.data.success) {
          setProperties(propertiesRes.data.property || []);
        }
        if (plotsRes.data.success) {
          setPlots(plotsRes.data.plots || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Group items by location
  const locationGroups = useMemo(() => {
    const items = category === 'properties' ? properties : plots;
    const groups = {};

    items.forEach(item => {
      const location = item.location || 'Unknown';
      if (!groups[location]) {
        groups[location] = [];
      }
      groups[location].push(item);
    });

    return groups;
  }, [properties, plots, category]);

  // Get unique locations with counts
  const uniqueLocations = useMemo(() => {
    return Object.keys(locationGroups).map(location => ({
      location,
      count: locationGroups[location].length,
      items: locationGroups[location]
    }));
  }, [locationGroups]);

  // Filter locations based on search
  const filteredLocations = useMemo(() => {
    if (!searchQuery) return uniqueLocations;
    const query = searchQuery.toLowerCase();
    return uniqueLocations.filter(loc => 
      loc.location.toLowerCase().includes(query)
    );
  }, [uniqueLocations, searchQuery]);

  // Handle location click
  const handleLocationClick = (locationData) => {
    setSelectedLocation(locationData);
    setLocationItems(locationData.items);
    
    // Update map center and zoom
    geocodeLocation(locationData.location);
    
    // Force map reload with new location
    setMapLoaded(false);
    setTimeout(() => {
      setMapLoaded(true);
    }, 100);
  };

  // Geocode location to get coordinates
  const geocodeLocation = async (location) => {
    try {
      // Use Google Maps Geocoding API (you'll need to add API key)
      // For now, use a simple approach with known Rwanda locations
      const rwandaLocations = {
        'Kigali': { lat: -1.9441, lng: 30.0619 },
        'Musanze': { lat: -1.4998, lng: 29.6344 },
        'Huye': { lat: -2.5967, lng: 29.7439 },
        'Rubavu': { lat: -1.6936, lng: 29.3481 },
        'Nyagatare': { lat: -1.3000, lng: 30.3333 },
        'Karongi': { lat: -2.0167, lng: 29.3500 },
        'Rusizi': { lat: -2.4833, lng: 28.9000 },
        'Muhanga': { lat: -2.0833, lng: 29.7500 }
      };

      const coords = rwandaLocations[location] || DEFAULT_CENTER;
      setMapCenter(coords);
      setMapZoom(13);
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  // Generate Google Maps URL (using search URL that doesn't require API key)
  const getMapUrl = () => {
    if (selectedLocation) {
      // Show selected location on map with search
      const locationQuery = `${selectedLocation.location}, Rwanda`;
      return `https://www.google.com/maps?q=${encodeURIComponent(locationQuery)}&output=embed`;
    }
    
    if (searchQuery) {
      // Show search query location
      const locationQuery = `${searchQuery}, Rwanda`;
      return `https://www.google.com/maps?q=${encodeURIComponent(locationQuery)}&output=embed`;
    }
    
    if (filteredLocations.length > 0) {
      // Show first location
      const locationQuery = `${filteredLocations[0].location}, Rwanda`;
      return `https://www.google.com/maps?q=${encodeURIComponent(locationQuery)}&output=embed`;
    }

    // Default to Rwanda
    return `https://www.google.com/maps?q=Rwanda&output=embed`;
  };

  // Generate Google Maps search URL for external link
  const getGoogleMapsSearchUrl = (location) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location + ', Rwanda')}`;
  };

  // Get coordinates for location (simplified)
  const getLocationCoords = (location) => {
    const rwandaLocations = {
      'Kigali': { lat: -1.9441, lng: 30.0619 },
      'Musanze': { lat: -1.4998, lng: 29.6344 },
      'Huye': { lat: -2.5967, lng: 29.7439 },
      'Rubavu': { lat: -1.6936, lng: 29.3481 },
      'Nyagatare': { lat: -1.3000, lng: 30.3333 },
      'Karongi': { lat: -2.0167, lng: 29.3500 },
      'Rusizi': { lat: -2.4833, lng: 28.9000 },
      'Muhanga': { lat: -2.0833, lng: 29.7500 }
    };

    // Try to find exact match
    for (const [key, coords] of Object.entries(rwandaLocations)) {
      if (location.toLowerCase().includes(key.toLowerCase())) {
        return coords;
      }
    }

    return DEFAULT_CENTER;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  Search via Map
                </h1>
                <p className="text-sm text-gray-600">
                  {category === 'properties' ? 'Properties' : 'Plots'} on Map
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/map?category=${category === 'properties' ? 'plots' : 'properties'}`)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                {category === 'properties' ? <Home className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                <span>Switch to {category === 'properties' ? 'Plots' : 'Properties'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - Location List */}
        <div className="w-full md:w-96 bg-white border-r border-gray-200 overflow-y-auto">
          {/* Search */}
          <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Location List */}
          <div className="p-4 space-y-3">
            {filteredLocations.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No locations found</p>
              </div>
            ) : (
              filteredLocations.map((locationData) => (
                <motion.button
                  key={locationData.location}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleLocationClick(locationData)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedLocation?.location === locationData.location
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedLocation?.location === locationData.location
                          ? 'bg-blue-500'
                          : 'bg-gray-100'
                      }`}>
                        <MapPin className={`w-5 h-5 ${
                          selectedLocation?.location === locationData.location
                            ? 'text-white'
                            : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{locationData.location}</h3>
                        <p className="text-sm text-gray-500">
                          {locationData.count} {category === 'properties' ? 'properties' : 'plots'}
                        </p>
                      </div>
                    </div>
                    <Info className="w-5 h-5 text-gray-400" />
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative bg-gray-100">
          {/* Google Maps Embed - Using search URL (no API key needed) */}
          <iframe
            key={selectedLocation?.location || searchQuery || 'default'}
            src={getMapUrl()}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => setMapLoaded(true)}
            className="absolute inset-0"
            title="Google Maps"
          />

          {/* Map Controls Overlay */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <a
              href={selectedLocation ? getGoogleMapsSearchUrl(selectedLocation.location) : 'https://www.google.com/maps?q=Rwanda'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
            >
              <MapPin className="w-4 h-4" />
              Open in Google Maps
            </a>
          </div>

          {/* Location Markers Overlay - Visual indicators */}
          <div className="absolute inset-0 pointer-events-none z-20">
            {filteredLocations.map((locationData, index) => {
              const coords = getLocationCoords(locationData.location);
              // Calculate approximate position on map (simplified)
              const position = {
                left: `${20 + (index % 5) * 15}%`,
                top: `${15 + Math.floor(index / 5) * 20}%`
              };
              
              return (
                <motion.div
                  key={locationData.location}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: selectedLocation?.location === locationData.location ? 1 : 0.7 }}
                  transition={{ delay: index * 0.05 }}
                  className="absolute pointer-events-auto"
                  style={position}
                >
                  <button
                    onClick={() => handleLocationClick(locationData)}
                    className={`relative group ${
                      selectedLocation?.location === locationData.location
                        ? 'z-50'
                        : 'z-10'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer ${
                      selectedLocation?.location === locationData.location
                        ? 'bg-blue-600 scale-125 ring-4 ring-blue-200'
                        : 'bg-white hover:bg-blue-500 hover:scale-110'
                    }`}>
                      <MapPin className={`w-6 h-6 ${
                        selectedLocation?.location === locationData.location
                          ? 'text-white'
                          : 'text-blue-600 group-hover:text-white'
                      }`} />
                    </div>
                    <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all pointer-events-none ${
                      selectedLocation?.location === locationData.location
                        ? 'bg-blue-600 text-white opacity-100'
                        : 'bg-gray-900 text-white opacity-0 group-hover:opacity-100'
                    }`}>
                      {locationData.location} ({locationData.count})
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>

          {/* Loading Overlay */}
          {!mapLoaded && (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-0">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          )}

          {/* Selected Location Info Panel */}
          <AnimatePresence>
            {selectedLocation && (
              <motion.div
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                className="absolute right-4 top-4 bottom-4 w-96 bg-white rounded-xl shadow-2xl overflow-hidden z-50"
              >
                <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold">{selectedLocation.location}</h2>
                      <p className="text-sm text-blue-100">
                        {selectedLocation.count} {category === 'properties' ? 'properties' : 'plots'} found
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedLocation(null);
                        setLocationItems([]);
                      }}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto h-[calc(100%-80px)] p-4 space-y-4">
                  {locationItems.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        if (category === 'properties') {
                          navigate(`/properties/single/${item.id}`);
                        } else {
                          navigate(`/plots/${item.id}`);
                        }
                      }}
                    >
                      {item.frontImage && (
                        <img
                          src={item.frontImage.startsWith('http') ? item.frontImage : `${Backendurl}${item.frontImage}`}
                          alt={item.title}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      )}
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{item.location}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-blue-600">
                          {category === 'properties' 
                            ? `RWF ${parseFloat(item.price).toLocaleString()}`
                            : `RWF ${parseFloat(item.price).toLocaleString()}`
                          }
                        </span>
                        {category === 'properties' && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{item.beds} beds</span>
                            <span>•</span>
                            <span>{item.baths} baths</span>
                            <span>•</span>
                            <span>{item.sqft} sqft</span>
                          </div>
                        )}
                        {category === 'plots' && (
                          <div className="text-sm text-gray-500">
                            {item.area} {item.areaUnit || 'sqft'}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MapSearch;

