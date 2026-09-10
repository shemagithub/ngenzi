import { useState, useEffect, useRef } from 'react';
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
  FileText,
  Eye,
  EyeOff,
  Search,
  Filter,
  Calendar,
  User,
  Tag,
  Image as ImageIcon
} from 'lucide-react';
import { backendurl } from '../config/constants';
import QuillEditor from '../components/QuillEditor';

const CATEGORIES = [
  'General',
  'Real Estate',
  'Property Tips',
  'Market Trends',
  'Investment',
  'Legal',
  'Construction',
  'Interior Design',
  'Home Improvement'
];

const BlogsManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPublished, setFilterPublished] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: '',
    category: 'General',
    tags: [],
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    isPublished: false
  });
  const [tagInput, setTagInput] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (filterPublished !== 'all') params.append('isPublished', filterPublished === 'published');

      const response = await axios.get(`${backendurl}/api/blogs/admin/list?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setBlogs(response.data.blogs);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [searchTerm, filterCategory, filterPublished]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContentChange = (value) => {
    setFormData(prev => ({
      ...prev,
      content: value,
      excerpt: prev.excerpt || value.replace(/<[^>]*>/g, '').substring(0, 200).trim() + '...'
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
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
    
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const submitData = new FormData();
      
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('excerpt', formData.excerpt);
      submitData.append('author', formData.author || 'Admin');
      submitData.append('category', formData.category);
      submitData.append('tags', JSON.stringify(formData.tags));
      submitData.append('metaTitle', formData.metaTitle || formData.title);
      submitData.append('metaDescription', formData.metaDescription || formData.excerpt);
      submitData.append('metaKeywords', formData.metaKeywords || formData.tags.join(', '));
      submitData.append('isPublished', formData.isPublished);
      
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      let response;
      if (editingBlog) {
        response = await axios.put(
          `${backendurl}/api/blogs/update/${editingBlog.id}`,
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
          `${backendurl}/api/blogs/add`,
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
        toast.success(editingBlog ? 'Blog updated successfully' : 'Blog added successfully');
        resetForm();
        fetchBlogs();
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error(error.response?.data?.message || 'Failed to save blog');
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title || '',
      content: blog.content || '',
      excerpt: blog.excerpt || '',
      author: blog.author || '',
      category: blog.category || 'General',
      tags: Array.isArray(blog.tags) ? blog.tags : [],
      metaTitle: blog.metaTitle || '',
      metaDescription: blog.metaDescription || '',
      metaKeywords: blog.metaKeywords || '',
      isPublished: blog.isPublished || false
    });
    setImagePreview(blog.image || null);
    setImageFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${backendurl}/api/blogs/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Blog deleted successfully');
        fetchBlogs();
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error('Failed to delete blog');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      author: '',
      category: 'General',
      tags: [],
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      isPublished: false
    });
    setTagInput('');
    setImagePreview(null);
    setImageFile(null);
    setEditingBlog(null);
    setShowForm(false);
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = !searchTerm || blog.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || blog.category === filterCategory;
    const matchesPublished = filterPublished === 'all' || 
      (filterPublished === 'published' && blog.isPublished) ||
      (filterPublished === 'draft' && !blog.isPublished);
    return matchesSearch && matchesCategory && matchesPublished;
  });

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
            <FileText className="w-8 h-8 text-haven-700" />
            Blogs Management
          </h1>
          <p className="text-gray-600 mt-1">Manage your blog posts and articles</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-haven-800 text-white rounded-lg hover:bg-haven-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Blog
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select
            value={filterPublished}
            onChange={(e) => setFilterPublished(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Blogs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlogs.map((blog) => (
          <motion.div
            key={blog.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
          >
            {blog.image && (
              <div className="h-48 overflow-hidden">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{blog.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {blog.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(blog)}
                    className="p-2 text-haven-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{blog.excerpt || blog.content.replace(/<[^>]*>/g, '').substring(0, 100)}</p>
              
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  blog.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {blog.isPublished ? (
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Published
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <EyeOff className="w-3 h-3" />
                      Draft
                    </span>
                  )}
                </span>
                <span className="text-xs text-gray-500">{blog.category}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredBlogs.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Blogs Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterCategory !== 'all' || filterPublished !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by adding your first blog post'}
          </p>
          {(!searchTerm && filterCategory === 'all' && filterPublished === 'all') && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-haven-800 text-white rounded-lg hover:bg-haven-700 transition-colors"
            >
              Add Your First Blog
            </button>
          )}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto my-8"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingBlog ? 'Edit Blog' : 'Add New Blog'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Author
                    </label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      placeholder="Admin"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content *
                  </label>
                  <QuillEditor
                    value={formData.content}
                    onChange={handleContentChange}
                    style={{ minHeight: '300px' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Excerpt
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Brief description (auto-generated if empty)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      placeholder="Add a tag"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-haven-800 text-white rounded-lg hover:bg-haven-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(index)}
                          className="hover:text-haven-700"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Featured Image
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      name="metaTitle"
                      value={formData.metaTitle}
                      onChange={handleInputChange}
                      placeholder="SEO title"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Meta Keywords
                    </label>
                    <input
                      type="text"
                      name="metaKeywords"
                      value={formData.metaKeywords}
                      onChange={handleInputChange}
                      placeholder="keyword1, keyword2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="SEO description"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isPublished"
                    id="isPublished"
                    checked={formData.isPublished}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-haven-700 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                    Publish immediately
                  </label>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-haven-800 text-white rounded-lg hover:bg-haven-700 transition-colors font-medium"
                  >
                    <Save className="w-5 h-5" />
                    {editingBlog ? 'Update Blog' : 'Add Blog'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
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

export default BlogsManagement;

