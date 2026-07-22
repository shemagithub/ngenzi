import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { useCurrency } from "../../context/CurrencyContext";
import { 
  Maximize, 
  ArrowLeft, 
  Phone, 
  Calendar, 
  MapPin,
  Loader,
  Share2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Compass,
  Heart,
  Ruler,
  Map as MapIcon,
  CheckCircle,
  XCircle
} from "lucide-react";
import { Backendurl } from "../../utils/backendUrl";
import { getYoutubeEmbedSrc } from "../../utils/youtubeEmbed";
import ScheduleViewing from "../properties/ScheduleViewing";

const PlotDetails = () => {
  const { id } = useParams();
  const { isLoggedIn } = useAuth();
  const { formatPrice } = useCurrency();
  const [plot, setPlot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlot = async () => {
      // Validate ID
      if (!id || id === 'undefined' || id === 'null') {
        setError("Invalid plot ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log(`🔍 Fetching plot with ID: ${id} from ${Backendurl}/api/plots/single/${id}`);
        
        const response = await axios.get(`${Backendurl}/api/plots/single/${id}`);

        if (response.data.success) {
          const plotData = response.data.plot;
          console.log('✅ Plot data received:', plotData);
          
          // Normalize image field
          let normalizedImages = [];
          if (plotData.image) {
            if (Array.isArray(plotData.image)) {
              normalizedImages = plotData.image;
            } else if (typeof plotData.image === 'string') {
              try {
                const parsed = JSON.parse(plotData.image);
                normalizedImages = Array.isArray(parsed) ? parsed : [plotData.image];
              } catch {
                normalizedImages = [plotData.image];
              }
            }
          }
          
          // Add frontImage to images array if it exists
          if (plotData.frontImage && !normalizedImages.includes(plotData.frontImage)) {
            normalizedImages.unshift(plotData.frontImage);
          }
          
          setPlot({
            ...plotData,
            image: normalizedImages,
            amenities: parseAmenities(plotData.amenities)
          });
          setError(null);
        } else {
          setError(response.data.message || "Failed to load plot details.");
        }
      } catch (err) {
        console.error("❌ Error fetching plot details:", err);
        if (err.response?.status === 404) {
          const errorMessage = `Plot with ID ${id} not found. It may have been deleted or doesn't exist.`;
          setError(errorMessage);
          // Redirect to plots list after 3 seconds
          setTimeout(() => {
            navigate('/plots');
          }, 3000);
        } else if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else if (err.message) {
          setError(`Failed to load plot: ${err.message}`);
        } else {
          setError("Failed to load plot details. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPlot();
  }, [id, navigate]);

  const parseAmenities = (amenities) => {
    if (!amenities) return [];
    if (Array.isArray(amenities)) return amenities;
    if (typeof amenities === 'string') {
      try {
        const parsed = JSON.parse(amenities);
        return Array.isArray(parsed) ? parsed : [amenities];
      } catch {
        return [amenities];
      }
    }
    return [];
  };

  const handleShare = useCallback(() => {
    if (navigator.share && plot) {
      navigator.share({
        title: plot.title,
        text: plot.description,
        url: window.location.href,
      }).catch(() => {
        copyToClipboard();
      });
    } else {
      copyToClipboard();
    }
  }, [plot]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const nextImage = () => {
    if (plot && plot.image && plot.image.length > 0) {
      setActiveImage((prev) => (prev + 1) % plot.image.length);
    }
  };

  const prevImage = () => {
    if (plot && plot.image && plot.image.length > 0) {
      setActiveImage((prev) => (prev - 1 + plot.image.length) % plot.image.length);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading plot details...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error Loading Plot</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => navigate('/plots')}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Back to Plots
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!plot) {
    return null;
  }

  const images = plot.image && plot.image.length > 0 ? plot.image : [];
  const displayImage = images[activeImage] || plot.frontImage || '';

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Navigation Bar */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/plots')}
              className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Plots</span>
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-amber-600 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span className="hidden sm:inline">Share</span>
              </button>
              {copySuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-2 text-green-600"
                >
                  <Copy className="w-4 h-4" />
                  <span className="text-sm">Copied!</span>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative bg-white rounded-xl overflow-hidden shadow-lg">
            {displayImage ? (
              <div className="relative h-[500px] md:h-[600px]">
                <img
                  src={displayImage}
                  alt={plot.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QbG90IEltYWdlPC90ZXh0Pjwvc3ZnPg==';
                  }}
                />
                
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-800" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-800" />
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImage(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === activeImage ? 'bg-white w-6' : 'bg-white/60'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="h-[500px] md:h-[600px] bg-gray-200 flex items-center justify-center">
                <p className="text-gray-500">No image available</p>
              </div>
            )}

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="p-4 bg-gray-50 border-t">
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        index === activeImage ? 'border-amber-600' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{plot.title}</h1>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-5 h-5 text-amber-600" />
                    <span className="text-lg">{plot.location}</span>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${
                  plot.availability === 'rent' ? 'bg-green-600' : 'bg-amber-600'
                }`}>
                  {plot.availability === 'rent' ? 'For Rent' : 'For Sale'}
                </span>
              </div>
            </motion.div>

            {/* Price */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl p-6 text-white shadow-lg"
            >
              <p className="text-sm opacity-90 mb-1">Price</p>
              <p className="text-4xl font-bold">{formatPrice(plot.price)}</p>
            </motion.div>

            {plot.youtubeUrl && getYoutubeEmbedSrc(plot.youtubeUrl) && (
              <motion.div
                id="video-tour"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
              >
                <h2 className="text-lg font-semibold text-gray-900 px-6 pt-4 pb-2">Video tour</h2>
                <div className="aspect-video w-full bg-black">
                  <iframe
                    title={`${plot.title} — YouTube`}
                    src={getYoutubeEmbedSrc(plot.youtubeUrl)}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                </div>
              </motion.div>
            )}

            {/* Plot Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Plot Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center p-4 bg-amber-50 rounded-lg">
                  <Maximize className="w-8 h-8 text-amber-600 mb-2" />
                  <p className="text-sm text-gray-600 mb-1">Area</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {plot.area ? `${Number(plot.area).toLocaleString()} ${plot.areaUnit || 'sqft'}` : 'N/A'}
                  </p>
                </div>
                
                {plot.plotNumber && (
                  <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg">
                    <MapIcon className="w-8 h-8 text-blue-600 mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Plot Number</p>
                    <p className="text-lg font-semibold text-gray-900">{plot.plotNumber}</p>
                  </div>
                )}
                
                {plot.surveyNumber && (
                  <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg">
                    <Compass className="w-8 h-8 text-green-600 mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Survey Number</p>
                    <p className="text-lg font-semibold text-gray-900">{plot.surveyNumber}</p>
                  </div>
                )}
                
                {plot.facing && (
                  <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg">
                    <Compass className="w-8 h-8 text-purple-600 mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Facing</p>
                    <p className="text-lg font-semibold text-gray-900">{plot.facing}</p>
                  </div>
                )}
                
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  {plot.cornerPlot ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
                      <p className="text-sm text-gray-600 mb-1">Corner Plot</p>
                      <p className="text-lg font-semibold text-gray-900">Yes</p>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-1">Corner Plot</p>
                      <p className="text-lg font-semibold text-gray-900">No</p>
                    </>
                  )}
                </div>
                
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                  {plot.approvedLayout ? (
                    <>
                      <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
                      <p className="text-sm text-gray-600 mb-1">Approved Layout</p>
                      <p className="text-lg font-semibold text-gray-900">Yes</p>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-1">Approved Layout</p>
                      <p className="text-lg font-semibold text-gray-900">No</p>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-sm"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {plot.description || 'No description available.'}
              </p>
            </motion.div>

            {/* Amenities */}
            {plot.amenities && plot.amenities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Features & Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {plot.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm sticky top-24"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
              {plot.phone && (
                <a
                  href={`tel:${plot.phone}`}
                  className="flex items-center gap-3 w-full p-4 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors mb-4"
                >
                  <Phone className="w-5 h-5" />
                  <span className="font-semibold">Call Now</span>
                </a>
              )}
              
              <button
                onClick={() => setShowSchedule(true)}
                className="flex items-center gap-3 w-full p-4 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Calendar className="w-5 h-5" />
                <span className="font-semibold">Schedule Viewing</span>
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Schedule Viewing Modal */}
      {showSchedule && (
        <ScheduleViewing
          propertyId={plot.id}
          propertyTitle={plot.title}
          onClose={() => setShowSchedule(false)}
        />
      )}
    </div>
  );
};

export default PlotDetails;

