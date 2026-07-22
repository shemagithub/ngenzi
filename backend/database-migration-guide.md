# Database Migration Guide

This guide helps you update your existing database to match the current models and requirements.

## Quick Update (Recommended)

If you already have a database running, use the update script:

```bash
mysql -u your_username -p buildestate < database-update.sql
```

## Full Database Recreation

If you want to start fresh or the update script doesn't work:

```bash
mysql -u your_username -p < database.sql
```

## Manual Updates

If you prefer to update manually, here are the key changes:

### 1. Properties Table
- Increase `phone` field from `VARCHAR(20)` to `VARCHAR(50)`
- Add default value `'N/A'` to `phone` field
- Add index on `createdAt` for better query performance

### 2. Appointments Table
- Add index on `createdAt` for better query performance

### 3. Stats Table
- Add index on `createdAt` for better query performance

### 4. Users Table
- Ensure `role` column exists with ENUM('user', 'admin')
- Add index on `role` for better query performance

## Verification

After running updates, verify the structure:

```sql
USE buildestate;

-- Check properties table
DESCRIBE properties;

-- Check appointments table
DESCRIBE appointments;

-- Check users table
DESCRIBE users;

-- Check stats table
DESCRIBE stats;
```

## Important Notes

1. **Backup First**: Always backup your database before running migration scripts
2. **Test Environment**: Test migrations in a development environment first
3. **Data Preservation**: The update script preserves existing data
4. **Index Creation**: Indexes are created conditionally to avoid errors

## Troubleshooting

### Error: Column already exists
- This is normal if the column already exists. The script handles this.

### Error: Index already exists
- This is normal if the index already exists. The script handles this.

### Error: Table doesn't exist
- Run the full `database.sql` script first to create all tables.

## Support

If you encounter issues, check:
1. MySQL version (should be 5.7+ or 8.0+)
2. User permissions (need ALTER, CREATE INDEX permissions)
3. Database connection

