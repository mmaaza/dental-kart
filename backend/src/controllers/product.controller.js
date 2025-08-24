// filepath: /home/maaz/Web Work/mbnepal/backend/src/controllers/product.controller.js
const Product = require('../models/product.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const mongoose = require('mongoose');

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = catchAsync(async (req, res) => {
  // If status is draft, we're saving as draft
  const isDraft = req.body.status === 'draft';
  // Approval defaults: admin-created products are approved; vendor-created are pending
  const isVendorCreator = req.user && (req.user.role === 'vendor');
  
  // Clean up vendor field - remove empty strings that would cause ObjectId cast error
  if (req.body.vendor === '' || req.body.vendor === null) {
    delete req.body.vendor;
  }
  
  if (isVendorCreator) {
    req.body.approvalStatus = 'pending';
    // Store vendor-submitted prices separately as proposal
    if (typeof req.body.regularPrice !== 'undefined') {
      req.body.vendorRegularPrice = req.body.regularPrice;
    }
    if (typeof req.body.specialOfferPrice !== 'undefined') {
      req.body.vendorSpecialOfferPrice = req.body.specialOfferPrice;
    }
    // Ensure required admin price doesn't block vendor creation
    if (typeof req.body.regularPrice === 'undefined') {
      req.body.regularPrice = 0;
    }
  }
  
  // Create the product with user as creator
  // For drafts, use validateBeforeSave: false option
  let product;
  if (isDraft) {
    // For drafts, create without validation
    const ProductModel = mongoose.model('Product');
    product = new ProductModel({
      ...req.body,
      isDraft,
      createdBy: req.user._id,
      // Set vendor field for vendor creators even in drafts
      ...(isVendorCreator ? { approvalStatus: 'pending', vendor: req.user._id } : {})
    });
    await product.save({ validateBeforeSave: false });
  } else {
    // For regular products, use normal validation
    product = await Product.create({
      ...req.body,
      isDraft,
      createdBy: req.user._id,
      // Vendors submit as pending by default
      ...(isVendorCreator ? { approvalStatus: 'pending', vendor: req.user._id } : {})
    });
  }

  res.status(201).json(
    new ApiResponse(
      201, 
      product, 
      isDraft ? 'Product draft saved successfully' : 'Product created successfully'
    )
  );
});

// CLIENT-SIDE API METHODS

// @desc    Get all products (public/client version)
// @route   GET /api/products
// @access  Public
exports.getProductsPublic = catchAsync(async (req, res) => {
  const { 
    category, 
    brand, 
    search, 
    minPrice, 
    maxPrice,
    sortBy,
    page = 1,
    limit = 10
  } = req.query;
  
  // Build query - only return active, approved, non-draft products
  const query = {
    status: 'active',
    isDraft: false,
    approvalStatus: 'approved'
  };
  
  // Filter by category
  if (category) {
    if (mongoose.Types.ObjectId.isValid(category)) {
      query.categories = category;
    } else {
      // Handle case where category is a comma-separated list of IDs
      const categoryIds = category
        .split(',')
        .filter(id => mongoose.Types.ObjectId.isValid(id.trim()))
        .map(id => id.trim());
        
      if (categoryIds.length > 0) {
        query.categories = { $in: categoryIds };
      }
    }
  }
  
  // Filter by brand
  if (brand && mongoose.Types.ObjectId.isValid(brand)) {
    query.brand = brand;
  }
  
  // Filter by price range
  if (minPrice || maxPrice) {
    query.regularPrice = {};
    if (minPrice) query.regularPrice.$gte = parseFloat(minPrice);
    if (maxPrice) query.regularPrice.$lte = parseFloat(maxPrice);
  }

  // Add search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { searchTags: { $regex: search, $options: 'i' } }
    ];
  }

  // Determine sort order
  let sortOptions = { createdAt: -1 }; // Default sort by newest
  
  if (sortBy === 'price-low') sortOptions = { regularPrice: 1 };
  else if (sortBy === 'price-high') sortOptions = { regularPrice: -1 };
  else if (sortBy === 'popular') sortOptions = { popularity: -1 };
  else if (sortBy === 'name-asc') sortOptions = { name: 1 };
  else if (sortBy === 'name-desc') sortOptions = { name: -1 };

  // Pagination
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;
  
  // Select only fields needed for client-side
  const productSelect = 'name slug description images regularPrice specialOfferPrice discountType discountValue brand categories stock status';
  
  // Execute query with pagination
  const products = await Product.find(query)
    .select(productSelect)
    .populate('brand', 'name slug')
    .populate('categories', 'name slug')
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum);
  
  // Get total count for pagination
  const totalCount = await Product.countDocuments(query);
  
  // Calculate pagination info
  const paginationInfo = {
    totalItems: totalCount,
    totalPages: Math.ceil(totalCount / limitNum),
    currentPage: pageNum,
    hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
    hasPrevPage: pageNum > 1
  };

  res.status(200).json(
    new ApiResponse(
      200, 
      { products, pagination: paginationInfo }, 
      'Products retrieved successfully'
    )
  );
});

