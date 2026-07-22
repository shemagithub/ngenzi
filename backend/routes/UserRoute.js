import express from 'express';
import { login, register, forgotpassword,adminlogin,resetpassword,getname, updateProfile, changePassword, getAllUsers, getUserById, updateUserByAdmin, deleteUser, resetUserPassword } from '../controller/Usercontroller.js';
import { getSavedProperties, addSavedProperty, removeSavedProperty, checkSavedProperty } from '../controller/savedPropertyController.js';
import { protect, isAdmin } from '../middleware/authmiddleware.js';


const userrouter = express.Router();

userrouter.post('/login', login);
userrouter.post('/register', register);
userrouter.post('/forgot', forgotpassword);
userrouter.post('/reset/:token', resetpassword);
userrouter.post('/admin', adminlogin);
userrouter.get('/me', protect, getname);
userrouter.put('/profile', protect, updateProfile);
userrouter.put('/change-password', protect, changePassword);

// Saved Properties routes
// IMPORTANT: More specific routes must come before less specific ones
userrouter.get('/saved-properties/check/:propertyId', protect, checkSavedProperty);
userrouter.get('/saved-properties', protect, getSavedProperties);
userrouter.post('/saved-properties', protect, addSavedProperty);
userrouter.delete('/saved-properties/:propertyId', protect, removeSavedProperty);

// Admin user management routes
userrouter.get('/admin/all', protect, isAdmin, getAllUsers);
userrouter.get('/admin/:id', protect, isAdmin, getUserById);
userrouter.put('/admin/:id', protect, isAdmin, updateUserByAdmin);
userrouter.delete('/admin/:id', protect, isAdmin, deleteUser);
userrouter.post('/admin/:id/reset-password', protect, isAdmin, resetUserPassword);

// Log route registration
console.log('✅ User routes registered:');
console.log('   GET /api/users/saved-properties/check/:propertyId');
console.log('   GET /api/users/saved-properties');
console.log('   POST /api/users/saved-properties');
console.log('   DELETE /api/users/saved-properties/:propertyId');
console.log('   GET /api/users/admin/all (Admin only)');
console.log('   GET /api/users/admin/:id (Admin only)');
console.log('   PUT /api/users/admin/:id (Admin only)');
console.log('   DELETE /api/users/admin/:id (Admin only)');
console.log('   POST /api/users/admin/:id/reset-password (Admin only)');

export default userrouter;