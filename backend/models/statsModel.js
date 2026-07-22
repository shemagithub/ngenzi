import { DataTypes } from 'sequelize';
import { sequelize } from '../config/mysql.js';

const Stats = sequelize.define('Stats', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  endpoint: {
    type: DataTypes.STRING,
    allowNull: false
  },
  method: {
    type: DataTypes.ENUM('GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'),
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  responseTime: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  statusCode: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'stats',
  timestamps: true,
  indexes: [
    { fields: ['endpoint', 'timestamp'] },
    { fields: ['method'] },
    { fields: ['statusCode'] }
  ]
});

export default Stats;
