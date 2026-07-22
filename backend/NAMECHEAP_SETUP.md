# Namecheap Hosting Setup Guide

## Common 503 Error Fixes

### 1. Environment Variables
Make sure all required environment variables are set in your Namecheap cPanel:
- `NODE_ENV=production`
- `PORT` (usually provided by Namecheap, check your hosting panel)
- `DB_HOST` (usually `localhost` or provided by Namecheap)
- `DB_PORT` (usually `3306`)
- `DB_NAME` (your database name)
- `DB_USER` (your database username)
- `DB_PASSWORD` (your database password)
- `JWT_SECRET` (your JWT secret key)
- `EMAIL` (your email for nodemailer)
- `EMAIL_PASSWORD` (your email password)

### 2. Node.js Version
In cPanel, go to **Node.js** section and ensure you're using Node.js version 18.x or higher.

### 3. Application Startup File
In the Node.js section of cPanel:
- **Application root**: `/home/username/public_html/backend` (or your backend folder path)
- **Application URL**: Your domain or subdomain
- **Application startup file**: `server.js`
- **Application mode**: `production`

### 4. Port Configuration
Namecheap usually provides a PORT environment variable. Make sure it's set correctly in your cPanel Node.js environment variables.

### 5. Database Connection
- Ensure your MySQL database is created in cPanel
- Use `localhost` as DB_HOST (not 127.0.0.1)
- Check database credentials match your .env file

### 6. File Permissions
Ensure the following directories have write permissions (755 or 775):
- `backend/uploads/`
- `backend/uploads/logo/`
- `backend/uploads/plots/`
- `backend/uploads/properties/`
- `backend/uploads/services/`
- `backend/uploads/blogs/`
- `backend/uploads/teams/`
- `backend/uploads/testimonials/`

### 7. Check Logs
In cPanel, check:
- **Error Logs** (in cPanel main menu)
- **Node.js Application Logs** (in Node.js section)

### 8. Restart Application
After making changes:
1. Go to Node.js section in cPanel
2. Click **Stop** on your application
3. Wait 10 seconds
4. Click **Start** on your application
5. Check the logs for any errors

### 9. Common Issues

#### Issue: "Cannot find module"
**Solution**: Run `npm install` in your backend directory via SSH or File Manager terminal.

#### Issue: "Port already in use"
**Solution**: Check if another Node.js app is using the same port. Use the PORT provided by Namecheap.

#### Issue: "Database connection failed"
**Solution**: 
- Verify database credentials
- Check if database exists
- Ensure database user has proper permissions
- Try using `localhost` instead of IP address

#### Issue: "EADDRINUSE"
**Solution**: The port is already in use. Check your PORT environment variable or stop conflicting applications.

### 10. Testing
After setup, test these endpoints:
- `https://yourdomain.com/status` - Should return JSON with status
- `https://yourdomain.com/` - Should return HTML status page
- `https://yourdomain.com/api/products` - Should return API response (if DB connected)

### 11. Health Check
The server now includes a `/status` endpoint that shows:
- Server status
- Database connection status
- Memory usage
- Uptime

Use this to monitor your server health.

## Additional Notes

- The server is configured to start even if the database connection fails initially
- Database connection will retry automatically every 5 seconds if it fails
- Unhandled errors are logged but won't crash the server in production
- Make sure all npm packages are installed: `npm install`
- Ensure your Node.js version in cPanel matches your local development version

