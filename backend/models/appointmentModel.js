import { DataTypes } from 'sequelize';
import { sequelize } from '../config/mysql.js';
import Property from './propertymodel.js';
import User from './Usermodel.js';

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  propertyId: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    references: {
      model: Property,
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
    defaultValue: 'pending'
  },
  meetingLink: {
    type: DataTypes.STRING,
    allowNull: true
  },
  meetingPlatform: {
    type: DataTypes.ENUM('zoom', 'google-meet', 'teams', 'other'),
    defaultValue: 'other'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  cancelReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reminderSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  feedback: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'appointments',
  timestamps: true,
  indexes: [
    { fields: ['userId', 'date'] },
    { fields: ['propertyId', 'date'] },
    { fields: ['status'] }
  ]
});

// Define associations
Appointment.belongsTo(Property, { foreignKey: 'propertyId', as: 'property' });
Appointment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Property.hasMany(Appointment, { foreignKey: 'propertyId', as: 'appointments' });
User.hasMany(Appointment, { foreignKey: 'userId', as: 'appointments' });

export default Appointment;
