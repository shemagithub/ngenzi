import { DataTypes } from 'sequelize';
import { sequelize } from '../config/mysql.js';

const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED, // Use UNSIGNED to ensure positive integers only
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  frontImage: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  image: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  beds: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  baths: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  sqft: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  availability: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  amenities: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  youtubeUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null
  }
}, {
  tableName: 'properties',
  timestamps: true
});

export default Property;
