const express = require('express');
const router = express.Router();
const { 
  createAttribute, 
  getAttributes, 
  getAttribute, 
  updateAttribute, 
  deleteAttribute 
} = require('../controllers/attribute.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Protect and authorize all routes
router.use(protect);
router.use(authorize('admin'));

// Routes
router.route('/')
  .get(getAttributes)
  .post(createAttribute);

router.route('/:id')
  .get(getAttribute)
  .put(updateAttribute)
  .delete(deleteAttribute);

module.exports = router;