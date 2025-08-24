const Review = require('../models/review.model');
const Product = require('../models/product.model');
const mongoose = require('mongoose');
const { ApiError } = require('../utils/ApiError');

/**
 * Create a new review
 */
exports.createReview = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;
    
    // Check if product exists
    const productExists = await Product.exists({ _id: productId });
    if (!productExists) {
      throw new ApiError(404, 'Product not found');
    }
    
    // Check if user already reviewed this product
    const existingReview = await Review.findOne({ 
      product: productId,
      user: userId 
    });
    
    if (existingReview) {
      throw new ApiError(400, 'You have already reviewed this product');
    }
    
    // Create the review
    const review = new Review({
      product: productId,
      user: userId,
      rating: req.body.rating,
      title: req.body.title,
      comment: req.body.comment
    });
    
    await review.save();
    
    // Populate the user details
    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name email avatar');
    
    // Update product's average rating
    await updateProductRating(productId);
    
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: populatedReview
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Get reviews for a product
 */
exports.getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { limit = 20, page = 1, sort = '-createdAt', rating = 0 } = req.query;
    
    // Check if product exists
    const productExists = await Product.exists({ _id: productId });
    if (!productExists) {
      throw new ApiError(404, 'Product not found');
    }
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query = { product: productId, status: 'approved' };
    
    // Filter by rating if specified
    if (rating > 0) {
      query.rating = parseInt(rating);
    }
    
    // Get reviews
    const reviews = await Review.find(query)
      .populate('user', 'name email avatar')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total reviews count
    const total = await Review.countDocuments(query);
    
    // Check if user has marked any of these reviews as helpful
    let userHelpfulReviews = [];
    if (req.user) {
      const reviewIds = reviews.map(review => review._id);
      userHelpfulReviews = await Review.find({
        _id: { $in: reviewIds },
        helpful: req.user._id
      }).distinct('_id');
    }
    
    // Format response
    const data = reviews.map(review => {
      const reviewObj = review.toObject();
      if (req.user) {
        reviewObj.userMarkedHelpful = userHelpfulReviews.some(id => 
          id.toString() === review._id.toString()
        );
      }
      return reviewObj;
    });
    
    res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single review
 */
