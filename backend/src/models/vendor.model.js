const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vendor name is required'],
    trim: true,
    maxlength: [100, 'Vendor name cannot exceed 100 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please enter a valid email address'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false,
  },
  primaryPhone: {
    type: String,
    required: [true, 'Primary phone number is required'],
    validate: {
      validator: function(phone) {
        // Allow various phone formats (Nepal: +977-xxx-xxx-xxxx, 9xxx-xxx-xxx, etc.)
        return /^(\+977-?)?[0-9]{10}$/.test(phone.replace(/[\s-]/g, ''));
      },
      message: 'Please enter a valid phone number'
    }
  },
  secondaryPhone: {
    type: String,
    required: false,
    validate: {
      validator: function(phone) {
        if (!phone) return true; // Allow empty
        return /^(\+977-?)?[0-9]{10}$/.test(phone.replace(/[\s-]/g, ''));
      },
      message: 'Please enter a valid secondary phone number'
    }
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    maxlength: [50, 'City name cannot exceed 50 characters'],
  },
  address: {
    type: String,
    required: false,
    trim: true,
    maxlength: [200, 'Address cannot exceed 200 characters'],
  },
  companyRegistrationCertificate: {
    type: String,
    required: [true, 'Company registration certificate is required'],
  },
  vatNumber: {
    type: String,
    required: [true, 'VAT number is required'],
    unique: true,
    trim: true,
    validate: {
      validator: function(vat) {
        // Nepal VAT format validation (adjust as needed)
        return /^[0-9]{9}$/.test(vat);
      },
      message: 'Please enter a valid 9-digit VAT number'
    }
  },
  businessType: {
    type: String,
    enum: ['manufacturer', 'distributor', 'retailer', 'importer', 'other'],
    default: 'other',
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'rejected'],
    default: 'pending',
  },
  isLoginAllowed: {
    type: Boolean,
    default: false, // Default to false for new vendors
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  resetPasswordToken: {
    type: String,
    required: false,
  },
  resetPasswordExpire: {
    type: Date,
    required: false,
  },
  rejectionReason: {
    type: String,
    required: false,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  approvedAt: {
    type: Date,
    required: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true,
});

// Hash password before saving
vendorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
vendorSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Get signed JWT token
vendorSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, type: 'vendor' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

const Vendor = mongoose.model('Vendor', vendorSchema);
module.exports = Vendor;