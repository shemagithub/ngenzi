import { useState } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { backendurl } from '../config/constants';
import { Upload, X, Car } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

const AVAILABILITY_TYPES = ['buy', 'rent'];
const FUEL_TYPES = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG', 'LPG'];
const TRANSMISSION_TYPES = ['Automatic', 'Manual', 'CVT', 'Semi-Automatic'];
const CONDITION_TYPES = ['New', 'Used', 'Certified Pre-Owned'];
const BODY_TYPES = ['Sedan', 'SUV', 'Hatchback', 'Truck', 'Van', 'Coupe', 'Convertible', 'Wagon', 'Pickup', 'Other'];
const CAR_FEATURES = [
  'Air Conditioning', 'GPS Navigation', 'Bluetooth', 'Leather Seats', 'Sunroof',
  'Backup Camera', 'Parking Sensors', 'Cruise Control', 'Heated Seats',
  'Keyless Entry', 'Alloy Wheels', 'ABS', 'Airbags', 'USB Port', 'Apple CarPlay'
];

const CarForm = () => {
  const { getCurrencySymbol } = useCurrency();
  const [formData, setFormData] = useState({
    title: '', brand: '', model: '', year: '', mileage: '', mileageUnit: 'km',
    fuelType: '', transmission: '', color: '', condition: 'Used', bodyType: '',
    engineSize: '', vin: '', price: '', location: '', description: '', phone: '',
    availability: '', features: [], frontImage: null, image1: null, image2: null,
    image3: null, image4: null, youtubeUrl: ''
  });
  const [frontImagePreview, setFrontImagePreview] = useState(null);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleFrontImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFrontImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, frontImage: file }));
    }
  };

  const removeFrontImage = () => {
    if (frontImagePreview) URL.revokeObjectURL(frontImagePreview);
    setFrontImagePreview(null);
    setFormData(prev => ({ ...prev, frontImage: null }));
  };

  const handleImageChange = (imageNumber, e) => {
    const file = e.target.files[0];
    if (file) {
      const imageKey = `image${imageNumber}`;
      const previewIndex = imageNumber - 1;
      const newPreviewUrls = [...previewUrls];
      if (newPreviewUrls[previewIndex]) URL.revokeObjectURL(newPreviewUrls[previewIndex]);
      newPreviewUrls[previewIndex] = URL.createObjectURL(file);
      setPreviewUrls(newPreviewUrls);
      setFormData(prev => ({ ...prev, [imageKey]: file }));
    }
  };

  const removeImage = (index) => {
    const imageNumber = index + 1;
    if (previewUrls[index]) URL.revokeObjectURL(previewUrls[index]);
    const newPreviewUrls = [...previewUrls];
    newPreviewUrls[index] = null;
    setPreviewUrls(newPreviewUrls);
    setFormData(prev => ({ ...prev, [`image${imageNumber}`]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.title || !formData.brand || !formData.model || !formData.location || !formData.description || !formData.availability || !formData.fuelType || !formData.transmission) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }
      if (!formData.price || parseFloat(formData.price) <= 0) {
        toast.error('Please enter a valid price');
        setLoading(false);
        return;
      }
      if (!formData.year || parseInt(formData.year) < 1900) {
        toast.error('Please enter a valid year');
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
      formdata.append('brand', formData.brand.trim());
      formdata.append('model', formData.model.trim());
      formdata.append('year', parseInt(formData.year));
      formdata.append('mileage', parseInt(formData.mileage) || 0);
      formdata.append('mileageUnit', formData.mileageUnit);
      formdata.append('fuelType', formData.fuelType);
      formdata.append('transmission', formData.transmission);
      if (formData.color) formdata.append('color', formData.color.trim());
      formdata.append('condition', formData.condition);
      if (formData.bodyType) formdata.append('bodyType', formData.bodyType);
      if (formData.engineSize) formdata.append('engineSize', formData.engineSize.trim());
      if (formData.vin) formdata.append('vin', formData.vin.trim());
      formdata.append('price', parseFloat(formData.price));
      formdata.append('location', formData.location.trim());
      formdata.append('description', formData.description.trim());
      formdata.append('phone', formData.phone.trim() || 'N/A');
      formdata.append('availability', formData.availability);
      formData.features.forEach((f, i) => formdata.append(`features[${i}]`, f));

      const yt = (formData.youtubeUrl || '').trim();
      formdata.append('youtubeUrl', yt);
      formdata.append('frontImage', formData.frontImage);
      if (formData.image1) formdata.append('image1', formData.image1);
      if (formData.image2) formdata.append('image2', formData.image2);
      if (formData.image3) formdata.append('image3', formData.image3);
      if (formData.image4) formdata.append('image4', formData.image4);

      const qs = yt ? `youtubeUrl=${encodeURIComponent(yt)}` : 'youtubeUrl=';
      const response = await axios.post(`${backendurl}/api/cars/add?${qs}`, formdata);

      if (response.data.success) {
        toast.success(response.data.message || 'Car added successfully!');
        setFormData({
          title: '', brand: '', model: '', year: '', mileage: '', mileageUnit: 'km',
          fuelType: '', transmission: '', color: '', condition: 'Used', bodyType: '',
          engineSize: '', vin: '', price: '', location: '', description: '', phone: '',
          availability: '', features: [], frontImage: null, image1: null, image2: null,
          image3: null, image4: null, youtubeUrl: ''
        });
        setFrontImagePreview(null);
        setPreviewUrls([]);
      } else {
        toast.error(response.data.message || 'Failed to add car');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to add car');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm";

  return (
    <div className="min-h-screen pt-32 px-4 bg-gray-50 pb-12">
      <div className="max-w-3xl mx-auto rounded-lg shadow-xl bg-white p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg"><Car className="w-6 h-6 text-blue-600" /></div>
          <h2 className="text-2xl font-bold text-gray-900">Add New Car</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">Enter all car details buyers need: brand, model, specs, pricing, and photos.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Listing Title *</label>
              <input type="text" name="title" required value={formData.title} onChange={handleInputChange}
                placeholder="e.g., 2022 Toyota Camry XLE - Low Mileage" className={inputClass} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Brand *</label>
                <input type="text" name="brand" required value={formData.brand} onChange={handleInputChange}
                  placeholder="Toyota" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Model *</label>
                <input type="text" name="model" required value={formData.model} onChange={handleInputChange}
                  placeholder="Camry" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Year *</label>
                <input type="number" name="year" required min="1900" max={new Date().getFullYear() + 1}
                  value={formData.year} onChange={handleInputChange} placeholder="2022" className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Mileage</label>
                <input type="number" name="mileage" min="0" value={formData.mileage} onChange={handleInputChange}
                  placeholder="45000" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <select name="mileageUnit" value={formData.mileageUnit} onChange={handleInputChange} className={inputClass}>
                  <option value="km">km</option>
                  <option value="miles">miles</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fuel Type *</label>
                <select name="fuelType" required value={formData.fuelType} onChange={handleInputChange} className={inputClass}>
                  <option value="">Select</option>
                  {FUEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Transmission *</label>
                <select name="transmission" required value={formData.transmission} onChange={handleInputChange} className={inputClass}>
                  <option value="">Select</option>
                  {TRANSMISSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Condition</label>
                <select name="condition" value={formData.condition} onChange={handleInputChange} className={inputClass}>
                  {CONDITION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Body Type</label>
                <select name="bodyType" value={formData.bodyType} onChange={handleInputChange} className={inputClass}>
                  <option value="">Select</option>
                  {BODY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Color</label>
                <input type="text" name="color" value={formData.color} onChange={handleInputChange}
                  placeholder="White" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Engine Size</label>
                <input type="text" name="engineSize" value={formData.engineSize} onChange={handleInputChange}
                  placeholder="2.0L" className={inputClass} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">VIN (optional)</label>
                <input type="text" name="vin" value={formData.vin} onChange={handleInputChange}
                  placeholder="Vehicle Identification Number" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Availability *</label>
                <select name="availability" required value={formData.availability} onChange={handleInputChange} className={inputClass}>
                  <option value="">Select</option>
                  {AVAILABILITY_TYPES.map(t => <option key={t} value={t}>{t === 'buy' ? 'For Sale' : 'For Rent'}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Price ({getCurrencySymbol()}) *</label>
                <input type="number" name="price" required min="0" step="0.01" value={formData.price}
                  onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location *</label>
                <input type="text" name="location" required value={formData.location} onChange={handleInputChange}
                  placeholder="City, State" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                placeholder="+1 234 567 8900" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Description *</label>
              <textarea name="description" required rows={4} value={formData.description} onChange={handleInputChange}
                placeholder="Describe the car condition, history, and why it's a great buy..." className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CAR_FEATURES.map(f => (
                  <label key={f} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={formData.features.includes(f)} onChange={() => handleFeatureToggle(f)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    {f}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">YouTube Video URL (optional)</label>
              <input type="url" name="youtubeUrl" value={formData.youtubeUrl} onChange={handleInputChange}
                placeholder="https://www.youtube.com/watch?v=..." className={inputClass} />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Images</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Front Image *</label>
              {frontImagePreview ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden">
                  <img src={frontImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={removeFrontImage}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Upload front image</span>
                  <input type="file" accept="image/*" onChange={handleFrontImageChange} className="hidden" />
                </label>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(num => (
                <div key={num}>
                  {previewUrls[num - 1] ? (
                    <div className="relative h-24 rounded-lg overflow-hidden">
                      <img src={previewUrls[num - 1]} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(num - 1)}
                        className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <Upload className="w-5 h-5 text-gray-400" />
                      <span className="text-xs text-gray-500 mt-1">Image {num}</span>
                      <input type="file" accept="image/*" onChange={(e) => handleImageChange(num, e)} className="hidden" />
                    </label>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
            {loading ? 'Adding Car...' : 'Add Car'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CarForm;
