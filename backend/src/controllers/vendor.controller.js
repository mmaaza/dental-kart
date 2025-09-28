const Vendor = require('../models/vendor.model');
const Order = require('../models/order.model');
const Product = require('../models/product.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const AuditLog = require('../models/auditLog.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendEmail, sendPasswordResetEmail, sendVendorPasswordResetEmail } = require('../services/email.service');



// Validation helper
const validateVendorData = (data) => {
  const errors = [];

  // Required fields validation
  const requiredFields = ['name', 'email', 'password', 'primaryPhone', 'city', 'companyRegistrationCertificate', 'vatNumber'];
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push(`${field} is required`);
    }
  }

  // Email validation
  if (data.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      errors.push('Please enter a valid email address');
    }
  }

  // Phone validation
  if (data.primaryPhone) {
    const phoneRegex = /^(\+977-?)?[0-9]{10}$/;
    if (!phoneRegex.test(data.primaryPhone.replace(/[\s-]/g, ''))) {
      errors.push('Please enter a valid primary phone number');
    }
  }

  // Secondary phone validation (if provided)
  if (data.secondaryPhone && data.secondaryPhone.trim() !== '') {
    const phoneRegex = /^(\+977-?)?[0-9]{10}$/;
    if (!phoneRegex.test(data.secondaryPhone.replace(/[\s-]/g, ''))) {
      errors.push('Please enter a valid secondary phone number');
    }
  }

  // VAT number validation
  if (data.vatNumber) {
    const vatRegex = /^[0-9]{9}$/;
    if (!vatRegex.test(data.vatNumber)) {
      errors.push('VAT number must be exactly 9 digits');
    }
  }

  // Password validation
  if (data.password) {
    if (data.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }
  }

  return errors;
};

