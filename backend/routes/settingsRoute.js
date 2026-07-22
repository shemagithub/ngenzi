import express from 'express';
import { getSettings, updateSettings } from '../controller/settingsController.js';
import upload from '../middleware/multer.js';
import { protect } from '../middleware/authmiddleware.js';

const settingsRouter = express.Router();

// Get settings (public endpoint - can be accessed by frontend)
settingsRouter.get('/', getSettings);

// Multer error handler
const handleMulterError = (err, req, res, next) => {
  if (err) {
    console.error('❌ Multer error:', err);
    console.error('   Error code:', err.code);
    console.error('   Error message:', err.message);
    return res.status(400).json({
      success: false,
      message: `File upload error: ${err.message}`
    });
  }
  next();
};

// Update settings (protected - admin only)
settingsRouter.put('/', 
  protect,
  (req, res, next) => {
    console.log('\n🔍 Settings route middleware - BEFORE multer');
    console.log('   Content-Type:', req.headers['content-type']);
    console.log('   Method:', req.method);
    console.log('   URL:', req.url);
    next();
  },
  upload.fields([
    { name: "logo", maxCount: 1 }
  ]),
  handleMulterError,
  (req, res, next) => {
    console.log('\n🔍 Settings route middleware - AFTER multer');
    console.log('   req.files:', req.files ? JSON.stringify(Object.keys(req.files)) : 'No files');
    console.log('   req.file:', req.file ? 'Exists' : 'No file');
    
    if (req.files) {
      console.log('   req.files structure:');
      Object.keys(req.files).forEach(key => {
        const fileArray = req.files[key];
        console.log(`     req.files['${key}']:`, Array.isArray(fileArray) ? `Array(${fileArray.length})` : typeof fileArray);
        if (Array.isArray(fileArray) && fileArray.length > 0) {
          fileArray.forEach((file, index) => {
            console.log(`       [${index}]:`, {
              fieldname: file.fieldname,
              originalname: file.originalname,
              encoding: file.encoding,
              mimetype: file.mimetype,
              size: file.size,
              path: file.path
            });
          });
        }
      });
    }
    
    if (req.files && req.files.logo && Array.isArray(req.files.logo) && req.files.logo.length > 0) {
      console.log('   ✅ Logo file received by multer!');
      console.log('   Logo file details:', {
        originalname: req.files.logo[0].originalname,
        path: req.files.logo[0].path,
        size: req.files.logo[0].size,
        mimetype: req.files.logo[0].mimetype
      });
    } else {
      console.log('   ❌ Logo file NOT received by multer!');
      console.log('   This means the file field name might be wrong or file not sent');
    }
    
    next();
  },
  updateSettings
);

export default settingsRouter;

