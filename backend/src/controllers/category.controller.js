const Category = require('../models/category.model');
const Product = require('../models/product.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const mongoose = require('mongoose');

// Helper function to get or create uncategorized category
const getOrCreateUncategorizedCategory = async () => {
  let uncategorizedCategory = await Category.findOne({ 
    name: 'Uncategorized' 
  });
  
  if (!uncategorizedCategory) {
    const categoryData = {
      name: 'Uncategorized',
      slug: 'uncategorized',
      status: 'active',
      description: 'Products without specific categories',
      level: 0,
      parentId: null,
      ancestors: [],
      featured: false
    };
    
    uncategorizedCategory = await Category.create(categoryData);
  }
  
  return uncategorizedCategory;
};

// Get all categories (with tree structure)
exports.getAllCategories = catchAsync(async (req, res) => {
  const { status, featured } = req.query;
  
  const filter = {};
  
  if (status) {
    filter.status = status;
  }
  
  if (featured !== undefined) {
    filter.featured = featured === 'true';
  }

  // Get all categories
  const categories = await Category.find(filter)
    .populate('children')
    .sort({ name: 1 });
  
  // Create tree structure
  const rootCategories = categories.filter(cat => !cat.parentId);
  
  const buildTree = (categories, parent = null) => {
    const tree = categories
      .filter(cat => {
        if (!parent) return !cat.parentId;
        return cat.parentId && cat.parentId.toString() === parent._id.toString();
      })
      .map(cat => {
        const node = cat.toObject();
        const children = buildTree(categories, cat);
        if (children.length > 0) {
          node.children = children;
        } else {
          node.children = [];
        }
        return node;
      });
      
    return tree;
  };
  
  const categoryTree = buildTree(categories);
  
  res.json(new ApiResponse(200, categoryTree, 'Categories retrieved successfully'));
});

// Create a new category
exports.createCategory = catchAsync(async (req, res) => {
  // Extract fields from request
  const { 
    name, 
    description, 
    parentId, 
    image, 
    status, 
    featured, 
    tags,
    keywords,
    metaTitle,
    metaDescription,
    slug: customSlug
  } = req.body;

  // Check if category with same name already exists
  const existingCategory = await Category.findOne({ 
    name: { $regex: new RegExp(`^${name}$`, 'i') }
  });
  
  if (existingCategory) {
    throw new ApiError(409, 'Category with this name already exists');
  }

  // Generate slug from name if not provided
  const slug = customSlug || name.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  // Check if slug already exists
  const existingSlug = await Category.findOne({ slug });
  if (existingSlug) {
    throw new ApiError(409, 'Category with this slug already exists');
  }

  // Create category data
  const categoryData = {
    name,
    slug,
    description,
    image,
    status: status || 'active',
    featured: !!featured,
    tags,
    keywords,
    metaTitle,
    metaDescription,
    createdBy: req.user._id
  };

  if (parentId) {
    // Check if parent exists
    const parentCategory = await Category.findById(parentId);
    if (!parentCategory) {
      throw new ApiError(404, 'Parent category not found');
    }
    categoryData.parentId = parentId;
  }

  // Create category
  const category = await Category.create(categoryData);
  
  res.status(201).json(new ApiResponse(201, category, 'Category created successfully'));
});

// Update a category
exports.updateCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { 
    name, 
    description, 
    parentId, 
    image, 
    status, 
    featured,
    tags,
    keywords,
    metaTitle,
    metaDescription,
    slug
  } = req.body;

  // Find the category to update
  const category = await Category.findById(id);
  
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  // If changing name, check for duplicates
  if (name && name !== category.name) {
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: id }
    });
    
    if (existingCategory) {
      throw new ApiError(409, 'Category with this name already exists');
    }
    
    category.name = name;
    // When name changes, slug will be automatically generated in the pre-validate middleware
  } 
  // If slug is explicitly provided, use it instead of generating from name
  else if (slug && slug !== category.slug) {
    // Check if slug already exists
    const existingCategoryWithSlug = await Category.findOne({
      slug: slug,
      _id: { $ne: id }
    });
    
    if (existingCategoryWithSlug) {
      throw new ApiError(409, 'Category with this slug already exists');
    }
    
    category.slug = slug;
  }

  // Update fields if provided
  if (description !== undefined) category.description = description;
  if (image !== undefined) category.image = image;
  if (status !== undefined) {
    category.status = status;
    // If status is set to inactive, automatically set featured to false
    if (status === 'inactive') {
      category.featured = false;
    }
  }
  if (featured !== undefined) category.featured = featured;
  if (tags !== undefined) category.tags = tags;
  if (keywords !== undefined) category.keywords = keywords;
  if (metaTitle !== undefined) category.metaTitle = metaTitle;
  if (metaDescription !== undefined) category.metaDescription = metaDescription;

  // Handle parent category change
  if (parentId !== undefined && parentId !== category.parentId?.toString()) {
    // Check if trying to make a category its own parent/descendant
    if (parentId && parentId === id) {
      throw new ApiError(400, 'A category cannot be its own parent');
    }
    
    if (parentId) {
      const children = await Category.find({ ancestors: id });
      if (children.some(child => child._id.toString() === parentId)) {
        throw new ApiError(400, 'A category cannot be a parent of its ancestor');
      }
      
      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        throw new ApiError(404, 'Parent category not found');
      }
      
      category.parentId = parentId;
    } else {
      category.parentId = null;
    }
  }

  await category.save();
  
  res.json(new ApiResponse(200, category, 'Category updated successfully'));
});