// Create new vendor (admin only)
exports.createVendor = async (req, res) => {
  try {
    console.log('Creating vendor with data:', req.body);

    // Validate input data
    const validationErrors = validateVendorData(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Validation failed: ${validationErrors.join(', ')}`
      });
    }

    // Check if vendor with email already exists
    const existingVendorByEmail = await Vendor.findOne({ email: req.body.email.toLowerCase() });
    if (existingVendorByEmail) {
      return res.status(400).json({
        success: false,
        error: 'A vendor with this email already exists'
      });
    }

    // Check if vendor with VAT number already exists
    const existingVendorByVat = await Vendor.findOne({ vatNumber: req.body.vatNumber });
    if (existingVendorByVat) {
      return res.status(400).json({
        success: false,
        error: 'A vendor with this VAT number already exists'
      });
    }

    // Prepare vendor data
    const vendorData = {
      name: req.body.name.trim(),
      email: req.body.email.toLowerCase().trim(),
      password: req.body.password,
      primaryPhone: req.body.primaryPhone.trim(),
      secondaryPhone: req.body.secondaryPhone ? req.body.secondaryPhone.trim() : '',
      city: req.body.city.trim(),
      address: req.body.address ? req.body.address.trim() : '',
      companyRegistrationCertificate: req.body.companyRegistrationCertificate,
      vatNumber: req.body.vatNumber.trim(),
      businessType: req.body.businessType || 'other',
      status: 'pending',
      isLoginAllowed: false,
      verificationStatus: 'pending',
      createdBy: req.user.id
    };

    // Create vendor
    const vendor = await Vendor.create(vendorData);

    // Send credentials email
    try {
      await sendEmail({
        to: vendor.email,
        subject: 'Welcome to Dental Cart Nepal - Vendor Account Created',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f9fafb;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #f97316; font-size: 28px; margin: 0;">Dental Cart Nepal</h1>
              <p style="color: #6b7280; margin: 5px 0 0 0;">Your Trusted Medical Equipment Partner</p>
            </div>
            
            <div style="background: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <h2 style="color: #111827; margin-bottom: 20px; font-size: 24px;">Welcome to Our Vendor Network!</h2>
              
              <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                Congratulations! Your vendor account has been successfully created. You are now part of the Dental Cart Nepal vendor network.
              </p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px;">Your Login Credentials</h3>
                <p style="margin: 8px 0; color: #374151;"><strong>Email:</strong> ${vendor.email}</p>
                <p style="margin: 8px 0; color: #374151;"><strong>Password:</strong> <em>Set by administrator</em></p>
              </div>
              
              <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e; font-weight: bold;">Important Security Notice:</p>
                <p style="margin: 5px 0 0 0; color: #92400e;">Your password has been set by the administrator. Please contact the administrator if you need to reset your password.</p>
              </div>
              
              <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #1e40af; font-weight: bold;">Account Status:</p>
                <p style="margin: 5px 0 0 0; color: #1e40af;">Your account is currently under review. You will be notified once it's approved and activated.</p>
              </div>
              
              <div style="margin-top: 30px; text-align: center;">
                <p style="color: #6b7280; font-size: 14px; margin: 0;">
                  If you have any questions, please contact our support team.
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
              <p>&copy; ${new Date().getFullYear()} Dental Cart Nepal. All rights reserved.</p>
            </div>
          </div>
        `
      });
      console.log('Welcome email sent successfully to:', vendor.email);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't fail the entire operation if email fails
    }

    // Create audit log
    try {
      await AuditLog.create({
        action: 'CREATE_VENDOR',
        performedBy: req.user._id,
        targetUser: vendor._id,
        targetModel: 'Vendor',
        details: `New vendor created: ${vendor.name} (${vendor.email})`,
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
      });
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
    }

    // Return response without password
    const vendorResponse = vendor.toObject();
    delete vendorResponse.password;

    res.status(201).json({
      success: true,
      message: 'Vendor created successfully',
      data: vendorResponse
    });

  } catch (error) {
    console.error('Error creating vendor:', error);

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      let errorMessage = `This ${duplicateField} is already registered`;
      
      if (duplicateField === 'email') {
        errorMessage = 'A vendor with this email address already exists';
      } else if (duplicateField === 'vatNumber') {
        errorMessage = 'A vendor with this VAT number already exists';
      }
      
      return res.status(400).json({
        success: false,
        error: errorMessage
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: `Validation failed: ${validationErrors.join(', ')}`
      });
    }

    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Failed to create vendor. Please try again.'
    });
  }
};

// Vendor login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Check if vendor exists
    const vendor = await Vendor.findOne({ email }).select('+password');
    if (!vendor) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await vendor.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if vendor login is allowed (only for regular vendor login, not admin login)
    if (!req.user?.role === 'admin' && !vendor.isLoginAllowed) {
      return res.status(401).json({
        success: false,
        error: 'Your login access has been disabled. Please contact support.'
      });
    }

    // Create token
    const token = vendor.getSignedJwtToken();

    // Return response with isLoginAllowed status
    res.status(200).json({
      success: true,
      token,
      data: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        primaryPhone: vendor.primaryPhone,
        status: vendor.status,
        isLoginAllowed: vendor.isLoginAllowed
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get vendor profile
exports.getProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Update vendor profile
exports.updateProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.user.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const vendor = await Vendor.findById(req.user.id).select('+password');
    
    // Check current password
    const isMatch = await vendor.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    vendor.password = newPassword;
    await vendor.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Vendor forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }
    const vendor = await Vendor.findOne({ email: email.toLowerCase().trim() });
    if (!vendor) {
      return res.status(200).json({ success: true, message: 'If that email exists, a reset link has been sent' });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(resetToken).digest('hex');
    vendor.resetPasswordToken = hashed;
    vendor.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await vendor.save({ validateBeforeSave: false });
    await sendVendorPasswordResetEmail(vendor.email, resetToken);
    res.status(200).json({ success: true, message: 'Password reset email sent' });
  } catch (error) {
    console.error('Vendor forgot password error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Vendor reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    if (!newPassword) {
      return res.status(400).json({ success: false, error: 'New password is required' });
    }
    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const vendor = await Vendor.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: Date.now() }
    }).select('+password');
    if (!vendor) {
      return res.status(400).json({ success: false, error: 'Invalid or expired token' });
    }
    vendor.password = newPassword;
    vendor.resetPasswordToken = undefined;
    vendor.resetPasswordExpire = undefined;
    await vendor.save();
    res.status(200).json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Vendor reset password error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// @desc    Vendor dashboard stats and recent orders
