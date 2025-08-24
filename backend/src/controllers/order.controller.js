const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const catchAsync = require('../utils/catchAsync');
const mongoose = require('mongoose');
const path = require('path');
const { sendOrderNotificationToAdmins, sendOrderConfirmationToCustomer, sendOrderNotificationToVendors } = require('../services/email.service');

// Helper function to calculate order totals
const calculateOrderTotals = (items) => {
  const subtotal = items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  // Fixed shipping for now - could be calculated based on location, weight, etc.
  const shipping = 100; // Rs. 100 for shipping
  
  return {
    subtotal,
    shipping,
    total: subtotal + shipping
  };
};

// Helper to derive parent order status from sub-orders
const deriveParentOrderStatus = (subOrders) => {
  if (!Array.isArray(subOrders) || subOrders.length === 0) return null;
  const statuses = subOrders.map(so => so.status);
  const all = (s) => statuses.every(st => st === s);
  const any = (s) => statuses.some(st => st === s);
  if (all('cancelled')) return 'cancelled';
  if (all('delivered')) return 'delivered';
  if (any('shipped') || any('delivered')) return 'shipped';
  if (any('processing')) return 'processing';
  return 'pending';
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = catchAsync(async (req, res) => {
  const userId = req.user._id;
  
  // Parse shippingDetails if it's a JSON string (from FormData)
  let shippingDetails;
  let paymentMethod;
  
  try {
    if (typeof req.body.shippingDetails === 'string') {
      shippingDetails = JSON.parse(req.body.shippingDetails);
    } else {
      shippingDetails = req.body.shippingDetails;
    }
    paymentMethod = req.body.paymentMethod;
  } catch (error) {
    throw new ApiError(400, 'Invalid shipping details format');
  }
  
  // Validate required shipping fields
  const requiredFields = ['fullName', 'email', 'phone', 'address', 'city', 'province'];
  const missingFields = requiredFields.filter(field => !shippingDetails[field]);
  
  if (missingFields.length > 0) {
    throw new ApiError(400, `Missing required shipping fields: ${missingFields.join(', ')}`);
  }
  
  // Get user's cart
  const cart = await Cart.findOne({ user: userId })
    .populate({
      path: 'items.product',
      select: 'name slug images regularPrice specialOfferPrice discountType discountValue stock vendor status'
    });
  
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Your cart is empty');
  }
  
  // Transform cart items to order items & collect vendor IDs
  const vendors = new Set();
  
  // Fetch the latest product data to ensure we have the most up-to-date information
  const productIds = cart.items.map(item => item.product._id);
  const latestProducts = await Product.find({ 
    _id: { $in: productIds } 
  }).select('_id name status stock');
  
  // Create a map for quick lookup
  const productStatusMap = {};
  latestProducts.forEach(product => {
    productStatusMap[product._id.toString()] = {
      status: product.status,
      name: product.name,
      stock: product.stock
    };
  });
  
  const orderItems = cart.items.map(item => {
    const product = item.product;
    const productId = product._id.toString();
    const latestProductInfo = productStatusMap[productId];
    
    // Add debugging to see the product status
    console.log(`Product ${product.name} (ID: ${product._id})`);
    console.log(`Cart product status: ${product.status}`);
    console.log(`Latest product status: ${latestProductInfo?.status}`);
    
    // Check if product is available (using the latest status from the database)
    if (latestProductInfo && latestProductInfo.status !== 'active') {
      console.log(`Product ${latestProductInfo.name} is not active. Status: ${latestProductInfo.status}`);
      throw new ApiError(400, `${product.name} is no longer available`);
    } else if (!latestProductInfo) {
      // If product doesn't exist anymore in the database
      throw new ApiError(400, `${product.name} is no longer available`);
    }
    
    // Check if enough stock is available (using the latest stock from the database)
    if (latestProductInfo && latestProductInfo.stock !== undefined && 
        latestProductInfo.stock !== null && latestProductInfo.stock < item.quantity) {
      throw new ApiError(400, `Only ${latestProductInfo.stock} units of ${product.name} are available`);
    }
    
    // Calculate the effective price of the product
    let price = product.regularPrice;
    if (product.specialOfferPrice && product.specialOfferPrice < product.regularPrice) {
      price = product.specialOfferPrice;
    } else if (product.discountValue > 0) {
      if (product.discountType === 'percentage') {
        price = product.regularPrice * (1 - product.discountValue / 100);
      } else {
        price = product.regularPrice - product.discountValue;
      }
    }
    
    // Add vendor to the set if it exists
    if (product.vendor) {
      vendors.add(product.vendor.toString());
    }
    
    return {
      product: product._id,
      quantity: item.quantity,
      price,
      attributes: item.attributes || {}
    };
  });
  
  // Calculate order totals
  const { subtotal, shipping, total } = calculateOrderTotals(orderItems);
  
  // Create paymentScreenshot field if we have req.file (for pay-now method)
  const paymentScreenshot = req.file ? `/uploads/payments/${path.basename(req.file.path)}` : undefined;
  
  // Set initial payment status based on payment method
  const paymentStatus = paymentMethod === 'pay-now' ? 'processing' : 'pending';
  
  // Generate a unique order number manually since the pre-save hook isn't working
  const randomId = Math.floor(100000 + Math.random() * 900000);
  const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const orderNumber = `MB${dateStr}${randomId}`;
  
  // Create the order
  const order = await Order.create({
    orderNumber,
    user: userId,
    items: orderItems,
    subtotal,
    shipping,
    total,
    shippingDetails,
    paymentMethod,
    paymentStatus,
    paymentScreenshot,
    vendors: Array.from(vendors) // Convert Set to Array for MongoDB
  });

  // Sub-order system removed: keep parent-level order fields only (backward compatible: subOrders remains empty)
  
  // Populate the order with product details for the response
  await order.populate({
    path: 'items.product',
    select: 'name slug images'
  });
  
  // Clear the user's cart
  await Cart.findOneAndUpdate(
    { user: userId },
    { $set: { items: [] } }
  );
  
  // Update product stock levels
  for (const item of cart.items) {
    if (item.product.stock !== undefined && item.product.stock !== null) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { stock: -item.quantity } }
      );
    }
  }

  // Send email notification to all admin users
  try {
    // Find all admin users
    const adminUsers = await User.find({ role: 'admin' }).select('email');
    
    if (adminUsers.length > 0) {
      const adminEmails = adminUsers.map(admin => admin.email);
      
      // Send email notification to all admins
      await sendOrderNotificationToAdmins(order, adminEmails);
      console.log(`Order notification sent to ${adminEmails.length} admin(s):`, adminEmails);
    } else {
      console.warn('No admin users found to send order notification');
    }
  } catch (emailError) {
    // Log error but don't fail the order creation
    console.error('Failed to send order notification email to admins:', emailError.message);
    // You might want to store this in a failed email queue for retry later
  }

  // Send order confirmation email to customer
  try {
    const customerEmail = order.shippingDetails.email;
    if (customerEmail) {
      // Populate the order with product details for email
      const populatedOrder = await Order.findById(order._id)
        .populate({
          path: 'items.product',
          select: 'name slug images regularPrice specialOfferPrice'
        });
      
      await sendOrderConfirmationToCustomer(populatedOrder, customerEmail);
      console.log(`Order confirmation email sent to customer: ${customerEmail}`);
    } else {
      console.warn('No customer email found to send order confirmation');
    }
  } catch (emailError) {
    // Log error but don't fail the order creation
    console.error('Failed to send order confirmation email to customer:', emailError.message);
    // You might want to store this in a failed email queue for retry later
  }

  // Send order notification email to vendors
  try {
    // Populate the order with product and vendor details for vendor emails
    const populatedOrderForVendors = await Order.findById(order._id)
      .populate({
        path: 'items.product',
        select: 'name slug images regularPrice specialOfferPrice vendor',
        populate: {
          path: 'vendor',
          select: 'name email'
        }
      });
    
    // Filter out items that don't have vendors (admin products)
    const vendorItems = populatedOrderForVendors.items.filter(item => item.product.vendor);
    
    if (vendorItems.length > 0) {
      await sendOrderNotificationToVendors(populatedOrderForVendors, vendorItems);
      console.log(`Order notification sent to vendors for ${vendorItems.length} vendor products`);
    } else {
      console.log('No vendor products in this order, skipping vendor notifications');
    }
  } catch (emailError) {
    // Log error but don't fail the order creation
    console.error('Failed to send order notification email to vendors:', emailError.message);
    // You might want to store this in a failed email queue for retry later
  }

  res.status(201).json(
    new ApiResponse(
      201,
      order,
      'Order placed successfully'
    )
  );
});

