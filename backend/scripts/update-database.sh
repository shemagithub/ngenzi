#!/bin/bash

# Database Update Script for BuildEstate
# This script updates the database schema to match current models

echo "🔄 BuildEstate Database Update Script"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}❌ MySQL client is not installed${NC}"
    echo "Please install MySQL client to run this script"
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo -e "${GREEN}✅ Loaded environment variables${NC}"
else
    echo -e "${YELLOW}⚠️  .env file not found. Using defaults.${NC}"
fi

# Database credentials
DB_NAME=${DB_NAME:-buildestate}
DB_USER=${DB_USER:-root}
DB_PASSWORD=${DB_PASSWORD:-}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-3306}

echo ""
echo "Database Configuration:"
echo "  Host: $DB_HOST"
echo "  Port: $DB_PORT"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo ""

# Prompt for password if not set
if [ -z "$DB_PASSWORD" ]; then
    read -sp "Enter MySQL password: " DB_PASSWORD
    echo ""
fi

# Test database connection
echo "Testing database connection..."
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" -e "USE $DB_NAME;" 2>/dev/null

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to connect to database${NC}"
    echo "Please check your database credentials"
    exit 1
fi

echo -e "${GREEN}✅ Database connection successful${NC}"
echo ""

# Check if update SQL file exists
if [ -f "database-update.sql" ]; then
    echo "📄 Running database-update.sql..."
    mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < database-update.sql
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database update completed successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Some updates may have failed (this is normal if changes already exist)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  database-update.sql not found. Running Node.js update script instead...${NC}"
    if [ -f "scripts/update-database.js" ]; then
        node scripts/update-database.js
    else
        echo -e "${RED}❌ No update script found${NC}"
        exit 1
    fi
fi

echo ""
echo "📊 Verifying database structure..."

# Verify tables exist
TABLES=("users" "properties" "appointments" "forms" "news" "stats")

for table in "${TABLES[@]}"; do
    COUNT=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -se "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$DB_NAME' AND table_name='$table';" 2>/dev/null)
    
    if [ "$COUNT" -eq 1 ]; then
        echo -e "${GREEN}✅ Table $table exists${NC}"
    else
        echo -e "${RED}❌ Table $table does not exist${NC}"
    fi
done

echo ""
echo -e "${GREEN}✅ Database update process completed!${NC}"
echo ""
echo "Next steps:"
echo "  1. Verify your application is working correctly"
echo "  2. Check the database structure with: DESCRIBE table_name;"
echo "  3. Run 'npm run create-admin' if you need to create an admin user"

