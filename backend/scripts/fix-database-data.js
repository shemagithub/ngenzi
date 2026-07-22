import { sequelize } from '../config/mysql.js';
import Property from '../models/propertymodel.js';
import dotenv from 'dotenv';

dotenv.config();

const fixDatabaseData = async () => {
  try {
    console.log('🔧 Starting database data fix...\n');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    // Fix properties table data
    await fixPropertiesData();

    // Verify fixes
    await verifyDataFixes();

    console.log('\n✅ Database data fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing database data:', error);
    process.exit(1);
  }
};

const fixPropertiesData = async () => {
  console.log('📋 Fixing properties table data...\n');

  try {
    // Get all properties
    const properties = await Property.findAll();

    console.log(`Found ${properties.length} properties to check\n`);

    let fixedCount = 0;
    let skippedCount = 0;

    for (const property of properties) {
      let needsUpdate = false;
      const updates = {};

      // Fix phone field
      if (!property.phone || property.phone.trim() === '' || property.phone === null) {
        updates.phone = 'N/A';
        needsUpdate = true;
        console.log(`  🔧 Property ${property.id}: Fixing phone (was: "${property.phone}")`);
      }

      // Fix image field - ensure it's an array
      let imageArray = [];
      if (property.image) {
        if (Array.isArray(property.image)) {
          imageArray = property.image;
        } else if (typeof property.image === 'string') {
          try {
            const parsed = JSON.parse(property.image);
            imageArray = Array.isArray(parsed) ? parsed : [property.image];
          } catch {
            // If not valid JSON, treat as single URL
            imageArray = property.image.trim() ? [property.image] : [];
          }
        } else {
          imageArray = [];
        }
      }

      // Filter out invalid image URLs
      const validImages = imageArray.filter(img => {
        if (!img || typeof img !== 'string') return false;
        const trimmed = img.trim();
        return trimmed.length > 0 && (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:'));
      });

      if (JSON.stringify(property.image) !== JSON.stringify(validImages)) {
        updates.image = validImages;
        needsUpdate = true;
        console.log(`  🔧 Property ${property.id}: Fixing image (was: ${typeof property.image}, now: array with ${validImages.length} images)`);
      }

      // Fix amenities field - ensure it's an array
      let amenitiesArray = [];
      if (property.amenities) {
        if (Array.isArray(property.amenities)) {
          amenitiesArray = property.amenities;
        } else if (typeof property.amenities === 'string') {
          try {
            const parsed = JSON.parse(property.amenities);
            amenitiesArray = Array.isArray(parsed) ? parsed : [property.amenities];
          } catch {
            // If not valid JSON, treat as single amenity
            amenitiesArray = property.amenities.trim() ? [property.amenities] : [];
          }
        } else {
          amenitiesArray = [];
        }
      }

      // Filter out empty amenities
      const validAmenities = amenitiesArray.filter(amenity => {
        if (!amenity) return false;
        if (typeof amenity === 'string') {
          return amenity.trim().length > 0;
        }
        return true;
      });

      if (JSON.stringify(property.amenities) !== JSON.stringify(validAmenities)) {
        updates.amenities = validAmenities;
        needsUpdate = true;
        console.log(`  🔧 Property ${property.id}: Fixing amenities (was: ${typeof property.amenities}, now: array with ${validAmenities.length} amenities)`);
      }

      // Fix numeric fields - ensure they're numbers
      if (property.price && (typeof property.price !== 'number' || isNaN(property.price))) {
        const priceNum = parseFloat(property.price) || 0;
        if (priceNum !== property.price) {
          updates.price = priceNum;
          needsUpdate = true;
          console.log(`  🔧 Property ${property.id}: Fixing price (was: ${property.price}, now: ${priceNum})`);
        }
      }

      if (property.beds && (typeof property.beds !== 'number' || isNaN(property.beds))) {
        const bedsNum = parseInt(property.beds) || 0;
        if (bedsNum !== property.beds) {
          updates.beds = bedsNum;
          needsUpdate = true;
          console.log(`  🔧 Property ${property.id}: Fixing beds (was: ${property.beds}, now: ${bedsNum})`);
        }
      }

      if (property.baths && (typeof property.baths !== 'number' || isNaN(property.baths))) {
        const bathsNum = parseInt(property.baths) || 0;
        if (bathsNum !== property.baths) {
          updates.baths = bathsNum;
          needsUpdate = true;
          console.log(`  🔧 Property ${property.id}: Fixing baths (was: ${property.baths}, now: ${bathsNum})`);
        }
      }

      if (property.sqft && (typeof property.sqft !== 'number' || isNaN(property.sqft))) {
        const sqftNum = parseInt(property.sqft) || 0;
        if (sqftNum !== property.sqft) {
          updates.sqft = sqftNum;
          needsUpdate = true;
          console.log(`  🔧 Property ${property.id}: Fixing sqft (was: ${property.sqft}, now: ${sqftNum})`);
        }
      }

      // Fix string fields - ensure they're not null
      if (!property.title || property.title.trim() === '') {
        updates.title = property.title || 'Untitled Property';
        needsUpdate = true;
        console.log(`  🔧 Property ${property.id}: Fixing title`);
      }

      if (!property.location || property.location.trim() === '') {
        updates.location = property.location || 'Location not specified';
        needsUpdate = true;
        console.log(`  🔧 Property ${property.id}: Fixing location`);
      }

      if (!property.description || property.description.trim() === '') {
        updates.description = property.description || 'No description available';
        needsUpdate = true;
        console.log(`  🔧 Property ${property.id}: Fixing description`);
      }

      if (!property.type || property.type.trim() === '') {
        updates.type = property.type || 'House';
        needsUpdate = true;
        console.log(`  🔧 Property ${property.id}: Fixing type`);
      }

      if (!property.availability || property.availability.trim() === '') {
        updates.availability = property.availability || 'rent';
        needsUpdate = true;
        console.log(`  🔧 Property ${property.id}: Fixing availability`);
      }

      // Apply updates if needed
      if (needsUpdate) {
        try {
          await property.update(updates);
          // Reload the property to get fresh data
          await property.reload();
          fixedCount++;
          console.log(`  ✅ Property ${property.id}: Fixed successfully\n`);
        } catch (error) {
          console.error(`  ❌ Property ${property.id}: Error updating - ${error.message}\n`);
        }
      } else {
        skippedCount++;
        console.log(`  ✓ Property ${property.id}: No fixes needed\n`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   - Fixed: ${fixedCount} properties`);
    console.log(`   - Skipped: ${skippedCount} properties`);
    console.log(`   - Total: ${properties.length} properties\n`);

  } catch (error) {
    console.error('❌ Error fixing properties data:', error);
    throw error;
  }
};

const verifyDataFixes = async () => {
  console.log('🔍 Verifying data fixes...\n');

  try {
    // Get raw data from database to verify
    const [properties] = await sequelize.query(`
      SELECT id, phone, image, amenities, price, beds, baths, sqft
      FROM properties
    `, { raw: true });
    
    let issuesFound = 0;

    for (const property of properties) {
      // Check phone
      if (!property.phone || property.phone.trim() === '' || property.phone === null) {
        console.log(`  ⚠️  Property ${property.id}: phone is still invalid`);
        issuesFound++;
      }

      // Check image - normalize for verification
      let imageArray = [];
      if (property.image) {
        if (typeof property.image === 'string') {
          try {
            imageArray = JSON.parse(property.image);
          } catch {
            imageArray = [];
          }
        } else if (Array.isArray(property.image)) {
          imageArray = property.image;
        }
      }
      
      if (!Array.isArray(imageArray)) {
        console.log(`  ⚠️  Property ${property.id}: image is not an array (type: ${typeof property.image})`);
        issuesFound++;
      }

      // Check amenities - normalize for verification
      let amenitiesArray = [];
      if (property.amenities) {
        if (typeof property.amenities === 'string') {
          try {
            amenitiesArray = JSON.parse(property.amenities);
          } catch {
            amenitiesArray = [];
          }
        } else if (Array.isArray(property.amenities)) {
          amenitiesArray = property.amenities;
        }
      }
      
      if (!Array.isArray(amenitiesArray)) {
        console.log(`  ⚠️  Property ${property.id}: amenities is not an array (type: ${typeof property.amenities})`);
        issuesFound++;
      }

      // Check numeric fields
      if (isNaN(property.price) || property.price < 0) {
        console.log(`  ⚠️  Property ${property.id}: price is invalid (${property.price})`);
        issuesFound++;
      }

      if (isNaN(property.beds) || property.beds < 0) {
        console.log(`  ⚠️  Property ${property.id}: beds is invalid (${property.beds})`);
        issuesFound++;
      }

      if (isNaN(property.baths) || property.baths < 0) {
        console.log(`  ⚠️  Property ${property.id}: baths is invalid (${property.baths})`);
        issuesFound++;
      }

      if (isNaN(property.sqft) || property.sqft < 0) {
        console.log(`  ⚠️  Property ${property.id}: sqft is invalid (${property.sqft})`);
        issuesFound++;
      }
    }

    if (issuesFound === 0) {
      console.log('✅ All properties verified successfully!\n');
    } else {
      console.log(`\n⚠️  Found ${issuesFound} issues that need attention\n`);
    }

    // Show statistics
    let withImages = 0;
    let withAmenities = 0;
    let withPhone = 0;

    for (const property of properties) {
      // Count images
      let imageArray = [];
      if (property.image) {
        if (typeof property.image === 'string') {
          try {
            imageArray = JSON.parse(property.image);
          } catch {
            imageArray = [];
          }
        } else if (Array.isArray(property.image)) {
          imageArray = property.image;
        }
      }
      if (Array.isArray(imageArray) && imageArray.length > 0) {
        withImages++;
      }

      // Count amenities
      let amenitiesArray = [];
      if (property.amenities) {
        if (typeof property.amenities === 'string') {
          try {
            amenitiesArray = JSON.parse(property.amenities);
          } catch {
            amenitiesArray = [];
          }
        } else if (Array.isArray(property.amenities)) {
          amenitiesArray = property.amenities;
        }
      }
      if (Array.isArray(amenitiesArray) && amenitiesArray.length > 0) {
        withAmenities++;
      }

      // Count phone
      if (property.phone && property.phone !== 'N/A' && property.phone.trim() !== '') {
        withPhone++;
      }
    }

    console.log('📊 Database Statistics:');
    console.log(`   - Total properties: ${properties.length}`);
    console.log(`   - Properties with images: ${withImages}`);
    console.log(`   - Properties with amenities: ${withAmenities}`);
    console.log(`   - Properties with phone: ${withPhone}\n`);

  } catch (error) {
    console.error('❌ Error verifying data fixes:', error);
  }
};

// Run the fix
fixDatabaseData();

