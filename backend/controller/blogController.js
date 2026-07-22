import Blog from '../models/blogModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Op } from 'sequelize';
import imagekit, { isImageKitConfigured } from '../config/imagekit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to generate slug from title
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Get all published blogs (public)
export const getBlogs = async (req, res) => {
  try {
    const { category, tag, search, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = { isPublished: true };
    
    if (category) {
      whereClause.category = category;
    }
    
    if (search) {
      whereClause.title = { [Op.like]: `%${search}%` };
    }

    const { count, rows } = await Blog.findAndCountAll({
      where: whereClause,
      order: [['publishedAt', 'DESC'], ['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    let blogs = rows.map(blog => {
      const blogData = blog.toJSON();
      
      // Filter by tag if provided
      if (tag && blogData.tags) {
        const tagsArray = Array.isArray(blogData.tags) ? blogData.tags : [];
        if (!tagsArray.includes(tag)) {
          return null;
        }
      }
      
      // Convert tags to array if it's a string
      if (blogData.tags && typeof blogData.tags === 'string') {
        try {
          blogData.tags = JSON.parse(blogData.tags);
        } catch {
          blogData.tags = [];
        }
      }
      
      // Convert image path to full URL if it's a local path
      if (blogData.image && blogData.image.startsWith('/uploads/blogs/')) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        blogData.image = `${baseUrl}${blogData.image}`;
      }
      
      return blogData;
    }).filter(blog => blog !== null);

    res.json({
      success: true,
      blogs,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch blogs'
    });
  }
};

// Get single blog (public)
export const getBlog = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const blog = await Blog.findOne({
      where: {
        [Op.or]: [
          { slug },
          { id: slug }
        ],
        isPublished: true
      }
    });
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Increment views
    blog.views = (blog.views || 0) + 1;
    await blog.save();

    const blogData = blog.toJSON();
    
    // Convert tags to array if it's a string
    if (blogData.tags && typeof blogData.tags === 'string') {
      try {
        blogData.tags = JSON.parse(blogData.tags);
      } catch {
        blogData.tags = [];
      }
    }
    
    // Convert image path to full URL if it's a local path
    if (blogData.image && blogData.image.startsWith('/uploads/blogs/')) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      blogData.image = `${baseUrl}${blogData.image}`;
    }

    res.json({
      success: true,
      blog: blogData
    });
  } catch (error) {
    console.error('Error fetching blog:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch blog'
    });
  }
};

// Get all blogs for admin (including unpublished)
export const getAllBlogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, category, isPublished } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {};
    
    if (search) {
      whereClause.title = { [Op.like]: `%${search}%` };
    }
    
    if (category) {
      whereClause.category = category;
    }
    
    if (isPublished !== undefined) {
      whereClause.isPublished = isPublished === 'true';
    }

    const { count, rows } = await Blog.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    const blogs = rows.map(blog => {
      const blogData = blog.toJSON();
      
      // Convert tags to array if it's a string
      if (blogData.tags && typeof blogData.tags === 'string') {
        try {
          blogData.tags = JSON.parse(blogData.tags);
        } catch {
          blogData.tags = [];
        }
      }
      
      // Convert image path to full URL if it's a local path
      if (blogData.image && blogData.image.startsWith('/uploads/blogs/')) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        blogData.image = `${baseUrl}${blogData.image}`;
      }
      
      return blogData;
    });

    res.json({
      success: true,
      blogs,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching all blogs:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch blogs'
    });
  }
};

