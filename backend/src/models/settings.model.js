const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema({
  image: {
    type: String,
    required: [true, 'Hero slide image is required']
  },
  link: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    default: 0
  }
});

const selectedProductsSchema = new mongoose.Schema({
  featured: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  newArrivals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, { _id: false });

// New schema for category sections
const categorySectionSchema = new mongoose.Schema({
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  categoryName: {
    type: String,
    required: true
  },
  productIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, { _id: false });

// New schema for brand sections
const brandSectionSchema = new mongoose.Schema({
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: true
  },
  brandName: {
    type: String,
    required: true
  },
  productIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, { _id: false });

const settingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    enum: ['homepage', 'navigation', 'seo', 'social', 'contact', 'email']
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  heroSlides: {
    type: [heroSlideSchema],
    default: []
  },
  selectedProducts: {
    type: selectedProductsSchema,
    default: { featured: [], newArrivals: [] }
  },
  featuredCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  // New fields for categories and brands sections
  categorySections: {
    type: [categorySectionSchema],
    default: []
  },
  brandSections: {
    type: [brandSectionSchema],
    default: []
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);