// @desc    Get a specific product - public version
// @route   GET /api/products/:id
// @access  Public
exports.getProductPublic = catchAsync(async (req, res) => {
  // Find only active, approved products
  const product = await Product.findOne({
    _id: req.params.id,
    status: 'active',
    isDraft: false,
    approvalStatus: 'approved'
  })
    .select('-isDraft -createdBy -__v -approvalNotes')
    .populate('brand', 'name slug')
    .populate('categories', 'name slug')
    .populate('crossSellProducts', 'name slug images regularPrice specialOfferPrice')
    .populate('upSellProducts', 'name slug images regularPrice specialOfferPrice');

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.status(200).json(
    new ApiResponse(200, product, 'Product retrieved successfully')
  );
});

// @desc    Get a specific product by slug - public version
// @route   GET /api/products/slug/:slug
// @access  Public
exports.getProductBySlugPublic = catchAsync(async (req, res) => {
  const product = await Product.findOne({ 
    slug: req.params.slug,
    status: 'active',
    isDraft: false,
    approvalStatus: 'approved'
  })
    .select('-isDraft -createdBy -__v -approvalNotes')
    .populate('brand', 'name slug')
    .populate('categories', 'name slug')
    .populate('crossSellProducts', 'name slug images regularPrice specialOfferPrice')
    .populate('upSellProducts', 'name slug images regularPrice specialOfferPrice');

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  res.status(200).json(
    new ApiResponse(200, product, 'Product retrieved successfully')
  );
});

// @desc    Get related products - public version
// @route   GET /api/products/:id/related
// @access  Public
exports.getRelatedProductsPublic = catchAsync(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    status: 'active',
    isDraft: false
  });
  
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  
  // Find products that share categories or brand, but exclude current product
  const relatedProducts = await Product.find({
    $and: [
      { _id: { $ne: product._id } },  // Not the current product
      { status: 'active' },           // Only active products
      { isDraft: false },             // Not drafts
      { $or: [
        { categories: { $in: product.categories } }, // Same category
        { brand: product.brand }                     // Same brand
      ]}
    ]
  })
  .limit(6)
  .select('name slug images regularPrice specialOfferPrice discountValue discountType')
  .populate('brand', 'name');
  
  res.status(200).json(
    new ApiResponse(
      200, 
      relatedProducts, 
      'Related products retrieved successfully'
    )
  );
});

// ADMIN-SIDE API METHODS

