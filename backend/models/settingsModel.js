import { DataTypes } from 'sequelize';
import { sequelize } from '../config/mysql.js';

const Settings = sequelize.define('Settings', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  companyName: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'NGENZI REALESTATE'
  },
  companyLogo: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  companyEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'support@ngenzirealestate.com'
  },
  companyPhone: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  companyAddress: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null
  },
  // Social Media Links
  facebook: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  twitter: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  instagram: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  linkedin: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  youtube: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  whatsapp: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  // Additional Settings
  websiteUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'RWF'
  },
  timezone: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'Africa/Kigali'
  },
  // SEO Settings
  metaTitle: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  metaDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null
  },
  metaKeywords: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null
  },
  // Additional Info
  aboutUs: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null
  },
  termsAndConditions: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null
  },
  privacyPolicy: {
    type: DataTypes.TEXT,
    allowNull: true,
    defaultValue: null
  }
}, {
  tableName: 'settings',
  timestamps: true
});

export default Settings;

