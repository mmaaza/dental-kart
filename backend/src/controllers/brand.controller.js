const Brand = require('../models/brand.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

// @desc    Create a new brand
// @route   POST /api/brands
// @access  Private/Admin
exports.createBrand = catchAsync(async (req, res) => {
  const { name, description, picture, tags, metaTitle, metaDescription, keywords, featured, status } = req.body;

  // Enforce unique name (case-insensitive)
  const existing = await Brand.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  if (existing) {
    throw new ApiError(409, 'Brand with this name already exists');
  }

  // Create the brand with user as creator (createdBy optional)
  const payload = {
    name,
    description,
    picture,
    tags: tags || [],
    metaTitle,
    metaDescription,
    keywords,
    featured: featured || false,
    status: status || 'active'
  };
  if (req.user?._id) payload.createdBy = req.user._id;

  const brand = await Brand.create(payload);

  res.status(201).json(new ApiResponse(201, brand, 'Brand created successfully'));
});

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
exports.getBrands = catchAsync(async (req, res) => {
  const { featured, status, search } = req.query;
  
  // Build query
  const query = {};
  
  if (featured) {
    query.featured = featured === 'true';
  }
  
  // Only filter by status if it's explicitly provided and not 'all'
  if (status && status !== 'all') {
    query.status = status;
  }
  
  // For non-admin users, only show active brands
  if ((!req.user || req.user.role !== 'admin') && !status) {
    query.status = 'active';
  }

  // Add search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  const brands = await Brand.find(query).sort({ name: 1 });

  res.status(200).json(new ApiResponse(200, brands, 'Brands retrieved successfully'));
});

// @desc    Get a specific brand
// @route   GET /api/brands/:id
// @access  Public
exports.getBrand = catchAsync(async (req, res) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    throw new ApiError(404, 'Brand not found');
  }

  // Non-admins can only see active brands
  if (brand.status !== 'active' && (!req.user || req.user.role !== 'admin')) {
    throw new ApiError(404, 'Brand not found');
  }

  res.status(200).json(new ApiResponse(200, brand, 'Brand retrieved successfully'));
});

// @desc    Get a specific brand by slug
// @route   GET /api/brands/slug/:slug
// @access  Public
exports.getBrandBySlug = catchAsync(async (req, res) => {
  const brand = await Brand.findOne({ slug: req.params.slug });

  if (!brand) {
    throw new ApiError(404, 'Brand not found');
  }

  // Non-admins can only see active brands
  if (brand.status !== 'active' && (!req.user || req.user.role !== 'admin')) {
    throw new ApiError(404, 'Brand not found');
  }

  res.status(200).json(new ApiResponse(200, brand, 'Brand retrieved successfully'));
});

// @desc    Update a brand
// @route   PUT /api/brands/:id
// @access  Private/Admin
exports.updateBrand = catchAsync(async (req, res) => {
  const { name, description, picture, tags, metaTitle, metaDescription, keywords, featured, status } = req.body;

  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    throw new ApiError(404, 'Brand not found');
  }

  // Update fields
  if (name !== undefined) brand.name = name;
  if (description !== undefined) brand.description = description;
  if (picture !== undefined) brand.picture = picture;
  if (tags !== undefined) brand.tags = tags;
  if (metaTitle !== undefined) brand.metaTitle = metaTitle;
  if (metaDescription !== undefined) brand.metaDescription = metaDescription;
  if (keywords !== undefined) brand.keywords = keywords;
  if (featured !== undefined) brand.featured = featured;
  if (status !== undefined) brand.status = status;

  await brand.save();

  res.status(200).json(new ApiResponse(200, brand, 'Brand updated successfully'));
});

// @desc    Delete a brand
// @route   DELETE /api/brands/:id
// @access  Private/Admin
exports.deleteBrand = catchAsync(async (req, res) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    throw new ApiError(404, 'Brand not found');
  }

  await Brand.findByIdAndDelete(req.params.id);

  res.status(200).json(new ApiResponse(200, {}, 'Brand deleted successfully'));
});

