const express = require('express');
const { searchAll } = require('../controllers/search.controller');

const router = express.Router();

/**
 * @route GET /api/search
 * @description Search across products, brands, and categories
 * @access Public
 */
router.get('/', searchAll);

module.exports = router;
