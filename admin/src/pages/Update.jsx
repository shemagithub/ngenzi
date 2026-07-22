import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { backendurl } from '../config/constants';
import { X, Upload, Youtube } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

/** Client-side preview only; server still normalizes on save */
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

const PROPERTY_TYPES = ['House', 'Apartment', 'Office', 'Villa'];
const AVAILABILITY_TYPES = ['rent', 'buy'];
const AMENITIES = ['Lake View', 'Fireplace', 'Central heating and air conditioning', 'Dock', 'Pool', 'Garage', 'Garden', 'Gym', 'Security system', 'Master bathroom', 'Guest bathroom', 'Home theater', 'Exercise room/gym', 'Covered parking', 'High-speed internet ready'];

const Update = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCurrencySymbol } = useCurrency();
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    price: '',
    location: '',
    description: '',
    beds: '',
    baths: '',
    sqft: '',
    phone: '',
    availability: '',
    amenities: [],
    images: [],
    youtubeUrl: ''
  });
  const [previewUrls, setPreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]); // Store existing image URLs
  const [newImages, setNewImages] = useState([]); // Store new image files
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      // Validate that id exists
      if (!id || id === 'undefined') {
        toast.error('Invalid property ID');
        navigate('/list', { replace: true });
        return;
      }

      try {
        // Treat 4xx as a normal response so axios does not reject (avoids noisy console errors for missing rows).
        const response = await axios.get(
          `${backendurl}/api/products/single/${encodeURIComponent(id)}`,
          { validateStatus: (status) => status >= 200 && status < 500 }
        );

        if (!response.data?.success || !response.data?.property) {
          toast.error(
            response.data?.message ||
              (response.status === 404
                ? 'This property was not found. It may have been deleted.'
                : 'Failed to load property')
          );
          navigate('/list', { replace: true });
          return;
        }

        const property = response.data.property;

        // Normalize image field to always be an array; include front image when stored separately
        let images = [];
        if (property.image) {
          if (Array.isArray(property.image)) {
            images = [...property.image];
          } else if (typeof property.image === 'string') {
            try {
              const parsed = JSON.parse(property.image);
              images = Array.isArray(parsed) ? [...parsed] : [property.image];
            } catch {
              images = [property.image];
            }
          }
        }
        if (property.frontImage && !images.includes(property.frontImage)) {
          images = [property.frontImage, ...images];
        }
        images = images.slice(0, 4);

        // Normalize amenities field to always be an array
        let amenities = [];
        if (property.amenities) {
          if (Array.isArray(property.amenities)) {
            amenities = property.amenities;
          } else if (typeof property.amenities === 'string') {
            try {
              const parsed = JSON.parse(property.amenities);
              amenities = Array.isArray(parsed) ? parsed : [property.amenities];
            } catch {
              amenities = [property.amenities];
            }
          }
        }

        setFormData({
          title: property.title || '',
          type: property.type || '',
          price: property.price || '',
          location: property.location || '',
          description: property.description || '',
          beds: property.beds || '',
          baths: property.baths || '',
          sqft: property.sqft || '',
          phone: property.phone || '',
          availability: property.availability || '',
          amenities: amenities,
          images: [], // New images will be added via file input
          youtubeUrl: property.youtubeUrl || ''
        });
        setExistingImages(images);
        setPreviewUrls(images);
        setNewImages([]);
      } catch (error) {
        const serverMessage = error.response?.data?.message;
        if (error.response) {
          console.error('Error fetching property:', error.response.status, serverMessage || error.message);
          toast.error(serverMessage || 'Failed to load property. Please try again.');
        } else {
          console.error('Error fetching property:', error);
          toast.error('Could not reach the server. Check your connection and API URL.');
        }
        navigate('/list', { replace: true });
      }
    };

    fetchProperty();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + previewUrls.length > 4) {
      toast.error('Maximum 4 images allowed');
      return;
    }

    // Create preview URLs for new files
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    
    // Combine existing images with new preview URLs
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    
    // Store new files separately
    setNewImages((prev) => [...prev, ...files]);
    
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    // Check if it's an existing image (URL) or new image (file)
    if (index < existingImages.length) {
      // Remove existing image
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Remove new image file
      const newIndex = index - existingImages.length;
      setNewImages((prev) => {
        const updated = prev.filter((_, i) => i !== newIndex);
        // Revoke object URL to free memory
        const removedFile = prev[newIndex];
        if (removedFile && removedFile instanceof File) {
          // Find and revoke the corresponding preview URL
          const previewIndex = existingImages.length + newIndex;
          const previewUrl = previewUrls[previewIndex];
          if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
          }
        }
        return updated;
      });
    }
    
    // Update preview URLs
    setPreviewUrls((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // Revoke object URL for removed image if it's a blob URL
      const removedUrl = prev[index];
      if (removedUrl && removedUrl.startsWith('blob:') && index >= existingImages.length) {
        URL.revokeObjectURL(removedUrl);
      }
      return updated;
    });
    
    // Update form data (only affects new images)
    setFormData((prev) => ({
      ...prev,
      images: index >= existingImages.length 
        ? prev.images.filter((_, i) => i !== (index - existingImages.length))
        : prev.images
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formdata = new FormData();
      formdata.append('id', id);
      formdata.append('title', formData.title);
      formdata.append('type', formData.type);
      formdata.append('price', formData.price);
      formdata.append('location', formData.location);
      formdata.append('description', formData.description);
      formdata.append('beds', formData.beds);
      formdata.append('baths', formData.baths);
      formdata.append('sqft', formData.sqft);
      formdata.append('phone', formData.phone);
      formdata.append('availability', formData.availability);
      formdata.append('amenities', JSON.stringify(formData.amenities));

      const yt = (formData.youtubeUrl || '').trim();
      formdata.append('youtubeUrl', yt);

      // Only append new image files (not existing URLs) — after text fields
      newImages.forEach((image, index) => {
        if (image instanceof File) {
          formdata.append(`image${index + 1}`, image);
        }
      });

      const qs = yt ? `youtubeUrl=${encodeURIComponent(yt)}` : 'youtubeUrl=';

      // Do not set Content-Type manually — axios must add the multipart boundary.
      const response = await axios.post(`${backendurl}/api/products/update?${qs}`, formdata, {
        headers: {
          'X-Property-Youtube-Url': yt,
          'X-Youtube-Url': yt
        }
      });
      if (response.data.success) {
        toast.success('Property updated successfully');
        navigate('/list');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const youtubePreviewSrc = getYoutubePreviewSrc(formData.youtubeUrl);

  return (
    <div className="min-h-screen pt-32 px-4 bg-gray-50 pb-16">
      <div className="max-w-2xl mx-auto rounded-lg shadow-xl bg-white p-6">
        <div className="mb-6 pb-4 border-b border-gray-100">
          <p className="text-sm font-medium text-indigo-600">Property #{id}</p>
          <h2 className="text-2xl font-bold text-gray-900">Update property</h2>
          <p className="text-sm text-gray-500 mt-1">
            All fields below reflect the current listing. Change anything you need, including the YouTube embed link, then save.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Listing details</h3>
            <div className="space-y-4 rounded-xl border border-gray-100 bg-gray-50/50 p-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Property Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Property Type
                </label>
                <select
                  id="type"
                  name="type"
                  required
                  value={formData.type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select Type</option>
                  {PROPERTY_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                  Availability
                </label>
                <select
                  id="availability"
                  name="availability"
                  required
                  value={formData.availability}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                  <option value="">Select Availability</option>
                  {AVAILABILITY_TYPES.map(type => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                  Price ({getCurrencySymbol()})
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
                    className="block w-full pl-8 rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter price"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="beds" className="block text-sm font-medium text-gray-700">
                  Bedrooms
                </label>
                <input
                  type="number"
                  id="beds"
                  name="beds"
                  required
                  min="0"
                  value={formData.beds}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="baths" className="block text-sm font-medium text-gray-700">
                  Bathrooms
                </label>
                <input
                  type="number"
                  id="baths"
                  name="baths"
                  required
                  min="0"
                  value={formData.baths}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="sqft" className="block text-sm font-medium text-gray-700">
                  Square Feet
                </label>
                <input
                  type="number"
                  id="sqft"
                  name="sqft"
                  required
                  min="0"
                  value={formData.sqft}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Contact Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                required
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            </div>
          </div>

          {/* YouTube — full width section */}
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
                placeholder="e.g. https://www.youtube.com/watch?v=… or https://youtu.be/…"
                className="block w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                autoComplete="off"
              />
              <p className="text-xs text-gray-500">
                Paste a watch link, short link, or embed URL. The server saves a standard embed URL. Clear the field to remove the video from the public page.
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

          {/* Amenities */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Amenities</h3>
            <label className="block text-sm font-medium text-gray-700 mb-2 sr-only">
              Amenities
            </label>
            <div className="flex flex-wrap gap-2">
              {AMENITIES.map(amenity => (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => handleAmenityToggle(amenity)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    formData.amenities.includes(amenity)
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Photos</h3>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property images (max 4)
            </label>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="h-40 w-full object-cover rounded-lg"
                    onError={(e) => {
                      // Fallback for broken images
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZTwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                  {index < existingImages.length && (
                    <span className="absolute top-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs rounded">
                      Existing
                    </span>
                  )}
                </div>
              ))}
            </div>
            {previewUrls.length < 4 && (
              <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="images" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>Upload images</span>
                      <input
                        id="images"
                        name="images"
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Update;