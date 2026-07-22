import SavedProperty from '../models/savedPropertyModel.js';
import Property from '../models/propertymodel.js';
import { sequelize } from '../config/mysql.js';

// Get all saved properties for a user
export const getSavedProperties = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const savedProperties = await SavedProperty.findAll({
      where: { userId },
      include: [
        {
          model: Property,
          as: 'property',
          required: true
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Convert to plain objects and normalize image fields
    const properties = savedProperties.map(item => {
      const property = item.property.toJSON();
      
      // Normalize image field
      if (property.image) {
        if (typeof property.image === 'string') {
          try {
            property.image = JSON.parse(property.image);
          } catch {
            property.image = [property.image];
          }
        }
        if (!Array.isArray(property.image)) {
          property.image = [];
        }
      } else {
        property.image = [];
      }
      
      // Normalize amenities
      if (property.amenities) {
        if (typeof property.amenities === 'string') {
          try {
            property.amenities = JSON.parse(property.amenities);
          } catch {
            property.amenities = [property.amenities];
          }
        }
        if (!Array.isArray(property.amenities)) {
          property.amenities = [];
        }
      } else {
        property.amenities = [];
      }
      
      // Convert frontImage to full URL if local path
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      if (property.frontImage && typeof property.frontImage === 'string' && property.frontImage.startsWith('/uploads/')) {
        property.frontImage = `${baseUrl}${property.frontImage}`;
      }
      
      // Convert image URLs to full URLs
      property.image = property.image.map(img => {
        if (typeof img === 'string' && img.startsWith('/uploads/')) {
          return `${baseUrl}${img}`;
        }
        return img;
      });
      
      return property;
    });

    res.json({
      success: true,
      properties
    });
  } catch (error) {
    console.error('Error fetching saved properties:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching saved properties'
    });
  }
};

// Add property to saved
export const addSavedProperty = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.body;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: 'Property ID is required'
      });
    }

    const parsedPropertyId = parseInt(propertyId);
    if (isNaN(parsedPropertyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID'
      });
    }

    // Check if property exists
    const property = await Property.findByPk(parsedPropertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      });
    }

    // Check if already saved
    const existing = await SavedProperty.findOne({
      where: { userId, propertyId: parsedPropertyId }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Property is already saved'
      });
    }

    // Add to saved
    const savedProperty = await SavedProperty.create({
      userId,
      propertyId: parsedPropertyId
    });

    res.json({
      success: true,
      message: 'Property saved successfully',
      savedProperty
    });
  } catch (error) {
    console.error('Error adding saved property:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding saved property'
    });
  }
};

// Remove property from saved
export const removeSavedProperty = async (req, res) => {
  try {
    const userId = req.user.id;
    const { propertyId } = req.params;

    const parsedPropertyId = parseInt(propertyId);
    if (isNaN(parsedPropertyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID'
      });
    }

    const savedProperty = await SavedProperty.findOne({
      where: { userId, propertyId: parsedPropertyId }
    });

    if (!savedProperty) {
      return res.status(404).json({
        success: false,
        message: 'Saved property not found'
      });
    }

    await savedProperty.destroy();

    res.json({
      success: true,
      message: 'Property removed from saved'
    });
  } catch (error) {
    console.error('Error removing saved property:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing saved property'
    });
  }
};

// Check if property is saved
export const checkSavedProperty = async (req, res) => {
  try {
    console.log('📍 GET /api/users/saved-properties/check/:propertyId - Request received');
    console.log('Request params:', req.params);
    console.log('User ID:', req.user?.id);
    
    const userId = req.user.id;
    const { propertyId } = req.params;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: 'Property ID is required'
      });
    }

    const parsedPropertyId = parseInt(propertyId);
    if (isNaN(parsedPropertyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid property ID'
      });
    }

    console.log(`🔍 Checking if property ${parsedPropertyId} is saved for user ${userId}`);

    const savedProperty = await SavedProperty.findOne({
      where: { userId, propertyId: parsedPropertyId }
    });

    console.log(`✅ Check complete: isSaved = ${!!savedProperty}`);

    res.json({
      success: true,
      isSaved: !!savedProperty
    });
  } catch (error) {
    console.error('❌ Error checking saved property:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking saved property',
      error: error.message
    });
  }
};