// @desc    Toggle brand featured status
// @route   PATCH /api/brands/:id/toggle-featured
// @access  Private/Admin
exports.toggleFeatured = catchAsync(async (req, res) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    throw new ApiError(404, 'Brand not found');
  }

  brand.featured = !brand.featured;
  await brand.save();

  res.status(200).json(new ApiResponse(200, brand, `Brand ${brand.featured ? 'marked as featured' : 'removed from featured'}`));
});

// @desc    Toggle brand active status
// @route   PATCH /api/brands/:id/toggle-status
// @access  Private/Admin
exports.toggleStatus = catchAsync(async (req, res) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    throw new ApiError(404, 'Brand not found');
  }

  brand.status = brand.status === 'active' ? 'inactive' : 'active';
  await brand.save();

  res.status(200).json(new ApiResponse(200, brand, `Brand ${brand.status === 'active' ? 'activated' : 'deactivated'}`));
});

// CLIENT-SIDE API METHODS

// @desc    Get all brands (public/client version)
// @route   GET /api/brands
// @access  Public
exports.getBrandsPublic = catchAsync(async (req, res) => {
  const { featured, search } = req.query;
  
  // Build query - for public API, only return active brands
  const query = { status: 'active' };
  
  if (featured) {
    query.featured = featured === 'true';
  }
  
  // Add search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  // Select only fields needed for client-side
  const brandSelect = 'name slug description picture tags featured';
  
  const brands = await Brand.find(query)
    .select(brandSelect)
    .sort({ name: 1 });
  
  res.status(200).json(
    new ApiResponse(200, brands, 'Brands retrieved successfully')
  );
});

// @desc    Get a specific brand by ID (public/client version)
// @route   GET /api/brands/:id
// @access  Public
exports.getBrandPublic = catchAsync(async (req, res) => {
  const brand = await Brand.findOne({
    _id: req.params.id,
    status: 'active'
  }).select('-createdBy -__v -updatedAt');

  if (!brand) {
    throw new ApiError(404, 'Brand not found');
  }

  res.status(200).json(
    new ApiResponse(200, brand, 'Brand retrieved successfully')
  );
});

// @desc    Get a specific brand by slug (public/client version)
// @route   GET /api/brands/slug/:slug
// @access  Public
exports.getBrandBySlugPublic = catchAsync(async (req, res) => {
  const brand = await Brand.findOne({ 
    slug: req.params.slug,
    status: 'active'
  }).select('-createdBy -__v -updatedAt');

  if (!brand) {
    throw new ApiError(404, 'Brand not found');
  }

  res.status(200).json(
    new ApiResponse(200, brand, 'Brand retrieved successfully')
  );
});

// ADMIN-SIDE API METHODS

// @desc    Get all brands (admin version)
// @route   GET /api/brands/admin/list
// @access  Private/Admin
exports.getBrandsAdmin = catchAsync(async (req, res) => {
  const { featured, status, search } = req.query;
  
  // Build query
  const query = {};
  
  if (featured) {
    query.featured = featured === 'true';
  }
  
  // Only filter by status if it's explicitly provided and not 'all'
  if (status && status !== 'all') {
    query.status = status;
  }

  // Add search functionality
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { tags: { $in: [new RegExp(search, 'i')] } }
    ];
  }

  // Include all fields for admin view
  const brands = await Brand.find(query).sort({ name: 1 });
  
  res.status(200).json(
    new ApiResponse(200, brands, 'Brands retrieved successfully')
  );
});

// @desc    Get a specific brand by ID (admin version)
// @route   GET /api/brands/admin/:id
// @access  Private/Admin
exports.getBrandAdmin = catchAsync(async (req, res) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    throw new ApiError(404, 'Brand not found');
  }

  res.status(200).json(
    new ApiResponse(200, brand, 'Brand retrieved successfully')
  );
});