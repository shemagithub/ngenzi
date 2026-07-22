# Database Update Scripts

This directory contains scripts to update your database schema to match the current models.

## Available Scripts

### 1. Update Database Schema
**File:** `update-database.js`

Updates the database schema (tables, columns, indexes) to match current models.

**Usage:**
```bash
# From backend directory
npm run update-database

# Or directly
node scripts/update-database.js
```

### 2. Fix Database Data (NEW!)
**File:** `fix-database-data.js`

Fixes existing data in the database (invalid JSON, missing values, wrong data types).

**Usage:**
```bash
# From backend directory
npm run fix-database-data

# Or directly
node scripts/fix-database-data.js
```

**What it fixes:**
- ✅ Invalid JSON in `image` and `amenities` fields
- ✅ Missing or null `phone` values
- ✅ Wrong data types (strings instead of numbers)
- ✅ Empty or invalid string fields
- ✅ Invalid image URLs
- ✅ Empty amenities arrays

### 3. Node.js Script (Recommended)
**File:** `update-database.js`

The most flexible and cross-platform option. Uses Sequelize to connect and update the database.

**Features:**
- ✅ Cross-platform (Windows, Linux, macOS)
- ✅ Uses existing database connection configuration
- ✅ Automatic error handling
- ✅ Verifies database structure after update
- ✅ Handles existing columns/indexes gracefully

### 4. Shell Script (Linux/macOS)
**File:** `update-database.sh`

For Linux and macOS users who prefer shell scripts.

**Usage:**
```bash
# Make executable (first time only)
chmod +x scripts/update-database.sh

# Run the script
./scripts/update-database.sh
```

**Features:**
- ✅ Direct MySQL client usage
- ✅ Interactive password prompt
- ✅ Table verification
- ✅ Color-coded output

### 5. Batch Script (Windows)
**File:** `update-database.bat`

For Windows users who prefer batch scripts.

**Usage:**
```bash
# From backend directory
scripts\update-database.bat
```

**Features:**
- ✅ Windows-native script
- ✅ Interactive password prompt
- ✅ Table verification
- ✅ Error handling

## Quick Start

**For new installations:**
```bash
npm run update-database    # Update schema
npm run fix-database-data  # Fix existing data (if any)
```

**For existing databases:**
```bash
npm run update-database    # Update schema first
npm run fix-database-data  # Then fix any data issues
```

## What the Scripts Do

### Update Database Schema (`update-database.js`)

The update scripts perform the following operations:

1. **Properties Table Updates:**
   - Increase `phone` field from `VARCHAR(20)` to `VARCHAR(50)`
   - Add default value `'N/A'` to `phone` field
   - Add index on `createdAt` for better performance

2. **Appointments Table Updates:**
   - Add index on `createdAt` for better performance

3. **Stats Table Updates:**
   - Add index on `createdAt` for better performance

4. **Users Table Updates:**
   - Ensure `role` column exists with ENUM('user', 'admin')
   - Add index on `role` for better performance

5. **JSON Fields:**
   - Ensure `properties.image` has default `[]`
   - Ensure `properties.amenities` has default `[]`

### Fix Database Data (`fix-database-data.js`)

The fix script performs the following operations on existing data:

1. **Properties Table Data:**
   - Fixes invalid JSON in `image` field (converts strings to arrays)
   - Fixes invalid JSON in `amenities` field (converts strings to arrays)
   - Sets default `'N/A'` for missing/null `phone` values
   - Converts string numbers to actual numbers (price, beds, baths, sqft)
   - Filters out invalid image URLs
   - Removes empty amenities
   - Sets defaults for missing required fields

2. **Data Validation:**
   - Ensures all numeric fields are numbers
   - Ensures all JSON fields are arrays
   - Ensures all string fields are not null/empty
   - Validates image URLs format

3. **Verification:**
   - Checks all properties after fixes
   - Reports any remaining issues
   - Shows database statistics

## Prerequisites

1. **Node.js Script:**
   - Node.js installed
   - Database credentials in `.env` file
   - All npm dependencies installed

2. **Shell/Batch Scripts:**
   - MySQL client installed and in PATH
   - Database credentials (can be in `.env` or entered interactively)

## Environment Variables

Make sure your `.env` file contains:

```env
DB_NAME=buildestate
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306
```

## Safety Features

- ✅ **Idempotent:** Can be run multiple times safely
- ✅ **Error Handling:** Gracefully handles existing columns/indexes
- ✅ **Verification:** Verifies database structure after update
- ✅ **Backup Recommended:** Always backup your database before running updates

## Troubleshooting

### Error: "Database credentials not found"
- Make sure your `.env` file exists in the `backend` directory
- Check that all required environment variables are set

### Error: "Connection refused"
- Verify MySQL server is running
- Check database host and port settings
- Verify database user has proper permissions

### Error: "Table doesn't exist"
- Run the full `database.sql` script first to create all tables
- Then run the update script

### Error: "Duplicate column/index"
- This is normal if the update has already been applied
- The script handles this gracefully and continues

## Manual Update

If scripts don't work, you can manually run SQL:

```bash
mysql -u your_username -p buildestate < database-update.sql
```

## Verification

After running the update, verify the changes:

```sql
USE buildestate;

-- Check properties table
DESCRIBE properties;

-- Check indexes
SHOW INDEXES FROM properties;
SHOW INDEXES FROM appointments;
SHOW INDEXES FROM stats;
SHOW INDEXES FROM users;
```

## Support

If you encounter issues:
1. Check the error messages in the console
2. Verify your database connection
3. Ensure you have proper permissions
4. Review the migration guide: `../database-migration-guide.md`