// @desc    Get all products (admin version)
// @route   GET /api/products/admin/list
// @access  Private/Admin/Vendor
exports.getProductsAdmin = catchAsync(async (req, res) => {
  const { 
    status, 
    category, 
    brand, 
    vendor, 
    search, 
    minPrice, 
    maxPrice,
    sortBy,
    page = 1,
    limit = 10,
    showDrafts
  } = req.query;
  
  
  // Build query
  const query = {};
  
  // Show drafts only to admins who request them
  if (req.user && (req.user.role === 'admin' || req.user.role === 'vendor') && showDrafts === 'true') {
    query.isDraft = true;
    query.status = 'draft';
  } else {
    // For admin product selection, show all non-draft products regardless of status
    query.isDraft = false;
    // Don't filter by status - show all statuses for admin product selection
  }
  
  // Only filter by status if it's explicitly provided and not 'all'
  if (status && status !== 'all') {
    query.status = status;
  }
  
  // Vendors can only see their own products
  if (req.user.role === 'vendor') {
    query.vendor = req.user._id;
  }
  
  // Filter by category
  if (category) {
    if (mongoose.Types.ObjectId.isValid(category)) {
      query.categories = category;
    } else {
      // Handle case where category is a comma-separated list of IDs
      const categoryIds = category
        .split(',')
        .filter(id => mongoose.Types.ObjectId.isValid(id.trim()))
        .map(id => id.trim());
        
      if (categoryIds.length > 0) {
        query.categories = { $in: categoryIds };
      }
    }
  }
  
  // Filter by brand
  if (brand && mongoose.Types.ObjectId.isValid(brand)) {
    query.brand = brand;
    console.log('Filtering by brand:', brand);
  }
  
  // Filter by vendor (admin only)
  if (vendor && mongoose.Types.ObjectId.isValid(vendor) && req.user.role === 'admin') {
    query.vendor = vendor;
  }
  
  // Filter by price range
  if (minPrice || maxPrice) {
    query.regularPrice = {};
    if (minPrice) query.regularPrice.$gte = parseFloat(minPrice);
    if (maxPrice) query.regularPrice.$lte = parseFloat(maxPrice);
  }

  // Add search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { searchTags: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } }
    ];
  }

  // Determine sort order
  let sortOptions = { createdAt: -1 }; // Default sort by newest
  
  if (sortBy === 'price-low') sortOptions = { regularPrice: 1 };
  else if (sortBy === 'price-high') sortOptions = { regularPrice: -1 };
  else if (sortBy === 'popular') sortOptions = { popularity: -1 };
  else if (sortBy === 'name-asc') sortOptions = { name: 1 };
  else if (sortBy === 'name-desc') sortOptions = { name: -1 };

  // Pagination
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;
  
  const products = await Product.find(query)
    .populate('brand', 'name slug')
    .populate('categories', 'name slug')
    .populate('vendor', 'name')
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum);
  
  // Get total count for pagination
  const totalCount = await Product.countDocuments(query);
  
  // Calculate pagination info
  const paginationInfo = {
    totalItems: totalCount,
    totalPages: Math.ceil(totalCount / limitNum),
    currentPage: pageNum,
    hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
    hasPrevPage: pageNum > 1
  };

  res.status(200).json(
    new ApiResponse(
      200, 
      { products, pagination: paginationInfo }, 
      'Products retrieved successfully'
    )
  );
});

// @desc    Get a specific product - admin version
// @route   GET /api/products/admin/:id
// @access  Private/Admin/Vendor
exports.getProductAdmin = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('brand', 'name slug')
    .populate('categories', 'name slug')
    .populate('vendor', 'name')
    .populate('crossSellProducts', 'name slug images regularPrice specialOfferPrice')
    .populate('upSellProducts', 'name slug images regularPrice specialOfferPrice');

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Vendors can only access their own products
  if (req.user.role === 'vendor' && 
      product.vendor && 
      product.vendor.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not have permission to access this product');
  }

  res.status(200).json(
    new ApiResponse(200, product, 'Product retrieved successfully')
  );
});

