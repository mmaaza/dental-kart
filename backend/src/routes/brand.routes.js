const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brand.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { protectVendor, authorizeVendor } = require('../middleware/vendorAuth.middleware');

// ====== PUBLIC/CLIENT-SIDE ROUTES ======
// These routes are accessible to everyone and return only active brands

// Get all brands (active only)
router.get('/', brandController.getBrandsPublic);

// Get brand by slug (active only)
router.get('/slug/:slug', brandController.getBrandBySlugPublic);

// Get brand by ID (active only)
router.get('/:id', brandController.getBrandPublic);

// ====== ADMIN-SIDE ROUTES ======
// These routes require authentication and admin role

// Admin-specific listing (with all statuses)
router.get('/admin/list', protect, authorize('admin'), brandController.getBrandsAdmin);

// Admin-specific brand detail (with all statuses)
router.get('/admin/:id', protect, authorize('admin'), brandController.getBrandAdmin);

// Admin brand operations
router.post('/', protect, authorize('admin'), brandController.createBrand);
// Vendor creation route (uses vendor auth middleware)
router.post('/vendor', protectVendor, authorizeVendor('vendor', 'admin'), brandController.createBrand);
router.put('/:id', protect, authorize('admin'), brandController.updateBrand);
router.delete('/:id', protect, authorize('admin'), brandController.deleteBrand);

module.exports = router;