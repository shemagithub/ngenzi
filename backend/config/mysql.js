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
    await import('../models/carmodel.js');
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

    // Ensure ALL registered models create their tables (empty cPanel DBs need this)
    const shouldAlter = process.env.DB_SYNC_ALTER === 'true';
    await sequelize.sync({ alter: shouldAlter });
    console.log(`✅ Database tables synced (alter=${shouldAlter})`);

    // Ensure admin exists and matches ADMIN_EMAIL / ADMIN_PASSWORD from .env
    try {
      const User = (await import('../models/Usermodel.js')).default;
      const bcrypt = (await import('bcryptjs')).default;
      const email = (process.env.ADMIN_EMAIL || 'admin@ngenzirealestate.com').trim().toLowerCase();
      const password = process.env.ADMIN_PASSWORD || 'Admin@123';
      const name = process.env.ADMIN_NAME || 'Admin User';
      const hash = await bcrypt.hash(password, 10);

      let admin = await User.findOne({ where: { email } });
      if (!admin) {
        admin = await User.create({ name, email, password: hash, role: 'admin' });
        console.log(`✅ Default admin created: ${email}`);
      } else {
        const updates = {};
        if (admin.role !== 'admin') updates.role = 'admin';
        // Keep DB password in sync with .env so panel login always matches hosting config
        const syncPw = process.env.ADMIN_SYNC_PASSWORD !== 'false';
        if (syncPw && password) {
          const ok = await bcrypt.compare(password, admin.password);
          if (!ok) updates.password = hash;
        }
        if (Object.keys(updates).length) {
          await admin.update(updates);
          console.log(`✅ Admin account synced from .env: ${email}`);
        } else {
          console.log(`✅ Admin ready: ${email}`);
        }
      }
    } catch (bootErr) {
      console.warn('⚠️  Admin bootstrap skipped:', bootErr.message);
    }

    // Ensure a settings row exists
    try {
      const Settings = (await import('../models/settingsModel.js')).default;
      const existing = await Settings.findOne();
      if (!existing) {
        await Settings.create({
          companyName: 'NGENZI REALESTATE',
          companyEmail: process.env.EMAIL || 'info@ngenzirealestate.com',
          websiteUrl: process.env.WEBSITE_URL || 'https://ngenzirealestate.com',
          currency: 'RWF',
          timezone: 'Africa/Kigali',
        });
        console.log('✅ Default settings created');
      }
    } catch (settingsErr) {
      console.warn('⚠️  Settings bootstrap skipped:', settingsErr.message);
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
