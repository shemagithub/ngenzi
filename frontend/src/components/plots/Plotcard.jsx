import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Maximize, Share2, ChevronLeft, ChevronRight, Eye, Heart, Youtube } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { getYoutubeEmbedSrc } from '../../utils/youtubeEmbed';
import PropTypes from 'prop-types';

const PlotCard = ({ plot, viewType }) => {
  const isGrid = viewType === 'grid';
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);

  // Normalize image field to always be an array
  const getImages = () => {
    if (!plot.image) return [];
    let imageArray = [];
    
    if (Array.isArray(plot.image)) {
      imageArray = plot.image;
    } else if (typeof plot.image === 'string') {
      try {
        const parsed = JSON.parse(plot.image);
        imageArray = Array.isArray(parsed) ? parsed : [plot.image];
      } catch {
        imageArray = [plot.image];
      }
    }
    
    return imageArray.filter(img => {
      if (!img || typeof img !== 'string') return false;
      const trimmed = img.trim();
      return trimmed.length > 0 && (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:'));
    });
  };

  const images = getImages();
  const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QbG90IEltYWdlPC90ZXh0Pjwvc3ZnPg==';

  const handleNavigateToDetails = () => {
    // For now, navigate to a generic property detail page
    // TODO: Create plot detail page
    navigate(`/plots/${plot.id || plot._id}`);
  };

  const handleImageNavigation = (e, direction) => {
    e.stopPropagation();
    if (direction === 'next') {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    } else {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: plot.title,
        text: plot.description,
        url: window.location.href,
      });
    }
  };

  // Use frontImage if available, otherwise use first image
  const displayImage = plot.frontImage || (images.length > 0 ? images[currentImageIndex] : defaultImage);
  const youtubeEmbed = plot.youtubeUrl ? getYoutubeEmbedSrc(plot.youtubeUrl) : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className={`group bg-white dark:bg-haven-900 overflow-hidden shadow-soft border border-cream-400/80 dark:border-haven-800 hover:border-accent-400 transition-all duration-300
        ${isGrid ? 'flex flex-col' : 'flex flex-row gap-6'}`}
      onClick={handleNavigateToDetails}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {/* Image Section */}
      <div className={`relative ${isGrid ? 'h-64' : 'w-96'}`}>
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            src={displayImage}
            alt={plot.title}
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
              className="p-1  bg-white/80 backdrop-blur-sm"
            >
              <ChevronLeft className="w-5 h-5 text-gray-800" />
            </motion.button>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              whileHover={{ opacity: 1 }}
              onClick={(e) => handleImageNavigation(e, 'next')}
              className="p-1  bg-white/80 backdrop-blur-sm"
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
                className={`w-1.5 h-1.5  transition-all duration-300
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
            onClick={handleShare}
            className="p-2 bg-white/90 backdrop-blur-sm hover:bg-accent-50 
              transition-colors shadow-lg"
            title="Share plot"
          >
            <Share2 className="w-4 h-4 text-gray-700" />
          </motion.button>
        </div>

        {/* Availability Badge */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
          <span className={`px-3 py-1  text-xs font-semibold text-white ${
            plot.availability === 'rent' ? 'bg-green-600' : 'bg-haven-900'
          }`}>
            {plot.availability === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
          {youtubeEmbed && (
            <span className="flex items-center gap-1 px-2 py-1  text-xs font-medium text-white bg-red-600/95 shadow-md">
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
              <MapPin className="w-4 h-4 mr-2 text-accent-500" />
              {plot.location}
            </div>
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <Eye className="w-4 h-4" />
              <span>{Math.floor(Math.random() * 100) + 20}</span>
            </div>
          </div>

          <h3 className="font-display text-xl text-haven-900 dark:text-cream-100 line-clamp-2 
            group-hover:text-accent-600 transition-colors">
            {plot.title}
          </h3>

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-accent-600 font-semibold mb-1">From</p>
              <div className="flex items-center gap-1">
                <span className="font-display text-2xl text-haven-900 dark:text-cream-100">
                  {formatPrice(plot.price)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Plot Features */}
        <div className="grid grid-cols-1 gap-3 mt-6">
          <div className="flex flex-col items-center gap-1 bg-cream-200 dark:bg-haven-800 p-3">
            <Maximize className="w-5 h-5 text-accent-500" />
            <span className="text-sm font-medium text-haven-700 dark:text-cream-200">
              {plot.area ? `${Number(plot.area).toLocaleString()} ${plot.areaUnit || 'sqft'}` : 'N/A'}
            </span>
          </div>
        </div>

        {youtubeEmbed && (
          <div
            className="mt-4 overflow-hidden border border-cream-400 dark:border-haven-700 bg-haven-950/5"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
          >
            <div className="flex items-center gap-2 px-3 py-2 bg-cream-200 dark:bg-haven-800 border-b border-cream-400 dark:border-haven-700">
              <Youtube className="w-4 h-4 text-red-600 shrink-0" aria-hidden />
              <span className="text-xs font-semibold text-haven-900 dark:text-cream-100">Video tour</span>
            </div>
            <div className="relative w-full aspect-video max-h-[220px] bg-black">
              <iframe
                title={`${plot.title} — video`}
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

PlotCard.propTypes = {
  plot: PropTypes.object.isRequired,
  viewType: PropTypes.string.isRequired
};

export default PlotCard;