// @desc    Get all products
// @route   GET /api/products
// @access  Public/Private
exports.getProducts = catchAsync(async (req, res) => {
  const { 
    status, 
    category, 
    brand, 
    vendor, 
    search, 
    minPrice, 
    maxPrice,
    sortBy,
    page = 1,
    limit = 10,
    showDrafts
  } = req.query;
  
  // Build query
  const query = {};
  
  // Only filter by status if it's explicitly provided and not 'all'
  if (status && status !== 'all') {
    query.status = status;
  }
  
  // For non-admin users, only show active products and hide drafts
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'vendor')) {
    query.status = 'active';
    query.isDraft = false;
  }

  // Show drafts only to admins who request them
  if (req.user && (req.user.role === 'admin' || req.user.role === 'vendor') && showDrafts === 'true') {
    query.isDraft = true;
    query.status = 'draft';
  } else if (!showDrafts) {
    query.isDraft = false;
  }
  
  // Filter by category
  if (category) {
    if (mongoose.Types.ObjectId.isValid(category)) {
      query.categories = category;
    } else {
      // Handle case where category is a comma-separated list of IDs
      const categoryIds = category
        .split(',')
        .filter(id => mongoose.Types.ObjectId.isValid(id.trim()))
        .map(id => id.trim());
        
      if (categoryIds.length > 0) {
        query.categories = { $in: categoryIds };
      }
    }
  }
  
  // Filter by brand
  if (brand && mongoose.Types.ObjectId.isValid(brand)) {
    query.brand = brand;
  }
  
  // Filter by vendor
  if (vendor && mongoose.Types.ObjectId.isValid(vendor)) {
    query.vendor = vendor;
  }
  
  // Filter by price range
  if (minPrice || maxPrice) {
    query.regularPrice = {};
    if (minPrice) query.regularPrice.$gte = parseFloat(minPrice);
    if (maxPrice) query.regularPrice.$lte = parseFloat(maxPrice);
  }

  // Add search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { searchTags: { $regex: search, $options: 'i' } },
      { sku: { $regex: search, $options: 'i' } }
    ];
  }

  // Determine sort order
  let sortOptions = { createdAt: -1 }; // Default sort by newest
  
  if (sortBy === 'price-low') sortOptions = { regularPrice: 1 };
  else if (sortBy === 'price-high') sortOptions = { regularPrice: -1 };
  else if (sortBy === 'popular') sortOptions = { popularity: -1 };
  else if (sortBy === 'name-asc') sortOptions = { name: 1 };
  else if (sortBy === 'name-desc') sortOptions = { name: -1 };

  // Pagination
  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;
  
  // Execute query with pagination
  const products = await Product.find(query)
    .populate('brand', 'name slug')
    .populate('categories', 'name slug')
    .populate('vendor', 'name')
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum);
  
  // Get total count for pagination
  const totalCount = await Product.countDocuments(query);
  
  // Calculate pagination info
  const paginationInfo = {
    totalItems: totalCount,
    totalPages: Math.ceil(totalCount / limitNum),
    currentPage: pageNum,
    hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
    hasPrevPage: pageNum > 1
  };

  res.status(200).json(
    new ApiResponse(
      200, 
      { products, pagination: paginationInfo }, 
      'Products retrieved successfully'
    )
  );
});

// @desc    Get a specific product (draft or regular)
// @route   GET /api/products/:id
// @access  Public/Private
exports.getProduct = catchAsync(async (req, res) => {
  // Unified product fetching logic - works for both drafts and regular products
  const product = await Product.findById(req.params.id)
    .populate('brand', 'name slug')
    .populate('categories', 'name slug')
    .populate('vendor', 'name')
    .populate('crossSellProducts', 'name slug images regularPrice specialOfferPrice')
    .populate('upSellProducts', 'name slug images regularPrice specialOfferPrice');

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Only admins/vendors can see draft products or inactive products
  if ((product.isDraft || product.status !== 'active') && 
      (!req.user || (req.user.role !== 'admin' && req.user.role !== 'vendor'))) {
    throw new ApiError(404, 'Product not found');
  }

  // If product is owned by vendor, only that vendor or admins can see it in draft mode
  if (product.vendor && product.isDraft && 
      req.user && req.user.role === 'vendor' && 
      product.vendor.toString() !== req.user._id.toString()) {
    throw new ApiError(404, 'Product not found');
  }

  res.status(200).json(
    new ApiResponse(200, product, 'Product retrieved successfully')
  );
});

