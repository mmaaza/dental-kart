const User = require('../models/user.model');
const Product = require('../models/product.model');
const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

// Get all wishlist items for the current user
exports.getWishlist = catchAsync(async (req, res) => {
  const userId = req.user._id;
  
  // Get the user with populated wishlist
  const user = await User.findById(userId).populate({
    path: 'wishlist',
    select: 'name slug regularPrice specialOfferPrice price originalPrice discountType discountValue images avgRating rating reviewCount stock status brand',
    populate: {
      path: 'brand',
      select: 'name slug'
    }
  });

  if (!user) {
    
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(
    new ApiResponse(200, user.wishlist || [], 'Wishlist retrieved successfully')
  );
});

// Add product to wishlist
exports.addToWishlist = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;
  
  if (!productId) {
    throw new ApiError(400, 'Product ID is required');
  }

  const product = await Product.findById(productId);
  
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  
  // Update user's wishlist
  const user = await User.findByIdAndUpdate(
    userId,
    { $addToSet: { wishlist: productId } }, // $addToSet ensures no duplicates
    { new: true }
  ).populate({
    path: 'wishlist',
    match: { _id: productId },
    select: 'name slug regularPrice specialOfferPrice price originalPrice discountType discountValue images avgRating rating reviewCount stock status brand',
    populate: {
      path: 'brand',
      select: 'name slug'
    }
  });
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  // Return the added product
  const addedProduct = user.wishlist.find(item => item._id.toString() === productId.toString());
  
  res.status(200).json(
    new ApiResponse(200, addedProduct, 'Product added to wishlist')
  );
});

// Remove product from wishlist
exports.removeFromWishlist = catchAsync(async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.params;
  
  if (!productId) {
    throw new ApiError(400, 'Product ID is required');
  }
  
  // Update user's wishlist
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { wishlist: productId } },
    { new: true }
  );
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  res.status(200).json(
    new ApiResponse(200, null, 'Product removed from wishlist')
  );
});

// Clear wishlist
exports.clearWishlist = catchAsync(async (req, res) => {
  const userId = req.user._id;
  
  const user = await User.findByIdAndUpdate(
    userId,
    { $set: { wishlist: [] } },
    { new: true }
  );
  
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  
  res.status(200).json(
    new ApiResponse(200, null, 'Wishlist cleared successfully')
  );
});
