import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
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

const parseFeatures = (features) => {
  if (!features) return [];
  if (Array.isArray(features)) return features;
  if (typeof features === 'string') {
    try { const p = JSON.parse(features); return Array.isArray(p) ? p : [features]; } catch { return []; }
  }
  return [];
};

const UpdateCars = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getCurrencySymbol } = useCurrency();
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({
    title: '', brand: '', model: '', year: '', mileage: '', mileageUnit: 'km',
    fuelType: '', transmission: '', color: '', condition: 'Used', bodyType: '',
    engineSize: '', vin: '', price: '', location: '', description: '', phone: '',
    availability: '', features: [], frontImage: null, image1: null, image2: null,
    image3: null, image4: null, youtubeUrl: ''
  });
  const [frontImagePreview, setFrontImagePreview] = useState(null);
  const [previewUrls, setPreviewUrls] = useState([null, null, null, null]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id || id === 'undefined') { toast.error('Invalid car ID'); navigate('/list-cars', { replace: true }); return; }
      try {
        setFetching(true);
        const response = await axios.get(`${backendurl}/api/cars/single/${encodeURIComponent(id)}`, { validateStatus: (s) => s >= 200 && s < 500 });
        if (!response.data?.success || !response.data?.car) {
          toast.error(response.data?.message || 'Car not found');
          navigate('/list-cars', { replace: true });
          return;
        }
        const car = response.data.car;
        let gallery = [];
        if (car.image) {
          if (Array.isArray(car.image)) gallery = car.image;
          else if (typeof car.image === 'string') {
            try { const p = JSON.parse(car.image); gallery = Array.isArray(p) ? p : [car.image]; } catch { gallery = [car.image]; }
          }
        }
        setFormData({
          title: car.title || '', brand: car.brand || '', model: car.model || '',
          year: car.year != null ? String(car.year) : '', mileage: car.mileage != null ? String(car.mileage) : '',
          mileageUnit: car.mileageUnit || 'km', fuelType: car.fuelType || '', transmission: car.transmission || '',
          color: car.color || '', condition: car.condition || 'Used', bodyType: car.bodyType || '',
          engineSize: car.engineSize || '', vin: car.vin || '', price: car.price != null ? String(car.price) : '',
          location: car.location || '', description: car.description || '',
          phone: car.phone && car.phone !== 'N/A' ? car.phone : '', availability: car.availability || '',
          features: parseFeatures(car.features), frontImage: null, image1: null, image2: null, image3: null, image4: null,
          youtubeUrl: car.youtubeUrl || ''
        });
        setFrontImagePreview(car.frontImage || null);
        const slots = [null, null, null, null];
        gallery.slice(0, 4).forEach((url, i) => { slots[i] = url; });
        setPreviewUrls(slots);
      } catch (e) {
        toast.error('Could not load car');
        navigate('/list-cars', { replace: true });
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFeatureToggle = (feature) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature) ? prev.features.filter(f => f !== feature) : [...prev.features, feature]
    }));
  };

  const handleFrontImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (frontImagePreview && frontImagePreview.startsWith('blob:')) URL.revokeObjectURL(frontImagePreview);
      setFrontImagePreview(URL.createObjectURL(file));
      setFormData(prev => ({ ...prev, frontImage: file }));
    }
  };

  const handleImageChange = (imageNumber, e) => {
    const file = e.target.files[0];
    if (file) {
      const previewIndex = imageNumber - 1;
      const newPreviewUrls = [...previewUrls];
      if (newPreviewUrls[previewIndex]?.startsWith('blob:')) URL.revokeObjectURL(newPreviewUrls[previewIndex]);
      newPreviewUrls[previewIndex] = URL.createObjectURL(file);
      setPreviewUrls(newPreviewUrls);
      setFormData(prev => ({ ...prev, [`image${imageNumber}`]: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formdata = new FormData();
      formdata.append('id', id);
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
      if (formData.frontImage) formdata.append('frontImage', formData.frontImage);
      if (formData.image1) formdata.append('image1', formData.image1);
      if (formData.image2) formdata.append('image2', formData.image2);
      if (formData.image3) formdata.append('image3', formData.image3);
      if (formData.image4) formdata.append('image4', formData.image4);

      const qs = yt ? `youtubeUrl=${encodeURIComponent(yt)}` : 'youtubeUrl=';
      const response = await axios.post(`${backendurl}/api/cars/update?${qs}`, formdata);
      if (response.data.success) {
        toast.success('Car updated successfully!');
        navigate('/list-cars');
      } else {
        toast.error(response.data.message || 'Failed to update car');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update car');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm";

  if (fetching) return <div className="min-h-screen pt-32 flex items-center justify-center"><p>Loading car...</p></div>;

  return (
    <div className="min-h-screen pt-32 px-4 bg-gray-50 pb-12">
      <div className="max-w-3xl mx-auto rounded-lg shadow-xl bg-white p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 rounded-lg"><Car className="w-6 h-6 text-blue-600" /></div>
          <h2 className="text-2xl font-bold text-gray-900">Update Car</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input type="text" name="title" required value={formData.title} onChange={handleInputChange} className={inputClass} />
            </div>
            <div><label className="block text-sm font-medium text-gray-700">Brand *</label>
              <input type="text" name="brand" required value={formData.brand} onChange={handleInputChange} className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-700">Model *</label>
              <input type="text" name="model" required value={formData.model} onChange={handleInputChange} className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-700">Year *</label>
              <input type="number" name="year" required value={formData.year} onChange={handleInputChange} className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div><label className="block text-sm font-medium text-gray-700">Mileage</label>
              <input type="number" name="mileage" value={formData.mileage} onChange={handleInputChange} className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-700">Unit</label>
              <select name="mileageUnit" value={formData.mileageUnit} onChange={handleInputChange} className={inputClass}>
                <option value="km">km</option><option value="miles">miles</option></select></div>
            <div><label className="block text-sm font-medium text-gray-700">Fuel *</label>
              <select name="fuelType" required value={formData.fuelType} onChange={handleInputChange} className={inputClass}>
                {FUEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-gray-700">Transmission *</label>
              <select name="transmission" required value={formData.transmission} onChange={handleInputChange} className={inputClass}>
                {TRANSMISSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700">Price ({getCurrencySymbol()}) *</label>
              <input type="number" name="price" required value={formData.price} onChange={handleInputChange} className={inputClass} /></div>
            <div><label className="block text-sm font-medium text-gray-700">Location *</label>
              <input type="text" name="location" required value={formData.location} onChange={handleInputChange} className={inputClass} /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700">Description *</label>
            <textarea name="description" required rows={4} value={formData.description} onChange={handleInputChange} className={inputClass} /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CAR_FEATURES.map(f => (
                <label key={f} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={formData.features.includes(f)} onChange={() => handleFeatureToggle(f)} className="rounded" />{f}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Front Image</label>
            {frontImagePreview ? (
              <div className="relative h-48 rounded-lg overflow-hidden">
                <img src={frontImagePreview} alt="" className="w-full h-full object-cover" />
                <label className="absolute bottom-2 right-2 px-3 py-1 bg-white rounded-lg text-sm cursor-pointer shadow">
                  Change<input type="file" accept="image/*" onChange={handleFrontImageChange} className="hidden" />
                </label>
              </div>
            ) : (
              <label className="flex items-center justify-center h-32 border-2 border-dashed rounded-lg cursor-pointer">
                <Upload className="w-6 h-6 text-gray-400" />
                <input type="file" accept="image/*" onChange={handleFrontImageChange} className="hidden" />
              </label>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1,2,3,4].map(num => (
              <label key={num} className="h-20 border-2 border-dashed rounded-lg cursor-pointer flex items-center justify-center overflow-hidden">
                {previewUrls[num-1] ? <img src={previewUrls[num-1]} alt="" className="w-full h-full object-cover" /> : <Upload className="w-4 h-4 text-gray-400" />}
                <input type="file" accept="image/*" onChange={(e) => handleImageChange(num, e)} className="hidden" />
              </label>
            ))}
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Updating...' : 'Update Car'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateCars;
