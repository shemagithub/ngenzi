import express from 'express';
import {
  getBlogs,
  getBlog,
  getAllBlogs,
  addBlog,
  updateBlog,
  deleteBlog
} from '../controller/blogController.js';
import { protect } from '../middleware/authmiddleware.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// Public routes
router.get('/list', getBlogs);
router.get('/single/:slug', getBlog);

// Admin routes (protected)
router.get('/admin/list', protect, getAllBlogs);
router.post('/add', protect, upload.fields([{ name: 'image', maxCount: 1 }]), addBlog);
router.put('/update/:id', protect, upload.fields([{ name: 'image', maxCount: 1 }]), updateBlog);
router.delete('/delete/:id', protect, deleteBlog);

export default router;

