-- ============================================
-- NGENZI REALESTATE Database Update Script
-- ============================================
-- This script updates existing database tables to match backend requirements
-- Use this if you already have tables and need to add missing columns/constraints
-- ============================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================
-- UPDATE PROPERTIES TABLE
-- ============================================

-- Add frontImage column if it doesn't exist
ALTER TABLE `properties` 
  ADD COLUMN IF NOT EXISTS `frontImage` VARCHAR(500) DEFAULT NULL AFTER `price`;

-- Ensure image column is JSON type
ALTER TABLE `properties` 
  MODIFY COLUMN `image` JSON NOT NULL DEFAULT ('[]');

-- Ensure amenities column is JSON type
ALTER TABLE `properties` 
  MODIFY COLUMN `amenities` JSON NOT NULL DEFAULT ('[]');

-- ============================================
-- UPDATE USERS TABLE
-- ============================================

-- Ensure role column exists with correct ENUM values
ALTER TABLE `users` 
  MODIFY COLUMN `role` ENUM('user', 'admin') DEFAULT 'user';

-- ============================================
-- UPDATE APPOINTMENTS TABLE
-- ============================================

-- Ensure status column has correct ENUM values
ALTER TABLE `appointments` 
  MODIFY COLUMN `status` ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending';

-- Ensure meetingPlatform column has correct ENUM values
ALTER TABLE `appointments` 
  MODIFY COLUMN `meetingPlatform` ENUM('zoom', 'google-meet', 'teams', 'other') DEFAULT 'other';

-- Add meetingLink if it doesn't exist
ALTER TABLE `appointments` 
  ADD COLUMN IF NOT EXISTS `meetingLink` VARCHAR(500) DEFAULT NULL AFTER `status`;

-- Add meetingPlatform if it doesn't exist
ALTER TABLE `appointments` 
  ADD COLUMN IF NOT EXISTS `meetingPlatform` ENUM('zoom', 'google-meet', 'teams', 'other') DEFAULT 'other' AFTER `meetingLink`;

-- Add notes if it doesn't exist
ALTER TABLE `appointments` 
  ADD COLUMN IF NOT EXISTS `notes` TEXT DEFAULT NULL AFTER `meetingPlatform`;

-- Add cancelReason if it doesn't exist
ALTER TABLE `appointments` 
  ADD COLUMN IF NOT EXISTS `cancelReason` TEXT DEFAULT NULL AFTER `notes`;

-- Add reminderSent if it doesn't exist
ALTER TABLE `appointments` 
  ADD COLUMN IF NOT EXISTS `reminderSent` BOOLEAN DEFAULT FALSE AFTER `cancelReason`;

-- Add feedback if it doesn't exist
ALTER TABLE `appointments` 
  ADD COLUMN IF NOT EXISTS `feedback` JSON DEFAULT NULL AFTER `reminderSent`;

-- ============================================
-- UPDATE NOTIFICATIONS TABLE
-- ============================================

-- Ensure type column has correct ENUM values
ALTER TABLE `notifications` 
  MODIFY COLUMN `type` ENUM('info', 'success', 'warning', 'error', 'appointment', 'property', 'system') DEFAULT 'info';

-- Add link if it doesn't exist
ALTER TABLE `notifications` 
  ADD COLUMN IF NOT EXISTS `link` VARCHAR(500) DEFAULT NULL AFTER `isRead`;

-- Add metadata if it doesn't exist
ALTER TABLE `notifications` 
  ADD COLUMN IF NOT EXISTS `metadata` JSON DEFAULT NULL AFTER `link`;

-- ============================================
-- CREATE MISSING TABLES (if they don't exist)
-- ============================================

-- Create saved_properties table if it doesn't exist
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

-- Create notifications table if it doesn't exist
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

-- Create stats table if it doesn't exist
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

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- VERIFY UPDATES
-- ============================================
SELECT 'Database update completed successfully!' as Status;

