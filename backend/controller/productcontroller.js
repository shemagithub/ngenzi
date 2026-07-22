import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Op } from "sequelize";
import imagekit, { isImageKitConfigured } from "../config/imagekit.js";
import Property from "../models/propertymodel.js";
import { sequelize } from "../config/mysql.js";
import { persistYoutubeForDb, resolveYoutubeRawFromRequest, hasYoutubeUrlQuery } from "../utils/youtubeUrl.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const addproperty = async (req, res) => {
    try {
        // Debug logging
        console.log('Request body keys:', Object.keys(req.body));
        console.log('Request files:', req.files ? Object.keys(req.files) : 'No files');
        
        // Parse amenities from FormData array format (amenities[0], amenities[1], etc.)
        let amenities = [];
        
        // Check if amenities is already an array (parsed by Express)
        if (Array.isArray(req.body.amenities)) {
            amenities = req.body.amenities.filter(Boolean);
        } 
        // Check if amenities is a string (single value or JSON)
        else if (typeof req.body.amenities === 'string' && req.body.amenities.trim()) {
            try {
                amenities = JSON.parse(req.body.amenities);
                if (!Array.isArray(amenities)) {
                    amenities = [amenities];
                }
            } catch {
                // If not JSON, treat as single value
                amenities = [req.body.amenities];
            }
        } 
        // Handle FormData array format: amenities[0], amenities[1], etc.
        else {
            const amenityKeys = Object.keys(req.body).filter(key => key.startsWith('amenities['));
            if (amenityKeys.length > 0) {
                amenities = amenityKeys
                    .sort((a, b) => {
                        const indexA = parseInt(a.match(/\[(\d+)\]/)?.[1] || '0');
                        const indexB = parseInt(b.match(/\[(\d+)\]/)?.[1] || '0');
                        return indexA - indexB;
                    })
                    .map(key => req.body[key])
                    .filter(Boolean);
            }
        }
        
        console.log('Parsed amenities:', amenities);

        // Extract and convert data types
        const title = req.body.title?.trim();
        const location = req.body.location?.trim();
        const price = parseFloat(req.body.price);
        const beds = parseInt(req.body.beds);
        const baths = parseInt(req.body.baths);
        const sqft = parseInt(req.body.sqft);
        const type = req.body.type?.trim();
        const availability = req.body.availability?.trim();
        const description = req.body.description?.trim();
        const phone = req.body.phone?.trim() || '';

        // Validate required fields
        if (!title || !location || !type || !availability || !description) {
            return res.status(400).json({ 
                message: "Missing required fields: title, location, type, availability, and description are required", 
                success: false 
            });
        }

        // Validate numeric fields
        if (isNaN(price) || price < 0) {
            return res.status(400).json({ 
                message: "Invalid price: must be a positive number", 
                success: false 
            });
        }
        if (isNaN(beds) || beds < 0) {
            return res.status(400).json({ 
                message: "Invalid beds: must be a non-negative integer", 
                success: false 
            });
        }
        if (isNaN(baths) || baths < 0) {
            return res.status(400).json({ 
                message: "Invalid baths: must be a non-negative integer", 
                success: false 
            });
        }
        if (isNaN(sqft) || sqft < 0) {
            return res.status(400).json({ 
                message: "Invalid sqft: must be a non-negative integer", 
                success: false 
            });
        }

        // Handle frontImage separately
        console.log('📁 Checking for uploaded images...');
        console.log('req.files keys:', req.files ? Object.keys(req.files) : 'No files object');
        
        const frontImageFile = req.files?.frontImage?.[0];
        const image1 = req.files?.image1?.[0];
        const image2 = req.files?.image2?.[0];
        const image3 = req.files?.image3?.[0];
        const image4 = req.files?.image4?.[0];

        const images = [image1, image2, image3, image4].filter((item) => item !== undefined);
        
        // Determine folder name based on property type
        const folderName = type.toLowerCase() === 'plot' ? 'plots' : 'properties';
        
        // Helper function to save a single image (with ImageKit fallback to local storage)
        const saveImage = async (imageFile, isFrontImage = false) => {
            if (!imageFile) return null;
            
            let imageKitAttempted = false;
            let imageKitSucceeded = false;
            let imageUrl = null;
            
            // Try ImageKit first if configured
            if (isImageKitConfigured && imagekit) {
                imageKitAttempted = true;
                try {
                    console.log(`🔄 Attempting ImageKit upload for ${isFrontImage ? 'front image' : 'image'}...`);
                    const filePath = imageFile.path;
                    if (fs.existsSync(filePath)) {
                        const fileBuffer = fs.readFileSync(filePath);
                        const folderPath = type.toLowerCase() === 'plot' 
                            ? (isFrontImage ? "Plot/Front" : "Plot")
                            : (isFrontImage ? "Property/Front" : "Property");
                        
                        const result = await imagekit.upload({
                            file: fileBuffer,
                            fileName: imageFile.originalname,
                            folder: folderPath,
                        });
                        
                        fs.unlink(filePath, (err) => {
                            if (err) console.error("Error deleting temp file:", err);
                        });
                        
                        imageUrl = result.url;
                        imageKitSucceeded = true;
                        console.log(`✅ Image uploaded to ImageKit: ${imageUrl}`);
                    } else {
                        console.error(`❌ ImageKit: File path does not exist: ${filePath}`);
                        throw new Error('File path does not exist for ImageKit upload');
                    }
                } catch (imageKitError) {
                    console.error(`❌ ImageKit upload failed: ${imageKitError.message}`);
                    console.log(`📦 Falling back to local storage...`);
                    imageKitSucceeded = false;
                }
            }
            
            // Save locally if ImageKit not configured or ImageKit failed
            if (!imageKitSucceeded) {
                try {
                    const baseUploadsDir = path.join(__dirname, '..', 'uploads');
                    if (!fs.existsSync(baseUploadsDir)) {
                        fs.mkdirSync(baseUploadsDir, { recursive: true });
                        console.log(`📁 Created base uploads directory: ${baseUploadsDir}`);
                    }
                    
                    const uploadsDir = path.join(__dirname, '..', 'uploads', folderName);
                    if (!fs.existsSync(uploadsDir)) {
                        fs.mkdirSync(uploadsDir, { recursive: true });
                        console.log(`📁 Created ${folderName} directory: ${uploadsDir}`);
                    } else {
                        console.log(`📁 ${folderName} directory already exists: ${uploadsDir}`);
                    }
                    
                    const filePath = imageFile.path;
                    console.log(`📂 Checking temp file path for local save: ${filePath}`);
                    console.log(`   File exists: ${fs.existsSync(filePath)}`);
                    
                    if (!filePath) {
                        console.error(`❌ Local Save: Image file path is undefined or null!`);
                        console.error(`   imageFile object:`, imageFile);
                        return null;
                    } else if (fs.existsSync(filePath)) {
                        const timestamp = Date.now();
                        const randomSuffix = Math.random().toString(36).substring(2, 8);
                        const ext = path.extname(imageFile.originalname) || '.jpg';
                        const baseName = path.basename(imageFile.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
                        const prefix = isFrontImage ? 'front-' : '';
                        const newFileName = `${prefix}${folderName === 'plots' ? 'plot' : 'property'}-${timestamp}-${randomSuffix}-${baseName}${ext}`;
                        const newFilePath = path.join(uploadsDir, newFileName);
                        
                        console.log(`📝 Preparing to save image locally:`);
                        console.log(`   Source: ${filePath}`);
                        console.log(`   Destination: ${newFilePath}`);
                        console.log(`   File name: ${newFileName}`);
                        
                        try {
                            fs.copyFileSync(filePath, newFilePath);
                            if (fs.existsSync(newFilePath)) {
                                const stats = fs.statSync(newFilePath);
                                console.log(`✅ Image saved locally successfully!`);
                                console.log(`   File path: ${newFilePath}`);
                                console.log(`   File size: ${stats.size} bytes`);
                                
                                try {
                                    fs.unlinkSync(filePath);
                                    console.log(`🗑️ Temporary file deleted: ${filePath}`);
                                } catch (unlinkErr) {
                                    console.error(`⚠️ Error deleting temp file: ${unlinkErr.message}`);
                                }
                                
                                imageUrl = `/uploads/${folderName}/${newFileName}`;
                                console.log(`✅ Local Image URL generated: ${imageUrl}`);
                            } else {
                                console.error(`❌ Failed to save image locally - file does not exist after copy`);
                                console.error(`   Expected path: ${newFilePath}`);
                                return null;
                            }
                        } catch (copyError) {
                            console.error(`❌ Error copying image file locally:`, copyError);
                            console.error(`   Error message: ${copyError.message}`);
                            console.error(`   Error stack: ${copyError.stack}`);
                            return null;
                        }
                    } else {
                        console.error(`❌ Local Save: Image file path does not exist: ${filePath}`);
                        console.error(`   Current working directory: ${process.cwd()}`);
                        return null;
                    }
                } catch (localSaveError) {
                    console.error(`❌ Local save error:`, localSaveError);
                    console.error(`   Error message: ${localSaveError.message}`);
                    return null;
                }
            }
            
            return imageUrl;
        };
        
        // Save frontImage
        let frontImageUrl = null;
        if (frontImageFile) {
            console.log(`🖼️  Processing front image: ${frontImageFile.originalname}`);
            frontImageUrl = await saveImage(frontImageFile, true);
        }
        
        console.log(`📸 Found ${images.length} image(s) to process`);
        images.forEach((img, idx) => {
            console.log(`  Image ${idx + 1}: ${img.originalname} (${img.size} bytes) at ${img.path}`);
        });

        // Upload images using the same saveImage function
        let imageUrls = [];
        if (images.length > 0) {
            try {
                console.log(`📸 Processing ${images.length} image(s)...`);
                imageUrls = await Promise.all(
                    images.map(async (item) => {
                        return await saveImage(item, false);
                    })
                );
                imageUrls = imageUrls.filter(url => url !== null);
                console.log(`\n📊 Image processing complete: ${imageUrls.length}/${images.length} images saved`);
            } catch (imageError) {
                console.error("❌ Error processing images:", imageError);
                console.warn("⚠️  Continuing without images due to error");
            }
        }
        
        console.log(`\n📸 Total images to save to database: ${imageUrls.length}`);
        if (imageUrls.length > 0) {
            console.log('   Image URLs:', imageUrls);
        } else {
            console.warn('   ⚠️  WARNING: No images will be saved!');
        }

        const ytResolved = resolveYoutubeRawFromRequest(req, ['x-property-youtube-url', 'x-youtube-url']);
        const youtubeUrl = persistYoutubeForDb(ytResolved);
        console.log('[youtube] Property add — originalUrl tail:', (req.originalUrl || '').slice(-200));
        console.log('[youtube] Property add — body keys:', req.body ? Object.keys(req.body) : [], '| raw:', ytResolved ? String(ytResolved).slice(0, 120) : '(empty)', '| persisted:', youtubeUrl ?? 'NULL');
        if (ytResolved && !youtubeUrl) {
            console.warn('⚠️ youtubeUrl rejected (not a valid YouTube URL):', String(ytResolved).slice(0, 120));
        }

        // Prepare property data with proper types and validation
        // IMPORTANT: Do NOT include 'id' field - let database auto-increment handle it
        const productData = {
            title: title,
            location: location,
            price: Number(price), // Ensure it's a number
            beds: Number(beds), // Ensure it's an integer
            baths: Number(baths), // Ensure it's an integer
            sqft: Number(sqft), // Ensure it's an integer
            type: type,
            availability: availability,
            description: description,
            amenities: Array.isArray(amenities) && amenities.length > 0 ? amenities : [], // Always an array
            frontImage: frontImageUrl || null, // Front image URL or null
            image: Array.isArray(imageUrls) ? imageUrls : [], // Save as array (Sequelize JSON handles it)
            phone: phone || 'N/A', // Provide default if empty
            youtubeUrl
        };
        
        // Explicitly remove id if it exists in productData (shouldn't, but safety check)
        if ('id' in productData) {
            delete productData.id;
            console.warn('⚠️ Warning: ID field was present in productData and has been removed');
        }
        
        console.log('\n💾 Property data to save:');
        console.log(`   Title: ${productData.title}`);
        console.log(`   Location: ${productData.location}`);
        console.log(`   Price: ${productData.price}`);
        console.log(`   Images: ${imageUrls.length} images`);
        console.log(`   Image field value (type: ${typeof productData.image}):`, productData.image);

        // Validate that arrays are properly formatted
        if (!Array.isArray(productData.amenities)) {
            productData.amenities = [];
        }
        if (!Array.isArray(productData.image)) {
            productData.image = [];
        }

        console.log('Creating property with data:', {
            title: productData.title,
            location: productData.location,
            price: productData.price,
            beds: productData.beds,
            baths: productData.baths,
            sqft: productData.sqft,
            type: productData.type,
            availability: productData.availability,
            amenities: `${productData.amenities.length} amenities`,
            images: `${productData.image.length} images`,
            phone: productData.phone
        });

        // Create property in database
        console.log('\n💾 Saving to database...');
        console.log(`   Image field before save (type: ${Array.isArray(productData.image) ? 'array' : typeof productData.image}):`, productData.image);
        console.log(`   Product data keys:`, Object.keys(productData));
        console.log(`   Product data values:`, {
            title: productData.title,
            location: productData.location,
            price: productData.price,
            beds: productData.beds,
            baths: productData.baths,
            sqft: productData.sqft,
            type: productData.type,
            availability: productData.availability,
            imageCount: Array.isArray(productData.image) ? productData.image.length : 0,
            amenitiesCount: Array.isArray(productData.amenities) ? productData.amenities.length : 0
        });
        
        // Verify id is not in productData (important for auto-increment)
        if (productData.id !== undefined) {
            console.error('❌ ERROR: ID field is present in productData! This will cause auto-increment issues.');
            delete productData.id;
        }
        
        // Remove any undefined or null values that might cause issues
        Object.keys(productData).forEach(key => {
            if (productData[key] === undefined) {
                delete productData[key];
                console.warn(`⚠️  Warning: Removed undefined value for field: ${key}`);
            }
        });
        
        // Create property - Sequelize will handle auto-increment for id
        let product;
        try {
            product = await Property.create(productData);
            console.log(`✅ Property.create() returned ID: ${product.id}`);
        } catch (createError) {
            console.error('❌ Error during Property.create():', createError);
            console.error('   Error name:', createError.name);
            console.error('   Error message:', createError.message);
            console.error('   Error stack:', createError.stack);
            console.error('   Product data that failed:', JSON.stringify(productData, null, 2));
            throw createError; // Re-throw to be caught by outer catch block
        }
        
        // Handle case where ID might not be immediately available
        let propertyId = product.id;
        
        // If ID is 0 or null, try to get it from the database using the last inserted ID
        if (!propertyId || propertyId === 0) {
            console.warn('⚠️  Warning: Property ID is 0 or null, attempting to retrieve from database...');
            
            // Try to find the property using other unique fields (title + location + created date)
            try {
                const foundProperty = await Property.findOne({
                    where: {
                        title: productData.title,
                        location: productData.location,
                    },
                    order: [['createdAt', 'DESC']],
                    limit: 1
                });
                
                if (foundProperty && foundProperty.id && foundProperty.id > 0) {
                    propertyId = foundProperty.id;
                    console.log(`✅ Found property in database with ID: ${propertyId}`);
                    // Reload the product instance with the correct ID
                    product = foundProperty;
                } else {
                    // If still not found, try querying by created timestamp
                    const recentProperty = await Property.findOne({
                        where: {
                            createdAt: {
                                [Op.gte]: new Date(Date.now() - 5000) // Last 5 seconds
                            }
                        },
                        order: [['createdAt', 'DESC']],
                        limit: 1
                    });
                    
                    if (recentProperty && recentProperty.id && recentProperty.id > 0) {
                        propertyId = recentProperty.id;
                        console.log(`✅ Found recent property in database with ID: ${propertyId}`);
                        product = recentProperty;
                    } else {
                        console.error('❌ ERROR: Could not retrieve property ID from database');
                        console.error('   Property might have been created but ID retrieval failed');
                        // Continue anyway - we'll try to handle it gracefully
                    }
                }
            } catch (retrieveError) {
                console.error('❌ Error retrieving property ID:', retrieveError);
                // Continue anyway - we'll try to handle it gracefully
            }
        }
        
        // Final check - if ID is still invalid, try to fix database auto-increment
        if (!propertyId || propertyId === 0) {
            console.error('❌ WARNING: Property was created but ID is invalid:', propertyId);
            console.error('   This indicates an issue with the database auto-increment configuration.');
            console.error('   Attempting to fix auto-increment...');
            
            try {
                // Get the maximum ID from the properties table
                const maxIdResult = await sequelize.query(
                    'SELECT MAX(id) as maxId FROM properties',
                    { type: sequelize.QueryTypes.SELECT }
                );
                
                const maxId = maxIdResult && maxIdResult[0] && maxIdResult[0].maxId 
                    ? parseInt(maxIdResult[0].maxId) || 0 
                    : 0;
                
                const nextId = maxId + 1;
                
                // Fix the auto-increment value
                await sequelize.query(
                    `ALTER TABLE properties AUTO_INCREMENT = ${nextId}`,
                    { type: sequelize.QueryTypes.RAW }
                );
                
                console.log(`✅ Fixed auto-increment to start at ${nextId}`);
                
                // Try to find the property we just created (it might have been created without ID)
                // and update it with the new ID
                const propertyWithoutId = await Property.findOne({
                    where: {
                        title: productData.title,
                        location: productData.location,
                        id: 0 // Find the one with ID 0 if it exists
                    },
                    order: [['createdAt', 'DESC']],
                    limit: 1
                });
                
                if (propertyWithoutId) {
                    // Update the property with the new ID using raw SQL (since Sequelize might not allow updating primary key)
                    try {
                        await sequelize.query(
                            `UPDATE properties SET id = ${nextId} WHERE id = 0 AND title = ${sequelize.escape(productData.title)} AND location = ${sequelize.escape(productData.location)} ORDER BY createdAt DESC LIMIT 1`,
                            { type: sequelize.QueryTypes.UPDATE }
                        );
                        propertyId = nextId;
                        product.id = nextId;
                        // Reload the product with the new ID
                        product = await Property.findByPk(nextId);
                        console.log(`✅ Updated property with new ID: ${propertyId}`);
                    } catch (updateError) {
                        console.error('❌ Error updating property ID:', updateError);
                        // Continue - at least auto-increment is fixed for future records
                    }
                }
                
                // If we still don't have an ID, try to create again with a manual ID
                if (!propertyId || propertyId === 0) {
                    console.error('❌ ERROR: Could not fix property ID. Please check database manually.');
                    throw new Error('Property creation failed: Invalid ID generated. The database auto-increment may not be configured correctly. Please run: ALTER TABLE properties AUTO_INCREMENT = 1;');
                }
            } catch (fixError) {
                console.error('❌ Error attempting to fix auto-increment:', fixError);
                throw new Error('Property creation failed: Invalid ID generated. Please check database auto-increment settings. Run this SQL: ALTER TABLE properties AUTO_INCREMENT = 1;');
            }
        } else {
            console.log(`✅ Property created successfully with ID: ${propertyId}`);
        }

        // Verify the property was created correctly using the retrieved ID
        const savedProperty = propertyId && propertyId > 0 
            ? await Property.findByPk(propertyId)
            : null;
            
        if (!savedProperty && (!propertyId || propertyId === 0)) {
            // Only throw error if we absolutely cannot find the property
            console.error('❌ ERROR: Could not verify property was saved correctly');
            throw new Error('Property creation failed: Could not verify property was saved. Please check database auto-increment settings and try again.');
        }
        
        // Use savedProperty if available, otherwise use product
        const finalProperty = savedProperty || product;

        // Get the saved data to verify
        const savedData = finalProperty ? finalProperty.toJSON() : product.toJSON();
        
        // Ensure ID is set correctly
        if (!savedData.id || savedData.id === 0) {
            console.error('❌ ERROR: Property data does not have a valid ID');
            console.error('   Saved data:', savedData);
            throw new Error('Property creation failed: Could not retrieve valid ID. Please check database auto-increment settings.');
        }

        if (youtubeUrl && savedData.id) {
            try {
                await sequelize.query(
                    'UPDATE `properties` SET `youtubeUrl` = :v WHERE `id` = :id',
                    { replacements: { v: youtubeUrl, id: savedData.id } }
                );
                savedData.youtubeUrl = youtubeUrl;
                console.log('[youtube] Applied properties.youtubeUrl via SQL fallback');
            } catch (e1) {
                try {
                    await sequelize.query(
                        'UPDATE `properties` SET `youtube_url` = :v WHERE `id` = :id',
                        { replacements: { v: youtubeUrl, id: savedData.id } }
                    );
                    savedData.youtubeUrl = youtubeUrl;
                    console.log('[youtube] Applied properties.youtube_url via SQL fallback');
                } catch (e2) {
                    console.error('[youtube] SQL fallback failed:', e1.message, '|', e2.message);
                }
            }
        }

        console.log(`📊 Saved property verification:`);
        console.log(`   ID: ${savedData.id}`);
        console.log(`   Title: ${savedData.title}`);
        if (savedData.youtubeUrl) {
            console.log(`✅ [Property] youtubeUrl saved in database: ${savedData.youtubeUrl}`);
        } else if (ytResolved) {
            console.warn(`⚠️ [Property] youtubeUrl was sent but is NULL in DB (invalid or rejected URL).`);
        } else {
            console.log(`ℹ️ [Property] youtubeUrl not provided — stored as NULL.`);
        }
        console.log(`   Images in DB (type: ${Array.isArray(savedData.image) ? 'array' : typeof savedData.image}):`, savedData.image);
        console.log(`   Image count: ${Array.isArray(savedData.image) ? savedData.image.length : 'N/A'}`);
        
        // Get base URL for converting relative paths to absolute URLs
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        // Convert frontImage to full URL if it's a local path
        if (savedData.frontImage && typeof savedData.frontImage === 'string' && savedData.frontImage.startsWith('/uploads/')) {
            savedData.frontImage = `${baseUrl}${savedData.frontImage}`;
        }
        
        // Ensure images and amenities are arrays in the response
        if (!Array.isArray(savedData.image)) {
            if (typeof savedData.image === 'string') {
                try {
                    savedData.image = JSON.parse(savedData.image);
                } catch {
                    savedData.image = [savedData.image];
                }
            } else {
                savedData.image = [];
            }
        }
        
        // Convert local paths to full URLs
        savedData.image = savedData.image.map(img => {
            if (typeof img === 'string' && img.startsWith('/uploads/')) {
                return `${baseUrl}${img}`;
            }
            return img;
        });
        
        if (!Array.isArray(savedData.amenities)) {
            if (typeof savedData.amenities === 'string') {
                try {
                    savedData.amenities = JSON.parse(savedData.amenities);
                } catch {
                    savedData.amenities = [];
                }
            } else {
                savedData.amenities = [];
            }
        }

        console.log('Property saved successfully with ID:', savedData.id);
        console.log('Images saved:', savedData.image.length, 'images');
        console.log('Amenities saved:', savedData.amenities.length, 'amenities');

        res.json({ 
            message: "Property added successfully", 
            success: true, 
            property: savedData 
        });
    } catch (error) {
        console.error("❌ Error adding product:");
        console.error("   Error name:", error.name);
        console.error("   Error message:", error.message);
        console.error("   Error stack:", error.stack);
        console.error("   Request body keys:", req.body ? Object.keys(req.body) : 'No body');
        console.error("   Request files:", req.files ? Object.keys(req.files) : 'No files');
        
        // Handle specific error types
        if (error.name === 'SequelizeValidationError') {
            const validationErrors = error.errors.map(err => ({
                field: err.path,
                message: err.message
            }));
            console.error("   Validation errors:", validationErrors);
            return res.status(400).json({ 
                message: "Validation error: " + error.errors.map(e => e.message).join(', '), 
                success: false,
                validationErrors: process.env.NODE_ENV === 'development' ? validationErrors : undefined
            });
        }
        
        if (error.name === 'SequelizeUniqueConstraintError') {
            console.error("   Unique constraint violation:", error.fields);
            return res.status(409).json({ 
                message: "Duplicate entry: A property with this information already exists", 
                success: false,
                fields: process.env.NODE_ENV === 'development' ? error.fields : undefined
            });
        }
        
        if (error.name === 'SequelizeDatabaseError') {
            console.error("   Database error:", error.message);
            console.error("   SQL:", error.sql);
            console.error("   Parameters:", error.parameters);
            
            // Provide more helpful error message
            let userMessage = "Database error occurred while adding property";
            if (error.message.includes('JSON')) {
                userMessage = "Error saving property data. Please check that all field values are valid.";
            } else if (error.message.includes('column')) {
                userMessage = "Database schema error. Please contact support.";
            } else if (error.message.includes('table')) {
                userMessage = "Database table error. Please contact support.";
            }
            
            return res.status(500).json({ 
                message: userMessage,
                success: false,
                error: process.env.NODE_ENV === 'development' ? error.message : undefined,
                errorType: 'DatabaseError'
            });
        }
        
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            console.error("   Foreign key constraint error:", error.message);
            return res.status(400).json({ 
                message: "Invalid reference: Related record does not exist", 
                success: false,
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
        
        // Handle file system errors
        if (error.code === 'ENOENT' || error.code === 'EACCES') {
            console.error("   File system error:", error.code, error.message);
            return res.status(500).json({ 
                message: "File system error: Unable to save images. Please check server permissions.", 
                success: false,
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
        
        // Generic error response
        // Always log full error details for debugging
        console.error("   Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        
        // Provide user-friendly error message
        let userMessage = "Failed to add property. Please try again.";
        if (error.message) {
            // Include error message if it's safe for production
            if (!error.message.includes('password') && !error.message.includes('secret')) {
                userMessage = error.message.length > 100 
                    ? error.message.substring(0, 100) + '...' 
                    : error.message;
            }
        }
        
        return res.status(500).json({ 
            message: userMessage,
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
            errorType: error.name || 'UnknownError',
            // Include request info for debugging (in development only)
            ...(process.env.NODE_ENV === 'development' && {
                requestInfo: {
                    bodyKeys: req.body ? Object.keys(req.body) : [],
                    fileKeys: req.files ? Object.keys(req.files) : [],
                    method: req.method,
                    path: req.path
                }
            })
        });
    }
};

const listproperty = async (req, res) => {
    try {
        const properties = await Property.findAll({
            order: [['createdAt', 'DESC']]
        });
        
        // Get base URL for converting relative paths to absolute URLs
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        // Convert Sequelize instances to plain objects and normalize JSON fields
        const propertyData = properties.map(prop => {
            const data = prop.toJSON();
            
            // Convert frontImage to full URL if it's a local path
            if (data.frontImage && typeof data.frontImage === 'string' && data.frontImage.startsWith('/uploads/')) {
                data.frontImage = `${baseUrl}${data.frontImage}`;
            }
            
            // Ensure image is always an array and convert local paths to full URLs
            if (data.image) {
                if (typeof data.image === 'string') {
                    try {
                        data.image = JSON.parse(data.image);
                    } catch {
                        data.image = [data.image];
                    }
                }
                if (!Array.isArray(data.image)) {
                    data.image = [];
                }
                
                // Convert local paths to full URLs
                data.image = data.image.map(img => {
                    if (typeof img === 'string' && img.startsWith('/uploads/')) {
                        return `${baseUrl}${img}`;
                    }
                    return img;
                });
            } else {
                data.image = [];
            }
            
            // Ensure amenities is always an array
            if (data.amenities) {
                if (typeof data.amenities === 'string') {
                    try {
                        data.amenities = JSON.parse(data.amenities);
                    } catch {
                        data.amenities = [data.amenities];
                    }
                }
                if (!Array.isArray(data.amenities)) {
                    data.amenities = [];
                }
            } else {
                data.amenities = [];
            }
            return data;
        });
        res.json({ property: propertyData, success: true });
    } catch (error) {
        console.log("Error listing products: ", error);
        res.status(500).json({ message: "Server Error", success: false });
    }
};

const removeproperty = async (req, res) => {
    try {
        // Validate request body
        if (!req.body || !req.body.id) {
            console.error("❌ Remove property error: Missing property ID in request body");
            console.error("   Request body:", req.body);
            return res.status(400).json({ 
                message: "Property ID is required", 
                success: false 
            });
        }

        const propertyId = req.body.id;
        console.log(`🗑️ Attempting to remove property with ID: ${propertyId}`);
        console.log(`   ID type: ${typeof propertyId}, value: ${propertyId}`);

        // Validate ID format
        const parsedId = parseInt(propertyId, 10);
        if (isNaN(parsedId) || parsedId <= 0) {
            // Special handling for ID 0 (which should never exist but might be a bug)
            if (parsedId === 0) {
                console.error(`❌ Attempted to delete property with ID 0 - this indicates a database issue`);
                return res.status(400).json({ 
                    message: `Cannot delete property with ID 0. This property may have been created with invalid auto-increment settings. Please contact support or delete it directly from the database.`, 
                    success: false 
                });
            }
            console.error(`❌ Invalid property ID format: ${propertyId}`);
            return res.status(400).json({ 
                message: `Invalid property ID format: ${propertyId}. ID must be a positive integer.`, 
                success: false 
            });
        }

        // Check if property exists before attempting to delete
        const existingProperty = await Property.findByPk(parsedId);
        if (!existingProperty) {
            console.log(`❌ Property with ID ${parsedId} not found`);
            return res.status(404).json({ 
                message: "Property not found", 
                success: false 
            });
        }

        console.log(`✅ Property found: ${existingProperty.title} (ID: ${existingProperty.id})`);

        // Attempt to delete the property
        const deletedCount = await Property.destroy({ 
            where: { id: parsedId },
            force: true // Force delete even if there are soft-delete constraints
        });

        if (deletedCount === 0) {
            console.error(`❌ Failed to delete property with ID ${parsedId}`);
            return res.status(500).json({ 
                message: "Failed to remove property", 
                success: false 
            });
        }

        console.log(`✅ Property removed successfully (ID: ${parsedId})`);
        return res.json({ 
            message: "Property removed successfully", 
            success: true 
        });
    } catch (error) {
        console.error("❌ Error removing product:");
        console.error("   Error message:", error.message);
        console.error("   Error name:", error.name);
        console.error("   Error stack:", error.stack);
        console.error("   Request body:", req.body);
        
        // Handle specific database errors
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(409).json({ 
                message: "Cannot remove property: It is referenced by other records. Please remove related records first.", 
                success: false 
            });
        }
        
        if (error.name === 'SequelizeDatabaseError') {
            return res.status(500).json({ 
                message: "Database error occurred while removing property", 
                success: false,
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }

        return res.status(500).json({ 
            message: "Server Error: Failed to remove property", 
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const updateproperty = async (req, res) => {
    try {
        // Parse amenities from FormData array format
        let amenities = [];
        if (req.body.amenities) {
            if (Array.isArray(req.body.amenities)) {
                amenities = req.body.amenities;
            } else if (typeof req.body.amenities === 'string') {
                try {
                    amenities = JSON.parse(req.body.amenities);
                    if (!Array.isArray(amenities)) {
                        amenities = [amenities];
                    }
                } catch {
                    amenities = [req.body.amenities];
                }
            } else {
                const amenityKeys = Object.keys(req.body).filter(key => key.startsWith('amenities['));
                if (amenityKeys.length > 0) {
                    amenities = amenityKeys
                        .sort((a, b) => {
                            const indexA = parseInt(a.match(/\[(\d+)\]/)?.[1] || '0');
                            const indexB = parseInt(b.match(/\[(\d+)\]/)?.[1] || '0');
                            return indexA - indexB;
                        })
                        .map(key => req.body[key])
                        .filter(Boolean);
                }
            }
        }

        // Extract and convert data types
        const id = req.body.id;
        const title = req.body.title?.trim();
        const location = req.body.location?.trim();
        const price = parseFloat(req.body.price);
        const beds = parseInt(req.body.beds);
        const baths = parseInt(req.body.baths);
        const sqft = parseInt(req.body.sqft);
        const type = req.body.type?.trim();
        const availability = req.body.availability?.trim();
        const description = req.body.description?.trim();
        const phone = req.body.phone?.trim() || '';

        // Validate required fields
        if (!id) {
            return res.status(400).json({ message: "Property ID is required", success: false });
        }

        if (!title || !location || !type || !availability || !description) {
            return res.status(400).json({ 
                message: "Missing required fields: title, location, type, availability, and description are required", 
                success: false 
            });
        }

        // Validate numeric fields
        if (isNaN(price) || price < 0) {
            return res.status(400).json({ 
                message: "Invalid price: must be a positive number", 
                success: false 
            });
        }
        if (isNaN(beds) || beds < 0) {
            return res.status(400).json({ 
                message: "Invalid beds: must be a non-negative integer", 
                success: false 
            });
        }
        if (isNaN(baths) || baths < 0) {
            return res.status(400).json({ 
                message: "Invalid baths: must be a non-negative integer", 
                success: false 
            });
        }
        if (isNaN(sqft) || sqft < 0) {
            return res.status(400).json({ 
                message: "Invalid sqft: must be a non-negative integer", 
                success: false 
            });
        }

        const property = await Property.findByPk(id);
        if (!property) {
            console.log("Property not found with ID:", id);
            return res.status(404).json({ message: "Property not found", success: false });
        }

        // Determine folder name based on property type (use type from request if provided, otherwise existing property type)
        const propertyType = type || property.type;
        const folderName = propertyType.toLowerCase() === 'plot' ? 'plots' : 'properties';

        // Get existing images
        let existingImages = [];
        if (property.image) {
            if (Array.isArray(property.image)) {
                existingImages = property.image;
            } else if (typeof property.image === 'string') {
                try {
                    existingImages = JSON.parse(property.image);
                    if (!Array.isArray(existingImages)) {
                        existingImages = [existingImages];
                    }
                } catch {
                    existingImages = [property.image];
                }
            }
        }

        // Helper function to save a single image (with ImageKit fallback to local storage)
        const saveImage = async (imageFile, isFrontImage = false) => {
            if (!imageFile) return null;
            
            let imageKitAttempted = false;
            let imageKitSucceeded = false;
            let imageUrl = null;
            
            // Try ImageKit first if configured
            if (isImageKitConfigured && imagekit) {
                imageKitAttempted = true;
                try {
                    console.log(`🔄 Attempting ImageKit upload for ${isFrontImage ? 'front image' : 'image'}...`);
                    const filePath = imageFile.path;
                    if (fs.existsSync(filePath)) {
                        const fileBuffer = fs.readFileSync(filePath);
                        const folderPath = propertyType.toLowerCase() === 'plot' 
                            ? (isFrontImage ? "Plot/Front" : "Plot")
                            : (isFrontImage ? "Property/Front" : "Property");
                        
                        const result = await imagekit.upload({
                            file: fileBuffer,
                            fileName: imageFile.originalname,
                            folder: folderPath,
                        });
                        
                        fs.unlink(filePath, (err) => {
                            if (err) console.error("Error deleting temp file:", err);
                        });
                        
                        imageUrl = result.url;
                        imageKitSucceeded = true;
                        console.log(`✅ Image uploaded to ImageKit: ${imageUrl}`);
                    } else {
                        console.error(`❌ ImageKit: File path does not exist: ${filePath}`);
                        throw new Error('File path does not exist for ImageKit upload');
                    }
                } catch (imageKitError) {
                    console.error(`❌ ImageKit upload failed: ${imageKitError.message}`);
                    console.log(`📦 Falling back to local storage...`);
                    imageKitSucceeded = false;
                }
            }
            
            // Save locally if ImageKit not configured or ImageKit failed
            if (!imageKitSucceeded) {
                try {
                    const baseUploadsDir = path.join(__dirname, '..', 'uploads');
                    if (!fs.existsSync(baseUploadsDir)) {
                        fs.mkdirSync(baseUploadsDir, { recursive: true });
                        console.log(`📁 Created base uploads directory: ${baseUploadsDir}`);
                    }
                    
                    const uploadsDir = path.join(__dirname, '..', 'uploads', folderName);
                    if (!fs.existsSync(uploadsDir)) {
                        fs.mkdirSync(uploadsDir, { recursive: true });
                        console.log(`📁 Created ${folderName} directory: ${uploadsDir}`);
                    } else {
                        console.log(`📁 ${folderName} directory already exists: ${uploadsDir}`);
                    }
                    
                    const filePath = imageFile.path;
                    console.log(`📂 Checking temp file path for local save: ${filePath}`);
                    console.log(`   File exists: ${fs.existsSync(filePath)}`);
                    
                    if (!filePath) {
                        console.error(`❌ Local Save: Image file path is undefined or null!`);
                        console.error(`   imageFile object:`, imageFile);
                        return null;
                    } else if (fs.existsSync(filePath)) {
                        const timestamp = Date.now();
                        const randomSuffix = Math.random().toString(36).substring(2, 8);
                        const ext = path.extname(imageFile.originalname) || '.jpg';
                        const baseName = path.basename(imageFile.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
                        const prefix = isFrontImage ? 'front-' : '';
                        const newFileName = `${prefix}${folderName === 'plots' ? 'plot' : 'property'}-${timestamp}-${randomSuffix}-${baseName}${ext}`;
                        const newFilePath = path.join(uploadsDir, newFileName);
                        
                        console.log(`📝 Preparing to save image locally:`);
                        console.log(`   Source: ${filePath}`);
                        console.log(`   Destination: ${newFilePath}`);
                        console.log(`   File name: ${newFileName}`);
                        
                        try {
                            fs.copyFileSync(filePath, newFilePath);
                            if (fs.existsSync(newFilePath)) {
                                const stats = fs.statSync(newFilePath);
                                console.log(`✅ Image saved locally successfully!`);
                                console.log(`   File path: ${newFilePath}`);
                                console.log(`   File size: ${stats.size} bytes`);
                                
                                try {
                                    fs.unlinkSync(filePath);
                                    console.log(`🗑️ Temporary file deleted: ${filePath}`);
                                } catch (unlinkErr) {
                                    console.error(`⚠️ Error deleting temp file: ${unlinkErr.message}`);
                                }
                                
                                imageUrl = `/uploads/${folderName}/${newFileName}`;
                                console.log(`✅ Local Image URL generated: ${imageUrl}`);
                            } else {
                                console.error(`❌ Failed to save image locally - file does not exist after copy`);
                                console.error(`   Expected path: ${newFilePath}`);
                                return null;
                            }
                        } catch (copyError) {
                            console.error(`❌ Error copying image file locally:`, copyError);
                            console.error(`   Error message: ${copyError.message}`);
                            console.error(`   Error stack: ${copyError.stack}`);
                            return null;
                        }
                    } else {
                        console.error(`❌ Local Save: Image file path does not exist: ${filePath}`);
                        console.error(`   Current working directory: ${process.cwd()}`);
                        return null;
                    }
                } catch (localSaveError) {
                    console.error(`❌ Local save error:`, localSaveError);
                    console.error(`   Error message: ${localSaveError.message}`);
                    return null;
                }
            }
            
            return imageUrl;
        };
        
        // Handle frontImage update
        let newFrontImageUrl = null;
        const frontImageFile = req.files?.frontImage?.[0];
        if (frontImageFile) {
            console.log(`🖼️  Processing new front image: ${frontImageFile.originalname}`);
            newFrontImageUrl = await saveImage(frontImageFile, true);
        }
        
        // Handle new images if provided
        let newImageUrls = [];
        if (req.files && Object.keys(req.files).length > 0) {
            const image1 = req.files?.image1?.[0];
            const image2 = req.files?.image2?.[0];
            const image3 = req.files?.image3?.[0];
            const image4 = req.files?.image4?.[0];

            const newImages = [image1, image2, image3, image4].filter((item) => item !== undefined);

            if (newImages.length > 0) {
                try {
                    console.log(`📸 Processing ${newImages.length} new image(s)...`);
                    newImageUrls = await Promise.all(
                        newImages.map(async (item) => {
                            return await saveImage(item, false);
                        })
                    );
                    newImageUrls = newImageUrls.filter(url => url !== null);
                    console.log(`\n📊 New image processing complete: ${newImageUrls.length}/${newImages.length} images saved`);
                } catch (imageError) {
                    console.error("❌ Error processing images:", imageError);
                }
            }
        }

        // Determine final images
        // If new images are provided, use them (they replace existing ones)
        // Otherwise, keep existing images
        const finalImages = newImageUrls.length > 0 ? newImageUrls : existingImages;
        
        // Determine final frontImage
        // If new frontImage is provided, use it; otherwise keep existing
        const finalFrontImage = newFrontImageUrl !== null ? newFrontImageUrl : property.frontImage;

        // Update property with proper types and validation
        property.title = title;
        property.location = location;
        property.price = Number(price); // Ensure it's a number
        property.beds = Number(beds); // Ensure it's an integer
        property.baths = Number(baths); // Ensure it's an integer
        property.sqft = Number(sqft); // Ensure it's an integer
        property.type = type;
        property.availability = availability;
        property.description = description;
        property.frontImage = finalFrontImage; // Update frontImage
        property.amenities = Array.isArray(amenities) && amenities.length > 0 ? amenities : [];
        property.image = Array.isArray(finalImages) && finalImages.length > 0 ? finalImages : [];
        property.phone = phone || 'N/A';

        const hasYoutubeBodyKey =
            req.body &&
            typeof req.body === 'object' &&
            Object.keys(req.body).some((k) => {
                const nk = k.toLowerCase().replace(/_/g, '');
                return nk === 'youtubeurl' || (/youtube/i.test(k) && /url/i.test(k));
            });
        const hasYoutubeHeader = ['x-property-youtube-url', 'x-youtube-url'].some((h) => req.get(h) != null);
        const hasYoutubeQuery = hasYoutubeUrlQuery(req);
        if (hasYoutubeBodyKey || hasYoutubeHeader || hasYoutubeQuery) {
            const ytResolved = resolveYoutubeRawFromRequest(req, ['x-property-youtube-url', 'x-youtube-url']);
            property.youtubeUrl = persistYoutubeForDb(ytResolved);
            console.log('[youtube] Property update — applied from request | raw:', ytResolved ? String(ytResolved).slice(0, 120) : '(empty)', '| stored:', property.youtubeUrl ?? 'NULL');
            if (ytResolved && !property.youtubeUrl) {
                console.warn('⚠️ youtubeUrl rejected (saving null):', String(ytResolved).slice(0, 120));
            }
        }

        // Save to database (omitNull: false so clearing youtubeUrl writes NULL)
        await property.save({ omitNull: false });

        // Verify the property was updated correctly
        const updatedProperty = await Property.findByPk(id);
        if (!updatedProperty) {
            throw new Error('Property was not updated correctly');
        }

        // Get base URL for converting relative paths to absolute URLs
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        // Get the updated data to verify
        const updatedData = updatedProperty.toJSON();
        
        // Convert frontImage to full URL if it's a local path
        if (updatedData.frontImage && typeof updatedData.frontImage === 'string' && updatedData.frontImage.startsWith('/uploads/')) {
            updatedData.frontImage = `${baseUrl}${updatedData.frontImage}`;
        }
        
        // Ensure images and amenities are arrays in the response
        if (!Array.isArray(updatedData.image)) {
            if (typeof updatedData.image === 'string') {
                try {
                    updatedData.image = JSON.parse(updatedData.image);
                } catch {
                    updatedData.image = [updatedData.image];
                }
            } else {
                updatedData.image = [];
            }
        }
        
        // Convert local paths to full URLs
        updatedData.image = updatedData.image.map(img => {
            if (typeof img === 'string' && img.startsWith('/uploads/')) {
                return `${baseUrl}${img}`;
            }
            return img;
        });
        
        if (!Array.isArray(updatedData.amenities)) {
            if (typeof updatedData.amenities === 'string') {
                try {
                    updatedData.amenities = JSON.parse(updatedData.amenities);
                } catch {
                    updatedData.amenities = [];
                }
            } else {
                updatedData.amenities = [];
            }
        }

        console.log('Property updated successfully with ID:', updatedData.id);
        if (updatedData.youtubeUrl) {
            console.log('✅ [Property update] youtubeUrl in database:', updatedData.youtubeUrl);
        } else if (hasYoutubeBodyKey || hasYoutubeHeader || hasYoutubeQuery) {
            console.warn('⚠️ [Property update] youtubeUrl fields present but value is NULL in DB.');
        }
        console.log('Images saved:', updatedData.image.length, 'images');
        console.log('Amenities saved:', updatedData.amenities.length, 'amenities');

        res.json({ 
            message: "Property updated successfully", 
            success: true, 
            property: updatedData 
        });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ 
            message: error.message || "Server Error", 
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

const singleproperty = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔍 Fetching property with ID: ${id}`);
        console.log(`   ID type: ${typeof id}, value: ${id}`);
        console.log(`   Request URL: ${req.url}`);
        console.log(`   Request method: ${req.method}`);
        
        if (!id || id === 'undefined' || id === 'null') {
            console.error(`❌ Invalid property ID: ${id}`);
            return res.status(400).json({ message: "Invalid property ID", success: false });
        }
        
        // Parse ID to integer
        const propertyId = parseInt(id, 10);
        if (isNaN(propertyId) || propertyId <= 0) {
            console.error(`❌ Invalid property ID format: ${id}`);
            return res.status(400).json({ message: "Invalid property ID format", success: false });
        }
        
        console.log(`   Parsed property ID: ${propertyId}`);
        const property = await Property.findByPk(propertyId);
        if (!property) {
            console.log(`❌ Property with ID ${propertyId} not found in database`);
            // Check if any properties exist
            const count = await Property.count();
            console.log(`   Total properties in database: ${count}`);
            return res.status(404).json({ message: "Property not found", success: false });
        }
        
        console.log(`✅ Property found: ${property.title} (ID: ${property.id})`);
        
        // Get base URL for converting relative paths to absolute URLs
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        // Convert Sequelize instance to plain object and normalize JSON fields
        const propertyData = property.toJSON();
        
        // Convert frontImage to full URL if it's a local path
        if (propertyData.frontImage && typeof propertyData.frontImage === 'string' && propertyData.frontImage.startsWith('/uploads/')) {
            propertyData.frontImage = `${baseUrl}${propertyData.frontImage}`;
        }
        
        // Ensure image is always an array and convert local paths to full URLs
        if (propertyData.image) {
            if (typeof propertyData.image === 'string') {
                try {
                    propertyData.image = JSON.parse(propertyData.image);
                } catch {
                    propertyData.image = [propertyData.image];
                }
            }
            if (!Array.isArray(propertyData.image)) {
                propertyData.image = [];
            }
            
            // Convert local paths to full URLs
            propertyData.image = propertyData.image.map(img => {
                if (typeof img === 'string' && img.startsWith('/uploads/')) {
                    return `${baseUrl}${img}`;
                }
                return img;
            });
        } else {
            propertyData.image = [];
        }
        
        // Ensure amenities is always an array
        if (propertyData.amenities) {
            if (typeof propertyData.amenities === 'string') {
                try {
                    propertyData.amenities = JSON.parse(propertyData.amenities);
                } catch {
                    propertyData.amenities = [propertyData.amenities];
                }
            }
            if (!Array.isArray(propertyData.amenities)) {
                propertyData.amenities = [];
            }
        } else {
            propertyData.amenities = [];
        }
        
        console.log(`✅ Successfully returning property data for ID: ${id}`);
        res.json({ property: propertyData, success: true });
    } catch (error) {
        console.error("❌ Error fetching property:", error);
        console.error("Error stack:", error.stack);
        res.status(500).json({ 
            message: error.message || "Server Error", 
            success: false,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export { addproperty, listproperty, removeproperty, updateproperty , singleproperty};