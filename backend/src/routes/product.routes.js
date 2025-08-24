// filepath: /home/maaz/Web Work/mbnepal/backend/src/routes/product.routes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { protectVendor, authorizeVendor } = require('../middleware/vendorAuth.middleware');

// Public routes (client-side)
router.get('/', productController.getProductsPublic);
router.get('/slug/:slug', productController.getProductBySlugPublic);
router.get('/:id', productController.getProductPublic);
router.get('/:id/related', productController.getRelatedProductsPublic);

// Admin/Vendor protected routes
router.get('/admin/list', protect, authorize('admin', 'vendor'), productController.getProductsAdmin);
router.get('/admin/:id', protect, authorize('admin', 'vendor'), productController.getProductAdmin);

router.post('/', protect, authorize('admin', 'vendor'), productController.createProduct);
router.put('/:id', protect, authorize('admin', 'vendor'), productController.updateProduct);
router.delete('/:id', protect, authorize('admin', 'vendor'), productController.deleteProduct);
router.patch('/:id/toggle-status', protect, authorize('admin', 'vendor'), productController.toggleStatus);
router.patch('/:id/approve', protect, authorize('admin'), productController.approveProduct);

// Draft-specific routes
router.get('/drafts/list', protect, authorize('admin', 'vendor'), productController.getDraftProducts);
router.patch('/:id/publish', protect, authorize('admin', 'vendor'), productController.publishDraft);

// Vendor-specific routes (using vendor authentication)
router.get('/vendor/list', protectVendor, authorizeVendor('vendor', 'admin'), productController.getProductsAdmin);
router.get('/vendor/:id', protectVendor, authorizeVendor('vendor', 'admin'), productController.getProductAdmin);
router.post('/vendor', protectVendor, authorizeVendor('vendor', 'admin'), productController.createProduct);
router.patch('/vendor/:id/inventory', protectVendor, authorizeVendor('vendor', 'admin'), productController.updateInventoryVendor);

module.exports = router;