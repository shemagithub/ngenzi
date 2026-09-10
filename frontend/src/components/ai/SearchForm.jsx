import { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Search, Home, MapPin, DollarSign, Building } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

const SearchForm = ({ onSearch, isLoading }) => {
  const [searchParams, setSearchParams] = useState({
    city: '',
    maxPrice: 3,
    propertyCategory: 'Residential',
    propertyType: 'Flat'
  });
  
  const [activeField, setActiveField] = useState(null);
  const { formatPrice, getCurrencySymbol } = useCurrency();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSearchParams({
      ...searchParams,
      [name]: name === 'maxPrice' ? parseFloat(value) : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchParams);
  };

  const popularCities = ['Kigali', 'Butare', 'Gitarama', 'Ruhengeri', 'Gisenyi', 'Cyangugu'];

  const handleCitySelect = (city) => {
    setSearchParams(prev => ({
      ...prev,
      city
    }));
    setActiveField(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-cream-50 p-4 sm:p-6 md:p-8 rounded-haven shadow-haven border border-cream-400"
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div className="p-2 bg-haven-100 rounded-haven mr-3 w-10 h-10 flex items-center justify-center">
          <Search className="h-5 w-5 text-haven-700" />
        </div>
        <h2 className="font-display text-xl sm:text-2xl text-haven-900">Find Your Dream Property</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div className="relative">
          <label htmlFor="city" className="flex items-center text-sm font-medium text-haven-800 mb-1.5">
            <MapPin className="w-4 h-4 mr-1.5 text-haven-700" />
            City
          </label>
          <div className="relative">
            <input
              type="text"
              id="city"
              name="city"
              value={searchParams.city}
              onChange={handleChange}
              onFocus={() => setActiveField('city')}
              onBlur={() => setTimeout(() => setActiveField(null), 100)}
              placeholder="Enter city name (e.g., Kigali)"
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-cream-400 rounded-haven bg-white focus:ring-2 focus:ring-haven-500 focus:border-haven-500 focus:outline-none transition-shadow text-sm sm:text-base text-haven-900"
              required
            />
            {activeField === 'city' && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-10 mt-1 w-full bg-cream-50 rounded-haven shadow-soft border border-cream-400 py-2"
              >
                <p className="px-3 py-1 text-xs font-medium text-haven-600">Popular Cities</p>
                <div className="mt-1 max-h-48 overflow-y-auto">
                  {popularCities.map((city) => (
                    <div
                      key={city}
                      onClick={() => handleCitySelect(city)}
                      className="px-3 py-2 hover:bg-haven-50 cursor-pointer text-haven-800 flex items-center"
                    >
                      <MapPin className="w-4 h-4 mr-2 text-haven-500" />
                      {city}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div>
            <label htmlFor="maxPrice" className="flex items-center text-sm font-medium text-haven-800 mb-1.5">
              <DollarSign className="w-4 h-4 mr-1.5 text-haven-700" />
              Maximum Price
            </label>
            <div className="relative">
              <input
                type="number"
                id="maxPrice"
                name="maxPrice"
                min="0.5"
                max="50"
                step="0.1"
                value={searchParams.maxPrice}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-cream-400 rounded-haven bg-white focus:ring-2 focus:ring-haven-500 focus:border-haven-500 focus:outline-none transition-shadow text-sm sm:text-base text-haven-900"
                required
              />
              <span className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-haven-600 text-sm font-medium">
                {getCurrencySymbol()}
              </span>
            </div>
          </div>
          
          <div>
            <label htmlFor="propertyType" className="flex items-center text-sm font-medium text-haven-800 mb-1.5">
              <Home className="w-4 h-4 mr-1.5 text-haven-700" />
              Property Type
            </label>
            <select
              id="propertyType"
              name="propertyType"
              value={searchParams.propertyType}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-cream-400 rounded-haven bg-white focus:ring-2 focus:ring-haven-500 focus:border-haven-500 focus:outline-none transition-shadow appearance-none text-sm sm:text-base text-haven-900"
            >
              <option value="Flat">Flat</option>
              <option value="Individual House">Individual House</option>
              <option value="Villa">Villa</option>
              <option value="Penthouse">Penthouse</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="propertyCategory" className="flex items-center text-sm font-medium text-haven-800 mb-1.5">
              <Building className="w-4 h-4 mr-1.5 text-haven-700" />
              Property Category
            </label>
            <select
              id="propertyCategory"
              name="propertyCategory"
              value={searchParams.propertyCategory}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-cream-400 rounded-haven bg-white focus:ring-2 focus:ring-haven-500 focus:border-haven-500 focus:outline-none transition-shadow appearance-none text-sm sm:text-base text-haven-900"
            >
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-haven-800 mb-2 sm:mb-4">
              <DollarSign className="w-4 h-4 mr-1.5 text-haven-700" />
              Price Range: {formatPrice(searchParams.maxPrice * 10000000)}
            </label>
            <input
              type="range"
              min="0.5"
              max="50"
              step="0.5"
              value={searchParams.maxPrice}
              onChange={(e) => handleChange({ target: { name: 'maxPrice', value: e.target.value }})}
              className="w-full h-2 bg-cream-300 rounded-lg appearance-none cursor-pointer accent-haven-700"
            />
            <div className="flex justify-between text-xs text-haven-600 mt-1">
              <span>{formatPrice(0.5 * 10000000)}</span>
              <span>{formatPrice(50 * 10000000)}</span>
            </div>
          </div>
        </div>
        
        <motion.button
          type="submit"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          disabled={isLoading}
          className="w-full mt-2 sm:mt-4 btn-haven !py-3 sm:!py-4 disabled:opacity-70"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm sm:text-base">Searching for Properties...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <Search className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              <span className="text-sm sm:text-base">Find Properties</span>
            </span>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

SearchForm.propTypes = {
  onSearch: PropTypes.func,
  isLoading: PropTypes.bool,
};

export default SearchForm;
