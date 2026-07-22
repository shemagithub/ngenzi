import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Tag, 
  Share2,
  Loader,
  Eye
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Backendurl } from '../utils/backendUrl';

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!slug) {
        setError("Invalid blog slug");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log(`🔍 Fetching blog with slug: ${slug} from ${Backendurl}/api/blogs/single/${slug}`);
        
        const response = await axios.get(`${Backendurl}/api/blogs/single/${slug}`);

        if (response.data.success) {
          const blogData = response.data.blog;
          console.log('✅ Blog data received:', blogData);
          
          // Convert tags to array if it's a string
          if (blogData.tags && typeof blogData.tags === 'string') {
            try {
              blogData.tags = JSON.parse(blogData.tags);
            } catch {
              blogData.tags = [];
            }
          }
          
          setBlog(blogData);
          setError(null);
        } else {
          setError(response.data.message || "Failed to load blog.");
        }
      } catch (err) {
        console.error("❌ Error fetching blog:", err);
        if (err.response?.status === 404) {
          setError("Blog not found.");
        } else {
          setError(err.response?.data?.message || "Failed to load blog. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString();
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleShare = async () => {
    try {
      const blogUrl = window.location.href;
      if (navigator.share) {
        await navigator.share({
          title: blog?.title,
          text: blog?.excerpt,
          url: blogUrl
        });
        toast.success("Blog shared successfully! 🎉");
      } else {
        await navigator.clipboard.writeText(blogUrl);
        toast.success("Link copied to clipboard! 📋");
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast.error("Unable to share blog 😕");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50">
        <div className="text-center max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Blog Not Found</h2>
          <p className="text-gray-600 mb-8">{error || "The blog post you're looking for doesn't exist."}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  const contentText = blog.content || '';
  const estimatedReadTime = Math.ceil(contentText.replace(/<[^>]*>/g, '').split(' ').length / 200) || 5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50 pt-24 pb-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="mb-8 flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </motion.button>

        {/* Blog Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            {blog.category && (
              <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-full">
                {blog.category}
              </span>
            )}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                {formatDate(blog.publishedAt || blog.createdAt)}
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-green-500" />
                {estimatedReadTime} min read
              </div>
              {blog.views !== undefined && (
                <div className="flex items-center">
                  <Eye className="w-4 h-4 mr-2 text-purple-500" />
                  {blog.views} views
                </div>
              )}
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {blog.title}
          </h1>

          {blog.excerpt && (
            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
              {blog.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between">
            {blog.author && (
              <div className="flex items-center text-gray-600">
                <User className="w-5 h-5 mr-2" />
                <span className="font-medium">{blog.author}</span>
              </div>
            )}
            <button
              onClick={handleShare}
              className="flex items-center px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all text-gray-700 hover:text-blue-600"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </button>
          </div>
        </motion.div>

        {/* Blog Image */}
        {blog.image && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 rounded-2xl overflow-hidden shadow-2xl"
          >
            <img
              src={blog.image}
              alt={blog.title}
              className="w-full h-[400px] md:h-[500px] object-cover"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/800x500?text=Blog+Image';
              }}
            />
          </motion.div>
        )}

        {/* Blog Content */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-8 md:p-12 shadow-xl"
        >
          <div
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </motion.article>

        {/* Tags */}
        {blog.tags && Array.isArray(blog.tags) && blog.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap gap-2"
          >
            <Tag className="w-5 h-5 text-gray-500 mt-1" />
            {blog.tags.map((tag, index) => (
              <span
                key={index}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium hover:bg-blue-100 hover:text-blue-700 transition-colors cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BlogDetail;


