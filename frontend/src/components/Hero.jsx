import { useState } from "react";
import { Search, MapPin, ArrowRight, Play, Home, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import heroimage from "../assets/images/heroimage.png";
import PropTypes from "prop-types";

const popularLocations = [
  "Kigali",
  "Musanze",
  "Huye",
  "Rubavu",
  "Nyagatare",
  "Karongi",
  "Rusizi",
  "Muhanga",
];

const Hero = ({ buttonConfig = {} }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [propertyType, setPropertyType] = useState("All");
  const [searchCategory, setSearchCategory] = useState("properties");

  const {
    text = null,
    textProperties = "Properties",
    textPlots = "Plots",
    icon: CustomIcon = Search,
    showIcon = true,
    showArrow = true,
    arrowIcon: CustomArrowIcon = ArrowRight,
  } = buttonConfig;

  const handleSubmit = (location = searchQuery) => {
    if (location.trim()) {
      if (searchCategory === "plots") {
        navigate(`/plots?location=${encodeURIComponent(location)}`);
      } else {
        navigate(`/properties?location=${encodeURIComponent(location)}&type=${propertyType}`);
      }
    }
  };

  const handleLocationClick = (location) => {
    setSearchQuery(location);
    setShowSuggestions(false);
    handleSubmit(location);
  };

  return (
    <div className="relative min-h-[92vh] lg:min-h-screen overflow-visible z-30">
      {/* Full-bleed hero image (clip here only — not the search dropdown) */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${heroimage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-haven-950/75 via-haven-900/45 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-haven-950/55 via-transparent to-haven-900/25" />
      </div>

      <div className="relative z-10 flex min-h-[92vh] lg:min-h-screen flex-col overflow-visible">
        <div className="flex-1 flex items-center px-4 sm:px-6 lg:px-8 pt-28 pb-36 lg:pb-44">
          <div className="max-w-[1600px] mx-auto w-full">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-2xl text-left"
            >
              <p className="text-accent-300 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.32em] mb-5">
                Premium Real Estate
              </p>

              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[4.25rem] text-white leading-[1.08] mb-6">
                Your Perfect Home{" "}
                <span className="italic text-accent-300">Awaits in Rwanda</span>
              </h1>

              <p className="text-cream-200/90 text-base sm:text-lg leading-relaxed mb-10 max-w-xl font-light">
                Discover exceptional properties and land across Rwanda with curated listings,
                trusted guidance, and a seamless search experience.
              </p>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/properties")}
                  className="btn-haven"
                >
                  Explore Properties
                </motion.button>
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/ai-property-hub")}
                  className="btn-ghost-light"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  AI Property Hub
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Booking-style search bar — high z so dropdown sits above Features */}
        <div className="absolute bottom-0 inset-x-0 z-50 px-4 sm:px-6 lg:px-8 pb-6 lg:pb-8 overflow-visible">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7 }}
            className="max-w-[1600px] mx-auto overflow-visible"
          >
            <div className="relative z-50 bg-haven-900/92 backdrop-blur-md border border-white/10 shadow-haven overflow-visible">
              <div className="flex flex-wrap gap-2 px-4 sm:px-6 pt-4">
                <button
                  onClick={() => setSearchCategory("properties")}
                  className={`px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] rounded-haven transition-colors ${
                    searchCategory === "properties"
                      ? "bg-accent-400 text-haven-900"
                      : "text-cream-200/70 hover:text-white"
                  }`}
                >
                  Properties
                </button>
                <button
                  onClick={() => setSearchCategory("plots")}
                  className={`px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] rounded-haven transition-colors ${
                    searchCategory === "plots"
                      ? "bg-accent-400 text-haven-900"
                      : "text-cream-200/70 hover:text-white"
                  }`}
                >
                  Plots
                </button>
              </div>

              <div className="relative z-50 grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-white/10 overflow-visible">
                <div className="lg:col-span-3 px-4 sm:px-6 py-4">
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-cream-200/60 mb-2">
                    Category
                  </label>
                  <div className="flex items-center gap-2 text-white">
                    <Home className="w-4 h-4 text-accent-400" />
                    <select
                      value={propertyType}
                      onChange={(e) => setPropertyType(e.target.value)}
                      disabled={searchCategory === "plots"}
                      className="w-full bg-transparent border-0 text-sm font-medium focus:ring-0 focus:outline-none disabled:opacity-50 cursor-pointer"
                    >
                      <option className="text-haven-900" value="All">All Types</option>
                      <option className="text-haven-900" value="Apartments">Apartments</option>
                      <option className="text-haven-900" value="Houses">Houses</option>
                      <option className="text-haven-900" value="Villas">Villas</option>
                      <option className="text-haven-900" value="Studios">Studios</option>
                    </select>
                  </div>
                </div>

                <div className="lg:col-span-5 px-4 sm:px-6 py-4 relative z-[60] overflow-visible">
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-cream-200/60 mb-2">
                    Location
                  </label>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      placeholder="City, locality, or landmark..."
                      className="w-full bg-transparent border-0 text-sm font-medium text-white placeholder:text-cream-200/40 focus:ring-0 focus:outline-none"
                      autoComplete="off"
                    />
                  </div>

                  <AnimatePresence>
                    {showSuggestions && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="absolute left-0 right-0 sm:left-4 sm:right-4 top-full mt-1 bg-cream-50 border border-cream-400 shadow-haven rounded-haven z-[200] overflow-hidden"
                      >
                        <div className="p-3 border-b border-cream-400 bg-cream-100">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-haven-600">
                            Popular Locations
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-1 p-2 max-h-64 overflow-y-auto">
                          {popularLocations
                            .filter(
                              (loc) =>
                                !searchQuery.trim() ||
                                loc.toLowerCase().includes(searchQuery.trim().toLowerCase())
                            )
                            .map((location) => (
                              <button
                                key={location}
                                type="button"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleLocationClick(location);
                                }}
                                className="flex items-center gap-2 px-3 py-2.5 text-left text-sm text-haven-800 hover:bg-haven-900 hover:text-cream-100 transition-colors rounded-haven"
                              >
                                <MapPin className="w-3.5 h-3.5 text-accent-500 shrink-0" />
                                {location}
                              </button>
                            ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="lg:col-span-4 flex flex-col sm:flex-row relative z-10">
                  <button
                    onClick={() => navigate(`/map?category=${searchCategory}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-4 text-cream-100 text-[11px] font-semibold uppercase tracking-[0.16em] hover:bg-white/5 transition-colors border-b sm:border-b-0 sm:border-r border-white/10"
                  >
                    <Filter className="w-4 h-4" />
                    Map Search
                  </button>
                  <button
                    onClick={() => handleSubmit()}
                    className="flex-[1.4] flex items-center justify-center gap-2 px-4 py-4 bg-accent-400 text-haven-900 text-[11px] font-bold uppercase tracking-[0.16em] hover:bg-accent-500 transition-colors"
                  >
                    {showIcon && <CustomIcon className="w-4 h-4" />}
                    {text !== null
                      ? text
                      : `Check ${searchCategory === "plots" ? textPlots : textProperties}`}
                    {showArrow && <CustomArrowIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

Hero.propTypes = {
  buttonConfig: PropTypes.shape({
    text: PropTypes.string,
    textProperties: PropTypes.string,
    textPlots: PropTypes.string,
    icon: PropTypes.elementType,
    showIcon: PropTypes.bool,
    showArrow: PropTypes.bool,
    arrowIcon: PropTypes.elementType,
  }),
};

export default Hero;
