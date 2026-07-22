-- ============================================
-- NGENZI REALESTATE - Complete Database Setup
-- ============================================
-- Run this SQL script in your MySQL database to set up all required tables
-- This script is safe to run multiple times (uses CREATE TABLE IF NOT EXISTS)
-- ============================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ============================================
-- 1. USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `resetToken` VARCHAR(255) DEFAULT NULL,
  `resetTokenExpire` DATETIME DEFAULT NULL,
  `role` ENUM('user', 'admin') DEFAULT 'user',
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. PROPERTIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `properties` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(255) NOT NULL,
  `location` VARCHAR(255) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `frontImage` VARCHAR(500) DEFAULT NULL,
  `image` JSON NOT NULL DEFAULT ('[]'),
  `beds` INT(11) NOT NULL,
  `baths` INT(11) NOT NULL,
  `sqft` INT(11) NOT NULL,
  `type` VARCHAR(255) NOT NULL,
  `availability` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `amenities` JSON NOT NULL DEFAULT ('[]'),
  `phone` VARCHAR(255) NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_location` (`location`),
  KEY `idx_availability` (`availability`),
  KEY `idx_price` (`price`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. APPOINTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `appointments` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `propertyId` INT(11) NOT NULL,
  `userId` INT(11) NOT NULL,
  `date` DATETIME NOT NULL,
  `time` VARCHAR(255) NOT NULL,
  `status` ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
  `meetingLink` VARCHAR(500) DEFAULT NULL,
  `meetingPlatform` ENUM('zoom', 'google-meet', 'teams', 'other') DEFAULT 'other',
  `notes` TEXT DEFAULT NULL,
  `cancelReason` TEXT DEFAULT NULL,
  `reminderSent` BOOLEAN DEFAULT FALSE,
  `feedback` JSON DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_userId_date` (`userId`, `date`),
  KEY `idx_propertyId_date` (`propertyId`, `date`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_appointments_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_appointments_property` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. SAVED PROPERTIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `saved_properties` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `userId` INT(11) NOT NULL,
  `propertyId` INT(11) NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_property` (`userId`, `propertyId`),
  CONSTRAINT `fk_saved_properties_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_saved_properties_property` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `userId` INT(11) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('info', 'success', 'warning', 'error', 'appointment', 'property', 'system') DEFAULT 'info',
  `isRead` BOOLEAN DEFAULT FALSE,
  `link` VARCHAR(500) DEFAULT NULL,
  `metadata` JSON DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_userId_isRead` (`userId`, `isRead`),
  KEY `idx_userId_createdAt` (`userId`, `createdAt`),
  KEY `idx_type` (`type`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. FORMS TABLE (Contact Forms)
-- ============================================
CREATE TABLE IF NOT EXISTS `forms` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(255) DEFAULT NULL,
  `message` TEXT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. NEWS TABLE (Newsletter Subscriptions)
-- ============================================
CREATE TABLE IF NOT EXISTS `news` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. PLOTS TABLE
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
-- 9. SETTINGS TABLE (Company Settings)
-- ============================================
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `companyName` VARCHAR(255) NOT NULL DEFAULT 'NGENZI REALESTATE',
  `companyLogo` VARCHAR(500) DEFAULT NULL,
  `companyEmail` VARCHAR(255) NOT NULL DEFAULT 'support@ngenzirealestate.com',
  `companyPhone` VARCHAR(50) DEFAULT NULL,
  `companyAddress` TEXT DEFAULT NULL,
  `facebook` VARCHAR(500) DEFAULT NULL,
  `twitter` VARCHAR(500) DEFAULT NULL,
  `instagram` VARCHAR(500) DEFAULT NULL,
  `linkedin` VARCHAR(500) DEFAULT NULL,
  `youtube` VARCHAR(500) DEFAULT NULL,
  `whatsapp` VARCHAR(50) DEFAULT NULL,
  `websiteUrl` VARCHAR(500) DEFAULT NULL,
  `currency` VARCHAR(10) DEFAULT 'RWF',
  `timezone` VARCHAR(50) DEFAULT 'Africa/Kigali',
  `metaTitle` VARCHAR(255) DEFAULT NULL,
  `metaDescription` TEXT DEFAULT NULL,
  `metaKeywords` TEXT DEFAULT NULL,
  `aboutUs` TEXT DEFAULT NULL,
  `termsAndConditions` TEXT DEFAULT NULL,
  `privacyPolicy` TEXT DEFAULT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings if table is empty
INSERT INTO `settings` (`companyName`, `companyEmail`) 
SELECT 'NGENZI REALESTATE', 'support@ngenzirealestate.com'
WHERE NOT EXISTS (SELECT 1 FROM `settings`);

-- ============================================
-- 10. STATS TABLE (API Statistics)
-- ============================================
CREATE TABLE IF NOT EXISTS `stats` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `endpoint` VARCHAR(255) NOT NULL,
  `method` ENUM('GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD') NOT NULL,
  `timestamp` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `responseTime` INT(11) NOT NULL,
  `statusCode` INT(11) NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_endpoint_timestamp` (`endpoint`, `timestamp`),
  KEY `idx_method` (`method`),
  KEY `idx_statusCode` (`statusCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ADD MISSING COLUMNS (Safe to run multiple times)
-- ============================================

-- Add frontImage to properties if it doesn't exist
-- Note: Run this separately if you get an error about column existing
-- ALTER TABLE `properties` ADD COLUMN `frontImage` VARCHAR(500) DEFAULT NULL AFTER `price`;

-- ============================================
-- VERIFY TABLES
-- ============================================
SELECT 
  TABLE_NAME as 'Table Name',
  TABLE_ROWS as 'Rows',
  CREATE_TIME as 'Created'
FROM 
  INFORMATION_SCHEMA.TABLES 
WHERE 
  TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME IN ('users', 'properties', 'appointments', 'saved_properties', 'notifications', 'forms', 'news', 'plots', 'stats')
ORDER BY 
  TABLE_NAME;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '✅ Database setup completed successfully!' as Status;

