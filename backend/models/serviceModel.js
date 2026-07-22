import { DataTypes } from 'sequelize';
import { sequelize } from '../config/mysql.js';

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  icon: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'Building2'
  },
  color: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'from-blue-500 to-cyan-500'
  },
  features: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  },
  link: {
    type: DataTypes.STRING(200),
    allowNull: true,
    defaultValue: '/contact'
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'services',
  timestamps: true
});

export default Service;

