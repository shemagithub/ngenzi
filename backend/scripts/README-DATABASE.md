# Database Migration Scripts

This directory contains SQL scripts and Node.js migration tools to set up and update your database for the NGENZI REALESTATE backend.

## Available Scripts

### 1. `setup-database.sql` (Recommended for New Databases)
Complete database setup script. Safe to run multiple times.
- Creates all required tables
- Sets up foreign keys and indexes
- Includes all columns needed by the backend

**Usage:**
```bash
# Option 1: Using MySQL command line
mysql -u your_username -p your_database_name < scripts/setup-database.sql

# Option 2: Using MySQL Workbench or phpMyAdmin
# Copy and paste the contents of setup-database.sql into the SQL editor and execute
```

### 2. `run-migration.js` (Recommended for Existing Databases)
Node.js script that safely handles migrations, including adding missing columns.

**Usage:**
```bash
# Make sure you're in the backend directory
cd backend

# Run the migration
npm run migrate

# Or directly:
node scripts/run-migration.js
```

**Requirements:**
- Node.js installed
- `.env` file configured with database credentials:
  ```
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=your_password
  DB_NAME=your_database_name
  ```

### 3. `database-migration.sql`
Comprehensive migration script with detailed comments. Use this if you need more control.

### 4. `database-update.sql`
Update script for existing databases. Adds missing columns and updates table structures.

## Database Tables Created

The scripts create the following tables:

1. **users** - User accounts (admin and regular users)
2. **properties** - Property listings (houses, apartments, plots, etc.)
3. **appointments** - Property viewing appointments
4. **saved_properties** - User favorite/saved properties
5. **notifications** - User notifications
6. **forms** - Contact form submissions
7. **news** - Newsletter email subscriptions
8. **stats** - API usage statistics

## Important Notes

### For Existing Databases

If you already have a database with some tables:

1. **Backup your database first!**
   ```bash
   mysqldump -u your_username -p your_database_name > backup.sql
   ```

2. Use `run-migration.js` (recommended) as it handles existing tables gracefully:
   ```bash
   npm run migrate
   ```

3. Or manually add missing columns:
   - The `frontImage` column in the `properties` table
   - Any missing columns in the `appointments` table
   - The `saved_properties` and `notifications` tables if they don't exist

### Foreign Keys

The scripts set up foreign key constraints:
- `appointments.userId` → `users.id`
- `appointments.propertyId` → `properties.id`
- `saved_properties.userId` → `users.id`
- `saved_properties.propertyId` → `properties.id`
- `notifications.userId` → `users.id`

All foreign keys use `ON DELETE CASCADE` to maintain referential integrity.

### JSON Columns

The following columns use JSON data type (MySQL 5.7.8+):
- `properties.image` - Array of image URLs
- `properties.amenities` - Array of amenity strings
- `appointments.feedback` - JSON object for feedback data
- `notifications.metadata` - JSON object for additional data

## Troubleshooting

### Error: "Column already exists"
This is normal if you're running the script multiple times. The script uses `CREATE TABLE IF NOT EXISTS` which is safe.

### Error: "Foreign key constraint fails"
Make sure:
1. The `users` table exists before creating `appointments`, `saved_properties`, or `notifications`
2. The `properties` table exists before creating `appointments` or `saved_properties`
3. You're not trying to insert data that violates foreign key constraints

### Error: "Unknown column 'frontImage'"
Run the migration script or manually add the column:
```sql
ALTER TABLE `properties` ADD COLUMN `frontImage` VARCHAR(500) DEFAULT NULL AFTER `price`;
```

### Error: "Table doesn't exist"
Make sure you're connected to the correct database and run `setup-database.sql` first.

## Verification

After running the migration, verify all tables exist:

```sql
SHOW TABLES;
```

You should see:
- users
- properties
- appointments
- saved_properties
- notifications
- forms
- news
- stats

Check table structure:
```sql
DESCRIBE properties;
DESCRIBE appointments;
DESCRIBE saved_properties;
DESCRIBE notifications;
```

## Support

If you encounter any issues:
1. Check that your MySQL version is 5.7.8 or higher (for JSON support)
2. Ensure your database user has CREATE, ALTER, and INDEX privileges
3. Verify your `.env` file has correct database credentials
4. Check the console output for specific error messages