// Add blog (admin only)
export const addBlog = async (req, res) => {
  try {
    const { title, content, excerpt, author, category, tags, metaTitle, metaDescription, metaKeywords, isPublished } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title and content are required'
      });
    }

    // Generate slug from title
    let slug = generateSlug(title);
    
    // Ensure slug is unique
    let slugExists = await Blog.findOne({ where: { slug } });
    let counter = 1;
    while (slugExists) {
      slug = `${generateSlug(title)}-${counter}`;
      slugExists = await Blog.findOne({ where: { slug } });
      counter++;
    }

    // Parse tags if it's a string
    let tagsArray = [];
    if (tags) {
      if (typeof tags === 'string') {
        try {
          tagsArray = JSON.parse(tags);
        } catch {
          tagsArray = tags.split(',').map(t => t.trim()).filter(t => t);
        }
      } else if (Array.isArray(tags)) {
        tagsArray = tags;
      }
    }

    // Handle image upload
    let imageUrl = null;
    const imageFile = req.files?.image?.[0];
    
    if (imageFile) {
      console.log(`🖼️ Processing blog image: ${imageFile.originalname}`);
      
      let imageKitSucceeded = false;
      
      // Try ImageKit first if configured
      if (isImageKitConfigured && imagekit) {
        try {
          const filePath = imageFile.path;
          if (fs.existsSync(filePath)) {
            const fileBuffer = fs.readFileSync(filePath);
            const result = await imagekit.upload({
              file: fileBuffer,
              fileName: imageFile.originalname,
              folder: 'Blogs',
            });
            
            fs.unlink(filePath, (err) => {
              if (err) console.error("Error deleting temp file:", err);
            });
            
            imageUrl = result.url;
            imageKitSucceeded = true;
            console.log(`✅ Image uploaded to ImageKit: ${imageUrl}`);
          }
        } catch (imageKitError) {
          console.error(`❌ ImageKit upload failed: ${imageKitError.message}`);
          console.log(`📦 Falling back to local storage...`);
        }
      }
      
      // Save locally if ImageKit not configured or failed
      if (!imageKitSucceeded) {
        try {
          const uploadsDir = path.join(__dirname, '..', 'uploads', 'blogs');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
            console.log(`📁 Created blogs directory: ${uploadsDir}`);
          }
          
          const filePath = imageFile.path;
          if (fs.existsSync(filePath)) {
            const timestamp = Date.now();
            const randomSuffix = Math.random().toString(36).substring(2, 8);
            const ext = path.extname(imageFile.originalname) || '.jpg';
            const baseName = path.basename(imageFile.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
            const newFileName = `blog-${timestamp}-${randomSuffix}-${baseName}${ext}`;
            const newFilePath = path.join(uploadsDir, newFileName);
            
            fs.copyFileSync(filePath, newFilePath);
            fs.unlinkSync(filePath);
            
            imageUrl = `/uploads/blogs/${newFileName}`;
            console.log(`✅ Image saved locally: ${imageUrl}`);
          }
        } catch (localSaveError) {
          console.error(`❌ Local save error:`, localSaveError);
        }
      }
    }

    // Generate excerpt from content if not provided
    let finalExcerpt = excerpt;
    if (!finalExcerpt && content) {
      finalExcerpt = content.replace(/<[^>]*>/g, '').substring(0, 200).trim() + '...';
    }

    const blogData = {
      title,
      slug,
      content,
      excerpt: finalExcerpt,
      author: author || 'Admin',
      image: imageUrl,
      category: category || 'General',
      tags: tagsArray,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || finalExcerpt,
      metaKeywords: metaKeywords || tagsArray.join(', '),
      isPublished: isPublished === 'true' || isPublished === true,
      publishedAt: (isPublished === 'true' || isPublished === true) ? new Date() : null
    };

    const blog = await Blog.create(blogData);
    const savedData = blog.toJSON();

    // Ensure tags is an array
    if (savedData.tags && typeof savedData.tags === 'string') {
      try {
        savedData.tags = JSON.parse(savedData.tags);
      } catch {
        savedData.tags = [];
      }
    }

    res.json({
      success: true,
      message: 'Blog added successfully',
      blog: savedData
    });
  } catch (error) {
    console.error('Error adding blog:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add blog'
    });
  }
};

