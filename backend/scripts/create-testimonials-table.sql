-- Create testimonials table
CREATE TABLE IF NOT EXISTS `testimonials` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `position` VARCHAR(255) NULL,
  `company` VARCHAR(255) NULL,
  `content` TEXT NOT NULL,
  `rating` INT DEFAULT 5,
  `image` VARCHAR(500) NULL,
  `order` INT DEFAULT 0,
  `isActive` BOOLEAN DEFAULT TRUE,
  `isFeatured` BOOLEAN DEFAULT FALSE,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_isActive` (`isActive`),
  INDEX `idx_isFeatured` (`isFeatured`),
  INDEX `idx_order` (`order`),
  CHECK (`rating` >= 1 AND `rating` <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;










