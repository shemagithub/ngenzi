/**
 * Upsert admin from ADMIN_EMAIL / ADMIN_PASSWORD in .env
 * Usage (cPanel app root): node scripts/ensure-admin.js
 */
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/mysql.js';
import User from '../models/Usermodel.js';

dotenv.config();

const ensureAdmin = async () => {
  try {
    await sequelize.authenticate();
    await User.sync({ alter: false });

    const email = (process.env.ADMIN_EMAIL || 'admin@buildestate.com').trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'Admin@123';
    const name = process.env.ADMIN_NAME || 'Admin User';
    const hash = await bcrypt.hash(password, 10);

    let admin = await User.findOne({ where: { email } });
    if (!admin) {
      admin = await User.create({ name, email, password: hash, role: 'admin' });
      console.log('✅ Admin created');
    } else {
      await admin.update({ password: hash, role: 'admin', name: admin.name || name });
      console.log('✅ Admin password reset from .env');
    }

    console.log('');
    console.log('Sign in to admin with:');
    console.log(`  email:    ${email}`);
    console.log(`  password: (ADMIN_PASSWORD from .env)`);
    console.log('');
    process.exit(0);
  } catch (err) {
    console.error('❌ ensure-admin failed:', err.message);
    process.exit(1);
  }
};

ensureAdmin();
