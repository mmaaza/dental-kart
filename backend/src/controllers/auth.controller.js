const User = require('../models/user.model');
const { sendVerificationEmail, sendPasswordResetEmail, sendVerificationOTP } = require('../services/email.service');
const crypto = require('crypto');

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Create user
    user = await User.create({
      name,
      email,
      password,
      phone
    });

    // Generate OTP
    const verificationOTP = user.generateEmailVerificationOTP();
    await user.save();

    // Send OTP email
    await sendVerificationOTP(user.email, verificationOTP);

    res.status(201).json({
      success: true,
      message: 'OTP sent to your email'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Send token to client
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-email
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    console.log(`Verifying email for ${email} with OTP ${otp}`);

    // Check if user is already verified
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    if (existingUser.isEmailVerified) {
      console.log(`User ${email} is already verified, returning error`);
      return res.status(400).json({
        success: false,
        error: 'Email already verified'
      });
    }

    // Hash OTP
    const hashedOTP = crypto
      .createHash('sha256')
      .update(otp)
      .digest('hex');
      
    console.log(`Looking for user with email ${email} and matching OTP hash`);

    // Find user with matching OTP
    const user = await User.findOne({
      email,
      emailVerificationOTP: hashedOTP,
      emailVerificationOTPExpire: { $gt: Date.now() }
    });

    if (!user) {
      // Find user by email to handle invalid OTP case
      const existingUser = await User.findOne({ email });
      if (existingUser && !existingUser.isEmailVerified) {
        console.log('User found but OTP invalid or expired');
        
        // Only clear OTP if it has expired
        if (existingUser.emailVerificationOTPExpire < Date.now()) {
          console.log('OTP has expired');
          existingUser.emailVerificationOTP = undefined;
          existingUser.emailVerificationOTPExpire = undefined;
          await existingUser.save();
          
          return res.status(400).json({
            success: false,
            error: 'The verification code has expired. Please request a new one.'
          });
        }
        
        // If OTP hasn't expired but is incorrect
        console.log('OTP is incorrect');
        return res.status(400).json({
          success: false,
          error: 'Incorrect verification code. Please try again.'
        });
      }
      
      return res.status(400).json({
        success: false,
        error: 'Invalid verification attempt. Please try again.'
      });
    }

    console.log(`OTP valid for ${email}, marking as verified`);
    
    // Set email as verified and update status to active
    user.isEmailVerified = true;
    user.status = 'active';
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpire = undefined;
    await user.save();

    console.log(`User ${email} verified successfully, sending token response`);

    // Send token response for automatic login
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Verification failed'
    });
  }
};

// @desc    Resend verification OTP
// @route   POST /api/auth/resend-verification
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email already verified'
      });
    }

    // Clear any existing OTP before generating new one
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpire = undefined;

    // Generate new OTP
    const verificationOTP = user.generateEmailVerificationOTP();
    await user.save();

    // Send verification email
    await sendVerificationOTP(user.email, verificationOTP);

    res.status(200).json({
      success: true,
      message: 'New OTP sent to your email'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Generate reset token
    const resetToken = user.generateResetPasswordToken();
    await user.save();

    // Send reset email
    await sendPasswordResetEmail(user.email, resetToken);

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Hash token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token'
      });
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, city, state, zipCode } = req.body;
    
    // Find user and update allowed fields only
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(city && { city }),
        ...(state && { state }),
        ...(zipCode && { zipCode })
      },
      { 
        new: true, 
        runValidators: true 
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword
};