-- ============================================
-- CREATE OR UPDATE PLOTS TABLE
-- ============================================
-- This script creates the plots table if it doesn't exist,
-- or updates it if it does exist (adds missing columns)
-- ============================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================
-- STEP 1: Create table if it doesn't exist
-- ============================================
CREATE TABLE IF NOT EXISTS `plots` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `frontImage` VARCHAR(500) DEFAULT NULL,
  `image` JSON NOT NULL DEFAULT ('[]'),
  `area` DECIMAL(10, 2) NOT NULL COMMENT 'Plot area in square feet',
  `areaUnit` VARCHAR(20) DEFAULT 'sqft' COMMENT 'Unit for area (sqft, sqm, acres)',
  `type` VARCHAR(255) DEFAULT 'Plot' COMMENT 'Plot type (Residential, Commercial, Agricultural, etc.)',
  `availability` VARCHAR(255) NOT NULL COMMENT 'rent or buy',
  `description` TEXT NOT NULL,
  `amenities` JSON NOT NULL DEFAULT ('[]') COMMENT 'Plot amenities like Road Access, Electricity, etc.',
  `phone` VARCHAR(255) NOT NULL,
  `plotNumber` VARCHAR(100) DEFAULT NULL COMMENT 'Survey/Plot number',
  `surveyNumber` VARCHAR(100) DEFAULT NULL COMMENT 'Survey number',
  `facing` VARCHAR(50) DEFAULT NULL COMMENT 'Plot facing direction (North, South, East, West)',
  `cornerPlot` BOOLEAN DEFAULT FALSE COMMENT 'Whether it is a corner plot',
  `approvedLayout` BOOLEAN DEFAULT FALSE COMMENT 'Whether layout is approved',
  `youtubeUrl` VARCHAR(512) DEFAULT NULL COMMENT 'Optional YouTube embed/watch URL',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_location` (`location`),
  KEY `idx_type` (`type`),
  KEY `idx_availability` (`availability`),
  KEY `idx_price` (`price`),
  KEY `idx_area` (`area`),
  KEY `idx_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- STEP 2: Add missing columns if they don't exist
-- ============================================

-- Function to add column if it doesn't exist
DELIMITER $$

DROP PROCEDURE IF EXISTS AddColumnIfNotExists$$
CREATE PROCEDURE AddColumnIfNotExists(
    IN tableName VARCHAR(128),
    IN columnName VARCHAR(128),
    IN columnDefinition TEXT
)
BEGIN
    DECLARE column_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO column_exists
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = tableName
    AND COLUMN_NAME = columnName;
    
    IF column_exists = 0 THEN
        SET @sql = CONCAT('ALTER TABLE ', tableName, ' ADD COLUMN ', columnName, ' ', columnDefinition);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT('Added column: ', columnName) AS Result;
    ELSE
        SELECT CONCAT('Column already exists: ', columnName) AS Result;
    END IF;
END$$

DELIMITER ;

-- Add areaUnit if it doesn't exist
CALL AddColumnIfNotExists('plots', 'areaUnit', 'VARCHAR(20) DEFAULT ''sqft'' COMMENT ''Unit for area (sqft, sqm, acres)''');

-- Add plotNumber if it doesn't exist
CALL AddColumnIfNotExists('plots', 'plotNumber', 'VARCHAR(100) DEFAULT NULL COMMENT ''Survey/Plot number''');

-- Add surveyNumber if it doesn't exist
CALL AddColumnIfNotExists('plots', 'surveyNumber', 'VARCHAR(100) DEFAULT NULL COMMENT ''Survey number''');

-- Add facing if it doesn't exist
CALL AddColumnIfNotExists('plots', 'facing', 'VARCHAR(50) DEFAULT NULL COMMENT ''Plot facing direction (North, South, East, West)''');

-- Add cornerPlot if it doesn't exist
CALL AddColumnIfNotExists('plots', 'cornerPlot', 'BOOLEAN DEFAULT FALSE COMMENT ''Whether it is a corner plot''');

-- Add approvedLayout if it doesn't exist
CALL AddColumnIfNotExists('plots', 'approvedLayout', 'BOOLEAN DEFAULT FALSE COMMENT ''Whether layout is approved''');

-- Add youtubeUrl if it doesn't exist (required by API / Sequelize model)
CALL AddColumnIfNotExists('plots', 'youtubeUrl', 'VARCHAR(512) DEFAULT NULL COMMENT ''Optional YouTube embed/watch URL''');

-- Drop the procedure after use
DROP PROCEDURE IF EXISTS AddColumnIfNotExists;

-- ============================================
-- STEP 3: Ensure AUTO_INCREMENT is set correctly
-- ============================================
-- Fix AUTO_INCREMENT if needed
ALTER TABLE `plots` MODIFY `id` INT(11) NOT NULL AUTO_INCREMENT;

-- Reset AUTO_INCREMENT to next available value
SET @max_id = (SELECT COALESCE(MAX(id), 0) FROM plots);
SET @sql = CONCAT('ALTER TABLE plots AUTO_INCREMENT = ', @max_id + 1);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- STEP 4: Ensure indexes exist
-- ============================================
-- Create indexes only if they don't exist

DELIMITER $$

DROP PROCEDURE IF EXISTS CreateIndexIfNotExists$$
CREATE PROCEDURE CreateIndexIfNotExists(
    IN indexName VARCHAR(128),
    IN tableName VARCHAR(128),
    IN columnName VARCHAR(128)
)
BEGIN
    DECLARE index_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO index_exists
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = tableName
    AND INDEX_NAME = indexName;
    
    IF index_exists = 0 THEN
        SET @sql = CONCAT('CREATE INDEX ', indexName, ' ON ', tableName, ' (', columnName, ')');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
        SELECT CONCAT('Created index: ', indexName) AS Result;
    ELSE
        SELECT CONCAT('Index already exists: ', indexName) AS Result;
    END IF;
END$$

DELIMITER ;

-- Create indexes
CALL CreateIndexIfNotExists('idx_location', 'plots', 'location');
CALL CreateIndexIfNotExists('idx_type', 'plots', 'type');
CALL CreateIndexIfNotExists('idx_availability', 'plots', 'availability');
CALL CreateIndexIfNotExists('idx_price', 'plots', 'price');
CALL CreateIndexIfNotExists('idx_area', 'plots', 'area');
CALL CreateIndexIfNotExists('idx_createdAt', 'plots', 'createdAt');

-- Drop the procedure after use
DROP PROCEDURE IF EXISTS CreateIndexIfNotExists;

-- ============================================
-- STEP 5: Verify table structure
-- ============================================
SELECT '✅ Plots table created/updated successfully!' AS Status;
SELECT 'Table structure:' AS Info;
DESCRIBE plots;

-- ============================================
-- STEP 6: Show current AUTO_INCREMENT value
-- ============================================
SELECT 
  TABLE_NAME,
  AUTO_INCREMENT,
  TABLE_ROWS
FROM 
  INFORMATION_SCHEMA.TABLES
WHERE 
  TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'plots';

-- ============================================
-- STEP 7: Show table information
-- ============================================
SELECT 
  'Table Information' AS Info,
  COALESCE(COUNT(*), 0) AS TotalPlots
FROM plots;

