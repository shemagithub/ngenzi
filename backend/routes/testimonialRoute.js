import express from 'express';
import {
  getTestimonials,
  getTestimonial,
  getAllTestimonials,
  addTestimonial,
  updateTestimonial,
  deleteTestimonial
} from '../controller/testimonialController.js';
import { protect } from '../middleware/authmiddleware.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// Public routes
router.get('/list', getTestimonials);
router.get('/single/:id', getTestimonial);

// Admin routes (protected)
router.get('/admin/list', protect, getAllTestimonials);
router.post('/add', protect, upload.fields([{ name: 'image', maxCount: 1 }]), addTestimonial);
router.put('/update/:id', protect, upload.fields([{ name: 'image', maxCount: 1 }]), updateTestimonial);
router.delete('/delete/:id', protect, deleteTestimonial);

export default router;










