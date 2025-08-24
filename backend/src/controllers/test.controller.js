const { sendOrderConfirmationToCustomer } = require('../services/email.service');

// Simplified wishlist controller
exports.testFunction = (req, res) => {
  res.json({ message: 'Test function working' });
};

// Test order confirmation email
exports.testOrderConfirmationEmail = async (req, res) => {
  try {
    // Mock order data for testing
    const mockOrder = {
      orderNumber: 'MB20241201123456',
      createdAt: new Date().toISOString(),
      orderStatus: 'pending',
      paymentStatus: 'pending',
      paymentMethod: 'cash-on-delivery',
      subtotal: 2500,
      shipping: 100,
      total: 2600,
      shippingDetails: {
        fullName: 'Dr. John Doe',
        email: req.body.testEmail || 'test@example.com',
        phone: '+977-9841234567',
        address: '123 Medical Street',
        city: 'Kathmandu',
        province: 'Bagmati',
        clinicName: 'City Medical Center'
      },
      items: [
        {
          product: {
            name: 'Dental Handpiece',
            images: ['/uploads/test-product-1.jpg']
          },
          quantity: 2,
          price: 1200,
          attributes: {
            'Brand': 'Dentsply',
            'Type': 'High Speed'
          }
        },
        {
          product: {
            name: 'Surgical Mask',
            images: ['/uploads/test-product-2.jpg']
          },
          quantity: 5,
          price: 20,
          attributes: {
            'Size': 'Medium',
            'Material': '3-Ply'
          }
        }
      ]
    };

    await sendOrderConfirmationToCustomer(mockOrder, mockOrder.shippingDetails.email);
    
    res.json({ 
      success: true, 
      message: 'Test order confirmation email sent successfully',
      orderNumber: mockOrder.orderNumber
    });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send test email',
      error: error.message 
    });
  }
};
