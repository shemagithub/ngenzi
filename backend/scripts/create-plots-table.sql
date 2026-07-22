-- ============================================
-- PLOTS TABLE - Create Separate Plots Table
-- ============================================
-- This script creates a dedicated plots table for better organization
-- Plots have different characteristics than properties (no beds/baths)
-- ============================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================
-- PLOTS TABLE
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
-- VERIFY TABLE CREATED
-- ============================================
-- Simple verification - just show success message
-- You can verify manually with: SHOW TABLES LIKE 'plots';
-- Or: DESCRIBE plots;

SELECT '✅ Plots table created successfully!' as Status;

