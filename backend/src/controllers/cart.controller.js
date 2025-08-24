const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const mongoose = require('mongoose');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
exports.getUserCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  let cart = await Cart.findOne({ user: userId })
    .populate({
      path: 'items.product',
      select: 'name slug images regularPrice specialOfferPrice discountType discountValue stock status'
    });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  // Filter out items with null/deleted products or inactive products
  const originalItemCount = cart.items.length;
  cart.items = cart.items.filter(item => 
    item.product && 
    item.product._id && 
    item.product.status === 'active'
  );

  // If items were filtered out, save the cleaned cart
  if (cart.items.length !== originalItemCount) {
    await cart.save();
    console.log(`Cleaned ${originalItemCount - cart.items.length} invalid items from cart for user ${userId}`);
  }

  res.status(200).json(
    new ApiResponse(200, cart, 'Cart retrieved successfully')
  );
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, attributes = {} } = req.body;
  const userId = req.user._id;

  // Validate product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Check if product is active
  if (product.status !== 'active') {
    throw new ApiError(400, 'Product is not available for purchase');
  }

  // Check stock (if product has stock control)
  if (product.stock !== undefined && product.stock !== null && product.stock < quantity) {
    throw new ApiError(400, 'Not enough stock available');
  }

  // Find user cart or create if it doesn't exist
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: []
    });
  }

  // Check if product is already in cart
  const itemIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );

  // If product exists, update quantity
  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
    
    // Check if updated quantity exceeds stock
    if (product.stock !== undefined && product.stock !== null && cart.items[itemIndex].quantity > product.stock) {
      cart.items[itemIndex].quantity = product.stock;
    }
    
    // Update attributes if provided
    if (Object.keys(attributes).length > 0) {
      cart.items[itemIndex].attributes = attributes;
    }
  } else {
    // Add new product to cart
    cart.items.push({
      product: productId,
      quantity,
      attributes
    });
  }

  await cart.save();
  
  // Populate product details
  await cart.populate({
    path: 'items.product',
    select: 'name slug images regularPrice specialOfferPrice discountType discountValue stock status'
  });

  res.status(200).json(
    new ApiResponse(200, cart, 'Product added to cart successfully')
  );
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
exports.updateCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const { quantity } = req.body;
  const userId = req.user._id;

  // Validate quantity
  if (!quantity || quantity < 1) {
    throw new ApiError(400, 'Quantity must be at least 1');
  }

  let cart = await Cart.findOne({ user: userId });
  
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  // Find the item
  const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
  
  if (itemIndex === -1) {
    throw new ApiError(404, 'Cart item not found');
  }

  // Get product to check stock
  const productId = cart.items[itemIndex].product;
  const product = await Product.findById(productId);
  
  if (!product) {
    throw new ApiError(404, 'Associated product not found');
  }

  // Check stock
  if (product.stock !== undefined && product.stock !== null && quantity > product.stock) {
    throw new ApiError(400, `Only ${product.stock} items available in stock`);
  }

  // Update quantity
  cart.items[itemIndex].quantity = quantity;
  await cart.save();
  
  // Populate product details
  await cart.populate({
    path: 'items.product',
    select: 'name slug images regularPrice specialOfferPrice discountType discountValue stock status'
  });

  res.status(200).json(
    new ApiResponse(200, cart, 'Cart item updated successfully')
  );
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeCartItem = asyncHandler(async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user._id;

  let cart = await Cart.findOne({ user: userId });
  
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  // Remove the item
  cart.items = cart.items.filter(item => item._id.toString() !== itemId);
  await cart.save();
  
  // Populate product details
  await cart.populate({
    path: 'items.product',
    select: 'name slug images regularPrice specialOfferPrice discountType discountValue stock status'
  });

  res.status(200).json(
    new ApiResponse(200, cart, 'Item removed from cart successfully')
  );
});

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
exports.clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  let cart = await Cart.findOne({ user: userId });
  
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  // Clear cart items
  cart.items = [];
  await cart.save();

  res.status(200).json(
    new ApiResponse(200, cart, 'Cart cleared successfully')
  );
});

// @desc    Get all user carts (admin)
// @route   GET /api/cart/admin/all
// @access  Private/Admin
exports.getAllCarts = asyncHandler(async (req, res) => {
  // Pagination parameters
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Get carts with populated user and product info
  const carts = await Cart.find({ 'items.0': { $exists: true } }) // Only non-empty carts
    .populate('user', 'name email')
    .populate({
      path: 'items.product',
      select: 'name slug images regularPrice specialOfferPrice'
    })
    .sort({ updatedAt: -1 })
    .skip(skip)
    .limit(limit);

  // Get total count for pagination
  const totalCount = await Cart.countDocuments({ 'items.0': { $exists: true } });

  // Calculate pagination info
  const paginationInfo = {
    totalItems: totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: page,
    hasNextPage: page < Math.ceil(totalCount / limit),
    hasPrevPage: page > 1
  };

  res.status(200).json(
    new ApiResponse(
      200, 
      { carts, pagination: paginationInfo }, 
      'User carts retrieved successfully'
    )
  );
});

// @desc    Get specific user's cart (admin)
// @route   GET /api/cart/admin/:userId
// @access  Private/Admin
exports.getUserCartByAdmin = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Validate userId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, 'Invalid user ID');
  }

  const cart = await Cart.findOne({ user: userId })
    .populate('user', 'name email')
    .populate({
      path: 'items.product',
      select: 'name slug images regularPrice specialOfferPrice discountType discountValue stock status'
    });

  if (!cart) {
    throw new ApiError(404, 'Cart not found for this user');
  }

  res.status(200).json(
    new ApiResponse(200, cart, 'User cart retrieved successfully')
  );
});

// @desc    Clean up cart by removing items with deleted/invalid products
// @route   PUT /api/cart/cleanup
// @access  Private
exports.cleanupCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { items = [] } = req.body;

  let cart = await Cart.findOne({ user: userId });
  
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  // If items array is provided, validate each product still exists
  if (items.length > 0) {
    const validatedItems = [];
    
    for (const item of items) {
      try {
        const product = await Product.findById(item.productId);
        if (product && product.status === 'active') {
          validatedItems.push({
            product: item.productId,
            quantity: item.quantity || 1,
            attributes: item.attributes || {}
          });
        }
      } catch (error) {
        // Skip invalid product IDs
        console.log(`Skipping invalid product ID: ${item.productId}`);
      }
    }
    
    cart.items = validatedItems;
  } else {
    // If no items provided, remove all items with invalid/deleted products
    const validItems = [];
    
    for (const item of cart.items) {
      try {
        const product = await Product.findById(item.product);
        if (product && product.status === 'active') {
          validItems.push(item);
        }
      } catch (error) {
        // Skip items with invalid product references
        console.log(`Removing item with invalid product reference: ${item.product}`);
      }
    }
    
    cart.items = validItems;
  }

  await cart.save();

  // Populate the cart before sending response
  cart = await Cart.findById(cart._id)
    .populate({
      path: 'items.product',
      select: 'name slug images regularPrice specialOfferPrice discountType discountValue stock status'
    });

  res.status(200).json(
    new ApiResponse(200, cart, 'Cart cleaned up successfully')
  );
});
