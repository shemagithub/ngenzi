import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import { Backendurl } from '../../utils/backendUrl';
import { 
  MapPin, 
  IndianRupee, 
  BedDouble, 
  Bath, 
  Maximize,
  Share2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  Youtube
} from 'lucide-react';
import { getYoutubeEmbedSrc } from '../../utils/youtubeEmbed';
import PropTypes from 'prop-types';

const PropertyCard = ({ property, viewType }) => {
  const isGrid = viewType === 'grid';
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { formatPrice, getCurrencySymbol } = useCurrency();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Normalize image field to always be an array and filter out invalid URLs
  const getImages = () => {
    if (!property.image) return [];
    let imageArray = [];

    if (Array.isArray(property.image)) {
      imageArray = property.image;
    } else if (typeof property.image === 'string') {
      try {
        const parsed = JSON.parse(property.image);
        imageArray = Array.isArray(parsed) ? parsed : [property.image];
      } catch {
        imageArray = [property.image];
      }
    }

    // Filter out empty strings, null, undefined, and invalid URLs
    return imageArray.filter(img => {
      if (!img || typeof img !== 'string') return false;
      const trimmed = img.trim();
      return trimmed.length > 0 && (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:'));
    });
  };

  const images = getImages();
  const youtubeEmbed = property.youtubeUrl ? getYoutubeEmbedSrc(property.youtubeUrl) : null;
  // Base64 encoded placeholder image (gray 400x300 SVG)
  const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

  // Check if property is saved
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!isLoggedIn || !property.id) {
        setIsSaved(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsSaved(false);
          return;
        }

        const propertyId = property.id || property._id;
        if (!propertyId) {
          setIsSaved(false);
          return;
        }

        const response = await axios.get(
          `${Backendurl}/api/users/saved-properties/check/${propertyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data && response.data.success !== undefined) {
          setIsSaved(response.data.isSaved || false);
        } else {
          setIsSaved(false);
        }
      } catch (error) {
        // Silently fail - property is not saved if we can't check
        // Only log if it's not a 404 (which might mean route doesn't exist yet)
        if (error.response?.status !== 404) {
          console.warn('Error checking saved status:', error.response?.status || error.message);
        }
        setIsSaved(false);
      }
    };

    checkSavedStatus();
  }, [isLoggedIn, property.id, property._id]);

  const handleNavigateToDetails = () => {
    navigate(`/properties/single/${property.id || property._id}`);
  };

  const handleFavoriteToggle = async (e) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error('Please login to save properties');
      navigate('/login');
      return;
    }

    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      const propertyId = property.id || property._id;

      if (isSaved) {
        // Remove from saved
        await axios.delete(
          `${Backendurl}/api/users/saved-properties/${propertyId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ).catch(() => {
          // If endpoint doesn't exist, just update local state
          setIsSaved(false);
          toast.success('Removed from saved properties');
          return;
        });
        setIsSaved(false);
        toast.success('Removed from saved properties');
      } else {
        // Add to saved
        await axios.post(
          `${Backendurl}/api/users/saved-properties`,
          { propertyId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ).catch(() => {
          // If endpoint doesn't exist, just update local state
          setIsSaved(true);
          toast.success('Property saved to favorites');
          return;
        });
        setIsSaved(true);
        toast.success('Property saved to favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error(error.response?.data?.message || 'Failed to update favorite status');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      if (navigator.share) {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleImageNavigation = (e, direction) => {
    e.stopPropagation();
    const imagesCount = images.length;
    if (imagesCount === 0) return;
    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev + 1) % imagesCount);
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + imagesCount) % imagesCount);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className={`group bg-white dark:bg-gray-800 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300
        ${isGrid ? 'flex flex-col' : 'flex flex-row gap-6'}`}
      onClick={handleNavigateToDetails}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Image Carousel Section */}
      <div className={`relative ${isGrid ? 'h-64' : 'w-96'}`}>
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            src={images.length > 0 ? images[currentImageIndex] : defaultImage}
            alt={property.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-cover rounded-t-xl rounded-b-none"
            onError={(e) => {
              e.target.src = defaultImage;
            }}
          />
        </AnimatePresence>

        {/* Image Navigation Controls */}
        {showControls && images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between px-2">
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              whileHover={{ opacity: 1 }}
              onClick={(e) => handleImageNavigation(e, 'prev')}
              className="p-1 rounded-full bg-white/80 backdrop-blur-sm"
            >
              <ChevronLeft className="w-5 h-5 text-gray-800" />
            </motion.button>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              whileHover={{ opacity: 1 }}
              onClick={(e) => handleImageNavigation(e, 'next')}
              className="p-1 rounded-full bg-white/80 backdrop-blur-sm"
            >
              <ChevronRight className="w-5 h-5 text-gray-800" />
            </motion.button>
          </div>
        )}

        {/* Image Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300
                  ${index === currentImageIndex ? 'bg-white w-3' : 'bg-white/60'}`}
              />
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFavoriteToggle}
            disabled={saving}
            className={`p-2 rounded-full backdrop-blur-sm transition-colors shadow-lg ${
              isSaved
                ? 'bg-red-500/90 hover:bg-red-600/90'
                : 'bg-white/90 hover:bg-red-50'
            }`}
            title={isSaved ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isSaved ? 'text-white fill-white' : 'text-gray-700'
              }`}
            />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-blue-50 
              transition-colors shadow-lg"
            title="Share property"
          >
            <Share2 className="w-4 h-4 text-gray-700" />
          </motion.button>
        </div>

        {/* Property Tags */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 items-start max-w-[85%]">
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-r from-blue-600 to-blue-500 text-white 
              px-3 py-1 rounded-full text-sm font-medium shadow-lg"
          >
            {property.type}
          </motion.span>
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-r from-green-600 to-green-500 text-white 
              px-3 py-1 rounded-full text-sm font-medium shadow-lg"
          >
            {property.availability}
          </motion.span>
          {youtubeEmbed && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white bg-red-600/95 shadow-md">
              <Youtube className="w-3.5 h-3.5 shrink-0" aria-hidden />
              Video
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className={`flex-1 p-6 ${isGrid ? '' : 'flex flex-col justify-between'}`}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-gray-500 text-sm">
              <MapPin className="w-4 h-4 mr-2 text-blue-500" />
              {property.location}
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <Eye className="w-4 h-4" />
              <span>{Math.floor(Math.random() * 100) + 20}</span>
            </div>
          </div>

          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2
            group-hover:text-blue-600 transition-colors">
            {property.title}
          </h3>

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Price</p>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold text-blue-600">
                  {formatPrice(property.price)}
                </span>
              </div>
            </div>
            {/* Rest of your price-related content */}
          </div>
        </div>

        {/* Property Features */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <div className="flex flex-col items-center gap-1 bg-blue-50 p-2 rounded-lg">
            <BedDouble className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">
              {property.beds} {property.beds > 1 ? 'Beds' : 'Bed'}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-blue-50 p-2 rounded-lg">
            <Bath className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">
              {property.baths} {property.baths > 1 ? 'Baths' : 'Bath'}
            </span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-blue-50 p-2 rounded-lg">
            <Maximize className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-600">
              {property.sqft} sqft
            </span>
          </div>
        </div>

        {youtubeEmbed && (
          <div
            className="mt-4 rounded-xl overflow-hidden border border-blue-200/80 bg-gray-900/5 shadow-inner"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
          >
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50/90 border-b border-blue-100">
              <Youtube className="w-4 h-4 text-red-600 shrink-0" aria-hidden />
              <span className="text-xs font-semibold text-blue-900">Video tour</span>
            </div>
            <div className="relative w-full aspect-video max-h-[220px] bg-black">
              <iframe
                title={`${property.title} — video`}
                src={youtubeEmbed}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

PropertyCard.propTypes = {
  property: PropTypes.object.isRequired,
  viewType: PropTypes.string.isRequired
};

export default PropertyCard;