exports.getReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    
    const review = await Review.findById(reviewId)
      .populate('user', 'name email avatar')
      .populate('product', 'name slug images');
    
    if (!review) {
      throw new ApiError(404, 'Review not found');
    }
    
    // Check if user has marked this review as helpful
    let userMarkedHelpful = false;
    if (req.user) {
      userMarkedHelpful = review.helpful.includes(req.user._id);
    }
    
    const reviewObj = review.toObject();
    reviewObj.userMarkedHelpful = userMarkedHelpful;
    
    res.status(200).json({
      success: true,
      data: reviewObj
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Update a review
 */
exports.updateReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;
    
    // Find the review
    const review = await Review.findById(reviewId);
    
    if (!review) {
      throw new ApiError(404, 'Review not found');
    }
    
    // Check if user is the owner of the review
    if (review.user.toString() !== userId.toString()) {
      throw new ApiError(403, 'You are not authorized to update this review');
    }
    
    // Update review fields
    if (req.body.rating) review.rating = req.body.rating;
    if (req.body.title !== undefined) review.title = req.body.title;
    if (req.body.comment) review.comment = req.body.comment;
    
    // Save updated review
    await review.save();
    
    // Update product's average rating
    await updateProductRating(review.product);
    
    // Return updated review
    const updatedReview = await Review.findById(reviewId)
      .populate('user', 'name email avatar');
    
    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a review
 */
exports.deleteReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';
    
    // Find the review
    const review = await Review.findById(reviewId);
    
    if (!review) {
      throw new ApiError(404, 'Review not found');
    }
    
    // Check if user is the owner of the review or an admin
    if (review.user.toString() !== userId.toString() && !isAdmin) {
      throw new ApiError(403, 'You are not authorized to delete this review');
    }
    
    const productId = review.product;
    
    // Delete the review
    await Review.deleteOne({ _id: reviewId });
    
    // Update product's average rating
    await updateProductRating(productId);
    
    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a review as helpful
 */
exports.markReviewAsHelpful = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;
    
    // Find the review
    const review = await Review.findById(reviewId);
    
    if (!review) {
      throw new ApiError(404, 'Review not found');
    }
    
    // Check if user already marked this review as helpful
    if (review.helpful.includes(userId)) {
      throw new ApiError(400, 'You have already marked this review as helpful');
    }
    
    // Add user to helpful array and increment helpfulCount
    review.helpful.push(userId);
    review.helpfulCount = review.helpful.length;
    
    await review.save();
    
    res.status(200).json({
      success: true,
      message: 'Review marked as helpful',
      data: {
        helpfulCount: review.helpfulCount
      }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Report a review
 */
exports.reportReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user._id;
    
    // Find the review
    const review = await Review.findById(reviewId);
    
    if (!review) {
      throw new ApiError(404, 'Review not found');
    }
    
    // Check if user already reported this review
    if (review.reported.includes(userId)) {
      throw new ApiError(400, 'You have already reported this review');
    }
    
    // Add user to reported array
    review.reported.push(userId);
    
    // If review has been reported by 3 or more users, flag it for review
    if (review.reported.length >= 3) {
      review.flaggedForReview = true;
    }
    
    await review.save();
    
    res.status(200).json({
      success: true,
      message: 'Review reported successfully'
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's reviews
 */
exports.getUserReviews = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { limit = 10, page = 1, sort = '-createdAt' } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Get user's reviews
    const reviews = await Review.find({ user: userId })
      .populate('product', 'name slug images')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total reviews count
    const total = await Review.countDocuments({ user: userId });
    
    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
    
  } catch (error) {
    next(error);
  }
};

// Admin endpoints

/**
 * Get all reviews (admin)
 */
exports.getAllReviews = async (req, res, next) => {
  try {
    const { limit = 25, page = 1, sort = '-createdAt', status, flagged } = req.query;
    
    const skip = (page - 1) * limit;
    
    // Build query
    const query = {};
    
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }
    
    if (flagged === 'true') {
      query.flaggedForReview = true;
    }
    
    // Get reviews
    const reviews = await Review.find(query)
      .populate('user', 'name email avatar')
      .populate('product', 'name slug images')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get total reviews count
    const total = await Review.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Update review status (admin)
 */
exports.updateReviewStatus = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { status } = req.body;
    
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      throw new ApiError(400, 'Invalid status');
    }
    
    // Find the review
    const review = await Review.findById(reviewId);
    
    if (!review) {
      throw new ApiError(404, 'Review not found');
    }
    
    // Update status
    review.status = status;
    
    // If approving, reset flaggedForReview
    if (status === 'approved') {
      review.flaggedForReview = false;
    }
    
    await review.save();
    
    // If status changed, update product's average rating
    await updateProductRating(review.product);
    
    res.status(200).json({
      success: true,
      message: `Review ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'set to pending'}`,
      data: review
    });
    
  } catch (error) {
    next(error);
  }
};

/**
 * Helper function to update a product's average rating
 */
async function updateProductRating(productId) {
  // Get all approved reviews for this product
  const reviews = await Review.find({ 
    product: productId,
    status: 'approved'
  });
  
  // Calculate average rating
  const totalReviews = reviews.length;
  
  if (totalReviews === 0) {
    // If no reviews, reset rating to 0
    await Product.findByIdAndUpdate(productId, { 
      rating: 0,
      reviewCount: 0
    });
    return;
  }
  
  const sumRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = sumRatings / totalReviews;
  
  // Update product
  await Product.findByIdAndUpdate(productId, { 
    rating: averageRating,
    reviewCount: totalReviews
  });
}