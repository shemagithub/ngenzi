import { sequelize } from '../config/mysql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const updateDatabase = async () => {
  try {
    console.log('🔄 Starting database update...\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    // Read the update SQL file
    const updateSqlPath = path.join(__dirname, '..', 'database-update.sql');
    
    if (!fs.existsSync(updateSqlPath)) {
      console.log('⚠️  Update SQL file not found. Running direct updates...\n');
      await runDirectUpdates();
    } else {
      console.log('📄 Reading update SQL file...\n');
      const sql = fs.readFileSync(updateSqlPath, 'utf8');
      
      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('USE'));

      // Execute each statement
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await sequelize.query(statement, { raw: true });
            console.log(`✅ Executed: ${statement.substring(0, 50)}...`);
          } catch (error) {
            // Ignore errors for existing columns/indexes
            if (error.message.includes('Duplicate column') || 
                error.message.includes('Duplicate key') ||
                error.message.includes('already exists')) {
              console.log(`ℹ️  Skipped (already exists): ${statement.substring(0, 50)}...`);
            } else {
              console.error(`❌ Error: ${error.message}`);
            }
          }
        }
      }
    }

    // Run direct updates as backup
    await runDirectUpdates();

    console.log('\n✅ Database schema update completed successfully!');
    console.log('\n📊 Verifying database structure...\n');
    await verifyDatabaseStructure();

    // Ask if user wants to fix existing data
    console.log('\n💡 Tip: Run "npm run fix-database-data" to fix existing data in the database');
    console.log('   This will fix invalid JSON fields, missing values, and data type issues\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating database:', error);
    process.exit(1);
  }
};

const runDirectUpdates = async () => {
  console.log('🔧 Running direct database updates...\n');

  try {
    // Update properties table - phone field
    try {
      await sequelize.query(`
        ALTER TABLE properties 
        MODIFY COLUMN phone VARCHAR(50) NOT NULL DEFAULT 'N/A'
      `, { raw: true });
      console.log('✅ Updated properties.phone field');
    } catch (error) {
      if (error.message.includes('Duplicate column') || error.message.includes('doesn\'t exist')) {
        console.log('ℹ️  properties.phone field already updated or doesn\'t exist');
      } else {
        console.log(`⚠️  Could not update properties.phone: ${error.message}`);
      }
    }

    // Add indexes
    const indexes = [
      { table: 'properties', index: 'idx_createdAt', column: 'createdAt' },
      { table: 'appointments', index: 'idx_createdAt', column: 'createdAt' },
      { table: 'stats', index: 'idx_createdAt', column: 'createdAt' },
      { table: 'users', index: 'idx_role', column: 'role' }
    ];

    for (const { table, index, column } of indexes) {
      try {
        // Check if index exists
        const [results] = await sequelize.query(`
          SELECT COUNT(*) as count 
          FROM information_schema.statistics 
          WHERE table_schema = DATABASE() 
          AND table_name = '${table}' 
          AND index_name = '${index}'
        `, { raw: true });

        if (results[0].count === 0) {
          await sequelize.query(`
            CREATE INDEX ${index} ON ${table}(${column})
          `, { raw: true });
          console.log(`✅ Created index ${index} on ${table}`);
        } else {
          console.log(`ℹ️  Index ${index} on ${table} already exists`);
        }
      } catch (error) {
        console.log(`⚠️  Could not create index ${index} on ${table}: ${error.message}`);
      }
    }

    // Add role column to users if it doesn't exist
    try {
      const [results] = await sequelize.query(`
        SELECT COUNT(*) as count 
        FROM information_schema.columns 
        WHERE table_schema = DATABASE() 
        AND table_name = 'users' 
        AND column_name = 'role'
      `, { raw: true });

      if (results[0].count === 0) {
        await sequelize.query(`
          ALTER TABLE users 
          ADD COLUMN role ENUM('user', 'admin') NOT NULL DEFAULT 'user' 
          AFTER resetTokenExpire
        `, { raw: true });
        console.log('✅ Added role column to users table');
      } else {
        console.log('ℹ️  role column already exists in users table');
      }
    } catch (error) {
      console.log(`⚠️  Could not add role column: ${error.message}`);
    }

    // Ensure JSON fields have proper defaults
    try {
      await sequelize.query(`
        ALTER TABLE properties 
        MODIFY COLUMN image JSON NOT NULL DEFAULT ('[]')
      `, { raw: true });
      console.log('✅ Updated properties.image default');
    } catch (error) {
      console.log(`⚠️  Could not update properties.image: ${error.message}`);
    }

    try {
      await sequelize.query(`
        ALTER TABLE properties 
        MODIFY COLUMN amenities JSON NOT NULL DEFAULT ('[]')
      `, { raw: true });
      console.log('✅ Updated properties.amenities default');
    } catch (error) {
      console.log(`⚠️  Could not update properties.amenities: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error in direct updates:', error);
  }
};

const verifyDatabaseStructure = async () => {
  try {
    const tables = ['users', 'properties', 'appointments', 'forms', 'news', 'stats'];
    
    for (const table of tables) {
      try {
        const [results] = await sequelize.query(`DESCRIBE ${table}`, { raw: true });
        console.log(`✅ Table ${table} exists with ${results.length} columns`);
      } catch (error) {
        console.log(`❌ Table ${table} does not exist or error: ${error.message}`);
      }
    }

    // Check specific important columns
    try {
      const [results] = await sequelize.query(`
        SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT 
        FROM information_schema.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'properties' 
        AND COLUMN_NAME IN ('phone', 'image', 'amenities')
      `, { raw: true });

      console.log('\n📋 Properties table key columns:');
      results.forEach(col => {
        console.log(`   - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (default: ${col.COLUMN_DEFAULT || 'NULL'})`);
      });
    } catch (error) {
      console.log(`⚠️  Could not verify properties columns: ${error.message}`);
    }

    // Check indexes
    try {
      const [results] = await sequelize.query(`
        SELECT TABLE_NAME, INDEX_NAME 
        FROM information_schema.STATISTICS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND INDEX_NAME LIKE 'idx_%'
        ORDER BY TABLE_NAME, INDEX_NAME
      `, { raw: true });

      console.log('\n📊 Database indexes:');
      const indexesByTable = {};
      results.forEach(row => {
        if (!indexesByTable[row.TABLE_NAME]) {
          indexesByTable[row.TABLE_NAME] = [];
        }
        indexesByTable[row.TABLE_NAME].push(row.INDEX_NAME);
      });

      Object.keys(indexesByTable).forEach(table => {
        console.log(`   ${table}: ${indexesByTable[table].join(', ')}`);
      });
    } catch (error) {
      console.log(`⚠️  Could not verify indexes: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error verifying database structure:', error);
  }
};

// Run the update
updateDatabase();

