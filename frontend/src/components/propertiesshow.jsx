import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PropTypes from "prop-types";
import { 
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize, 
  Heart,
  Eye,
  ArrowRight,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Backendurl } from '../utils/backendUrl';
import { useCurrency } from '../context/CurrencyContext';

const sampleProperties = [
  {
    _id: "sample1",
    title: "Luxury Beachfront Villa",
    location: "Juhu Beach, Mumbai",
    price: 25000000,
    beds: 4,
    baths: 3,
    sqft: 2800,
    type: "Villa",
    availability: "Buy",
    image: ["https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"]
  },
  {
    _id: "sample2",
    title: "Modern Highrise Apartment",
    location: "Bandra West, Mumbai",
    price: 18500000,
    beds: 3,
    baths: 2,
    sqft: 1800,
    type: "Apartment",
    availability: "Rent",
    image: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"]
  },
  {
    _id: "sample3",
    title: "Riverside Townhouse",
    location: "Koramangala, Bangalore",
    price: 12000000,
    beds: 3,
    baths: 2.5,
    sqft: 2200,
    type: "House",
    availability: "Buy",
    image: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"]
  }
];

const PropertyCard = ({ property }) => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleNavigate = () => {
    navigate(`/properties/single/${property.id || property._id}`);
  };

  const toggleFavorite = (e) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
  };

  const getImage = () => {
    let images = [];
    if (property.image) {
      if (Array.isArray(property.image)) {
        images = property.image;
      } else if (typeof property.image === 'string') {
        try {
          const parsed = JSON.parse(property.image);
          images = Array.isArray(parsed) ? parsed : [property.image];
        } catch {
          images = [property.image];
        }
      }
    }
    const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
    return images.length > 0 ? images[0] : defaultImage;
  };

  return (
    <motion.div
      whileHover={{ y: -6 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-haven-900 overflow-hidden cursor-pointer border border-cream-400/80 dark:border-haven-800 group shadow-soft"
      onClick={handleNavigate}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={getImage()}
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
          }}
        />
        
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <span className="bg-haven-900 text-white text-[10px] font-semibold uppercase tracking-[0.14em] px-3 py-1.5">
            {property.type}
          </span>
          <span className="bg-accent-400 text-haven-900 text-[10px] font-semibold uppercase tracking-[0.14em] px-3 py-1.5">
            For {property.availability}
          </span>
        </div>
        
        <button 
          onClick={toggleFavorite}
          className={`absolute top-4 right-4 p-2 transition-all duration-300 
            ${isFavorite 
              ? 'bg-accent-500 text-haven-900' 
              : 'bg-white/90 text-haven-800 hover:text-accent-600'}`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
        
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-haven-950/45 flex items-center justify-center"
            >
              <div className="px-5 py-3 bg-white text-haven-900 text-xs font-semibold uppercase tracking-[0.14em] flex items-center gap-2">
                <Eye className="w-4 h-4" />
                View Details
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="p-6">
        <h3 className="font-display text-xl text-haven-900 dark:text-cream-100 mb-2 line-clamp-1">
          {property.title}
        </h3>
        
        <div className="flex items-center text-haven-700/70 dark:text-cream-200/60 mb-4 text-sm">
          <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-accent-500" />
          <span className="line-clamp-1">{property.location}</span>
        </div>
        
        <div className="flex justify-between items-center py-3 border-y border-cream-400/80 dark:border-haven-700 mb-5">
          <div className="flex items-center gap-1.5">
            <BedDouble className="w-4 h-4 text-accent-500" />
            <span className="text-xs text-haven-700 dark:text-cream-200/70">{property.beds} Beds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4 text-accent-500" />
            <span className="text-xs text-haven-700 dark:text-cream-200/70">{property.baths} Baths</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Maximize className="w-4 h-4 text-accent-500" />
            <span className="text-xs text-haven-700 dark:text-cream-200/70">{property.sqft} sqft</span>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-accent-600 font-semibold mb-1">
            From
          </p>
          <p className="font-display text-2xl text-haven-900 dark:text-cream-100">
            {formatPrice(property.price)}
          </p>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleNavigate();
          }}
          className="w-full btn-haven"
        >
          View Details
        </button>
      </div>
    </motion.div>
  );
};

const PropertiesShow = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const navigate = useNavigate();

  const categories = [
    { id: 'all', label: 'All Properties' },
    { id: 'apartment', label: 'Apartments' },
    { id: 'villa', label: 'Villas' },
    { id: 'house', label: 'Houses' }
  ];
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${Backendurl}/api/products/list`);
        
        if (response.data.success) {
          const featuredProperties = response.data.property.slice(0, 6);
          setProperties(featuredProperties);
        } else {
          setError('Failed to fetch properties');
          setProperties(sampleProperties);
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties. Using sample data instead.');
        setProperties(sampleProperties);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const filteredProperties = activeCategory === 'all' 
    ? properties 
    : properties.filter(property => property.type.toLowerCase() === activeCategory);

  if (loading) {
    return (
      <div className="py-24 bg-cream-200 dark:bg-haven-950">
        <div className="max-w-[1600px] mx-auto px-4 text-center animate-pulse">
          <div className="h-4 bg-cream-400 rounded w-32 mx-auto mb-4"></div>
          <div className="h-10 bg-cream-400 rounded w-1/3 mx-auto mb-16"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white dark:bg-haven-900 h-96">
                <div className="h-64 bg-cream-400"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-24 bg-cream-100 dark:bg-haven-950">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="section-eyebrow">Explore Properties</p>
          <h2 className="section-title mt-3 mb-2">Featured Residences</h2>
          <div className="section-divider" />
          <p className="text-haven-700/70 dark:text-cream-200/60 max-w-2xl mx-auto leading-relaxed">
            Discover our handpicked selection of premium properties designed to match your lifestyle
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-all duration-200
                ${activeCategory === category.id 
                  ? 'bg-haven-900 text-white' 
                  : 'bg-white dark:bg-haven-900 text-haven-800 dark:text-cream-200 border border-cream-400 dark:border-haven-700 hover:border-haven-900'}`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="text-accent-800 bg-accent-50 p-4 border border-accent-200 mb-8 max-w-md mx-auto text-center text-sm">
            <p className="font-medium mb-1">Note: {error}</p>
            <p>Showing sample properties for demonstration.</p>
          </div>
        )}

        {properties.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredProperties.map((property) => (
              <motion.div key={property.id || property._id} variants={itemVariants}>
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-haven-900 border border-cream-400 dark:border-haven-800">
            <Search className="w-12 h-12 text-cream-500 mx-auto mb-4" />
            <h3 className="font-display text-xl text-haven-900 dark:text-cream-100 mb-2">No properties available</h3>
            <button 
              onClick={() => setActiveCategory('all')} 
              className="mt-4 btn-haven"
            >
              View All Properties
            </button>
          </div>
        )}

        <div className="mt-16 text-center">
          <button
            onClick={() => navigate('/properties')}
            className="inline-flex items-center px-8 py-3 border border-haven-900 dark:border-cream-200 text-haven-900 dark:text-cream-100 text-xs font-semibold uppercase tracking-[0.16em] hover:bg-haven-900 hover:text-white dark:hover:bg-cream-100 dark:hover:text-haven-900 transition-all"
          >
            View All Accommodations
            <ArrowRight className="ml-2 w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

PropertyCard.propTypes = {
  property: PropTypes.object.isRequired
};

export default PropertiesShow;
