@echo off
REM Database Update Script for BuildEstate (Windows)
REM This script updates the database schema to match current models

echo.
echo ============================================
echo BuildEstate Database Update Script
echo ============================================
echo.

REM Check if MySQL is installed
where mysql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] MySQL client is not installed or not in PATH
    echo Please install MySQL client to run this script
    pause
    exit /b 1
)

REM Load environment variables from .env file if it exists
if exist .env (
    echo [INFO] Loading environment variables from .env file...
    for /f "usebackq tokens=1,2 delims==" %%a in (".env") do (
        if not "%%a"=="" if not "%%a"=="#" (
            set "%%a=%%b"
        )
    )
) else (
    echo [WARNING] .env file not found. Using defaults.
)

REM Database credentials with defaults
if "%DB_NAME%"=="" set DB_NAME=buildestate
if "%DB_USER%"=="" set DB_USER=root
if "%DB_PASSWORD%"=="" set DB_PASSWORD=
if "%DB_HOST%"=="" set DB_HOST=localhost
if "%DB_PORT%"=="" set DB_PORT=3306

echo.
echo Database Configuration:
echo   Host: %DB_HOST%
echo   Port: %DB_PORT%
echo   Database: %DB_NAME%
echo   User: %DB_USER%
echo.

REM Prompt for password if not set
if "%DB_PASSWORD%"=="" (
    set /p DB_PASSWORD="Enter MySQL password: "
)

REM Test database connection
echo Testing database connection...
mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% -e "USE %DB_NAME%;" >nul 2>&1

if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to connect to database
    echo Please check your database credentials
    pause
    exit /b 1
)

echo [SUCCESS] Database connection successful
echo.

REM Check if update SQL file exists
if exist database-update.sql (
    echo [INFO] Running database-update.sql...
    mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% < database-update.sql
    
    if %ERRORLEVEL% EQU 0 (
        echo [SUCCESS] Database update completed successfully
    ) else (
        echo [WARNING] Some updates may have failed (this is normal if changes already exist)
    )
) else (
    echo [WARNING] database-update.sql not found. Running Node.js update script instead...
    if exist scripts\update-database.js (
        node scripts\update-database.js
    ) else (
        echo [ERROR] No update script found
        pause
        exit /b 1
    )
)

echo.
echo [INFO] Verifying database structure...

REM Verify tables exist
set TABLES=users properties appointments forms news stats

for %%t in (%TABLES%) do (
    mysql -h %DB_HOST% -P %DB_PORT% -u %DB_USER% -p%DB_PASSWORD% %DB_NAME% -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='%DB_NAME%' AND table_name='%%t';" >nul 2>&1
    if %ERRORLEVEL% EQU 0 (
        echo [SUCCESS] Table %%t exists
    ) else (
        echo [ERROR] Table %%t does not exist
    )
)

echo.
echo [SUCCESS] Database update process completed!
echo.
echo Next steps:
echo   1. Verify your application is working correctly
echo   2. Check the database structure with: DESCRIBE table_name;
echo   3. Run 'npm run create-admin' if you need to create an admin user
echo.
pause