// @route   GET /api/vendors/dashboard
// @access  Private/Vendor
exports.getDashboard = catchAsync(async (req, res) => {
  const vendorId = req.user._id || req.user.id;

  // Total products owned by vendor
  const totalProducts = await Product.countDocuments({ vendor: vendorId });

  // Pending orders count (sub-order aware)
  const pendingOrders = await Order.countDocuments({
    vendors: vendorId,
    $or: [
      { orderStatus: 'pending' },
      { subOrders: { $elemMatch: { vendor: vendorId, status: 'pending' } } }
    ]
  });

  // Low stock items (<= 5) count
  const inventory = await Product.countDocuments({ vendor: vendorId, stock: { $lte: 5 } });

  // Monthly revenue placeholder (requires payouts model). Derive from delivered vendor sub-orders total.
  const deliveredOrders = await Order.aggregate([
    { $match: { vendors: vendorId } },
    { $unwind: { path: '$subOrders', preserveNullAndEmptyArrays: true } },
    { $match: { 'subOrders.vendor': vendorId, 'subOrders.status': 'delivered', createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } },
    { $group: { _id: null, total: { $sum: '$subOrders.total' } } }
  ]);
  const monthlyRevenue = deliveredOrders[0]?.total || 0;

  // Recent orders for this vendor (latest 5), with vendor-scoped status
  const recent = await Order.find({ vendors: vendorId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'name')
    .lean();

  const recentOrders = recent.map((o) => {
    const so = (o.subOrders || []).find((s) => String(s.vendor) === String(vendorId));
    return {
      id: o._id,
      orderNumber: o.orderNumber,
      customerName: o.user?.name || 'Customer',
      status: so?.status || o.orderStatus,
      total: so?.total || o.total,
    };
  });

  return res.status(200).json(
    new ApiResponse(200, { stats: { totalProducts, pendingOrders, monthlyRevenue, inventory }, recentOrders }, 'Vendor dashboard loaded')
  );
});

// @desc    Vendor reports (counts and trends, no prices)
// @route   GET /api/vendors/reports
// @access  Private/Vendor
exports.getReports = catchAsync(async (req, res) => {
  const vendorId = req.user._id || req.user.id;

  const { startDate, endDate } = req.query;
  const match = { vendors: vendorId };
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const e = new Date(endDate);
      e.setHours(23, 59, 59, 999);
      match.createdAt.$lte = e;
    }
  }

  const orders = await Order.find(match)
    .select('createdAt orderStatus subOrders items')
    .populate({ path: 'items.product', select: 'name slug vendor' })
    .lean();

  const summary = { totalOrders: 0, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
  const ordersByDayMap = new Map();
  const productIdToInfo = new Map();

  for (const o of orders) {
    summary.totalOrders += 1;
    const createdAt = new Date(o.createdAt);
    const dateKey = createdAt.toISOString().split('T')[0];
    ordersByDayMap.set(dateKey, (ordersByDayMap.get(dateKey) || 0) + 1);

    // Determine vendor-scoped status
    let vendorStatus = o.orderStatus;
    if (Array.isArray(o.subOrders) && o.subOrders.length > 0) {
      const so = o.subOrders.find((s) => String(s.vendor) === String(vendorId));
      if (so) vendorStatus = so.status || vendorStatus;
      // Collect product quantities from sub-order for this vendor
      if (so && Array.isArray(so.items)) {
        for (const it of so.items) {
          const key = String(it.product);
          const existing = productIdToInfo.get(key) || { quantity: 0, name: '', slug: '' };
          existing.quantity += it.quantity || 0;
          productIdToInfo.set(key, existing);
        }
      }
    } else {
      // Fallback: no sub-orders, use parent items filtered by product.vendor
      for (const it of o.items || []) {
        const p = it.product;
        if (!p) continue;
        if (String(p.vendor) !== String(vendorId)) continue;
        const key = String(p._id);
        const existing = productIdToInfo.get(key) || { quantity: 0, name: p.name || '', slug: p.slug || '' };
        existing.quantity += it.quantity || 0;
        existing.name = p.name || existing.name;
        existing.slug = p.slug || existing.slug;
        productIdToInfo.set(key, existing);
      }
    }

    if (summary[vendorStatus] !== undefined) summary[vendorStatus] += 1;
  }

  const ordersByDay = Array.from(ordersByDayMap.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Enrich product names/slugs for sub-order path if missing
  const productIdsNeedingLookup = Array.from(productIdToInfo.entries())
    .filter(([, info]) => !info.name || !info.slug)
    .map(([productId]) => productId);

  if (productIdsNeedingLookup.length > 0) {
    const products = await Product.find({ _id: { $in: productIdsNeedingLookup } })
      .select('name slug')
      .lean();
    const lookup = new Map(products.map((p) => [String(p._id), { name: p.name, slug: p.slug }]));
    for (const pid of productIdsNeedingLookup) {
      const info = productIdToInfo.get(pid) || {};
      const enr = lookup.get(pid) || {};
      productIdToInfo.set(pid, { ...info, name: info.name || enr.name || 'Product', slug: info.slug || enr.slug || '' });
    }
  }

  const topProducts = Array.from(productIdToInfo.entries())
    .map(([productId, info]) => ({ productId, name: info.name, slug: info.slug, quantity: info.quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  return res.status(200).json(new ApiResponse(200, { summary, ordersByDay, topProducts }, 'Vendor reports loaded'));
});

// Get all vendors (admin only)
exports.getAllVendors = async (req, res) => {
  try {
    const vendors = await Vendor.find();
    res.status(200).json({
      success: true,
      data: vendors
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Get vendor by ID (admin only)
exports.getVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// Update vendor by ID (admin only)
exports.updateVendorById = async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    // Create audit log for this admin action
    await AuditLog.create({
      action: 'UPDATE_VENDOR',
      performedBy: req.user._id,
      targetUser: vendor._id,
      targetModel: 'Vendor',
      details: `Admin updated vendor: ${vendor.name}`,
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    });

    res.status(200).json({
      success: true,
      data: vendor
    });
  } catch (error) {
    // Check for duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        error: `This ${field} is already registered`
      });
    }

    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Admin login as vendor
exports.adminLoginAsVendor = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Validate request
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide vendor email'
      });
    }
    
    // Find the vendor with provided email
    const vendor = await Vendor.findOne({ email }).select('+password');
    
    if (!vendor) {
      return res.status(404).json({
        success: false,
        error: 'Vendor not found'
      });
    }
    
    // Generate token for vendor
    const token = vendor.getSignedJwtToken();
    
    // Log this action for audit purposes
    await AuditLog.create({
      action: 'ADMIN_LOGIN_AS_VENDOR',
      performedBy: req.user._id,
      targetUser: vendor._id,
      targetModel: 'Vendor',
      details: `Admin accessed vendor account: ${vendor.name}`,
      ip: req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    });
    
    // Return token with vendor data (exclude password)
    const vendorData = {
      id: vendor._id,
      name: vendor.name,
      email: vendor.email,
      primaryPhone: vendor.primaryPhone,
      status: vendor.status,
      isLoginAllowed: vendor.isLoginAllowed,
      adminAccess: true // Flag to indicate this is admin login
    };
    
    res.status(200).json({
      success: true,
      token,
      data: vendorData
    });
  } catch (error) {
    console.error('Admin login as vendor error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};