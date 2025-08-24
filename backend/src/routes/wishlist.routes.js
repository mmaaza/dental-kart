const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const wishlistController = require('../controllers/wishlist.controller');

// Get all wishlist items
router.get('/', protect, wishlistController.getWishlist);

// Add product to wishlist
router.post('/', protect, wishlistController.addToWishlist);

// Remove product from wishlist
router.delete('/:productId', protect, wishlistController.removeFromWishlist);

// Clear wishlist
router.delete('/', protect, wishlistController.clearWishlist);

module.exports = router;
