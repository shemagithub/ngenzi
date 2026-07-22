import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  MapPin,
  Maximize,
  Phone,
  Edit3,
  Map,
  Calendar,
  Youtube,
  Hash
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

const ViewPlot = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [plot, setPlot] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!id || id === 'undefined') {
        toast.error('Invalid plot ID');
        navigate('/list-plots', { replace: true });
        return;
      }
      try {
        setLoading(true);
        const response = await axios.get(
          `${backendurl}/api/plots/single/${encodeURIComponent(id)}`,
          { validateStatus: (s) => s >= 200 && s < 500 }
        );
        if (!response.data?.success || !response.data?.plot) {
          toast.error(
            response.data?.message ||
              (response.status === 404 ? 'Plot not found.' : 'Failed to load plot')
          );
          navigate('/list-plots', { replace: true });
          return;
        }
        const p = response.data.plot;
        setPlot({
          ...p,
          amenities: parseAmenities(p.amenities)
        });
      } catch (e) {
        console.error(e);
        toast.error('Could not load plot.');
        navigate('/list-plots', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-amber-50/30">
        <p className="text-gray-600">Loading plot…</p>
      </div>
    );
  }

  if (!plot) return null;

  let images = [];
  if (plot.image) {
    if (Array.isArray(plot.image)) images = [...plot.image];
    else if (typeof plot.image === 'string') {
      try {
        const p = JSON.parse(plot.image);
        images = Array.isArray(p) ? p : [plot.image];
      } catch {
        images = [plot.image];
      }
    }
  }
  const mainImage = plot.frontImage || images[0] || null;
  const gallery = images.filter((u) => u && u !== plot.frontImage);
  const videoSrc = getYoutubeEmbedSrc(plot.youtubeUrl);
  const desc = plot.description || '';
  const descIsHtml = /<[a-z][\s\S]*>/i.test(desc);
  const areaVal = plot.area != null ? plot.area : plot.sqft;

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-gray-50 via-white to-amber-50/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <Link
            to="/list-plots"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-amber-700 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to plots
          </Link>
          <Link
            to={`/update-plot/${plot.id}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700 shadow-sm transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </Link>
        </motion.div>

        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <div className="relative h-72 sm:h-96 bg-gray-200">
            {mainImage ? (
              <img src={mainImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Map className="w-16 h-16 text-gray-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-3 py-1 bg-amber-500/90 rounded-full text-sm font-medium">Plot</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    plot.availability === 'rent' ? 'bg-emerald-500/90' : 'bg-blue-500/90'
                  }`}
                >
                  {plot.availability?.toUpperCase() || 'BUY'}
                </span>
                {plot.youtubeUrl && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/50 text-sm">
                    <Youtube className="w-3.5 h-3.5" />
                    Video tour
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{plot.title}</h1>
              <div className="flex items-center gap-2 text-white/90 text-sm">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{plot.location}</span>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-gray-100 pb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Price</p>
                <p className="text-3xl font-bold text-amber-700">{formatPrice(plot.price)}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                Listed {plot.createdAt ? new Date(plot.createdAt).toLocaleString() : '—'}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                <Maximize className="w-5 h-5 text-amber-600/70 mb-2" />
                <p className="text-lg font-semibold text-gray-900">
                  {Number(areaVal || 0).toLocaleString()} {plot.areaUnit || 'sq.ft.'}
                </p>
                <p className="text-xs text-gray-500">Area</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <Phone className="w-5 h-5 text-gray-400 mb-2" />
                <p className="text-lg font-semibold text-gray-900 truncate">
                  {plot.phone && plot.phone !== 'N/A' ? plot.phone : '—'}
                </p>
                <p className="text-xs text-gray-500">Contact</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 col-span-2 sm:col-span-1">
                <Hash className="w-5 h-5 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-900">
                  {plot.plotNumber || '—'} / {plot.surveyNumber || '—'}
                </p>
                <p className="text-xs text-gray-500">Plot / Survey #</p>
              </div>
            </div>

            {(plot.facing || plot.cornerPlot || plot.approvedLayout) && (
              <div className="flex flex-wrap gap-2">
                {plot.facing && (
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-800 text-sm rounded-lg">
                    Facing: {plot.facing}
                  </span>
                )}
                {plot.cornerPlot && (
                  <span className="px-3 py-1.5 bg-amber-100 text-amber-900 text-sm rounded-lg">
                    Corner plot
                  </span>
                )}
                {plot.approvedLayout && (
                  <span className="px-3 py-1.5 bg-emerald-100 text-emerald-900 text-sm rounded-lg">
                    Approved layout
                  </span>
                )}
              </div>
            )}

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
                    title="Plot video"
                    src={videoSrc}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {plot.amenities?.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {plot.amenities.map((a, i) => (
                    <span
                      key={`${a}-${i}`}
                      className="px-3 py-1.5 bg-gray-100 text-gray-800 text-sm rounded-full"
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

            <p className="text-xs text-gray-400">Plot ID: {plot.id}</p>
          </div>
        </motion.article>
      </div>
    </div>
  );
};

export default ViewPlot;
