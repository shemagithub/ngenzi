import { DataTypes } from 'sequelize';
import { sequelize } from '../config/mysql.js';

const Notification = sequelize.define('Notification', {
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
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('info', 'success', 'warning', 'error', 'appointment', 'property', 'system'),
    defaultValue: 'info'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  link: {
    type: DataTypes.STRING,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  indexes: [
    { fields: ['userId', 'isRead'] },
    { fields: ['userId', 'createdAt'] },
    { fields: ['type'] }
  ]
});

// Define associations lazily
const setupAssociations = () => {
  try {
    const User = sequelize.models.User;
    if (User && !Notification.associations.user) {
      Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    }
    if (User && !User.associations.notifications) {
      User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
    }
  } catch (error) {
    console.warn('Warning: Could not set up Notification associations:', error.message);
  }
};

// Set up associations immediately if models are available
if (sequelize.models.User) {
  setupAssociations();
} else {
  setTimeout(setupAssociations, 0);
}

export default Notification;
export { setupAssociations };

