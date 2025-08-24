const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public routes
router.get('/products/:productId/reviews', reviewController.getProductReviews);
router.get('/reviews/:reviewId', reviewController.getReview);

// Protected routes (authenticated users only)
router.post('/products/:productId/reviews', protect, reviewController.createReview);
router.put('/reviews/:reviewId', protect, reviewController.updateReview);
router.delete('/reviews/:reviewId', protect, reviewController.deleteReview);
router.post('/reviews/:reviewId/helpful', protect, reviewController.markReviewAsHelpful);
router.post('/reviews/:reviewId/report', protect, reviewController.reportReview);
router.get('/user/reviews', protect, reviewController.getUserReviews);

// Admin routes
router.get('/admin/reviews', protect, authorize('admin'), reviewController.getAllReviews);
router.patch('/admin/reviews/:reviewId/status', protect, authorize('admin'), reviewController.updateReviewStatus);

module.exports = router;