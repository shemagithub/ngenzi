-- ============================================
-- Create Admin User Script
-- ============================================
-- This script creates an admin user in the database
-- Run this after creating the database tables

USE buildestate;

-- Add role column if it doesn't exist (for existing databases)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role ENUM('user', 'admin') NOT NULL DEFAULT 'user' AFTER resetTokenExpire;

-- Create index on role if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_role ON users(role);

-- Insert Admin User
-- Default Credentials:
-- Email: admin@buildestate.com
-- Password: Admin@123
-- 
-- To change the password, generate a new hash using:
-- node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourPassword', 10).then(hash => console.log(hash));"
INSERT INTO users (name, email, password, role, createdAt, updatedAt) 
VALUES 
(
    'Admin User',
    'admin@buildestate.com',
    '$2a$10$tzq9R7Exk7PE8U6e9x.JHO0XJyneW4gJx84fSzR0xA19QotAiwxOO',
    'admin',
    NOW(),
    NOW()
)
ON DUPLICATE KEY UPDATE 
    role = 'admin',
    password = '$2a$10$tzq9R7Exk7PE8U6e9x.JHO0XJyneW4gJx84fSzR0xA19QotAiwxOO',
    updatedAt = NOW();

-- Verify admin user was created
SELECT id, name, email, role, createdAt FROM users WHERE role = 'admin';

