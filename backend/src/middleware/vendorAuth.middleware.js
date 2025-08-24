const jwt = require('jsonwebtoken');
const Vendor = require('../models/vendor.model');

const protectVendor = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Vendor.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Vendor not found'
      });
    }

    // Add role for consistency with other middleware
    req.user.role = 'vendor';
    
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
};

const authorizeVendor = (...roles) => {
  return (req, res, next) => {
    // For vendor routes, we can allow both 'vendor' and 'admin' roles
    // since admin can login as vendor
    const allowedRoles = [...roles, 'vendor', 'admin'];
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = {
  protectVendor,
  authorizeVendor
};
