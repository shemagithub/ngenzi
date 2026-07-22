import React, { useState, useEffect } from 'react';
import { Search, X, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SearchBar = ({ onSearch, className, initialValue = '' }) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Popular locations suggestion (Rwanda)
  const popularLocations = [
    'Kigali',
    'Musanze', 
    'Huye',
    'Rubavu',
    'Nyagatare',
    'Karongi',
    'Rusizi',
    'Muhanga'
  ];

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Update search query when initialValue changes
  useEffect(() => {
    if (initialValue !== undefined) {
      setSearchQuery(initialValue);
    }
  }, [initialValue]);

  const handleSearch = (query) => {
    if (!query.trim()) return;

    // Update recent searches
    const updatedSearches = [
      query,
      ...recentSearches.filter(item => item !== query)
    ].slice(0, 5);

    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    
    onSearch(query);
    setShowSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by location, price..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={handleKeyDown}
              className="w-full pl-11 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl 
                border border-gray-300 dark:border-gray-600 
                focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 
                transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 
                bg-gray-100/80 dark:bg-gray-700/80 backdrop-blur-sm
                hover:bg-gray-100 dark:hover:bg-gray-700"
            />
            <Search 
              className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 
                text-gray-500 dark:text-gray-400 h-4 w-4 sm:h-5 sm:w-5" 
            />
            {searchQuery && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 
                  p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 
                  hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </motion.button>
            )}
          </div>
          <motion.button 
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-blue-600 dark:bg-blue-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl 
              hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-200 flex items-center gap-2 
              shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 font-medium text-sm sm:text-base whitespace-nowrap"
          >
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">Search</span>
          </motion.button>
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg 
              shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50 transition-colors duration-200"
          >
            {recentSearches.length > 0 && (
              <div className="p-2">
                <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 mb-2">
                  Recent Searches
                </h3>
                {recentSearches.map((query, index) => (
                  <button
                    key={`recent-${index}`}
                    onClick={() => {
                      setSearchQuery(query);
                      handleSearch(query);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 
                      rounded-md flex items-center gap-2 text-gray-700 dark:text-gray-300"
                  >
                    <Search className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                    {query}
                  </button>
                ))}
              </div>
            )}

            <div className="border-t border-gray-100 dark:border-gray-700 p-2">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 mb-2">
                Popular Locations
              </h3>
              {popularLocations.map((location, index) => (
                <button
                  key={`popular-${index}`}
                  onClick={() => {
                    setSearchQuery(location);
                    handleSearch(location);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 
                    rounded-md flex items-center gap-2 text-gray-700"
                >
                  <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                  {location}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;