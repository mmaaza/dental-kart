const express = require('express');
const router = express.Router();
const { testFunction, testOrderConfirmationEmail } = require('../controllers/test.controller');

// Test basic functionality
router.get('/test', testFunction);

// Test order confirmation email
router.post('/test-order-email', testOrderConfirmationEmail);

module.exports = router;
