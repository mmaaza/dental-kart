const Attribute = require('../models/attribute.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');

// @desc    Create a new attribute
// @route   POST /api/admin/settings/attributes
// @access  Private/Admin
exports.createAttribute = catchAsync(async (req, res) => {
  const { name, values, description } = req.body;
  
  // Check if attribute with same name already exists
  const existingAttribute = await Attribute.findOne({ name });
  if (existingAttribute) {
    throw new ApiError(400, 'An attribute with this name already exists');
  }

  // Create new attribute
  const attribute = await Attribute.create({
    name,
    values,
    description,
    createdBy: req.user._id
  });

  res.status(201).json(
    new ApiResponse(
      201,
      attribute,
      'Attribute created successfully'
    )
  );
});

// @desc    Get all attributes
// @route   GET /api/admin/settings/attributes
// @access  Private/Admin
exports.getAttributes = catchAsync(async (req, res) => {
  const { search } = req.query;
  
  let query = {};
  
  // Apply search filter if provided
  if (search) {
    query = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    };
  }
  
  const attributes = await Attribute.find(query)
    .sort({ name: 1 });

  res.status(200).json(
    new ApiResponse(
      200,
      attributes,
      'Attributes retrieved successfully'
    )
  );
});

// @desc    Get a specific attribute
// @route   GET /api/admin/settings/attributes/:id
// @access  Private/Admin
exports.getAttribute = catchAsync(async (req, res) => {
  const attribute = await Attribute.findById(req.params.id);
  
  if (!attribute) {
    throw new ApiError(404, 'Attribute not found');
  }
  
  res.status(200).json(
    new ApiResponse(
      200,
      attribute,
      'Attribute retrieved successfully'
    )
  );
});

// @desc    Update an attribute
// @route   PUT /api/admin/settings/attributes/:id
// @access  Private/Admin
exports.updateAttribute = catchAsync(async (req, res) => {
  const { name, values, description } = req.body;
  
  // Find attribute
  const attribute = await Attribute.findById(req.params.id);
  
  if (!attribute) {
    throw new ApiError(404, 'Attribute not found');
  }
  
  // Check if another attribute with the same name exists (if name is being changed)
  if (name && name !== attribute.name) {
    const existingAttribute = await Attribute.findOne({ name });
    if (existingAttribute) {
      throw new ApiError(400, 'An attribute with this name already exists');
    }
  }
  
  // Update attribute
  attribute.name = name || attribute.name;
  attribute.values = values || attribute.values;
  attribute.description = description || attribute.description;
  attribute.updatedBy = req.user._id;
  
  await attribute.save();
  
  res.status(200).json(
    new ApiResponse(
      200,
      attribute,
      'Attribute updated successfully'
    )
  );
});

// @desc    Delete an attribute
// @route   DELETE /api/admin/settings/attributes/:id
// @access  Private/Admin
exports.deleteAttribute = catchAsync(async (req, res) => {
  const attribute = await Attribute.findById(req.params.id);
  
  if (!attribute) {
    throw new ApiError(404, 'Attribute not found');
  }
  
  await attribute.deleteOne();
  
  res.status(200).json(
    new ApiResponse(
      200,
      null,
      'Attribute deleted successfully'
    )
  );
});