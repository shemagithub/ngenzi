-- ============================================
-- UPDATE PLOTS TABLE - Fix Structure and Auto-Increment
-- ============================================
-- This script updates the plots table to ensure it has the correct structure
-- and that auto-increment is working properly
-- ============================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================
-- STEP 1: Check if table exists, if not create it
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

-- Add areaUnit if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = 'plots';
SET @columnname = 'areaUnit';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
    'SELECT 1',
    CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(20) DEFAULT ''sqft'' COMMENT ''Unit for area (sqft, sqm, acres)''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add plotNumber if it doesn't exist
SET @columnname = 'plotNumber';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
    'SELECT 1',
    CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(100) DEFAULT NULL COMMENT ''Survey/Plot number''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add surveyNumber if it doesn't exist
SET @columnname = 'surveyNumber';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
    'SELECT 1',
    CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(100) DEFAULT NULL COMMENT ''Survey number''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add facing if it doesn't exist
SET @columnname = 'facing';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
    'SELECT 1',
    CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' VARCHAR(50) DEFAULT NULL COMMENT ''Plot facing direction (North, South, East, West)''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add cornerPlot if it doesn't exist
SET @columnname = 'cornerPlot';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
    'SELECT 1',
    CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' BOOLEAN DEFAULT FALSE COMMENT ''Whether it is a corner plot''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add approvedLayout if it doesn't exist
SET @columnname = 'approvedLayout';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
    'SELECT 1',
    CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' BOOLEAN DEFAULT FALSE COMMENT ''Whether layout is approved''')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- ============================================
-- STEP 3: Ensure AUTO_INCREMENT is set correctly
-- ============================================
-- Get the maximum ID and set AUTO_INCREMENT to the next value
SET @max_id = (SELECT COALESCE(MAX(id), 0) FROM plots);
SET @sql = CONCAT('ALTER TABLE plots AUTO_INCREMENT = ', @max_id + 1);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- STEP 4: Ensure PRIMARY KEY is set
-- ============================================
-- Check if primary key exists, if not add it
SET @pk_exists = (SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
  WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND CONSTRAINT_TYPE = 'PRIMARY KEY');

SET @sql = IF(@pk_exists = 0,
  'ALTER TABLE plots ADD PRIMARY KEY (id)',
  'SELECT "Primary key already exists" as Status'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- STEP 5: Ensure indexes exist
-- ============================================
CREATE INDEX IF NOT EXISTS `idx_location` ON `plots` (`location`);
CREATE INDEX IF NOT EXISTS `idx_type` ON `plots` (`type`);
CREATE INDEX IF NOT EXISTS `idx_availability` ON `plots` (`availability`);
CREATE INDEX IF NOT EXISTS `idx_price` ON `plots` (`price`);
CREATE INDEX IF NOT EXISTS `idx_area` ON `plots` (`area`);
CREATE INDEX IF NOT EXISTS `idx_createdAt` ON `plots` (`createdAt`);

-- ============================================
-- STEP 6: Verify table structure
-- ============================================
SELECT '✅ Plots table updated successfully!' as Status;
SELECT 'Table structure:' as Info;
DESCRIBE plots;

-- ============================================
-- STEP 7: Show current AUTO_INCREMENT value
-- ============================================
SELECT 
  TABLE_NAME,
  AUTO_INCREMENT
FROM 
  INFORMATION_SCHEMA.TABLES
WHERE 
  TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'plots';

