import express from 'express';
import {
  getServices,
  getService,
  addService,
  updateService,
  deleteService,
  getAllServices
} from '../controller/serviceController.js';
import { protect } from '../middleware/authmiddleware.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// Public routes
router.get('/list', getServices);
router.get('/single/:id', getService);

// Admin routes (protected)
router.get('/admin/list', protect, getAllServices);
router.post('/add', protect, upload.fields([{ name: 'image', maxCount: 1 }]), addService);
router.put('/update/:id', protect, upload.fields([{ name: 'image', maxCount: 1 }]), updateService);
router.delete('/delete/:id', protect, deleteService);

export default router;

