const express = require('express');
const router = express.Router();
const { 
  getPublicHomepageSettings,
  getPublicSeoSettings,
  getPublicContactSettings,
} = require('../controllers/settings.controller');

// Public routes
router.route('/homepage')
  .get(getPublicHomepageSettings);

// Public SEO settings
router.route('/seo')
  .get(getPublicSeoSettings);

// Public contact settings
router.route('/contact')
  .get(getPublicContactSettings);

module.exports = router;