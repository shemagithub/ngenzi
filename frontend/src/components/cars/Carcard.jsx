import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin, Share2, ChevronLeft, ChevronRight, Eye, Youtube, Car, Gauge, Fuel, Calendar } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { getYoutubeEmbedSrc } from '../../utils/youtubeEmbed';
import PropTypes from 'prop-types';

const CarCard = ({ car, viewType }) => {
  const isGrid = viewType === 'grid';
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showControls, setShowControls] = useState(false);

  const getImages = () => {
    if (!car.image) return [];
    let imageArray = [];
    if (Array.isArray(car.image)) imageArray = car.image;
    else if (typeof car.image === 'string') {
      try { const parsed = JSON.parse(car.image); imageArray = Array.isArray(parsed) ? parsed : [car.image]; } catch { imageArray = [car.image]; }
    }
    return imageArray.filter(img => img && typeof img === 'string' && img.trim().length > 0);
  };

  const images = getImages();
  const defaultImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DYXIgSW1hZ2U8L3RleHQ+PC9zdmc+';
  const displayImage = car.frontImage || (images.length > 0 ? images[currentImageIndex] : defaultImage);
  const youtubeEmbed = car.youtubeUrl ? getYoutubeEmbedSrc(car.youtubeUrl) : null;

  const handleNavigate = () => navigate(`/cars/${car.id || car._id}`);

  const handleImageNavigation = (e, direction) => {
    e.stopPropagation();
    if (direction === 'next') setCurrentImageIndex((prev) => (prev + 1) % images.length);
    else setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      whileHover={{ y: -5 }} transition={{ duration: 0.3 }}
      className={`group bg-white dark:bg-haven-900 overflow-hidden shadow-soft border border-cream-400/80 dark:border-haven-800 hover:border-accent-400 transition-all duration-300 cursor-pointer
        ${isGrid ? 'flex flex-col h-full' : 'flex flex-col sm:flex-row'}`}
      onClick={handleNavigate}
      onMouseEnter={() => setShowControls(true)} onMouseLeave={() => setShowControls(false)}>
      <div className={`relative overflow-hidden ${isGrid ? 'h-56' : 'sm:w-80 h-56 sm:h-auto shrink-0'}`}>
        <img src={displayImage} alt={car.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = defaultImage; }} />
        {images.length > 1 && showControls && (
          <>
            <button onClick={(e) => handleImageNavigation(e, 'prev')} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 rounded-haven shadow">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={(e) => handleImageNavigation(e, 'next')} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 rounded-haven shadow">
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className={`px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-md ${
            car.availability === 'rent' ? 'bg-green-600' : 'bg-haven-900'
          }`}>
            {car.availability === 'rent' ? 'For Rent' : 'For Sale'}
          </span>
          {youtubeEmbed && (
            <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-red-600/95">
              <Youtube className="w-3.5 h-3.5" /> Video
            </span>
          )}
        </div>
      </div>

      <div className={`flex-1 p-6 ${isGrid ? '' : 'flex flex-col justify-between'}`}>
        <div className="space-y-3">
          <div className="flex items-center text-haven-700/70 dark:text-cream-200/60 text-sm">
            <MapPin className="w-4 h-4 mr-2 text-accent-500" />{car.location}
          </div>
          <h3 className="font-display text-xl text-haven-900 dark:text-cream-100 line-clamp-2 group-hover:text-accent-600 transition-colors">{car.title}</h3>
          <p className="text-sm text-haven-700/60 dark:text-cream-200/50">{car.brand} {car.model} · {car.year}</p>
          <p className="font-display text-2xl text-haven-900 dark:text-cream-100">{formatPrice(car.price)}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="flex flex-col items-center gap-1 bg-cream-200 dark:bg-haven-800 p-2">
            <Calendar className="w-4 h-4 text-accent-500" />
            <span className="text-xs font-medium text-haven-700 dark:text-cream-200">{car.year}</span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-cream-200 dark:bg-haven-800 p-2">
            <Gauge className="w-4 h-4 text-accent-500" />
            <span className="text-xs font-medium text-haven-700 dark:text-cream-200">{car.mileage?.toLocaleString()} {car.mileageUnit || 'km'}</span>
          </div>
          <div className="flex flex-col items-center gap-1 bg-cream-200 dark:bg-haven-800 p-2">
            <Fuel className="w-4 h-4 text-accent-500" />
            <span className="text-xs font-medium text-haven-700 dark:text-cream-200">{car.fuelType}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

CarCard.propTypes = { car: PropTypes.object.isRequired, viewType: PropTypes.string.isRequired };
export default CarCard;
