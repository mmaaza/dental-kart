const mongoose = require('mongoose');
const { Schema } = mongoose;

const CartItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  attributes: {
    type: Map,
    of: String,
    default: {}
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});

const CartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: [CartItemSchema],
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Virtual for total items count
CartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for total cart value
CartSchema.virtual('totalValue').get(function() {
  return this.items.reduce((total, item) => {
    const productPrice = item.product.specialOfferPrice || item.product.regularPrice;
    return total + (productPrice * item.quantity);
  }, 0);
});

// Pre-save hook to update the updatedAt timestamp
CartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Cart', CartSchema);
