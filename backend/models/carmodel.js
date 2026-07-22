import { DataTypes } from 'sequelize';
import { sequelize } from '../config/mysql.js';

const Car = sequelize.define('Car', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  brand: {
    type: DataTypes.STRING,
    allowNull: false
  },
  model: {
    type: DataTypes.STRING,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  mileage: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  mileageUnit: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'km'
  },
  fuelType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  transmission: {
    type: DataTypes.STRING,
    allowNull: false
  },
  color: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  condition: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Used'
  },
  bodyType: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  engineSize: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  vin: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
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
  availability: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  features: {
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
  tableName: 'cars',
  timestamps: true
});

export default Car;
