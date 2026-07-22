import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'realestate',
  multipleStatements: true
};

// SQL migration queries
const migrations = [
  // 1. Create/Update users table
  `CREATE TABLE IF NOT EXISTS \`users\` (
    \`id\` INT(11) NOT NULL AUTO_INCREMENT,
    \`name\` VARCHAR(255) NOT NULL,
    \`email\` VARCHAR(255) NOT NULL UNIQUE,
    \`password\` VARCHAR(255) NOT NULL,
    \`resetToken\` VARCHAR(255) DEFAULT NULL,
    \`resetTokenExpire\` DATETIME DEFAULT NULL,
    \`role\` ENUM('user', 'admin') DEFAULT 'user',
    \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`email\` (\`email\`),
    KEY \`idx_role\` (\`role\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 2. Create/Update properties table
  `CREATE TABLE IF NOT EXISTS \`properties\` (
    \`id\` INT(11) NOT NULL AUTO_INCREMENT,
    \`title\` VARCHAR(255) NOT NULL,
    \`location\` VARCHAR(255) NOT NULL,
    \`price\` DECIMAL(10, 2) NOT NULL,
    \`frontImage\` VARCHAR(500) DEFAULT NULL,
    \`image\` JSON NOT NULL DEFAULT ('[]'),
    \`beds\` INT(11) NOT NULL,
    \`baths\` INT(11) NOT NULL,
    \`sqft\` INT(11) NOT NULL,
    \`type\` VARCHAR(255) NOT NULL,
    \`availability\` VARCHAR(255) NOT NULL,
    \`description\` TEXT NOT NULL,
    \`amenities\` JSON NOT NULL DEFAULT ('[]'),
    \`phone\` VARCHAR(255) NOT NULL,
    \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    KEY \`idx_type\` (\`type\`),
    KEY \`idx_location\` (\`location\`),
    KEY \`idx_availability\` (\`availability\`),
    KEY \`idx_price\` (\`price\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 3. Add frontImage column if it doesn't exist
  `SET @col_exists = 0;
   SELECT COUNT(*) INTO @col_exists 
   FROM INFORMATION_SCHEMA.COLUMNS 
   WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'properties' 
     AND COLUMN_NAME = 'frontImage';
   SET @query = IF(@col_exists = 0, 
     'ALTER TABLE \`properties\` ADD COLUMN \`frontImage\` VARCHAR(500) DEFAULT NULL AFTER \`price\`', 
     'SELECT 1');
   PREPARE stmt FROM @query;
   EXECUTE stmt;
   DEALLOCATE PREPARE stmt;`,

  // 4. Create/Update appointments table
  `CREATE TABLE IF NOT EXISTS \`appointments\` (
    \`id\` INT(11) NOT NULL AUTO_INCREMENT,
    \`propertyId\` INT(11) NOT NULL,
    \`userId\` INT(11) NOT NULL,
    \`date\` DATETIME NOT NULL,
    \`time\` VARCHAR(255) NOT NULL,
    \`status\` ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    \`meetingLink\` VARCHAR(500) DEFAULT NULL,
    \`meetingPlatform\` ENUM('zoom', 'google-meet', 'teams', 'other') DEFAULT 'other',
    \`notes\` TEXT DEFAULT NULL,
    \`cancelReason\` TEXT DEFAULT NULL,
    \`reminderSent\` BOOLEAN DEFAULT FALSE,
    \`feedback\` JSON DEFAULT NULL,
    \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    KEY \`idx_userId_date\` (\`userId\`, \`date\`),
    KEY \`idx_propertyId_date\` (\`propertyId\`, \`date\`),
    KEY \`idx_status\` (\`status\`),
    CONSTRAINT \`fk_appointments_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT \`fk_appointments_property\` FOREIGN KEY (\`propertyId\`) REFERENCES \`properties\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 5. Create/Update saved_properties table
  `CREATE TABLE IF NOT EXISTS \`saved_properties\` (
    \`id\` INT(11) NOT NULL AUTO_INCREMENT,
    \`userId\` INT(11) NOT NULL,
    \`propertyId\` INT(11) NOT NULL,
    \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`unique_user_property\` (\`userId\`, \`propertyId\`),
    CONSTRAINT \`fk_saved_properties_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT \`fk_saved_properties_property\` FOREIGN KEY (\`propertyId\`) REFERENCES \`properties\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 6. Create/Update notifications table
  `CREATE TABLE IF NOT EXISTS \`notifications\` (
    \`id\` INT(11) NOT NULL AUTO_INCREMENT,
    \`userId\` INT(11) NOT NULL,
    \`title\` VARCHAR(255) NOT NULL,
    \`message\` TEXT NOT NULL,
    \`type\` ENUM('info', 'success', 'warning', 'error', 'appointment', 'property', 'system') DEFAULT 'info',
    \`isRead\` BOOLEAN DEFAULT FALSE,
    \`link\` VARCHAR(500) DEFAULT NULL,
    \`metadata\` JSON DEFAULT NULL,
    \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    KEY \`idx_userId_isRead\` (\`userId\`, \`isRead\`),
    KEY \`idx_userId_createdAt\` (\`userId\`, \`createdAt\`),
    KEY \`idx_type\` (\`type\`),
    CONSTRAINT \`fk_notifications_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 7. Create/Update forms table
  `CREATE TABLE IF NOT EXISTS \`forms\` (
    \`id\` INT(11) NOT NULL AUTO_INCREMENT,
    \`name\` VARCHAR(255) NOT NULL,
    \`email\` VARCHAR(255) NOT NULL,
    \`phone\` VARCHAR(255) DEFAULT NULL,
    \`message\` TEXT NOT NULL,
    \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    KEY \`idx_email\` (\`email\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 8. Create/Update plots table
  `CREATE TABLE IF NOT EXISTS \`plots\` (
    \`id\` INT(11) NOT NULL AUTO_INCREMENT,
    \`title\` VARCHAR(255) NOT NULL,
    \`location\` VARCHAR(255) NOT NULL,
    \`price\` DECIMAL(10, 2) NOT NULL,
    \`frontImage\` VARCHAR(500) DEFAULT NULL,
    \`image\` JSON NOT NULL DEFAULT ('[]'),
    \`area\` DECIMAL(10, 2) NOT NULL COMMENT 'Plot area in square feet',
    \`areaUnit\` VARCHAR(20) DEFAULT 'sqft' COMMENT 'Unit for area (sqft, sqm, acres)',
    \`type\` VARCHAR(255) DEFAULT 'Plot' COMMENT 'Plot type (Residential, Commercial, Agricultural, etc.)',
    \`availability\` VARCHAR(255) NOT NULL COMMENT 'rent or buy',
    \`description\` TEXT NOT NULL,
    \`amenities\` JSON NOT NULL DEFAULT ('[]') COMMENT 'Plot amenities like Road Access, Electricity, etc.',
    \`phone\` VARCHAR(255) NOT NULL,
    \`plotNumber\` VARCHAR(100) DEFAULT NULL COMMENT 'Survey/Plot number',
    \`surveyNumber\` VARCHAR(100) DEFAULT NULL COMMENT 'Survey number',
    \`facing\` VARCHAR(50) DEFAULT NULL COMMENT 'Plot facing direction (North, South, East, West)',
    \`cornerPlot\` BOOLEAN DEFAULT FALSE COMMENT 'Whether it is a corner plot',
    \`approvedLayout\` BOOLEAN DEFAULT FALSE COMMENT 'Whether layout is approved',
    \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    KEY \`idx_location\` (\`location\`),
    KEY \`idx_type\` (\`type\`),
    KEY \`idx_availability\` (\`availability\`),
    KEY \`idx_price\` (\`price\`),
    KEY \`idx_area\` (\`area\`),
    KEY \`idx_createdAt\` (\`createdAt\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 9. Create/Update news table
  `CREATE TABLE IF NOT EXISTS \`news\` (
    \`id\` INT(11) NOT NULL AUTO_INCREMENT,
    \`email\` VARCHAR(255) NOT NULL UNIQUE,
    \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    UNIQUE KEY \`email\` (\`email\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 10. Create/Update settings table
  `CREATE TABLE IF NOT EXISTS \`settings\` (
    \`id\` INT(11) NOT NULL AUTO_INCREMENT,
    \`companyName\` VARCHAR(255) NOT NULL DEFAULT 'NGENZI REALESTATE',
    \`companyLogo\` VARCHAR(500) DEFAULT NULL,
    \`companyEmail\` VARCHAR(255) NOT NULL DEFAULT 'support@ngenzirealestate.com',
    \`companyPhone\` VARCHAR(50) DEFAULT NULL,
    \`companyAddress\` TEXT DEFAULT NULL,
    \`facebook\` VARCHAR(500) DEFAULT NULL,
    \`twitter\` VARCHAR(500) DEFAULT NULL,
    \`instagram\` VARCHAR(500) DEFAULT NULL,
    \`linkedin\` VARCHAR(500) DEFAULT NULL,
    \`youtube\` VARCHAR(500) DEFAULT NULL,
    \`whatsapp\` VARCHAR(50) DEFAULT NULL,
    \`websiteUrl\` VARCHAR(500) DEFAULT NULL,
    \`currency\` VARCHAR(10) DEFAULT 'RWF',
    \`timezone\` VARCHAR(50) DEFAULT 'Africa/Kigali',
    \`metaTitle\` VARCHAR(255) DEFAULT NULL,
    \`metaDescription\` TEXT DEFAULT NULL,
    \`metaKeywords\` TEXT DEFAULT NULL,
    \`aboutUs\` TEXT DEFAULT NULL,
    \`termsAndConditions\` TEXT DEFAULT NULL,
    \`privacyPolicy\` TEXT DEFAULT NULL,
    \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

  // 11. Create/Update stats table
  `CREATE TABLE IF NOT EXISTS \`stats\` (
    \`id\` INT(11) NOT NULL AUTO_INCREMENT,
    \`endpoint\` VARCHAR(255) NOT NULL,
    \`method\` ENUM('GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD') NOT NULL,
    \`timestamp\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`responseTime\` INT(11) NOT NULL,
    \`statusCode\` INT(11) NOT NULL,
    \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`),
    KEY \`idx_endpoint_timestamp\` (\`endpoint\`, \`timestamp\`),
    KEY \`idx_method\` (\`method\`),
    KEY \`idx_statusCode\` (\`statusCode\`)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
];

async function runMigration() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    console.log(`   Host: ${dbConfig.host}`);
    console.log(`   Database: ${dbConfig.database}`);
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database successfully!\n');

    console.log('🚀 Starting database migration...\n');

    for (let i = 0; i < migrations.length; i++) {
      try {
        console.log(`[${i + 1}/${migrations.length}] Running migration...`);
        await connection.query(migrations[i]);
        console.log(`✅ Migration ${i + 1} completed\n`);
      } catch (error) {
        // If table/column already exists, that's okay
        if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DUP_KEYNAME') {
          console.log(`⚠️  Migration ${i + 1} skipped (already exists)\n`);
        } else {
          console.error(`❌ Error in migration ${i + 1}:`, error.message);
          throw error;
        }
      }
    }

    // Verify tables
    console.log('📊 Verifying tables...');
    const [tables] = await connection.query(`
      SELECT 
        TABLE_NAME as 'Table Name',
        TABLE_ROWS as 'Rows',
        CREATE_TIME as 'Created'
      FROM 
        INFORMATION_SCHEMA.TABLES 
      WHERE 
        TABLE_SCHEMA = ?
        AND TABLE_NAME IN ('users', 'properties', 'appointments', 'saved_properties', 'notifications', 'forms', 'news', 'plots', 'settings', 'stats')
      ORDER BY 
        TABLE_NAME
    `, [dbConfig.database]);

    console.table(tables);
    console.log('\n✅ Database migration completed successfully!');
    console.log('🎉 All tables are ready for use.\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed.');
    }
  }
}

// Run migration
runMigration();

