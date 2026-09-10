import bcrypt from 'bcryptjs';
import { sequelize } from '../config/mysql.js';
import User from '../models/Usermodel.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    await sequelize.sync({ alter: false });
    console.log('✅ Models synced');

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@buildestate.com').trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const adminName = process.env.ADMIN_NAME || 'Admin User';

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const existingAdmin = await User.findOne({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      existingAdmin.role = 'admin';
      existingAdmin.password = hashedPassword;
      existingAdmin.name = adminName;
      await existingAdmin.save();
      console.log('✅ Admin user updated');
    } else {
      await User.create({
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });
      console.log('✅ Admin user created');
    }

    console.log('\n📋 Admin Credentials (from .env):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error.message || error);
    process.exit(1);
  }
};

createAdmin();
