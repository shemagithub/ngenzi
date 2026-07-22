import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import imagekit, { isImageKitConfigured } from "../config/imagekit.js";
import Plot from "../models/plotmodel.js";
import { sequelize } from "../config/mysql.js";
import { persistYoutubeForDb, resolveYoutubeRawFromRequest, hasYoutubeUrlQuery } from "../utils/youtubeUrl.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const addplot = async (req, res) => {
    try {
        // Ensure the Plot model is synced with the database
        try {
            await Plot.sync({ alter: false }); // Don't alter existing tables, just ensure it exists
        } catch (syncError) {
            console.warn('⚠️  Warning: Could not sync Plot model:', syncError.message);
            // Continue anyway, table might already exist
        }
        
        // Verify table exists and has correct structure
        try {
            const [tableCheck] = await sequelize.query(
                "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'plots'",
                { type: sequelize.QueryTypes.SELECT }
            );
            if (!tableCheck || tableCheck.count === 0) {
                console.error('❌ Plots table does not exist!');
                throw new Error('Plots table does not exist. Please run the database migration script first.');
            }
            
            // Check if AUTO_INCREMENT is set
            const [autoIncCheck] = await sequelize.query(
                "SELECT AUTO_INCREMENT FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'plots'",
                { type: sequelize.QueryTypes.SELECT }
            );
            if (!autoIncCheck || !autoIncCheck.AUTO_INCREMENT) {
                console.warn('⚠️  Warning: AUTO_INCREMENT may not be set correctly on plots table');
            } else {
                console.log(`✅ Plots table exists with AUTO_INCREMENT = ${autoIncCheck.AUTO_INCREMENT}`);
            }
        } catch (tableError) {
            console.error('Error checking table:', tableError);
            // Continue anyway - the sync should have created it
        }
        
        console.log('Request body keys:', Object.keys(req.body));
        console.log('Request files:', req.files ? Object.keys(req.files) : 'No files');
        
        // Parse amenities from FormData array format
        let amenities = [];
        if (Array.isArray(req.body.amenities)) {
            amenities = req.body.amenities.filter(Boolean);
        } else if (typeof req.body.amenities === 'string' && req.body.amenities.trim()) {
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
        
        // Extract and convert data types
        const title = req.body.title?.trim();
        const location = req.body.location?.trim();
        const price = parseFloat(req.body.price);
        const area = parseFloat(req.body.area || req.body.sqft); // Support both 'area' and 'sqft'
        const areaUnit = req.body.areaUnit?.trim() || 'sqft';
        const type = req.body.type?.trim() || 'Plot';
        const availability = req.body.availability?.trim();
        const description = req.body.description?.trim();
        const phone = req.body.phone?.trim() || '';
        const plotNumber = req.body.plotNumber?.trim() || null;
        const surveyNumber = req.body.surveyNumber?.trim() || null;
        const facing = req.body.facing?.trim() || null;
        const cornerPlot = req.body.cornerPlot === 'true' || req.body.cornerPlot === true;
        const approvedLayout = req.body.approvedLayout === 'true' || req.body.approvedLayout === true;

        // Validate required fields
        if (!title || !location || !availability || !description) {
            return res.status(400).json({ 
                message: "Missing required fields: title, location, availability, and description are required", 
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
        if (isNaN(area) || area < 0) {
            return res.status(400).json({ 
                message: "Invalid area: must be a positive number", 
                success: false 
            });
        }

        // Handle images
        console.log('📁 Checking for uploaded images...');
        console.log('req.files keys:', req.files ? Object.keys(req.files) : 'No files object');
        
        const frontImageFile = req.files?.frontImage?.[0];
        const image1 = req.files?.image1?.[0];
        const image2 = req.files?.image2?.[0];
        const image3 = req.files?.image3?.[0];
        const image4 = req.files?.image4?.[0];
        const images = [image1, image2, image3, image4].filter((item) => item !== undefined);
        
        console.log(`📸 Found ${images.length} image(s) to process`);
        if (images.length > 0) {
            images.forEach((img, idx) => {
                console.log(`  Image ${idx + 1}: ${img.originalname} (${img.size} bytes) at ${img.path}`);
            });
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
                        const folderPath = isFrontImage ? "Plot/Front" : "Plot";
                        
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
                    
                    const uploadsDir = path.join(__dirname, '..', 'uploads', 'plots');
                    if (!fs.existsSync(uploadsDir)) {
                        fs.mkdirSync(uploadsDir, { recursive: true });
                        console.log(`📁 Created plots directory: ${uploadsDir}`);
                    } else {
                        console.log(`📁 Plots directory already exists: ${uploadsDir}`);
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
                        const newFileName = `${prefix}plot-${timestamp}-${randomSuffix}-${baseName}${ext}`;
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
                                
                                imageUrl = `/uploads/plots/${newFileName}`;
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
            frontImageUrl = await saveImage(frontImageFile, true);
        }
        
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
                console.error("Error processing images:", imageError);
                console.warn("⚠️  Continuing without images due to error");
            }
        }
        
        console.log(`\n📸 Total images to save to database: ${imageUrls.length}`);
        if (imageUrls.length > 0) {
            console.log('   Image URLs:', imageUrls);
        } else {
            console.warn('   ⚠️  WARNING: No images will be saved!');
        }

        // Resolve YouTube after multipart is fully parsed (body + query + originalUrl fallback)
        const ytResolved = resolveYoutubeRawFromRequest(req, ['x-plot-youtube-url', 'x-youtube-url']);
        const youtubeUrl = persistYoutubeForDb(ytResolved);
        console.log('[youtube] Plot add — originalUrl tail:', (req.originalUrl || '').slice(-160));
        console.log('[youtube] Plot add — body keys:', req.body ? Object.keys(req.body) : [], '| raw:', ytResolved ? String(ytResolved).slice(0, 120) : '(empty)', '| persisted:', youtubeUrl ?? 'NULL');
        if (ytResolved && !youtubeUrl) {
            console.warn('⚠️ youtubeUrl rejected (not a valid YouTube URL):', String(ytResolved).slice(0, 120));
        }
        
        // Prepare plot data with proper type conversion and validation
        const plotData = {
            title: title?.trim() || '',
            location: location?.trim() || '',
            price: price ? parseFloat(price) : 0,
            area: area ? parseFloat(area) : 0,
            areaUnit: areaUnit?.trim() || 'sqft',
            type: type?.trim() || 'Plot',
            availability: availability?.trim() || '',
            description: description?.trim() || '',
            amenities: Array.isArray(amenities) ? amenities : (amenities ? [amenities] : []),
            frontImage: frontImageUrl || null,
            image: Array.isArray(imageUrls) && imageUrls.length > 0 ? imageUrls : [],
            phone: phone?.trim() || 'N/A',
            plotNumber: plotNumber?.trim() || null,
            surveyNumber: surveyNumber?.trim() || null,
            facing: facing?.trim() || null,
            cornerPlot: cornerPlot === true || cornerPlot === 'true' || cornerPlot === 1,
            approvedLayout: approvedLayout === true || approvedLayout === 'true' || approvedLayout === 1,
            youtubeUrl
        };
        
        console.log('\n💾 Plot data to save:');
        console.log(`   Title: ${plotData.title}`);
        console.log(`   Location: ${plotData.location}`);
        console.log(`   Price: ${plotData.price} (type: ${typeof plotData.price})`);
        console.log(`   Area: ${plotData.area} (type: ${typeof plotData.area})`);
        console.log(`   Availability: ${plotData.availability}`);
        console.log(`   Phone: ${plotData.phone}`);
        console.log(`   Front Image: ${plotData.frontImage || 'None'}`);
        console.log(`   Images array length: ${plotData.image.length}`);
        console.log(`   Images:`, plotData.image);
        console.log(`   Amenities:`, plotData.amenities);
        console.log(`   Image field type: ${typeof plotData.image} (isArray: ${Array.isArray(plotData.image)})`);
        
        // Validate required fields before attempting to save
        const validationErrors = [];
        if (!plotData.title || plotData.title.trim() === '') {
            validationErrors.push('title is required and cannot be empty');
        }
        if (!plotData.location || plotData.location.trim() === '') {
            validationErrors.push('location is required and cannot be empty');
        }
        if (!plotData.price || isNaN(plotData.price) || plotData.price <= 0) {
            validationErrors.push(`price must be a positive number (got: ${price})`);
        }
        if (!plotData.area || isNaN(plotData.area) || plotData.area <= 0) {
            validationErrors.push(`area must be a positive number (got: ${area})`);
        }
        if (!plotData.availability || plotData.availability.trim() === '') {
            validationErrors.push('availability is required');
        }
        if (!plotData.description || plotData.description.trim() === '') {
            validationErrors.push('description is required and cannot be empty');
        }
        if (!plotData.phone || plotData.phone.trim() === '' || plotData.phone === 'N/A') {
            validationErrors.push('phone is required');
        }
        
        if (validationErrors.length > 0) {
            console.error('❌ Validation errors before database save:', validationErrors);
            throw new Error(`Validation error: ${validationErrors.join(', ')}`);
        }
        
        // Ensure amenities is always an array (required by model)
        if (!Array.isArray(plotData.amenities)) {
            console.warn('⚠️  Warning: amenities is not an array, converting...');
            plotData.amenities = [];
        }
        
        // Ensure image is always an array (required by model)
        if (!Array.isArray(plotData.image)) {
            console.warn('⚠️  Warning: image is not an array, converting...');
            plotData.image = [];
        }
        
        // Create plot in database
        console.log('\n💾 Saving to database...');
        console.log('Plot data being saved:', JSON.stringify(plotData, null, 2));
        
        let plot;
        let plotId;
        try {
            // Use Sequelize create with explicit options to ensure ID is returned
            plot = await Plot.create(plotData, {
                returning: true,
                plain: true
            });
            
            // Try multiple methods to get the ID
            plotId = plot?.id 
                || plot?.dataValues?.id 
                || plot?.get?.('id')
                || plot?.getDataValue?.('id')
                || (plot && typeof plot.get === 'function' ? plot.get('id') : null);
            
            // If still no ID, try to get it from the plain object
            if (!plotId && plot) {
                try {
                    const plainPlot = plot.get ? plot.get({ plain: true }) : plot;
                    plotId = plainPlot?.id || plainPlot?.dataValues?.id;
                } catch (e) {
                    console.warn('Could not get plain object:', e.message);
                }
            }
            
            console.log(`✅ Plot created. ID check: ${plotId || 'not found yet'}`);
            console.log(`Plot object keys:`, plot ? Object.keys(plot) : 'no plot object');
            console.log(`Plot dataValues:`, plot?.dataValues ? Object.keys(plot.dataValues) : 'no dataValues');
            
            // If we still don't have an ID, use raw SQL to get LAST_INSERT_ID()
            if (!plotId) {
                console.warn('⚠️  Warning: ID not in Sequelize response. Using LAST_INSERT_ID()...');
                try {
                    const [results] = await sequelize.query('SELECT LAST_INSERT_ID() as id');
                    if (results && results.length > 0 && results[0].id) {
                        plotId = results[0].id;
                        console.log(`✅ Got ID from LAST_INSERT_ID(): ${plotId}`);
                        
                        // Fetch the plot with the ID we just got
                        plot = await Plot.findByPk(plotId);
                        if (!plot) {
                            throw new Error('Plot was created but could not be retrieved with the ID from LAST_INSERT_ID()');
                        }
                    }
                } catch (lastInsertError) {
                    console.error('Error getting LAST_INSERT_ID:', lastInsertError);
                }
            }
            
            // If still no ID, try to find by matching fields
            if (!plotId) {
                console.warn('⚠️  Warning: Still no ID. Attempting to find plot by matching fields...');
                try {
                    const foundPlot = await Plot.findOne({
                        where: {
                            title: plotData.title,
                            location: plotData.location,
                            price: plotData.price,
                            area: plotData.area
                        },
                        order: [['createdAt', 'DESC']],
                        limit: 1
                    });
                    
                    if (foundPlot && foundPlot.id) {
                        plot = foundPlot;
                        plotId = foundPlot.id;
                        console.log(`✅ Found plot with ID: ${plotId}`);
                    }
                } catch (findError) {
                    console.error('Error finding plot:', findError);
                }
            }
            
            // Final check - if still no ID, it's a real problem
            if (!plotId) {
                console.error('❌ Critical: Plot was created but could not retrieve ID');
                console.error('Plot object:', plot);
                console.error('Plot dataValues:', plot?.dataValues);
                
                // Try one more time with a direct database query
                try {
                    const [results] = await sequelize.query(
                        'SELECT id FROM plots ORDER BY id DESC LIMIT 1',
                        { type: sequelize.QueryTypes.SELECT }
                    );
                    if (results && results.id) {
                        plotId = results.id;
                        plot = await Plot.findByPk(plotId);
                        console.log(`✅ Retrieved ID from direct query: ${plotId}`);
                    }
                } catch (finalError) {
                    console.error('Final attempt failed:', finalError);
                }
                
                if (!plotId) {
                    throw new Error('Plot was created but could not retrieve the ID. Please check the database table structure and auto-increment settings. The plot may have been created - check the database directly.');
                }
            }
            
            // Ensure plot object has the ID
            if (plot && !plot.id && plotId) {
                plot.id = plotId;
                if (plot.dataValues) {
                    plot.dataValues.id = plotId;
                }
            }
            
            console.log(`✅ Final plot ID: ${plotId}`);
            
        } catch (createError) {
            console.error('❌ Error creating plot in database:', createError);
            console.error('Error details:', {
                name: createError.name,
                message: createError.message,
                stack: createError.stack
            });
            
            // Log the plotData that was being saved for debugging
            console.error('Plot data that failed:', JSON.stringify(plotData, null, 2));
            
            // Provide more specific error messages
            if (createError.name === 'SequelizeDatabaseError') {
                throw new Error(`Database error: ${createError.message}. Please check if the plots table exists and has the correct structure.`);
            } else if (createError.name === 'SequelizeValidationError') {
                // Log each validation error
                console.error('Validation errors:');
                createError.errors.forEach((err, index) => {
                    console.error(`  ${index + 1}. Field: ${err.path}, Value: ${err.value}, Message: ${err.message}`);
                });
                
                const validationErrors = createError.errors.map(e => {
                    const fieldName = e.path || 'unknown field';
                    const fieldValue = e.value !== undefined ? ` (value: ${JSON.stringify(e.value)})` : '';
                    return `${fieldName}: ${e.message}${fieldValue}`;
                }).join('; ');
                
                throw new Error(`Validation error: ${validationErrors}`);
            } else {
                throw new Error(`Failed to create plot: ${createError.message}`);
            }
        }
        
        // Use the created plot directly - ensure it has an ID
        if (!plot) {
            throw new Error('Plot creation failed - no plot object returned');
        }
        
        // Ensure the plot has an ID
        if (!plot.id && plotId) {
            plot.id = plotId;
            if (plot.dataValues) {
                plot.dataValues.id = plotId;
            }
        }
        
        // Convert plot to JSON for response
        let savedData;
        try {
            // Try to get plain object first
            if (typeof plot.get === 'function') {
                savedData = plot.get({ plain: true });
            } else if (plot.toJSON) {
                savedData = plot.toJSON();
            } else if (plot.dataValues) {
                savedData = { ...plot.dataValues };
            } else {
                savedData = { ...plot };
            }
            
            // Ensure ID is in savedData
            if (!savedData.id && plotId) {
                savedData.id = plotId;
            }
            
            console.log(`📊 Plot data retrieved:`);
            console.log(`   ID: ${savedData.id}`);
            console.log(`   Title: ${savedData.title}`);
            console.log(`   Front Image in DB: ${savedData.frontImage || 'None'}`);
            console.log(`   Images in DB (type: ${Array.isArray(savedData.image) ? 'array' : typeof savedData.image}):`, savedData.image);
            console.log(`   Image count: ${Array.isArray(savedData.image) ? savedData.image.length : 'N/A'}`);
            
            // Final verification - if still no ID, try one more fetch
            if (!savedData.id && plotId) {
                savedData.id = plotId;
            } else if (!savedData.id) {
                console.warn('⚠️  Warning: No ID in savedData, attempting final fetch...');
                try {
                    const finalPlot = await Plot.findByPk(plotId || plot.id);
                    if (finalPlot) {
                        savedData = finalPlot.get({ plain: true });
                        console.log('✅ Retrieved plot data from database');
                    }
                } catch (finalError) {
                    console.error('Final fetch error:', finalError);
                    // Continue anyway - the plot was created
                }
            }
            
        } catch (jsonError) {
            console.error('❌ Error converting plot to JSON:', jsonError);
            // Create a basic savedData object from plotData
            savedData = {
                ...plotData,
                id: plotId || plot.id,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            console.log('✅ Using fallback savedData');
        }
        
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

        const rowId = savedData.id || plotId;
        if (youtubeUrl && rowId) {
            try {
                await sequelize.query(
                    'UPDATE `plots` SET `youtubeUrl` = :v WHERE `id` = :id',
                    { replacements: { v: youtubeUrl, id: rowId } }
                );
                savedData.youtubeUrl = youtubeUrl;
                console.log('[youtube] Applied plots.youtubeUrl via SQL fallback');
            } catch (e1) {
                try {
                    await sequelize.query(
                        'UPDATE `plots` SET `youtube_url` = :v WHERE `id` = :id',
                        { replacements: { v: youtubeUrl, id: rowId } }
                    );
                    savedData.youtubeUrl = youtubeUrl;
                    console.log('[youtube] Applied plots.youtube_url via SQL fallback');
                } catch (e2) {
                    console.error('[youtube] SQL fallback failed:', e1.message, '|', e2.message);
                }
            }
        }

        if (savedData.youtubeUrl) {
            console.log(`✅ [Plot] youtubeUrl saved in database: ${savedData.youtubeUrl}`);
        } else if (ytResolved) {
            console.warn('⚠️ [Plot] youtubeUrl was provided but stored as NULL (invalid URL?).');
        } else {
            console.log('ℹ️ [Plot] youtubeUrl not provided — stored as NULL.');
        }

        res.json({ 
            message: "Plot added successfully", 
            success: true, 
            plot: savedData 
        });
    } catch (error) {
        console.error("Error adding plot:", error);
        const sqlMsg = error.parent?.sqlMessage || error.original?.sqlMessage;
        const hint =
            sqlMsg && /Unknown column ['`]?youtubeUrl/i.test(sqlMsg)
                ? ' Run backend/scripts/add-plots-youtube-url.sql (or create-or-update-plots-table.sql) on your database to add the youtubeUrl column.'
                : '';
        res.status(500).json({
            message: (sqlMsg || error.message || "Server Error") + hint,
            success: false,
            error: process.env.NODE_ENV === 'development' ? (error.stack || sqlMsg) : undefined
        });
    }
};

const listplot = async (req, res) => {
    try {
        const plots = await Plot.findAll({
            order: [['createdAt', 'DESC']]
        });
        
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        const plotData = plots.map(plot => {
            const data = plot.toJSON();
            
            if (data.frontImage && typeof data.frontImage === 'string' && data.frontImage.startsWith('/uploads/')) {
                data.frontImage = `${baseUrl}${data.frontImage}`;
            }
            
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
                
                data.image = data.image.map(img => {
                    if (typeof img === 'string' && img.startsWith('/uploads/')) {
                        return `${baseUrl}${img}`;
                    }
                    return img;
                });
            } else {
                data.image = [];
            }
            
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
        
        res.json({ success: true, plots: plotData });
    } catch (error) {
        console.error("Error listing plots:", error);
        res.status(500).json({ message: "Server Error", success: false });
    }
};

const removeplot = async (req, res) => {
    try {
        const deletedCount = await Plot.destroy({ where: { id: req.body.id } });
        if (deletedCount === 0) {
            return res.status(404).json({ message: "Plot not found", success: false });
        }
        return res.json({ message: "Plot removed successfully", success: true });
    } catch (error) {
        console.log("Error removing plot: ", error);
        return res.status(500).json({ message: "Server Error", success: false });
    }
};

const updateplot = async (req, res) => {
    try {
        const plotId = req.body.id;
        if (!plotId) {
            return res.status(400).json({ message: "Plot ID is required", success: false });
        }

        // Parse amenities
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

        // Build update data
        const updateData = {};
        if (req.body.title) updateData.title = req.body.title.trim();
        if (req.body.location) updateData.location = req.body.location.trim();
        if (req.body.price) updateData.price = parseFloat(req.body.price);
        if (req.body.area || req.body.sqft) updateData.area = parseFloat(req.body.area || req.body.sqft);
        if (req.body.areaUnit) updateData.areaUnit = req.body.areaUnit.trim();
        if (req.body.type) updateData.type = req.body.type.trim();
        if (req.body.availability) updateData.availability = req.body.availability.trim();
        if (req.body.description) updateData.description = req.body.description.trim();
        if (req.body.phone) updateData.phone = req.body.phone.trim();
        if (req.body.plotNumber !== undefined) updateData.plotNumber = req.body.plotNumber?.trim() || null;
        if (req.body.surveyNumber !== undefined) updateData.surveyNumber = req.body.surveyNumber?.trim() || null;
        if (req.body.facing !== undefined) updateData.facing = req.body.facing?.trim() || null;
        if (req.body.cornerPlot !== undefined) updateData.cornerPlot = req.body.cornerPlot === 'true' || req.body.cornerPlot === true;
        if (req.body.approvedLayout !== undefined) updateData.approvedLayout = req.body.approvedLayout === 'true' || req.body.approvedLayout === true;
        if (amenities.length > 0) updateData.amenities = amenities;
        const hasYoutubeBodyKey =
            req.body &&
            typeof req.body === 'object' &&
            Object.keys(req.body).some((k) => {
                const nk = k.toLowerCase().replace(/_/g, '');
                return nk === 'youtubeurl' || (/youtube/i.test(k) && /url/i.test(k));
            });
        const hasYoutubeHeader = ['x-plot-youtube-url', 'x-youtube-url'].some((h) => req.get(h) != null);
        const hasYoutubeQuery = hasYoutubeUrlQuery(req);
        if (hasYoutubeBodyKey || hasYoutubeHeader || hasYoutubeQuery) {
            const ytResolved = resolveYoutubeRawFromRequest(req, ['x-plot-youtube-url', 'x-youtube-url']);
            updateData.youtubeUrl = persistYoutubeForDb(ytResolved);
            console.log('[youtube] Plot update — raw:', ytResolved ? String(ytResolved).slice(0, 120) : '(empty)', '| persisted:', updateData.youtubeUrl ?? 'NULL');
            if (ytResolved && !updateData.youtubeUrl) {
                console.warn('⚠️ youtubeUrl rejected (saving null):', String(ytResolved).slice(0, 120));
            }
        }

        // Handle images (similar to addplot)
        const frontImageFile = req.files?.frontImage?.[0];
        const image1 = req.files?.image1?.[0];
        const image2 = req.files?.image2?.[0];
        const image3 = req.files?.image3?.[0];
        const image4 = req.files?.image4?.[0];
        const newImages = [image1, image2, image3, image4].filter((item) => item !== undefined);
        
        // Helper function to save a single image (same as in addplot)
        const saveImage = async (imageFile, isFrontImage = false) => {
            if (!imageFile) return null;
            
            let imageKitSucceeded = false;
            let imageUrl = null;
            
            // Try ImageKit first if configured
            if (isImageKitConfigured && imagekit) {
                try {
                    const filePath = imageFile.path;
                    if (fs.existsSync(filePath)) {
                        const fileBuffer = fs.readFileSync(filePath);
                        const folderPath = isFrontImage ? "Plot/Front" : "Plot";
                        
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
                    }
                } catch (imageKitError) {
                    console.error(`❌ ImageKit upload failed: ${imageKitError.message}`);
                    console.log(`📦 Falling back to local storage...`);
                }
            }
            
            // Save locally if ImageKit not configured or ImageKit failed
            if (!imageKitSucceeded) {
                try {
                    const uploadsDir = path.join(__dirname, '..', 'uploads', 'plots');
                    if (!fs.existsSync(uploadsDir)) {
                        fs.mkdirSync(uploadsDir, { recursive: true });
                    }
                    
                    const filePath = imageFile.path;
                    if (!filePath || !fs.existsSync(filePath)) {
                        return null;
                    }
                    
                    const timestamp = Date.now();
                    const randomSuffix = Math.random().toString(36).substring(2, 8);
                    const ext = path.extname(imageFile.originalname) || '.jpg';
                    const baseName = path.basename(imageFile.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
                    const prefix = isFrontImage ? 'front-' : '';
                    const newFileName = `${prefix}plot-${timestamp}-${randomSuffix}-${baseName}${ext}`;
                    const newFilePath = path.join(uploadsDir, newFileName);
                    
                    fs.copyFileSync(filePath, newFilePath);
                    if (fs.existsSync(newFilePath)) {
                        fs.unlinkSync(filePath);
                        imageUrl = `/uploads/plots/${newFileName}`;
                    }
                } catch (localSaveError) {
                    console.error(`❌ Local save error:`, localSaveError);
                    return null;
                }
            }
            
            return imageUrl;
        };
        
        // Handle front image update
        if (frontImageFile) {
            const newFrontImageUrl = await saveImage(frontImageFile, true);
            if (newFrontImageUrl) {
                updateData.frontImage = newFrontImageUrl;
            }
        }
        
        // Handle additional images update
        if (newImages.length > 0) {
            const existingPlot = await Plot.findByPk(plotId);
            let existingImages = [];
            if (existingPlot && existingPlot.image) {
                if (Array.isArray(existingPlot.image)) {
                    existingImages = existingPlot.image;
                } else if (typeof existingPlot.image === 'string') {
                    try {
                        existingImages = JSON.parse(existingPlot.image);
                    } catch {
                        existingImages = [existingPlot.image];
                    }
                }
            }
            
            const newImageUrls = await Promise.all(
                newImages.map(async (item) => await saveImage(item, false))
            );
            const validNewImages = newImageUrls.filter(url => url !== null);
            
            // Combine existing and new images
            updateData.image = [...existingImages, ...validNewImages];
        }
        
        const [updatedCount] = await Plot.update(updateData, {
            where: { id: plotId },
            omitNull: false
        });

        if (updatedCount === 0) {
            return res.status(404).json({ message: "Plot not found", success: false });
        }

        const updatedPlot = await Plot.findByPk(plotId);
        const u = updatedPlot?.get?.({ plain: true }) ?? updatedPlot?.toJSON?.() ?? updatedPlot;
        if (u?.youtubeUrl) {
            console.log('✅ [Plot update] youtubeUrl in database:', u.youtubeUrl);
        } else if (hasYoutubeBodyKey || hasYoutubeHeader || hasYoutubeQuery) {
            console.warn('⚠️ [Plot update] youtubeUrl fields sent but value is NULL in DB.');
        }
        res.json({ message: "Plot updated successfully", success: true, plot: updatedPlot });
    } catch (error) {
        console.error("Error updating plot:", error);
        const sqlMsg = error.parent?.sqlMessage || error.original?.sqlMessage;
        const hint =
            sqlMsg && /Unknown column ['`]?youtubeUrl/i.test(sqlMsg)
                ? ' Run backend/scripts/add-plots-youtube-url.sql on your database.'
                : '';
        res.status(500).json({
            message: (sqlMsg || error.message || "Server Error") + hint,
            success: false
        });
    }
};

const singleplot = async (req, res) => {
    try {
        const plotId = parseInt(req.params.id);
        if (isNaN(plotId) || plotId <= 0) {
            return res.status(400).json({ message: "Invalid plot ID", success: false });
        }

        const plot = await Plot.findByPk(plotId);
        if (!plot) {
            return res.status(404).json({ message: "Plot not found", success: false });
        }

        const plotData = plot.toJSON();
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        // Convert frontImage to full URL if it's a local path
        if (plotData.frontImage && typeof plotData.frontImage === 'string' && plotData.frontImage.startsWith('/uploads/')) {
            plotData.frontImage = `${baseUrl}${plotData.frontImage}`;
        }
        
        // Ensure images and amenities are arrays
        if (!Array.isArray(plotData.image)) {
            if (typeof plotData.image === 'string') {
                try {
                    plotData.image = JSON.parse(plotData.image);
                } catch {
                    plotData.image = [plotData.image];
                }
            } else {
                plotData.image = [];
            }
        }
        
        plotData.image = plotData.image.map(img => {
            if (typeof img === 'string' && img.startsWith('/uploads/')) {
                return `${baseUrl}${img}`;
            }
            return img;
        });
        
        if (!Array.isArray(plotData.amenities)) {
            if (typeof plotData.amenities === 'string') {
                try {
                    plotData.amenities = JSON.parse(plotData.amenities);
                } catch {
                    plotData.amenities = [];
                }
            } else {
                plotData.amenities = [];
            }
        }

        res.json({ success: true, plot: plotData });
    } catch (error) {
        console.error("Error fetching plot:", error);
        res.status(500).json({ message: "Server Error", success: false });
    }
};

export { addplot, listplot, removeplot, updateplot, singleplot };