// @desc    Get a specific product by slug
// @route   GET /api/products/slug/:slug
// @access  Public/Private
exports.getProductBySlug = catchAsync(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug })
    .populate('brand', 'name slug')
    .populate('categories', 'name slug')
    .populate('vendor', 'name')
    .populate('crossSellProducts', 'name slug images regularPrice specialOfferPrice')
    .populate('upSellProducts', 'name slug images regularPrice specialOfferPrice');

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Only admins can see draft products or inactive products
  if ((product.isDraft || product.status !== 'active') && 
      (!req.user || (req.user.role !== 'admin' && req.user.role !== 'vendor'))) {
    throw new ApiError(404, 'Product not found');
  }

  // If product is owned by vendor, only that vendor or admins can see it in draft mode
  if (product.vendor && product.isDraft && 
      req.user && req.user.role === 'vendor' && 
      product.vendor.toString() !== req.user._id.toString()) {
    throw new ApiError(404, 'Product not found');
  }

  res.status(200).json(
    new ApiResponse(200, product, 'Product retrieved successfully')
  );
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin/Vendor
exports.updateProduct = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Clean up vendor field - remove empty strings that would cause ObjectId cast error
  if (req.body.vendor === '' || req.body.vendor === null) {
    delete req.body.vendor;
  }

  // Check ownership if vendor is updating
  if (req.user.role === 'vendor' && 
      product.vendor && 
      product.vendor.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not have permission to update this product');
  }

  // Check if updating from draft status
  const updatingDraftStatus = product.status === 'draft' && req.body.status && req.body.status !== 'draft';
  
  // Determine if this update is saving as draft
  const isDraft = req.body.status === 'draft';

  // Update fields
  const updateDoc = { ...req.body, isDraft };
  // If a vendor updates, keep approval as pending and don't auto-approve
  if (req.user.role === 'vendor') {
    updateDoc.approvalStatus = 'pending';
    if (typeof req.body.regularPrice !== 'undefined') updateDoc.vendorRegularPrice = req.body.regularPrice;
    if (typeof req.body.specialOfferPrice !== 'undefined') updateDoc.vendorSpecialOfferPrice = req.body.specialOfferPrice;
  }

  // If admin approves via update (approvalStatus === 'approved'), set audit and allow setting selling prices
  if (req.user.role === 'admin' && req.body.approvalStatus === 'approved') {
    updateDoc.approvedBy = req.user._id;
    updateDoc.approvedAt = new Date();
    // Admin may set final selling prices (regularPrice/specialOfferPrice)
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    updateDoc,
    { new: true, runValidators: !isDraft }
  );

  res.status(200).json(
    new ApiResponse(
      200, 
      updatedProduct, 
      updatingDraftStatus 
        ? 'Product published successfully' 
        : isDraft 
          ? 'Draft saved successfully' 
          : 'Product updated successfully'
    )
  );
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin/Vendor
exports.deleteProduct = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Check ownership if vendor is deleting
  if (req.user.role === 'vendor' && 
      product.vendor && 
      product.vendor.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not have permission to delete this product');
  }

  await Product.findByIdAndDelete(req.params.id);

  res.status(200).json(
    new ApiResponse(200, {}, 'Product deleted successfully')
  );
});

// @desc    Toggle product status
// @route   PATCH /api/products/:id/toggle-status
// @access  Private/Admin/Vendor
exports.toggleStatus = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Check ownership if vendor is updating
  if (req.user.role === 'vendor' && 
      product.vendor && 
      product.vendor.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not have permission to update this product');
  }

  // Cannot toggle to "draft" with this endpoint
  let newStatus;
  if (product.status === 'active') {
    newStatus = 'inactive';
  } else if (product.status === 'inactive' || product.status === 'draft') {
    newStatus = 'active';
    // If changing from draft to active, also update isDraft flag
    if (product.status === 'draft') {
      product.isDraft = false;
    }
  } else if (product.status === 'out-of-stock') {
    newStatus = 'active';
  }

  product.status = newStatus;
  await product.save();

  res.status(200).json(
    new ApiResponse(200, product, `Product ${product.status === 'active' ? 'activated' : 'deactivated'}`)
  );
});

