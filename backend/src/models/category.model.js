const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters'],
    trim: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  ancestors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  level: {
    type: Number,
    default: 0
  },
  image: {
    type: String
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  productsCount: {
    type: Number,
    default: 0
  },
  tags: {
    type: [String],
    default: []
  },
  keywords: {
    type: String,
    trim: true
  },
  metaTitle: {
    type: String,
    trim: true
  },
  metaDescription: {
    type: String,
    trim: true
  },
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
categorySchema.index({ parentId: 1 });
categorySchema.index({ ancestors: 1 });
// slug index already defined in the schema
categorySchema.index({ status: 1 });

// Virtual field for children categories
categorySchema.virtual('children', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentId',
  options: { sort: { name: 1 } }
});

// Generate slug before saving
categorySchema.pre('validate', function(next) {
  if (this.name) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true
    });
  }
  next();
});

// Update ancestors and level before saving
categorySchema.pre('save', async function(next) {
  if (this.isModified('parentId')) {
    this.ancestors = [];

    if (this.parentId) {
      const parent = await this.constructor.findById(this.parentId);

      if (parent) {
        this.ancestors = [...parent.ancestors, this.parentId];
        this.level = parent.level + 1;
      }
    } else {
      this.level = 0;
    }
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);