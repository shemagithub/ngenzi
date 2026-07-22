# Database Setup Guide

This guide will help you set up the MySQL database for the BuildEstate Real Estate Platform.

## Prerequisites

- MySQL 5.7+ or MariaDB 10.2+
- MySQL client or command-line access

## Quick Setup

### Option 1: Using SQL File

1. **Create the database and tables:**
   ```bash
   mysql -u root -p < database.sql
   ```

2. **Or manually in MySQL:**
   ```sql
   source database.sql;
   ```

### Option 2: Using MySQL Command Line

1. **Login to MySQL:**
   ```bash
   mysql -u root -p
   ```

2. **Run the SQL commands:**
   ```sql
   CREATE DATABASE IF NOT EXISTS buildestate CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE buildestate;
   -- Then copy and paste the table creation statements from database.sql
   ```

### Option 3: Automatic Setup (Recommended)

The application will automatically create tables when you run it in development mode. Just make sure:

1. **Set environment variables in `.env`:**
   ```env
   DB_NAME=buildestate
   DB_USER=root
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=3306
   NODE_ENV=development
   ```

2. **Start the application:**
   ```bash
   npm run dev
   ```

   The Sequelize sync will create all tables automatically.

## Database Structure

### Tables

1. **users** - User accounts and authentication
2. **properties** - Property listings
3. **appointments** - Property viewing appointments
4. **forms** - Contact form submissions
5. **news** - Newsletter subscriptions
6. **stats** - API statistics and analytics

### Relationships

- `appointments.propertyId` → `properties.id` (Foreign Key)
- `appointments.userId` → `users.id` (Foreign Key)

## Environment Variables

Add these to your `.env` file:

```env
# Database Configuration
DB_NAME=buildestate
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306

# Application
NODE_ENV=development
```

## Verification

After setup, verify the database:

```sql
USE buildestate;
SHOW TABLES;
DESCRIBE users;
DESCRIBE properties;
DESCRIBE appointments;
```

## Troubleshooting

### Error: Access Denied
- Check MySQL user permissions
- Ensure password is correct
- Try: `GRANT ALL PRIVILEGES ON buildestate.* TO 'root'@'localhost';`

### Error: Table Already Exists
- Drop existing tables: `DROP DATABASE buildestate;`
- Recreate: `CREATE DATABASE buildestate;`
- Run the SQL file again

### Error: Foreign Key Constraint
- Ensure tables are created in order (users and properties before appointments)
- Check that referenced IDs exist

## Production Setup

For production, consider:

1. **Create a dedicated database user:**
   ```sql
   CREATE USER 'buildestate_user'@'localhost' IDENTIFIED BY 'strong_password';
   GRANT ALL PRIVILEGES ON buildestate.* TO 'buildestate_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. **Use migrations instead of sync:**
   - Disable auto-sync in production
   - Use Sequelize migrations for schema changes

3. **Backup regularly:**
   ```bash
   mysqldump -u root -p buildestate > backup.sql
   ```

## Notes

- All tables use `utf8mb4` encoding for full Unicode support
- Timestamps are automatically managed (createdAt, updatedAt)
- Foreign keys use CASCADE for delete/update operations
- Indexes are created for commonly queried fields

