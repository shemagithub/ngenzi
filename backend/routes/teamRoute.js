import express from 'express';
import {
  getTeams,
  getTeam,
  getAllTeams,
  addTeam,
  updateTeam,
  deleteTeam
} from '../controller/teamController.js';
import { protect } from '../middleware/authmiddleware.js';
import upload from '../middleware/multer.js';

const router = express.Router();

// Public routes
router.get('/list', getTeams);
router.get('/single/:id', getTeam);

// Admin routes (protected)
router.get('/admin/list', protect, getAllTeams);
router.post('/add', protect, upload.fields([{ name: 'image', maxCount: 1 }]), addTeam);
router.put('/update/:id', protect, upload.fields([{ name: 'image', maxCount: 1 }]), updateTeam);
router.delete('/delete/:id', protect, deleteTeam);

export default router;