// Get a single category
exports.getCategoryById = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const category = await Category.findById(id)
    .populate('children');
  
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }
  
  res.json(new ApiResponse(200, category, 'Category retrieved successfully'));
});

// Delete a category
exports.deleteCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { moveToUncategorized = true } = req.body; // Default to moving products to uncategorized
  
  try {
    // Find the category
    const category = await Category.findById(id);
    
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }
    
    // Find subcategories
    const subcategories = await Category.find({ ancestors: id });
    const allCategoryIds = [id, ...subcategories.map(sub => sub._id)];
    
    // Count products that will be affected
    const productCount = await Product.countDocuments({
      categories: { $in: allCategoryIds }
    });
    
    if (moveToUncategorized && productCount > 0) {
      // Find or create "Uncategorized" category
      const uncategorizedCategory = await getOrCreateUncategorizedCategory();
      
      // Get all products that will be affected
      const affectedProducts = await Product.find(
        { categories: { $in: allCategoryIds } },
        '_id'
      );
      const affectedProductIds = affectedProducts.map(p => p._id);
      
      // First, remove the deleted categories from products
      await Product.updateMany(
        { _id: { $in: affectedProductIds } },
        { $pull: { categories: { $in: allCategoryIds } } }
      );
      
      // Then, add the uncategorized category to these products
      await Product.updateMany(
        { _id: { $in: affectedProductIds } },
        { $addToSet: { categories: uncategorizedCategory._id } }
      );
    }
    
    // Delete all subcategories
    if (subcategories.length > 0) {
      await Category.deleteMany({ ancestors: id });
    }
    
    // Delete the category itself
    await Category.findByIdAndDelete(id);
    
    const responseMessage = moveToUncategorized && productCount > 0 
      ? `Category deleted successfully. ${productCount} products moved to Uncategorized.`
      : 'Category and its subcategories deleted successfully';
    
    res.json(new ApiResponse(200, {
      deletedCategories: allCategoryIds.length,
      movedProducts: moveToUncategorized ? productCount : 0,
      moveToUncategorized
    }, responseMessage));
  } catch (error) {
    throw error;
  }
});

// Get category deletion preview
exports.getCategoryDeletionPreview = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }
  
  // Find all subcategories
  const subcategories = await Category.find({ ancestors: id });
  const allCategoryIds = [id, ...subcategories.map(sub => sub._id)];
  
  // Count products in these categories
  const productCount = await Product.countDocuments({
    categories: { $in: allCategoryIds }
  });
  
  // Get sample products
  const sampleProducts = await Product.find(
    { categories: { $in: allCategoryIds } },
    'name slug'
  ).limit(5);
  
  res.json(new ApiResponse(200, {
    category: {
      id: category._id,
      name: category.name,
      level: category.level
    },
    subcategories: subcategories.map(sub => ({
      id: sub._id,
      name: sub.name,
      level: sub.level
    })),
    totalCategoriesToDelete: allCategoryIds.length,
    totalProductsAffected: productCount,
    sampleProducts: sampleProducts.map(p => ({
      id: p._id,
      name: p.name,
      slug: p.slug
    }))
  }, 'Category deletion preview'));
});

