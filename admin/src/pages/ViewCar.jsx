import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { ArrowLeft, MapPin, Phone, Edit3, Car, Calendar, Gauge, Fuel, Settings, Palette, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import { backendurl } from '../config/constants';
import { useCurrency } from '../contexts/CurrencyContext';
import { getYoutubeEmbedSrc } from '../utils/youtubeEmbed';

const parseFeatures = (features) => {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  if (typeof features === 'string') {
    try { const p = JSON.parse(features); return Array.isArray(p) ? p : [features]; } catch { return [features]; }
  }
  return [];
};

const ViewCar = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [car, setCar] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!id || id === 'undefined') { toast.error('Invalid car ID'); navigate('/list-cars', { replace: true }); return; }
      try {
        setLoading(true);
        const response = await axios.get(`${backendurl}/api/cars/single/${encodeURIComponent(id)}`, { validateStatus: (s) => s >= 200 && s < 500 });
        if (!response.data?.success || !response.data?.car) {
          toast.error(response.data?.message || 'Car not found');
          navigate('/list-cars', { replace: true });
          return;
        }
        setCar({ ...response.data.car, features: parseFeatures(response.data.car.features) });
      } catch {
        toast.error('Could not load car');
        navigate('/list-cars', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  if (loading) return <div className="min-h-screen pt-24 flex items-center justify-center"><p>Loading car…</p></div>;
  if (!car) return null;

  let images = [];
  if (car.image) {
    if (Array.isArray(car.image)) images = [...car.image];
    else if (typeof car.image === 'string') {
      try { const p = JSON.parse(car.image); images = Array.isArray(p) ? p : [car.image]; } catch { images = [car.image]; }
    }
  }
  const mainImage = car.frontImage || images[0] || null;
  const gallery = images.filter(u => u && u !== car.frontImage);
  const videoSrc = getYoutubeEmbedSrc(car.youtubeUrl);

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-gray-50 via-white to-blue-50/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link to="/list-cars" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-700 text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to cars
          </Link>
          <Link to={`/update-car/${car.id}`} className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
            <Edit3 className="w-4 h-4" /> Edit
          </Link>
        </motion.div>

        <motion.article initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="relative h-72 sm:h-96 bg-gray-200">
            {mainImage ? <img src={mainImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Car className="w-16 h-16 text-gray-400" /></div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-3 py-1 bg-blue-500/90 rounded-full text-sm font-medium">{car.brand} {car.model}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${car.availability === 'buy' ? 'bg-green-500/90' : 'bg-purple-500/90'}`}>
                  {car.availability === 'buy' ? 'For Sale' : 'For Rent'}
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">{car.condition}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">{car.title}</h1>
              <p className="text-2xl font-bold mt-2">{formatPrice(car.price)}</p>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Calendar, label: 'Year', value: car.year },
                { icon: Gauge, label: 'Mileage', value: `${car.mileage?.toLocaleString()} ${car.mileageUnit || 'km'}` },
                { icon: Fuel, label: 'Fuel', value: car.fuelType },
                { icon: Settings, label: 'Transmission', value: car.transmission },
                { icon: Palette, label: 'Color', value: car.color || '—' },
                { icon: Car, label: 'Body', value: car.bodyType || '—' },
                { icon: Settings, label: 'Engine', value: car.engineSize || '—' },
                { icon: MapPin, label: 'Location', value: car.location },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="p-4 bg-gray-50 rounded-xl">
                  <Icon className="w-5 h-5 text-blue-600 mb-2" />
                  <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
                  <p className="font-semibold text-gray-900 mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {car.vin && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Hash className="w-4 h-4" /><span className="font-medium">VIN:</span> {car.vin}
              </div>
            )}

            {car.phone && car.phone !== 'N/A' && (
              <a href={`tel:${car.phone}`} className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700">
                <Phone className="w-4 h-4" /> {car.phone}
              </a>
            )}

            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{car.description}</p>
            </div>

            {car.features?.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Features</h2>
                <div className="flex flex-wrap gap-2">
                  {car.features.map(f => (
                    <span key={f} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm">{f}</span>
                  ))}
                </div>
              </div>
            )}

            {gallery.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {gallery.map((url, i) => <img key={i} src={url} alt="" className="w-full h-24 object-cover rounded-lg" />)}
                </div>
              </div>
            )}

            {videoSrc && (
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-3">Video</h2>
                <div className="aspect-video rounded-xl overflow-hidden">
                  <iframe src={videoSrc} title="Car video" className="w-full h-full" allowFullScreen />
                </div>
              </div>
            )}
          </div>
        </motion.article>
      </div>
    </div>
  );
};

export default ViewCar;
