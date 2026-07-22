import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import imagekit, { isImageKitConfigured } from "../config/imagekit.js";
import Settings from "../models/settingsModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get settings (there should only be one settings record)
const getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        
        // If no settings exist, create default settings
        if (!settings) {
            settings = await Settings.create({
                companyName: 'NGENZI REALESTATE',
                companyEmail: 'support@ngenzirealestate.com'
            });
        }

        const settingsData = settings.toJSON();
        
        // Get base URL for converting relative paths to absolute URLs
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        // Convert logo to full URL if it's a local path
        if (settingsData.companyLogo && typeof settingsData.companyLogo === 'string') {
            if (settingsData.companyLogo.startsWith('/uploads/logo/') || settingsData.companyLogo.startsWith('/uploads/settings/')) {
                settingsData.companyLogo = `${baseUrl}${settingsData.companyLogo}`;
            }
        }

        res.json({ 
            success: true, 
            settings: settingsData 
        });
    } catch (error) {
        console.error("Error fetching settings:", error);
        res.status(500).json({ 
            message: "Server Error", 
            success: false 
        });
    }
};

// Update settings
const updateSettings = async (req, res) => {
    try {
        console.log('\n🔧 ========== UPDATE SETTINGS REQUEST ==========');
        console.log('📥 Request body keys:', Object.keys(req.body));
        console.log('📎 Request files:', req.files ? Object.keys(req.files) : 'No files');
        console.log('📎 req.file:', req.file ? 'Exists' : 'No file');
        
        // Detailed file logging
        if (req.files) {
            console.log('📎 Full req.files structure:');
            Object.keys(req.files).forEach(key => {
                const fileArray = req.files[key];
                if (Array.isArray(fileArray)) {
                    console.log(`   req.files['${key}']: Array with ${fileArray.length} items`);
                    fileArray.forEach((file, idx) => {
                        console.log(`     [${idx}]:`, {
                            fieldname: file.fieldname,
                            originalname: file.originalname,
                            path: file.path,
                            size: file.size
                        });
                    });
                } else {
                    console.log(`   req.files['${key}']:`, typeof fileArray);
                }
            });
        } else {
            console.log('📎 No req.files object found!');
        }
        
        // Get existing settings or create new one
        let settings = await Settings.findOne();
        
        if (!settings) {
            console.log('📝 Creating new settings record...');
            settings = await Settings.create({});
        } else {
            console.log(`📋 Found existing settings (ID: ${settings.id})`);
            console.log(`   Current logo: ${settings.companyLogo || 'None'}`);
        }

        // Handle logo upload
        let logoUrl = settings.companyLogo;
        let logoUploadSuccess = false;
        
        // Try multiple ways to access the file
        const logoFile = req.files?.logo?.[0] || req.file || null;
        
        console.log(`\n🖼️ Logo file check:`);
        console.log(`   req.files?.logo?.[0]: ${!!req.files?.logo?.[0]}`);
        console.log(`   req.file: ${!!req.file}`);
        console.log(`   logoFile: ${!!logoFile}`);
        
        if (logoFile) {
            console.log(`   ✅ Logo file found!`);
            console.log(`   File name: ${logoFile.originalname || logoFile.name || 'Unknown'}`);
            console.log(`   File size: ${logoFile.size || 'Unknown'} bytes`);
            console.log(`   File path: ${logoFile.path || 'Unknown'}`);
            console.log(`   File fieldname: ${logoFile.fieldname || 'Unknown'}`);
        } else {
            console.log(`   ❌ No logo file found in request!`);
            console.log(`   Checking req.files structure:`);
            if (req.files) {
                console.log(`     req.files keys: ${Object.keys(req.files).join(', ')}`);
                Object.keys(req.files).forEach(key => {
                    console.log(`     req.files[${key}]:`, Array.isArray(req.files[key]) ? req.files[key].length : 'not array');
                });
            }
        }
        
        if (logoFile) {
            // Try ImageKit first if configured, then fallback to local storage
            let imageKitAttempted = false;
            let imageKitSucceeded = false;
            
            if (isImageKitConfigured && imagekit) {
                imageKitAttempted = true;
                try {
                    console.log(`🔄 Attempting ImageKit upload...`);
                    const filePath = logoFile.path;
                    if (fs.existsSync(filePath)) {
                        const fileBuffer = fs.readFileSync(filePath);
                        const result = await imagekit.upload({
                            file: fileBuffer,
                            fileName: logoFile.originalname,
                            folder: "Logo",
                        });
                        
                        fs.unlink(filePath, (err) => {
                            if (err) console.error("Error deleting temp file:", err);
                        });
                        
                        logoUrl = result.url;
                        logoUploadSuccess = true;
                        imageKitSucceeded = true;
                        console.log(`✅ Logo uploaded to ImageKit: ${logoUrl}`);
                    } else {
                        console.error(`❌ Logo file path does not exist: ${filePath}`);
                        throw new Error('File path does not exist');
                    }
                } catch (imageKitError) {
                    console.error(`❌ ImageKit upload failed: ${imageKitError.message}`);
                    console.log(`📦 Falling back to local storage...`);
                    imageKitSucceeded = false;
                    // Continue to local storage fallback below
                }
            }
            
            // Save locally if ImageKit not configured or ImageKit failed
            if (!imageKitSucceeded) {
                try {
                    // Save locally in logo folder
                    // Ensure uploads directory exists first
                    const baseUploadsDir = path.join(__dirname, '..', 'uploads');
                    if (!fs.existsSync(baseUploadsDir)) {
                        fs.mkdirSync(baseUploadsDir, { recursive: true });
                        console.log(`📁 Created base uploads directory: ${baseUploadsDir}`);
                    }
                    
                    // Ensure logo directory exists
                    const uploadsDir = path.join(__dirname, '..', 'uploads', 'logo');
                    if (!fs.existsSync(uploadsDir)) {
                        fs.mkdirSync(uploadsDir, { recursive: true });
                        console.log(`📁 Created logo directory: ${uploadsDir}`);
                    } else {
                        console.log(`📁 Logo directory already exists: ${uploadsDir}`);
                    }
                    
                    const filePath = logoFile.path;
                    console.log(`📂 Checking temp file path: ${filePath}`);
                    console.log(`   File exists: ${fs.existsSync(filePath)}`);
                    
                    if (!filePath) {
                        console.error(`❌ Logo file path is undefined or null!`);
                        console.error(`   logoFile object:`, logoFile);
                        logoUploadSuccess = false;
                    } else if (fs.existsSync(filePath)) {
                        const timestamp = Date.now();
                        const randomSuffix = Math.random().toString(36).substring(2, 8);
                        const ext = path.extname(logoFile.originalname) || '.png';
                        const baseName = path.basename(logoFile.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
                        const newFileName = `logo-${timestamp}-${randomSuffix}-${baseName}${ext}`;
                        const newFilePath = path.join(uploadsDir, newFileName);
                        
                        console.log(`📝 Preparing to save logo:`);
                        console.log(`   Source: ${filePath}`);
                        console.log(`   Destination: ${newFilePath}`);
                        console.log(`   File name: ${newFileName}`);
                        
                        try {
                            // Copy file to logo directory
                            fs.copyFileSync(filePath, newFilePath);
                            
                            // Verify file was copied successfully
                            if (fs.existsSync(newFilePath)) {
                                const stats = fs.statSync(newFilePath);
                                console.log(`✅ Logo saved successfully!`);
                                console.log(`   File path: ${newFilePath}`);
                                console.log(`   File size: ${stats.size} bytes`);
                                
                                // Delete temporary file
                                try {
                                    fs.unlinkSync(filePath);
                                    console.log(`🗑️ Temporary file deleted: ${filePath}`);
                                } catch (unlinkErr) {
                                    console.error(`⚠️ Error deleting temp file: ${unlinkErr.message}`);
                                }
                                
                                logoUrl = `/uploads/logo/${newFileName}`;
                                logoUploadSuccess = true;
                                console.log(`✅ Logo URL generated: ${logoUrl}`);
                            } else {
                                console.error(`❌ Failed to save logo - file does not exist after copy`);
                                console.error(`   Expected path: ${newFilePath}`);
                                logoUploadSuccess = false;
                            }
                        } catch (copyError) {
                            console.error(`❌ Error copying logo file:`, copyError);
                            console.error(`   Error message: ${copyError.message}`);
                            console.error(`   Error stack: ${copyError.stack}`);
                            logoUploadSuccess = false;
                        }
                    } else {
                        console.error(`❌ Logo file path does not exist: ${filePath}`);
                        console.error(`   Current working directory: ${process.cwd()}`);
                        logoUploadSuccess = false;
                    }
                } catch (localSaveError) {
                    console.error(`❌ Local save error:`, localSaveError);
                    console.error(`   Error message: ${localSaveError.message}`);
                    logoUploadSuccess = false;
                }
            }
        }

        // Prepare update data
        console.log('\n📝 Preparing update data...');
        const updateData = {};
        
        if (req.body.companyName) {
            updateData.companyName = req.body.companyName.trim();
            console.log(`  ✓ companyName: ${updateData.companyName}`);
        }
        if (req.body.companyEmail) {
            updateData.companyEmail = req.body.companyEmail.trim();
            console.log(`  ✓ companyEmail: ${updateData.companyEmail}`);
        }
        if (req.body.companyPhone !== undefined) {
            updateData.companyPhone = req.body.companyPhone?.trim() || null;
            console.log(`  ✓ companyPhone: ${updateData.companyPhone || 'null'}`);
        }
        if (req.body.companyAddress !== undefined) {
            updateData.companyAddress = req.body.companyAddress?.trim() || null;
            console.log(`  ✓ companyAddress: ${updateData.companyAddress ? updateData.companyAddress.substring(0, 50) + '...' : 'null'}`);
        }
        if (req.body.facebook !== undefined) {
            updateData.facebook = req.body.facebook?.trim() || null;
            console.log(`  ✓ facebook: ${updateData.facebook || 'null'}`);
        }
        if (req.body.twitter !== undefined) {
            updateData.twitter = req.body.twitter?.trim() || null;
            console.log(`  ✓ twitter: ${updateData.twitter || 'null'}`);
        }
        if (req.body.instagram !== undefined) {
            updateData.instagram = req.body.instagram?.trim() || null;
            console.log(`  ✓ instagram: ${updateData.instagram || 'null'}`);
        }
        if (req.body.linkedin !== undefined) {
            updateData.linkedin = req.body.linkedin?.trim() || null;
            console.log(`  ✓ linkedin: ${updateData.linkedin || 'null'}`);
        }
        if (req.body.youtube !== undefined) {
            updateData.youtube = req.body.youtube?.trim() || null;
            console.log(`  ✓ youtube: ${updateData.youtube || 'null'}`);
        }
        if (req.body.whatsapp !== undefined) {
            updateData.whatsapp = req.body.whatsapp?.trim() || null;
            console.log(`  ✓ whatsapp: ${updateData.whatsapp || 'null'}`);
        }
        if (req.body.websiteUrl !== undefined) {
            updateData.websiteUrl = req.body.websiteUrl?.trim() || null;
            console.log(`  ✓ websiteUrl: ${updateData.websiteUrl || 'null'}`);
        }
        if (req.body.currency) {
            updateData.currency = req.body.currency.trim();
            console.log(`  ✓ currency: ${updateData.currency}`);
        }
        if (req.body.timezone) {
            updateData.timezone = req.body.timezone.trim();
            console.log(`  ✓ timezone: ${updateData.timezone}`);
        }
        if (req.body.metaTitle !== undefined) {
            updateData.metaTitle = req.body.metaTitle?.trim() || null;
            console.log(`  ✓ metaTitle: ${updateData.metaTitle || 'null'}`);
        }
        if (req.body.metaDescription !== undefined) {
            updateData.metaDescription = req.body.metaDescription?.trim() || null;
            console.log(`  ✓ metaDescription: ${updateData.metaDescription ? updateData.metaDescription.substring(0, 50) + '...' : 'null'}`);
        }
        if (req.body.metaKeywords !== undefined) {
            updateData.metaKeywords = req.body.metaKeywords?.trim() || null;
            console.log(`  ✓ metaKeywords: ${updateData.metaKeywords || 'null'}`);
        }
        if (req.body.aboutUs !== undefined) {
            updateData.aboutUs = req.body.aboutUs?.trim() || null;
            console.log(`  ✓ aboutUs: ${updateData.aboutUs ? updateData.aboutUs.substring(0, 50) + '...' : 'null'}`);
        }
        if (req.body.termsAndConditions !== undefined) {
            updateData.termsAndConditions = req.body.termsAndConditions?.trim() || null;
            console.log(`  ✓ termsAndConditions: ${updateData.termsAndConditions ? updateData.termsAndConditions.substring(0, 50) + '...' : 'null'}`);
        }
        if (req.body.privacyPolicy !== undefined) {
            updateData.privacyPolicy = req.body.privacyPolicy?.trim() || null;
            console.log(`  ✓ privacyPolicy: ${updateData.privacyPolicy ? updateData.privacyPolicy.substring(0, 50) + '...' : 'null'}`);
        }
        
        // Update logo if new one was uploaded successfully
        console.log(`\n🔍 Logo update decision:`);
        console.log(`   logoFile exists: ${!!logoFile}`);
        console.log(`   logoUploadSuccess: ${logoUploadSuccess}`);
        console.log(`   logoUrl: ${logoUrl || 'empty'}`);
        console.log(`   Current logo in DB: ${settings.companyLogo || 'None'}`);
        
        if (logoFile && logoUploadSuccess && logoUrl) {
            updateData.companyLogo = logoUrl;
            console.log(`  ✅ companyLogo will be updated: ${logoUrl}`);
            console.log(`  ✅ Logo will be saved to database`);
        } else if (logoFile && !logoUploadSuccess) {
            console.log(`  ⚠ Logo file provided but upload failed!`);
            console.log(`  ⚠ Keeping existing logo: ${settings.companyLogo || 'None'}`);
            // Don't update logo if upload failed - keep existing one
            // But we should still try to save other fields
        } else if (logoFile && !logoUrl) {
            console.log(`  ⚠ Logo file exists but logoUrl is empty!`);
            console.log(`  ⚠ Upload success status: ${logoUploadSuccess}`);
            console.log(`  ⚠ This indicates an error during file processing`);
        } else {
            console.log(`  ℹ️ No logo file provided in this request`);
            console.log(`  ℹ️ Keeping existing logo: ${settings.companyLogo || 'None'}`);
        }

        console.log(`\n💾 Saving to database...`);
        console.log(`   Update data keys: ${Object.keys(updateData).join(', ')}`);
        console.log(`   Logo URL in updateData: ${updateData.companyLogo || 'NOT INCLUDED'}`);
        
        // CRITICAL: Force include logo if file was uploaded but not in updateData
        if (logoFile && logoUploadSuccess && logoUrl && !updateData.companyLogo) {
            console.log(`   ⚠️ CRITICAL: Logo was uploaded but not in updateData! Adding it now...`);
            updateData.companyLogo = logoUrl;
            console.log(`   ✅ Logo added to updateData: ${logoUrl}`);
        }
        
        if (updateData.companyLogo) {
            console.log(`   ✅ Logo path will be saved: ${updateData.companyLogo}`);
        } else {
            console.log(`   ⚠ Logo not included in update (keeping existing or none)`);
            if (logoFile) {
                console.log(`   ⚠️ WARNING: Logo file was provided but not saved!`);
                console.log(`      logoFile exists: ${!!logoFile}`);
                console.log(`      logoUploadSuccess: ${logoUploadSuccess}`);
                console.log(`      logoUrl: ${logoUrl || 'empty'}`);
            }
        }
        
        // Update settings
        try {
            await settings.update(updateData);
            console.log(`✅ Settings updated in database successfully`);
        } catch (dbError) {
            console.error(`❌ Database update error:`, dbError);
            throw dbError;
        }
        
        // Verify what was saved
        const savedSettings = await Settings.findOne();
        if (!savedSettings) {
            console.error(`❌ Failed to retrieve saved settings from database`);
            throw new Error('Failed to retrieve saved settings');
        }
        
        const savedData = savedSettings.toJSON();
        console.log(`\n📊 Verification - Saved to database:`);
        console.log(`   ID: ${savedData.id}`);
        console.log(`   Company Name: ${savedData.companyName || 'NULL'}`);
        console.log(`   Company Logo: ${savedData.companyLogo || 'NULL'}`);
        console.log(`   Company Email: ${savedData.companyEmail || 'NULL'}`);
        console.log(`   Total fields updated: ${Object.keys(updateData).length}`);
        
        // Verify logo was saved
        if (updateData.companyLogo) {
            if (savedData.companyLogo === updateData.companyLogo) {
                console.log(`   ✅ Logo successfully saved to database!`);
                console.log(`   ✅ Logo path in DB: ${savedData.companyLogo}`);
            } else {
                console.error(`   ❌ Logo mismatch!`);
                console.error(`      Expected: ${updateData.companyLogo}`);
                console.error(`      Got: ${savedData.companyLogo || 'NULL'}`);
                console.error(`   ⚠️ Attempting emergency fix...`);
                // Emergency fix: Update logo directly
                try {
                    await Settings.update(
                        { companyLogo: updateData.companyLogo },
                        { where: { id: settings.id } }
                    );
                    const fixed = await Settings.findOne();
                    if (fixed.companyLogo === updateData.companyLogo) {
                        console.log(`   ✅ Emergency fix successful! Logo saved.`);
                    }
                } catch (fixError) {
                    console.error(`   ❌ Emergency fix failed:`, fixError.message);
                }
            }
        } else if (logoFile && logoUploadSuccess && logoUrl) {
            // CRITICAL: Logo was uploaded but not in updateData - emergency save
            console.error(`   ❌ CRITICAL: Logo uploaded but not in updateData!`);
            console.error(`   ⚠️ Performing emergency save...`);
            try {
                await Settings.update(
                    { companyLogo: logoUrl },
                    { where: { id: settings.id } }
                );
                console.log(`   ✅ Emergency logo save completed: ${logoUrl}`);
            } catch (emergencyError) {
                console.error(`   ❌ Emergency save failed:`, emergencyError.message);
            }
        }

        // Get updated settings
        const updatedSettings = await Settings.findOne();
        const settingsData = updatedSettings.toJSON();
        
        // Convert logo to full URL if it's a local path
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        if (settingsData.companyLogo && typeof settingsData.companyLogo === 'string') {
            if (settingsData.companyLogo.startsWith('/uploads/logo/') || settingsData.companyLogo.startsWith('/uploads/settings/')) {
                settingsData.companyLogo = `${baseUrl}${settingsData.companyLogo}`;
            }
        }

        res.json({ 
            message: "Settings updated successfully", 
            success: true, 
            settings: settingsData 
        });
    } catch (error) {
        console.error("Error updating settings:", error);
        res.status(500).json({ 
            message: error.message || "Server Error", 
            success: false 
        });
    }
};

export { getSettings, updateSettings };

