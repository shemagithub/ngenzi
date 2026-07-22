import bcrypt from 'bcryptjs';
import { sequelize } from '../config/mysql.js';
import User from '../models/Usermodel.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync models to ensure role column exists
    await sequelize.sync({ alter: true });
    console.log('✅ Models synced');

    // Admin credentials
    const adminEmail = 'admin@buildestate.com';
    const adminPassword = 'Admin@123';
    const adminName = 'Admin User';

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ 
      where: { email: adminEmail } 
    });

    if (existingAdmin) {
      // Update existing user to admin
      existingAdmin.role = 'admin';
      existingAdmin.password = hashedPassword;
      existingAdmin.name = adminName;
      await existingAdmin.save();
      console.log('✅ Admin user updated');
    } else {
      // Create new admin user
      const admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Admin user created');
    }

    console.log('\n📋 Admin Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();

