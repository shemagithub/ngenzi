-- ============================================
-- BuildEstate Real Estate Platform Database
-- MySQL Database Schema
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS buildestate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE buildestate;

-- ============================================
-- Table: users
-- Stores user account information
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    resetToken VARCHAR(255) NULL,
    resetTokenExpire DATETIME NULL,
    role ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: properties
-- Stores property listings
-- ============================================
CREATE TABLE IF NOT EXISTS properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    frontImage VARCHAR(500) NULL,
    image JSON NOT NULL DEFAULT ('[]'),
    beds INT NOT NULL,
    baths INT NOT NULL,
    sqft INT NOT NULL,
    type VARCHAR(100) NOT NULL,
    availability VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    amenities JSON NOT NULL DEFAULT ('[]'),
    phone VARCHAR(50) NOT NULL DEFAULT 'N/A',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_location (location),
    INDEX idx_type (type),
    INDEX idx_availability (availability),
    INDEX idx_price (price),
    INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: appointments
-- Stores property viewing appointments
-- ============================================
CREATE TABLE IF NOT EXISTS appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    propertyId INT NOT NULL,
    userId INT NOT NULL,
    date DATETIME NOT NULL,
    time VARCHAR(50) NOT NULL,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
    meetingLink VARCHAR(500) NULL,
    meetingPlatform ENUM('zoom', 'google-meet', 'teams', 'other') NOT NULL DEFAULT 'other',
    notes TEXT NULL,
    cancelReason TEXT NULL,
    reminderSent BOOLEAN NOT NULL DEFAULT FALSE,
    feedback JSON NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_userId_date (userId, date),
    INDEX idx_propertyId_date (propertyId, date),
    INDEX idx_status (status),
    INDEX idx_date (date),
    INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: forms
-- Stores contact form submissions
-- ============================================
CREATE TABLE IF NOT EXISTS forms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NULL,
    message TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: news
-- Stores newsletter subscriptions
-- ============================================
CREATE TABLE IF NOT EXISTS news (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: stats
-- Stores API statistics and analytics
-- ============================================
CREATE TABLE IF NOT EXISTS stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    endpoint VARCHAR(500) NOT NULL,
    method ENUM('GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD') NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responseTime INT NOT NULL,
    statusCode INT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_endpoint_timestamp (endpoint, timestamp),
    INDEX idx_method (method),
    INDEX idx_statusCode (statusCode),
    INDEX idx_timestamp (timestamp),
    INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Sample Data (Optional - for testing)
-- ============================================

-- Insert Admin User
-- Password: Admin@123 (hashed with bcrypt)
-- Email: admin@buildestate.com
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@buildestate.com', '$2a$10$tzq9R7Exk7PE8U6e9x.JHO0XJyneW4gJx84fSzR0xA19QotAiwxOO', 'admin')
ON DUPLICATE KEY UPDATE role='admin', password='$2a$10$tzq9R7Exk7PE8U6e9x.JHO0XJyneW4gJx84fSzR0xA19QotAiwxOO';

-- Insert sample user (password is hashed 'password123' using bcrypt)
-- INSERT INTO users (name, email, password) VALUES 
-- ('John Doe', 'john@example.com', '$2a$10$rOzJqJqJqJqJqJqJqJqJqO');

-- Insert sample property
-- INSERT INTO properties (title, location, price, image, beds, baths, sqft, type, availability, description, amenities, phone) VALUES
-- ('Modern Apartment', 'New York, NY', 250000.00, '["https://example.com/image1.jpg"]', 2, 2, 1200, 'Apartment', 'Available', 'Beautiful modern apartment in the heart of the city.', '["Parking", "Gym", "Pool"]', '+1234567890');

-- ============================================
-- Views (Optional - for common queries)
-- ============================================

-- View: Active Appointments
CREATE OR REPLACE VIEW active_appointments AS
SELECT 
    a.id,
    a.date,
    a.time,
    a.status,
    u.name AS user_name,
    u.email AS user_email,
    p.title AS property_title,
    p.location AS property_location
FROM appointments a
INNER JOIN users u ON a.userId = u.id
INNER JOIN properties p ON a.propertyId = p.id
WHERE a.status IN ('pending', 'confirmed')
ORDER BY a.date ASC;

-- View: Property Statistics
CREATE OR REPLACE VIEW property_stats AS
SELECT 
    p.id,
    p.title,
    p.location,
    p.price,
    COUNT(a.id) AS total_appointments,
    COUNT(CASE WHEN a.status = 'pending' THEN 1 END) AS pending_appointments,
    COUNT(CASE WHEN a.status = 'confirmed' THEN 1 END) AS confirmed_appointments
FROM properties p
LEFT JOIN appointments a ON p.id = a.propertyId
GROUP BY p.id, p.title, p.location, p.price;

-- ============================================
-- End of Schema
-- ============================================