// @desc    Test vendor email notification
// @route   POST /api/orders/test-vendor-email
// @access  Private (Admin only)
exports.testVendorEmail = catchAsync(async (req, res) => {
  // This is a test function to verify vendor email functionality
  const { orderId } = req.body;
  
  if (!orderId) {
    throw new ApiError(400, 'Order ID is required');
  }
  
  const order = await Order.findById(orderId)
    .populate({
      path: 'items.product',
      select: 'name slug images regularPrice specialOfferPrice vendor',
      populate: {
        path: 'vendor',
        select: 'name email'
      }
    });
  
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }
  
  // Filter out items that don't have vendors (admin products)
  const vendorItems = order.items.filter(item => item.product.vendor);
  
  if (vendorItems.length === 0) {
    throw new ApiError(400, 'No vendor products found in this order');
  }
  
  try {
    await sendOrderNotificationToVendors(order, vendorItems);
    console.log(`Test vendor email sent successfully for order ${orderId}`);
    
    res.status(200).json(
      new ApiResponse(
        200,
        { message: 'Vendor email sent successfully', vendorCount: vendorItems.length },
        'Vendor email test completed'
      )
    );
  } catch (error) {
    console.error('Test vendor email failed:', error);
    throw new ApiError(500, 'Failed to send vendor email: ' + error.message);
  }
});

