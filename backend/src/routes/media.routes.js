const express = require('express');
const { upload, uploadMedia, getMedia, deleteMedia } = require('../controllers/media.controller');
const { protect } = require('../middleware/auth.middleware');
const { protectVendor } = require('../middleware/vendorAuth.middleware');

const router = express.Router();

// Protect all routes
// Explicitly protect each route to support both user and vendor tokens
router.get('/', protect, getMedia);
router.post('/upload', protect, upload.array('files'), uploadMedia);
// Vendor-specific upload route
router.post('/vendor/upload', protectVendor, upload.array('files'), uploadMedia);

router.route('/:id')
  .delete(deleteMedia);

module.exports = router;