const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { protectVendor, authorizeVendor } = require('../middleware/vendorAuth.middleware');

// Public routes (client-side)
router.get('/', categoryController.getCategoriesPublic);
router.get('/slug/:slug', categoryController.getCategoryBySlugPublic);
router.get('/:id', categoryController.getCategoryByIdPublic);

// Admin/Vendor protected routes
router.get('/admin/list', protect, authorize('admin'), categoryController.getCategoriesAdmin);
router.get('/admin/:id', protect, authorize('admin'), categoryController.getCategoryByIdAdmin);
router.get('/admin/:id/deletion-preview', protect, authorize('admin'), categoryController.getCategoryDeletionPreview);

router.post('/', protect, authorize('admin'), categoryController.createCategory);
// Vendor creation route (uses vendor auth middleware)
router.post('/vendor', protectVendor, authorizeVendor('vendor', 'admin'), categoryController.createCategory);
router.put('/:id', protect, authorize('admin'), categoryController.updateCategory);
router.delete('/:id', protect, authorize('admin'), categoryController.deleteCategory);
router.patch('/:id/toggle-status', protect, authorize('admin'), categoryController.toggleStatus);

module.exports = router;