// @desc    Get user's orders
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = catchAsync(async (req, res) => {
  const userId = req.user._id;
  
  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .select('orderNumber total createdAt orderStatus paymentStatus items')
    .populate({
      path: 'items.product',
      select: 'name slug images'
    });
  
  res.status(200).json(
    new ApiResponse(
      200,
      { orders },
      'Orders retrieved successfully'
    )
  );
});

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = catchAsync(async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user._id;
  
  const order = await Order.findById(orderId)
    .populate({
      path: 'items.product',
      select: 'name slug images regularPrice specialOfferPrice'
    })
    .populate({ path: 'subOrders.items.product', select: 'name slug images' })
    .populate({ path: 'subOrders.vendor', select: 'name email' })
    .populate('user', 'name email');
  
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }
  
  // Check if the order belongs to the user or user is admin/vendor
  if (order.user._id.toString() !== userId.toString() &&
      req.user.role !== 'admin' &&
      !(req.user.role === 'vendor' && order.vendors.includes(userId))) {
    throw new ApiError(403, 'You do not have permission to view this order');
  }
  
  res.status(200).json(
    new ApiResponse(
      200,
      { order },
      'Order retrieved successfully'
    )
  );
});

// @desc    Get vendor-scoped order by ID
// @route   GET /api/orders/vendor/:id
// @access  Private/Vendor
exports.getVendorOrderById = catchAsync(async (req, res) => {
  if (req.user.role !== 'vendor') {
    throw new ApiError(403, 'Not authorized');
  }
  const vendorId = req.user._id.toString();
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email')
    .populate({ path: 'items.product', select: 'name slug images vendor' });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Ensure vendor is part of this order
  const isVendorInOrder = (order.vendors || []).some(v => (v?._id?.toString?.() || v.toString()) === vendorId)
    || (order.subOrders || []).some(so => (so.vendor?._id?.toString?.() || so.vendor?.toString?.() || so.vendor) === vendorId);
  if (!isVendorInOrder) {
    throw new ApiError(403, 'You do not have permission to view this order');
  }

  // Overlay vendor sub-order fields
  const obj = order.toObject();
  if (Array.isArray(obj.subOrders) && obj.subOrders.length > 0) {
    const so = obj.subOrders.find(s => (s.vendor?._id?.toString?.() || s.vendor?.toString?.() || s.vendor) === vendorId);
    if (so) {
      obj.orderStatus = so.status || obj.orderStatus;
      obj.trackingNumber = so.trackingNumber || obj.trackingNumber;
      obj.estimatedDeliveryDate = so.estimatedDeliveryDate || obj.estimatedDeliveryDate;
    }
  }

  res.status(200).json(new ApiResponse(200, obj, 'Order retrieved successfully'));
});

