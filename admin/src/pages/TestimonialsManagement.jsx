import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit3,
  Trash2,
  X,
  Upload,
  Save,
  Loader,
  MessageSquare,
  Star,
  Eye,
  EyeOff
} from 'lucide-react';
import { backendurl } from '../config/constants';

const TestimonialsManagement = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    company: '',
    content: '',
    rating: 5,
    order: 0,
    isActive: true,
    isFeatured: false
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendurl}/api/testimonials/admin/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setTestimonials(response.data.testimonials);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value)
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();
      
      submitData.append('name', formData.name);
      submitData.append('position', formData.position);
      submitData.append('company', formData.company);
      submitData.append('content', formData.content);
      submitData.append('rating', formData.rating);
      submitData.append('order', formData.order);
      submitData.append('isActive', formData.isActive);
      submitData.append('isFeatured', formData.isFeatured);
      
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      let response;
      if (editingTestimonial) {
        response = await axios.put(
          `${backendurl}/api/testimonials/update/${editingTestimonial.id}`,
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } else {
        response = await axios.post(
          `${backendurl}/api/testimonials/add`,
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      }

      if (response.data.success) {
        toast.success(editingTestimonial ? 'Testimonial updated successfully' : 'Testimonial added successfully');
        resetForm();
        fetchTestimonials();
      }
    } catch (error) {
      console.error('Error saving testimonial:', error);
      toast.error(error.response?.data?.message || 'Failed to save testimonial');
    }
  };

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name || '',
      position: testimonial.position || '',
      company: testimonial.company || '',
      content: testimonial.content || '',
      rating: testimonial.rating || 5,
      order: testimonial.order || 0,
      isActive: testimonial.isActive !== undefined ? testimonial.isActive : true,
      isFeatured: testimonial.isFeatured !== undefined ? testimonial.isFeatured : false
    });
    setImagePreview(testimonial.image || null);
    setImageFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${backendurl}/api/testimonials/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Testimonial deleted successfully');
        fetchTestimonials();
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error('Failed to delete testimonial');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      company: '',
      content: '',
      rating: 5,
      order: 0,
      isActive: true,
      isFeatured: false
    });
    setImagePreview(null);
    setImageFile(null);
    setEditingTestimonial(null);
    setShowForm(false);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader className="w-8 h-8 animate-spin text-haven-700" />
      </div>
    );
  }

  return (
    <div className="admin-page max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-haven-700" />
            Testimonials Management
          </h1>
          <p className="text-gray-600 mt-1">Manage customer testimonials and reviews</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-haven-800 text-white rounded-lg hover:bg-haven-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Testimonial
        </button>
      </div>

      {/* Testimonials List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                  {testimonial.image ? (
                    <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500">
                      <MessageSquare className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{testimonial.name}</h3>
                  {testimonial.position && (
                    <p className="text-sm text-gray-600">{testimonial.position}</p>
                  )}
                  {testimonial.company && (
                    <p className="text-sm text-haven-700">{testimonial.company}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(testimonial)}
                  className="p-2 text-haven-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(testimonial.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-1 mb-3">
              {renderStars(testimonial.rating || 5)}
            </div>
            
            <p className="text-gray-700 text-sm mb-4 line-clamp-3">{testimonial.content}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  testimonial.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {testimonial.isActive ? 'Active' : 'Inactive'}
                </span>
                {testimonial.isFeatured && (
                  <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    Featured
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500">Order: {testimonial.order}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {testimonials.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No testimonials yet. Add your first testimonial!</p>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Position
                    </label>
                    <input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content *
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    rows="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating
                  </label>
                  <select
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {[1, 2, 3, 4, 5].map(rating => (
                      <option key={rating} value={rating}>
                        {rating} {rating === 1 ? 'Star' : 'Stars'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Order
                    </label>
                    <input
                      type="number"
                      name="order"
                      value={formData.order}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="space-y-2 pt-6">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-haven-700 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Active
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="isFeatured"
                        checked={formData.isFeatured}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-haven-700 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Featured
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Image
                  </label>
                  <div className="flex items-center gap-4">
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                      />
                    )}
                    <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                      <Upload className="w-5 h-5" />
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-haven-800 text-white rounded-lg hover:bg-haven-700 transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    {editingTestimonial ? 'Update' : 'Add'} Testimonial
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TestimonialsManagement;










