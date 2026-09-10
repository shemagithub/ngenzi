import { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { backendurl } from '../config/constants';
import { Upload, X, Map, Hash, FileText, Compass } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

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

const PlotForm = () => {
  const { getCurrencySymbol } = useCurrency();
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

  const [frontImagePreview, setFrontImagePreview] = useState(null);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
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
      
      const newPreviewUrls = [...previewUrls];
      if (newPreviewUrls[previewIndex]) {
        URL.revokeObjectURL(newPreviewUrls[previewIndex]);
      }
      newPreviewUrls[previewIndex] = URL.createObjectURL(file);
      setPreviewUrls(newPreviewUrls);
      
      setFormData(prev => ({
        ...prev,
        [imageKey]: file
      }));
    }
  };

  const removeImage = (index) => {
    const imageNumber = index + 1;
    const imageKey = `image${imageNumber}`;
    
    if (previewUrls[index]) {
      URL.revokeObjectURL(previewUrls[index]);
    }
    
    const newPreviewUrls = [...previewUrls];
    newPreviewUrls[index] = null;
    setPreviewUrls(newPreviewUrls);
    
    setFormData(prev => ({
      ...prev,
      [imageKey]: null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      // Validate required fields before submitting
      if (!formData.title || !formData.location || !formData.description || !formData.availability) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      if (!formData.price || parseFloat(formData.price) <= 0) {
        toast.error('Please enter a valid price');
        setLoading(false);
        return;
      }

      if (!formData.sqft || parseFloat(formData.sqft) <= 0) {
        toast.error('Please enter a valid area');
        setLoading(false);
        return;
      }

      if (!formData.frontImage) {
        toast.error('Please upload a front image');
        setLoading(false);
        return;
      }

      const formdata = new FormData();
      formdata.append('title', formData.title.trim());
      formdata.append('type', 'Plot'); // Always Plot
      formdata.append('price', parseFloat(formData.price));
      formdata.append('location', formData.location.trim());
      formdata.append('description', formData.description.trim());
      formdata.append('area', parseFloat(formData.sqft)); // Use 'area' field (controller supports both 'area' and 'sqft')
      formdata.append('areaUnit', 'sqft');
      formdata.append('phone', formData.phone.trim() || 'N/A');
      formdata.append('availability', formData.availability);

      if (formData.plotNumber?.trim()) formdata.append('plotNumber', formData.plotNumber.trim());
      if (formData.surveyNumber?.trim()) formdata.append('surveyNumber', formData.surveyNumber.trim());
      if (formData.facing) formdata.append('facing', formData.facing);
      formdata.append('cornerPlot', formData.cornerPlot ? 'true' : 'false');
      formdata.append('approvedLayout', formData.approvedLayout ? 'true' : 'false');

      // Append amenities
      if (formData.amenities && formData.amenities.length > 0) {
        formData.amenities.forEach((amenity, index) => {
          formdata.append(`amenities[${index}]`, amenity);
        });
      }

      // YouTube URL must be appended BEFORE file parts — some multipart parsers drop trailing text fields after large files.
      const yt = (formData.youtubeUrl || '').trim();
      formdata.append('youtubeUrl', yt);
      
      // Append frontImage (required)
      if (formData.frontImage) {
        formdata.append('frontImage', formData.frontImage);
      }
      
      // Append additional images (optional)
      if (formData.image1) formdata.append('image1', formData.image1);
      if (formData.image2) formdata.append('image2', formData.image2);
      if (formData.image3) formdata.append('image3', formData.image3);
      if (formData.image4) formdata.append('image4', formData.image4);

      const qs = yt ? `youtubeUrl=${encodeURIComponent(yt)}` : 'youtubeUrl=';

      // Log form data for debugging (without files)
      console.log('Submitting plot data:', {
        title: formData.title,
        location: formData.location,
        price: formData.price,
        area: formData.sqft,
        availability: formData.availability,
        plotNumber: formData.plotNumber,
        surveyNumber: formData.surveyNumber,
        facing: formData.facing,
        cornerPlot: formData.cornerPlot,
        approvedLayout: formData.approvedLayout,
        youtubeUrl: yt || '(none)',
        amenities: formData.amenities,
        hasFrontImage: !!formData.frontImage,
        hasImage1: !!formData.image1,
        hasImage2: !!formData.image2,
        hasImage3: !!formData.image3,
        hasImage4: !!formData.image4,
      });

      // Do not set Content-Type manually — axios must add the multipart boundary.
      const response = await axios.post(`${backendurl}/api/plots/add?${qs}`, formdata, {
        headers: {
          'X-Plot-Youtube-Url': yt,
          'X-Youtube-Url': yt
        }
      });

      if (response.data.success) {
        toast.success(response.data.message || 'Plot added successfully!');
        setFormData({
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
        setFrontImagePreview(null);
        setPreviewUrls([]);
      } else {
        toast.error(response.data.message || 'Failed to add plot');
      }
    } catch (error) {
      console.error('Error adding plot:', error);
      
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
        
        // Log detailed error for debugging
        if (error.response.status === 500) {
          console.error('Server error details:', error.response.data);
          if (error.response.data?.error) {
            console.error('Error stack:', error.response.data.error);
          }
          // Show more helpful message for 500 errors
          toast.error(
            errorMessage || 
            'Server error occurred. Please check the console for details and contact support if the issue persists.'
          );
        }
      } else if (error.request) {
        // Request was made but no response received
        toast.error("Network error: Unable to connect to server. Please check your connection.");
      } else {
        // Something else happened
        toast.error(error.message || "Failed to add plot. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="max-w-2xl mx-auto rounded-lg shadow-xl bg-white p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Map className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Add New Plot</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Fill in location, pricing, area, and contact details. Optional survey fields and YouTube link are saved to the database with your images.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="space-y-4">
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
                placeholder="e.g., Residential Plot in Prime Location"
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
                placeholder="Describe the plot, location advantages, nearby facilities..."
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
                  {AVAILABILITY_TYPES.map(type => (
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
                    placeholder="Enter price"
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
                  placeholder="City, Area, Landmark"
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
                  placeholder="Plot area in square feet"
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
                placeholder="+250 788 000 000"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Survey & layout — matches DB: plotNumber, surveyNumber, facing, cornerPlot, approvedLayout */}
          <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2">
              <Compass className="w-4 h-4 text-amber-700" aria-hidden />
              Survey &amp; layout (optional)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="plotNumber" className="block text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-gray-500" aria-hidden />
                  Plot number
                </label>
                <input
                  type="text"
                  id="plotNumber"
                  name="plotNumber"
                  value={formData.plotNumber}
                  onChange={handleInputChange}
                  placeholder="e.g. P-102"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="surveyNumber" className="block text-sm font-medium text-gray-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-gray-500" aria-hidden />
                  Survey number
                </label>
                <input
                  type="text"
                  id="surveyNumber"
                  name="surveyNumber"
                  value={formData.surveyNumber}
                  onChange={handleInputChange}
                  placeholder="Official survey / khasra ref."
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
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
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
              >
                <option value="">Select direction (optional)</option>
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

          <div className="space-y-4">
            <div>
              <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700">
                YouTube video (optional)
              </label>
              <input
                type="text"
                id="youtubeUrl"
                name="youtubeUrl"
                value={formData.youtubeUrl}
                onChange={handleInputChange}
                placeholder="https://www.youtube.com/watch?v=… or youtu.be/…"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                Paste a YouTube link; it will be stored as an embed URL for the public plot page.
              </p>
            </div>
          </div>

          {/* Plot Amenities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Plot Amenities & Features
            </label>
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

          {/* Front Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Front Image (Main Display Image) *
            </label>
            {frontImagePreview ? (
              <div className="relative inline-block w-full">
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
                    <label htmlFor="frontImage" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
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

          {/* Additional Images Upload */}
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
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Adding Plot...' : 'Add Plot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlotForm;

