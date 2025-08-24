const express = require('express');
const { getUsers, updateUserStatus } = require('../controllers/users.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(getUsers);

router.route('/:id/status')
  .put(updateUserStatus);

module.exports = router;