// filepath: /home/maaz/Web Work/mbnepal/backend/src/models/product.model.js
const mongoose = require('mongoose');
const slugify = require('slugify');

// Schema for child attributes in hierarchical attribute structure
const childAttributeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  values: {
    type: [String],
    default: []
  },
  parentValueIndex: {
    type: Number,
    required: true
  }
}, { _id: false });

// Schema for parent attributes in hierarchical attribute structure
const attributeGroupSchema = new mongoose.Schema({
  parentAttribute: {
    name: { 
      type: String, 
      trim: true 
    },
    values: {
      type: [String],
      default: ['']
    }
  },
  childAttributes: [childAttributeSchema]
}, { _id: false });

// Schema for simple legacy attributes (name-value pairs)
const attributeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  value: {
    type: String,
    trim: true
  }
}, { _id: false });

// Schema for product variants with attribute-specific images
const variantSchema = new mongoose.Schema({
  attributes: {
    type: mongoose.Schema.Types.Mixed,  // Can be array (hierarchical) or object (legacy)
    required: true
  },
  images: {
    type: [String],
    default: []
  },
  stock: {
    type: Number,
    default: 0
  },
  sku: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    default: 0
  }
}, { _id: false });

// Dimension schema for product dimensions
const dimensionSchema = new mongoose.Schema({
  length: { 
    type: String, 
    trim: true 
  },
  width: { 
    type: String, 
    trim: true 
  },
  height: { 
    type: String, 
    trim: true 
  }
}, { _id: false });

// Main product schema
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [500, 'Name cannot be more than 500 characters']
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  description: {
    type: String,
    trim: true,
    required: [true, 'Description is required']
  },
  packagingDescription: {
    type: String,
    trim: true
  },
  packageDocument: {
    type: String,
    trim: true
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Brand',
    required: [true, 'Brand is required']
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'At least one category is required']
  }],

  // Pricing and Inventory
  regularPrice: {
    type: Number,
    required: [true, 'Regular price is required']
  },
  specialOfferPrice: {
    type: Number
  },
  // Prices submitted by vendor; admin sets regularPrice used on storefront
  vendorRegularPrice: {
    type: Number
  },
  vendorSpecialOfferPrice: {
    type: Number
  },
  discountType: {
    type: String,
    enum: ['percentage', 'amount'],
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    default: 0
  },
  minPurchaseQuantity: {
    type: Number,
    default: 1
  },
  stock: {
    type: Number,
    default: 0
  },
  sku: {
    type: String,
    trim: true
  },

  // Attributes
  attributeGroups: {
    type: [attributeGroupSchema], 
    default: []
  },
  attributes: {
    type: [attributeSchema],
    default: []
  },
  
  // Images
  images: {
    type: [String],
    default: []
  },
  hasVariantImages: {
    type: Boolean,
    default: false
  },
  variants: {
    type: [variantSchema],
    default: []
  },

  // Product Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft', 'out-of-stock'],
    default: 'active'
  },
  isDraft: {
    type: Boolean,
    default: false
  },

  // Approval workflow
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  approvalNotes: {
    type: String,
    trim: true
  },
  
  // Vendor info
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },

  // Related products
  crossSellProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  upSellProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],

  // Shipping information
  weight: {
    type: Number
  },
  dimensions: {
    type: dimensionSchema,
    default: {}
  },
  estimatedDeliveryTime: {
    type: String,
    trim: true
  },

  // Additional information
  expiryDate: {
    type: Date
  },
  videoLink: {
    type: String,
    trim: true
  },
  additionalNotes: {
    type: String,
    trim: true
  },

  // Reviews & Ratings
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  ratingDistribution: {
    type: Map,
    of: Number,
    default: () => new Map([
      ["1", 0], 
      ["2", 0], 
      ["3", 0], 
      ["4", 0], 
      ["5", 0]
    ])
  },

  // SEO fields
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },
  metaTags: {
    type: String,
    trim: true
  },
  searchTags: {
    type: String,
    trim: true
  },
  
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes for better query performance
// slug index already defined in the schema
productSchema.index({ status: 1 });
productSchema.index({ categories: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ vendor: 1 });
productSchema.index({ 'regularPrice': 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ rating: -1 }); // Index for rating-based sorting

// Generate slug before saving
productSchema.pre('validate', function(next) {
  if (this.name) {
    // Create a base slug
    let baseSlug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true
    });
    
    // Add a timestamp to ensure uniqueness
    const timestamp = new Date().getTime().toString().slice(-6);
    this.slug = `${baseSlug}-${timestamp}`;
  }
  
  // Set isDraft based on status
  this.isDraft = this.status === 'draft';
  
  // If this is a draft, bypass required field validations
  if (this.isDraft) {
    // Temporarily make required fields optional for drafts
    this.schema.path('description').validators = this.schema.path('description').validators.filter(
      v => v.type !== 'required'
    );
    this.schema.path('regularPrice').validators = this.schema.path('regularPrice').validators.filter(
      v => v.type !== 'required'
    );
  }

  next();
});

// Virtual field for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (this.specialOfferPrice && this.regularPrice > this.specialOfferPrice) {
    return Math.round(((this.regularPrice - this.specialOfferPrice) / this.regularPrice) * 100);
  }
  return 0;
});

// Virtual field for effective price (after discount)
productSchema.virtual('effectivePrice').get(function() {
  if (this.specialOfferPrice && this.regularPrice > this.specialOfferPrice) {
    return this.specialOfferPrice;
  }
  
  if (this.discountValue > 0) {
    if (this.discountType === 'percentage') {
      const discountAmount = (this.regularPrice * this.discountValue) / 100;
      return this.regularPrice - discountAmount;
    } else {
      return this.regularPrice - this.discountValue;
    }
  }
  
  return this.regularPrice;
});

// Virtual relationship with reviews
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
  options: { sort: { createdAt: -1 } }
});

module.exports = mongoose.model('Product', productSchema);