// @desc    Cancel an order
// @route   PATCH /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = catchAsync(async (req, res) => {
  const orderId = req.params.id;
  const userId = req.user._id;
  const { cancelReason } = req.body;
  
  const order = await Order.findById(orderId);
  
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }
  
  // Check if the order belongs to the user or user is admin
  const isCustomer = order.user.toString() === userId.toString();
  const isAdmin = req.user.role === 'admin';
  
  if (!isCustomer && !isAdmin) {
    throw new ApiError(403, 'You do not have permission to cancel this order');
  }
  
  // Check if order can be cancelled
  if (['delivered', 'cancelled'].includes(order.orderStatus)) {
    throw new ApiError(400, `Order cannot be cancelled because it is ${order.orderStatus}`);
  }
  
  // Determine who cancelled the order
  const cancelledBy = isAdmin ? 'admin' : 'customer';
  
  // Always cancel the whole order
  order.orderStatus = 'cancelled';
  order.cancelReason = cancelReason;
  order.cancelledAt = new Date();
  order.cancelledBy = cancelledBy;
  await order.save();
  
  // Restore product stock levels for all items
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product) {
      if (product.stock === null || product.stock === undefined) product.stock = 0;
      product.stock += item.quantity;
      await product.save();
    }
  }
  
  // Populate product details before sending response
  await order.populate({
    path: 'items.product',
    select: 'name slug images regularPrice specialOfferPrice'
  });
  await order.populate('user', 'name email');
  
  res.status(200).json(
    new ApiResponse(
      200,
      order,
      'Order cancelled successfully'
    )
  );
});

// @desc    Update order status (Admin only)
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = catchAsync(async (req, res) => {
  const orderId = req.params.id;
  const { orderStatus, trackingNumber, estimatedDeliveryDate } = req.body;
  
  const order = await Order.findById(orderId);
  
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }
  
  // Admin-only permission
  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Only admins can update order status');
  }
  
  // Check if order is already cancelled
  if (order.orderStatus === 'cancelled') {
    throw new ApiError(400, 'Cancelled orders cannot be updated');
  }
  
  // Update whole order fields
  order.orderStatus = orderStatus;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (estimatedDeliveryDate) order.estimatedDeliveryDate = estimatedDeliveryDate;
  
  // If marked as delivered, update payment status for pay-later orders
  if (orderStatus === 'delivered' && order.paymentMethod === 'pay-later') {
    order.paymentStatus = 'paid';
  }
  
  await order.save();
  
  // Populate product details before sending response
  await order.populate({
    path: 'items.product',
    select: 'name slug images regularPrice specialOfferPrice'
  });
  await order.populate('user', 'name email');
  
  res.status(200).json(
    new ApiResponse(
      200,
      order,
      'Order status updated successfully'
    )
  );
});

