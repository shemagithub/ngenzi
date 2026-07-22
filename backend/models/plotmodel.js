import { DataTypes } from 'sequelize';
import { sequelize } from '../config/mysql.js';

const Plot = sequelize.define('Plot', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  area: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  areaUnit: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'sqft'
  },
  type: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Plot'
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
  plotNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  surveyNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  facing: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  cornerPlot: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  approvedLayout: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  youtubeUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null
  }
}, {
  tableName: 'plots',
  timestamps: true
});

export default Plot;

