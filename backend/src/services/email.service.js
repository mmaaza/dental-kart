const axios = require('axios');

// Helper function to get the correct client URL
const getClientUrl = () => {
  // Priority order: Environment variable, dynamic detection based on NODE_ENV
  if (process.env.CLIENT_URL && process.env.CLIENT_URL !== '') {
    // If CLIENT_URL is explicitly set and not empty, use it
    return process.env.CLIENT_URL.replace(/\/+$/, ''); // Remove trailing slashes
  }
  
  // Fallback based on environment
  if (process.env.NODE_ENV === 'production') {
    // In production, try to detect from common production URLs
    // Check for common production environment variables
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`;
    }
    if (process.env.NETLIFY_URL) {
      return process.env.NETLIFY_URL;
    }
    if (process.env.PRODUCTION_URL) {
      return process.env.PRODUCTION_URL;
    }
    // Default production URL
    return 'https://medicalbazarnepal.com';
  } else {
    // In development, default to localhost with port 3000 (React/Vite default)
    return 'http://localhost:3000';
  }
};

// Brevo API configuration
const brevoApi = axios.create({
  baseURL: 'https://api.brevo.com/v3',
  headers: {
    'api-key': process.env.BREVO_API_KEY,
    'Content-Type': 'application/json'
  }
});

// General email sending function
const sendEmail = async ({ to, subject, html }) => {
  const emailData = {
    sender: {
      name: process.env.EMAIL_FROM_NAME || 'Dental Kart Nepal',
      email: process.env.EMAIL_FROM
    },
    to: [{ email: to }],
    subject: subject,
    htmlContent: html
  };

  try {
    const response = await brevoApi.post('/smtp/email', emailData);
    console.log('Email sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending email:', error.response?.data || error.message);
    throw error;
  }
};

const sendVerificationOTP = async (email, otp) => {
  const emailData = {
    sender: {
      name: process.env.EMAIL_FROM_NAME || 'Dental Kart Nepal',
      email: process.env.EMAIL_FROM
    },
    to: [{ email: email }],
    subject: 'Email Verification OTP - Dental Kart Nepal',
    htmlContent: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #f97316;">Welcome to Dental Kart Nepal!</h1>
        </div>
        <div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Verify Your Email Address</h2>
          <p style="color: #666; line-height: 1.6;">
            Thank you for registering with Dental Kart Nepal. To complete your registration and access our medical supplies platform, please use the following OTP code:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background: #f8f8f8; padding: 20px; border-radius: 8px; display: inline-block;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #f97316;">${otp}</span>
            </div>
          </div>
          <p style="color: #666; line-height: 1.6;">
            This OTP will expire in 10 minutes. If you did not create an account with Dental Kart Nepal, please ignore this email.
          </p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} Dental Kart Nepal. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    const response = await brevoApi.post('/smtp/email', emailData);
    console.log('OTP email sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending OTP email:', error.response?.data || error.message);
    throw error;
  }
};

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${getClientUrl()}/reset-password?token=${resetToken}`;

  const emailData = {
    sender: {
      name: process.env.EMAIL_FROM_NAME || 'Dental Kart Nepal',
      email: process.env.EMAIL_FROM
    },
    to: [{ email: email }],
    subject: 'Password Reset Request - Dental Kart Nepal',
    htmlContent: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #f97316;">Dental Kart Nepal Password Reset</h1>
        </div>
        <div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
          <p style="color: #666; line-height: 1.6;">
            You are receiving this email because you (or someone else) has requested to reset your password. Click the button below to create a new password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; line-height: 1.6;">
            This password reset link will expire in 10 minutes. If you did not request a password reset, please ignore this email and your password will remain unchanged.
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
            <p>If you're having trouble clicking the button, copy and paste this URL into your web browser:</p>
            <p style="word-break: break-all;">${resetUrl}</p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} Dental Kart Nepal. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    const response = await brevoApi.post('/smtp/email', emailData);
    console.log('Password reset email sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending password reset email:', error.response?.data || error.message);
    throw error;
  }
};

const sendVendorPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${getClientUrl()}/vendor/reset-password?token=${resetToken}`;

  const emailData = {
    sender: {
      name: process.env.EMAIL_FROM_NAME || 'Dental Kart Nepal',
      email: process.env.EMAIL_FROM
    },
    to: [{ email: email }],
    subject: 'Vendor Password Reset Request - Dental Kart Nepal',
    htmlContent: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #f97316;">Vendor Password Reset</h1>
        </div>
        <div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Reset Your Vendor Password</h2>
          <p style="color: #666; line-height: 1.6;">
            Click the button below to create a new password for your vendor account:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #f97316; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; line-height: 1.6;">
            This link will expire in 10 minutes. If you did not request this, you can safely ignore this email.
          </p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 12px;">
            <p>If you're having trouble clicking the button, copy and paste this URL into your web browser:</p>
            <p style="word-break: break-all;">${resetUrl}</p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} Dental Kart Nepal. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    const response = await brevoApi.post('/smtp/email', emailData);
    console.log('Vendor password reset email sent successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending vendor password reset email:', error.response?.data || error.message);
    throw error;
  }
};

const sendOrderNotificationToAdmins = async (order, adminEmails) => {
  // Format order items for email display
  const formatOrderItems = (items) => {
    return items.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; text-align: left;">${item.product.name}</td>
        <td style="padding: 10px; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; text-align: right;">Rs. ${item.price.toFixed(2)}</td>
        <td style="padding: 10px; text-align: right;">Rs. ${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');
  };

  const emailData = {
    sender: {
      name: process.env.EMAIL_FROM_NAME || 'Dental Kart Nepal',
      email: process.env.EMAIL_FROM
    },
    to: adminEmails.map(email => ({ email })),
    subject: `New Order Received - ${order.orderNumber}`,
    htmlContent: `
      <div style="max-width: 700px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #f97316;">New Order Alert - Dental Kart Nepal</h1>
        </div>
        
        <div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Order Details</h2>
          
          <div style="background: #f8f8f8; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod === 'pay-now' ? 'Online Payment' : 'Cash on Delivery'}</p>
            <p style="margin: 5px 0;"><strong>Payment Status:</strong> ${order.paymentStatus}</p>
            <p style="margin: 5px 0;"><strong>Order Status:</strong> ${order.orderStatus}</p>
          </div>

          <h3 style="color: #333; margin-bottom: 15px;">Customer Information</h3>
          <div style="background: #f0f7ff; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>Name:</strong> ${order.shippingDetails.fullName}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${order.shippingDetails.email}</p>
            <p style="margin: 5px 0;"><strong>Phone:</strong> ${order.shippingDetails.phone}</p>
            <p style="margin: 5px 0;"><strong>Address:</strong> ${order.shippingDetails.address}</p>
            <p style="margin: 5px 0;"><strong>City:</strong> ${order.shippingDetails.city}</p>
            <p style="margin: 5px 0;"><strong>Province:</strong> ${order.shippingDetails.province}</p>
            ${order.shippingDetails.clinicName ? `<p style="margin: 5px 0;"><strong>Clinic Name:</strong> ${order.shippingDetails.clinicName}</p>` : ''}
          </div>

          <h3 style="color: #333; margin-bottom: 15px;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background: #f97316; color: white;">
                <th style="padding: 10px; text-align: left;">Product</th>
                <th style="padding: 10px; text-align: center;">Quantity</th>
                <th style="padding: 10px; text-align: right;">Unit Price</th>
                <th style="padding: 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${formatOrderItems(order.items)}
            </tbody>
          </table>

          <div style="background: #f8f8f8; padding: 15px; border-radius: 5px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>Subtotal:</span>
              <span>Rs. ${order.subtotal.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <span>Shipping:</span>
              <span>Rs. ${order.shipping.toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; border-top: 2px solid #f97316; padding-top: 10px; margin-top: 10px;">
              <span>Total:</span>
              <span style="color: #f97316;">Rs. ${order.total.toFixed(2)}</span>
            </div>
          </div>

          ${order.shippingDetails.orderNote ? `
            <div style="margin-top: 20px;">
              <h3 style="color: #333; margin-bottom: 10px;">Order Note</h3>
              <p style="background: #fff3cd; padding: 10px; border-radius: 5px; border-left: 4px solid #ffc107;">${order.shippingDetails.orderNote}</p>
            </div>
          ` : ''}

          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666;">Please review and process this order in the admin panel.</p>
            <a href="${getClientUrl()}/admin/orders/${order._id}" 
               style="background: #f97316; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-top: 10px;">
              View Order in Admin Panel
            </a>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
          <p>&copy; ${new Date().getFullYear()} Dental Kart Nepal. All rights reserved.</p>
        </div>
      </div>
    `
  };

  try {
    const response = await brevoApi.post('/smtp/email', emailData);
    console.log('Order notification email sent to admins successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending order notification email to admins:', error.response?.data || error.message);
    throw error;
  }
};

const sendOrderConfirmationToCustomer = async (order, userEmail) => {
  // Helper function to safely get product data
  const getProductData = (item) => {
    if (!item || !item.product) return null;
    
    // If product is populated (has name property)
    if (typeof item.product === 'object' && item.product.name) {
      return item.product;
    }
    
    // If product is just an ID, we need to fetch it
    // For now, return a fallback object
    return {
      name: 'Product',
      images: []
    };
  };

  // Helper function to safely format attributes
  const formatAttributes = (attributes) => {
    if (!attributes || typeof attributes !== 'object') return '';
    
    // Handle both regular objects and Map objects
    const attributeEntries = attributes instanceof Map 
      ? Array.from(attributes.entries())
      : Object.entries(attributes);

    if (attributeEntries.length === 0) return '';

    return attributeEntries.map(([key, value]) => 
      `<div style="font-size: 11px; color: #6b7280; margin-bottom: 2px;">
        <span style="font-weight: 500;">${key}:</span> ${value}
      </div>`
    ).join('');
  };

  // Format order items for email display
  const formatOrderItems = (items) => {
    return items.map(item => {
      const product = getProductData(item);
      const attributes = formatAttributes(item.attributes);
      
      return `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px; text-align: left;">
            <div style="display: flex; align-items: flex-start;">
              <div style="width: 50px; height: 50px; background-color: #f3f4f6; border-radius: 4px; overflow: hidden; margin-right: 12px; flex-shrink: 0;">
                ${product && product.images && product.images.length > 0 ? 
                  `<img src="${getClientUrl()}${product.images[0]}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none';" />` :
                  `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #9ca3af;">
                    <span style="font-size: 12px;">No Image</span>
                  </div>`
                }
              </div>
              <div style="flex: 1; min-width: 0;">
                <div style="font-weight: 500; color: #374151; margin-bottom: 4px; font-size: 13px; line-height: 1.4;">
                  ${product ? product.name : 'Product'}
                </div>
                ${attributes}
              </div>
            </div>
          </td>
          <td style="padding: 12px; text-align: center;">Rs. ${item.price ? item.price.toLocaleString() : '0'}</td>
          <td style="padding: 12px; text-align: center;">${item.quantity || 0}</td>
          <td style="padding: 12px; text-align: right;">Rs. ${((item.price || 0) * (item.quantity || 0)).toLocaleString()}</td>
        </tr>
      `;
    }).join('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const emailData = {
    sender: {
      name: process.env.EMAIL_FROM_NAME || 'Dental Kart Nepal',
      email: process.env.EMAIL_FROM
    },
    to: [{ email: userEmail }],
    subject: `Order Confirmation - ${order.orderNumber} - Dental Kart Nepal`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - ${order.orderNumber}</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f5f5f5;
            line-height: 1.6;
          }
          .email-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
            color: #333;
          }
          .email-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 20px;
          }
          .email-title {
            font-size: 28px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 8px;
          }
          .email-subtitle {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 10px;
          }
          .email-section {
            margin-bottom: 25px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          .email-section-header {
            background: #f9fafb;
            padding: 15px 20px;
            border-bottom: 1px solid #e5e7eb;
            font-weight: 600;
            color: #374151;
            font-size: 16px;
          }
          .email-section-content {
            padding: 20px;
          }
          .email-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
          }
          .email-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 15px;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          }
          .email-card-header {
            font-weight: 600;
            color: #374151;
            margin-bottom: 10px;
            font-size: 14px;
          }
          .email-info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 13px;
            align-items: center;
          }
          .email-info-label {
            color: #6b7280;
            flex-shrink: 0;
          }
          .email-info-value {
            font-weight: 500;
            color: #374151;
            text-align: right;
            word-break: break-word;
          }
          .email-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 13px;
          }
          .email-table th, .email-table td {
            border: 1px solid #e5e7eb;
            padding: 12px;
            text-align: left;
            vertical-align: top;
          }
          .email-table th {
            background: #f9fafb;
            font-weight: 600;
            color: #374151;
            font-size: 12px;
          }
          .email-table tbody tr:nth-child(even) {
            background: #f9fafb;
          }
          .email-table tbody tr:hover {
            background: #f3f4f6;
          }
          .email-total-row {
            background: #f9fafb;
            font-weight: 600;
          }
          .email-total-final {
            background: #e5e7eb;
            font-weight: 700;
            font-size: 16px;
          }
          .email-footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          .email-status-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: capitalize;
          }
          .email-status-pending {
            background: #fef3c7;
            color: #92400e;
          }
          .email-status-processing {
            background: #dbeafe;
            color: #1e40af;
          }
          .email-status-shipped {
            background: #d1fae5;
            color: #065f46;
          }
          .email-status-delivered {
            background: #dcfce7;
            color: #166534;
          }
          .email-status-cancelled {
            background: #fee2e2;
            color: #991b1b;
          }
          .email-payment-status {
            background: #f3f4f6;
            color: #374151;
          }
          @media only screen and (max-width: 600px) {
            .email-grid {
              grid-template-columns: 1fr;
              gap: 15px;
            }
            .email-table {
              font-size: 12px;
            }
            .email-table th, .email-table td {
              padding: 8px;
            }
            .email-title {
              font-size: 24px;
            }
            .email-subtitle {
              font-size: 14px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          
          <!-- Invoice Header -->
          <div class="email-header">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; flex-wrap: wrap; gap: 20px;">
              <!-- Left side - Logo and Company Info -->
              <div style="display: flex; align-items: center; flex: 1; min-width: 200px;">
                <img 
                  src="${getClientUrl()}/uploads/logo-orange.png" 
                  alt="Dental Kart Logo" 
                  style="height: 50px; width: 50px; margin-right: 15px; object-fit: contain;"
                  onerror="this.style.display='none';"
                />
                <div style="text-align: left;">
                  <div style="font-size: 28px; font-weight: bold; color: #1f2937; margin-bottom: 4px;">
                    Dental Kart
                  </div>
                  <div style="font-size: 14px; color: #f97316; font-weight: 600;">
                    Nepal
                  </div>
                </div>
              </div>
              
              <!-- Right side - Order Invoice Details -->
              <div style="text-align: right; flex: 1; min-width: 200px;">
                <div class="email-title">Order Invoice</div>
                <div class="email-subtitle">Order #${order.orderNumber}</div>
                <div class="email-subtitle">Placed on ${formatDate(order.createdAt)}</div>
              </div>
            </div>
          </div>

          <!-- Customer Information -->
          <div class="email-section">
            <div class="email-section-header">Customer Information</div>
            <div class="email-section-content">
              <div class="email-grid">
                <div class="email-card">
                  <div class="email-card-header">Personal Details</div>
                  <div class="email-info-row">
                    <span class="email-info-label">Name:</span>
                    <span class="email-info-value">${order.shippingDetails?.fullName || 'N/A'}</span>
                  </div>
                  <div class="email-info-row">
                    <span class="email-info-label">Email:</span>
                    <span class="email-info-value">${order.shippingDetails?.email || 'N/A'}</span>
                  </div>
                  <div class="email-info-row">
                    <span class="email-info-label">Phone:</span>
                    <span class="email-info-value">${order.shippingDetails?.phone || 'N/A'}</span>
                  </div>
                  ${order.shippingDetails?.clinicName ? `
                    <div class="email-info-row">
                      <span class="email-info-label">Clinic:</span>
                      <span class="email-info-value">${order.shippingDetails.clinicName}</span>
                    </div>
                  ` : ''}
                </div>
                
                <div class="email-card">
                  <div class="email-card-header">Shipping Address</div>
                  <div class="email-info-row">
                    <span class="email-info-label">Address:</span>
                    <span class="email-info-value">${order.shippingDetails?.address || 'N/A'}</span>
                  </div>
                  <div class="email-info-row">
                    <span class="email-info-label">City:</span>
                    <span class="email-info-value">${order.shippingDetails?.city || 'N/A'}</span>
                  </div>
                  <div class="email-info-row">
                    <span class="email-info-label">Province:</span>
                    <span class="email-info-value">${order.shippingDetails?.province || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div class="email-section">
            <div class="email-section-header">Order Items</div>
            <div class="email-section-content">
              <table class="email-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th style="text-align: center;">Unit Price</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${formatOrderItems(order.items)}
                </tbody>
                <tfoot>
                  <tr class="email-total-row">
                    <td colspan="3" style="text-align: right; font-weight: 600;">Subtotal:</td>
                    <td style="text-align: right; font-weight: 600;">Rs. ${order.subtotal ? order.subtotal.toLocaleString() : '0'}</td>
                  </tr>
                  <tr class="email-total-row">
                    <td colspan="3" style="text-align: right; font-weight: 600;">Shipping:</td>
                    <td style="text-align: right; font-weight: 600;">Rs. ${order.shipping ? order.shipping.toLocaleString() : '0'}</td>
                  </tr>
                  <tr class="email-total-final">
                    <td colspan="3" style="text-align: right; font-weight: 700;">Total:</td>
                    <td style="text-align: right; font-weight: 700;">Rs. ${order.total ? order.total.toLocaleString() : '0'}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <!-- Order Status and Payment Info -->
          <div class="email-section">
            <div class="email-section-header">Order Status & Payment</div>
            <div class="email-section-content">
              <div class="email-grid">
                <div class="email-card">
                  <div class="email-card-header">Order Status</div>
                  <div class="email-info-row">
                    <span class="email-info-label">Status:</span>
                    <span class="email-info-value">
                      <span class="email-status-badge email-status-${order.orderStatus || 'pending'}">
                        ${order.orderStatus || 'pending'}
                      </span>
                    </span>
                  </div>
                  <div class="email-info-row">
                    <span class="email-info-label">Payment Method:</span>
                    <span class="email-info-value">
                      ${order.paymentMethod === 'pay-now' ? 'Online Payment' : 'Cash on Delivery'}
                    </span>
                  </div>
                  <div class="email-info-row">
                    <span class="email-info-label">Payment Status:</span>
                    <span class="email-info-value">
                      <span class="email-status-badge email-payment-status">
                        ${order.paymentStatus || 'pending'}
                      </span>
                    </span>
                  </div>
                </div>
                
                <div class="email-card">
                  <div class="email-card-header">Next Steps</div>
                  <div style="font-size: 13px; color: #6b7280; line-height: 1.5;">
                    ${order.paymentMethod === 'pay-now' ? 
                      'We will process your payment and update you on the order status. You will receive notifications as your order progresses.' :
                      'You will pay when your order is delivered. We will contact you to confirm delivery details and arrange payment.'
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="email-footer">
            <p>Thank you for your order!</p>
            <p>For any questions, please contact our customer support.</p>
            <p style="margin-top: 15px;">
              <a href="${getClientUrl()}/account/orders" 
                 style="background: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                View Order Details
              </a>
            </p>
            <p style="margin-top: 15px; font-size: 11px; color: #9ca3af;">
              Order #${order.orderNumber} • Placed on ${formatDate(order.createdAt)}
            </p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const response = await brevoApi.post('/smtp/email', emailData);
    console.log('Order confirmation email sent to customer successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error sending order confirmation email to customer:', error.response?.data || error.message);
    throw error;
  }
};

// Send order notification to vendors
const sendOrderNotificationToVendors = async (order, vendorProducts) => {
  // Group products by vendor
  const vendorGroups = {};
  
  vendorProducts.forEach(item => {
    const vendorId = item.product.vendor?._id || item.product.vendor;
    if (vendorId) {
      if (!vendorGroups[vendorId]) {
        vendorGroups[vendorId] = {
          vendor: item.product.vendor,
          products: [],
          totalValue: 0
        };
      }
      vendorGroups[vendorId].products.push(item);
      vendorGroups[vendorId].totalValue += item.price * item.quantity;
    }
  });

  // Send email to each vendor
  for (const [vendorId, vendorData] of Object.entries(vendorGroups)) {
    const vendor = vendorData.vendor;
    const products = vendorData.products;
    const totalValue = vendorData.totalValue;

    // Format vendor's products for email display
    const formatVendorProducts = (items) => {
      return items.map(item => {
        const product = item.product;
        const attributes = item.attributes && Object.keys(item.attributes).length > 0 
          ? Object.entries(item.attributes).map(([key, value]) => 
              `<div style="font-size: 11px; color: #6b7280; margin-bottom: 2px;">
                <span style="font-weight: 500;">${key}:</span> ${value}
              </div>`
            ).join('')
          : '';

        return `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px; text-align: left;">
              <div style="font-weight: 500; color: #374151; margin-bottom: 4px; font-size: 13px; line-height: 1.4;">
                ${product ? product.name : 'Product'}
              </div>
              ${attributes}
            </td>
            <td style="padding: 12px; text-align: center;">Rs. ${item.price ? item.price.toLocaleString() : '0'}</td>
            <td style="padding: 12px; text-align: center;">${item.quantity || 0}</td>
            <td style="padding: 12px; text-align: right;">Rs. ${((item.price || 0) * (item.quantity || 0)).toLocaleString()}</td>
          </tr>
        `;
      }).join('');
    };

    const emailData = {
      sender: {
        name: process.env.EMAIL_FROM_NAME || 'Dental Kart Nepal',
        email: process.env.EMAIL_FROM
      },
      to: [{ email: vendor.email }],
      subject: `New Order - ${order.orderNumber} - Your Products`,
      htmlContent: `
        <div style="max-width: 700px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #f97316;">New Order Alert - Dental Kart Nepal</h1>
          </div>
          
          <div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px;">Order Details</h2>
            
            <div style="background: #f8f8f8; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p style="margin: 5px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</p>
            </div>

            <h3 style="color: #333; margin-bottom: 15px;">Customer Address</h3>
            <div style="background: #f0f7ff; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <p style="margin: 5px 0;"><strong>Address:</strong> ${order.shippingDetails.address}</p>
              <p style="margin: 5px 0;"><strong>City:</strong> ${order.shippingDetails.city}</p>
              <p style="margin: 5px 0;"><strong>Province:</strong> ${order.shippingDetails.province}</p>
              ${order.shippingDetails.clinicName ? `<p style="margin: 5px 0;"><strong>Clinic Name:</strong> ${order.shippingDetails.clinicName}</p>` : ''}
            </div>

            <h3 style="color: #333; margin-bottom: 15px;">Your Products in This Order</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background: #f97316; color: white;">
                  <th style="padding: 10px; text-align: left;">Product</th>
                  <th style="padding: 10px; text-align: center;">Quantity</th>
                  <th style="padding: 10px; text-align: right;">Unit Price</th>
                  <th style="padding: 10px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${formatVendorProducts(products)}
              </tbody>
            </table>

            <div style="background: #f8f8f8; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; border-top: 2px solid #f97316; padding-top: 10px; margin-top: 10px;">
                <span>Your Products Total:</span>
                <span style="color: #f97316;">Rs. ${totalValue.toFixed(2)}</span>
              </div>
            </div>

            ${order.shippingDetails.orderNote ? `
              <div style="margin-top: 20px;">
                <h3 style="color: #333; margin-bottom: 10px;">Order Note</h3>
                <p style="background: #fff3cd; padding: 10px; border-radius: 5px; border-left: 4px solid #ffc107;">${order.shippingDetails.orderNote}</p>
              </div>
            ` : ''}

            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666; margin-bottom: 15px;">Please process and ship your products for this order.</p>
              <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
                <a href="${getClientUrl()}/vendor/orders/${order._id}" 
                   style="background: #f97316; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  View Order Details
                </a>
                <a href="${getClientUrl()}/vendor/orders/${order._id}?action=mark-shipped" 
                   style="background: #10b981; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                  Mark as Shipped
                </a>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #888; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} Dental Kart Nepal. All rights reserved.</p>
          </div>
        </div>
      `
    };

    try {
      const response = await brevoApi.post('/smtp/email', emailData);
      console.log(`Order notification email sent to vendor ${vendor.name} (${vendor.email}) successfully:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error sending order notification email to vendor ${vendor.name} (${vendor.email}):`, error.response?.data || error.message);
      throw error;
    }
  }
};

module.exports = {
  sendEmail,
  sendVerificationOTP,
  sendPasswordResetEmail,
  sendVendorPasswordResetEmail,
  sendOrderNotificationToAdmins,
  sendOrderConfirmationToCustomer,
  sendOrderNotificationToVendors
};