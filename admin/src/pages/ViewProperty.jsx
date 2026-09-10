import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  Phone,
  Edit3,
  Home,
  Calendar,
  Youtube,
  Building2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { backendurl } from '../config/constants';
import { useCurrency } from '../contexts/CurrencyContext';
import { getYoutubeEmbedSrc } from '../utils/youtubeEmbed';

const parseAmenities = (amenities) => {
  if (!amenities) return [];
  if (Array.isArray(amenities)) return amenities;
  if (typeof amenities === 'string') {
    try {
      const p = JSON.parse(amenities);
      return Array.isArray(p) ? p : [amenities];
    } catch {
      return [amenities];
    }
  }
  return [];
};

const ViewProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!id || id === 'undefined') {
        toast.error('Invalid property ID');
        navigate('/list', { replace: true });
        return;
      }
      try {
        setLoading(true);
        const response = await axios.get(
          `${backendurl}/api/products/single/${encodeURIComponent(id)}`,
          { validateStatus: (s) => s >= 200 && s < 500 }
        );
        if (!response.data?.success || !response.data?.property) {
          toast.error(
            response.data?.message ||
              (response.status === 404 ? 'Property not found.' : 'Failed to load property')
          );
          navigate('/list', { replace: true });
          return;
        }
        const p = response.data.property;
        setProperty({
          ...p,
          amenities: parseAmenities(p.amenities)
        });
      } catch (e) {
        console.error(e);
        toast.error('Could not load property.');
        navigate('/list', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="admin-page flex items-center justify-center">
        <p className="text-gray-600">Loading property…</p>
      </div>
    );
  }

  if (!property) return null;

  const images = [];
  if (property.frontImage) images.push(property.frontImage);
  (property.image || []).forEach((url) => {
    if (url && !images.includes(url)) images.push(url);
  });
  const mainImage = images[0] || null;
  const gallery = images.slice(1);
  const videoSrc = getYoutubeEmbedSrc(property.youtubeUrl);
  const desc = property.description || '';
  const descIsHtml = /<[a-z][\s\S]*>/i.test(desc);

  return (
    <div className="admin-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <Link
            to="/list"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to properties
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/update/${property.id}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </Link>
          </div>
        </motion.div>

        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className="relative h-72 sm:h-96 bg-gray-200">
            {mainImage ? (
              <img src={mainImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Home className="w-16 h-16 text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm font-medium">
                  {property.type}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    property.availability === 'rent'
                      ? 'bg-emerald-500/90'
                      : 'bg-blue-500/90'
                  }`}
                >
                  For {property.availability}
                </span>
                {property.youtubeUrl && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/50 text-sm">
                    <Youtube className="w-3.5 h-3.5" />
                    Video tour
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{property.title}</h1>
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{property.location}</span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-gray-100 pb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Price</p>
                <p className="text-3xl font-bold text-gray-900">{formatPrice(property.price)}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                Listed {property.createdAt ? new Date(property.createdAt).toLocaleString() : '—'}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <BedDouble className="w-5 h-5 text-gray-400 mb-2" />
                <p className="text-lg font-semibold text-gray-900">{property.beds}</p>
                <p className="text-xs text-gray-500">Bedrooms</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <Bath className="w-5 h-5 text-gray-400 mb-2" />
                <p className="text-lg font-semibold text-gray-900">{property.baths}</p>
                <p className="text-xs text-gray-500">Bathrooms</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <Maximize className="w-5 h-5 text-gray-400 mb-2" />
                <p className="text-lg font-semibold text-gray-900">
                  {Number(property.sqft || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">Sq ft</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 col-span-2 sm:col-span-1">
                <Phone className="w-5 h-5 text-gray-400 mb-2" />
                <p className="text-lg font-semibold text-gray-900 truncate">{property.phone}</p>
                <p className="text-xs text-gray-500">Contact</p>
              </div>
            </div>

            {gallery.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Gallery</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {gallery.map((src, i) => (
                    <a
                      key={`${src}-${i}`}
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200"
                    >
                      <img src={src} alt="" className="w-full h-full object-cover hover:opacity-95 transition-opacity" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {videoSrc && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-red-600" />
                  Video tour
                </h2>
                <div className="aspect-video rounded-xl overflow-hidden bg-black shadow-md max-w-3xl">
                  <iframe
                    title="Property video"
                    src={videoSrc}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {property.amenities?.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Amenities
                </h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((a, i) => (
                    <span
                      key={`${a}-${i}`}
                      className="px-3 py-1.5 bg-blue-50 text-blue-800 text-sm rounded-full border border-blue-100"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              {descIsHtml ? (
                <div
                  className="text-gray-700 text-sm leading-relaxed max-w-none border border-gray-100 rounded-xl p-4 bg-gray-50/50 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-blue-600 [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: desc }}
                />
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{desc}</p>
              )}
            </div>

            <p className="text-xs text-gray-400">Property ID: {property.id}</p>
          </div>
        </motion.article>
      </div>
    </div>
  );
};

export default ViewProperty;
