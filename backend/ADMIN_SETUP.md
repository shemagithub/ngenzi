# Admin User Setup Guide

## Overview
This guide explains how to create and manage admin users for the BuildEstate platform.

## Default Admin Credentials

**Email:** `admin@buildestate.com`  
**Password:** `Admin@123`

⚠️ **IMPORTANT:** Change the password immediately after first login!

## Method 1: Using Node.js Script (Recommended)

1. **Make sure your database is set up:**
   ```bash
   # Ensure your .env file has correct database credentials
   DB_NAME=buildestate
   DB_USER=root
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=3306
   ```

2. **Run the admin creation script:**
   ```bash
   cd backend
   npm run create-admin
   ```

   This will:
   - Connect to the database
   - Create/update the admin user
   - Display the credentials

## Method 2: Using SQL Script

1. **Run the SQL script:**
   ```bash
   mysql -u root -p < create-admin.sql
   ```

   Or manually in MySQL:
   ```sql
   USE buildestate;
   source create-admin.sql;
   ```

## Method 3: Manual SQL Insert

1. **Generate a password hash:**
   ```bash
   node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('YourPassword', 10).then(hash => console.log(hash));"
   ```

2. **Insert into database:**
   ```sql
   USE buildestate;
   
   -- Add role column if it doesn't exist
   ALTER TABLE users 
   ADD COLUMN IF NOT EXISTS role ENUM('user', 'admin') NOT NULL DEFAULT 'user' AFTER resetTokenExpire;
   
   -- Insert admin user
   INSERT INTO users (name, email, password, role, createdAt, updatedAt) 
   VALUES (
       'Admin User',
       'admin@buildestate.com',
       '$2a$10$CGn5SW47N3XygHZJRgbRzOXcKbe3LoFN633ErpenCVICwgXyjY9I.',
       'admin',
       NOW(),
       NOW()
   )
   ON DUPLICATE KEY UPDATE 
       role = 'admin',
       updatedAt = NOW();
   ```

## Admin Login

### Via API
```bash
POST http://localhost:4000/api/users/admin
Content-Type: application/json

{
  "email": "admin@buildestate.com",
  "password": "Admin@123"
}
```

### Response
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@buildestate.com",
    "role": "admin"
  }
}
```

## Creating Additional Admin Users

### Using the Script
Modify `scripts/create-admin.js` to create additional admins, or run:

```javascript
// In Node.js REPL or script
const bcrypt = require('bcryptjs');
const User = require('./models/Usermodel');

const createAdmin = async () => {
  const hashedPassword = await bcrypt.hash('NewPassword123', 10);
  await User.create({
    name: 'New Admin',
    email: 'newadmin@buildestate.com',
    password: hashedPassword,
    role: 'admin'
  });
};
```

### Using SQL
```sql
INSERT INTO users (name, email, password, role) 
VALUES (
    'New Admin Name',
    'newadmin@buildestate.com',
    '$2a$10$...', -- Generated hash
    'admin'
);
```

## Changing Admin Password

### Via API (if logged in as admin)
```bash
PUT /api/users/change-password
Authorization: Bearer <token>

{
  "currentPassword": "Admin@123",
  "newPassword": "NewSecurePassword123"
}
```

### Via SQL
1. Generate new password hash
2. Update in database:
   ```sql
   UPDATE users 
   SET password = '$2a$10$...' -- New hash
   WHERE email = 'admin@buildestate.com';
   ```

## Security Best Practices

1. ✅ **Change default password immediately**
2. ✅ **Use strong passwords** (min 12 characters, mixed case, numbers, symbols)
3. ✅ **Limit admin access** - Only create admin accounts for trusted users
4. ✅ **Regular password rotation** - Change passwords periodically
5. ✅ **Monitor admin activity** - Check logs for admin actions
6. ✅ **Use environment variables** for sensitive admin credentials in production

## Troubleshooting

### Admin login fails
- Check if user exists: `SELECT * FROM users WHERE email = 'admin@buildestate.com';`
- Verify role is set to 'admin': `SELECT role FROM users WHERE email = 'admin@buildestate.com';`
- Check password hash is correct
- Verify JWT_SECRET is set in .env

### Role column doesn't exist
Run the migration:
```sql
ALTER TABLE users 
ADD COLUMN role ENUM('user', 'admin') NOT NULL DEFAULT 'user' AFTER resetTokenExpire;
```

### Cannot connect to database
- Verify database credentials in .env
- Ensure MySQL server is running
- Check database exists: `SHOW DATABASES;`

## Notes

- The admin login supports both database-based and environment variable-based authentication (for backward compatibility)
- Admin tokens expire after 24 hours
- Admin users have full access to all admin endpoints
- Regular users cannot access admin routes even with a valid token

