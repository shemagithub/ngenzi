/**
 * One-shot DB initializer for cPanel / production.
 * Creates all tables, default admin, and settings.
 *
 * Usage (from backend app root):
 *   node scripts/init-database.js
 */
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });
dotenv.config({ path: join(__dirname, '../.env.local') });

async function main() {
  console.log('🔧 Initializing database…');
  console.log(`   DB: ${process.env.DB_NAME}@${process.env.DB_HOST || 'localhost'}`);

  const { connectdb, sequelize } = await import('../config/mysql.js');
  const db = await connectdb();

  if (!db) {
    console.error('❌ Could not connect to MySQL. Check DB_* in .env');
    process.exit(1);
  }

  // Force a sync pass (tables + bootstrap already run inside connectdb)
  await sequelize.sync({ alter: false });

  const User = (await import('../models/Usermodel.js')).default;
  const Settings = (await import('../models/settingsModel.js')).default;
  const Stats = (await import('../models/statsModel.js')).default;

  const [users, settings, stats] = await Promise.all([
    User.count(),
    Settings.count(),
    Stats.count().catch(() => 0),
  ]);

  console.log('✅ Database ready');
  console.log(`   users: ${users}`);
  console.log(`   settings: ${settings}`);
  console.log(`   stats: ${stats}`);
  console.log('');
  console.log('Admin login:');
  console.log(`   email: ${process.env.ADMIN_EMAIL || 'admin@ngenzirealestate.com'}`);
  console.log(`   password: (ADMIN_PASSWORD from .env, or Admin@123 if unset at first bootstrap)`);

  await sequelize.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ init-database failed:', err.message);
  process.exit(1);
});