// @desc    Update payment status (Admin only)
// @route   PATCH /api/orders/:id/payment
// @access  Private/Admin
exports.updatePaymentStatus = catchAsync(async (req, res) => {
  // Only admin can update payment status
  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Only admins can update payment status');
  }
  
  const orderId = req.params.id;
  const { paymentStatus } = req.body;
  
  const order = await Order.findById(orderId);
  
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }
  
  order.paymentStatus = paymentStatus;
  await order.save();
  
  // Populate product details before sending response
  await order.populate({
    path: 'items.product',
    select: 'name slug images regularPrice specialOfferPrice'
  });
  await order.populate('user', 'name email');
  
  res.status(200).json(
    new ApiResponse(
      200,
      order,
      'Payment status updated successfully'
    )
  );
});

// @desc    Get all orders (Admin only)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
exports.getAllOrders = catchAsync(async (req, res) => {
  // Only admin can view all orders
  if (req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorized');
  }
  
  // Query parameters for filtering and pagination
  const { 
    status, 
    paymentStatus,
    startDate,
    endDate,
    search,
    page = 1,
    limit = 10
  } = req.query;
  
  // Build filter object
  const filter = {};
  
  if (status) filter.orderStatus = status;
  if (paymentStatus) filter.paymentStatus = paymentStatus;
  
  // Date range filter
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = endDateObj;
    }
  }
  
  // Search by order number
  if (search) {
    filter.orderNumber = { $regex: search, $options: 'i' };
  }
  
  // Pagination
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;
  
  // Get orders
  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .populate({ path: 'subOrders.vendor', select: 'name email' })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);
  
  // Get total count
  const totalOrders = await Order.countDocuments(filter);
  
  res.status(200).json(
    new ApiResponse(
      200,
      { 
        orders,
        pagination: {
          total: totalOrders,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalOrders / limitNum)
        }
      },
      'Orders retrieved successfully'
    )
  );
});

// @desc    Get vendor orders
// @route   GET /api/orders/vendor
// @access  Private/Vendor
exports.getVendorOrders = catchAsync(async (req, res) => {
  // Only vendors can access this endpoint
  if (req.user.role !== 'vendor') {
    throw new ApiError(403, 'Not authorized');
  }
  
  const vendorId = req.user._id;
  
  // Query parameters for filtering and pagination
  const { 
    status,
    page = 1,
    limit = 10
  } = req.query;
  
  // Build filter object
  let filter = { vendors: vendorId };
  
  if (status) {
    // Support both legacy (parent orderStatus) and new sub-order status filter for this vendor
    filter = {
      $and: [
        { vendors: vendorId },
        {
          $or: [
            { orderStatus: status },
            { subOrders: { $elemMatch: { vendor: vendorId, status } } }
          ]
        }
      ]
    };
  }
  
  // Pagination
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;
  
  // Get orders
  const orders = await Order.find(filter)
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);
  
  // For sub-order based orders, project vendor-specific status
  const vendorScopedOrders = orders.map(o => {
    const obj = o.toObject();
    if (Array.isArray(obj.subOrders) && obj.subOrders.length > 0) {
      const so = obj.subOrders.find(s => s.vendor?.toString?.() === vendorId.toString() || s.vendor === vendorId.toString());
      if (so) {
        obj.orderStatus = so.status; // override for vendor view
        obj.trackingNumber = so.trackingNumber || obj.trackingNumber;
        obj.estimatedDeliveryDate = so.estimatedDeliveryDate || obj.estimatedDeliveryDate;
      }
    }
    return obj;
  });

  // Get total count
  const totalOrders = await Order.countDocuments(filter);
  
  res.status(200).json(
    new ApiResponse(
      200,
      { 
        orders: vendorScopedOrders,
        pagination: {
          total: totalOrders,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalOrders / limitNum)
        }
      },
      'Vendor orders retrieved successfully'
    )
  );
});
