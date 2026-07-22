import Service from '../models/serviceModel.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import imagekit, { isImageKitConfigured } from '../config/imagekit.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all services
export const getServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { isActive: true },
      order: [['order', 'ASC'], ['createdAt', 'DESC']]
    });

    const servicesData = services.map(service => {
      const serviceData = service.toJSON();
      
      // Convert features to array if it's a string
      if (serviceData.features && typeof serviceData.features === 'string') {
        try {
          serviceData.features = JSON.parse(serviceData.features);
        } catch {
          serviceData.features = [];
        }
      }
      
      // Convert image path to full URL if it's a local path
      if (serviceData.image && serviceData.image.startsWith('/uploads/services/')) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        serviceData.image = `${baseUrl}${serviceData.image}`;
      }
      
      return serviceData;
    });

    res.json({
      success: true,
      services: servicesData
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch services'
    });
  }
};

// Get single service
export const getService = async (req, res) => {
  try {
    const { id } = req.params;
    
    const service = await Service.findByPk(id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    const serviceData = service.toJSON();
    
    // Convert features to array if it's a string
    if (serviceData.features && typeof serviceData.features === 'string') {
      try {
        serviceData.features = JSON.parse(serviceData.features);
      } catch {
        serviceData.features = [];
      }
    }
    
    // Convert image path to full URL if it's a local path
    if (serviceData.image && serviceData.image.startsWith('/uploads/services/')) {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      serviceData.image = `${baseUrl}${serviceData.image}`;
    }

    res.json({
      success: true,
      service: serviceData
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch service'
    });
  }
};

// Add service (admin only)
export const addService = async (req, res) => {
  try {
    const { title, description, icon, color, features, link, order, isActive } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    // Parse features if it's a string
    let featuresArray = [];
    if (features) {
      if (typeof features === 'string') {
        try {
          featuresArray = JSON.parse(features);
        } catch {
          featuresArray = features.split(',').map(f => f.trim());
        }
      } else if (Array.isArray(features)) {
        featuresArray = features;
      }
    }

    // Handle image upload
    let imageUrl = null;
    const imageFile = req.files?.image?.[0];
    
    if (imageFile) {
      console.log(`🖼️ Processing service image: ${imageFile.originalname}`);
      
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
              folder: 'Services',
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
          const uploadsDir = path.join(__dirname, '..', 'uploads', 'services');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
            console.log(`📁 Created services directory: ${uploadsDir}`);
          }
          
          const filePath = imageFile.path;
          if (fs.existsSync(filePath)) {
            const timestamp = Date.now();
            const randomSuffix = Math.random().toString(36).substring(2, 8);
            const ext = path.extname(imageFile.originalname) || '.jpg';
            const baseName = path.basename(imageFile.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
            const newFileName = `service-${timestamp}-${randomSuffix}-${baseName}${ext}`;
            const newFilePath = path.join(uploadsDir, newFileName);
            
            fs.copyFileSync(filePath, newFilePath);
            fs.unlinkSync(filePath);
            
            imageUrl = `/uploads/services/${newFileName}`;
            console.log(`✅ Image saved locally: ${imageUrl}`);
          }
        } catch (localSaveError) {
          console.error(`❌ Local save error:`, localSaveError);
        }
      }
    }

    const serviceData = {
      title,
      description,
      icon: icon || 'Building2',
      color: color || 'from-blue-500 to-cyan-500',
      features: featuresArray,
      link: link || '/contact',
      image: imageUrl,
      order: order ? parseInt(order) : 0,
      isActive: isActive !== undefined ? isActive : true
    };

    const service = await Service.create(serviceData);
    const savedData = service.toJSON();

    // Ensure features is an array
    if (savedData.features && typeof savedData.features === 'string') {
      try {
        savedData.features = JSON.parse(savedData.features);
      } catch {
        savedData.features = [];
      }
    }

    res.json({
      success: true,
      message: 'Service added successfully',
      service: savedData
    });
  } catch (error) {
    console.error('Error adding service:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add service'
    });
  }
};

// Update service (admin only)
export const updateService = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, icon, color, features, link, order, isActive } = req.body;

    const service = await Service.findByPk(id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Parse features if it's a string
    let featuresArray = service.features || [];
    if (features !== undefined) {
      if (typeof features === 'string') {
        try {
          featuresArray = JSON.parse(features);
        } catch {
          featuresArray = features.split(',').map(f => f.trim());
        }
      } else if (Array.isArray(features)) {
        featuresArray = features;
      }
    }

    // Handle image update
    let imageUrl = service.image;
    const imageFile = req.files?.image?.[0];
    
    if (imageFile) {
      console.log(`🖼️ Processing new service image: ${imageFile.originalname}`);
      
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
              folder: 'Services',
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
          const uploadsDir = path.join(__dirname, '..', 'uploads', 'services');
          if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
          }
          
          const filePath = imageFile.path;
          if (fs.existsSync(filePath)) {
            const timestamp = Date.now();
            const randomSuffix = Math.random().toString(36).substring(2, 8);
            const ext = path.extname(imageFile.originalname) || '.jpg';
            const baseName = path.basename(imageFile.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
            const newFileName = `service-${timestamp}-${randomSuffix}-${baseName}${ext}`;
            const newFilePath = path.join(uploadsDir, newFileName);
            
            fs.copyFileSync(filePath, newFilePath);
            fs.unlinkSync(filePath);
            
            imageUrl = `/uploads/services/${newFileName}`;
            console.log(`✅ Image saved locally: ${imageUrl}`);
          }
        } catch (localSaveError) {
          console.error(`❌ Local save error:`, localSaveError);
        }
      }
    }

    // Update service
    if (title) service.title = title;
    if (description) service.description = description;
    if (icon !== undefined) service.icon = icon;
    if (color !== undefined) service.color = color;
    if (featuresArray.length > 0 || features === null) service.features = featuresArray;
    if (link !== undefined) service.link = link;
    if (imageUrl) service.image = imageUrl;
    if (order !== undefined) service.order = parseInt(order);
    if (isActive !== undefined) service.isActive = isActive;

    await service.save();
    const updatedData = service.toJSON();

    // Ensure features is an array
    if (updatedData.features && typeof updatedData.features === 'string') {
      try {
        updatedData.features = JSON.parse(updatedData.features);
      } catch {
        updatedData.features = [];
      }
    }

    res.json({
      success: true,
      message: 'Service updated successfully',
      service: updatedData
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update service'
    });
  }
};

// Delete service (admin only)
export const deleteService = async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findByPk(id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    await service.destroy();

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete service'
    });
  }
};

// Get all services for admin (including inactive)
export const getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      order: [['order', 'ASC'], ['createdAt', 'DESC']]
    });

    const servicesData = services.map(service => {
      const serviceData = service.toJSON();
      
      // Convert features to array if it's a string
      if (serviceData.features && typeof serviceData.features === 'string') {
        try {
          serviceData.features = JSON.parse(serviceData.features);
        } catch {
          serviceData.features = [];
        }
      }
      
      // Convert image path to full URL if it's a local path
      if (serviceData.image && serviceData.image.startsWith('/uploads/services/')) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        serviceData.image = `${baseUrl}${serviceData.image}`;
      }
      
      return serviceData;
    });

    res.json({
      success: true,
      services: servicesData
    });
  } catch (error) {
    console.error('Error fetching all services:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch services'
    });
  }
};

