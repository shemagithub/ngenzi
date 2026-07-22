import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function addFrontImageColumn() {
    let connection;
    
    try {
        console.log('🔄 Starting database migration: Adding frontImage column...\n');
        
        // Create connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'buildestate',
            port: parseInt(process.env.DB_PORT || '3306')
        });
        
        console.log('✅ Connected to database');
        
        // Check if column already exists
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? 
            AND TABLE_NAME = 'properties' 
            AND COLUMN_NAME = 'frontImage'
        `, [process.env.DB_NAME || 'buildestate']);
        
        if (columns.length > 0) {
            console.log('ℹ️  frontImage column already exists. Skipping migration.');
            return;
        }
        
        // Add frontImage column
        console.log('📝 Adding frontImage column to properties table...');
        await connection.execute(`
            ALTER TABLE properties 
            ADD COLUMN frontImage VARCHAR(500) NULL 
            AFTER price
        `);
        
        console.log('✅ Successfully added frontImage column to properties table');
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

// Run migration
addFrontImageColumn();

