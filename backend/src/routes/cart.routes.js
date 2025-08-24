const express = require('express');
const router = express.Router();
const { 
  getUserCart, 
  addToCart, 
  updateCartItem, 
  removeCartItem, 
  clearCart,
  getAllCarts,
  getUserCartByAdmin,
  cleanupCart
} = require('../controllers/cart.controller');
const { 
  protect, 
  authorize 
} = require('../middleware/auth.middleware');

// User cart routes
router.use(protect); // All cart routes require authentication

router.route('/')
  .get(getUserCart)
  .post(addToCart)
  .delete(clearCart);

router.put('/cleanup', cleanupCart);

router.route('/:itemId')
  .put(updateCartItem)
  .delete(removeCartItem);

// Admin cart routes
router.get('/admin/all', protect, authorize('admin'), getAllCarts);
router.get('/admin/:userId', protect, authorize('admin'), getUserCartByAdmin);

module.exports = router;
