const express = require('express');
const router = express.Router();
const { 
  getHomepageSettings,
  updateHomepageSettings,
  getSeoSettings,
  updateSeoSettings,
  getContactSettings,
  updateContactSettings
} = require('../controllers/settings.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Protect and authorize all routes
router.use(protect);
router.use(authorize('admin'));

// Homepage settings
router.route('/homepage')
  .get(getHomepageSettings)
  .post(updateHomepageSettings);

// SEO settings
router.route('/seo')
  .get(getSeoSettings)
  .post(updateSeoSettings);

// Contact settings
router.route('/contact')
  .get(getContactSettings)
  .post(updateContactSettings);

module.exports = router;