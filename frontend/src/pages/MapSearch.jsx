import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  MapPin, 
  Home, 
  X, 
  Search, 
  ChevronLeft,
  Loader,
  Info
} from 'lucide-react';
import { Backendurl } from '../utils/backendUrl';
import SEOHead from '../components/SEO/SEOHead';

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cream-200 via-cream-100 to-cream-300">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-accent-500 mx-auto mb-3" />
          <p className="text-sm text-haven-600 font-sans">Loading map…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-200 via-cream-100 to-cream-300">
      <SEOHead
        title="Map Search — Properties & Plots in Rwanda"
        description="Explore NGENZI REALESTATE listings on an interactive map. Find properties and land plots by location across Kigali and Rwanda."
        keywords="map search Rwanda property, Kigali property map, find land on map Rwanda"
        canonicalPath="/map"
      />
      {/* Page toolbar */}
      <div className="bg-haven-950/95 backdrop-blur-sm border-b border-haven-800 sticky top-0 z-40 shadow-haven">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-haven text-cream-200 hover:bg-haven-800 hover:text-accent-300 transition-colors shrink-0"
                aria-label="Go back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="font-display text-xl sm:text-2xl text-cream-100 flex items-center gap-2 truncate">
                  <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-accent-400 shrink-0" />
                  Search via Map
                </h1>
                <p className="text-sm text-cream-300/70 font-sans">
                  {category === 'properties' ? 'Properties' : 'Plots'} across Rwanda
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                navigate(
                  `/map?category=${category === 'properties' ? 'plots' : 'properties'}`
                )
              }
              className="px-3 sm:px-4 py-2 rounded-haven bg-accent-400 text-haven-950 font-sans text-sm font-semibold hover:bg-accent-300 transition-colors flex items-center gap-2 shrink-0 shadow-soft"
            >
              {category === 'properties' ? (
                <Home className="w-4 h-4" />
              ) : (
                <MapPin className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                Switch to {category === 'properties' ? 'Plots' : 'Properties'}
              </span>
              <span className="sm:hidden">
                {category === 'properties' ? 'Plots' : 'Homes'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-88px)]">
        {/* Sidebar */}
        <div className="w-full md:w-96 bg-cream-50/95 border-r border-cream-400 overflow-y-auto backdrop-blur-sm">
          <div className="p-4 border-b border-cream-400 sticky top-0 bg-cream-50 z-10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-haven-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search locations…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-cream-400 rounded-haven bg-white text-haven-900 placeholder:text-haven-400 font-sans focus:outline-none focus:ring-2 focus:ring-accent-400/50 focus:border-accent-400"
              />
            </div>
          </div>

          <div className="p-4 space-y-3">
            {filteredLocations.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-14 h-14 rounded-full bg-haven-100 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-7 h-7 text-haven-400" />
                </div>
                <p className="text-haven-600 font-sans font-medium">No locations found</p>
                <p className="text-sm text-haven-400 mt-1 font-sans">
                  Try another search or switch category
                </p>
              </div>
            ) : (
              filteredLocations.map((locationData) => {
                const active =
                  selectedLocation?.location === locationData.location;
                return (
                  <motion.button
                    key={locationData.location}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => handleLocationClick(locationData)}
                    className={`w-full text-left p-4 rounded-haven border transition-all ${
                      active
                        ? 'border-accent-400 bg-haven-50 shadow-soft ring-1 ring-accent-400/30'
                        : 'border-cream-400 bg-white hover:border-haven-300 hover:bg-cream-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            active
                              ? 'bg-haven-900'
                              : 'bg-cream-300'
                          }`}
                        >
                          <MapPin
                            className={`w-5 h-5 ${
                              active ? 'text-accent-400' : 'text-haven-700'
                            }`}
                          />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-sans font-semibold text-haven-900 truncate">
                            {locationData.location}
                          </h3>
                          <p className="text-sm text-haven-500 font-sans">
                            {locationData.count}{' '}
                            {category === 'properties' ? 'properties' : 'plots'}
                          </p>
                        </div>
                      </div>
                      <Info
                        className={`w-5 h-5 shrink-0 ${
                          active ? 'text-accent-500' : 'text-haven-300'
                        }`}
                      />
                    </div>
                  </motion.button>
                );
              })
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative bg-haven-100">
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

          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <a
              href={
                selectedLocation
                  ? getGoogleMapsSearchUrl(selectedLocation.location)
                  : 'https://www.google.com/maps?q=Rwanda'
              }
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-haven-950 text-cream-100 rounded-haven shadow-haven hover:bg-haven-800 transition-colors flex items-center gap-2 text-sm font-sans font-medium border border-haven-700"
            >
              <MapPin className="w-4 h-4 text-accent-400" />
              Open in Google Maps
            </a>
          </div>

          <div className="absolute inset-0 pointer-events-none z-20">
            {filteredLocations.map((locationData, index) => {
              const position = {
                left: `${20 + (index % 5) * 15}%`,
                top: `${15 + Math.floor(index / 5) * 20}%`,
              };
              const active =
                selectedLocation?.location === locationData.location;

              return (
                <motion.div
                  key={locationData.location}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: 1,
                    opacity: active ? 1 : 0.75,
                  }}
                  transition={{ delay: index * 0.05 }}
                  className="absolute pointer-events-auto"
                  style={position}
                >
                  <button
                    onClick={() => handleLocationClick(locationData)}
                    className={`relative group ${active ? 'z-50' : 'z-10'}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all cursor-pointer border-2 ${
                        active
                          ? 'bg-haven-900 border-accent-400 scale-125 ring-4 ring-accent-400/25'
                          : 'bg-cream-50 border-haven-700 hover:bg-haven-900 hover:scale-110'
                      }`}
                    >
                      <MapPin
                        className={`w-5 h-5 ${
                          active
                            ? 'text-accent-400'
                            : 'text-haven-800 group-hover:text-accent-400'
                        }`}
                      />
                    </div>
                    <div
                      className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-haven text-xs font-sans font-semibold whitespace-nowrap transition-all pointer-events-none ${
                        active
                          ? 'bg-haven-950 text-accent-300 opacity-100'
                          : 'bg-haven-900 text-cream-100 opacity-0 group-hover:opacity-100'
                      }`}
                    >
                      {locationData.location} ({locationData.count})
                    </div>
                  </button>
                </motion.div>
              );
            })}
          </div>

          {!mapLoaded && (
            <div className="absolute inset-0 bg-cream-200/90 flex items-center justify-center z-0">
              <Loader className="w-8 h-8 animate-spin text-accent-500" />
            </div>
          )}

          <AnimatePresence>
            {selectedLocation && (
              <motion.div
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                className="absolute right-4 top-4 bottom-4 w-[min(24rem,calc(100%-2rem))] bg-cream-50 rounded-haven shadow-haven overflow-hidden z-50 border border-cream-400"
              >
                <div className="p-4 bg-haven-950 text-cream-100 border-b border-haven-800">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-display text-xl text-accent-300 truncate">
                        {selectedLocation.location}
                      </h2>
                      <p className="text-sm text-cream-300/70 font-sans">
                        {selectedLocation.count}{' '}
                        {category === 'properties' ? 'properties' : 'plots'} found
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedLocation(null);
                        setLocationItems([]);
                      }}
                      className="p-2 hover:bg-haven-800 rounded-haven transition-colors shrink-0 text-cream-200 hover:text-accent-300"
                      aria-label="Close"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto h-[calc(100%-80px)] p-4 space-y-4 bg-gradient-to-b from-cream-100 to-cream-200">
                  {locationItems.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.01 }}
                      className="bg-white rounded-haven p-4 border border-cream-400 cursor-pointer hover:border-accent-400 hover:shadow-soft transition-all"
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
                          src={
                            item.frontImage.startsWith('http')
                              ? item.frontImage
                              : `${Backendurl}${item.frontImage}`
                          }
                          alt={item.title}
                          className="w-full h-32 object-cover rounded-haven mb-3"
                        />
                      )}
                      <h3 className="font-sans font-semibold text-haven-900 mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-haven-500 mb-2 font-sans">
                        {item.location}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-lg text-accent-600">
                          RWF {parseFloat(item.price).toLocaleString()}
                        </span>
                        {category === 'properties' && (
                          <div className="flex items-center gap-2 text-sm text-haven-500 font-sans">
                            <span>{item.beds} beds</span>
                            <span className="text-cream-500">•</span>
                            <span>{item.baths} baths</span>
                          </div>
                        )}
                        {category === 'plots' && (
                          <div className="text-sm text-haven-500 font-sans">
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

