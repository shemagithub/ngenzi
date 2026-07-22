import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function createSavedPropertiesTable() {
    let connection;
    
    try {
        console.log('🔄 Creating saved_properties table...\n');
        
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'buildestate',
            port: parseInt(process.env.DB_PORT || '3306')
        });
        
        console.log('✅ Connected to database');
        
        // Check if table already exists
        const [tables] = await connection.execute(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'saved_properties'
        `, [process.env.DB_NAME || 'buildestate']);
        
        if (tables.length > 0) {
            console.log('ℹ️  saved_properties table already exists. Skipping creation.');
            return;
        }
        
        // Create saved_properties table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS saved_properties (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                propertyId INT NOT NULL,
                createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (propertyId) REFERENCES properties(id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_property (userId, propertyId),
                INDEX idx_userId (userId),
                INDEX idx_propertyId (propertyId)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        
        console.log('✅ Successfully created saved_properties table');
        console.log('\n✨ Migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

createSavedPropertiesTable();

