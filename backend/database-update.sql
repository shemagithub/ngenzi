-- ============================================
-- BuildEstate Database Update Script
-- Updates existing database to match current models
-- Run this if you already have a database
-- ============================================

USE buildestate;

-- ============================================
-- Update properties table
-- ============================================
-- Increase phone field length and add default
-- Note: This will fail if column doesn't exist, which is fine
ALTER TABLE properties 
MODIFY COLUMN phone VARCHAR(50) NOT NULL DEFAULT 'N/A';

-- Add index on createdAt (will fail silently if exists)
SET @exist := (SELECT COUNT(*) FROM information_schema.statistics 
               WHERE table_schema = 'buildestate' 
               AND table_name = 'properties' 
               AND index_name = 'idx_createdAt');
SET @sqlstmt := IF(@exist = 0, 'CREATE INDEX idx_createdAt ON properties(createdAt)', 'SELECT "Index already exists"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Update appointments table
-- ============================================
-- Add index on createdAt (will fail silently if exists)
SET @exist := (SELECT COUNT(*) FROM information_schema.statistics 
               WHERE table_schema = 'buildestate' 
               AND table_name = 'appointments' 
               AND index_name = 'idx_createdAt');
SET @sqlstmt := IF(@exist = 0, 'CREATE INDEX idx_createdAt ON appointments(createdAt)', 'SELECT "Index already exists"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Update stats table
-- ============================================
-- Add index on createdAt (will fail silently if exists)
SET @exist := (SELECT COUNT(*) FROM information_schema.statistics 
               WHERE table_schema = 'buildestate' 
               AND table_name = 'stats' 
               AND index_name = 'idx_createdAt');
SET @sqlstmt := IF(@exist = 0, 'CREATE INDEX idx_createdAt ON stats(createdAt)', 'SELECT "Index already exists"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Update users table (if role column doesn't exist)
-- ============================================
-- Check if role column exists, if not add it
SET @exist := (SELECT COUNT(*) FROM information_schema.columns 
               WHERE table_schema = 'buildestate' 
               AND table_name = 'users' 
               AND column_name = 'role');
SET @sqlstmt := IF(@exist = 0, 
    'ALTER TABLE users ADD COLUMN role ENUM(''user'', ''admin'') NOT NULL DEFAULT ''user'' AFTER resetTokenExpire', 
    'SELECT "Column already exists"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add index on role (will fail silently if exists)
SET @exist := (SELECT COUNT(*) FROM information_schema.statistics 
               WHERE table_schema = 'buildestate' 
               AND table_name = 'users' 
               AND index_name = 'idx_role');
SET @sqlstmt := IF(@exist = 0, 'CREATE INDEX idx_role ON users(role)', 'SELECT "Index already exists"');
PREPARE stmt FROM @sqlstmt;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- Ensure all JSON fields have proper defaults
-- ============================================
-- Update properties image field default
ALTER TABLE properties 
MODIFY COLUMN image JSON NOT NULL DEFAULT ('[]');

-- Update properties amenities field default
ALTER TABLE properties 
MODIFY COLUMN amenities JSON NOT NULL DEFAULT ('[]');

-- ============================================
-- Verify table structures
-- ============================================
-- Check properties table
DESCRIBE properties;

-- Check appointments table
DESCRIBE appointments;

-- Check users table
DESCRIBE users;

-- Check stats table
DESCRIBE stats;

-- ============================================
-- End of Update Script
-- ============================================