// @desc    Approve or reject a vendor product and optionally set selling prices
// @route   PATCH /api/products/:id/approve
// @access  Private/Admin
exports.approveProduct = catchAsync(async (req, res) => {
  const { approvalStatus, approvalNotes, regularPrice, specialOfferPrice } = req.body;

  if (!['approved', 'rejected', 'pending'].includes(approvalStatus)) {
    throw new ApiError(400, 'Invalid approval status');
  }

  const update = {
    approvalStatus,
    approvalNotes: approvalNotes || ''
  };

  if (approvalStatus === 'approved') {
    update.approvedBy = req.user._id;
    update.approvedAt = new Date();
    if (typeof regularPrice !== 'undefined') update.regularPrice = regularPrice;
    if (typeof specialOfferPrice !== 'undefined') update.specialOfferPrice = specialOfferPrice;
  } else {
    update.approvedBy = undefined;
    update.approvedAt = undefined;
  }

  const product = await Product.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!product) throw new ApiError(404, 'Product not found');

  res.status(200).json(new ApiResponse(200, product, 'Product approval updated'));
});

// @desc    Update product inventory (stock) - vendor scoped
// @route   PATCH /api/products/vendor/:id/inventory
// @access  Private/Vendor/Admin (via vendor auth route)
exports.updateInventoryVendor = catchAsync(async (req, res) => {
  const { stock } = req.body;
  if (stock === undefined || stock === null || Number.isNaN(Number(stock))) {
    throw new ApiError(400, 'Valid stock value is required');
  }

  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Vendors can only update their own product inventory
  if (req.user.role === 'vendor' && product.vendor && product.vendor.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not have permission to update this product');
  }

  product.stock = Number(stock);

  // Optional: auto set out-of-stock status if stock is 0, otherwise keep existing status
  if (product.stock === 0 && product.status !== 'out-of-stock') {
    product.status = 'out-of-stock';
  } else if (product.stock > 0 && product.status === 'out-of-stock') {
    // If restocked from 0, set to active
    product.status = 'active';
  }

  await product.save();

  res.status(200).json(
    new ApiResponse(200, product, 'Inventory updated successfully')
  );
});

// @desc    Get all draft products
// @route   GET /api/products?showDrafts=true
// @access  Private/Admin/Vendor
exports.getDraftProducts = catchAsync(async (req, res) => {
  // Build query to get only drafts
  const query = {
    isDraft: true,
    status: 'draft'
  };

  // Vendors can only see their own drafts
  if (req.user.role === 'vendor') {
    query.vendor = req.user._id;
  }

  const draftProducts = await Product.find(query)
    .populate('brand', 'name')
    .populate('categories', 'name')
    .select('name images regularPrice status createdAt');

  res.status(200).json(
    new ApiResponse(
      200, 
      draftProducts, 
      'Draft products retrieved successfully'
    )
  );
});

// @desc    Publish a draft product
// @route   PATCH /api/products/:id/publish
// @access  Private/Admin/Vendor
exports.publishDraft = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Check if product is a draft
  if (!product.isDraft || product.status !== 'draft') {
    throw new ApiError(400, 'This product is not a draft');
  }

  // Check ownership if vendor is publishing
  if (req.user.role === 'vendor' && 
      product.vendor && 
      product.vendor.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not have permission to publish this product');
  }

  // Update to active status
  product.status = 'active';
  product.isDraft = false;
  await product.save();

  res.status(200).json(
    new ApiResponse(
      200, 
      product, 
      'Product published successfully'
    )
  );
});

// @desc    Get related products by category or brand
// @route   GET /api/products/:id/related
// @access  Public
exports.getRelatedProducts = catchAsync(async (req, res) => {
  const product = await Product.findById(req.params.id);
  
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  
  // Find products that share categories or brand, but exclude current product
  const relatedProducts = await Product.find({
    $and: [
      { _id: { $ne: product._id } },  // Not the current product
      { status: 'active' },           // Only active products
      { isDraft: false },             // Not drafts
      { $or: [
        { categories: { $in: product.categories } }, // Same category
        { brand: product.brand }                     // Same brand
      ]}
    ]
  })
  .limit(6)
  .select('name slug images regularPrice specialOfferPrice discountValue discountType')
  .populate('brand', 'name');
  
  res.status(200).json(
    new ApiResponse(
      200, 
      relatedProducts, 
      'Related products retrieved successfully'
    )
  );
});