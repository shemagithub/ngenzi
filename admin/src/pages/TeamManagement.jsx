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
  Users,
  Mail,
  Phone,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Eye,
  EyeOff
} from 'lucide-react';
import { backendurl } from '../config/constants';

const TeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    bio: '',
    email: '',
    phone: '',
    socialLinks: {
      linkedin: '',
      twitter: '',
      facebook: '',
      instagram: ''
    },
    order: 0,
    isActive: true
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${backendurl}/api/teams/admin/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setTeams(response.data.teams);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('socialLinks.')) {
      const socialKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
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
      submitData.append('bio', formData.bio);
      submitData.append('email', formData.email);
      submitData.append('phone', formData.phone);
      submitData.append('socialLinks', JSON.stringify(formData.socialLinks));
      submitData.append('order', formData.order);
      submitData.append('isActive', formData.isActive);
      
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      let response;
      if (editingTeam) {
        response = await axios.put(
          `${backendurl}/api/teams/update/${editingTeam.id}`,
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
          `${backendurl}/api/teams/add`,
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
        toast.success(editingTeam ? 'Team member updated successfully' : 'Team member added successfully');
        resetForm();
        fetchTeams();
      }
    } catch (error) {
      console.error('Error saving team member:', error);
      toast.error(error.response?.data?.message || 'Failed to save team member');
    }
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name || '',
      position: team.position || '',
      bio: team.bio || '',
      email: team.email || '',
      phone: team.phone || '',
      socialLinks: team.socialLinks || {
        linkedin: '',
        twitter: '',
        facebook: '',
        instagram: ''
      },
      order: team.order || 0,
      isActive: team.isActive !== undefined ? team.isActive : true
    });
    setImagePreview(team.image || null);
    setImageFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this team member?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${backendurl}/api/teams/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Team member deleted successfully');
        fetchTeams();
      }
    } catch (error) {
      console.error('Error deleting team member:', error);
      toast.error('Failed to delete team member');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      position: '',
      bio: '',
      email: '',
      phone: '',
      socialLinks: {
        linkedin: '',
        twitter: '',
        facebook: '',
        instagram: ''
      },
      order: 0,
      isActive: true
    });
    setImagePreview(null);
    setImageFile(null);
    setEditingTeam(null);
    setShowForm(false);
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
            <Users className="w-8 h-8 text-haven-700" />
            Team Management
          </h1>
          <p className="text-gray-600 mt-1">Manage your team members</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-haven-800 text-white rounded-lg hover:bg-haven-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Team Member
        </button>
      </div>

      {/* Teams List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200">
                {team.image ? (
                  <img src={team.image} alt={team.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-indigo-500">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(team)}
                  className="p-2 text-haven-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(team.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-1">{team.name}</h3>
            <p className="text-haven-700 font-medium mb-2">{team.position}</p>
            {team.bio && (
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{team.bio}</p>
            )}
            
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                team.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {team.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="text-sm text-gray-500">Order: {team.order}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No team members yet. Add your first team member!</p>
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
                  {editingTeam ? 'Edit Team Member' : 'Add New Team Member'}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Position *
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Social Links
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Linkedin className="w-5 h-5 text-haven-700" />
                      <input
                        type="url"
                        name="socialLinks.linkedin"
                        value={formData.socialLinks.linkedin}
                        onChange={handleInputChange}
                        placeholder="LinkedIn URL"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Twitter className="w-5 h-5 text-blue-400" />
                      <input
                        type="url"
                        name="socialLinks.twitter"
                        value={formData.socialLinks.twitter}
                        onChange={handleInputChange}
                        placeholder="Twitter URL"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Facebook className="w-5 h-5 text-blue-700" />
                      <input
                        type="url"
                        name="socialLinks.facebook"
                        value={formData.socialLinks.facebook}
                        onChange={handleInputChange}
                        placeholder="Facebook URL"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Instagram className="w-5 h-5 text-pink-600" />
                      <input
                        type="url"
                        name="socialLinks.instagram"
                        value={formData.socialLinks.instagram}
                        onChange={handleInputChange}
                        placeholder="Instagram URL"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
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

                  <div className="flex items-center gap-2 pt-6">
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
                    {editingTeam ? 'Update' : 'Add'} Team Member
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

export default TeamManagement;










