import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useCurrency } from "../../context/CurrencyContext";
import {
  ArrowLeft, Phone, Calendar, MapPin, Loader, Share2,
  ChevronLeft, ChevronRight, Copy, XCircle, Car, Gauge, Fuel,
  Settings, Palette, Hash, CheckCircle
} from "lucide-react";
import { Backendurl } from "../../utils/backendUrl";
import { getYoutubeEmbedSrc } from "../../utils/youtubeEmbed";
import ScheduleViewing from "../properties/ScheduleViewing";

const parseFeatures = (features) => {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  if (typeof features === 'string') {
    try { const p = JSON.parse(features); return Array.isArray(p) ? p : [features]; } catch { return [features]; }
  }
  return [];
};

const CarDetails = () => {
  const { id } = useParams();
  const { formatPrice } = useCurrency();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [copySuccess, setCopySuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCar = async () => {
      if (!id || id === 'undefined') { setError("Invalid car ID"); setLoading(false); return; }
      try {
        setLoading(true);
        const response = await axios.get(`${Backendurl}/api/cars/single/${id}`);
        if (response.data.success) {
          const carData = response.data.car;
          let normalizedImages = [];
          if (carData.image) {
            if (Array.isArray(carData.image)) normalizedImages = carData.image;
            else if (typeof carData.image === 'string') {
              try { const p = JSON.parse(carData.image); normalizedImages = Array.isArray(p) ? p : [carData.image]; } catch { normalizedImages = [carData.image]; }
            }
          }
          if (carData.frontImage && !normalizedImages.includes(carData.frontImage)) normalizedImages.unshift(carData.frontImage);
          setCar({ ...carData, image: normalizedImages, features: parseFeatures(carData.features) });
        } else {
          setError(response.data.message || "Failed to load car details.");
        }
      } catch (err) {
        if (err.response?.status === 404) {
          setError(`Car with ID ${id} not found.`);
          setTimeout(() => navigate('/cars'), 3000);
        } else {
          setError(err.response?.data?.message || "Failed to load car details.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
  }, [id, navigate]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    toast.success("Link copied!");
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleShare = useCallback(() => {
    if (navigator.share && car) {
      navigator.share({ title: car.title, text: car.description, url: window.location.href }).catch(copyToClipboard);
    } else copyToClipboard();
  }, [car]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
      <Loader className="w-12 h-12 text-blue-600 animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
      <div className="text-center max-w-md p-6 bg-red-50 border border-red-200 rounded-lg">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => navigate('/cars')} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Back to Cars</button>
      </div>
    </div>
  );

  if (!car) return null;

  const images = car.image?.length > 0 ? car.image : [];
  const displayImage = images[activeImage] || car.frontImage || '';

  const specs = [
    { icon: Car, label: 'Brand', value: car.brand, color: 'blue' },
    { icon: Car, label: 'Model', value: car.model, color: 'blue' },
    { icon: Calendar, label: 'Year', value: car.year, color: 'indigo' },
    { icon: Gauge, label: 'Mileage', value: `${car.mileage?.toLocaleString()} ${car.mileageUnit || 'km'}`, color: 'cyan' },
    { icon: Fuel, label: 'Fuel Type', value: car.fuelType, color: 'green' },
    { icon: Settings, label: 'Transmission', value: car.transmission, color: 'purple' },
    { icon: Palette, label: 'Color', value: car.color || 'N/A', color: 'pink' },
    { icon: Car, label: 'Body Type', value: car.bodyType || 'N/A', color: 'orange' },
    { icon: Settings, label: 'Engine', value: car.engineSize || 'N/A', color: 'gray' },
    { icon: CheckCircle, label: 'Condition', value: car.condition, color: 'teal' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="bg-white dark:bg-gray-800 border-b sticky top-16 z-40">
        <div className="max-w-[1600px] mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/cars')} className="flex items-center gap-2 text-gray-600 hover:text-blue-600">
            <ArrowLeft className="w-5 h-5" /><span>Back to Cars</span>
          </button>
          <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600">
            <Share2 className="w-5 h-5" /><span className="hidden sm:inline">Share</span>
            {copySuccess && <Copy className="w-4 h-4 text-green-600" />}
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
            {displayImage ? (
              <div className="relative h-[400px] md:h-[500px]">
                <img src={displayImage} alt={car.title} className="w-full h-full object-cover" />
                {images.length > 1 && (
                  <>
                    <button onClick={() => setActiveImage((p) => (p - 1 + images.length) % images.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg">
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button onClick={() => setActiveImage((p) => (p + 1) % images.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-lg">
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="h-[400px] bg-gray-200 flex items-center justify-center"><Car className="w-16 h-16 text-gray-400" /></div>
            )}
            {images.length > 1 && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 border-t flex gap-2 overflow-x-auto">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${i === activeImage ? 'border-blue-600' : 'border-transparent'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{car.title}</h1>
                  <p className="text-gray-500 mt-1">{car.brand} {car.model} · {car.year}</p>
                  <div className="flex items-center gap-2 text-gray-600 mt-2">
                    <MapPin className="w-5 h-5 text-blue-600" /><span>{car.location}</span>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${car.availability === 'rent' ? 'bg-purple-600' : 'bg-green-600'}`}>
                  {car.availability === 'rent' ? 'For Rent' : 'For Sale'}
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
              <p className="text-sm opacity-90 mb-1">Price</p>
              <p className="text-4xl font-bold">{formatPrice(car.price)}</p>
            </div>

            {car.youtubeUrl && getYoutubeEmbedSrc(car.youtubeUrl) && (
              <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm">
                <h2 className="text-lg font-semibold px-6 pt-4 pb-2">Video Tour</h2>
                <div className="aspect-video bg-black">
                  <iframe title={`${car.title} video`} src={getYoutubeEmbedSrc(car.youtubeUrl)} className="w-full h-full border-0" allowFullScreen />
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Vehicle Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {specs.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Icon className="w-7 h-7 text-blue-600 mb-2" />
                    <p className="text-xs text-gray-500 mb-1">{label}</p>
                    <p className="text-sm font-semibold text-center">{value}</p>
                  </div>
                ))}
              </div>
              {car.vin && (
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <Hash className="w-4 h-4" /><span className="font-medium">VIN:</span> {car.vin}
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold mb-4">Description</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{car.description}</p>
            </div>

            {car.features?.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold mb-4">Features & Equipment</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {car.features.map(f => (
                    <div key={f} className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm sticky top-36">
              <h3 className="text-lg font-bold mb-4">Interested in this car?</h3>
              {car.phone && car.phone !== 'N/A' && (
                <a href={`tel:${car.phone}`}
                  className="flex items-center justify-center gap-2 w-full py-3 mb-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium">
                  <Phone className="w-5 h-5" /> Call {car.phone}
                </a>
              )}
              <button onClick={() => setShowSchedule(true)}
                className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium">
                <Calendar className="w-5 h-5" /> Schedule Viewing
              </button>
            </div>
          </div>
        </div>
      </div>

      {showSchedule && (
        <ScheduleViewing
          propertyId={car.id}
          propertyTitle={car.title}
          onClose={() => setShowSchedule(false)}
        />
      )}
    </div>
  );
};

export default CarDetails;
