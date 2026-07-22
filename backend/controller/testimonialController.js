import Testimonial from '../models/testimonialModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Op } from 'sequelize';
import imagekit, { isImageKitConfigured } from '../config/imagekit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to save image
const saveImage = async (file, testimonialId) => {
  if (!file) return null;

  try {
    let imageUrl = null;

    // Try ImageKit upload first
    if (isImageKitConfigured) {
      try {
        const imageKitResponse = await imagekit.upload({
          file: fs.readFileSync(file.path),
          fileName: `testimonial-${testimonialId}-${Date.now()}.${file.originalname.split('.').pop()}`,
          folder: '/testimonials'
        });
        imageUrl = imageKitResponse.url;
        console.log('✅ ImageKit upload successful:', imageUrl);
      } catch (imageKitError) {
        console.error('❌ ImageKit upload failed:', imageKitError.message);
      }
    }

    // Fallback to local storage
    if (!imageUrl) {
      const uploadDir = path.join(__dirname, '../uploads/testimonials');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const uniqueFileName = `testimonial-${testimonialId}-${Date.now()}-${file.originalname}`;
      const filePath = path.join(uploadDir, uniqueFileName);
      fs.copyFileSync(file.path, filePath);
      imageUrl = `/uploads/testimonials/${uniqueFileName}`;
      console.log('✅ Local image saved:', imageUrl);
    }

    // Delete temporary file
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return imageUrl;
  } catch (error) {
    console.error('Error saving image:', error);
    return null;
  }
};

// Get all testimonials (public)
export const getTestimonials = async (req, res) => {
  try {
    const { isActive, isFeatured } = req.query;
    const whereClause = {};

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    if (isFeatured !== undefined) {
      whereClause.isFeatured = isFeatured === 'true';
    }

    const testimonials = await Testimonial.findAll({
      where: whereClause,
      order: [['order', 'ASC'], ['isFeatured', 'DESC'], ['createdAt', 'DESC']]
    });

    const testimonialsData = testimonials.map(testimonial => {
      const testimonialData = testimonial.toJSON();
      
      // Convert image path to full URL if it's a local path
      if (testimonialData.image && testimonialData.image.startsWith('/uploads/testimonials/')) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        testimonialData.image = `${baseUrl}${testimonialData.image}`;
      }
      
      return testimonialData;
    });

    res.json({
      success: true,
      testimonials: testimonialsData
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch testimonials'
    });
  }
};

// Get single testimonial (public)
export const getTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    
    const testimonial = await Testimonial.findByPk(id);
    
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    const testimonialData = testimonial.toJSON();
    
    // Convert image path to full URL if it's a local path
    if (testimonialData.image && testimonialData.image.startsWith('/uploads/testimonials/')) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      testimonialData.image = `${baseUrl}${testimonialData.image}`;
    }

    res.json({
      success: true,
      testimonial: testimonialData
    });
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch testimonial'
    });
  }
};

// Get all testimonials (admin)
export const getAllTestimonials = async (req, res) => {
  try {
    const { search, isActive, isFeatured } = req.query;
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { position: { [Op.like]: `%${search}%` } },
        { company: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ];
    }

    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    if (isFeatured !== undefined) {
      whereClause.isFeatured = isFeatured === 'true';
    }

    const testimonials = await Testimonial.findAll({
      where: whereClause,
      order: [['order', 'ASC'], ['isFeatured', 'DESC'], ['createdAt', 'DESC']]
    });

    const testimonialsData = testimonials.map(testimonial => {
      const testimonialData = testimonial.toJSON();
      
      // Convert image path to full URL if it's a local path
      if (testimonialData.image && testimonialData.image.startsWith('/uploads/testimonials/')) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        testimonialData.image = `${baseUrl}${testimonialData.image}`;
      }
      
      return testimonialData;
    });

    res.json({
      success: true,
      testimonials: testimonialsData
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch testimonials'
    });
  }
};

// Add testimonial
export const addTestimonial = async (req, res) => {
  try {
    const { name, position, company, content, rating, order, isActive, isFeatured } = req.body;
    const imageFile = req.files?.image?.[0];

    if (!name || !content) {
      return res.status(400).json({
        success: false,
        message: 'Name and content are required'
      });
    }

    // Create testimonial first to get ID
    const testimonialData = {
      name,
      position: position || null,
      company: company || null,
      content,
      rating: rating ? parseInt(rating) : 5,
      order: order ? parseInt(order) : 0,
      isActive: isActive !== undefined ? isActive === 'true' : true,
      isFeatured: isFeatured !== undefined ? isFeatured === 'true' : false
    };

    const testimonial = await Testimonial.create(testimonialData);

    // Handle image upload
    if (imageFile) {
      const imageUrl = await saveImage(imageFile, testimonial.id);
      if (imageUrl) {
        await testimonial.update({ image: imageUrl });
      }
    }

    const testimonialResponse = testimonial.toJSON();
    if (testimonialResponse.image && testimonialResponse.image.startsWith('/uploads/testimonials/')) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      testimonialResponse.image = `${baseUrl}${testimonialResponse.image}`;
    }

    res.status(201).json({
      success: true,
      message: 'Testimonial added successfully',
      testimonial: testimonialResponse
    });
  } catch (error) {
    console.error('Error adding testimonial:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add testimonial'
    });
  }
};

// Update testimonial
export const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, company, content, rating, order, isActive, isFeatured } = req.body;
    const imageFile = req.files?.image?.[0];

    const testimonial = await Testimonial.findByPk(id);
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    const updateData = {
      name: name || testimonial.name,
      position: position !== undefined ? position : testimonial.position,
      company: company !== undefined ? company : testimonial.company,
      content: content || testimonial.content,
      rating: rating !== undefined ? parseInt(rating) : testimonial.rating,
      order: order !== undefined ? parseInt(order) : testimonial.order,
      isActive: isActive !== undefined ? isActive === 'true' : testimonial.isActive,
      isFeatured: isFeatured !== undefined ? isFeatured === 'true' : testimonial.isFeatured
    };

    // Handle image upload
    if (imageFile) {
      const imageUrl = await saveImage(imageFile, testimonial.id);
      if (imageUrl) {
        updateData.image = imageUrl;
      }
    }

    await testimonial.update(updateData);

    const testimonialResponse = testimonial.toJSON();
    if (testimonialResponse.image && testimonialResponse.image.startsWith('/uploads/testimonials/')) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      testimonialResponse.image = `${baseUrl}${testimonialResponse.image}`;
    }

    res.json({
      success: true,
      message: 'Testimonial updated successfully',
      testimonial: testimonialResponse
    });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update testimonial'
    });
  }
};

// Delete testimonial
export const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findByPk(id);
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    // Delete image file if exists
    if (testimonial.image && testimonial.image.startsWith('/uploads/testimonials/')) {
      const imagePath = path.join(__dirname, '..', testimonial.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await testimonial.destroy();

    res.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete testimonial'
    });
  }
};










