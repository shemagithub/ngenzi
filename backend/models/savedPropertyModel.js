import { DataTypes } from 'sequelize';
import { sequelize } from '../config/mysql.js';

const SavedProperty = sequelize.define('SavedProperty', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  propertyId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: 'properties',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'saved_properties',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'propertyId']
    }
  ]
});

// Define associations lazily to avoid circular dependency issues
// This will be called after all models are loaded
const setupAssociations = () => {
  try {
    // Dynamic imports to avoid circular dependency
    const User = sequelize.models.User;
    const Property = sequelize.models.Property;
    
    if (User && !SavedProperty.associations.user) {
      SavedProperty.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    }
    if (Property && !SavedProperty.associations.property) {
      SavedProperty.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });
    }
    
    // Set up reverse associations
    if (User && !User.associations.savedProperties) {
      User.hasMany(SavedProperty, { foreignKey: 'userId', as: 'savedProperties' });
    }
    if (Property && !Property.associations.savedByUsers) {
      Property.hasMany(SavedProperty, { foreignKey: 'propertyId', as: 'savedByUsers' });
    }
  } catch (error) {
    console.warn('Warning: Could not set up SavedProperty associations:', error.message);
  }
};

// Set up associations immediately if models are available, otherwise it will be set up later
if (sequelize.models.User && sequelize.models.Property) {
  setupAssociations();
} else {
  // Defer association setup until models are loaded
  setTimeout(setupAssociations, 0);
}

export default SavedProperty;
export { setupAssociations };

