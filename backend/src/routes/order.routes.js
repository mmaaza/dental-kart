const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { protectVendor, authorizeVendor } = require('../middleware/vendorAuth.middleware');
const orderController = require('../controllers/order.controller');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists and has correct permissions
const ensureUploadDirectory = () => {
  const uploadDir = path.join('/var/www/dentalcartnepal/public/uploads/payments');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true, mode: 0o755 });
  } else {
    // Ensure correct permissions on existing directory
    fs.chmodSync(uploadDir, 0o755);
  }
  return uploadDir;
};

// Set up multer for payment screenshot uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const uploadDir = ensureUploadDirectory();
      console.log('Payment upload directory:', uploadDir);
      cb(null, uploadDir);
    } catch (error) {
      console.error('Error ensuring payment upload directory:', error);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Sanitize filename to prevent path traversal
    const sanitizedFilename = path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `${uniqueSuffix}-${sanitizedFilename}`;
    console.log('Generated payment filename:', filename); // Debug log
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
    }
  }
});

// Customer routes
router.post('/', protect, upload.single('paymentScreenshot'), orderController.createOrder);
router.get('/', protect, orderController.getUserOrders);

// Vendor routes MUST come before any '/:id' routes to avoid path conflicts
router.get('/vendor', protectVendor, authorizeVendor('vendor'), orderController.getVendorOrders);
router.get('/vendor/:id', protectVendor, authorizeVendor('vendor'), orderController.getVendorOrderById);

// Customer routes with id params
router.get('/:id', protect, orderController.getOrderById);
router.patch('/:id/cancel', protect, orderController.cancelOrder);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), orderController.getAllOrders);
router.patch('/:id/payment', protect, authorize('admin'), orderController.updatePaymentStatus);

// Admin-only status update route
router.patch('/:id/status', protect, authorize('admin'), orderController.updateOrderStatus);

// Test route for vendor email (Admin only)
router.post('/test-vendor-email', protect, authorize('admin'), orderController.testVendorEmail);

module.exports = router;