// Toggle category status (active/inactive)
exports.toggleStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  // Find the category
  const category = await Category.findById(id);
  
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }
  
  // Toggle the status
  category.status = category.status === 'active' ? 'inactive' : 'active';
  
  // If setting to inactive, also set featured to false
  if (category.status === 'inactive') {
    category.featured = false;
  }
  
  await category.save();
  
  res.json(new ApiResponse(200, category, `Category status updated to ${category.status}`));
});

// CLIENT-SIDE API METHODS

// @desc    Get all categories (public/client version)
// @route   GET /api/categories
// @access  Public
exports.getCategoriesPublic = async (req, res) => {
  try {
    const { status, format = 'tree' } = req.query;
    
    // Build query - for public API, only return active categories
    const query = { status: 'active' };
    
    // Get all categories first
    const categories = await Category.find(query)
      .sort({ 'name': 1 })
      .select('name slug description image level parentId ancestors featured');
    
    if (format === 'flat') {
      // Return flat array for components that build their own tree
      res.status(200).json(
        new ApiResponse(200, categories, 'Categories retrieved successfully')
      );
    } else {
      // Return hierarchical tree structure (default behavior)
      const buildTree = (categories, parent = null) => {
        const tree = categories
          .filter(cat => {
            if (!parent) return !cat.parentId;
            return cat.parentId && cat.parentId.toString() === parent._id.toString();
          })
          .map(cat => {
            const node = cat.toObject();
            const children = buildTree(categories, cat);
            if (children.length > 0) {
              node.children = children;
            } else {
              node.children = [];
            }
            return node;
          });
          
        return tree;
      };
      
      const categoryTree = buildTree(categories);
      
      res.status(200).json(
        new ApiResponse(200, categoryTree, 'Categories retrieved successfully')
      );
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific category by ID (public/client version)
// @route   GET /api/categories/:id
// @access  Public
exports.getCategoryByIdPublic = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findOne({ 
      _id: id,
      status: 'active'
    })
    .select('name slug description image icon level order parent ancestors featured')
    .populate({
      path: 'children',
      select: 'name slug image icon level featured',
      match: { status: 'active' }
    });
    
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }
    
    res.status(200).json(
      new ApiResponse(200, category, 'Category retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific category by slug (public/client version)
// @route   GET /api/categories/slug/:slug
// @access  Public
exports.getCategoryBySlugPublic = async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    const category = await Category.findOne({
      slug,
      status: 'active'
    })
    .select('name slug description image icon level order parent ancestors featured')
    .populate({
      path: 'children',
      select: 'name slug image icon level featured',
      match: { status: 'active' }
    });
    
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }
    
    res.status(200).json(
      new ApiResponse(200, category, 'Category retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// ADMIN-SIDE API METHODS

// @desc    Get all categories (admin version)
// @route   GET /api/categories/admin/list
// @access  Private/Admin
exports.getCategoriesAdmin = async (req, res, next) => {
  try {
    const { status, format = 'tree' } = req.query;
    
    // Build query
    const query = {};
    
    // Filter by status if provided
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Get all categories first
    const categories = await Category.find(query)
      .sort({ 'name': 1 });
    
    if (format === 'flat') {
      // Return flat array for components that build their own tree
      res.status(200).json(
        new ApiResponse(200, categories, 'Categories retrieved successfully')
      );
    } else {
      // Return hierarchical tree structure (default behavior)
      const buildTree = (categories, parent = null) => {
        const tree = categories
          .filter(cat => {
            if (!parent) return !cat.parentId;
            return cat.parentId && cat.parentId.toString() === parent._id.toString();
          })
          .map(cat => {
            const node = cat.toObject();
            const children = buildTree(categories, cat);
            if (children.length > 0) {
              node.children = children;
            } else {
              node.children = [];
            }
            return node;
          });
          
        return tree;
      };
      
      const categoryTree = buildTree(categories);
      
      res.status(200).json(
        new ApiResponse(200, categoryTree, 'Categories retrieved successfully')
      );
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get a specific category by ID (admin version)
// @route   GET /api/categories/admin/:id
// @access  Private/Admin
exports.getCategoryByIdAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id)
      .populate('children');
    
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }
    
    res.status(200).json(
      new ApiResponse(200, category, 'Category retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};