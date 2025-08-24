const mongoose = require('mongoose');

// Sub-order schema to support per-vendor order processing
const SubOrderSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        price: {
          type: Number,
          required: true
        },
        attributes: {
          type: Object,
          default: {}
        }
      }
    ],
    subtotal: {
      type: Number,
      required: true
    },
    shipping: {
      type: Number,
      required: true,
      default: 0
    },
    total: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    cancelReason: {
      type: String
    },
    cancelledAt: {
      type: Date
    },
    cancelledBy: {
      type: String,
      enum: ['customer', 'vendor', 'admin']
    },
    trackingNumber: {
      type: String
    },
    estimatedDeliveryDate: {
      type: Date
    }
  },
  { _id: true, timestamps: true }
);

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        price: {
          type: Number,
          required: true
        },
        attributes: {
          type: Object,
          default: {}
        }
      }
    ],
    subtotal: {
      type: Number,
      required: true
    },
    shipping: {
      type: Number,
      required: true,
      default: 0
    },
    total: {
      type: Number,
      required: true
    },
    shippingDetails: {
      fullName: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      },
      phone: {
        type: String,
        required: true
      },
      address: {
        type: String,
        required: true
      },
      city: {
        type: String,
        required: true
      },
      province: {
        type: String,
        required: true
      },
      clinicName: String,
      panNumber: String,
      orderNote: String
    },
    paymentMethod: {
      type: String,
      enum: ['pay-later', 'pay-now'],
      required: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'processing', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentScreenshot: {
      type: String
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    cancelReason: {
      type: String
    },
    cancelledAt: {
      type: Date
    },
    cancelledBy: {
      type: String,
      enum: ['customer', 'vendor', 'admin']
    },
    trackingNumber: {
      type: String
    },
    estimatedDeliveryDate: {
      type: Date
    },
    vendors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    // New: Per-vendor sub-orders (backward compatible). If empty, system uses legacy whole-order fields
    subOrders: {
      type: [SubOrderSchema],
      default: []
    }
  },
  { 
    timestamps: true 
  }
);

// Generate a unique order number before saving
OrderSchema.pre('save', async function(next) {
  if (!this.isNew) {
    return next();
  }

  try {
    // Generate a random identifier 
    const randomId = Math.floor(100000 + Math.random() * 900000);
    
    // Create the order number with prefix and date
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    this.orderNumber = `MB${dateStr}${randomId}`;
    
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Order', OrderSchema);
