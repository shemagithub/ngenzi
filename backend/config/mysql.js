import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Create sequelize instance first (before importing models to avoid circular dependency)
const sequelize = new Sequelize(
  process.env.DB_NAME || 'buildestate',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: false
    }
  }
);

const connectdb = async () => {
  try {
    // Check if database credentials are provided
    if (!process.env.DB_NAME && !process.env.MYSQL_URI) {
      throw new Error('Database credentials (DB_NAME or MYSQL_URI) environment variable is not defined');
    }

    // Import models AFTER sequelize is created to avoid circular dependency
    // This ensures models can access the sequelize instance
    // Import in order: base models first, then dependent models
    await import('../models/Usermodel.js');
    await import('../models/propertymodel.js');
    await import('../models/plotmodel.js');
    await import('../models/formmodel.js');
    await import('../models/newsmodel.js');
    await import('../models/statsModel.js');
    await import('../models/settingsModel.js');
    await import('../models/serviceModel.js');
    await import('../models/blogModel.js');
    await import('../models/testimonialModel.js');
    await import('../models/teamModel.js');
    
    // Import models with associations after base models
    await import('../models/appointmentModel.js');
    
    // Import SavedProperty and set up its associations
    const savedPropertyModule = await import('../models/savedPropertyModel.js');
    if (savedPropertyModule.setupAssociations) {
      savedPropertyModule.setupAssociations();
    }
    
    // Import Notification model and set up associations
    const notificationModule = await import('../models/notificationModel.js');
    if (notificationModule.setupAssociations) {
      notificationModule.setupAssociations();
    }

    // Test the connection
    await sequelize.authenticate();
    console.log('✅ MySQL Connected successfully');

    // Sync models (only in development, use migrations in production)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: false }); // Set to true if you want to auto-update tables
    }

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await sequelize.close();
      console.log('MySQL connection closed due to app termination');
      process.exit(0);
    });

    return sequelize;
  } catch (error) {
    console.error(`❌ MySQL Connection Error: ${error.message}`);
    console.error('Error details:', error);
    
    // In production, retry connection without exiting the process
    // This allows the server to start even if DB connection fails initially
    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Retrying connection in 5 seconds...');
      setTimeout(() => {
        connectdb().catch(err => {
          console.error('Retry failed:', err.message);
          // Continue retrying every 30 seconds
          setTimeout(() => connectdb(), 30000);
        });
      }, 5000);
    } else {
      // In development, exit to catch issues early
      console.error('Stack trace:', error.stack);
      throw error; // Let the caller handle it
    }
    
    // Return null instead of throwing to allow server to start
    return null;
  }
};

export { sequelize, connectdb };
export default sequelize;
