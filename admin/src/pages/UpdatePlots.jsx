import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { backendurl } from '../config/constants';
import { Upload, X, Map, Youtube, Hash, FileText, Compass } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

const getYoutubePreviewSrc = (raw) => {
  if (!raw || typeof raw !== 'string') return null;
  const s = raw.trim();
  if (!s) return null;
  if (/youtube\.com\/embed\/[a-zA-Z0-9_-]{11}/i.test(s)) return s.split(/[?#]/)[0];
  let m = s.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  m = s.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  m = s.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;
  return null;
};

const AVAILABILITY_TYPES = ['rent', 'buy'];
const PLOT_AMENITIES = [
  'Road Access',
  'Electricity',
  'Water Supply',
  'Drainage',
  'Fencing',
  'Nearby Schools',
  'Nearby Hospitals',
  'Nearby Markets',
  'Parking',
  'Security',
  'Clear Title',
  'Approved Layout'
];

const FACING_OPTIONS = [
  '',
  'North',
  'South',
  'East',
  'West',
  'North-East',
  'North-West',
  'South-East',
  'South-West'
];

const asBool = (v) => v === true || v === 1 || v === '1';

const UpdatePlots = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCurrencySymbol } = useCurrency();
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Plot',
    price: '',
    location: '',
    description: '',
    sqft: '',
    phone: '',
    availability: '',
    plotNumber: '',
    surveyNumber: '',
    facing: '',
    cornerPlot: false,
    approvedLayout: false,
    amenities: [],
    frontImage: null,
    image1: null,
    image2: null,
    image3: null,
    image4: null,
    youtubeUrl: ''
  });
  const [existingFrontUrl, setExistingFrontUrl] = useState(null);
  const [frontImagePreview, setFrontImagePreview] = useState(null);
  const [previewUrls, setPreviewUrls] = useState([null, null, null, null]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id || id === 'undefined') {
        toast.error('Invalid plot ID');
        navigate('/list-plots', { replace: true });
        return;
      }

      try {
        setFetching(true);
        const response = await axios.get(
          `${backendurl}/api/plots/single/${encodeURIComponent(id)}`,
          { validateStatus: (status) => status >= 200 && status < 500 }
        );

        if (!response.data?.success || !response.data?.plot) {
          toast.error(
            response.data?.message ||
              (response.status === 404
                ? 'This plot was not found. It may have been deleted.'
                : 'Failed to load plot')
          );
          navigate('/list-plots', { replace: true });
          return;
        }

        const plot = response.data.plot;

        let amenities = [];
        if (plot.amenities) {
          if (Array.isArray(plot.amenities)) amenities = plot.amenities;
          else if (typeof plot.amenities === 'string') {
            try {
              const p = JSON.parse(plot.amenities);
              amenities = Array.isArray(p) ? p : [plot.amenities];
            } catch {
              amenities = [];
            }
          }
        }

        let gallery = [];
        if (plot.image) {
          if (Array.isArray(plot.image)) gallery = plot.image;
          else if (typeof plot.image === 'string') {
            try {
              const p = JSON.parse(plot.image);
              gallery = Array.isArray(p) ? p : [plot.image];
            } catch {
              gallery = [plot.image];
            }
          }
        }

        const areaVal = plot.area != null ? String(plot.area) : plot.sqft != null ? String(plot.sqft) : '';

        setFormData({
          title: plot.title || '',
          type: plot.type || 'Plot',
          price: plot.price != null ? String(plot.price) : '',
          location: plot.location || '',
          description: plot.description || '',
          sqft: areaVal,
          phone: plot.phone && plot.phone !== 'N/A' ? plot.phone : '',
          availability: plot.availability || '',
          plotNumber: plot.plotNumber != null ? String(plot.plotNumber) : '',
          surveyNumber: plot.surveyNumber != null ? String(plot.surveyNumber) : '',
          facing: plot.facing || '',
          cornerPlot: asBool(plot.cornerPlot),
          approvedLayout: asBool(plot.approvedLayout),
          amenities,
          frontImage: null,
          image1: null,
          image2: null,
          image3: null,
          image4: null,
          youtubeUrl: plot.youtubeUrl || ''
        });

        const front = plot.frontImage || null;
        setExistingFrontUrl(front);
        setFrontImagePreview(front);

        const slots = [null, null, null, null];
        gallery.slice(0, 4).forEach((url, i) => {
          slots[i] = url;
        });
        setPreviewUrls(slots);
      } catch (e) {
        console.error('Error fetching plot:', e);
        toast.error('Could not reach the server. Check your connection and API URL.');
        navigate('/list-plots', { replace: true });
      } finally {
        setFetching(false);
      }
    };

    load();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleFrontImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (frontImagePreview && frontImagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(frontImagePreview);
      }
      setFrontImagePreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, frontImage: file }));
    }
  };

  const removeFrontImage = () => {
    if (frontImagePreview && frontImagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(frontImagePreview);
    }
    setFormData((prev) => ({ ...prev, frontImage: null }));
    setFrontImagePreview(existingFrontUrl);
  };

  const handleImageChange = (imageNumber, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewIndex = imageNumber - 1;
    const newPreviewUrls = [...previewUrls];
    if (newPreviewUrls[previewIndex]?.startsWith?.('blob:')) {
      URL.revokeObjectURL(newPreviewUrls[previewIndex]);
    }
    newPreviewUrls[previewIndex] = URL.createObjectURL(file);
    setPreviewUrls(newPreviewUrls);
    const imageKey = `image${imageNumber}`;
    setFormData((prev) => ({ ...prev, [imageKey]: file }));
  };

  const removeImage = (index) => {
    const imageNumber = index + 1;
    const imageKey = `image${imageNumber}`;
    const url = previewUrls[index];
    if (url?.startsWith?.('blob:')) URL.revokeObjectURL(url);
    const newPreviewUrls = [...previewUrls];
    newPreviewUrls[index] = null;
    setPreviewUrls(newPreviewUrls);
    setFormData((prev) => ({ ...prev, [imageKey]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.location?.trim() || !formData.description?.trim() || !formData.availability) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    if (!formData.sqft || parseFloat(formData.sqft) <= 0) {
      toast.error('Please enter a valid area');
      return;
    }
    if (!formData.phone?.trim()) {
      toast.error('Please enter a contact phone');
      return;
    }
    if (!existingFrontUrl && !formData.frontImage) {
      toast.error('Please upload a front image');
      return;
    }

    setLoading(true);
    try {
      const formdata = new FormData();
      formdata.append('id', id);
      formdata.append('title', formData.title.trim());
      formdata.append('type', 'Plot');
      formdata.append('price', parseFloat(formData.price));
      formdata.append('location', formData.location.trim());
      formdata.append('description', formData.description.trim());
      formdata.append('area', parseFloat(formData.sqft));
      formdata.append('areaUnit', 'sqft');
      formdata.append('phone', formData.phone.trim());
      formdata.append('availability', formData.availability);

      if (formData.plotNumber?.trim()) formdata.append('plotNumber', formData.plotNumber.trim());
      if (formData.surveyNumber?.trim()) formdata.append('surveyNumber', formData.surveyNumber.trim());
      if (formData.facing) formdata.append('facing', formData.facing);
      formdata.append('cornerPlot', formData.cornerPlot ? 'true' : 'false');
      formdata.append('approvedLayout', formData.approvedLayout ? 'true' : 'false');

      if (formData.amenities?.length) {
        formData.amenities.forEach((amenity, index) => {
          formdata.append(`amenities[${index}]`, amenity);
        });
      }

      const yt = (formData.youtubeUrl || '').trim();
      formdata.append('youtubeUrl', yt);

      if (formData.frontImage) formdata.append('frontImage', formData.frontImage);
      if (formData.image1) formdata.append('image1', formData.image1);
      if (formData.image2) formdata.append('image2', formData.image2);
      if (formData.image3) formdata.append('image3', formData.image3);
      if (formData.image4) formdata.append('image4', formData.image4);

      const qs = yt ? `youtubeUrl=${encodeURIComponent(yt)}` : 'youtubeUrl=';

      // Do not set Content-Type manually — axios must add the multipart boundary.
      const response = await axios.post(`${backendurl}/api/plots/update?${qs}`, formdata, {
        headers: {
          'X-Plot-Youtube-Url': yt,
          'X-Youtube-Url': yt
        }
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Plot updated successfully!');
        navigate('/list-plots');
      } else {
        toast.error(response.data.message || 'Failed to update plot');
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        'Failed to update plot';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const youtubePreviewSrc = getYoutubePreviewSrc(formData.youtubeUrl);

  if (fetching) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Loading plot...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 px-4 bg-gray-50 pb-16">
      <div className="max-w-2xl mx-auto rounded-lg shadow-xl bg-white p-6">
        <div className="flex items-start gap-3 mb-6 pb-4 border-b border-gray-100">
          <div className="p-2 bg-amber-100 rounded-lg shrink-0">
            <Map className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-700">Plot #{id}</p>
            <h2 className="text-2xl font-bold text-gray-900">Update plot</h2>
            <p className="text-sm text-gray-500 mt-1">
              Review and edit every field below—including the YouTube link—then save your changes.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Plot details</h3>
            <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Plot Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                  Availability *
                </label>
                <select
                  id="availability"
                  name="availability"
                  required
                  value={formData.availability}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select Availability</option>
                  {AVAILABILITY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price ({getCurrencySymbol()}) *
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">{getCurrencySymbol()}</span>
                  </div>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    required
                    min="0"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="block w-full pl-8 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="sqft" className="block text-sm font-medium text-gray-700">
                  Area (Sq. Ft.) *
                </label>
                <input
                  type="number"
                  id="sqft"
                  name="sqft"
                  required
                  min="0"
                  value={formData.sqft}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Contact Phone *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="pt-2 border-t border-gray-200 mt-2 space-y-4">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                <Compass className="w-4 h-4 text-amber-700" aria-hidden />
                Survey &amp; layout (optional)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="plotNumber" className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-gray-500" aria-hidden />
                    Plot number
                  </label>
                  <input
                    type="text"
                    id="plotNumber"
                    name="plotNumber"
                    value={formData.plotNumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="surveyNumber" className="block text-sm font-medium text-gray-700 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-gray-500" aria-hidden />
                    Survey number
                  </label>
                  <input
                    type="text"
                    id="surveyNumber"
                    name="surveyNumber"
                    value={formData.surveyNumber}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="facing" className="block text-sm font-medium text-gray-700">
                  Facing
                </label>
                <select
                  id="facing"
                  name="facing"
                  value={formData.facing}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm sm:text-sm"
                >
                  <option value="">—</option>
                  {FACING_OPTIONS.filter(Boolean).map((dir) => (
                    <option key={dir} value={dir}>
                      {dir}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="cornerPlot"
                    checked={formData.cornerPlot}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-800">Corner plot</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="approvedLayout"
                    checked={formData.approvedLayout}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-800">Approved layout</span>
                </label>
              </div>
            </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Youtube className="w-4 h-4 text-red-600" aria-hidden />
              YouTube video (embed)
            </h3>
            <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
              <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700">
                Link or embed URL
              </label>
              <input
                type="text"
                id="youtubeUrl"
                name="youtubeUrl"
                value={formData.youtubeUrl}
                onChange={handleInputChange}
                placeholder="e.g. https://www.youtube.com/watch?v=… or youtu.be/…"
                className="block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                autoComplete="off"
              />
              <p className="text-xs text-gray-500">
                Paste a watch link, short link, or embed URL. The server saves a standard embed URL. Clear the field to remove the video from the public plot page.
              </p>
              {formData.youtubeUrl?.trim() && (
                <p className="text-xs text-gray-600 break-all">
                  <span className="font-medium text-gray-700">Current value: </span>
                  {formData.youtubeUrl.trim()}
                </p>
              )}
              {youtubePreviewSrc && (
                <div className="pt-2">
                  <p className="text-xs font-medium text-gray-700 mb-2">Preview</p>
                  <div className="aspect-video w-full max-w-lg rounded-lg overflow-hidden border border-gray-200 bg-black">
                    <iframe
                      title="YouTube preview"
                      src={youtubePreviewSrc}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Amenities</h3>
            <label className="block text-sm font-medium text-gray-700 mb-3 sr-only">Plot amenities</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {PLOT_AMENITIES.map((amenity) => (
                <label key={amenity} className="flex items-center cursor-pointer p-2 rounded-lg border border-gray-200 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Photos</h3>
            <label className="block text-sm font-medium text-gray-700 mb-2">Front image (main display) *</label>
            {frontImagePreview ? (
              <div className="relative inline-block w-full">
                <img
                  src={frontImagePreview}
                  alt="Front"
                  className="h-48 w-full object-cover rounded-lg border-2 border-gray-200"
                />
                {formData.frontImage && (
                  <button
                    type="button"
                    onClick={removeFrontImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    title="Discard new image"
                  >
                    <X size={16} />
                  </button>
                )}
                <label className="mt-2 inline-block text-sm text-amber-700 font-medium cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={handleFrontImageChange}
                  />
                  Replace with another image
                </label>
              </div>
            ) : (
              <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <label htmlFor="frontImage" className="cursor-pointer text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <span className="text-sm text-indigo-600">Upload front image</span>
                  <input
                    id="frontImage"
                    name="frontImage"
                    type="file"
                    accept="image/*"
                    onChange={handleFrontImageChange}
                    className="sr-only"
                  />
                </label>
              </div>
            )}
            {!formData.frontImage && existingFrontUrl && (
              <p className="text-xs text-gray-500 mt-1">Remove and upload a new image to replace the current one.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Images (up to 4)</label>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="space-y-2">
                  <label className="block text-xs text-gray-600">Image {num}</label>
                  {previewUrls[num - 1] ? (
                    <div className="relative">
                      <img
                        src={previewUrls[num - 1]}
                        alt={`Gallery ${num}`}
                        className="h-32 w-full object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(num - 1)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-center px-4 pt-3 pb-3 border-2 border-gray-300 border-dashed rounded-md">
                      <label htmlFor={`image${num}`} className="cursor-pointer text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <span className="text-xs text-gray-600 mt-1 block">Upload</span>
                        <input
                          id={`image${num}`}
                          name={`image${num}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageChange(num, e)}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Update Plot'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdatePlots;
