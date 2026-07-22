import { useState, useEffect } from 'react';
import { Calendar, ArrowRight, Clock, Share2, Bookmark, BookmarkCheck, Search, Tag, ExternalLink, ChevronRight, TrendingUp, Eye, Loader, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Backendurl } from '../utils/backendUrl';
import { useNavigate } from 'react-router-dom';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      duration: 0.6
    }
  }
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut"
    }
  }
};

const pulseAnimation = {
  scale: [1, 1.1, 1],
  transition: { 
    duration: 0.3,
    ease: "easeInOut"
  }
};

const floatingAnimation = {
  y: [-5, 5, -5],
  transition: {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

// BlogCard component
const BlogCard = ({ post }) => {
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const views = post.views || 0;

  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      const blogUrl = `${window.location.origin}/blogs/${post.slug || post.id}`;
      if (navigator.share) {
        await navigator.share({
          title: post.title,
          text: post.excerpt || post.content?.replace(/<[^>]*>/g, '').substring(0, 150),
          url: blogUrl
        });
        toast.success("Post shared successfully! 🎉", {
          style: { borderRadius: '12px', background: '#10B981', color: '#fff' }
        });
      } else {
        await navigator.clipboard.writeText(blogUrl);
        toast.success("Link copied to clipboard! 📋", {
          style: { borderRadius: '12px', background: '#10B981', color: '#fff' }
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error("Unable to share post 😕", {
        style: { borderRadius: '12px', background: '#EF4444', color: '#fff' }
      });
    }
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    
    if (!isBookmarked) {
      toast.success(`Saved "${post.title}" to your reading list 💾`, {
        style: { borderRadius: '12px', background: '#3B82F6', color: '#fff' }
      });
    } else {
      toast.info(`Removed "${post.title}" from your reading list 🗑️`, {
        style: { borderRadius: '12px', background: '#6B7280', color: '#fff' }
      });
    }
  };

  const handleReadMore = () => {
    if (post.slug || post.id) {
      navigate(`/blogs/${post.slug || post.id}`);
    }
  };

  // Calculate estimated read time from content or excerpt
  try {
    const contentText = post.excerpt || (post.content ? post.content.replace(/<[^>]*>/g, '') : '') || '';
    const wordCount = contentText ? contentText.split(/\s+/).filter(word => word.length > 0).length : 0;
    var estimatedReadTime = Math.ceil(wordCount / 200) || 5;
  } catch (error) {
    console.error('Error calculating read time:', error);
    var estimatedReadTime = 5;
  }
  
  // Extract category from post (or use default)
  const category = post.category || "General";
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString();
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  const displayDate = formatDate(post.publishedAt || post.createdAt || post.date);

  if (!post || !post.title) {
    console.error('BlogCard: Invalid post data', post);
    return null;
  }

  return (
    <motion.div
      className="group bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200 cursor-pointer transform-gpu"
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ 
        y: -12, 
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.1)" 
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleReadMore}
    >
      <div className="relative overflow-hidden aspect-w-16 aspect-h-9 bg-gradient-to-br from-blue-50 to-indigo-100">
        {post.image && post.image.trim() !== '' && post.image !== 'null' && post.image !== 'undefined' ? (
          <img
            src={post.image}
            alt={post.title || 'Blog post'}
            className="w-full h-64 object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
            onError={(e) => {
              console.error('Image load error for:', post.image);
              e.target.style.display = 'none';
              const fallback = e.target.parentElement.querySelector('.image-fallback');
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`image-fallback w-full h-64 bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center ${post.image && post.image.trim() !== '' && post.image !== 'null' && post.image !== 'undefined' ? 'hidden' : ''}`}
        >
          <FileText className="w-16 h-16 text-white opacity-50" />
        </div>
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-all duration-500 ${isHovered ? 'opacity-90' : 'opacity-60'}`} />
        
        {/* Floating badge with animation */}
        <motion.div 
          className="absolute top-6 left-6 z-10"
          animate={floatingAnimation}
        >
          <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 backdrop-blur-md text-white text-xs font-semibold rounded-full shadow-lg border border-white/20">
            {category}
          </span>
        </motion.div>

        {/* View count */}
        <div className="absolute top-6 right-20 z-10 flex items-center gap-1 px-3 py-1.5 bg-black/30 backdrop-blur-md rounded-full text-white text-xs">
          <Eye className="w-3 h-3" />
          {views}
        </div>
        
        <AnimatePresence>
          {isHovered && (
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute bottom-0 left-0 right-0 p-6 flex justify-center"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReadMore();
                }}
                className="px-6 py-3 bg-white/95 backdrop-blur-sm text-blue-600 rounded-full flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all duration-300 font-semibold text-sm shadow-xl border border-white/50 group-hover:scale-105"
              >
                Read Full Article <ExternalLink className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute top-6 right-6 flex flex-col gap-3">
          <motion.button
            whileTap={pulseAnimation}
            onClick={handleBookmark}
            className={`p-3 backdrop-blur-md rounded-full shadow-lg border border-white/20 transition-all duration-300
              ${isBookmarked 
                ? 'bg-blue-600 text-white shadow-blue-500/25' 
                : 'bg-white/90 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </motion.button>
          
          <motion.button
            whileTap={pulseAnimation}
            onClick={handleShare}
            className="p-3 bg-white/90 backdrop-blur-md text-gray-700 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 shadow-lg border border-white/20"
          >
            <Share2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      <div className="p-8">
        <div className="flex items-center justify-between text-gray-500 text-xs mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-blue-500" />
              <span className="font-medium">{displayDate}</span>
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-green-500" />
              <span className="font-medium">{estimatedReadTime} min read</span>
            </div>
          </div>
          <div className="flex items-center text-orange-500">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span className="text-xs font-medium">Trending</span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
          {post.title}
        </h3>
        
        <p className="text-gray-600 mb-6 line-clamp-3 text-sm leading-relaxed">
          {(() => {
            try {
              const excerpt = post.excerpt || '';
              const contentText = post.content ? post.content.replace(/<[^>]*>/g, '') : '';
              const displayText = excerpt || (contentText ? contentText.substring(0, 150) + '...' : '');
              return displayText || 'No description available';
            } catch (error) {
              console.error('Error processing blog text:', error);
              return 'No description available';
            }
          })()}
        </p>

        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleReadMore();
            }}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold transition-all duration-300 text-sm group/btn"
          >
            Continue Reading
            <ChevronRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform duration-300" />
          </button>

          <div className="flex items-center gap-2">
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                <Tag className="w-3 h-3 text-gray-400" />
                <span className="font-medium">{Array.isArray(post.tags) ? post.tags[0] : post.tags}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Blog component
const Blog = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Fetching blogs from:', `${Backendurl}/api/blogs/list`);
      
      const response = await axios.get(`${Backendurl}/api/blogs/list`, {
        params: {
          limit: 6 // Show 6 blogs on home page
        }
      });
      
      console.log('✅ Blogs API response:', response.data);
      
      if (response.data.success && response.data.blogs) {
        const blogsData = Array.isArray(response.data.blogs) ? response.data.blogs : [];
        console.log('📝 Setting blogs:', blogsData);
        console.log('📝 Blogs count:', blogsData.length);
        if (blogsData.length > 0) {
          console.log('📝 First blog data:', blogsData[0]);
        }
        setBlogs(blogsData);
      } else {
        console.warn('⚠️ No blogs in response');
        setError('Failed to load blogs');
        setBlogs([]);
      }
    } catch (err) {
      console.error('❌ Error fetching blogs:', err);
      setError(err.response?.data?.message || 'Failed to load blogs');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories from blogs
  const categories = ['All', ...new Set(blogs.map(blog => blog.category).filter(Boolean))];
  
  const filteredPosts = blogs.filter(post => {
    if (!post || !post.title) {
      console.warn('⚠️ Invalid blog post:', post);
      return false;
    }
    
    const postExcerpt = post.excerpt || post.content?.replace(/<[^>]*>/g, '') || '';
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      postExcerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || (post.category || 'General') === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Debug logging
  useEffect(() => {
    console.log('🔍 Debug - blogs state:', blogs);
    console.log('🔍 Debug - filteredPosts:', filteredPosts);
    console.log('🔍 Debug - loading:', loading);
    console.log('🔍 Debug - error:', error);
    console.log('🔍 Debug - selectedCategory:', selectedCategory);
    console.log('🔍 Debug - blogs length:', blogs.length);
    console.log('🔍 Debug - filteredPosts length:', filteredPosts.length);
    if (blogs.length > 0) {
      console.log('🔍 Debug - First blog:', blogs[0]);
    }
  }, [blogs, filteredPosts, loading, error, selectedCategory]);

  return (
    <section className="py-32 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 dark:from-gray-900 dark:via-gray-800/30 dark:to-gray-900 relative overflow-hidden transition-colors duration-200">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          variants={headerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <TrendingUp className="w-4 h-4" />
            Latest Real Estate Insights
          </motion.div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 relative">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              Expert Insights
            </span>
            <br />
            <span className="text-gray-900 dark:text-gray-100">& Market Updates</span>
            <motion.div 
              className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
              initial={{ width: 0 }}
              whileInView={{ width: 96 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed transition-colors duration-200">
            Stay ahead of the market with our curated collection of expert advice, 
            market trends, and insider tips for your real estate journey.
          </p>
        </motion.div>
        
        {/* Enhanced Search and filter section */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
            <div className="relative max-w-md w-full">
              <motion.div
                className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-105' : 'scale-100'}`}
              >
                <input
                  type="text"
                  placeholder="Search articles, topics, tips..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 focus:ring-4 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 focus:border-blue-500 dark:focus:border-blue-400 transition-all bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors ${isSearchFocused ? 'text-blue-500' : 'text-gray-400'}`} />
                {searchTerm && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => setSearchTerm('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400"
                  >
                    ✕
                  </motion.button>
                )}
              </motion.div>
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center lg:justify-end">
              {categories.map((category, index) => (
                <motion.button
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 shadow-lg ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white shadow-blue-500/25 dark:shadow-blue-500/30 transform scale-105'
                      : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
        
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Loader className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading blog posts...</p>
          </motion.div>
        ) : error && filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl transition-colors duration-200"
          >
            <div className="relative">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-red-400 to-red-500 rounded-full flex items-center justify-center">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Unable to Load Blogs</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
                {error}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchBlogs}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Try Again
              </motion.button>
            </div>
          </motion.div>
        ) : blogs.length > 0 && filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl transition-colors duration-200"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center"
              >
                <Search className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">No articles found</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
                {`We couldn't find any articles matching your search criteria. 
                Try different keywords or explore our categories.`}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Clear Filters
              </motion.button>
            </div>
          </motion.div>
        ) : filteredPosts.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {filteredPosts.map((post, index) => {
              console.log(`📝 Rendering blog card ${index}:`, post);
              if (!post || !post.id) {
                console.error('⚠️ Invalid post data:', post);
                return null;
              }
              try {
                return (
                  <BlogCard key={post.id || post._id || `blog-${index}`} post={post} />
                );
              } catch (error) {
                console.error('❌ Error rendering BlogCard:', error, post);
                return (
                  <div key={post.id || `blog-${index}`} className="bg-red-50 p-4 rounded-lg">
                    <p className="text-red-600">Error rendering blog card</p>
                  </div>
                );
              }
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-3xl border border-gray-200 dark:border-gray-700 shadow-xl transition-colors duration-200"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center"
              >
                <Search className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">No articles found</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8 leading-relaxed">
                {`We couldn't find any articles matching your search criteria. 
                Try different keywords or explore our categories.`}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Clear Filters
              </motion.button>
            </div>
          </motion.div>
        )}
        
        {/* Enhanced View all articles button */}
        <motion.div 
          className="text-center mt-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/blogs')}
            className="px-10 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-2xl 
              shadow-2xl hover:shadow-blue-500/25 transition-all font-bold text-lg inline-flex items-center group relative overflow-hidden"
          >
            <span className="relative z-10 flex items-center">
              Explore All Articles
              <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.button>
          
          <p className="text-gray-500 dark:text-gray-400 mt-4 text-sm transition-colors duration-200">
            Join thousands of readers staying informed about real estate trends
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// PropTypes for BlogCard component
BlogCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    excerpt: PropTypes.string,
    content: PropTypes.string,
    image: PropTypes.string,
    date: PropTypes.string,
    createdAt: PropTypes.string,
    publishedAt: PropTypes.string,
    slug: PropTypes.string,
    category: PropTypes.string,
    tags: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.string),
      PropTypes.string
    ]),
    views: PropTypes.number
  }).isRequired
};

export default Blog;