// Update blog (admin only)
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, excerpt, author, category, tags, metaTitle, metaDescription, metaKeywords, isPublished } = req.body;

    const blog = await Blog.findByPk(id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Generate slug if title changed
    let slug = blog.slug;
    if (title && title !== blog.title) {
      slug = generateSlug(title);
      let slugExists = await Blog.findOne({ where: { slug, id: { [Op.ne]: id } } });
      let counter = 1;
      while (slugExists) {
        slug = `${generateSlug(title)}-${counter}`;
        slugExists = await Blog.findOne({ where: { slug, id: { [Op.ne]: id } } });
        counter++;
      }
    }

    // Parse tags if it's a string
    let tagsArray = blog.tags || [];
    if (tags !== undefined) {
      if (typeof tags === 'string') {
        try {
          tagsArray = JSON.parse(tags);
        } catch {
          tagsArray = tags.split(',').map(t => t.trim()).filter(t => t);
        }
      } else if (Array.isArray(tags)) {
        tagsArray = tags;
      }
    }

    // Handle image update
    let imageUrl = blog.image;
    const imageFile = req.files?.image?.[0];
    
    if (imageFile) {
      console.log(`🖼️ Processing new blog image: ${imageFile.originalname}`);
      
      let imageKitSucceeded = false;
      
      // Try ImageKit first if configured
      if (isImageKitConfigured && imagekit) {
        try {
          const filePath = imageFile.path;
          if (fs.existsSync(filePath)) {
            const fileBuffer = fs.readFileSync(filePath);
            const result = await imagekit.upload({
              file: fileBuffer,
              fileName: imageFile.originalname,
              folder: 'Blogs',
            });
            
            fs.unlink(filePath, (err) => {
              if (err) console.error("Error deleting temp file:", err);
            });
            
            imageUrl = result.url;
            imageKitSucceeded = true;
            console.log(`✅ Image uploaded to ImageKit: ${imageUrl}`);
          }
        } catch (imageKitError) {
          console.error(`❌ ImageKit upload failed: ${imageKitError.message}`);
          console.log(`📦 Falling back to local storage...`);
        }
      }
      
      // Save locally if ImageKit not configured or failed
      if (!imageKitSucceeded) {
        try {
          const uploadsDir = path.join(__dirname, '..', 'uploads', 'blogs');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          
          const filePath = imageFile.path;
          if (fs.existsSync(filePath)) {
            const timestamp = Date.now();
            const randomSuffix = Math.random().toString(36).substring(2, 8);
            const ext = path.extname(imageFile.originalname) || '.jpg';
            const baseName = path.basename(imageFile.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
            const newFileName = `blog-${timestamp}-${randomSuffix}-${baseName}${ext}`;
            const newFilePath = path.join(uploadsDir, newFileName);
            
            fs.copyFileSync(filePath, newFilePath);
            fs.unlinkSync(filePath);
            
            imageUrl = `/uploads/blogs/${newFileName}`;
            console.log(`✅ Image saved locally: ${imageUrl}`);
          }
        } catch (localSaveError) {
          console.error(`❌ Local save error:`, localSaveError);
        }
      }
    }

    // Generate excerpt from content if not provided
    let finalExcerpt = excerpt || blog.excerpt;
    if (!finalExcerpt && content) {
      finalExcerpt = content.replace(/<[^>]*>/g, '').substring(0, 200).trim() + '...';
    }

    // Update blog
    if (title) blog.title = title;
    if (slug) blog.slug = slug;
    if (content) blog.content = content;
    if (finalExcerpt) blog.excerpt = finalExcerpt;
    if (author) blog.author = author;
    if (imageUrl) blog.image = imageUrl;
    if (category !== undefined) blog.category = category;
    if (tagsArray.length > 0 || tags === null) blog.tags = tagsArray;
    if (metaTitle !== undefined) blog.metaTitle = metaTitle;
    if (metaDescription !== undefined) blog.metaDescription = metaDescription;
    if (metaKeywords !== undefined) blog.metaKeywords = metaKeywords;
    
    // Handle publish status
    if (isPublished !== undefined) {
      const wasPublished = blog.isPublished;
      blog.isPublished = isPublished === 'true' || isPublished === true;
      if (!wasPublished && blog.isPublished && !blog.publishedAt) {
        blog.publishedAt = new Date();
      }
    }

    await blog.save();
    const updatedData = blog.toJSON();

    // Ensure tags is an array
    if (updatedData.tags && typeof updatedData.tags === 'string') {
      try {
        updatedData.tags = JSON.parse(updatedData.tags);
      } catch {
        updatedData.tags = [];
      }
    }

    res.json({
      success: true,
      message: 'Blog updated successfully',
      blog: updatedData
    });
  } catch (error) {
    console.error('Error updating blog:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update blog'
    });
  }
};

// Delete blog (admin only)
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findByPk(id);
    
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    await blog.destroy();

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting blog:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete blog'
    });
  }
};

