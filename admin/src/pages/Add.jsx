import { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { backendurl } from '../config/constants';
import { Upload, X } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

const PROPERTY_TYPES = ['House', 'Apartment', 'Office', 'Villa'];
const AVAILABILITY_TYPES = ['rent', 'buy'];

const PropertyForm = () => {
  const { getCurrencySymbol, currency } = useCurrency();
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
    frontImage: null,
    image1: null,
    image2: null,
    image3: null,
    image4: null,
    youtubeUrl: ''
  });

  const [frontImagePreview, setFrontImagePreview] = useState(null);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newAmenity, setNewAmenity] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleFrontImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFrontImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        frontImage: file
      }));
    }
  };

  const removeFrontImage = () => {
    if (frontImagePreview) {
      URL.revokeObjectURL(frontImagePreview);
    }
    setFrontImagePreview(null);
    setFormData(prev => ({
      ...prev,
      frontImage: null
    }));
  };

  const handleImageChange = (imageNumber, e) => {
    const file = e.target.files[0];
    if (file) {
      const imageKey = `image${imageNumber}`;
      const previewIndex = imageNumber - 1;
      
      // Update preview
      const newPreviewUrls = [...previewUrls];
      if (newPreviewUrls[previewIndex]) {
        URL.revokeObjectURL(newPreviewUrls[previewIndex]);
      }
      newPreviewUrls[previewIndex] = URL.createObjectURL(file);
      setPreviewUrls(newPreviewUrls);
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        [imageKey]: file
      }));
    }
  };

  const removeImage = (index) => {
    const imageNumber = index + 1;
    const imageKey = `image${imageNumber}`;
    
    // Revoke URL if exists
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    
    // Remove from preview array
    const newPreviewUrls = [...previewUrls];
    newPreviewUrls[index] = null;
    // Filter out nulls but maintain array length for proper indexing
    const filteredUrls = newPreviewUrls.map((url, idx) => idx === index ? null : url);
    setPreviewUrls(filteredUrls);
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [imageKey]: null
    }));
  };

  const handleAddAmenity = () => {
    if (newAmenity && !formData.amenities.includes(newAmenity)) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity]
      }));
      setNewAmenity('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const formdata = new FormData();
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
      formData.amenities.forEach((amenity, index) => {
        formdata.append(`amenities[${index}]`, amenity);
      });

      const yt = (formData.youtubeUrl || '').trim();
      formdata.append('youtubeUrl', yt);
      
      // Append frontImage (after text fields — youtube before files for reliable multipart parsing)
      if (formData.frontImage) {
        formdata.append('frontImage', formData.frontImage);
      }
      
      if (formData.image1) formdata.append('image1', formData.image1);
      if (formData.image2) formdata.append('image2', formData.image2);
      if (formData.image3) formdata.append('image3', formData.image3);
      if (formData.image4) formdata.append('image4', formData.image4);

      const qs = yt ? `youtubeUrl=${encodeURIComponent(yt)}` : 'youtubeUrl=';

      // Do not set Content-Type manually — axios must add the multipart boundary.
      const response = await axios.post(`${backendurl}/api/products/add?${qs}`, formdata, {
        headers: {
          'X-Property-Youtube-Url': yt,
          'X-Youtube-Url': yt
        }
      });

      if (response.data.success) {
        toast.success(response.data.message);
        setFormData({
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
          frontImage: null,
          image1: null,
          image2: null,
          image3: null,
          image4: null,
          youtubeUrl: ''
        });
        setFrontImagePreview(null);
        setPreviewUrls([]);
        // toast.success is already called on line 169 with response.data.message
      } else {
        toast.error(response.data.message || "Failed to add property");
      }
    } catch (error) {
      console.error('Error adding property:', error);
      
      // Show more specific error messages
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || 
                            error.response.data?.error || 
                            `Server error: ${error.response.status}`;
        
        // Check for validation errors
        if (error.response.data?.validationErrors) {
          const validationMessages = error.response.data.validationErrors
            .map((err) => `${err.field}: ${err.message}`)
            .join('\n');
          toast.error(`Validation Error:\n${validationMessages}`);
        } else {
          toast.error(errorMessage);
        }
      } else if (error.request) {
        // Request was made but no response received
        toast.error("Network error: Unable to connect to server. Please check your connection.");
      } else {
        // Something else happened
        toast.error(error.message || "Failed to add property. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 px-4 bg-gray-50">
      <div className="max-w-2xl mx-auto rounded-lg shadow-xl bg-white p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Property</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
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

            <div>
              <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700">
                YouTube video (optional)
              </label>
              <input
                type="url"
                id="youtubeUrl"
                name="youtubeUrl"
                value={formData.youtubeUrl}
                onChange={handleInputChange}
                placeholder="https://www.youtube.com/watch?v=… or youtu.be/…"
                className="mt-1 block w-full rounded-md border border-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Shown as an embedded video on the public property page.
              </p>
            </div>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amenities
            </label>
            <div className="flex flex-wrap gap-2">
              {formData.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`amenity-${index}`}
                    name="amenities"
                    value={amenity}
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor={`amenity-${index}`} className="ml-2 block text-sm text-gray-700">
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center">
              <input
                type="text"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="Add new amenity"
                className="mt-1 block w-full rounded-md border border-gray-100 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <button
                type="button"
                onClick={handleAddAmenity}
                className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Front Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Front Image (Main Display Image) *
            </label>
            {frontImagePreview ? (
              <div className="relative inline-block">
                <img
                  src={frontImagePreview}
                  alt="Front image preview"
                  className="h-48 w-full object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  type="button"
                  onClick={removeFrontImage}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="frontImage" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                      <span>Upload front image</span>
                      <input
                        id="frontImage"
                        name="frontImage"
                        type="file"
                        accept="image/*"
                        onChange={handleFrontImageChange}
                        className="sr-only"
                        required
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Additional Images Upload (Image 1-4) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Images (Optional - Up to 4)
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="space-y-2">
                  <label className="block text-xs text-gray-600">
                    Image {num}
                  </label>
                  {previewUrls[num - 1] ? (
                    <div className="relative">
                      <img
                        src={previewUrls[num - 1]}
                        alt={`Preview ${num}`}
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

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyForm;