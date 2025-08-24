const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { protectVendor, authorizeVendor } = require('../middleware/vendorAuth.middleware');
const { 
  createVendor, 
  login, 
  getProfile, 
  updateProfile, 
  changePassword, 
  getAllVendors,
  adminLoginAsVendor,
  updateVendorById,
  getVendorById,
  getDashboard,
  forgotPassword,
  resetPassword,
} = require('../controllers/vendor.controller');

// Public routes
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Admin only routes - admin-login specific route
router.post('/admin-login', protect, authorize('admin'), adminLoginAsVendor);

// Vendor only routes (static paths must come BEFORE any '/:id' dynamic route)
router.get('/profile', protectVendor, authorizeVendor('vendor', 'admin'), getProfile);
router.put('/profile', protectVendor, authorizeVendor('vendor', 'admin'), updateProfile);
router.put('/change-password', protectVendor, authorizeVendor('vendor', 'admin'), changePassword);
router.get('/dashboard', protectVendor, authorizeVendor('vendor', 'admin'), getDashboard);
router.get('/reports', protectVendor, authorizeVendor('vendor', 'admin'), require('../controllers/vendor.controller').getReports);

// Admin only routes for vendor management
router.post('/', protect, authorize('admin'), createVendor);
router.get('/', protect, authorize('admin'), getAllVendors);
router.get('/:id', protect, authorize('admin'), getVendorById);
router.put('/:id', protect, authorize('admin'), updateVendorById);

module.exports = router;